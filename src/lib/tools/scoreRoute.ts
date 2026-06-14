export const scoreRouteExecute = async ({ coordinates, totalMeters, cityName }: {
  coordinates: [number, number][];
  totalMeters: number;
  cityName?: string;
}) => {
  const city = cityName ?? "City";
  const durationMinutes = Math.round((totalMeters / 1000 / 5) * 60); // assumes 5km/h pace
  const estimatedCalories = Math.round((totalMeters / 1000) * 65); // approx 65 kcal per km

  // Simplified surface profile placeholder — a future improvement would
  // derive this from real OSM way tags along the route.
  const surfaceProfile = [
    {
      segmentIndex: 0,
      type: "asphalt" as const,
      safetyRating: "High" as const,
      distanceMeters: Math.round(totalMeters * 0.6),
    },
    {
      segmentIndex: 1,
      type: "concrete" as const,
      safetyRating: "High" as const,
      distanceMeters: Math.round(totalMeters * 0.3),
    },
    {
      segmentIndex: 2,
      type: "path" as const,
      safetyRating: "Medium" as const,
      distanceMeters: Math.round(totalMeters * 0.1),
    },
  ];

  const km = (totalMeters / 1000).toFixed(1);
  const names = [
    `The ${city} Arc`,
    `${city} Loop ${km}K`,
    `The ${city} Circuit`,
    `${city} Ring Route`,
    `The ${km}K ${city} Loop`,
  ];
  const routeName = names[Math.floor(Math.random() * names.length)];

  return {
    coordinates,
    routeName,
    totalDistanceMeters: totalMeters,
    estimatedDurationMinutes: durationMinutes,
    estimatedCalories,
    surfaceProfile,
  };
};
