# MCP Toolbox: tasks.md

This document breaks down the work required to implement the MCP Toolbox based on the `design.md` and `requirements.md` files.

---

### **Phase 1: Project Scaffolding**

*   **Task 1.1: Create Project Directory**
    *   **Description:** Create the `mcps/toolbox-mcp-container` directory.
    *   **Dependencies:** None.
    *   **Effort:** S
    *   **Verification:** The directory exists.
    *   **Status:** Done.

*   **Task 1.2: Initialize Node.js Project**
    *   **Description:** Create a `package.json` file for the new server. It should be configured as an ES Module (`"type": "module"`) and include dependencies for `express`, `zod`, and `@modelcontextprotocol/sdk`.
    *   **Dependencies:** 1.1
    *   **Effort:** S
    *   **Verification:** The `package.json` file is created with the correct content.

*   **Task 1.3: Configure TypeScript**
    *   **Description:** Create a `tsconfig.json` file with the modern ESM-compatible settings as defined in the `design.md`.
    *   **Dependencies:** 1.1
    *   **Effort:** S
    *   **Verification:** The `tsconfig.json` file is created with the correct content.

*   **Task 1.4: Create Source Directory**
    *   **Description:** Create the `src` directory and an initial, empty `index.ts` file within it.
    *   **Dependencies:** 1.1
    *   **Effort:** S
    *   **Verification:** The `src/index.ts` file exists.

---

### **Phase 2: Server Implementation**

*   **Task 2.1: Implement Basic Express Server**
    *   **Description:** Write the basic Express server setup in `src/index.ts`, including the MCP server instantiation and the legacy SSE transport handlers, based on the successful `sleep-mcp-container` implementation.
    *   **Dependencies:** 1.4
    *   **Effort:** M
    *   **Verification:** The `index.ts` file contains the core server logic.

*   **Task 2.2: Implement Echo Tool**
    *   **Description:** Register the `echo` tool with the MCP server, including its schema and implementation logic.
    *   **Dependencies:** 2.1
    *   **Effort:** S
    *   **Verification:** The `echo` tool is registered in `index.ts`.

*   **Task 2.3: Implement Time Tool**
    *   **Description:** Register the `time` tool with the MCP server, including its schema and implementation logic. The logic must handle the optional `timezone` parameter.
    *   **Dependencies:** 2.1
    *   **Effort:** M
    *   **Verification:** The `time` tool is registered in `index.ts`.

---

### **Phase 3: Containerization and Deployment**

*   **Task 3.1: Create Dockerfile**
    *   **Description:** Create a `Dockerfile` for the toolbox server, using the `node:20-alpine` base image and a single-stage build process.
    *   **Dependencies:** 1.2, 1.3
    *   **Effort:** S
    *   **Verification:** The `Dockerfile` is created in the project root.

*   **Task 3.2: Update Docker Compose**
    *   **Description:** Add a new service named `toolbox-mcp` to the `compose/mcps/docker-compose.yml` file. It should be configured to build from the new `toolbox-mcp-container` directory and expose a unique port (e.g., 8049).
    *   **Dependencies:** 3.1
    *   **Effort:** S
    *   **Verification:** The `docker-compose.yml` file is updated.

*   **Task 3.3: Build and Run Container**
    *   **Description:** Build and run the new `toolbox-mcp` container using `docker compose`.
    *   **Dependencies:** 3.2
    *   **Effort:** M
    *   **Verification:** The container starts successfully without build errors.

---

### **Phase 4: Verification**

*   **Task 4.1: Update Cline Settings**
    *   **Description:** Add a new server configuration for `toolbox-mcp` to the `cline_mcp_settings.json` file, pointing to the new container's port.
    *   **Dependencies:** 3.3
    *   **Effort:** S
    *   **Verification:** The settings file is updated.

*   **Task 4.2: Test Echo Tool**
    *   **Description:** Use the `use_mcp_tool` command to call the `echo` tool and verify that it returns the correct output.
    *   **Dependencies:** 4.1
    *   **Effort:** S
    *   **Verification:** The tool call is successful.

*   **Task 4.3: Test Time Tool**
    *   **Description:** Use the `use_mcp_tool` command to call the `time` tool (both with and without a timezone) and verify that it returns the correct output.
    *   **Dependencies:** 4.1
    *   **Effort:** S
    *   **Verification:** The tool call is successful.
