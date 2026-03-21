import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

/**
 * ReAct Logic: Session Management
 */
interface ReActStep {
  type: 'THOUGHT' | 'ACTION' | 'OBSERVATION';
  content: string;
  metadata?: any;
  timestamp: string;
}

interface ReActSession {
  id: string;
  goal: string;
  context?: string;
  steps: ReActStep[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

const sessionStore = new Map<string, ReActSession>();

/**
 * Tool Schemas
 */
const StartSessionSchema = z.object({
  goal: z.string().describe("The high-level goal of the programming task"),
  context: z.string().optional().describe("Initial context or constraints"),
});

const RecordThoughtSchema = z.object({
  sessionId: z.string().describe("The ID of the active reasoning session"),
  thought: z.string().describe("The agent's internal reasoning or plan"),
});

const RecordActionSchema = z.object({
  sessionId: z.string().describe("The ID of the active reasoning session"),
  action: z.string().describe("The specific tool or command intended to be run"),
  params: z.any().optional().describe("The parameters passed to the action"),
});

const RecordObservationSchema = z.object({
  sessionId: z.string().describe("The ID of the active reasoning session"),
  observation: z.string().describe("The result from the tool or command"),
});

const GetTranscriptSchema = z.object({
  sessionId: z.string().describe("The ID of the active reasoning session"),
});

/**
 * MCP Server Definition
 */
const server = new Server(
  {
    name: "react-programmer-agent",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool Registration
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "start_session",
        description: "Initialize a new ReAct reasoning session for a programming task.",
        inputSchema: {
          type: "object",
          properties: {
            goal: { type: "string", description: "The goal of the task" },
            context: { type: "string", description: "Initial context" },
          },
          required: ["goal"],
        },
      },
      {
        name: "record_thought",
        description: "Log a 'THOUGHT' step in the ReAct loop.",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: { type: "string", description: "The session ID" },
            thought: { type: "string", description: "The agent's reasoning" },
          },
          required: ["sessionId", "thought"],
        },
      },
      {
        name: "record_action",
        description: "Log an 'ACTION' step (intended tool call) in the ReAct loop.",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: { type: "string", description: "The session ID" },
            action: { type: "string", description: "The tool or command" },
            params: { type: "object", description: "Action parameters" },
          },
          required: ["sessionId", "action"],
        },
      },
      {
        name: "record_observation",
        description: "Log an 'OBSERVATION' step (tool result) in the ReAct loop.",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: { type: "string", description: "The session ID" },
            observation: { type: "string", description: "The result output" },
          },
          required: ["sessionId", "observation"],
        },
      },
      {
        name: "get_transcript",
        description: "Retrieve the full Thought-Action-Observation transcript for a session.",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: { type: "string", description: "The session ID" },
          },
          required: ["sessionId"],
        },
      },
    ],
  };
});

/**
 * Tool Handlers
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "start_session": {
        const { goal, context } = StartSessionSchema.parse(args);
        const id = uuidv4();
        const session: ReActSession = {
          id,
          goal,
          context,
          steps: [],
          status: 'IN_PROGRESS',
        };
        sessionStore.set(id, session);
        return {
          content: [{ type: "text", text: `Session started with ID: ${id}\nGoal: ${goal}` }],
        };
      }

      case "record_thought": {
        const { sessionId, thought } = RecordThoughtSchema.parse(args);
        const session = sessionStore.get(sessionId);
        if (!session) throw new Error(`Session ${sessionId} not found`);

        session.steps.push({
          type: 'THOUGHT',
          content: thought,
          timestamp: new Date().toISOString(),
        });

        return {
          content: [{ type: "text", text: `[THOUGHT] Logged for session ${sessionId}` }],
        };
      }

      case "record_action": {
        const { sessionId, action, params } = RecordActionSchema.parse(args);
        const session = sessionStore.get(sessionId);
        if (!session) throw new Error(`Session ${sessionId} not found`);

        session.steps.push({
          type: 'ACTION',
          content: action,
          metadata: params,
          timestamp: new Date().toISOString(),
        });

        return {
          content: [{ type: "text", text: `[ACTION] Logged for session ${sessionId}: ${action}` }],
        };
      }

      case "record_observation": {
        const { sessionId, observation } = RecordObservationSchema.parse(args);
        const session = sessionStore.get(sessionId);
        if (!session) throw new Error(`Session ${sessionId} not found`);

        session.steps.push({
          type: 'OBSERVATION',
          content: observation,
          timestamp: new Date().toISOString(),
        });

        return {
          content: [{ type: "text", text: `[OBSERVATION] Logged for session ${sessionId}` }],
        };
      }

      case "get_transcript": {
        const { sessionId } = GetTranscriptSchema.parse(args);
        const session = sessionStore.get(sessionId);
        if (!session) throw new Error(`Session ${sessionId} not found`);

        let transcript = `SESSION: ${session.id}\nGOAL: ${session.goal}\nSTATUS: ${session.status}\n\n`;
        session.steps.forEach((step, index) => {
          transcript += `[${index + 1}] ${step.type} (${step.timestamp}):\n${step.content}\n`;
          if (step.metadata) {
            transcript += `METADATA: ${JSON.stringify(step.metadata, null, 2)}\n`;
          }
          transcript += `------------------------------------------\n`;
        });

        return {
          content: [{ type: "text", text: transcript }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [{ type: "text", text: `Error: Invalid inputs - ${error.issues.map((e: any) => e.message).join(", ")}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("react-programmer-agent server running on stdio");
}

main().catch(console.error);
