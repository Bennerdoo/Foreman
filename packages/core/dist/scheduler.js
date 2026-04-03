"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const PriorityQueue_1 = require("./queue/PriorityQueue");
const registry_1 = require("./registry");
const metrics_1 = require("./metrics");
const WorkerThread_1 = require("./workers/WorkerThread");
const LoadBalancer_1 = require("./balancer/LoadBalancer");
const events_1 = require("events");
class Scheduler extends events_1.EventEmitter {
    queue = new PriorityQueue_1.PriorityQueue();
    registry = new registry_1.TaskRegistry();
    metrics = new metrics_1.MetricsCollector();
    workers = [];
    balancer;
    interval = null;
    constructor(workerCount = 8) {
        super();
        for (let i = 0; i < workerCount; i++) {
            const worker = new WorkerThread_1.WorkerWrapper(`worker-${i}`, 5, this.handleWorkerMessage.bind(this));
            this.workers.push(worker);
        }
        this.balancer = new LoadBalancer_1.LoadBalancer(this.workers);
    }
    start() {
        if (!this.interval) {
            this.interval = setInterval(() => this.tick(), 10);
        }
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    submit(task) {
        const tasks = Array.isArray(task) ? task : [task];
        tasks.forEach(t => {
            this.registry.register(t);
            this.queue.enqueue(t);
            this.registry.updateState(t.id, registry_1.TaskState.QUEUED);
            this.emit('taskQueued', t);
        });
        this.metrics.updateQueueDepth(this.queue.getDepths());
    }
    tick() {
        let worker = this.balancer.getAvailableWorker();
        while (this.queue.size > 0 && worker) {
            const task = this.queue.dequeue();
            if (!task)
                break;
            this.registry.updateState(task.id, registry_1.TaskState.RUNNING, { workerId: worker.id, startedAt: Date.now() });
            this.emit('taskStarted', { ...task, workerId: worker.id });
            worker.execute(task);
            this.metrics.updateQueueDepth(this.queue.getDepths());
            worker = this.balancer.getAvailableWorker();
        }
    }
    handleWorkerMessage(msg) {
        const record = this.registry.get(msg.taskId);
        if (!record)
            return;
        if (msg.success) {
            this.registry.updateState(msg.taskId, registry_1.TaskState.COMPLETED, { completedAt: Date.now(), result: msg.result });
            this.metrics.recordCompletion(msg.latency);
            this.emit('taskCompleted', { id: msg.taskId, latency: msg.latency });
        }
        else {
            if (record.task.retries < record.task.maxRetries) {
                record.task.retries++;
                this.registry.updateState(msg.taskId, registry_1.TaskState.QUEUED);
                this.queue.enqueue(record.task);
                this.emit('taskFailed', { id: msg.taskId, error: msg.error, retry: true });
            }
            else {
                this.registry.updateState(msg.taskId, registry_1.TaskState.DEAD, { error: msg.error });
                this.metrics.recordFailure();
                this.emit('taskFailed', { id: msg.taskId, error: msg.error, retry: false });
            }
        }
    }
    getSnapshot() {
        return {
            metrics: this.metrics.getSnapshot(),
            workers: this.workers.map(w => ({
                id: w.id,
                status: w.status,
                activeTasks: w.activeTasks,
                capacity: w.maxTasks,
                metrics: w.metrics
            }))
        };
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map