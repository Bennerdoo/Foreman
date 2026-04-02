import { Task } from './queue/types';

export enum TaskState {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DEAD = 'DEAD'
}

export interface TaskRecord {
  task: Task;
  state: TaskState;
  workerId?: string;
  result?: any;
  error?: string;
  queuedAt?: number;
  startedAt?: number;
  completedAt?: number;
}

export class TaskRegistry {
  private records = new Map<string, TaskRecord>();

  register(task: Task): TaskRecord {
    const record: TaskRecord = {
      task,
      state: TaskState.PENDING,
      queuedAt: Date.now()
    };
    this.records.set(task.id, record);
    return record;
  }

  updateState(taskId: string, state: TaskState, metadata?: Partial<TaskRecord>) {
    const record = this.records.get(taskId);
    if (record) {
      record.state = state;
      if (metadata) {
        Object.assign(record, metadata);
      }
    }
  }

  get(taskId: string): TaskRecord | undefined {
    return this.records.get(taskId);
  }

  getAll(): TaskRecord[] {
    return Array.from(this.records.values());
  }

  delete(taskId: string): boolean {
    return this.records.delete(taskId);
  }
}
