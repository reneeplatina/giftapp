import { z } from "zod";
import { MONTH_NAMES } from "@/lib/format-birthday";

/** We never collect a birth year, but the `birthday` column is a SQL
 * `date` and needs one to be a valid date. 2000 is a leap year, so Feb 29
 * is always storable regardless of what year it's actually displayed in. */
const BIRTHDAY_PLACEHOLDER_YEAR = "2000";

export const MONTH_OPTIONS: { value: string; label: string }[] = MONTH_NAMES.map(
  (label, index) => ({ value: String(index + 1).padStart(2, "0"), label }),
);

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const DAY_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: 31 },
  (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return { value: day, label: day };
  },
);

function daysInMonth(month: string): number {
  return DAYS_IN_MONTH[Number(month) - 1] ?? 31;
}

/** Combines a "MM" month and "DD" day into a storable "YYYY-MM-DD"
 * birthday, or null if either half is missing. */
export function combineBirthday(month: string, day: string): string | null {
  if (!month || !day) return null;
  return `${BIRTHDAY_PLACEHOLDER_YEAR}-${month}-${day}`;
}

/** Splits a stored "YYYY-MM-DD" birthday back into "MM"/"DD" parts for
 * the month/day select inputs — the year is simply discarded. */
export function splitBirthday(
  birthday: string | null | undefined,
): { birthMonth: string; birthDay: string } {
  const match = birthday ? /^\d{4}-(\d{2})-(\d{2})$/.exec(birthday) : null;
  return { birthMonth: match?.[1] ?? "", birthDay: match?.[2] ?? "" };
}

export const birthMonthField = z
  .string()
  .regex(/^(0[1-9]|1[0-2])$/, "Pick a month")
  .or(z.literal(""));

export const birthDayField = z
  .string()
  .regex(/^(0[1-9]|[12]\d|3[01])$/, "Pick a day")
  .or(z.literal(""));

/** Shared cross-field check for the birthMonth/birthDay pair: both are
 * optional, but if one is filled in the other must be too, and the day
 * has to actually exist in that month. Wire up with `.superRefine()`. */
export function checkBirthdayFields(
  { birthMonth, birthDay }: { birthMonth: string; birthDay: string },
  ctx: z.RefinementCtx,
) {
  if (!birthMonth && !birthDay) return;
  if (!birthMonth) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pick a month", path: ["birthMonth"] });
  }
  if (!birthDay) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pick a day", path: ["birthDay"] });
  }
  if (birthMonth && birthDay && Number(birthDay) > daysInMonth(birthMonth)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "That day doesn't exist in this month",
      path: ["birthDay"],
    });
  }
}
