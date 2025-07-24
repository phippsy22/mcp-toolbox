import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { evaluate } from "mathjs";
import fetch from "node-fetch";
import TurndownService from "turndown";
import { htmlToText } from "html-to-text";
import * as cheerio from "cheerio";
import os from "node:os";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(
    JSON.stringify(
      {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
      },
      null,
      2
    )
  );
  next();
});

const server = new McpServer({
  name: "toolbox-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "echo",
  {
    title: "Echo Tool",
    description: "A simple tool that returns the text it was given.",
    inputSchema: {
      text: z.string().describe("The text to echo back."),
    },
  },
  async ({ text }) => {
    return {
      content: [{ type: "text", text }],
    };
  }
);

server.registerTool(
  "time",
  {
    title: "Time Tool",
    description: "Returns the current server time, optionally in a specific timezone.",
    inputSchema: {
      timezone: z.string().optional().describe("An optional IANA timezone name (e.g., 'America/New_York'). Defaults to UTC."),
    },
  },
  async ({ timezone }) => {
    try {
      const now = new Date();
      const timeString = now.toLocaleString("en-US", { timeZone: timezone || "UTC", timeZoneName: "long" });
      return {
        content: [{ type: "text", text: timeString }],
      };
    } catch (error) {
      if (error instanceof RangeError) {
        return {
          content: [{ type: "text", text: `Error: Invalid timezone '${timezone}'` }],
        };
      }
      throw error;
    }
  }
);

server.registerTool(
  "random",
  {
    title: "Randomizer Tool",
    description: "Generates random data such as UUIDs, strings, or numbers.",
    inputSchema: {
      type: z.enum(["uuid", "string", "number"]).optional().default("uuid").describe("The type of random data to generate."),
      length: z.number().optional().default(16).describe("The length of the random string (only for type 'string')."),
      min: z.number().optional().default(0).describe("The minimum value for the random number (only for type 'number')."),
      max: z.number().optional().default(1).describe("The maximum value for the random number (only for type 'number')."),
    },
  },
  async ({ type, length, min, max }) => {
    let result = "";
    if (type === "uuid") {
      result = crypto.randomUUID();
    } else if (type === "string") {
      result = crypto.randomBytes(length).toString("hex");
    } else if (type === "number") {
      // This generates a random number between min (inclusive) and max (exclusive)
      result = (Math.random() * (max - min) + min).toString();
    }
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

server.registerTool(
  "encoder",
  {
    title: "Encoder Tool",
    description: "Encodes a string using a specified format (base64 or url).",
    inputSchema: {
      text: z.string().describe("The string to encode."),
      format: z.enum(["base64", "url"]).describe("The encoding format to use."),
    },
  },
  async ({ text, format }) => {
    let result = "";
    if (format === "base64") {
      result = Buffer.from(text).toString("base64");
    } else if (format === "url") {
      result = encodeURIComponent(text);
    }
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

server.registerTool(
  "decoder",
  {
    title: "Decoder Tool",
    description: "Decodes a string from a specified format (base64 or url).",
    inputSchema: {
      text: z.string().describe("The string to decode."),
      format: z.enum(["base64", "url"]).describe("The decoding format to use."),
    },
  },
  async ({ text, format }) => {
    let result = "";
    if (format === "base64") {
      result = Buffer.from(text, "base64").toString("utf-8");
    } else if (format === "url") {
      result = decodeURIComponent(text);
    }
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

server.registerTool(
  "calculator",
  {
    title: "Calculator Tool",
    description: "Evaluates a mathematical expression.",
    inputSchema: {
      expression: z.string().describe("The mathematical expression to evaluate."),
    },
  },
  async ({ expression }) => {
    try {
      const result = evaluate(expression);
      return {
        content: [{ type: "text", text: result.toString() }],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
        };
      }
      return {
        content: [{ type: "text", text: "An unknown error occurred." }],
      };
    }
  }
);

server.registerTool(
  "web_fetch",
  {
    title: "Web Fetch Tool",
    description: "Fetches content from a specified URL and converts it to a specified format.",
    inputSchema: {
      url: z.string().url().describe("The URL to fetch content from."),
      format: z.enum(["text", "markdown", "json"]).optional().default("text").describe("The desired output format."),
    },
  },
  async ({ url, format }) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return {
          content: [{ type: "text", text: `Error: Failed to fetch URL with status ${response.status}` }],
        };
      }
      const html = await response.text();
      let result = "";

      if (format === "markdown") {
        const turndownService = new TurndownService();
        result = turndownService.turndown(html);
      } else if (format === "json") {
        const $ = cheerio.load(html);
        const title = $("title").text();
        const description = $("meta[name='description']").attr("content");
        const headings = $("h1, h2, h3").map((_, el) => $(el).text()).get();
        result = JSON.stringify({ title, description, headings }, null, 2);
      } else { // Default to text
        result = htmlToText(html);
      }

      return {
        content: [{ type: "text", text: result }],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
        };
      }
      return {
        content: [{ type: "text", text: "An unknown error occurred." }],
      };
    }
  }
);

server.registerTool(
  "system_info",
  {
    title: "System Info Tool",
    description: "Provides information about the system environment.",
    inputSchema: {},
  },
  async () => {
    const info = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      totalMemory: `${(os.totalmem() / 1e9).toFixed(2)} GB`,
      freeMemory: `${(os.freemem() / 1e9).toFixed(2)} GB`,
      uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
    };
  }
);

server.registerTool(
  "web_search",
  {
    title: "Web Search Tool",
    description: "Performs a web search using Google Custom Search.",
    inputSchema: {
      query: z.string().describe("The search query."),
      format: z.enum(["json", "markdown"]).optional().default("json").describe("The desired output format."),
    },
  },
  async ({ query, format }) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;
    if (!apiKey || !cx) {
      return {
        content: [{ type: "text", text: "Error: Google API key or Custom Search Engine ID is not configured." }],
      };
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return {
          content: [{ type: "text", text: `Error: Failed to fetch search results with status ${response.status}` }],
        };
      }
      const data: any = await response.json();
      const results = data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));

      let resultText = "";
      if (format === "markdown") {
        resultText = results.map((item: any) => `### [${item.title}](${item.link})\n${item.snippet}`).join("\n\n---\n\n");
      } else {
        resultText = JSON.stringify(results, null, 2);
      }

      return {
        content: [{ type: "text", text: resultText }],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
        };
      }
      return {
        content: [{ type: "text", text: "An unknown error occurred." }],
      };
    }
  }
);

const transports: { [sessionId: string]: SSEServerTransport } = {};

app.get('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/mcp/messages', res);
  transports[transport.sessionId] = transport;
  
  res.on("close", () => {
    delete transports[transport.sessionId];
  });
  
  await server.connect(transport);
});

app.post('/mcp/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});

const port = process.env.PORT || 8049; // Use a new port for the toolbox
app.listen(port, () => {
  console.log(`MCP Toolbox server listening on port ${port}`);
});
