import { WorkerWrapper } from '../workers/WorkerThread';

export class LoadBalancer {
  constructor(private workers: WorkerWrapper[]) {}

  getAvailableWorker(): WorkerWrapper | undefined {
    const available = this.workers.filter(w => w.status !== 'OFFLINE' && w.getCapacity() > 0);
    if (available.length === 0) return undefined;

    available.sort((a, b) => a.activeTasks - b.activeTasks);
    return available[0];
  }
}
