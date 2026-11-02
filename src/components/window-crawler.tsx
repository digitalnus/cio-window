"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

// How often a crawler appears (random between the two values).
const MIN_GAP_MS = 60 * 1000;
const MAX_GAP_MS = 3 * 60 * 1000;
// Crawlers only appear at night, Singapore time: from 8pm until 1am the next morning.
const START_HOUR = 19;
const END_HOUR = 1;
// Length of one crawl.
const CRAWL_MS = 16000;
// Figure height at full size, as a fraction of the window pane height.
const FIGURE_HEIGHT = 0.4;
// Number of "stop-motion" lurches per crawl.
const STEPS = 22;

interface Props {
  /** The glass pane. The crawler is clipped to it until it climbs over the sill. */
  paneRef: RefObject<HTMLDivElement | null>;
  /** Called with true while a crawl is playing so the parent can flicker the view. */
  onActive?: (active: boolean) => void;
}

/** True between START_HOUR and END_HOUR (Asia/Singapore), including the wrap past midnight. */
function isCrawlTime(now = new Date()) {
  const hour =
    Number(
      new Intl.DateTimeFormat("en-SG", {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Singapore",
      }).format(now),
    ) % 24;
  return START_HOUR > END_HOUR
    ? hour >= START_HOUR || hour < END_HOUR
    : hour >= START_HOUR && hour < END_HOUR;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * Builds stop-motion keyframes: the figure holds still, then lurches forward.
 * Coordinates are in px, relative to the figure's wrapper (bottom centre of the pane).
 */
function buildKeyframes(paneW: number, paneH: number, startX: number) {
  const endX = rand(-0.08, 0.08) * paneW;

  // Each lurch is followed by a pause. Some pauses are much longer: that is what makes it unsettling.
  const holds = Array.from({ length: STEPS + 1 }, () =>
    Math.random() < 0.2 ? rand(1.8, 3.2) : rand(0.7, 1.2),
  );
  const starts: number[] = [];
  let total = 0;
  for (let i = 0; i <= STEPS; i++) {
    starts.push(total);
    total += holds[i];
  }
  const lastStart = starts[STEPS] || 1;

  const frames: Keyframe[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const p = i / STEPS; // 0 → 1 progress along the crawl
    const eased = Math.pow(p, 1.5); // slow start, faster at the end
    const x = startX + (endX - startX) * eased + rand(-6, 6);
    // Start deep in the scene (high up, small), finish past the sill (below the pane).
    const y = -paneH * 0.4 * (1 - eased) + paneH * 0.6 * Math.pow(p, 2.4);
    const scale = 0.14 + 0.86 * eased;
    const rot = rand(-7, 7) + (i % 2 === 0 ? -3 : 3);
    const opacity = p < 0.06 ? p / 0.06 : p > 0.94 ? (1 - p) / 0.06 : 1;

    frames.push({
      offset: i === STEPS ? 1 : starts[i] / lastStart,
      transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`,
      opacity,
      // Hold the pose until the next offset, then jump: stop-motion.
      easing: "steps(1, end)",
    });
  }
  return frames;
}

export function WindowCrawler({ paneRef, onActive }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLImageElement>(null);
  const imagesRef = useRef<string[]>([]);
  const playingRef = useRef(false);
  const [src, setSrc] = useState<string | null>(null);
  const [cutout, setCutout] = useState(false);

  const loadImages = useCallback(async () => {
    try {
      const res = await fetch("/api/crawlers", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { images: string[] };
      imagesRef.current = data.images;
    } catch {
      imagesRef.current = [];
    }
  }, []);

  const play = useCallback(async () => {
    if (playingRef.current) return;
    await loadImages();
    const images = imagesRef.current;
    const pane = paneRef.current;
    const wrap = wrapRef.current;
    if (images.length === 0 || !pane || !wrap) return;

    playingRef.current = true;
    try {
      const choice = images[Math.floor(Math.random() * images.length)];

      // Preload so the first frame is not empty, and check whether the picture has a transparent background.
      const hasAlpha = await new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            const c = document.createElement("canvas");
            c.width = 16;
            c.height = 16;
            const ctx = c.getContext("2d");
            if (!ctx) return resolve(false);
            ctx.drawImage(img, 0, 0, 16, 16);
            const px = (x: number, y: number) =>
              ctx.getImageData(x, y, 1, 1).data[3];
            resolve(
              [px(0, 0), px(15, 0), px(0, 15), px(15, 15)].some((a) => a < 250),
            );
          } catch {
            resolve(false);
          }
        };
        img.onerror = () => resolve(false);
        img.src = choice;
      });
      setCutout(hasAlpha);
      setSrc(choice);

      // Wait one frame for the <img> to mount.
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const figure = figureRef.current;
      if (!figure) return;

      const paneRect = pane.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      // Pane edges relative to the overlay, used for the clip-path.
      const top = paneRect.top - wrapRect.top;
      const left = paneRect.left - wrapRect.left;
      const right = wrapRect.right - paneRect.right;
      const bottom = wrapRect.bottom - paneRect.bottom;

      // Anchored to the bottom centre of the pane.
      figure.style.height = `${paneRect.height * FIGURE_HEIGHT}px`;
      figure.style.left = `${left + paneRect.width / 2}px`;
      figure.style.top = `${top + paneRect.height}px`;

      const startX = rand(-0.25, 0.25) * paneRect.width;
      onActive?.(true);

      // Clip to the pane while the figure is still "outside" the window, then let it spill over the sill.
      const clipIn = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
      const clipOut = `inset(${top}px ${right}px ${-bottom - paneRect.height}px ${left}px)`;
      const clip = wrap.animate(
        [
          { clipPath: clipIn, offset: 0 },
          { clipPath: clipIn, offset: 0.62 },
          { clipPath: clipOut, offset: 0.7 },
          { clipPath: clipOut, offset: 1 },
        ],
        { duration: CRAWL_MS, fill: "forwards" },
      );

      const move = figure.animate(
        buildKeyframes(paneRect.width, paneRect.height, startX),
        {
          duration: CRAWL_MS,
          fill: "forwards",
        },
      );

      await Promise.allSettled([move.finished, clip.finished]);
      move.cancel();
      clip.cancel();
    } catch (err) {
      console.error("Crawler animation failed", err);
    } finally {
      setSrc(null);
      onActive?.(false);
      playingRef.current = false;
    }
  }, [loadImages, onActive, paneRef]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ?crawl=now plays one straight away (handy for testing).
    if (new URLSearchParams(window.location.search).get("crawl") === "now") {
      const id = setTimeout(play, 1500);
      return () => clearTimeout(id);
    }

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        async () => {
          if (isCrawlTime()) await play();
          schedule();
        },
        rand(MIN_GAP_MS, MAX_GAP_MS),
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, [play]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20"
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={figureRef}
          src={src}
          alt=""
          draggable={false}
          // Origin at the bottom centre so scaling grows the figure towards the viewer.
          className="absolute w-auto max-w-none origin-bottom -translate-x-1/2 -translate-y-full select-none drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]"
          style={
            cutout
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  // Softens the edges of photos that have no transparent background.
                  maskImage:
                    "radial-gradient(ellipse at center, black 62%, transparent 100%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at center, black 62%, transparent 100%)",
                }
          }
        />
      )}
    </div>
  );
}
