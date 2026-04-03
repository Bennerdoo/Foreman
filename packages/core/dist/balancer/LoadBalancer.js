"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBalancer = void 0;
class LoadBalancer {
    workers;
    constructor(workers) {
        this.workers = workers;
    }
    getAvailableWorker() {
        const available = this.workers.filter(w => w.status !== 'OFFLINE' && w.getCapacity() > 0);
        if (available.length === 0)
            return undefined;
        available.sort((a, b) => a.activeTasks - b.activeTasks);
        return available[0];
    }
}
exports.LoadBalancer = LoadBalancer;
//# sourceMappingURL=LoadBalancer.js.map