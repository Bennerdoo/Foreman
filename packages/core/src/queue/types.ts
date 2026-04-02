export enum PriorityLevel {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
  BACKGROUND = 5
}

export interface Task {
  id: string;
  type: string;
  payload: any;
  priority: PriorityLevel;
  timestamp: number;
  retries: number;
  maxRetries: number;
  affinity?: string;
}
