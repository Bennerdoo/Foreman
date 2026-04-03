import { Task } from '../queue/types';
export interface WorkerMetrics {
    processed: number;
    failed: number;
    avgLatency: number;
}
export type WorkerStatus = 'IDLE' | 'BUSY' | 'OFFLINE';
export declare class WorkerWrapper {
    id: string;
    maxTasks: number;
    private onMessage;
    private worker;
    activeTasks: number;
    metrics: WorkerMetrics;
    status: WorkerStatus;
    constructor(id: string, maxTasks: number, onMessage: (msg: any) => void);
    execute(task: Task): void;
    getCapacity(): number;
}
//# sourceMappingURL=WorkerThread.d.ts.map