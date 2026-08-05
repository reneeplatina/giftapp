const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Formats a "YYYY-MM-DD" birthday as "Month Day" — deliberately never
 * the year, so a public profile page never exposes exact age. Parses
 * the parts directly rather than through `new Date(string)`, which
 * would read the date as UTC midnight and can shift a day off in
 * negative-UTC timezones. */
export function formatBirthdayMonthDay(birthday: string): string | null {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(birthday);
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const name = MONTH_NAMES[month - 1];
  if (!name || day < 1 || day > 31) return null;
  return `${name} ${day}`;
}
