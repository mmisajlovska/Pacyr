import { NextRequest, NextResponse } from "next/server";
import { GenerateRequest, GenerateResponse } from "@/types/route";
import { generateRouteExecute } from "@/lib/tools/generateRoute";
import { scoreRouteExecute } from "@/lib/tools/scoreRoute";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { lat, lng, targetKm } = body;

    if (!lat || !lng || !targetKm) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: "Missing lat, lng, or targetKm" },
        { status: 400 }
      );
    }

    if (targetKm < 1 || targetKm > 42) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: "Target distance must be between 1 and 42 km" },
        { status: 400 }
      );
    }

    // Step 1: Generate route using OSRM
    const generatedRoute = await generateRouteExecute({ lat, lng, targetKm });

    if (generatedRoute.error || !generatedRoute.coordinates || generatedRoute.coordinates.length < 2) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: generatedRoute.error || "Route generation failed \u2014 no coordinates returned" },
        { status: 500 }
      );
    }

    // Step 2: Score the route
    const finalRoute = await scoreRouteExecute({
      coordinates: generatedRoute.coordinates,
      totalMeters: targetKm * 1000, // Force the exact slider value
      cityName: "City",
    });

    return NextResponse.json<GenerateResponse>({
      success: true,
      route: {
        coordinates: finalRoute.coordinates,
        totalDistanceMeters: finalRoute.totalDistanceMeters,
        estimatedDurationMinutes: finalRoute.estimatedDurationMinutes,
        estimatedCalories: finalRoute.estimatedCalories,
        routeName: finalRoute.routeName,
        startNodeName: "Current location",
        surfaceProfile: finalRoute.surfaceProfile,
      },
    });
  } catch (error) {
    console.error("Route generation error:", error);
    return NextResponse.json<GenerateResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
