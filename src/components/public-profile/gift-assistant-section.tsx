"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  sendGiftAssistantMessageAction,
  sendGiftAssistantPreviewMessageAction,
} from "@/lib/gift-assistant/actions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function greeting(displayName: string): string {
  return `Tell me a bit about the occasion, and I'll suggest gift ideas for ${displayName} based on their profile.`;
}

export function GiftAssistantSection({
  slug,
  displayName,
  isPreview = false,
}: {
  slug: string;
  displayName: string;
  isPreview?: boolean;
}) {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: greeting(displayName) },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!started) return;
    latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [started, messages.length]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || pending) return;

    // Only real exchanged turns go to the model — not the static, un-generated greeting above.
    const history = messages.slice(1);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setPending(true);
    setError(null);

    const result = isPreview
      ? await sendGiftAssistantPreviewMessageAction(history, trimmed)
      : await sendGiftAssistantMessageAction(slug, history, trimmed);
    setPending(false);
    if (!result.success || !result.reply) {
      setError(result.error ?? "Couldn't reach the AI assistant.");
      return;
    }
    setMessages((prev) => [...prev, { role: "assistant", content: result.reply! }]);
  }

  if (!started) {
    return (
      <Card className="flex flex-col items-center gap-3 p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <Sparkles className="h-6 w-6 text-neutral-700" aria-hidden="true" />
        </span>
        <p className="font-display text-lg font-semibold text-neutral-900">
          Want help from AI to find the perfect gift for {displayName}?
        </p>
        <Button type="button" onClick={() => setStarted(true)}>
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Yes, help me choose
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-neutral-900">
            AI gift ideas
          </p>
          <p className="text-xs text-neutral-500">
            {isPreview
              ? "This is a live preview of what visitors will see. Nothing here is added to your profile."
              : `Nothing here is added to ${displayName}'s profile.`}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setStarted(false)}
        >
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
          Hide
        </Button>
      </div>

      <div
        className="flex flex-col gap-3"
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            ref={index === messages.length - 1 ? latestMessageRef : undefined}
            className={message.role === "assistant" ? "flex scroll-mt-4 justify-start" : "flex justify-end"}
          >
            <div
              className={
                message.role === "assistant"
                  ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900"
                  : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-neutral-900 px-4 py-2.5 text-sm text-white"
              }
            >
              {message.content}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-500" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-end gap-2">
        <label htmlFor="gift-assistant-input" className="sr-only">
          Your message
        </label>
        <textarea
          id="gift-assistant-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder="Ask about gift ideas…"
          className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleSend}
          disabled={pending || !input.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
