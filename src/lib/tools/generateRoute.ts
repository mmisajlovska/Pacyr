interface GenerateRouteParams {
  lat: number;
  lng: number;
  targetKm: number;
}

interface GenerateRouteResult {
  coordinates: [number, number][];
  totalMeters: number;
  error?: string;
}

// Convert degrees to radians
const toRad = (value: number) => (value * Math.PI) / 180;
// Convert radians to degrees
const toDeg = (value: number) => (value * 180) / Math.PI;

/**
 * Given a start point, distance, and bearing, calculate the destination coordinates.
 */
function getDestinationPoint(lat: number, lng: number, distanceMeters: number, bearingDegrees: number) {
  const R = 6371e3; // Earth's radius in meters
  const d = distanceMeters;
  
  const lat1 = toRad(lat);
  const lon1 = toRad(lng);
  const brng = toRad(bearingDegrees);
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d / R) +
    Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng)
  );
  
  const lon2 = lon1 + Math.atan2(
    Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1),
    Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    lat: toDeg(lat2),
    lng: toDeg(lon2)
  };
}

/**
 * Generates a closed-loop route of approximately the target distance
 * using the OSRM public routing API.
 */
export const generateRouteExecute = async ({ lat, lng, targetKm }: GenerateRouteParams): Promise<GenerateRouteResult> => {
  const targetMeters = targetKm * 1000;
  
  // Try up to 3 times with different random offsets to find a route that fits our target
  for (let attempt = 0; attempt < 3; attempt++) {
    // Shrink factor to account for road wiggles (roads are never perfectly straight)
    // We adjust the shrink factor slightly on each attempt to vary the radius if we missed
    const shrinkFactor = 0.85 + (attempt * 0.05); // e.g. 0.85, 0.90, 0.95
    const radiusMeters = (targetMeters / (2 * Math.PI)) * shrinkFactor;
    
    // Pick a random starting angle for the first waypoint
    const startAngle = Math.random() * 360;
    
    // Generate 3 waypoints forming a rough circle around the start point
    const wp1 = getDestinationPoint(lat, lng, radiusMeters, startAngle);
    const wp2 = getDestinationPoint(lat, lng, radiusMeters, startAngle + 120);
    const wp3 = getDestinationPoint(lat, lng, radiusMeters, startAngle + 240);
    
    // Format coordinates for OSRM: {longitude},{latitude} separated by semicolons
    const coordinatesString = `${lng},${lat};${wp1.lng},${wp1.lat};${wp2.lng},${wp2.lat};${wp3.lng},${wp3.lat};${lng},${lat}`;
    
    try {
      // Use the OSRM Foot profile
      const url = `https://router.project-osrm.org/route/v1/foot/${coordinatesString}?geometries=geojson&overview=full&continue_straight=true`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "PacyrRouteGenerator/1.0"
        }
      });
      
      if (!res.ok) {
        if (attempt === 2) return { error: `OSRM API error: ${res.status}`, coordinates: [], totalMeters: 0 };
        continue;
      }
      
      const data = await res.json();
      
      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        if (attempt === 2) return { error: "No walkable route found by OSRM.", coordinates: [], totalMeters: 0 };
        continue;
      }
      
      const route = data.routes[0];
      const actualDistance = route.distance; // distance in meters
      const coords = route.geometry.coordinates; // array of [lng, lat]
      
      // Check if distance is acceptable (e.g., within 25% of target)
      const isWithinTolerance = actualDistance > targetMeters * 0.75 && actualDistance < targetMeters * 1.25;
      
      // If it's a good distance, or we're on the last attempt, return it
      if (isWithinTolerance || attempt === 2) {
        return {
          coordinates: coords,
          totalMeters: Math.round(actualDistance)
        };
      }
    } catch (err: any) {
      if (attempt === 2) return { error: `Routing failed: ${err.message}`, coordinates: [], totalMeters: 0 };
    }
  }
  
  return { error: "Failed to generate a valid route.", coordinates: [], totalMeters: 0 };
};
