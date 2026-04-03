import { Worker } from 'worker_threads';
import { Task } from '../queue/types';
import path from 'path';

export interface WorkerMetrics {
  processed: number;
  failed: number;
  avgLatency: number;
}

export type WorkerStatus = 'IDLE' | 'BUSY' | 'OFFLINE';

export class WorkerWrapper {
  private worker: Worker;
  public activeTasks = 0;
  public metrics: WorkerMetrics = { processed: 0, failed: 0, avgLatency: 0 };
  public status: WorkerStatus = 'IDLE';

  constructor(public id: string, public maxTasks: number, private onMessage: (msg: any) => void) {
    const isTsNode = !!(process as any)[Symbol.for('ts-node.register.instance')] || process.env.TS_NODE_DEV === 'true' || __filename.endsWith('.ts');
    const ext = isTsNode ? '.ts' : '.js';
    const workerOptions = isTsNode ? { execArgv: ['-r', 'ts-node/register', '-r', 'tsconfig-paths/register'] } : {};
    
    this.worker = new Worker(path.join(__dirname, `taskRunner${ext}`), workerOptions);
    
    this.worker.on('message', (msg) => {
      this.activeTasks--;
      if (this.activeTasks === 0) this.status = 'IDLE';
      
      if (msg.success) {
        this.metrics.processed++;
      } else {
        this.metrics.failed++;
      }
      this.onMessage(msg);      
    });
    
    this.worker.on('error', (err) => {
      this.status = 'OFFLINE';
      console.error(`Worker ${this.id} error:`, err);
    });
  }

  execute(task: Task) {
    this.activeTasks++;
    this.status = 'BUSY';
    this.worker.postMessage({ type: 'execute', task });
  }

  getCapacity() {
    return this.maxTasks - this.activeTasks;
  }
}
