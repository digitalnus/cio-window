"use client";

import { useCallback, useEffect, useState } from "react";

const REFRESH_MS = 60 * 60 * 1000;

interface Reading {
  region: string;
  psi: number;
}

interface Psi {
  timestamp: string;
  readings: Reading[];
}

function band(psi: number) {
  if (psi <= 50) return { label: "Good", text: "text-emerald-400" };
  if (psi <= 100) return { label: "Moderate", text: "text-sky-400" };
  if (psi <= 200) return { label: "Unhealthy", text: "text-amber-400" };
  if (psi <= 300) return { label: "Very unhealthy", text: "text-orange-500" };
  return { label: "Hazardous", text: "text-red-500" };
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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

function Items({ readings, hidden }: { readings: Reading[]; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden}>
      {readings.map((r) => {
        const b = band(r.psi);
        return (
          <li key={r.region} className="flex items-baseline gap-2 px-8 whitespace-nowrap">
            <span className="text-slate-300">{capitalise(r.region)}:</span>
            <span className={`font-semibold tabular-nums ${b.text}`}>{r.psi}</span>
            <span className={`text-xs ${b.text}`}>{b.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function PsiTicker() {
  const [data, setData] = useState<Psi | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/psi", { cache: "no-store" });
      if (!res.ok) throw new Error("Request failed");
      setData((await res.json()) as Psi);
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
    <div className="mx-auto mb-8 w-full max-w-4xl">
      <div
        className="flex items-center overflow-hidden rounded-md border border-slate-700 bg-slate-900 font-mono text-sm shadow-lg shadow-black/40"
        role="region"
        aria-label="Haze PSI readings"
      >
        <div className="z-10 shrink-0 self-stretch bg-slate-800 px-4 py-2.5 text-xs font-semibold tracking-wide text-white">
          24-hr PSI
        </div>
        <div className="psi-marquee min-w-0 flex-1 py-2.5">
          {data ? (
            <div className="psi-track flex w-max">
              <Items readings={data.readings} />
              <Items readings={data.readings} hidden />
              <Items readings={data.readings} hidden />
              <Items readings={data.readings} hidden />
            </div>
          ) : (
            <div className="px-6 text-slate-400">
              {failed ? "PSI readings are unavailable right now." : "Loading PSI readings…"}
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-white">
        {data ? `Source: NEA · updated ${formatTime(data.timestamp)} · refreshes every hour` : " "}
      </p>
    </div>
  );
}
