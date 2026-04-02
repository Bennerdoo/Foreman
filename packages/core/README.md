# @foreman/core

**Core** is the underlying scheduling engine for the Foreman project. It handles high-concurrency task processing, priority queuing, and safe parallel execution through Node.js worker threads.

## 📦 Components

- **`Scheduler`**: The main interface for task submission and lifecycle management.
- **`PriorityQueue`**: Handles O(log n) task insertion and extraction based on configurable priority levels.
- **`WorkerThread`**: Manages dedicated Node.js `worker_threads` for CPU-intensive tasks.
- **`LoadBalancer`**: Distributes tasks evenly across available workers.
- **`MetricsCollector`**: Aggregates throughput, latency, and success/failure statistics.

## 🚀 Usage

```typescript
import { Scheduler, PriorityLevel } from '@foreman/core';

const scheduler = new Scheduler(8); // Initialize with 8 workers
scheduler.start();

scheduler.submit({
  id: 'unique-task-id',
  type: 'data-processing',
  priority: PriorityLevel.HIGH,
  payload: { data: '...' }
});
```
