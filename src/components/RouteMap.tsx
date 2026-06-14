"use client";

import dynamic from "next/dynamic";
import { GeneratedRoute, RouteStop } from "@/types/route";

const MapComponents = dynamic(
  () => import("./RouteMapInner"),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-xl" /> }
);

interface RouteMapProps {
  route: GeneratedRoute | null;
  userLocation: [number, number] | null;
  stops?: RouteStop[];
}

export function RouteMap({ route, userLocation, stops }: RouteMapProps) {
  return (
    <div className="w-full h-[480px] rounded-xl overflow-hidden border">
      <MapComponents route={route} userLocation={userLocation} stops={stops} />
    </div>
  );
}
