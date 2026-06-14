export interface Coordinate {
  lat: number;
  lng: number;
}

export interface RouteSegment {
  segmentIndex: number;
  type: "asphalt" | "concrete" | "gravel" | "path" | "track" | "unknown";
  safetyRating: "High" | "Medium" | "Low";
  distanceMeters: number;
}

export interface GeneratedRoute {
  coordinates: [number, number][]; // [lng, lat] — GeoJSON order for MapLibre
  totalDistanceMeters: number;
  estimatedDurationMinutes: number;
  estimatedCalories: number;
  routeName: string;
  startNodeName: string;
  surfaceProfile: RouteSegment[];
}

export interface GenerateRequest {
  lat: number;
  lng: number;
  targetKm: number;
}

export interface GenerateResponse {
  success: boolean;
  route?: GeneratedRoute;
  error?: string;
}
<<<<<<< HEAD

export interface RouteStop {
  name: string;
  lat: number;
  lng: number;
  category: string;
  whatYoullSee: string;
  fact: string | null;
  distanceAlongRouteKm: number;
}

export interface RouteEnrichmentResponse {
  success: boolean;
  theme?: string | null;
  narrative?: string;
  stops?: RouteStop[];
  error?: string;
}
=======
>>>>>>> 6120387f49a613f810d457bc6a4ef65abf64b676
