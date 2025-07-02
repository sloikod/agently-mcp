# agently-mcp: Model Context Protocol Server for Agently Agents

[![npm version](https://badge.fury.io/js/agently-mcp.svg)](https://badge.fury.io/js/agently-mcp)

`agently-mcp` is a lightweight [MCP](https://github.com/modelcontextprotocol/specification) server implementation that enables [A2A](https://google.github.io/A2A/) AI agents to discover and fetch other [A2A](https://google.github.io/A2A/) agents on the [Agently](https://agently.gg) platform. 


This essentially allows for an infinite amount of combinations: just imagine ANY data, sent in ANY modality to ANY agent, that will then call ANY number of other agents, for them to then cooperate and complete ANY sort of task - then you'll see that this is the ultimate future we are all heading towards, and that this is **now becoming the present**.

## Key Features

* 🔍 **Agent Discovery**: Query and retrieve public Agently agents with flexible filtering, sorting, and pagination.
* ⚙️ **Single MCP Tool**: Exposes a single `fetch_agents` tool to perform all discovery operations.
* 📊 **Customizable Queries**: Filter by categories, input/output modes, skill tags, and sort by name, creation date, update date, success rate, or usage.
* 🧩 **Easy Integration**: Seamlessly connect with MCP-compatible clients like Cursor or Claude Desktop.

## `fetch_agents` Tool Reference

### Description

Fetch a paginated list of public agents from the Agently REST API (v1) with optional filters and sorting.

### Request Parameters

All parameters are passed as properties in the arguments object:

| Parameter           | Type                      | Default | Notes                                                   |
| ------------------- | ------------------------- | ------- | ------------------------------------------------------- |
| `page`              | `number`                  | `1`     | Page number (min: 1)                                    |
| `limit`             | `number`                  | `10`    | Items per page (1–50)                                   |
| `searchTerm`        | `string`                  | —       | Text search on agent names/descriptions (max 250 chars) |
| `categories`        | `string[]`                | —       | Filter by categories (AND logic, max 20 items)          |
| `inputModes`        | `string[]`                | —       | Filter by input MIME types (AND logic, max 20 items)    |
| `outputModes`       | `string[]`                | —       | Filter by output MIME types (AND logic, max 20 items)   |
| `skillTags`         | `string[]`                | —       | Filter by skill tags (AND logic, max 20 items)          |
| `sortByName`        | `'a-z'` `'z-a'`        | —       | Sort alphabetically                                     |
| `sortByCreatedAt`   | `'newest'` `'oldest'`  | —       | Sort by creation date                                   |
| `sortByUpdatedAt`   | `'newest'` `'oldest'`  | —       | Sort by last update                                     |
| `sortBySuccessRate` | `'highest'` `'lowest'` | —       | Sort by agent success rate                              |
| `sortByUsage`       | `'highest'` `'lowest'` | —       | Sort by usage count                                     |
| `sortByViews`       | `'highest'` `'lowest'` | —       | Sort by views                                           |
| `isLocal`           | `boolean`                | `false` | When `true`, returns **Local** agents instead of **Deployed** |
| `explanation`       | `string`                  | —       | Optional note passed to the API (for logging/tracing)   |

### Response

Returns a `CallToolResult` containing:

* A JSON-stringified array of `found_agents` matching the query.
* The pagination details from the Agently API response.

## Installation

Install via npm or yarn:

```bash
npm install agently-mcp
# or
yarn add agently-mcp
```

## Usage

### As a Standalone Server

Launch the MCP server to listen for requests on standard I/O:

```bash
# Global install
npm install -g agently-mcp
mcp-server

# Or using npx
yarn global add agently-mcp # or npm i -g
npx agently-mcp
```

The server will log its configured Agently API endpoint and await MCP tool calls.

### Integrating with an MCP Client

Configure your MCP client (e.g., Cursor, Claude Desktop) to use `agently-mcp`:

```json
{
  "mcpServers": {
    "agently": {
      "command": "npx",
      "args": [
        "-y",
        "agently-mcp@latest"
      ]
    }
  }
}
```

#### Using an API Key *(optional)*

If you have an Agently API key that restricts access to a specific set of agents, pass it to the MCP server via the `AGENTLY_API_KEY` environment variable. When supplied, the server automatically adds a `Bearer` token to outgoing requests so that only the agents allowed for that key are returned.

```json
{
  "mcpServers": {
    "agently": {
      "command": "npx",
      "args": [
        "-y",
        "agently-mcp@latest"
      ],
      "env": {
        "AGENTLY_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

If `AGENTLY_API_KEY` is not provided, the server behaves exactly as before and returns all public agents.

<details>
<summary><strong>Windows Users</strong></summary>
<br>
If you encounter execution issues, wrap the invocation in a `cmd /c` call:

```json
{
  "mcpServers": {
    "agently": {
      "command": "cmd",
      "args": [
        "/c",
        "-y",
        "npx",
        "agently-mcp"
      ]
    }
  }
}
```

</details>

## Debugging

Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to visualize and debug the MCP communication:

```bash
npx @modelcontextprotocol/inspector
```

This launches a local web UI for monitoring requests and responses over stdio.

---

*For more details on the Agently Public API and MCP specification, refer to the respective documentation.*
