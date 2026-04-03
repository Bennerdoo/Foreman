"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryMinHeap = void 0;
class BinaryMinHeap {
    data;
    compare;
    constructor(compare) {
        this.data = [];
        this.compare = compare;
    }
    get size() {
        return this.data.length;
    }
    peek() {
        return this.data[0];
    }
    insert(value) {
        this.data.push(value);
        this.bubbleUp(this.data.length - 1);
    }
    extract() {
        if (this.data.length === 0)
            return undefined;
        if (this.data.length === 1)
            return this.data.pop();
        const min = this.data[0];
        this.data[0] = this.data.pop();
        this.sinkDown(0);
        return min;
    }
    bubbleUp(index) {
        const item = this.data[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.data[parentIndex];
            if (this.compare(item, parent) >= 0)
                break;
            this.data[index] = parent;
            index = parentIndex;
        }
        this.data[index] = item;
    }
    sinkDown(index) {
        const length = this.data.length;
        const item = this.data[index];
        while (true) {
            const leftChildIdx = 2 * index + 1;
            const rightChildIdx = 2 * index + 2;
            let leftChild, rightChild;
            let swapIdx = null;
            if (leftChildIdx < length) {
                leftChild = this.data[leftChildIdx];
                if (this.compare(leftChild, item) < 0)
                    swapIdx = leftChildIdx;
            }
            if (rightChildIdx < length) {
                rightChild = this.data[rightChildIdx];
                if ((swapIdx === null && this.compare(rightChild, item) < 0) ||
                    (swapIdx !== null && leftChild && this.compare(rightChild, leftChild) < 0)) {
                    swapIdx = rightChildIdx;
                }
            }
            if (swapIdx === null)
                break;
            this.data[index] = this.data[swapIdx];
            index = swapIdx;
        }
        this.data[index] = item;
    }
}
exports.BinaryMinHeap = BinaryMinHeap;
//# sourceMappingURL=BinaryHeap.js.map