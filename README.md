# Pacyr

Pacyr is an AI-powered running route generator that creates personalized running loops based on the user's current location and desired distance.

The application combines real-world geographic data from OpenStreetMap with Google's Gemini AI to create routes that are not only suitable for running, but also highlight interesting places, monuments, and landmarks along the way.

---

## How It Works

1. The user allows location access.
2. The user selects a desired running distance.
3. Pacyr generates a looped running route that starts and ends at the user's current location.
4. OpenStreetMap data is used to discover landmarks and points of interest around the route.
5. A Gemini-powered AI agent analyzes the route and generates a personalized route guide.
6. The map displays the route together with notable locations that the runner will encounter during the run.

The result is a running experience that combines fitness, exploration, and artificial intelligence.

---

## Route Generation

Routes are generated using OpenStreetMap road and path data through OSRM (Open Source Routing Machine).

The generated route:

* Starts from the user's current location
* Returns to the starting location
* Follows real walkable roads and paths
* Attempts to match the selected distance as closely as possible

Users can generate routes ranging from short daily runs to long-distance training sessions.

---

## AI-Powered Route Guide

After a route is generated, an AI agent enriches the route with contextual information.

The agent:

* Analyzes the generated route
* Identifies notable landmarks
* Retrieves additional geographic information
* Generates route descriptions
* Provides interesting facts about locations along the route

Each generated route can have a different theme depending on the discovered landmarks and surrounding environment.

Examples include:

* Historical routes
* Cultural routes
* Scenic routes
* Architecture-focused routes
* Hidden gems routes

---

## MCP Integration

Pacyr uses an OpenStreetMap MCP (Model Context Protocol) server to give the AI agent access to live geographic data.

Instead of relying only on information already known by the language model, the agent can actively query OpenStreetMap while generating route information.

The MCP server allows the AI to:

* Search for landmarks
* Discover monuments
* Retrieve historic locations
* Find points of interest
* Gather contextual information about the route

This creates a true agentic workflow where the AI can use tools to gather information before generating its response.

---

## Wikipedia Fact Enrichment

For landmarks that can be matched to Wikipedia entries, the AI agent retrieves factual information directly from Wikipedia.

This helps ensure that route facts are grounded in real-world information rather than generated entirely from the model's memory.

If a landmark does not have a reliable source available, the system avoids inventing facts and simply provides a description of what the runner will see.

---

## Technology Stack

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* MapLibre GL

### Geographic Services

* OpenStreetMap
* OSRM
* Overpass API
* Nominatim

### Artificial Intelligence

* Google Gemini
* Google ADK (Agent Development Kit)
* OpenStreetMap MCP Server

---

## Running the Project

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

A valid Gemini API key is required for AI route enrichment.

---

### 3. Start the OpenStreetMap MCP Server

The AI agent communicates with OpenStreetMap through an MCP server.

Before starting the application, ensure that the MCP server can run:

```bash
uvx osm-mcp-server
```

If the server starts successfully, MCP is correctly installed and available on your system.

You can stop it afterward with `Ctrl + C`.

---

### 4. Start the Application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Testing MCP + AI Integration

To verify that the complete AI workflow is functioning:

### Generate a Route

1. Open the application.
2. Allow location access.
3. Select a distance.
4. Generate a route.

---

### Verify Route Generation

You should see:

* A blue running route on the map.
* Route statistics.
* Generated route information.

This confirms that OpenStreetMap routing is working correctly.

---

### Verify MCP Interaction

Check the server console while generating a route.

You should see logs showing:

* RouteEnricherAgent execution
* MCP tool discovery
* MCP tool calls
* Gemini requests

Examples include:

```text
Processing request of type ListToolsRequest
```

and

```text
Sending out request, model: gemini-2.0-flash
```

These indicate that the AI agent successfully connected to the OpenStreetMap MCP server.

---

### Verify Wikipedia Enrichment

If landmarks are discovered:

* Purple markers should appear on the map.
* The route guide should contain landmark descriptions.
* Some landmarks may include historical facts sourced from Wikipedia.

This confirms that the AI agent successfully combined:

* OpenStreetMap data
* MCP tool usage
* Wikipedia enrichment
* Gemini-generated route descriptions

---

## Future Improvements

Potential future enhancements include:

* Real-time audio route guidance
* Weather-aware route generation
* Elevation analysis
* Surface-aware route recommendations
* Route difficulty scoring
* Fitness tracker integration
* Route saving and sharing
* Personalized AI coaching

---

## Project Goal

Pacyr demonstrates how Large Language Models, MCP servers, and geographic data can be combined to create an intelligent and interactive running experience.

Rather than simply generating a route, Pacyr helps runners discover and learn about the places they pass along the way.
