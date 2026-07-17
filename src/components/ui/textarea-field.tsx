import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(({ label, error, hint, id, rows = 3, ...props }, ref) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-neutral-800"
      >
        {label}
      </label>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={cn(hintId, errorId) || undefined}
        className={cn(
          "rounded-xl border bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900",
          error ? "border-red-400" : "border-neutral-300",
        )}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

TextAreaField.displayName = "TextAreaField";
