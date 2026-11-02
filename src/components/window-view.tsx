"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { WindowCrawler } from "@/components/window-crawler";

const REFRESH_MS = 5 * 60 * 1000;

interface View {
  image: string;
  timestamp: string;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
    hour12: true,
  })
    .format(new Date(iso))
    .replace(/\s?([ap])\.?m\.?$/i, (_, p: string) => `${p.toLowerCase()}m`);
}

export function WindowView() {
  const [view, setView] = useState<View | null>(null);
  const [failed, setFailed] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/view", { cache: "no-store" });
      if (!res.ok) throw new Error("Request failed");
      setView((await res.json()) as View);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return (
    <figure className="relative mx-auto w-full max-w-4xl">
      {/* Outer window frame */}
      <div className="rounded-sm bg-gradient-to-b from-stone-200 to-stone-400 p-4 shadow-2xl shadow-black/60 sm:p-6">
        {/* Inner frame / glass */}
        <div
          ref={paneRef}
          className={`relative aspect-video overflow-hidden bg-slate-900 ring-4 ring-stone-500/70 ${crawling ? "window-flicker" : ""}`}
        >
          {view ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={view.image}
              alt="Live snapshot of a scene in Singapore"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
              {failed ? "Come back again later." : "Opening the curtains…"}
            </div>
          )}

          {/* Glass reflection */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
        </div>
      </div>

      {/* Window sill */}
      <div className="mx-auto -mt-px h-4 w-[104%] -translate-x-[2%] rounded-b-md bg-gradient-to-b from-stone-400 to-stone-600 shadow-xl shadow-black/60" />

      <WindowCrawler paneRef={paneRef} onActive={setCrawling} />

      <figcaption className="mt-4 text-center text-xs text-white">
        {view ? `Snapshot taken ${formatTime(view.timestamp)} · refreshes every 5 minutes` : " "}
      </figcaption>
    </figure>
  );
}
