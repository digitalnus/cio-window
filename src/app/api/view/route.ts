import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Camera {
  image: string;
  timestamp: string;
  camera_id: string;
}

interface TrafficResponse {
  items: { cameras: Camera[] }[];
}

export async function GET() {
  try {
    const res = await fetch("https://api.data.gov.sg/v1/transport/traffic-images", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstream returned ${res.status}`);

    const data = (await res.json()) as TrafficResponse;
    const cameras = data.items[0]?.cameras ?? [];
    if (cameras.length === 0) throw new Error("No cameras available");

    // Rotate through the cameras every 15 minutes so the view changes through the day
    const slot = Math.floor(Date.now() / (15 * 60 * 1000));
    const camera = cameras[slot % cameras.length];

    return NextResponse.json(
      {
        image: camera.image,
        timestamp: camera.timestamp,
        cameraId: camera.camera_id,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Unable to load the view" }, { status: 502 });
  }
}
