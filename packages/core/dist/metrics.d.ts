export declare class MetricsCollector {
    private metrics;
    private lastThroughputCheck;
    private processedSinceLastCheck;
    getSnapshot(): {
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
    recordCompletion(latency: number): void;
    recordFailure(): void;
    updateQueueDepth(depths: Record<number, number>): void;
    private updateThroughput;
}
//# sourceMappingURL=metrics.d.ts.map