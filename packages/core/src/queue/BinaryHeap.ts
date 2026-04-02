export class BinaryMinHeap<T> {
  private data: T[];
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this.data = [];
    this.compare = compare;
  }

  get size(): number {
    return this.data.length;
  }

  peek(): T | undefined {
    return this.data[0];
  }

  insert(value: T): void {
    this.data.push(value);
    this.bubbleUp(this.data.length - 1);
  }

  extract(): T | undefined {
    if (this.data.length === 0) return undefined;
    if (this.data.length === 1) return this.data.pop();

    const min = this.data[0];
    this.data[0] = this.data.pop()!;
    this.sinkDown(0);
    return min;
  }

  private bubbleUp(index: number): void {
    const item = this.data[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.data[parentIndex];
      if (this.compare(item, parent) >= 0) break;
      this.data[index] = parent;
      index = parentIndex;
    }
    this.data[index] = item;
  }

  private sinkDown(index: number): void {
    const length = this.data.length;
    const item = this.data[index];

    while (true) {
      const leftChildIdx = 2 * index + 1;
      const rightChildIdx = 2 * index + 2;
      let leftChild: T | undefined, rightChild: T | undefined;
      let swapIdx: number | null = null;

      if (leftChildIdx < length) {
        leftChild = this.data[leftChildIdx];
        if (this.compare(leftChild, item) < 0) swapIdx = leftChildIdx;
      }

      if (rightChildIdx < length) {
        rightChild = this.data[rightChildIdx];
        if (
          (swapIdx === null && this.compare(rightChild, item) < 0) ||
          (swapIdx !== null && leftChild && this.compare(rightChild, leftChild) < 0)
        ) {
          swapIdx = rightChildIdx;
        }
      }

      if (swapIdx === null) break;

      this.data[index] = this.data[swapIdx];
      index = swapIdx;
    }
    this.data[index] = item;
  }
}
