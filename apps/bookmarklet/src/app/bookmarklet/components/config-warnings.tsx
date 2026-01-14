type ConfigWarningsProps = {
  errors: string[];
};

export function ConfigWarnings({ errors }: ConfigWarningsProps) {
  if (errors.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
      <p className="text-xs font-semibold uppercase tracking-wide">
        Config warnings
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
