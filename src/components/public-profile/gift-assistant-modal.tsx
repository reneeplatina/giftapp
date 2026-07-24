"use client";

import { useState } from "react";
import { Loader2, MessageCircleQuestion, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  sendGiftAssistantMessageAction,
  sendGiftAssistantPreviewMessageAction,
} from "@/lib/gift-assistant/actions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function GiftAssistantModal({
  slug,
  displayName,
  isPreview = false,
}: {
  slug: string;
  displayName: string;
  isPreview?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! Tell me a bit about who you're shopping for the occasion, or ask me anything, and I'll suggest gift ideas for ${displayName} based on their profile.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
        Help Me Choose a Gift
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Gift ideas"
        description={
          isPreview
            ? `This is a live preview of the assistant visitors will see. Nothing here is added to your profile.`
            : `Chat about what ${displayName} might like — nothing here is added to their profile.`
        }
        className="flex max-h-[85vh] flex-col"
      >
        <div
          className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1"
          style={{ maxHeight: "50vh" }}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={message.role === "assistant" ? "flex justify-start" : "flex justify-end"}
            >
              <div
                className={
                  message.role === "assistant"
                    ? "max-w-[85%] rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900"
                    : "max-w-[85%] rounded-2xl rounded-tr-sm bg-neutral-900 px-4 py-2.5 text-sm text-white"
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
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-3 flex items-end gap-2">
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
      </Modal>
    </>
  );
}
