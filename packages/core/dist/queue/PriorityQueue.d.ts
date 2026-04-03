import { Task } from './types';
export declare class PriorityQueue {
    private heap;
    private depthByPriority;
    constructor();
    get size(): number;
    enqueue(task: Task): void;
    dequeue(): Task | undefined;
    peek(): Task | undefined;
    getDepths(): Record<number, number>;
}
//# sourceMappingURL=PriorityQueue.d.ts.map