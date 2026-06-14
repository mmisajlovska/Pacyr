import { z } from "zod";

export const RouteEnrichmentSchema = z.object({
  theme: z.string(),
  narrative: z.string(),
  stops: z
    .array(
      z.object({
        name: z.string(),
        lat: z.number(),
        lng: z.number(),
        category: z.string(),
        whatYoullSee: z.string(),
        fact: z.string().nullable(),
      })
    )
    .max(6),
});

export type RouteEnrichment = z.infer<typeof RouteEnrichmentSchema>;