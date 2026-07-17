-- Public-facing read/write surface for anonymous + authenticated visitors.
--
-- Every table in this schema is locked down to its owner (see previous
-- migrations) with no anon grants at all. The only way anyone else ever
-- reads or touches profile data is through the narrow, curated functions
-- below. Each is SECURITY DEFINER (runs with the function owner's
-- privileges, bypassing RLS internally) specifically so it can assemble
-- a safe, minimal response — never a raw table row.

-- Lets policies elsewhere (namely the storage.objects policies in a
-- later migration) check "is this profile published?" without needing
-- any direct GRANT on public.profiles for anon/authenticated — keeping
-- the "anon has zero direct table access" guarantee intact even for
-- checks that originate outside this file.
create or replace function public.is_profile_published(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = p_profile_id
       and status = 'published'
  );
$$;

revoke all on function public.is_profile_published(uuid) from public;
grant execute on function public.is_profile_published(uuid) to anon, authenticated;

-- Returns a published profile's public-facing content as a single jsonb
-- object, or null if the slug doesn't exist or isn't published (draft
-- and hidden profiles are indistinguishable from "doesn't exist" to a
-- visitor). Never includes profiles.id (the owner's auth user id) or any
-- other private/internal column.
create or replace function public.get_public_profile(profile_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_result jsonb;
begin
  select p.* into v_profile
    from public.profiles p
   where p.slug = lower(profile_slug)
     and p.status = 'published';

  if not found then
    return null;
  end if;

  select jsonb_build_object(
    'slug', v_profile.slug,
    'displayName', v_profile.display_name,
    'avatarPath', v_profile.avatar_path,
    'introduction', v_profile.introduction,
    'giftStyleSummary', v_profile.gift_style_summary,
    'theme', v_profile.default_theme,
    'sections', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'sectionKey', s.section_key,
          'data', s.data
        )
        order by s.sort_order
      )
      from public.profile_sections s
      where s.profile_id = v_profile.id
        and s.is_public
    ), '[]'::jsonb),
    'wishlistItems', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', w.id,
          'name', w.name,
          'description', w.description,
          'imagePath', w.image_path,
          'productUrl', w.product_url,
          'estimatedPrice', w.estimated_price,
          'budgetLevel', w.budget_level,
          'category', w.category,
          'priority', w.priority,
          'preferredColor', w.preferred_color,
          'preferredSize', w.preferred_size,
          'acceptableAlternatives', w.acceptable_alternatives,
          'acceptsUsed', w.accepts_used,
          'acceptsRefurbished', w.accepts_refurbished,
          'acceptsContributions', w.accepts_contributions,
          'itemType', w.item_type
        )
        order by w.sort_order
      )
      from public.wishlist_items w
      where w.profile_id = v_profile.id
        and w.is_public
        and not w.is_archived
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;

-- Resolves an exchange token to just enough information for a landing
-- page to greet the visitor and know whether the link still works.
-- Never returns source_profile_id, referred_user_id, or any other
-- account identifier.
create or replace function public.resolve_exchange_token(token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_row record;
begin
  select r.status, p.display_name, p.slug
    into v_row
    from public.gift_exchange_requests r
    join public.profiles p on p.id = r.source_profile_id
   where r.exchange_token = token;

  if not found then
    return jsonb_build_object('valid', false);
  end if;

  return jsonb_build_object(
    'valid', v_row.status in ('created', 'started'),
    'status', v_row.status,
    'sourceDisplayName', v_row.display_name,
    'sourceSlug', v_row.slug
  );
end;
$$;

revoke all on function public.resolve_exchange_token(text) from public;
grant execute on function public.resolve_exchange_token(text) to anon, authenticated;

-- Lets a signed-in visitor claim an exchange request by presenting its
-- token. This is deliberately a function rather than a table-level RLS
-- UPDATE policy: a policy permissive enough to let "the referred user"
-- claim an unclaimed row would, in practice, have to allow any
-- authenticated caller to update any row where referred_user_id is
-- null — which would let someone mass-claim every open exchange request
-- in the table, not just the one they were sent. A SECURITY DEFINER
-- function keeps the authorization check (auth.uid() + the exact token)
-- entirely server-side, using the caller's real auth.uid() rather than
-- a client-supplied one.
create or replace function public.claim_exchange_request(token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_request public.gift_exchange_requests%rowtype;
begin
  if v_uid is null then
    raise exception 'Must be signed in to claim an exchange request';
  end if;

  select * into v_request
    from public.gift_exchange_requests
   where exchange_token = token
   for update;

  if not found then
    return jsonb_build_object('claimed', false, 'reason', 'not_found');
  end if;

  if v_request.status not in ('created', 'started') then
    return jsonb_build_object('claimed', false, 'reason', 'not_available');
  end if;

  if v_request.referred_user_id is not null and v_request.referred_user_id <> v_uid then
    return jsonb_build_object('claimed', false, 'reason', 'already_claimed');
  end if;

  update public.gift_exchange_requests
     set referred_user_id = v_uid,
         status = 'started',
         started_at = coalesce(started_at, now())
   where id = v_request.id;

  return jsonb_build_object('claimed', true);
end;
$$;

revoke all on function public.claim_exchange_request(text) from public;
grant execute on function public.claim_exchange_request(text) to authenticated;

-- Marks a claimed request completed once the referred user has created
-- and published their own profile. Only the caller who already claimed
-- the request (referred_user_id = auth.uid()) may complete it.
create or replace function public.complete_exchange_request(token text, referred_profile_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_request public.gift_exchange_requests%rowtype;
  v_referred_profile_id uuid;
begin
  if v_uid is null then
    raise exception 'Must be signed in to complete an exchange request';
  end if;

  select * into v_request
    from public.gift_exchange_requests
   where exchange_token = token
   for update;

  if not found or v_request.referred_user_id is distinct from v_uid then
    return jsonb_build_object('completed', false, 'reason', 'not_found');
  end if;

  select id into v_referred_profile_id
    from public.profiles
   where id = v_uid
     and slug = lower(referred_profile_slug);

  if v_referred_profile_id is null then
    return jsonb_build_object('completed', false, 'reason', 'profile_not_found');
  end if;

  update public.gift_exchange_requests
     set status = 'completed',
         referred_profile_id = v_referred_profile_id,
         completed_at = now()
   where id = v_request.id;

  return jsonb_build_object('completed', true);
end;
$$;

revoke all on function public.complete_exchange_request(text, text) from public;
grant execute on function public.complete_exchange_request(text, text) to authenticated;
