import { TableObjectsVO } from 'src/app/creation-module/table-objects/table-object-vo';
import { Page } from 'src/app/rendering-module/shared/vo/page-vo';
import { EventAutomationVO } from '../event-automation/event-automation.model';
import { TaskboardLabelsVO, TaskboardTaskVO } from '../taskboard-form-details/taskboard-task-vo';
import { Workflow } from '../../designer-module/task-flow/model/workflow.model';
import { ColumnSecurityListVO, TaskboardColumnSecurityVO } from '../taskboard-security/security.vo';
import { SprintSettings } from '../sprint-dialog/sprint-model';
export class TaskboardVO {
  id: string;
  name: string;
  generatedTaskId: string;
  description: string;
  taskboardLabels: any;
  taskComments: any;
  taskboardColumns: TaskboardColumns[] = [];
  formType: any;
  taskName: string;
  removedColumnsIdList: string[] = [];
  parentTaskLength: number;
  taskboardKey: string;
  isTaskBoardOwner: boolean;
  isColumnBackground: boolean;
  formId: string;
  version: number;
  taskboardSecurity: ResolveSecurityForTaskboardVO;
  taskboardColumnMapVO: TaskboardColumnMapVO[] = [];
  startColumn: string;
  sprintEnabled: boolean;
  sprintsVoList: any[] = [];
  sprintSettingsVo = new SprintSettings();
  expanded: boolean;
  fieldMapping: any;
  launchButtonName: string;
}


export class ResolveSecurityForTaskboardVO {
  read: boolean;
  update: boolean;
  delete: boolean;
}
export class TaskboardColumns {
  id: string;
  columnName: string;
  columnOrder: number;
  columnColor: string;
  taskCounts: number;
  formId: string;
  version: number;
  layoutType: string;
  isColumnBackground: boolean;
  subStatus: SubStatusVO[] = [];
  taskboardColumnSecurity = new ResolveSecurityForTaskboardVO();
  taskCount: number;
  isDoneColumn: boolean;
}

export class SubStatusVO {
  id: string;
  name: string;
  color: string;
  border: string;
  columnOrder: number;
  previousName: string;
  taskLength = 0;
  isSelected = false;
  collapse = false;
}

export class StatusList {
  name: string;
  color: string;
  subStatusList: SubStatusVO[] = [];
}

export class TaskboardSubStatusVO {
  taskboardColumnId: string;
  subStatus: SubStatusVO[] = [];
  deletedIdList: string[] = [];
}

export interface Status {
  status: string;
  id: string;
}

export interface ProgressName {
  index: number;
  value: string;
}

export class ReplaceColumnVO {
  columnId: string;
  taskboardId: string;
  oldColumnName: string;
  newColumnName: string;
}

export class TaskSequenceVO {
  taskboardId: string;
  taskSequenceNumber: TaskSequenceNumber[] = [];
  columnName: string;
}

export class TaskSequenceNumber {
  sequenceNumber: number;
  taskName: string;
  taskId: string;
}

export class TaskboardColumnMapVO {
  taskboardColumnsVO: TaskboardColumns;
  taskboardTaskVOList: TaskboardTaskVO[] = [];
  taskLength = 0;
  containerHeight: string;
  isSubtask = false;
}

export class TaskboardTemplatesVO {
  id: string;
  templateName: string;
  data = new TaskboardTemplateJson();
  category: string;
  description: string;
}

export class WorkflowTemplatesVO {
  id: string;
  templateName: string;
  workflowData = new TaskboardTemplateJson();
  category: string;
  description: string;
}

export class WorkflowTemplateJson {
  workflowVO: Workflow;
  page: Page;
  tableObjectListVO: TableObjectsVO[];
  automations: EventAutomationVO[] = [];
  taskboardLabels = new TaskboardLabelsVO();
}

export class TaskboardTemplateJson {
  taskboardVO: TaskboardVO;
  page: Page;
  tableObjectListVO: TableObjectsVO[];
  automations: EventAutomationVO[] = [];
  taskboardLabels = new TaskboardLabelsVO();
}

export class TaskboardTemplatesCategories {
  category: string;
  templates: TaskboardTemplatesVO[] = [];
}

export class WorkflowTemplatesCategories {
  category: string;
  templates: WorkflowTemplatesVO[] = [];
}

export class LabelsVO {
  labelName: string;
  labelcolor: string;
  taskboardLabelId: string;
  taskboardTaskLabelId: string;
  isSelected: boolean;
}

export class TaskboardTaskLabelVO {
  public id: string;
  public labels: LabelsVO[] = [];
  public removedIdList: string[] = [];
}


export class TaskboardExcelVO {
  taskboardId: any;
  workspaceId: any;
}

export class GroupByVO {
  id: string;
  groupBy: string;
  index: number;
  sprintId: string;
  assignedUserIdList: string[] = [];
  taskboardLabelIdList: string[] = [];
  taskboardPriorityList: string[] = [];
  isUnAssignedUser: boolean;
  isNoLabel: boolean;
  isNoPriority: boolean;
  searchByTaskId: string;
  assigneeIndex: number = 0;
  isForCount: boolean = false;
  columnName: string;
  filterType:string;
  startDate:string;
  endDate:string;
  filterBy:string;
}