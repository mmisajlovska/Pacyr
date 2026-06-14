"use client";

import { useState, useEffect } from "react";
import { KmInput } from "@/components/KmInput";
import { RouteMap } from "@/components/RouteMap";
import { RouteCard } from "@/components/RouteCard";
import { RouteStops } from "@/components/RouteStops";
import { GeneratedRoute, RouteEnrichmentResponse } from "@/types/route";

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<GeneratedRoute | null>(null);
  const [enrichment, setEnrichment] = useState<RouteEnrichmentResponse | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
      },
      () => {
        setUserLocation([21.4275, 42.0]);
        setLocationError("Could not detect your location — using Skopje as default.");
      }
    );
  }, []);

  const handleGenerate = async (km: number) => {
    if (!userLocation) return;
    setIsLoading(true);
    setError(null);
    setRoute(null);
    setEnrichment(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: userLocation[1],
          lng: userLocation[0],
          targetKm: km,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.route) {
        setError(data.error ?? "Route generation failed. Please try again.");
        return;
      }

      setRoute(data.route);

      // Kick off the AI enrichment fetch in the background
      setIsEnriching(true);
      fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route: data.route }),
      })
        .then((r) => r.json())
        .then((d: RouteEnrichmentResponse) => {
          if (d.success) {
            setEnrichment(d);
          } else {
            setEnrichment({ success: true, narrative: "Could not load route highlights.", stops: [] });
          }
        })
        .catch(() => {
          setEnrichment({ success: true, narrative: "Failed to load route highlights.", stops: [] });
        })
        .finally(() => {
          setIsEnriching(false);
        });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pacyr</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a random running loop from your location.
          </p>
        </div>

        {/* Location notice */}
        {locationError && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            {locationError}
          </p>
        )}

        {/* Map */}
        <RouteMap route={route} userLocation={userLocation} stops={enrichment?.stops} />

        {/* Input */}
        <KmInput onGenerate={handleGenerate} isLoading={isLoading} />

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Route stats + AI narrative */}
        {route && (
          <RouteCard
            route={route}
            description={enrichment?.narrative ?? null}
            isDescribing={isEnriching}
          />
        )}

        {/* Points of interest along the route */}
        {route && (isEnriching || (enrichment?.stops && enrichment.stops.length > 0)) && (
          <RouteStops stops={enrichment?.stops ?? []} isLoading={isEnriching} />
        )}
      </div>
    </main>
  );
}
