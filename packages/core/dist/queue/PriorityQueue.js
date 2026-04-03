"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityQueue = void 0;
const BinaryHeap_1 = require("./BinaryHeap");
class PriorityQueue {
    heap;
    depthByPriority = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    constructor() {
        this.heap = new BinaryHeap_1.BinaryMinHeap((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.timestamp - b.timestamp;
        });
    }
    get size() {
        return this.heap.size;
    }
    enqueue(task) {
        this.heap.insert(task);
        this.depthByPriority[task.priority] = (this.depthByPriority[task.priority] || 0) + 1;
    }
    dequeue() {
        const task = this.heap.extract();
        if (task) {
            this.depthByPriority[task.priority]--;
            if (this.depthByPriority[task.priority] < 0)
                this.depthByPriority[task.priority] = 0;
        }
        return task;
    }
    peek() {
        return this.heap.peek();
    }
    getDepths() {
        return { ...this.depthByPriority };
    }
}
exports.PriorityQueue = PriorityQueue;
//# sourceMappingURL=PriorityQueue.js.map