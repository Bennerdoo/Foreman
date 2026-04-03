import { WorkerWrapper } from '../workers/WorkerThread';
export declare class LoadBalancer {
    private workers;
    constructor(workers: WorkerWrapper[]);
    getAvailableWorker(): WorkerWrapper | undefined;
}
//# sourceMappingURL=LoadBalancer.d.ts.map