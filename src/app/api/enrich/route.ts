import { NextRequest, NextResponse } from "next/server";
import { Runner, InMemorySessionService } from "@google/adk";
import { routeEnricherAgent } from "@/lib/agents/routeEnricher";
import { RouteEnrichmentSchema } from "@/lib/agents/routeEnricher.schema";
import { GeneratedRoute, RouteEnrichmentResponse, RouteStop } from "@/types/route";
import {
  boundingBoxFromCoordinates,
  sampleRoute,
  distanceAlongRouteToPoint,
} from "@/lib/utils/geo";

async function getCityName(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      { headers: { "User-Agent": "PacyrApp/1.0 (contact@pacyr.com)" } }
    );
    if (!res.ok) return "your city";
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || "your city";
  } catch {
    return "your city";
  }
}

const FALLBACK_NARRATIVE =
  "A loop awaits through the streets ahead — keep an eye out for interesting spots along the way.";

export async function POST(req: NextRequest) {
  try {
    const body: { route: GeneratedRoute } = await req.json();
    if (!body.route || !body.route.coordinates || body.route.coordinates.length < 2) {
      return NextResponse.json<RouteEnrichmentResponse>(
        { success: false, error: "Invalid route payload" },
        { status: 400 }
      );
    }

    const { coordinates, totalDistanceMeters } = body.route;
    const [startLng, startLat] = coordinates[0];

    const city = await getCityName(startLat, startLng);
    const boundingBox = boundingBoxFromCoordinates(coordinates);
    const samplePoints = sampleRoute(coordinates, 10);

    const payload = JSON.stringify({
      city,
      distanceKm: Number((totalDistanceMeters / 1000).toFixed(2)),
      boundingBox,
      samplePoints,
    });

    const sessionService = new InMemorySessionService();
    const runner = new Runner({
      agent: routeEnricherAgent,
      appName: "Pacyr",
      sessionService,
    });

    const session = await sessionService.createSession({ appName: "Pacyr", userId: "user" });

    try {
      for await (const event of runner.runAsync({
        userId: "user",
        sessionId: session.id,
        newMessage: { role: "user", parts: [{ text: payload }] },
      })) {
        console.log("[Pacyr] event >>>", JSON.stringify(event, null, 2));
      }
    } catch (err) {
      console.error("[Pacyr] RouteEnricherAgent run error:", err);
    }

    const finalSession = await sessionService.getSession({
      appName: "Pacyr",
      userId: "user",
      sessionId: session.id,
    });

    console.log("[Pacyr] final state >>>", JSON.stringify(finalSession?.state, null, 2));

    const raw = finalSession?.state?.enrichmentRaw as string | undefined;

    let theme: string | null = null;
    let narrative = FALLBACK_NARRATIVE;
    let stops: RouteStop[] = [];

    if (raw) {
      try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = RouteEnrichmentSchema.safeParse(JSON.parse(cleaned));
        if (parsed.success) {
          theme = parsed.data.theme;
          narrative = parsed.data.narrative;
          stops = parsed.data.stops
            .map((s) => ({
              ...s,
              distanceAlongRouteKm: distanceAlongRouteToPoint(coordinates, s.lat, s.lng),
            }))
            .sort((a, b) => a.distanceAlongRouteKm - b.distanceAlongRouteKm);
        } else {
          console.warn("[Pacyr] Enrichment JSON failed schema validation:", parsed.error);
        }
      } catch (err) {
        console.warn("[Pacyr] Failed to parse enrichment JSON:", err, "raw:", raw);
      }
    } else {
      console.warn("[Pacyr] No enrichment output — likely an MCP connection or quota issue.");
    }

    return NextResponse.json<RouteEnrichmentResponse>({ success: true, theme, narrative, stops });
  } catch (error) {
    console.error("[Pacyr] Route enrichment error:", error);
    return NextResponse.json<RouteEnrichmentResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}