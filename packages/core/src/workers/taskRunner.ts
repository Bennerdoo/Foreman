import { parentPort } from 'worker_threads';

if (parentPort) {
  parentPort.on('message', async (msg) => {
    if (msg.type === 'execute') {
      const task = msg.task;
      const start = Date.now();
      
      let waitMs = task.payload?.latency || 10;
      let shouldFail = task.payload?.failRate && Math.random() < task.payload.failRate;
      
      setTimeout(() => {
        if (parentPort) {
          parentPort.postMessage({
            taskId: task.id,
            success: !shouldFail,
            latency: Date.now() - start,
            workerId: task.workerId,
            error: shouldFail ? 'Random task failure' : undefined
          });
        }
      }, waitMs);
    }
  });
}
