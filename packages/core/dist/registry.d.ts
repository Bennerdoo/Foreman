import { Task } from './queue/types';
export declare enum TaskState {
    PENDING = "PENDING",
    QUEUED = "QUEUED",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    DEAD = "DEAD"
}
export interface TaskRecord {
    task: Task;
    state: TaskState;
    workerId?: string;
    result?: any;
    error?: string;
    queuedAt?: number;
    startedAt?: number;
    completedAt?: number;
}
export declare class TaskRegistry {
    private records;
    register(task: Task): TaskRecord;
    updateState(taskId: string, state: TaskState, metadata?: Partial<TaskRecord>): void;
    get(taskId: string): TaskRecord | undefined;
    getAll(): TaskRecord[];
    delete(taskId: string): boolean;
}
//# sourceMappingURL=registry.d.ts.map