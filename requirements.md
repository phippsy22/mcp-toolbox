# MCP Toolbox: requirements.md

This document outlines the functional, UI/UX, and non-functional requirements for the initial version of the MCP Toolbox, which includes the **Echo** and **Time** tools.

---

## Functional Requirements

### Echo Tool

*   **User Story:** As a developer, I want to send a string to the toolbox so that I can receive the exact same string back, confirming the connection and data integrity.

    *   **FR-ECHO-1: Echo a standard string**
        *   `WHEN` the `echo` tool is called with a non-empty string argument (e.g., "hello world"),
        *   `THE SYSTEM SHALL` return a successful response containing the identical string "hello world".

    *   **FR-ECHO-2: Echo an empty string**
        *   `WHEN` the `echo` tool is called with an empty string argument (""),
        *   `THE SYSTEM SHALL` return a successful response containing an empty string.

### Time Tool

*   **User Story:** As a developer, I want to get the current time from the toolbox so that I can use it in my workflow without needing a separate time service.

    *   **FR-TIME-1: Get current time in UTC**
        *   `WHEN` the `time` tool is called without a timezone argument,
        *   `THE SYSTEM SHALL` return the current server time formatted as a full ISO 8601 string in the UTC timezone (e.g., "2023-10-27T10:00:00.000Z").

    *   **FR-TIME-2: Get current time in a specific timezone**
        *   `WHEN` the `time` tool is called with a valid IANA timezone name (e.g., "America/New_York"),
        *   `THE SYSTEM SHALL` return the current server time formatted as a full ISO 8601 string, adjusted for that timezone.

    *   **FR-TIME-3: Handle invalid timezone**
        *   `WHEN` the `time` tool is called with an invalid or unrecognized timezone name (e.g., "Mars/Olympus_Mons"),
        *   `THE SYSTEM SHALL` return an error response indicating that the provided timezone is invalid.

---

## UI/UX Requirements

*   **UI-UX-1: Programmatic Interface**
    *   There are no visual UI/UX requirements. The tools are designed for programmatic use via the MCP, and their interfaces are defined by their input and output schemas.

---

## Non-Functional Requirements

*   **NFR-1: Performance**
    *   `WHEN` any tool is called,
    *   `THE SYSTEM SHALL` respond in under 500 milliseconds, assuming a standard network connection.

*   **NFR-2: Reliability**
    *   The MCP server `SHALL` be configured to restart automatically (`restart: unless-stopped`) if it crashes.

*   **NFR-3: Security**
    *   The `echo` tool `SHALL` treat all input as literal text and must not evaluate or execute any part of the input string to prevent injection attacks.
