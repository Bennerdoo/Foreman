"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRegistry = exports.TaskState = void 0;
var TaskState;
(function (TaskState) {
    TaskState["PENDING"] = "PENDING";
    TaskState["QUEUED"] = "QUEUED";
    TaskState["RUNNING"] = "RUNNING";
    TaskState["COMPLETED"] = "COMPLETED";
    TaskState["FAILED"] = "FAILED";
    TaskState["DEAD"] = "DEAD";
})(TaskState || (exports.TaskState = TaskState = {}));
class TaskRegistry {
    records = new Map();
    register(task) {
        const record = {
            task,
            state: TaskState.PENDING,
            queuedAt: Date.now()
        };
        this.records.set(task.id, record);
        return record;
    }
    updateState(taskId, state, metadata) {
        const record = this.records.get(taskId);
        if (record) {
            record.state = state;
            if (metadata) {
                Object.assign(record, metadata);
            }
        }
    }
    get(taskId) {
        return this.records.get(taskId);
    }
    getAll() {
        return Array.from(this.records.values());
    }
    delete(taskId) {
        return this.records.delete(taskId);
    }
}
exports.TaskRegistry = TaskRegistry;
//# sourceMappingURL=registry.js.map