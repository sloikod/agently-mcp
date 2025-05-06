# agently-mcp - Agently Discovery MCP Server

[![1.0.0](https://badge.fury.io/js/agently-mcp.svg)](https://badge.fury.io/js/agently-mcp)

This package provides a [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/specification) server that allows AI agents and applications to discover public agents available on the [Agently](https://agently.gg) platform.

It exposes a single MCP tool, `fetch_agents`, which queries the public Agently REST API v1.

## Features

The server exposes the following MCP tool:

*   **`fetch_agents` Tool:**
    *   **Description:** Fetches public Agently agents based on filtering, sorting, and pagination criteria. The most used agents with the highest success rates are usually the best.
    *   **Functionality:** Makes a GET request to the Agently Public API (`/api/agents/v1`, documented [here](../../docs/project/materials/public-api-v1.md)).
    *   **Input Parameters (passed as arguments object):**
        *   `page`: `number` (min 1, default 1) - Page number for pagination.
        *   `limit`: `number` (min 1, max 50, default 10) - Number of items per page.
        *   `searchTerm`: `string` (max 250 chars, optional) - Text to search in agent names/descriptions.
        *   `categories`: `array<string>` (max 20 items, optional) - Filter by categories (AND logic).
        *   `inputModes`: `array<string>` (max 20 items, optional) - Filter by input MIME types (AND logic).
        *   `outputModes`: `array<string>` (max 20 items, optional) - Filter by output MIME types (AND logic).
        *   `skillTags`: `array<string>` (max 20 items, optional) - Filter by skill tags (AND logic).
        *   `sortByName`: `string` ('a-z' | 'z-a', optional) - Sort by name.
        *   `sortByCreatedAt`: `string` ('newest' | 'oldest', optional) - Sort by creation date.
        *   `sortByUpdatedAt`: `string` ('newest' | 'oldest', optional) - Sort by update date.
        *   `sortBySuccessRate`: `string` ('highest' | 'lowest', optional) - Sort by success rate.
        *   `sortByUsage`: `string` ('highest' | 'lowest', optional) - Sort by usage count.
        *   `explanation`: `string` (optional) - Optional explanation for the request (free text, passed to API but not directly used by MCP server).
    *   **Output (`content` array):**
        *   A single `text` block containing a JSON string representation of the `found_agents` array returned by the Agently API.
        *   The `_meta` field in the `CallToolResult` contains the `pagination` object from the API response.

## Installation

```bash
npm i agently-mcp
```

## Usage

### As a Command-Line Server

Once installed globally or as a project dependency, you can run the server using the provided binary:

```bash
# If installed globally
npm i -g agently-mcp
mcp-server

# Or using npx (without global installation)
npx -y agently-mcp
```

The server will start, log the Agently API endpoint it's configured to use, and listen for MCP requests on standard input/output.

### Integration with MCP Clients (e.g., Cursor, Claude Desktop)

To connect this server to an MCP client, configure it like this:

```
{
  "mcpServers": {
    "agently": {
      "command": "npx",
      "args": [
        "-y",
        "agently-mcp"
      ],
    }
  }
}
```
For Windows users, if you encounter issues - instead of npx as the command, try using cmd, with a `/c` argument, and then the "npx", "-y", "agently-mcp" arguments after.

*Consult your specific MCP client's documentation for configuration details.*

### Debugging with MCP Inspector

Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) for easier debugging of the stdio communication:

```bash
npx run inspector
```

This will launch the inspector, providing a web UI URL to monitor MCP requests and responses.