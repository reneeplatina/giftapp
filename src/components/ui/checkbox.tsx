import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50"
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900"
          {...props}
        />
        <span className="flex flex-col">
          <span className="text-sm font-medium text-neutral-800">
            {label}
          </span>
          {description && (
            <span className="text-xs text-neutral-500">{description}</span>
          )}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
