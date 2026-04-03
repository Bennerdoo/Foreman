export declare class BinaryMinHeap<T> {
    private data;
    private compare;
    constructor(compare: (a: T, b: T) => number);
    get size(): number;
    peek(): T | undefined;
    insert(value: T): void;
    extract(): T | undefined;
    private bubbleUp;
    private sinkDown;
}
//# sourceMappingURL=BinaryHeap.d.ts.map