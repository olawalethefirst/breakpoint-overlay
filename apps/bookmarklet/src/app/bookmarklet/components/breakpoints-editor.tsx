import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BreakpointDraft } from "../types";

type BreakpointsEditorProps = {
  breakpoints: BreakpointDraft[];
  onAdd: () => void;
  onUpdate: (index: number, key: keyof BreakpointDraft, value: string) => void;
  onRemove: (index: number) => void;
};

export function BreakpointsEditor({
  breakpoints,
  onAdd,
  onUpdate,
  onRemove,
}: BreakpointsEditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-[var(--card-muted)]">Breakpoints</Label>
        <Button
          onClick={onAdd}
          variant="primary"
          size="xs"
        >
          Add
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        {breakpoints.map((bp, index) => (
          <div
            key={`${bp.id}-${index}`}
            className="grid gap-3 rounded-2xl border border-[var(--card-panel-border)] bg-[var(--card-panel-bg)] p-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <div className="min-w-0">
              <Label className="text-[11px] text-[var(--card-muted)]">Id</Label>
              <Input
                className="mt-1 w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-2 py-1.5 text-sm text-[var(--input-text)] shadow-none"
                value={bp.id}
                onChange={(event) => onUpdate(index, "id", event.target.value)}
              />
            </div>
            <div className="min-w-0">
              <Label className="text-[11px] text-[var(--card-muted)]">
                Label
              </Label>
              <Input
                className="mt-1 w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-2 py-1.5 text-sm text-[var(--input-text)] shadow-none"
                value={bp.label}
                onChange={(event) =>
                  onUpdate(index, "label", event.target.value)
                }
              />
            </div>
            <div className="min-w-0">
              <Label className="text-[11px] text-[var(--card-muted)]">Min</Label>
              <Input
                className="mt-1 w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-2 py-1.5 text-sm text-[var(--input-text)] shadow-none"
                type="number"
                min={0}
                value={bp.minWidth}
                onChange={(event) =>
                  onUpdate(index, "minWidth", event.target.value)
                }
              />
            </div>
            <div className="min-w-0">
              <Label className="text-[11px] text-[var(--card-muted)]">Max</Label>
              <Input
                className="mt-1 w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-2 py-1.5 text-sm text-[var(--input-text)] shadow-none"
                type="number"
                min={0}
                value={bp.maxWidth}
                onChange={(event) =>
                  onUpdate(index, "maxWidth", event.target.value)
                }
              />
            </div>
            <div className="flex items-center sm:items-end">
              <Button
                onClick={() => onRemove(index)}
                size="xs"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        {breakpoints.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[var(--card-panel-border)] bg-[var(--card-panel-bg)] p-4 text-sm text-[var(--card-muted)]">
            No breakpoints yet. Add one or leave empty to use defaults.
          </p>
        )}
      </div>
    </div>
  );
}
