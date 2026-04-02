import { PriorityQueue } from './queue/PriorityQueue';
import { Task } from './queue/types';
import { TaskRegistry, TaskState } from './registry';
import { MetricsCollector } from './metrics';
import { WorkerWrapper } from './workers/WorkerThread';
import { LoadBalancer } from './balancer/LoadBalancer';
import { EventEmitter } from 'events';

export class Scheduler extends EventEmitter {
  private queue = new PriorityQueue();
  private registry = new TaskRegistry();
  public metrics = new MetricsCollector();
  private workers: WorkerWrapper[] = [];
  private balancer: LoadBalancer;
  private interval: NodeJS.Timeout | null = null;

  constructor(workerCount: number = 8) {
    super();
    for (let i = 0; i < workerCount; i++) {
      const worker = new WorkerWrapper(`worker-${i}`, 5, this.handleWorkerMessage.bind(this));
      this.workers.push(worker);
    }
    this.balancer = new LoadBalancer(this.workers);
  }

  start() {
    if (!this.interval) {
      this.interval = setInterval(() => this.tick(), 10);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  submit(task: Task | Task[]) {
    const tasks = Array.isArray(task) ? task : [task];
    tasks.forEach(t => {
      this.registry.register(t);
      this.queue.enqueue(t);
      this.registry.updateState(t.id, TaskState.QUEUED);
      this.emit('taskQueued', t);
    });
    this.metrics.updateQueueDepth(this.queue.getDepths());
  }

  private tick() {
    let worker = this.balancer.getAvailableWorker();
    while (this.queue.size > 0 && worker) {
      const task = this.queue.dequeue();
      if (!task) break;

      this.registry.updateState(task.id, TaskState.RUNNING, { workerId: worker.id, startedAt: Date.now() });
      this.emit('taskStarted', { ...task, workerId: worker.id });
      
      worker.execute(task);
      this.metrics.updateQueueDepth(this.queue.getDepths());
      
      worker = this.balancer.getAvailableWorker();
    }
  }

  private handleWorkerMessage(msg: any) {
    const record = this.registry.get(msg.taskId);
    if (!record) return;

    if (msg.success) {
      this.registry.updateState(msg.taskId, TaskState.COMPLETED, { completedAt: Date.now(), result: msg.result });
      this.metrics.recordCompletion(msg.latency);
      this.emit('taskCompleted', { id: msg.taskId, latency: msg.latency });
    } else {
      if (record.task.retries < record.task.maxRetries) {
        record.task.retries++;
        this.registry.updateState(msg.taskId, TaskState.QUEUED);
        this.queue.enqueue(record.task);
        this.emit('taskFailed', { id: msg.taskId, error: msg.error, retry: true });
      } else {
        this.registry.updateState(msg.taskId, TaskState.DEAD, { error: msg.error });
        this.metrics.recordFailure();
        this.emit('taskFailed', { id: msg.taskId, error: msg.error, retry: false });
      }
    }
  }

  getSnapshot() {
    return {
      metrics: this.metrics.getSnapshot(),
      workers: this.workers.map(w => ({
        id: w.id,
        status: w.status,
        activeTasks: w.activeTasks,
        capacity: w.maxTasks,
        metrics: w.metrics
      }))
    };
  }
}
