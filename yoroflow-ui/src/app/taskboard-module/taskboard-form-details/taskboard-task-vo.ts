import { TaskDependencies } from "../dependency-dialog/dependency-model";

export class TaskboardTaskVO {
  id: string;
  taskName: string;
  taskId: string;
  taskboardId: string;
  description: string;
  startDate: any;
  dueDate: any;
  status: string;
  taskType: string;
  parentTaskId: string;
  taskData: any;
  createdOn: string;
  modifiedOn: string;
  createdBy: string;
  modifiedBy: string;
  subTasks: SubTaskVO[] = [];
  labels: LabelsVO[] = [];
  removedSubtasks: any[] = [];
  taskComments: TaskCommentsVO[] = [];
  taskboardLabels: TaskboardLabelsVO[];
  subTaskCount: number;
  assignTaskVO: AssignTaskVO;
  removedAssigneeList: string[];
  files: FilesVO[] = [];
  sequenceNo: number;
  previousIndex: number;
  currentIndex: number;
  subStatus: string;
  loggedInUserName: string;
  previousStatus: string;
  commentsLength: number;
  subTaskVO: TaskboardTaskVO[] = [];
  isSubtask: boolean = false;
  maxStartDate: any;
  minDueDate: any;
  priority: string;
  isSelected: boolean = false;
  taskDependenciesVO = new TaskDependencies();
  dependencyId: string;
  filesList: number;
  taskSelection: boolean;
  originalPoints: number;
  estimateHours: number;
  sprintTaskId: string;
  remainingHours: number;
}

export class FilesVO {
  id: string;
  file: string;
  fileName: string;
}

export class TaskCommentsVO {
  id: string;
  taskId: string;
  parentCommentId: string;
  comments: string;
  createdOn: any;
  createdBy: string;
  isReply: boolean = false;
  nestedComments: NestedCommentsVO[] = [];
  openComment: boolean = false;
  isEdit: boolean = false;
  color: string;
  mentionedUsersEmail: string[] = [];
  mentionedUsersId: string[] = [];
  modifiedOn: any;
}

export class NestedCommentsVO {
  id: string;
  parentCommentId: string;
  nestedComment: string;
  createdOn: any;
  createdBy: string;
  isReply: boolean = false;
  nestedComments: NestedCommentsVO[] = [];
  openComment: boolean = false;
  isEdit: boolean = false;
  color: string;
  mentionedUsersEmail: string[] = [];
  mentionedUsersId: string[] = [];
  modifiedOn: any;
}

export class TaskboardLabelsVO {
  labels: any;
  taskboardId: string;
}

export class SubTaskVO {
  id: string;
  taskName: string;
  startDate: string;
  dueDate: string;
  taskType: string;
  status: string;
  assignTaskVO: AssignTaskVO;
}
export class TaskboardActivityLogVo {
  activityData: string;
  activityType: string;
  userId: string;
  createdOn: any;
  taskboardActivityLogVoList: any;
  totalCount: number;
}
export class WorkflowActivityLogVo {
  activityData: string;
  activityType: string;
  taskName: string;
  userId: string;
  createdOn: any;
  workflowActivityLogVoList: any;
  totalCount: number;
}

export class LabelsVO {
  labelName: string;
  labelcolor: string;
  taskboardLabelId: string;
  taskboardTaskLabelId: string;
}

export class LabelSelectedVO {
  labelName: string;
  labelcolor: string;
  isSelected: boolean;
  id: string;
  taskboardTaskLabelId: string;
}

export class AssignTaskVO {
  taskId: string;
  taskboardId: string
  assigneeUserTaskList: AssignUserTaskVO[] = [];
  assigneeGroupTaskList: AssignGroupTaskVO[] = [];
  removedAssigneeList: string[] = [];
  assignedUserIdList: string[] = [];
  taskboardLabelIdList: string[] = [];
  taskboardPriorityList: string[] = [];
  isUnAssignedUser: boolean;
  isNoLabel: boolean;
  isNoPriority: boolean;
  searchByTaskId: string;
  filterType:string;
  startDate:string;
  endDate:string;
  filterBy:string;
  // groupBy: string;
  // id: string;
  // index: number;
  // columnName: string;
  // assigneeIndex: number;
}

export class AssignUserTaskVO {
  id: string;
  assigneeUser: string;
}

export class AssignGroupTaskVO {
  id: string;
  assigneeGroup: string;
}

export class UserVO {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  emailId: string;
  contactEmailId: string;
  password: string;
  userType: string;
  userRole: any[];
  globalSpecification: string;
  unReadMessageCount: number;
  recipientEmails: string;
  senderEmail: string;
  subject: string;
  messageBody: string;
  inviteUser: string;
  mobileNumber: string;
  groupId: any[];
  isSelected: boolean;
  filter: boolean = true;
  groupVOList: GroupVO[];
  randomColor: string;
  color: string;
}

export class GroupVO {
  groupId: any;
  groupName: string;
  groupDesc: string;
  isSelected: boolean;
  color: string;
}

export class Subtask {
  id: string;
  subtaskStatus: string;
  dueDate: any;
  startDate: any;
  subtaskName: string;
  taskboardId: string;
  taskboardTaskId: string;
  subStatus: string;
  taskId: string;
}

export class TaskboardTaskLabelVO {
  public id: string;
  public labels: LabelsVO[] = [];
  public removedIdList: string[] = [];
}


