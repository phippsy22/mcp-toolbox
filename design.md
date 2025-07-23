# MCP Toolbox: design.md

This document provides the technical design for the MCP Toolbox, based on the requirements outlined in `requirements.md`.

---

## 1. Architecture Overview

The MCP Toolbox will be a single Node.js application running within a Docker container. It will use the Express.js framework to create an HTTP server and the `@modelcontextprotocol/sdk` to implement the MCP interface.

The server will expose a single MCP endpoint that provides access to a collection of tools. The initial tools will be `echo` and `time`. The architecture will be modular, allowing for the easy addition of new tools in the future. We will reuse the successful legacy SSE transport implementation from the `sleep-mcp-container`.

```mermaid
graph TD
    A[Cline Client] -- HTTP POST /mcp/messages --> B{Express Server};
    A -- HTTP GET /mcp --> B;
    B -- Uses --> C[@modelcontextprotocol/sdk];
    C -- Manages --> D{Tool Registry};
    D -- Contains --> E[Echo Tool];
    D -- Contains --> F[Time Tool];
```

## 2. Data Flow

The data flow for a tool call will follow the standard MCP SSE transport pattern:

1.  **Connection:** The Cline client initiates an HTTP `GET` request to the `/mcp` endpoint to establish a persistent SSE connection.
2.  **Session:** The server creates a new `SSEServerTransport` instance and a unique session ID for the client.
3.  **Tool Call:** The client sends an HTTP `POST` request to the `/mcp/messages` endpoint, containing the tool call payload (e.g., `{ "tool": "echo", "input": { "text": "hello" } }`).
4.  **Execution:** The server's `McpServer` instance receives the payload, looks up the `echo` tool in its registry, and executes it with the provided input.
5.  **Response:** The tool's output is sent back to the client as a message on the open SSE connection.

## 3. Data Models

There are no database or persistent data models for this feature. All operations are stateless.

## 4. API Endpoints

The server will expose two HTTP endpoints:

*   ### `GET /mcp`
    *   **Description:** Establishes the Server-Sent Events (SSE) connection for a new session.
    *   **Response:**
        *   `200 OK` with `Content-Type: text/event-stream`. The connection is held open for the server to push messages.

*   ### `POST /mcp/messages`
    *   **Description:** Executes a tool call within an established session.
    *   **Query Parameters:**
        *   `sessionId` (string, required): The session ID obtained from the initial connection.
    *   **Request Body:** The standard MCP tool call JSON payload.
    *   **Response:**
        *   `202 Accepted`: Indicates the message was received and is being processed. The actual result will be sent over the SSE stream.
        *   `400 Bad Request`: If the `sessionId` is missing or no transport is found for the session.

## 5. Tool Schemas

### `echo`
*   **Title:** Echo Tool
*   **Description:** A simple tool that returns the text it was given.
*   **Input Schema (`zod`):**
    ```typescript
    z.object({
      text: z.string().describe("The text to echo back."),
    })
    ```

### `time`
*   **Title:** Time Tool
*   **Description:** Returns the current server time, optionally in a specific timezone.
*   **Input Schema (`zod`):**
    ```typescript
    z.object({
      timezone: z.string().optional().describe("An optional IANA timezone name (e.g., 'America/New_York'). Defaults to UTC."),
    })
    ```

## 6. Security Considerations

*   **Authentication & Authorization:** None. The toolbox is intended for use in a trusted environment.
*   **Data Validation:** Input validation will be strictly enforced by the `zod` schemas for each tool. Any input that does not conform to the schema will be rejected by the MCP server.
*   **Error Handling:** The server will use standard HTTP status codes for connection errors. Tool-specific errors (e.g., invalid timezone) will be returned as structured error messages within the MCP response payload.

## 7. Unit Testing Strategy

*   Unit tests will be written for each tool's implementation logic.
*   For the `time` tool, tests will mock the system clock to ensure deterministic results.
*   Tests will cover both successful execution and error conditions (e.g., providing an invalid timezone to the `time` tool).
