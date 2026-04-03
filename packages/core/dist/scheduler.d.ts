import { Task } from './queue/types';
import { MetricsCollector } from './metrics';
import { EventEmitter } from 'events';
export declare class Scheduler extends EventEmitter {
    private queue;
    private registry;
    metrics: MetricsCollector;
    private workers;
    private balancer;
    private interval;
    constructor(workerCount?: number);
    start(): void;
    stop(): void;
    submit(task: Task | Task[]): void;
    private tick;
    private handleWorkerMessage;
    getSnapshot(): {
        metrics: {
            tasksProcessed: number;
            tasksFailed: number;
            throughput: number;
            p50: number;
            p95: number;
            p99: number;
            queueDepth: {
                1: number;
                2: number;
                3: number;
                4: number;
                5: number;
            };
        };
        workers: {
            id: string;
            status: import("./workers/WorkerThread").WorkerStatus;
            activeTasks: number;
            capacity: number;
            metrics: import("./workers/WorkerThread").WorkerMetrics;
        }[];
    };
}
//# sourceMappingURL=scheduler.d.ts.map