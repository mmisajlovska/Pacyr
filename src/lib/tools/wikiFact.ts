import { FunctionTool } from "@google/adk";
import { z } from "zod";

export const getWikiFactExecute = async ({ title }: { title: string }) => {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { "User-Agent": "PacyrApp/1.0 (contact@pacyr.com)" } }
    );
    if (!res.ok) return { fact: null };
    const data = await res.json();
    if (!data.extract || data.type === "disambiguation") return { fact: null };
    return { fact: data.extract as string };
  } catch {
    return { fact: null };
  }
};

export const wikiFactTool = new FunctionTool({
  name: "get_wiki_fact",
  description:
    "Fetches a short factual summary from Wikipedia for a named place, monument, or landmark. Returns { fact: string | null }. Use this to ground facts about real-world points of interest before including them in the route guide. If it returns null, do not invent a fact for that place.",
  parameters: z.object({
    title: z.string().describe("The exact name of the place/landmark as it would appear on Wikipedia."),
  }),
  execute: getWikiFactExecute,
});