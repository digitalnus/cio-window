import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const EXTENSIONS = new Set([".png", ".webp", ".gif", ".jpg", ".jpeg", ".avif"]);

// Lists the images in /public/crawlers so the client can pick one at random.
export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "crawlers");
    const files = await readdir(dir);
    const images = files
      .filter(
        (f) =>
          !f.startsWith(".") && EXTENSIONS.has(path.extname(f).toLowerCase()),
      )
      .sort()
      .map((f) => `/crawlers/${encodeURIComponent(f)}`);
    return NextResponse.json(
      { images },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // Folder missing or unreadable: simply no crawlers.
    return NextResponse.json(
      { images: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
