import { LinkNode } from './link-node';
import { TaskNode } from './task-node';

export class Workflow {
    workflowId: any;
    key: string;
    name: string;
    startKey: string;
    status: string;
    canPublish = false;
    startType: string;
    linkNodeList: LinkNode[] = [];
    taskNodeList: TaskNode[] = [];
}
