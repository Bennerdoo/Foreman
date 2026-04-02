import { BinaryMinHeap } from './BinaryHeap';
import { Task } from './types';

export class PriorityQueue {
  private heap: BinaryMinHeap<Task>;
  private depthByPriority: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  constructor() {
    this.heap = new BinaryMinHeap<Task>((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.timestamp - b.timestamp;
    });
  }

  get size(): number {
    return this.heap.size;
  }

  enqueue(task: Task): void {
    this.heap.insert(task);
    this.depthByPriority[task.priority] = (this.depthByPriority[task.priority] || 0) + 1;
  }

  dequeue(): Task | undefined {
    const task = this.heap.extract();
    if (task) {
      this.depthByPriority[task.priority]--;
      if (this.depthByPriority[task.priority] < 0) this.depthByPriority[task.priority] = 0;
    }
    return task;
  }

  peek(): Task | undefined {
    return this.heap.peek();
  }

  getDepths(): Record<number, number> {
    return { ...this.depthByPriority };
  }
}
