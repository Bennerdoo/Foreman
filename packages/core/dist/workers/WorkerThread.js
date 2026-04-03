"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerWrapper = void 0;
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
class WorkerWrapper {
    id;
    maxTasks;
    onMessage;
    worker;
    activeTasks = 0;
    metrics = { processed: 0, failed: 0, avgLatency: 0 };
    status = 'IDLE';
    constructor(id, maxTasks, onMessage) {
        this.id = id;
        this.maxTasks = maxTasks;
        this.onMessage = onMessage;
        this.worker = new worker_threads_1.Worker(path_1.default.join(__dirname, 'taskRunner.js'));
        this.worker.on('message', (msg) => {
            this.activeTasks--;
            if (this.activeTasks === 0)
                this.status = 'IDLE';
            if (msg.success) {
                this.metrics.processed++;
            }
            else {
                this.metrics.failed++;
            }
            this.onMessage(msg);
        });
        this.worker.on('error', (err) => {
            this.status = 'OFFLINE';
            console.error(`Worker ${this.id} error:`, err);
        });
    }
    execute(task) {
        this.activeTasks++;
        this.status = 'BUSY';
        this.worker.postMessage({ type: 'execute', task });
    }
    getCapacity() {
        return this.maxTasks - this.activeTasks;
    }
}
exports.WorkerWrapper = WorkerWrapper;
//# sourceMappingURL=WorkerThread.js.map