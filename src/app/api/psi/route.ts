import { NextResponse } from "next/server";
import { z } from "zod";

const REGIONS = ["west", "east", "central", "north", "south"] as const;

const regionValues = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
  central: z.number(),
});

const schema = z.object({
  data: z.object({
    items: z
      .array(
        z.object({
          timestamp: z.string(),
          readings: z.object({ psi_twenty_four_hourly: regionValues }),
        }),
      )
      .min(1),
  }),
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://api-open.data.gov.sg/v2/real-time/api/psi", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Upstream failed");
    const parsed = schema.parse(await res.json());
    const item = parsed.data.items[parsed.data.items.length - 1];
    const psi = item.readings.psi_twenty_four_hourly;
    return NextResponse.json(
      {
        timestamp: item.timestamp,
        readings: REGIONS.map((region) => ({ region, psi: psi[region] })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Unable to load PSI" }, { status: 502 });
  }
}
