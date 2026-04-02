# @foreman/dashboard

**Dashboard** is the frontend monitor for the Foreman project. It uses Vite and vanilla TypeScript to provide a high-performance, real-time visualization of task scheduling and execution metrics.

## 📦 Features

- **Matrix-Inspired Aesthetic**: Custom canvas animations and a "blueprint" style industrial feel.
- **Real-Time Data Streaming**: Dynamic updates via WebSockets for throughput, P99 latency, and cluster health.
- **Worker Status Grid**: Shows live status and CPU-like utilization for every active worker thread.
- **Gantt Timeline**: Visual representation of task execution across the system.
- **System Controls**: Submit singleton tasks or stress test the system by injecting batches of up to 10,000 tasks.

## 🚀 Getting Started

```bash
# Run the dashboard package separately
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

### Visual Metrics

- **Throughput**: Number of tasks processed per second.
- **P99 Latency**: The 99th percentile response time.
- **Queue Depth**: Cumulative size of all pending task queues.
- **Worker Load**: Visual representation of current task density.
