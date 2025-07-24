# MCP Toolbox: A "BusyBox" for Your LLM

A versatile, containerized server that provides a collection of essential utility tools for LLM clients, all accessible via the Model Context Protocol (MCP). This project is designed to be a simple, easy-to-deploy "swiss army knife" for your AI agents.

---

## For Humans 👋

This guide is for developers who want to quickly deploy and use a powerful set of pre-built tools with their MCP-compatible LLM client (like Cline).

### Features

*   **All-in-One:** A single, easy-to-deploy container with a wide range of common utilities.
*   **Lightweight:** Built on Node.js and Alpine Linux for a small footprint.
*   **Extensible:** Designed to be easily extended with new tools.
*   **Comprehensive Toolset:** Includes tools for basic utilities, data manipulation, and web interaction.

### Getting Started

#### Production (Published Image)

1.  **Prerequisites:** You'll need Docker installed.
2.  **Run the Server:** You can run the server directly from the published Docker image.
    ```bash
    docker run -d \
      -p 8049:8049 \
      -e GOOGLE_API_KEY="YOUR_API_KEY" \
      -e GOOGLE_CX="YOUR_SEARCH_ENGINE_ID" \
      ghcr.io/phippsy22/mcp-toolbox:latest
    ```

#### Local Development (Building from Source)

1.  **Prerequisites:** You'll need Docker and Docker Compose installed.
2.  **Configuration:**
    *   This project uses a local `.env` file for API keys. An example file is provided.
    *   Copy the example environment file to create your local configuration:
        ```bash
        cp .env.example .env
        ```
    *   Open the new `.env` file and add your Google Custom Search credentials. The server will run without these keys, but the `web_search` tool will not be functional.
3.  **Build and Run the Server:** Use Docker Compose to build and run the container. This will use the `docker-compose.yml` file in this directory.
    ```bash
    docker compose up --build
    ```
    The server will be available at `http://localhost:8050`.
4.  **Connect Your Client:** Configure your MCP client to connect to the server.
    *   For the **production image**, use port `8049`.
    *   For **local development**, use port `8050`.

    An example `cline_mcp_settings.json` entry for local development would look like this:
    ```json
    {
      "mcpServers": {
        "toolbox-mcp-local": {
          "autoApprove": [],
          "disabled": false,
          "timeout": 360,
          "type": "sse",
          "url": "http://localhost:8050/mcp"
        }
      }
    }
    ```
    Note that the `type` is explicitly set to `"sse"` for compatibility with the current Cline client.

---

## For Robots (and Power Users) 🤖

This section provides the technical details for programmatic interaction and customization.

### Docker Image

*   **Registry:** `ghcr.io`
*   **Image:** `ghcr.io/phippsy22/mcp-toolbox:latest`

### Service Endpoint

*   **URL:** `http://localhost:8049/mcp`
*   **Transport:** `sse` (Server-Sent Events)

### Tool Manifest

*   **`echo`**: A simple tool that returns the text it was given.
    *   Parameters: `text` (string)
*   **`time`**: Returns the current server time, optionally in a specific timezone.
    *   Parameters: `timezone` (string, optional)
*   **`random`**: Generates random data such as UUIDs, strings, or numbers.
    *   Parameters: `type` (enum: "uuid", "string", "number", optional, default: "uuid"), `length` (number, optional, default: 16), `min` (number, optional, default: 0), `max` (number, optional, default: 1)
*   **`encoder`**: Encodes a string using a specified format (base64 or url).
    *   Parameters: `text` (string), `format` (enum: "base64", "url")
*   **`decoder`**: Decodes a string from a specified format (base64 or url).
    *   Parameters: `text` (string), `format` (enum: "base64", "url")
*   **`calculator`**: Evaluates a mathematical expression.
    *   Parameters: `expression` (string)
*   **`web_fetch`**: Fetches content from a specified URL and converts it to a specified format.
    *   Parameters: `url` (string), `format` (enum: "text", "markdown", "json", optional, default: "text")
*   **`system_info`**: Provides information about the system environment.
    *   Parameters: None
*   **`web_search`**: Performs a web search using Google Custom Search.
    *   Parameters: `query` (string), `format` (enum: "json", "markdown", optional, default: "json")
