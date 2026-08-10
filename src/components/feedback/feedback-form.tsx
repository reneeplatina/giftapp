"use client";

import { useActionState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextAreaField } from "@/components/ui/textarea-field";
import {
  submitFeedbackAction,
  type FeedbackActionState,
} from "@/lib/feedback/actions";

const initialState: FeedbackActionState = { status: "idle" };

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState(
    submitFeedbackAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
    >
      <TextAreaField
        label="What's on your mind?"
        name="message"
        rows={6}
        hint="Bugs, confusing steps, ideas — anything helps."
        error={state.fieldErrors?.message?.[0]}
      />
      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "success" && state.message && (
        <p
          className="flex items-center gap-1.5 text-sm font-medium text-green-700"
          role="status"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        Send feedback
      </Button>
    </form>
  );
}
