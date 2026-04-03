"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
class MetricsCollector {
    metrics = {
        tasksProcessed: 0,
        tasksFailed: 0,
        queueDepth: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        },
        latencies: [],
        throughputCurrent: 0,
    };
    lastThroughputCheck = Date.now();
    processedSinceLastCheck = 0;
    getSnapshot() {
        this.updateThroughput();
        let p50 = 0, p95 = 0, p99 = 0;
        const lats = [...this.metrics.latencies].sort((a, b) => a - b);
        if (lats.length > 0) {
            p50 = lats[Math.floor(lats.length * 0.5)];
            p95 = lats[Math.floor(lats.length * 0.95)];
            p99 = lats[Math.floor(lats.length * 0.99)];
        }
        return {
            tasksProcessed: this.metrics.tasksProcessed,
            tasksFailed: this.metrics.tasksFailed,
            throughput: this.metrics.throughputCurrent,
            p50,
            p95,
            p99,
            queueDepth: this.metrics.queueDepth
        };
    }
    recordCompletion(latency) {
        this.metrics.tasksProcessed++;
        this.processedSinceLastCheck++;
        this.metrics.latencies.push(latency);
        if (this.metrics.latencies.length > 1000) {
            this.metrics.latencies.shift();
        }
    }
    recordFailure() {
        this.metrics.tasksFailed++;
    }
    updateQueueDepth(depths) {
        this.metrics.queueDepth = {
            1: depths[1] || 0,
            2: depths[2] || 0,
            3: depths[3] || 0,
            4: depths[4] || 0,
            5: depths[5] || 0
        };
    }
    updateThroughput() {
        const now = Date.now();
        const elapsed = (now - this.lastThroughputCheck) / 1000;
        if (elapsed >= 1) {
            this.metrics.throughputCurrent = Math.round(this.processedSinceLastCheck / elapsed);
            this.processedSinceLastCheck = 0;
            this.lastThroughputCheck = now;
        }
    }
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=metrics.js.map