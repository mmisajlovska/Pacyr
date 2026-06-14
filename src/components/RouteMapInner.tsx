"use client";

import { Map, MapRoute, MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import { GeneratedRoute, RouteStop } from "@/types/route";

interface Props {
  route: GeneratedRoute | null;
  userLocation: [number, number] | null;
  stops?: RouteStop[];
}

export default function RouteMapInner({ route, userLocation, stops }: Props) {
  const center = route?.coordinates[0] ?? userLocation ?? [21.4275, 42.0];
  const zoom = route ? 13 : 12;

  return (
    <Map center={center} zoom={zoom}>
      {route && (
        <MapRoute
          coordinates={route.coordinates}
          color="#6366f1"
          width={5}
          opacity={0.9}
        />
      )}

      {/* Start/end pin */}
      {route && (
        <MapMarker longitude={route.coordinates[0][0]} latitude={route.coordinates[0][1]}>
          <MarkerContent>
            <div className="flex size-5 items-center justify-center rounded-full bg-indigo-500 border-2 border-white shadow-lg text-[10px] font-bold text-white">
              S
            </div>
          </MarkerContent>
          <MarkerTooltip>Start / Finish</MarkerTooltip>
        </MapMarker>
      )}

      {/* Points of interest along the route */}
      {stops?.map((stop, i) => (
        <MapMarker key={`${stop.name}-${i}`} longitude={stop.lng} latitude={stop.lat}>
          <MarkerContent>
            <div className="flex size-5 items-center justify-center rounded-full bg-purple-500 border-2 border-white shadow-lg text-[10px] font-bold text-white">
              {i + 1}
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-xs max-w-[200px] p-1">
              <p className="font-semibold mb-0.5">{stop.name}</p>
              <p className="text-muted-foreground">{stop.whatYoullSee}</p>
            </div>
          </MarkerTooltip>
        </MapMarker>
      ))}

      {/* User location dot */}
      {userLocation && !route && (
        <MapMarker longitude={userLocation[0]} latitude={userLocation[1]}>
          <MarkerContent>
            <div className="size-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse" />
          </MarkerContent>
          <MarkerTooltip>You are here</MarkerTooltip>
        </MapMarker>
      )}
    </Map>
  );
}
