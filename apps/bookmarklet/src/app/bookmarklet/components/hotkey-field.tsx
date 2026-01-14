"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeHotkey } from "../utils";

type HotkeyFieldProps = {
  hotkey: string;
  onHotkeyChange: (value: string) => void;
};

export function HotkeyField({ hotkey, onHotkeyChange }: HotkeyFieldProps) {
  const [captureHotkey, setCaptureHotkey] = useState(false);

  useEffect(() => {
    if (!captureHotkey) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCaptureHotkey(false);
        return;
      }

      const normalized = normalizeHotkey(event);
      if (!normalized) return;

      event.preventDefault();
      onHotkeyChange(normalized);
      setCaptureHotkey(false);
    };

    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [captureHotkey, onHotkeyChange]);

  return (
    <div>
      <Label className="text-[var(--card-muted)]">Hotkey</Label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Input
          className="min-w-[220px] flex-1 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)]"
          value={hotkey}
          onChange={(event) => onHotkeyChange(event.target.value)}
          placeholder="alt+shift+o"
        />
        <Button
          onClick={() => setCaptureHotkey(true)}
          variant="primary"
          size="xs"
        >
          {captureHotkey ? "Press keys" : "Capture"}
        </Button>
        <Button
          onClick={() => onHotkeyChange("")}
          size="xs"
        >
          Clear
        </Button>
      </div>
      <p className="mt-2 text-xs text-[var(--card-muted)]">
        Focus capture and press a key combo. Press Escape to cancel.
      </p>
    </div>
  );
}
