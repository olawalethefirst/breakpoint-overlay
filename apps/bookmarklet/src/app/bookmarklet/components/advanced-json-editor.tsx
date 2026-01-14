"use client";

import { useEffect, useState } from "react";
import type { OverlayConfig } from "breakpoint-overlay";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BreakpointDraft, MatchStrategy } from "../types";
import { configFromJson } from "../utils";

type AdvancedJsonEditorProps = {
  config: OverlayConfig;
  setMatchStrategy: (value: MatchStrategy) => void;
  setHotkey: (value: string) => void;
  setDebounceMs: (value: string) => void;
  setBreakpoints: (value: BreakpointDraft[]) => void;
};

export function AdvancedJsonEditor({
  config,
  setMatchStrategy,
  setHotkey,
  setDebounceMs,
  setBreakpoints,
}: AdvancedJsonEditorProps) {
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isEditingJson, setIsEditingJson] = useState(false);

  useEffect(() => {
    if (!isEditingJson) {
      setJsonDraft(JSON.stringify(config, null, 2));
    }
  }, [config, isEditingJson]);

  const applyJson = () => {
    const parsed = configFromJson(jsonDraft);
    if (!parsed) {
      setJsonError("Invalid JSON. Fix the syntax before applying.");
      return;
    }

    setJsonError(null);
    setIsEditingJson(false);
    setMatchStrategy(parsed.matchStrategy ?? "auto");
    setHotkey(parsed.hotkey ?? "");
    setDebounceMs(parsed.debounceMs != null ? String(parsed.debounceMs) : "");

    if (parsed.breakpoints && parsed.breakpoints.length > 0) {
      setBreakpoints(
        parsed.breakpoints.map((bp) => ({
          id: bp.id,
          label: bp.label ?? "",
          minWidth: bp.minWidth != null ? String(bp.minWidth) : "",
          maxWidth: bp.maxWidth != null ? String(bp.maxWidth) : "",
        }))
      );
    } else {
      setBreakpoints([]);
    }
  };

  const cancelEditing = () => {
    setJsonError(null);
    setIsEditingJson(false);
    setJsonDraft(JSON.stringify(config, null, 2));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-[var(--card-muted)]">Advanced JSON</Label>
        <div className="flex items-center gap-2">
          <Button
            onClick={cancelEditing}
            size="xs"
          >
            Cancel
          </Button>
          <Button
            onClick={applyJson}
            variant="primary"
            size="xs"
          >
            Apply
          </Button>
        </div>
      </div>
      <Textarea
        className="mt-3 h-40 w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-xs text-[var(--input-text)]"
        value={jsonDraft}
        onChange={(event) => setJsonDraft(event.target.value)}
        onFocus={() => setIsEditingJson(true)}
      />
      {jsonError && <p className="mt-2 text-xs text-red-600">{jsonError}</p>}
    </div>
  );
}
