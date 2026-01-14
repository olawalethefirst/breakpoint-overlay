import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { MatchStrategy } from "../types";

type MatchStrategyAndDebounceProps = {
  matchStrategy: MatchStrategy;
  debounceMs: string;
  onMatchStrategyChange: (value: MatchStrategy) => void;
  onDebounceChange: (value: string) => void;
};

export function MatchStrategyAndDebounce({
  matchStrategy,
  debounceMs,
  onMatchStrategyChange,
  onDebounceChange,
}: MatchStrategyAndDebounceProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label className="text-[var(--card-muted)]">Match Strategy</Label>
        <Select
          className="mt-2 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)]"
          value={matchStrategy}
          onChange={(event) =>
            onMatchStrategyChange(event.target.value as MatchStrategy)
          }
        >
          <option value="auto">Auto</option>
          <option value="min-width">Min width</option>
          <option value="max-width">Max width</option>
          <option value="range">Range</option>
        </Select>
      </div>
      <div>
        <Label className="text-[var(--card-muted)]">Debounce (ms)</Label>
        <Input
          className="mt-2 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)]"
          type="number"
          min={0}
          value={debounceMs}
          onChange={(event) => onDebounceChange(event.target.value)}
          placeholder="150"
        />
      </div>
    </div>
  );
}
