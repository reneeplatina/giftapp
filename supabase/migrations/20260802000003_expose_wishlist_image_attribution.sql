-- Surface the new image attribution columns through get_public_profile()
-- so visitor pages can render the required Unsplash photo credit. Based on
-- the most recent redefinition (20260726000002_profile_images.sql), which
-- also added the 'images' field — carried forward here unchanged.

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
          'imageAttributionName', w.image_attribution_name,
          'imageAttributionUrl', w.image_attribution_url,
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
    ), '[]'::jsonb),
    'images', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', i.id,
          'imagePath', i.image_path,
          'caption', i.caption
        )
        order by i.sort_order, i.created_at
      )
      from public.profile_images i
      where i.profile_id = v_profile.id
        and i.is_public
    ), '[]'::jsonb),
    'managedProfiles', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'slug', m.slug,
          'displayName', m.display_name,
          'avatarPath', m.avatar_path
        )
        order by m.created_at
      )
      from public.profiles m
      where m.managed_by_profile_id = v_profile.id
        and m.status = 'published'
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;
