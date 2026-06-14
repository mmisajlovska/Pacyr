import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GeneratedRoute } from "@/types/route";
import { Sparkles } from "lucide-react";

interface RouteCardProps {
  route: GeneratedRoute;
  description?: string | null;
  isDescribing?: boolean;
}

export function RouteCard({ route, description, isDescribing }: RouteCardProps) {
  const km = (route.totalDistanceMeters / 1000).toFixed(2);
  const pace = "5:30 /km"; // static for now

  return (
    <Card className="w-full border-indigo-100 shadow-sm">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Generated route</p>
            <h2 className="text-lg font-semibold">{route.routeName}</h2>
          </div>
          <Badge variant="secondary">Loop</Badge>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          <Stat label="Distance" value={`${km} km`} />
          <Stat label="Est. time" value={`${route.estimatedDurationMinutes} min`} />
          <Stat label="Pace" value={pace} />
          <Stat label="Calories" value={`${route.estimatedCalories} kcal`} />
        </div>

        {/* AI Route Description Box */}
        {(isDescribing || description) && (
          <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4 text-indigo-500" />
              <p className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">AI Course Guide</p>
            </div>
            {isDescribing ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-indigo-100/60 rounded w-full"></div>
                <div className="h-3 bg-indigo-100/60 rounded w-5/6"></div>
                <div className="h-3 bg-indigo-100/60 rounded w-4/6"></div>
              </div>
            ) : (
              <p className="text-sm text-indigo-900/80 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">Surface profile</p>
          {route.surfaceProfile.map((seg) => (
            <div key={seg.segmentIndex} className="flex items-center justify-between text-sm">
              <span className="capitalize">{seg.type}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {(seg.distanceMeters / 1000).toFixed(1)} km
                </span>
                <Badge
                  variant={
                    seg.safetyRating === "High"
                      ? "default"
                      : seg.safetyRating === "Medium"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-[10px] px-1.5 py-0"
                >
                  {seg.safetyRating}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-3 text-center">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}
