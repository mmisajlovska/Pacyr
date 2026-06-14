/**
 * Haversine distance between two coordinates in meters.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Return a bounding box [south, west, north, east] around a point.
 * radiusMeters determines the box size.
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusMeters: number
): [number, number, number, number] {
  const latDelta = (radiusMeters / 111320);
  const lngDelta = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  return [
    lat - latDelta,
    lng - lngDelta,
    lat + latDelta,
    lng + lngDelta,
  ];
}

/**
 * Calculate total polyline length in meters from an array of [lng, lat] coords.
 */
export function polylineLength(coords: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(
      coords[i - 1][1], coords[i - 1][0],
      coords[i][1], coords[i][0]
    );
  }
  return total;
}

/**
 * Computes a bounding box that contains all given route coordinates,
 * with a small padding (in degrees) so nearby POIs aren't missed.
 */
export function boundingBoxFromCoordinates(
  coordinates: [number, number][],
  paddingDegrees = 0.005
): { minLat: number; minLng: number; maxLat: number; maxLng: number } {
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  for (const [lng, lat] of coordinates) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return {
    minLat: minLat - paddingDegrees,
    minLng: minLng - paddingDegrees,
    maxLat: maxLat + paddingDegrees,
    maxLng: maxLng + paddingDegrees,
  };
}

/**
 * Downsamples a route polyline to roughly `count` evenly spaced points,
 * so we don't send thousands of coordinates to the LLM.
 */
export function sampleRoute(
  coordinates: [number, number][],
  count = 10
): { lat: number; lng: number }[] {
  if (coordinates.length <= count) {
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  const step = Math.floor(coordinates.length / count);
  const samples: { lat: number; lng: number }[] = [];
  for (let i = 0; i < coordinates.length; i += step) {
    const [lng, lat] = coordinates[i];
    samples.push({ lat, lng });
  }
  return samples;
}

/**
 * For a given point, finds the closest vertex on the route polyline and
 * returns the cumulative distance (in km, 1 decimal) along the route to reach it.
 */
export function distanceAlongRouteToPoint(
  coordinates: [number, number][],
  lat: number,
  lng: number
): number {
  let bestDist = Infinity;
  let bestCumulative = 0;
  let cumulative = 0;

  for (let i = 0; i < coordinates.length; i++) {
    const [segLng, segLat] = coordinates[i];
    const d = haversineDistance(lat, lng, segLat, segLng);
    if (d < bestDist) {
      bestDist = d;
      bestCumulative = cumulative;
    }
    if (i > 0) {
      cumulative += haversineDistance(
        coordinates[i - 1][1], coordinates[i - 1][0],
        segLat, segLng
      );
    }
  }

  return Math.round((bestCumulative / 1000) * 10) / 10;
}
