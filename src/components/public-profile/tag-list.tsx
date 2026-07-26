export function TagList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Nothing added yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
