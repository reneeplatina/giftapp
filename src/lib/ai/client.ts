import "server-only";

import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = "claude-haiku-4-5";

let cachedClient: Anthropic | null = null;

/**
 * Returns a singleton server-side Anthropic client, or null if
 * ANTHROPIC_API_KEY isn't configured. Every caller must handle the null
 * case by falling back gracefully (per docs/AI_SAFETY.md — the app must
 * stay fully usable without the AI service). Never call this from a
 * "use client" component; the "server-only" import above throws a build
 * error if that's attempted.
 */
export function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey });
  }
  return cachedClient;
}

/** ANTHROPIC_MODEL from env (docs/AI_SAFETY.md), with a safe default. */
export function getAnthropicModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
}
