# 🏗️ Foreman

**Foreman** is a high-performance, distributed task scheduling system built with Node.js and TypeScript. It is designed to handle high-concurrency workloads with sub-50ms latency, featuring intelligent load balancing, priority-based queuing, and a real-time monitoring dashboard.

![Foreman Dashboard Preview](https://via.placeholder.com/800x400.png?text=Foreman+Dashboard+Preview) *(Replace with actual screenshot)*

## 🚀 Features

- **High-Performance Scheduling**: Process upwards of 10,000 tasks concurrently with minimal overhead.
- **Priority-Based Queuing**: Support for multiple priority levels to ensure critical tasks are executed first.
- **Worker Thread Pool**: Efficient task execution using Node.js `worker_threads` for true parallelism.
- **Real-Time Monitoring**: Dynamic dashboard with live metrics, Gantt timelines, and worker status updates via WebSockets.
- **Intelligent Load Balancing**: Distributed workload across multiple workers with health-aware scheduling.
- **Robust Error Handling**: Configurable retries and dead-letter task management.

## 🏗️ Architecture

The project is structured as a monorepo using NPM Workspaces:

- **[`packages/core`](./packages/core)**: The core scheduling engine. Contains the `PriorityQueue`, `LoadBalancer`, `WorkerThread` implementations, and metrics collection logic.
- **[`packages/api`](./packages/api)**: A Fastify-based backend that exposes the scheduler via REST endpoints and a WebSocket server for real-time data streaming.
- **[`packages/dashboard`](./packages/dashboard)**: A modern, high-performance frontend built with Vite and vanilla TypeScript. Feature-rich UI with "Matrix" aesthetic visualizations.

## 🛠️ Technology Stack

- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend Framework**: [Fastify](https://www.fastify.io/)
- **Frontend Tooling**: [Vite](https://vitejs.dev/)
- **Communication**: WebSockets (via [`@fastify/websocket`](https://github.com/fastify/fastify-websocket))
- **Task Isolation**: Node.js `worker_threads`

## 🎯 Use Cases

- **CPU-Intensive Offloading**: Move heavy computations (image resizing, video transcoding, data analysis) out of the main event loop into worker threads to keep your API responsive.
- **High-Concurrency Event Streams**: Process thousands of small, rapid events (IoT sensor data, real-time analytics) with sub-50ms latency.
- **Mission-Critical Priority**: Ensure essential business logic (like payment processing) executes before background maintenance tasks using the `PriorityQueue`.
- **Live System Monitoring**: Use the real-time telemetry dashboard to identify performance bottlenecks and worker distribution in production.

## 📖 How to Use

Foreman can be integrated into your workflow in three primary ways:

### 1. Interactive Dashboard (Running Instance)
With the system running (`npm run dev`), you can use the live monitor at `http://localhost:5173`. Use the built-in console to:
- **Submit Single Tasks**: Test specific task types and priority levels.
- **Stress Test**: Inject up to 10,000 tasks at once to see how the load balancer handles a massive burst.

### 2. REST & WebSocket API (Standalone Services)
Integrate Foreman with any other language (Python, Go, Java) via the API layer:

**Submit a Task:**
```bash
curl -X POST http://localhost:3001/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"type": "data-sync", "priority": 1, "payload": {"userId": "123"}}'
```

**Real-time Monitoring:**
Connect to `ws://localhost:3001/ws` to receive a stream of metrics and task lifecycle events.

### 3. Programmatic Integration (Node.js Library)
Import `@foreman/core` directly into your Node.js application:

```typescript
import { Scheduler, PriorityLevel } from '@foreman/core';

const foreman = new Scheduler(4);
foreman.start();

foreman.submit({
  id: 'job-001',
  type: 'process-report',
  priority: PriorityLevel.HIGH,
  payload: { reportId: 'ABC' }
});

foreman.on('taskCompleted', (data) => console.log(`Finished ${data.id}`));
```

### 4. Customizing Task Logic
To run real work, modify the **`taskRunner.ts`** in `packages/core/src/workers/`. This file executes inside each worker thread and can be used to map task `types` to your actual business logic.

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)

### Installation

```bash
# Clone the repository
git clone https://github.com/bennerdoo/foreman.git
cd foreman

# Install dependencies for the entire monorepo
npm install
```

### Running the Project

You can run the entire system (API + Dashboard) using a single command from the root:

```bash
npm run dev
```

The system will be accessible at:
- **Dashboard**: `http://localhost:5173`
- **API**: `http://localhost:3001`
- **WS**: `ws://localhost:3001/ws`

### Benchmarking

To run load tests and performance benchmarks:

```bash
npm run benchmark
```

## 📈 API Reference

### Submit Task
`POST /api/tasks`
```json
{
  "type": "data-processing",
  "priority": 2,
  "payload": { "data": "..." }
}
```

### Batch Submit
`POST /api/tasks/batch`
```json
{
  "count": 1000,
  "priority": 1
}
```

### Get Metrics
`GET /api/metrics`

---

Built with ❤️ by Bennerdoo
