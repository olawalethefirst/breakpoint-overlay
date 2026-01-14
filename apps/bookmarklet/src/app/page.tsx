"use client";

import { AdvancedJsonEditor } from "./bookmarklet/components/advanced-json-editor";
import { BookmarkletOutput } from "./bookmarklet/components/bookmarklet-output";
import { BreakpointsEditor } from "./bookmarklet/components/breakpoints-editor";
import { ConfigWarnings } from "./bookmarklet/components/config-warnings";
import { DecodedSnippet } from "./bookmarklet/components/decoded-snippet";
import { HeaderIntro } from "./bookmarklet/components/header-intro";
import { HotkeyField } from "./bookmarklet/components/hotkey-field";
import { MatchStrategyAndDebounce } from "./bookmarklet/components/match-strategy-and-debounce";
import { ScriptUrlField } from "./bookmarklet/components/script-url-field";
import { useBookmarkletConfig } from "./bookmarklet/use-bookmarklet-config";
import { useBookmarkletOutput } from "./bookmarklet/use-bookmarklet-output";
import { useScriptUrlOptions } from "./bookmarklet/use-script-url-options";
import { PageShell } from "./components/page-shell";

export default function Home() {
  const {
    breakpoints,
    matchStrategy,
    hotkey,
    debounceMs,
    config,
    errors,
    setBreakpoints,
    setMatchStrategy,
    setHotkey,
    setDebounceMs,
    addBreakpoint,
    updateBreakpoint,
    removeBreakpoint,
  } = useBookmarkletConfig();

  const {
    scriptBaseUrl,
    setScriptBaseUrl,
    scriptSpecifier,
    setScriptSpecifier,
    scriptUrl,
    bookmarklet,
    decodedSnippet,
  } = useBookmarkletOutput(config);
  const { options: scriptUrlOptions, isLoading: isScriptUrlLoading } =
    useScriptUrlOptions();

  return (
    <PageShell header={<HeaderIntro />}>
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section className="min-w-0 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--card-shadow)] backdrop-blur">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--page-muted)]">
              Generator
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--page-heading)]">
              Overlay Config
            </h2>
          </div>

          <div className="mt-6 grid gap-6">
            <ScriptUrlField
              baseCdnUrl={scriptBaseUrl}
              onBaseCdnUrlChange={setScriptBaseUrl}
              selectedSpecifier={scriptSpecifier}
              onSelectedSpecifierChange={setScriptSpecifier}
              resolvedUrl={scriptUrl}
              options={scriptUrlOptions}
              isLoading={isScriptUrlLoading}
            />

            <MatchStrategyAndDebounce
              matchStrategy={matchStrategy}
              debounceMs={debounceMs}
              onMatchStrategyChange={setMatchStrategy}
              onDebounceChange={setDebounceMs}
            />

            <HotkeyField hotkey={hotkey} onHotkeyChange={setHotkey} />

            <BreakpointsEditor
              breakpoints={breakpoints}
              onAdd={addBreakpoint}
              onUpdate={updateBreakpoint}
              onRemove={removeBreakpoint}
            />

            <AdvancedJsonEditor
              config={config}
              setMatchStrategy={setMatchStrategy}
              setHotkey={setHotkey}
              setDebounceMs={setDebounceMs}
              setBreakpoints={(value) => setBreakpoints(value)}
            />

            <ConfigWarnings errors={errors} />
          </div>
        </section>

        <section className="min-w-0 space-y-6">
          <BookmarkletOutput
            bookmarklet={bookmarklet}
            hasWarnings={errors.length > 0}
          />
          <DecodedSnippet decodedSnippet={decodedSnippet} />
        </section>
      </div>
    </PageShell>
  );
}
