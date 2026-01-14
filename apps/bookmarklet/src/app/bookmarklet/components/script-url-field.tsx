import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type ScriptUrlFieldProps = {
  baseCdnUrl: string;
  onBaseCdnUrlChange: (value: string) => void;
  selectedSpecifier: string;
  onSelectedSpecifierChange: (value: string) => void;
  resolvedUrl: string;
  options?: ScriptUrlOption[];
  isLoading?: boolean;
};

export type ScriptUrlOption = {
  label: string;
  specifier: string;
};

export function ScriptUrlField({
  baseCdnUrl,
  onBaseCdnUrlChange,
  selectedSpecifier,
  onSelectedSpecifierChange,
  resolvedUrl,
  options = [],
  isLoading = false,
}: ScriptUrlFieldProps) {
  const availableOptions =
    options.length > 0 ? options : [{ label: "latest", specifier: "" }];

  return (
    <div>
      <Label className="text-[var(--card-muted)]">Script URL</Label>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_220px]">
        <Input
          className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)]"
          value={baseCdnUrl}
          onChange={(event) => onBaseCdnUrlChange(event.target.value)}
          placeholder="CDN base URL (e.g. https://unpkg.com)"
        />
        <Select
          className="border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)]"
          value={selectedSpecifier}
          onChange={(event) => onSelectedSpecifierChange(event.target.value)}
        >
          {availableOptions.map((option) => (
            <option key={option.label} value={option.specifier}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <p className="mt-2 text-xs text-[var(--card-muted)]">
        {isLoading
          ? "Loading published versions..."
          : "Pick a version and adjust the base CDN URL."}
      </p>
      <p className="mt-2 text-xs text-[var(--card-muted)]">
        Resolved URL:{" "}
        <span className="font-mono text-[var(--card-text)]">{resolvedUrl}</span>
      </p>
    </div>
  );
}
