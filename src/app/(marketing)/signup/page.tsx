import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "./signup-form";

interface ExchangeInfo {
  valid: boolean;
  status: string;
  sourceDisplayName: string | null;
  sourceSlug: string | null;
}

async function resolveExchange(token: string | undefined) {
  if (!token) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("resolve_exchange_token", {
      token,
    });

    if (error || !data) return null;

    const result = data as {
      valid: boolean;
      status?: string;
      sourceDisplayName?: string;
      sourceSlug?: string;
    };

    return {
      valid: result.valid,
      status: result.status ?? "unknown",
      sourceDisplayName: result.sourceDisplayName ?? null,
      sourceSlug: result.sourceSlug ?? null,
    } satisfies ExchangeInfo;
  } catch {
    // A network failure here shouldn't block signup — just proceed
    // without exchange context, same as an invalid/unknown token.
    return null;
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ exchange?: string; error?: string }>;
}) {
  const { exchange, error } = await searchParams;
  const exchangeInfo = await resolveExchange(exchange);

  return (
    <SignupForm
      exchangeToken={exchange}
      exchangeInfo={exchangeInfo}
      linkError={error}
    />
  );
}
