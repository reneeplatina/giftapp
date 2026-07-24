"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Gift,
  Loader2,
  MessageCircleQuestion,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BUDGET_LABELS, CATEGORY_OPTIONS } from "@/lib/mock/profile";
import { SECTION_LABELS, type SectionTsKey } from "@/lib/profile/section-keys";
import { useProfile } from "@/context/profile-context";
import {
  approveAllExtractedFieldsAction,
  approveGiftStyleSummaryAction,
  dismissAllExtractedFieldsAction,
  finishWithoutSummaryAction,
  generateGiftStyleSummaryAction,
  goBackInterviewAction,
  resolveGiftSuggestionAction,
  restartInterviewAction,
  sendInterviewAnswerAction,
  skipInterviewQuestionAction,
  startInterviewAction,
} from "@/lib/interview/actions";
import type { InterviewMessageView, InterviewStateView } from "@/lib/interview/view";
import type { GiftSuggestion, InterviewExtraction } from "@/lib/validation/ai-interview";

const CHIP_FIELD_KEYS = Object.keys(SECTION_LABELS).filter(
  (key) => key !== "sizes",
) as Exclude<SectionTsKey, "sizes">[];

function ExtractionPreview({ fields }: { fields: InterviewExtraction }) {
  const rows: { label: string; value: string }[] = [];

  for (const key of CHIP_FIELD_KEYS) {
    const values = fields[key];
    if (values && values.length > 0) {
      rows.push({ label: SECTION_LABELS[key], value: values.join(", ") });
    }
  }
  if (fields.sizes) {
    const sizeParts = Object.entries(fields.sizes)
      .filter(([, value]) => value)
      .map(([sizeKey, value]) => `${sizeKey}: ${value}`);
    if (sizeParts.length > 0) {
      rows.push({ label: "Sizes", value: sizeParts.join(", ") });
    }
  }
  if (fields.introduction) {
    rows.push({ label: "Introduction", value: fields.introduction });
  }

  if (rows.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map((row) => (
        <li key={row.label} className="text-sm text-neutral-700">
          <span className="font-medium text-neutral-900">{row.label}: </span>
          {row.value}
        </li>
      ))}
    </ul>
  );
}

/**
 * Combines every not-yet-resolved extraction across the whole
 * conversation into one preview — the AI tallies facts silently turn by
 * turn, and this is what the single end-of-chat approval reflects.
 */
function mergeExtractionsForPreview(fieldsList: InterviewExtraction[]): InterviewExtraction {
  const merged: InterviewExtraction = {};

  for (const fields of fieldsList) {
    for (const key of CHIP_FIELD_KEYS) {
      const values = fields[key];
      if (!values || values.length === 0) continue;
      const existing = merged[key] ?? [];
      const seen = new Set(existing.map((value) => value.toLowerCase()));
      const next = [...existing];
      for (const value of values) {
        const norm = value.toLowerCase();
        if (seen.has(norm)) continue;
        seen.add(norm);
        next.push(value);
      }
      merged[key] = next;
    }
    if (fields.sizes) {
      merged.sizes = { ...merged.sizes, ...fields.sizes };
    }
    if (fields.introduction) {
      merged.introduction = fields.introduction;
    }
  }

  return merged;
}

function GiftSuggestionCard({
  message,
  onApprove,
  onDismiss,
  pending,
}: {
  message: InterviewMessageView;
  onApprove: () => void;
  onDismiss: () => void;
  pending: boolean;
}) {
  if (!message.giftSuggestion) return null;

  if (message.giftSuggestionResolved) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
        {message.giftSuggestionApplied ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
            Added to your wishlist
          </>
        ) : (
          "Not added"
        )}
      </p>
    );
  }

  const { name, description, category, budgetLevel } = message.giftSuggestion;

  return (
    <Card className="mt-2 flex flex-col gap-3 border-neutral-300 bg-white p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
        <Gift className="h-3.5 w-3.5" aria-hidden="true" />
        Gift idea
      </p>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-neutral-900">{name}</p>
        {description && <p className="text-sm text-neutral-600">{description}</p>}
        <p className="text-xs text-neutral-500">
          {category ?? CATEGORY_OPTIONS[0]}
          {budgetLevel ? ` · ${BUDGET_LABELS[budgetLevel]}` : ""}
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={onApprove} disabled={pending}>
          <Check className="h-4 w-4" aria-hidden="true" />
          Add to wishlist
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDismiss} disabled={pending}>
          Not now
        </Button>
      </div>
    </Card>
  );
}

