"use client";

import { useEffect, useMemo, useState } from "react";

import type { ScriptUrlOption } from "./components/script-url-field";

type VersionsResponse = {
  versions: string[];
  distTags: Record<string, string>;
};

const sortVersionsDesc = (versions: string[]) =>
  versions
    .slice()
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

export const useScriptUrlOptions = () => {
  const [data, setData] = useState<VersionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://registry.npmjs.org/breakpoint-overlay",
          {
            headers: {
              Accept: "application/vnd.npm.install-v1+json",
            },
            cache: "no-store",
          }
        );
        if (!response.ok) return;
        const json = (await response.json()) as {
          versions?: Record<string, unknown>;
          "dist-tags"?: Record<string, string>;
        };
        const formatted: VersionsResponse = {
          versions: Object.keys(json.versions ?? {}),
          distTags: json["dist-tags"] ?? {},
        };
        if (!cancelled) {
          setData(formatted);
        }
      } catch {
        // Ignore network errors and keep manual input enabled.
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo<ScriptUrlOption[]>(() => {
    if (!data) return [];

    const items: ScriptUrlOption[] = [];
    const distTags = data.distTags ?? {};
    const distTagVersions = new Set(Object.values(distTags));

    if (distTags.latest) {
      items.push({
        label: `latest (${distTags.latest})`,
        specifier: "",
      });
    }

    Object.entries(distTags)
      .filter(([tag]) => tag !== "latest")
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([tag, version]) => {
        items.push({
          label: `${tag} (${version})`,
          specifier: tag,
        });
      });

    sortVersionsDesc(data.versions ?? [])
      .filter((version) => !distTagVersions.has(version))
      .forEach((version) => {
        items.push({
          label: version,
          specifier: version,
        });
      });

    return items;
  }, [data]);

  return { options, isLoading };
};
