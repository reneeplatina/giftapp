import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  label: string;
  description?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 p-4"
      >
        <span className="flex flex-col">
          <span className="text-sm font-medium text-neutral-800">
            {label}
          </span>
          {description && (
            <span className="text-xs text-neutral-500">{description}</span>
          )}
        </span>
        <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-neutral-900 peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-900 peer-focus-visible:ring-offset-2"
          />
          <span
            aria-hidden="true"
            className="absolute left-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"
          />
        </span>
      </label>
    );
  },
);

Toggle.displayName = "Toggle";
