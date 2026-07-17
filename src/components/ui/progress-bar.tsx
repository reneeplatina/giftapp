export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-800">{label}</span>
        <span className="text-neutral-500">{value}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200"
      >
        <div
          className="h-full rounded-full bg-neutral-900 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
