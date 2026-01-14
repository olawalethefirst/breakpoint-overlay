type DecodedSnippetProps = {
  decodedSnippet: string;
};

export function DecodedSnippet({ decodedSnippet }: DecodedSnippetProps) {
  return (
    <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--card-shadow)] backdrop-blur">
      <h2 className="text-lg font-semibold text-[var(--page-heading)]">
        Decoded Snippet
      </h2>
      <p className="mt-2 text-sm text-[var(--card-muted)]">
        Review the JavaScript that the bookmarklet will execute.
      </p>
      <pre className="mt-4 max-h-64 overflow-auto rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-[11px] leading-relaxed text-[var(--input-text)]">
        {decodedSnippet}
      </pre>
    </div>
  );
}
