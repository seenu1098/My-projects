import { TaskboardTaskVO } from "../taskboard-form-details/taskboard-task-vo";

export class TaskDependencies {
    taskId: string;
    waitingOn: TaskboardTaskVO[] = [];
    blocking: TaskboardTaskVO[] = [];
    relatedTasks: TaskboardTaskVO[] = [];
    removeDependenciesId: string[] = [];
}