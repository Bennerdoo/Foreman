"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
if (worker_threads_1.parentPort) {
    worker_threads_1.parentPort.on('message', async (msg) => {
        if (msg.type === 'execute') {
            const task = msg.task;
            const start = Date.now();
            let waitMs = task.payload?.latency || 10;
            let shouldFail = task.payload?.failRate && Math.random() < task.payload.failRate;
            setTimeout(() => {
                if (worker_threads_1.parentPort) {
                    worker_threads_1.parentPort.postMessage({
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
//# sourceMappingURL=taskRunner.js.map