# ReAct Programmer Agent

A specialized MCP server for complex programming tasks following the **Reason and Act (ReAct)** pattern. It provides a structured state machine for traceable and adaptive reasoning.

## 🚀 Purpose
Software engineering tasks often require more than a single pass. This agent implements an iterative loop of **Thought, Action, and Observation**, allowing AI models to build dynamic plans and adjust their approach based on real-time feedback from the environment.

## 🛠 Features
- **Stateful Reasoning**: Maintains a full session history of the reasoning loop.
- **Transcript Generation**: Get a complete chronological report of how a solution was derived.
- **Structured Tools**:
  - `start_session`: Initialize a mission with specific goals and context.
  - `record_thought`: Capture internal trade-offs and decision logic.
  - `record_action`: Log intended tool calls or system commands.
  - `record_observation`: Capture tool outputs and update the mental model.

## 📦 Installation
```bash
npm install
npm run build
```

## 🤖 Usage in MCP
Register the server in your `settings.json`:
```json
"react-programmer-agent": {
  "command": "node",
  "args": ["C:/gemini_project/react-programmer-agent/dist/index.js"]
}
```

## 📜 The ReAct Mandate
1. **THOUGHT**: Analyze the current state and decide the next step.
2. **ACTION**: Select and execute the appropriate tool.
3. **OBSERVATION**: Parse the result and update project state.
