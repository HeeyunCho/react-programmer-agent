# ReAct Programmer Agent (GEMINI.md)

## Purpose
This MCP server implements a structured **Reason and Act (ReAct)** pattern specifically optimized for complex programming and engineering tasks. It facilitates an iterative loop of Thought, Action, and Observation, ensuring a clear, traceable reasoning process.

## Usage for Agents
- **`start_session`**: Use this at the beginning of any complex task to initialize a dedicated reasoning workspace.
- **`record_thought`**: Use this to document your internal reasoning, trade-offs, and planning before taking any action.
- **`record_action`**: Use this to document the specific tool or command you intend to execute.
- **`record_observation`**: Use this to capture the result of your action and analyze its impact on the goal.
- **`get_transcript`**: Use this to retrieve the full history of your reasoning for debugging, review, or final summarization.

## The ReAct Loop Mandate
1. **THOUGHT**: Analyze the current state, identify what's missing, and decide on the next step.
2. **ACTION**: Select the appropriate tool and execute the command.
3. **OBSERVATION**: Parse the output, update your mental model, and identify any new constraints.

## Goal-Oriented Engineering
Always evaluate the `OBSERVATION` against the original `GOAL` defined in `start_session`. Continue the loop until the goal is fully satisfied or a terminal error is reached.
