# @foreman/api

**API** is the Fastify-based backend for the Foreman project. It serves as a unified interface for submitting tasks, monitoring system health, and streaming live metrics via WebSockets.

## 📦 Features

- **REST Interface**: Securely submit single or batch tasks through JSON payloads.
- **WebSocket Gateway**: Dynamic data streaming for live monitoring of workers and task states.
- **Metrics Aggregation**: Provides real-time snapshots of throughput, P99 latency, and cluster healthy.

## 🚀 Endpoint Reference

### Task Submission
`POST /api/tasks`

```json
{
  "type": "data-processing",
  "priority": 2, // 1: HIGH, 2: NORMAL, 3: LOW
  "payload": { ... },
  "maxRetries": 3
}
```

### Batch Submission
`POST /api/tasks/batch`

```json
{
  "count": 100, // Number of tasks to generate
  "priority": 2
}
```

### Metrics Snapshot
`GET /api/metrics`

### WebSocket Stream
`GET /ws`

```typescript
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // metricsUpdate, taskQueued, taskStarted, taskCompleted, taskFailed
};
```
