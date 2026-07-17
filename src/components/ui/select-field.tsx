import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-neutral-800"
        >
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn(
              "h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-base text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900",
              error ? "border-red-400" : "border-neutral-300",
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
          />
        </div>
        {error && (
          <p id={errorId} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

SelectField.displayName = "SelectField";
