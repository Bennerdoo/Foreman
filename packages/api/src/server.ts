import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { Scheduler, PriorityLevel, Task } from '@foreman/core';
import { v4 as uuidv4 } from 'uuid';

export const scheduler = new Scheduler(8);
scheduler.start();

const server = Fastify({ logger: false });

server.register(cors, { origin: '*' });
server.register(websocket);

server.register(async (fastify) => {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    
    const broadcast = (msg: any) => {
      connection.socket.send(JSON.stringify(msg));
    };

    const onQueued = (t: any) => broadcast({ type: 'taskQueued', payload: t });
    const onStarted: any = (t: any) => broadcast({ type: 'taskStarted', payload: t });
    const onCompleted: any = (t: any) => broadcast({ type: 'taskCompleted', payload: t });
    const onFailed: any = (t: any) => broadcast({ type: 'taskFailed', payload: t });

    scheduler.on('taskQueued', onQueued);
    scheduler.on('taskStarted', onStarted);
    scheduler.on('taskCompleted', onCompleted);
    scheduler.on('taskFailed', onFailed);

    const metricsInterval = setInterval(() => {
      broadcast({ type: 'metricsUpdate', payload: scheduler.getSnapshot() });
    }, 500);

    connection.socket.on('close', () => {
      scheduler.off('taskQueued', onQueued);
      scheduler.off('taskStarted', onStarted);
      scheduler.off('taskCompleted', onCompleted);
      scheduler.off('taskFailed', onFailed);
      clearInterval(metricsInterval);
    });
  });

  fastify.get('/api/metrics', async () => {
    return scheduler.getSnapshot();
  });

  fastify.post('/api/tasks', async (request: any, reply) => {
    const { type, payload, priority = PriorityLevel.NORMAL, maxRetries = 3 } = request.body;
    
    const task: Task = {
      id: uuidv4(),
      type,
      payload,
      priority,
      timestamp: Date.now(),
      retries: 0,
      maxRetries
    };

    scheduler.submit(task);
    return { success: true, taskId: task.id };
  });

  fastify.post('/api/tasks/batch', async (request: any, reply) => {
    const { count = 100, priority = PriorityLevel.NORMAL } = request.body;
    const tasks: Task[] = [];
    
    for (let i = 0; i < count; i++) {
      tasks.push({
        id: uuidv4(),
        type: 'batch-task',
        payload: { latency: Math.floor(Math.random() * 50) + 10, failRate: 0.05 },
        priority,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 3
      });
    }

    scheduler.submit(tasks);
    return { success: true, submitted: count };
  });
});

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server listening on http://localhost:3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
