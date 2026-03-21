# IMPLEMENTATION: ReAct Programmer Agent

## Overview
The `react-programmer-agent` is an MCP server designed to enforce the ReAct (Reason and Act) pattern for software engineering tasks. It provides a structured state machine for tracking thoughts, actions, and observations.

## Tool Definitions

### `start_session(goal: string, context?: string)`
- **Purpose**: Initializes a new reasoning workspace with a specific mission.
- **Output**: Returns a unique `sessionId`.

### `record_thought(sessionId: string, thought: string)`
- **Purpose**: Captures the agent's internal reasoning, planning, and decision-making logic.
- **Compliance**: Must be called before any `record_action`.

### `record_action(sessionId: string, action: string, params?: object)`
- **Purpose**: Logs the specific tool call or system command intended to be executed.

### `record_observation(sessionId: string, observation: string)`
- **Purpose**: Captures the result/feedback from the tool and updates the mental model.

### `get_transcript(sessionId: string)`
- **Purpose**: Generates a full chronological report of the reasoning loop.

## Internal Architecture
- **State Storage**: In-memory `Map<string, ReActSession>`.
- **Validation**: Zod-based schema enforcement for all inputs.
- **Protocol**: Standard MCP/Stdio.

## Best Practices for Usage
1.  **Iterative Loop**: Always follow the sequence: THOUGHT -> ACTION -> OBSERVATION.
2.  **Granularity**: Keep thoughts focused on the immediate next step.
3.  **Traceability**: Use the transcript to backtrack when a strategy fails.
