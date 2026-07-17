"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ChipMultiSelect({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const extras = value.filter((item) => !options.includes(item));
  const allChips = [...options, ...extras];

  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  }

  function addCustom() {
    const trimmed = draft.trim();
    if (!trimmed || value.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-neutral-800">{label}</span>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {allChips.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
              )}
            >
              {option}
              {selected && <X className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          );
        })}
        {allChips.length === 0 && (
          <p className="text-sm text-neutral-400">Nothing added yet.</p>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <label htmlFor={`${label}-custom`} className="sr-only">
          Add a custom {label.toLowerCase()} entry
        </label>
        <input
          id={`${label}-custom`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
          placeholder="Add your own…"
          className="h-10 flex-1 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <button
          type="button"
          onClick={addCustom}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          aria-label={`Add custom ${label.toLowerCase()} entry`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
