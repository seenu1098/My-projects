import { TaskStatus } from './TaskStatus';

export class Task {
  taskId: number;
  title: string;
  description: string;
  taskStatus: TaskStatus;

  constructor(id, title, description, taskStatus) {
    this.taskId = id;
    this.title = title;
    this.description = description;
    this.taskStatus = taskStatus;
  }
}
