"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduler = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const core_1 = require("@foreman/core");
const uuid_1 = require("uuid");
exports.scheduler = new core_1.Scheduler(8);
exports.scheduler.start();
const server = (0, fastify_1.default)({ logger: false });
server.register(cors_1.default, { origin: '*' });
server.register(websocket_1.default);
server.register(async (fastify) => {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        const broadcast = (msg) => {
            connection.socket.send(JSON.stringify(msg));
        };
        const onQueued = (t) => broadcast({ type: 'taskQueued', payload: t });
        const onStarted = (t) => broadcast({ type: 'taskStarted', payload: t });
        const onCompleted = (t) => broadcast({ type: 'taskCompleted', payload: t });
        const onFailed = (t) => broadcast({ type: 'taskFailed', payload: t });
        exports.scheduler.on('taskQueued', onQueued);
        exports.scheduler.on('taskStarted', onStarted);
        exports.scheduler.on('taskCompleted', onCompleted);
        exports.scheduler.on('taskFailed', onFailed);
        const metricsInterval = setInterval(() => {
            broadcast({ type: 'metricsUpdate', payload: exports.scheduler.getSnapshot() });
        }, 500);
        connection.socket.on('close', () => {
            exports.scheduler.off('taskQueued', onQueued);
            exports.scheduler.off('taskStarted', onStarted);
            exports.scheduler.off('taskCompleted', onCompleted);
            exports.scheduler.off('taskFailed', onFailed);
            clearInterval(metricsInterval);
        });
    });
    fastify.get('/api/metrics', async () => {
        return exports.scheduler.getSnapshot();
    });
    fastify.post('/api/tasks', async (request, reply) => {
        const { type, payload, priority = core_1.PriorityLevel.NORMAL, maxRetries = 3 } = request.body;
        const task = {
            id: (0, uuid_1.v4)(),
            type,
            payload,
            priority,
            timestamp: Date.now(),
            retries: 0,
            maxRetries
        };
        exports.scheduler.submit(task);
        return { success: true, taskId: task.id };
    });
    fastify.post('/api/tasks/batch', async (request, reply) => {
        const { count = 100, priority = core_1.PriorityLevel.NORMAL } = request.body;
        const tasks = [];
        for (let i = 0; i < count; i++) {
            tasks.push({
                id: (0, uuid_1.v4)(),
                type: 'batch-task',
                payload: { latency: Math.floor(Math.random() * 50) + 10, failRate: 0.05 },
                priority,
                timestamp: Date.now(),
                retries: 0,
                maxRetries: 3
            });
        }
        exports.scheduler.submit(tasks);
        return { success: true, submitted: count };
    });
});
const start = async () => {
    try {
        await server.listen({ port: 3001, host: '0.0.0.0' });
        console.log('Server listening on http://localhost:3001');
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map