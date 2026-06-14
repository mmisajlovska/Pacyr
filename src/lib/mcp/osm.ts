import { MCPToolset } from "@google/adk";

/**
 * Connects to the OpenStreetMap MCP server (osm-mcp-server) via stdio.
 * Requires `uv`/`uvx` to be installed and available on PATH:
 * https://docs.astral.sh/uv/getting-started/installation/
 *
 * No API key required — wraps free OSM services (Overpass, Nominatim, OSRM).
 */
export const osmMcpToolset = new MCPToolset({
  type: "StdioConnectionParams",
  serverParams: {
    command: "uvx",
    args: ["osm-mcp-server"],
  },
});