import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GroupByVO, TaskboardColumns, TaskboardVO } from '../taskboard-configuration/taskboard.model';
import { AssignTaskVO } from '../taskboard-form-details/taskboard-task-vo';

@Injectable({
  providedIn: 'root'
})
export class TaskServiceService {

  private getTaskboardTasksUrl = environment.workflowBaseurl + '/taskboard/v1/get-grid-view';
  private getAssigneeCombinationUrl = environment.workflowBaseurl + '/taskboard/v1/get-assignee-combinations';

  columnName: string;
  columnIndex: number;
  taskIndex: number;
  allTasksLoad = false;
  columns: TaskboardColumns[] = [];
  taskboardVO = new TaskboardVO();
  assigneeCombinations: TaskboardColumns[] = [];
  sprintId: string;
  connectedTo: string[] = [];
  groupByList: any[] = [
    { name: 'Status', value: 'status', icon: 'unfold_more' },
    { name: 'Assignee', value: 'assignee', icon: 'group' },
    { name: 'Priority', value: 'priority', icon: 'flag' }
  ];

  priorityArray: any[] = [
    { name: 'No Priority', color: '', isSelected: false },
    { name: 'Urgent', color: 'red', isSelected: false },
    { name: 'High', color: 'orange', isSelected: false },
    { name: 'Medium', color: 'yellow', isSelected: false },
    { name: 'Low', color: '#37bdff', isSelected: false },
  ];

  constructor(private http: HttpClient) { }

  loadColumns(groupBy: string, taskboardVO: TaskboardVO): void {
    this.columns = [];
    if (groupBy === 'Priority') {
      this.priorityArray.forEach(p => {
        const column = new TaskboardColumns();
        column.columnName = p.name;
        this.columns.push(column);
      });
    } else if (groupBy === 'Status') {
      taskboardVO.taskboardColumns.forEach(c => {
        const column = new TaskboardColumns();
        column.columnName = c.columnName;
        this.columns.push(column);
      });
    } else if (groupBy === 'Assignee') {
      this.assigneeCombinations.forEach(c => {
        const column = new TaskboardColumns();
        column.columnName = c.columnName;
        this.columns.push(column);
      });
    }
    this.connectedTo = [];
    this.columns.forEach(c => {
      this.connectedTo.push(c.columnName);
    });
  }

  loadTasks(taskboardVO: TaskboardVO, columnName: string, index: number, groupBy: string, columnIndex: number, asssignVO: AssignTaskVO): void {
    if (columnIndex === 0 && index === 0) {
      columnName = this.columns[0].columnName;;
    }
    this.columnName = columnName;
    this.columnIndex = columnIndex;
    this.taskIndex = index;
    let groupByVO = new GroupByVO();
    groupByVO.isNoLabel = asssignVO.isNoLabel;
    groupByVO.isNoPriority = asssignVO.isNoPriority;
    groupByVO.isUnAssignedUser = asssignVO.isUnAssignedUser;
    groupByVO.searchByTaskId = asssignVO.searchByTaskId;
    groupByVO.taskboardLabelIdList = asssignVO.taskboardLabelIdList;
    groupByVO.taskboardPriorityList = asssignVO.taskboardPriorityList;
    groupByVO.assignedUserIdList = asssignVO.assignedUserIdList;
    groupByVO.id = taskboardVO.id;
    groupByVO.groupBy = this.groupByList.find(g => g.name === groupBy)['value'];
    groupByVO.index = index;
    groupByVO.columnName = columnName;
    groupByVO.filterType = asssignVO.filterType;
    groupByVO.filterBy = asssignVO.filterBy;
    groupByVO.startDate = asssignVO.startDate;
    groupByVO.endDate = asssignVO.endDate;
    this.http.post<TaskboardVO>(this.getTaskboardTasksUrl, groupByVO).subscribe(boardVO => {
      if (columnIndex === 0 && index === 0) {
        taskboardVO.taskboardColumnMapVO = [];
      }
      boardVO.taskboardColumnMapVO.forEach(columnMap => {
        let selectedColumnMap = taskboardVO.taskboardColumnMapVO.find(c => c.taskboardColumnsVO.columnName === columnMap.taskboardColumnsVO.columnName)
        if (selectedColumnMap) {
          selectedColumnMap.taskboardTaskVOList.push(...columnMap.taskboardTaskVOList);
          selectedColumnMap.taskboardTaskVOList = selectedColumnMap.taskboardTaskVOList?.filter((v, i) => selectedColumnMap.taskboardTaskVOList.findIndex(item => item.id === v.id) === i);
        } else {
          if (columnMap?.taskboardTaskVOList.length > 0) {
            columnMap.taskboardTaskVOList = columnMap.taskboardTaskVOList.filter((v, i) => columnMap.taskboardTaskVOList.findIndex(item => item.id === v.id) === i);
          }
          taskboardVO.taskboardColumnMapVO.push(columnMap);
        }
      });
      this.taskboardVO = taskboardVO;
      this.setAssigntaskVO(taskboardVO);
      this.loadSubTasks(taskboardVO);
      if (boardVO.taskboardColumnMapVO[boardVO.taskboardColumnMapVO.length - 1]?.taskboardTaskVOList.length < 20
        && this.columns[this.columns.length - 1].columnName !== boardVO.taskboardColumnMapVO[boardVO.taskboardColumnMapVO.length - 1]?.taskboardColumnsVO.columnName) {
        const newColumnName = this.columns[columnIndex + 1]?.columnName;
        this.loadTasks(taskboardVO, newColumnName, 0, groupBy, columnIndex + 1, asssignVO);
      } else if (boardVO.taskboardColumnMapVO[boardVO.taskboardColumnMapVO?.length - 1]?.taskboardTaskVOList?.length === 0) {
        if (this.columns.length - 1 !== columnIndex) {
          const newColumnName = this.columns[columnIndex + 1].columnName;
          this.loadTasks(taskboardVO, newColumnName, 0, groupBy, columnIndex + 1, asssignVO);
        } else if (this.columns.length - 1 === columnIndex && boardVO.taskboardColumnMapVO[0].taskboardTaskVOList.length === 0) {
          this.allTasksLoad = true;
        }
      }
    });
  }

  loadAssigneeConmbinations(): void {
    let groupByVO = new GroupByVO();
    groupByVO.id = this.taskboardVO.id;
    if (this.sprintId) {
      groupByVO.sprintId = this.sprintId;
    }
    this.http.post<TaskboardVO>(this.getAssigneeCombinationUrl, groupByVO).subscribe(combination => {
      this.assigneeCombinations = combination.taskboardColumns;
    });
  }

  loadAssigneeCombinationsWithFilter(taskboardVO: TaskboardVO): void {
    this.assigneeCombinations = [];
    taskboardVO.taskboardColumnMapVO.forEach(c => {
      this.assigneeCombinations.push(c.taskboardColumnsVO);
    });
  }

  setAssigntaskVO(taskboardVO): void {
    taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
      columnMap.taskboardTaskVOList.forEach(task => {
        if (task.assignTaskVO === undefined || task.assignTaskVO === null) {
          const assignTaskVO = new AssignTaskVO();
          task.assignTaskVO = assignTaskVO;
        }
      });
    });
  }

  loadSubTasks(taskboardVO): void {
    taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
      columnMap.taskboardTaskVOList.forEach(task => {
        task.subTaskVO = columnMap.taskboardTaskVOList?.filter(subtask => task.subTasks?.find(subTaskVO => subTaskVO.id === subtask.id));
      });
    });
  }

}
