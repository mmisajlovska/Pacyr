import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RouteStop } from "@/types/route";
import { MapPin, Sparkles } from "lucide-react";

interface RouteStopsProps {
  stops: RouteStop[];
  isLoading?: boolean;
}

export function RouteStops({ stops, isLoading }: RouteStopsProps) {
  if (isLoading) {
    return (
      <Card className="w-full border-indigo-100 shadow-sm">
        <CardContent className="pt-5 space-y-3 animate-pulse">
          <div className="h-3 bg-indigo-100/60 rounded w-1/3"></div>
          <div className="h-14 bg-indigo-100/40 rounded"></div>
          <div className="h-14 bg-indigo-100/40 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!stops || stops.length === 0) return null;

  return (
    <Card className="w-full border-indigo-100 shadow-sm">
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="size-4 text-indigo-500" />
          <p className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">Along the way</p>
        </div>
        <div className="space-y-4">
          {stops.map((stop, i) => (
            <div key={`${stop.name}-${i}`} className="border-l-2 border-indigo-100 pl-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{stop.name}</p>
                <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">
                  {stop.distanceAlongRouteKm.toFixed(1)} km
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1 capitalize">{stop.category}</p>
              <p className="text-sm leading-relaxed mb-1">{stop.whatYoullSee}</p>
              {stop.fact && (
                <div className="flex items-start gap-1.5 mt-1.5 text-xs text-indigo-900/70 bg-indigo-50/60 rounded-lg px-2 py-1.5">
                  <Sparkles className="size-3 mt-0.5 shrink-0 text-indigo-400" />
                  <span>{stop.fact}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}