export function InterviewClient({
  initialState,
}: {
  initialState: InterviewStateView | null;
}) {
  const { refreshProfile, addWishlistItem } = useProfile();
  const [state, setState] = useState<InterviewStateView | null>(initialState);
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryDraft, setSummaryDraft] = useState<string | null>(null);
  const [summaryPending, setSummaryPending] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [restartConfirmOpen, setRestartConfirmOpen] = useState(false);

  async function handleStart() {
    setPending(true);
    setError(null);
    const result = await startInterviewAction();
    setPending(false);
    if (!result.success || !result.state) {
      setError(result.error ?? "Couldn't start the interview.");
      return;
    }
    setState(result.state);
  }

  async function handleSend(text: string) {
    if (!state) return;
    setPending(true);
    setError(null);
    const result = await sendInterviewAnswerAction(state.sessionId, text);
    setPending(false);
    if (!result.success || !result.state) {
      setError(result.error ?? "Couldn't send your answer.");
      return;
    }
    setAnswer("");
    setState(result.state);
  }

  async function handleSkip() {
    if (!state) return;
    setPending(true);
    setError(null);
    const result = await skipInterviewQuestionAction(state.sessionId);
    setPending(false);
    if (!result.success || !result.state) {
      setError(result.error ?? "Couldn't skip this question.");
      return;
    }
    setState(result.state);
  }

  async function handleBack() {
    if (!state) return;
    setPending(true);
    setError(null);
    const result = await goBackInterviewAction(state.sessionId);
    setPending(false);
    if (!result.success || !result.state) {
      setError(result.error ?? "Couldn't go back.");
      return;
    }
    setState(result.state);
  }

  async function handleApproveAllExtractions() {
    if (!state) return;
    setPending(true);
    setError(null);
    const result = await approveAllExtractedFieldsAction(state.sessionId);
    setPending(false);
    if (!result.success || !result.state) {
      setError(result.error ?? "Couldn't save those changes.");
      return;
    }
    setState(result.state);
    // These fields were just written straight to the database (not
    // through ProfileContext's own update* methods), so Preview and the
    // manual editor need an explicit resync to see them.
    void refreshProfile();
  }

  async function handleDismissAllExtractions() {
    if (!state) return;
    setPending(true);
    setError(null);
    const result = await dismissAllExtractedFieldsAction(state.sessionId);
    setPending(false);
    if (!result.success || !result.state) {
      setError(result.error ?? "Couldn't update.");
      return;
    }
    setState(result.state);
  }

  async function handleApproveGift(messageId: string, suggestion: GiftSuggestion) {
    if (!state) return;
    setPending(true);
    setError(null);
    const addResult = await addWishlistItem({
      name: suggestion.name,
      description: suggestion.description ?? "",
      category: suggestion.category?.trim() || CATEGORY_OPTIONS[0],
      budgetLevel: suggestion.budgetLevel ?? "under_25",
      priority: "would_love",
      isPublic: true,
    });
    if (!addResult.success) {
      setPending(false);
      setError(addResult.error ?? "Couldn't add that to your wishlist.");
      return;
    }
    const result = await resolveGiftSuggestionAction(state.sessionId, messageId, true);
    setPending(false);
    if (!result.success || !result.state) {
      setError(result.error ?? "Added to your wishlist, but couldn't update the chat.");
      return;
    }
    setState(result.state);
  }

  async function handleDismissGift(messageId: string) {
    if (!state) return;
    setPending(true);
    setError(null);
    const result = await resolveGiftSuggestionAction(state.sessionId, messageId, false);
    setPending(false);
    if (!result.success || !result.state) {
      setError(result.error ?? "Couldn't update.");
      return;
    }
    setState(result.state);
  }

  async function handleGenerateSummary() {
    if (!state) return;
    setSummaryPending(true);
    setError(null);
    const result = await generateGiftStyleSummaryAction(state.sessionId);
    setSummaryPending(false);
    if (!result.success || !result.summary) {
      setError(result.error ?? "Couldn't generate a summary.");
      return;
    }
    setSummaryDraft(result.summary);
  }

  async function handleApproveSummary() {
    if (!state || summaryDraft === null) return;
    setSummaryPending(true);
    setError(null);
    const result = await approveGiftStyleSummaryAction(state.sessionId, summaryDraft);
    setSummaryPending(false);
    if (!result.success) {
      setError(result.error ?? "Couldn't save your gift style summary.");
      return;
    }
    setJustCompleted(true);
    void refreshProfile();
  }

  async function handleFinishWithoutSummary() {
    if (!state) return;
    setSummaryPending(true);
    setError(null);
    const result = await finishWithoutSummaryAction(state.sessionId);
    setSummaryPending(false);
    if (!result.success) {
      setError(result.error ?? "Couldn't finish the interview.");
      return;
    }
    setJustCompleted(true);
  }

  async function handleRestart() {
    if (!state) return;
    setPending(true);
    setError(null);
    const result = await restartInterviewAction(state.sessionId);
    setPending(false);
    if (!result.success || !result.state) {
      setError(result.error ?? "Couldn't start over.");
      return;
    }
    setState(result.state);
    setAnswer("");
    setSummaryDraft(null);
    setJustCompleted(false);
  }

  if (!state) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          icon={MessageCircleQuestion}
          title="AI Gift Builder"
          description="Chat with me for a few minutes — I'll get to know your taste and suggest actual gift ideas as we go. Nothing is added to your profile or wishlist until you say so."
        >
          <Button onClick={handleStart} disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            Start chatting
          </Button>
        </EmptyState>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            <p>{error}</p>
            <p className="mt-1">
              You can always{" "}
              <a href="/profile/edit" className="underline">
                build your profile manually
              </a>{" "}
              instead.
            </p>
          </div>
        )}
      </div>
    );
  }

  const isDone = state.status === "completed" || justCompleted;
  const readyToWrapUp = state.isComplete && state.status === "in_progress" && !justCompleted;
  const canGoBack = state.messages.length > 1;
  const pendingExtractionFields = state.messages
    .filter((message) => message.extractedFields && !message.extractionResolved)
    .map((message) => message.extractedFields!);
  const mergedExtraction =
    pendingExtractionFields.length > 0 ? mergeExtractionsForPreview(pendingExtractionFields) : null;
  const pendingGiftSuggestions = state.messages.filter(
    (message) => message.giftSuggestion && !message.giftSuggestionResolved,
  );

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <ProgressBar value={state.completionPercentage} label="AI Gift Builder progress" />
      </Card>

      <div className="flex flex-col gap-3">
        {state.messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "assistant"
                ? "flex flex-col items-start"
                : "flex flex-col items-end"
            }
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
            {message.role === "assistant" && message.giftSuggestion && (
              <div className="w-full max-w-[85%]">
                <GiftSuggestionCard
                  message={message}
                  pending={pending}
                  onApprove={() => handleApproveGift(message.id, message.giftSuggestion!)}
                  onDismiss={() => handleDismissGift(message.id)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {isDone ? (
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <Sparkles className="h-8 w-8 text-neutral-400" aria-hidden="true" />
          <p className="font-display text-lg font-semibold text-neutral-900">
            All done!
          </p>
          <p className="text-sm text-neutral-500">
            Check your profile and wishlist to see what got added, or keep filling
            things in yourself.
          </p>
          <div className="flex gap-2">
            <Button href="/profile/edit" size="sm">
              View my profile
            </Button>
            <Button href="/wishlist" variant="outline" size="sm">
              View wishlist
            </Button>
            <Button href="/preview" variant="outline" size="sm">
              Preview
            </Button>
          </div>
        </Card>
      ) : readyToWrapUp ? (
        <>
          {mergedExtraction && (
            <Card className="flex flex-col gap-3 border-amber-300 bg-amber-50 p-5">
              <p className="font-display text-lg font-semibold text-neutral-900">
                Here&apos;s everything I picked up on
              </p>
              <p className="text-sm text-neutral-600">
                Add it all to your profile, or leave it out — nothing was saved
                while we were chatting.
              </p>
              <ExtractionPreview fields={mergedExtraction} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApproveAllExtractions}
                  disabled={pending}
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Add to my profile
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissAllExtractions}
                  disabled={pending}
                >
                  Leave it out
                </Button>
              </div>
            </Card>
          )}
          {pendingGiftSuggestions.length > 0 && (
            <Card className="flex flex-col gap-3 p-5">
              <p className="font-display text-lg font-semibold text-neutral-900">
                Gift ideas from our chat
              </p>
              <div className="flex flex-col gap-3">
                {pendingGiftSuggestions.map((message) => (
                  <GiftSuggestionCard
                    key={message.id}
                    message={message}
                    pending={pending}
                    onApprove={() => handleApproveGift(message.id, message.giftSuggestion!)}
                    onDismiss={() => handleDismissGift(message.id)}
                  />
                ))}
              </div>
            </Card>
          )}
          <Card className="flex flex-col gap-3 p-5">
          <p className="font-display text-lg font-semibold text-neutral-900">
            That&apos;s everything I needed to ask
          </p>
          {summaryDraft === null ? (
            <>
              <p className="text-sm text-neutral-600">
                Want me to draft a short &quot;My Gift Style&quot; line for your profile,
                based only on what you just told me?
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={summaryPending}
                >
                  {summaryPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  )}
                  Draft my gift style
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleFinishWithoutSummary}
                  disabled={summaryPending}
                >
                  Finish without a summary
                </Button>
              </div>
            </>
          ) : (
            <>
              <label className="text-sm font-medium text-neutral-800" htmlFor="gift-style-draft">
                Your draft — edit it if you&apos;d like, then approve to save.
              </label>
              <textarea
                id="gift-style-draft"
                value={summaryDraft}
                onChange={(event) => setSummaryDraft(event.target.value)}
                rows={2}
                maxLength={300}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApproveSummary}
                  disabled={summaryPending || !summaryDraft.trim()}
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Approve &amp; save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleFinishWithoutSummary}
                  disabled={summaryPending}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Skip
                </Button>
              </div>
            </>
          )}
          </Card>
        </>
      ) : (
        <Card className="flex flex-col gap-3 p-4">
          <label htmlFor="interview-answer" className="text-sm font-medium text-neutral-800">
            Your answer
          </label>
          <textarea
            id="interview-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (answer.trim() && !pending) handleSend(answer);
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder="Type your answer…"
            className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => handleSend(answer)}
              disabled={pending || !answer.trim()}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Send
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleSkip} disabled={pending}>
              Skip
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleBack}
              disabled={pending || !canGoBack}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            <Badge variant="outline" className="ml-auto">
              Autosaves as you go
            </Badge>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button href="/dashboard" variant="ghost" size="sm">
          Save &amp; exit to dashboard
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setRestartConfirmOpen(true)}
          disabled={pending}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Start over
        </Button>
      </div>

      <ConfirmDialog
        open={restartConfirmOpen}
        onClose={() => setRestartConfirmOpen(false)}
        onConfirm={handleRestart}
        title="Start a new conversation?"
        description="This resets the chat and asks the opening question again. Anything you've already added to your profile or wishlist stays exactly as it is."
        confirmLabel="Start over"
      />
    </div>
  );
}
