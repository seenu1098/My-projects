
import { NodePosition } from '@swimlane/ngx-graph';
import { TaskProperty } from '../../task-property/task-property-vo';

export interface TaskNode {
  key: string;
  taskType: string;
  label: string;
  taskProperty?: TaskProperty;
  position?: NodePosition;
}
