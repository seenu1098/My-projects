import { DatePipe } from '@angular/common';
import { Component, OnInit, ElementRef, Input, EventEmitter, Output, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { AddWidgetComponent } from '../add-widget/add-widget.component';
import { DashboardWidgetVO, WorkspaceDashboardVO } from '../landing-page/dashboard-vo';
import { DashboardChartVO, PaginatorForTaskboard, TaskboardTasksVO, BoardNameVo, StatusVo, PaginatorForWorkflow, WorkflowTasksVO } from '../landing-page/landing-page-vo';
import { PaginationVO } from 'src/app/mytasks-module/mytasks/pagination-vo';
import * as Highcharts from 'highcharts';
import { WorkspaceDashboardService } from './workspace-dashboard.service';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { WidgetPreviewComponent } from '../widget-preview/widget-preview.component';
import { TaskboardFormDetailsComponent } from '../../taskboard-module/taskboard-form-details/taskboard-form-details.component';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { GroupVO, TaskboardTaskVO, UserVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { StatusList, TaskboardColumnMapVO } from 'src/app/taskboard-module/taskboard-configuration/taskboard.model';
import { ThemeService } from 'src/app/services/theme.service';
import { CreateDialogService } from 'src/app/workspace-module/create-dialog/create-dialog.service';
import { WorkspaceListVO } from 'src/app/workspace-module/create-dialog/create-dialog-vo';
import { ConfirmationDialogComponent } from 'src/app/workspace-module/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { MyTaskService } from 'src/app/mytasks-module/mytasks/my-task.service';
import { TasklistService } from '../tasklist.service';
import { OpenFormDialogBoxComponent } from '../../engine-module/open-form-dialog-box/open-form-dialog-box.component';
import { ProcessInstanceListVO } from '../ProcessInstanceListVO';
import { Paginator } from 'src/app/shared-module/paginator/paginatorVO';
import { ProcessInstanceListService } from '../process-instance-list/process-instance-list.service';
import { MatPaginator } from '@angular/material/paginator';
import { DateFilterComponent } from '../date-filter/date-filter.component';
import { forkJoin, merge } from 'rxjs';
import { CreateOrganizationService } from 'src/app/creation-module/create-organization/create-organization.service';
interface DragFixedConfig {
  target: HTMLElement;
  originWidth: number;
  movedWidth: number;
  minWidth: number;
}
@Component({
  selector: 'app-workspace-dashboard',
  templateUrl: './workspace-dashboard.component.html',
  styleUrls: ['./workspace-dashboard.component.scss']
})
export class WorkspaceDashboardComponent implements OnInit {
  getWidget = {
    chart: {
      type: 'pie'
    },
    title: {
      text: ''
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    accessibility: {
      point: {
        valueSuffix: ''
      }
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    plotOptions: {
      pie: {
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [{
      name: 'Tasks',
      colorByPoint: true,
      data: [{
        name: 'Todo',
        y: 30,
      }, {
        name: 'Progress',
        y: 15
      }, {
        name: 'Development',
        y: 15
      }, {
        name: 'Testing',
        y: 20
      }, {
        name: 'Completed',
        y: 20
      }]
    }]
  };

  assigneeTaskByTaskname = {
    chart: {
      type: 'pie'
    },
    title: {
      text: ''
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    accessibility: {
      point: {
        valueSuffix: ''
      }
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    plotOptions: {
      pie: {
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [{
      name: 'Tasks',
      colorByPoint: true,
      data: [{
        name: 'Todo',
        y: 30,
      }, {
        name: 'Progress',
        y: 15
      }, {
        name: 'Development',
        y: 15
      }, {
        name: 'Testing',
        y: 20
      }, {
        name: 'Completed',
        y: 20
      }]
    }]
  };

  assigneeTaskByTasknameHorBar = {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Workload by status'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  assigneeTaskByTasknameVerBar = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Tasks By Assignee'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  teamsTaskByTaskname = {
    chart: {
      type: 'pie'
    },
    title: {
      text: ''
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    accessibility: {
      point: {
        valueSuffix: ''
      }
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    plotOptions: {
      pie: {
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [{
      name: 'Tasks',
      colorByPoint: true,
      data: [{
        name: 'Todo',
        y: 30,
      }, {
        name: 'Progress',
        y: 15
      }, {
        name: 'Development',
        y: 15
      }, {
        name: 'Testing',
        y: 20
      }, {
        name: 'Completed',
        y: 20
      }]
    }]
  };

  teamsTaskByTasknameHorBar = {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Workload by status'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  teamsTaskByTasknameVerBar = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Tasks By Assignee'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  workflowTaskByUsersHorBar = {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Workflow tasks by users'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  workflowTaskByUsersVerBar = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Workflow tasks by users'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  workflowTaskByTeamsHorBar = {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Workflow tasks by teams'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  workflowTaskByTeamsVerBar = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Workflow tasks by teams'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  workflowTaskByUsers = {
    chart: {
      type: 'pie'
    },
    title: {
      text: ''
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    accessibility: {
      point: {
        valueSuffix: ''
      }
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    plotOptions: {
      pie: {
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [{
      name: 'Tasks',
      colorByPoint: true,
      data: [{
        name: 'Todo',
        y: 30,
      }, {
        name: 'Progress',
        y: 15
      }, {
        name: 'Development',
        y: 15
      }, {
        name: 'Testing',
        y: 20
      }, {
        name: 'Completed',
        y: 20
      }]
    }]
  };

  workflowTaskByTeams = {
    chart: {
      type: 'pie'
    },
    title: {
      text: ''
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    accessibility: {
      point: {
        valueSuffix: ''
      }
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    plotOptions: {
      pie: {

        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [{
      name: 'Tasks',
      colorByPoint: true,
      data: [{
        name: 'Todo',
        y: 30,
      }, {
        name: 'Progress',
        y: 15
      }, {
        name: 'Development',
        y: 15
      }, {
        name: 'Testing',
        y: 20
      }, {
        name: 'Completed',
        y: 20
      }]
    }]
  };

  getAssigneeTasks = {
    chart: {
      type: 'pie'
    },
    title: {
      text: ''
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    accessibility: {
      point: {
        valueSuffix: ''
      }
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    plotOptions: {
      pie: {

        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [{
      name: 'Assignee',
      colorByPoint: true,
      data: [{
        name: 'User 1',
        y: 30,
      }, {
        name: 'User 2',
        y: 15
      }, {
        name: 'User 3',
        y: 15
      }, {
        name: 'User 4',
        y: 20
      }, {
        name: 'User 5',
        y: 20
      }]
    }]
  };



  dataType = {
    number: [{ value: 'eq', description: $localize`:dataTyperq:equals` },
    { value: 'gt', description: $localize`:dataTypegt:greater than` },
    { value: 'ge', description: $localize`:dataTypege:greater than or equal to` },
    { value: 'lt', description: $localize`:dataTypelt:less than` },
    { value: 'le', description: $localize`:dataTypele:less than or equal to` },
    ],
    string: [
      { value: 'eq', description: $localize`:stringeq:equals` },
      { value: 'bw', description: $localize`:stringbw:begins with` },
      { value: 'ew', description: $localize`:stringew:ends with` },
      { value: 'cn', description: $localize`:stringcn:contains` },
    ],
    assigned_to: [
      { value: 'eq', description: $localize`:assigned_toeq:equals` },
      { value: 'ne', description: $localize`:assigned_tone:not equals` },
      { value: 'cn', description: $localize`:assigned_tocn:contains` }
    ]
  };


  workloadByStatusVerBar = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Workload by status'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  tasksByAssigneeVerBar = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Tasks By Assignee'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  workloadByStatusHorBar = {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Workload by status'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  tasksByAssigneeHorBar = {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Tasks By Assignee'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  getPiePriorityChart = {
    chart: {
      type: 'pie'
    },
    title: {
      text: ''
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    accessibility: {
      point: {
        valueSuffix: ''
      }
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    plotOptions: {
      pie: {

        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    },
    series: [{
      name: 'Tasks',
      colorByPoint: true,
      data: [{
        name: 'Todo',
        y: 30,
      }, {
        name: 'Progress',
        y: 15
      }, {
        name: 'Development',
        y: 15
      }, {
        name: 'Testing',
        y: 20
      }, {
        name: 'Completed',
        y: 20
      }]
    }]
  };

  getVerticalBarPriorityChart = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Priority Breakdown'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57]
    }]
  };

  getHorizontalBarPriorityChart = {
    chart: {
      type: 'bar'
    },
    exporting: { enabled: false },
    title: {
      text: 'Priority Breakdown'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    series: [{
      name: '',
      data: [45, 67, 57],
    }]
  };

  showTaskList = false;
  showTasksByAssignee = false;
  showTasksByAssigneeGraph = false;
  showTasksInProgress = false;
  showClosedTasks = false;
  showCompletedTasks = false;
  showUnassignedTasks = false;
  showPortfolio = false;
  showWidgets = false;
  showNumberOfTasksInProgress = false;
  showNumberOfTasksInCompleted = false;
  showNumberOfTasksClosed = false;
  showTasksByAssigneeVerBar = false;
  showTasksByAssigneeHorBar = false;
  showWorkflowTasksByUsers = false;
  showWorkflowTasksByTeams = false;
  progressTaskboardVO: TaskboardTasksVO[] = [];
  completedTaskboardVO: TaskboardTasksVO[] = [];
  deletedTaskboardVO: TaskboardTasksVO[] = [];
  unassignedTaskboardVO: TaskboardTasksVO[] = [];
  portfolioTaskboardVO: any[] = [];
  deletedTaskboardLength: any;
  progressTaskboardLength: any;
  completedTaskboardLength: any;
  unassignedTaskboardLength: any;
  numberOfTasksInProgress: any;
  numberOfTasksClosed: any;
  numberOfTasksCompleted: any;
  totalUnassignedTasks: any;
  totalAssignedTaskCount: any;
  urgentTaskCount: any;
  highTaskCount: any;
  mediumTaskCount: any;
  lowTaskCount: any;
  noPriorityTaskCount: any;
  portfolioLength: any;
  widgetName: string;
  boardNamesVO: BoardNameVo[] = [];
  taskListBoardNamesVO: BoardNameVo[] = [];
  unAssignedTaskBoardNamesVO: BoardNameVo[] = [];
  taskInProgressBoardNamesVO: BoardNameVo[] = [];
  taskDeletedBoardNamesVO: BoardNameVo[] = [];
  taskCompletedBoardNamesVO: BoardNameVo[] = [];
  taskStatisticsBoardNamesVO: BoardNameVo[] = [];
  workloadByStatusBoardNamesVO: BoardNameVo[] = [];
  workloadByStatusHorBarBoardNamesVO: BoardNameVo[] = [];
  workloadByStatusVerBarBoardNamesVO: BoardNameVo[] = [];
  taskByAssigneeBoardNamesVO: BoardNameVo[] = [];
  numberOfProgressBoardNamesVO: BoardNameVo[] = [];
  numberOfClosedBoardNamesVO: BoardNameVo[] = [];
  numberOfCompletedBoardNamesVO: BoardNameVo[] = [];
  taskByAssigneeHorBoardNamesVO: BoardNameVo[] = [];
  taskByAssigneeVerBoardNamesVO: BoardNameVo[] = [];
  totalUnassignedTaskBoardNamesVO: BoardNameVo[] = [];
  totalAssignedNotCompletedTaskBoardNamesVO: BoardNameVo[] = [];
  priorityBreakdownTaskBoardNamesVO: BoardNameVo[] = [];
  priorityBreakdownHorTaskBoardNamesVO: BoardNameVo[] = [];
  priorityBreakdownVerTaskBoardNamesVO: BoardNameVo[] = [];
  totalUrgentTaskBoardNamesVO: BoardNameVo[] = [];
  totalLowTaskBoardNamesVO: BoardNameVo[] = [];
  totalHighTaskBoardNamesVO: BoardNameVo[] = [];
  totalMediumTaskBoardNamesVO: BoardNameVo[] = [];
  totalNoPriorityTaskBoardNamesVO: BoardNameVo[] = [];
  totalPastDueTasksBoardNamesVO: BoardNameVo[] = [];
  totalDueTodayTasksBoardNamesVO: BoardNameVo[] = [];
  totalDueTomorrowTasksBoardNamesVO: BoardNameVo[] = [];
  totalDueInSevenTasksTasksBoardNamesVO: BoardNameVo[] = [];
  dashboardChartVO = new DashboardChartVO();
  workloadByStatusChartVO = new DashboardChartVO();
  workloadByStatusHorBarChartVO = new DashboardChartVO();
  workloadByStatusVerBarChartVO = new DashboardChartVO();
  taskByAssigneeChartVO = new DashboardChartVO();
  taskByAssigneeHorChartVO = new DashboardChartVO();
  taskByAssigneeVerChartVO = new DashboardChartVO();
  priorityBreakdownTaskChartVO = new DashboardChartVO();
  priorityBreakdownHorTaskChartVO = new DashboardChartVO();
  priorityBreakdownVerTaskChartVO = new DashboardChartVO();
  totalUrgentTaskChartVO = new DashboardChartVO();
  totalLowTaskBoardChartVO = new DashboardChartVO();
  totalHighTaskBoardChartVO = new DashboardChartVO();
  totalMediumTaskBoardChartVO = new DashboardChartVO();
  totalNoPriorityTaskBoardChartVO = new DashboardChartVO();
  assigneeTaskByTasknameChartVO = new DashboardChartVO();
  teamsTaskByTasknameChartVO = new DashboardChartVO();
  assigneeTaskByTasknameHorChartVO = new DashboardChartVO();
  teamsTaskByTasknameHorChartVO = new DashboardChartVO();
  assigneeTaskByTasknameVerChartVO = new DashboardChartVO();
  teamsTaskByTasknameVerChartVO = new DashboardChartVO();
  taskByTeamsChartVO = new DashboardChartVO();
  taskByTeamsHorChartVO = new DashboardChartVO();
  taskByTeamsVerChartVO = new DashboardChartVO();
  workflowTasksByAssigneeChartVO = new DashboardChartVO();
  workflowTasksByAssigneeHorChartVO = new DashboardChartVO();
  workflowTasksByAssigneeVerChartVO = new DashboardChartVO();
  numberOfWorkflowRunningPaginationVO = new PaginationVO();
  numberOfWorkflowFailedPaginationVO = new PaginationVO();
  numberOfWorkflowCompletedPaginationVO = new PaginationVO();
  failedTaskPaginationVO = new PaginationVO();
  runningTaskPaginationVO = new PaginationVO();
  completedTaskPaginationVO = new PaginationVO();
  workspaceDashboardVO = new WorkspaceDashboardVO();
  paginationVO = new PaginationVO();
  taskListPaginationVO = new PaginationVO();
  tasksbyAssigneePaginationVO = new PaginationVO();
  workloadbyStatusPaginationVO = new PaginationVO();
  tasksInProgressPaginationVO = new PaginationVO();
  tasksDeletedPaginationVO = new PaginationVO();
  tasksCompletedPaginationVO = new PaginationVO();
  unassignedTasksPaginationVO = new PaginationVO();
  taskboardStatisticsPaginationVO = new PaginationVO();
  numberOfProgressPaginationVO = new PaginationVO();
  numberOfClosedPaginationVO = new PaginationVO();
  numberOfCompletedPaginationVO = new PaginationVO();
  totalUnassignedTaskPaginationVO = new PaginationVO();
  totalAssignedNotCompletedTaskPaginationVO = new PaginationVO();
  totalPastDueTasksPaginationVO = new PaginationVO();
  totalDueTodayTasksPaginationVO = new PaginationVO();
  totalDueTomorrowTasksPaginationVO = new PaginationVO();
  totalDueInSevenTasksTasksPaginationVO = new PaginationVO();
  totalPastDueWorkflowTasksPaginationVO = new PaginationVO();
  totalDueTodayWorkflowTasksPaginationVO = new PaginationVO();
  totalDueTomorrowWorkflowTasksPaginationVO = new PaginationVO();
  totalDueInSevenWorkflowTasksTasksPaginationVO = new PaginationVO();
  workflowPaginationVo = new PaginationVO();
  paginatorForTaskboard = new PaginatorForTaskboard();
  paginatorForTaskList = new PaginatorForTaskboard();
  paginatorForTaskboardStatistics = new PaginatorForTaskboard();
  paginatorForUnassignedTasks = new PaginatorForTaskboard();
  paginatorForTasksInProgress = new PaginatorForTaskboard();
  paginatorForTasksDeleted = new PaginatorForTaskboard();
  paginatorForTasksCompleted = new PaginatorForTaskboard();

  sortForTaskList: Sort;
  sortForTaskboardStatistics: Sort;
  sortForUnassignedTasks: Sort;
  sortForTasksInProgress: Sort;
  sortForTasksDeleted: Sort;
  sortForTasksCompleted: Sort;
  paginatorForTotalUnassignedTaskCount = new PaginatorForTaskboard();
  tasksbyAssigneeFilterCount = 0;
  workloadbyStatusFilterCount = 0;
  workloadByStatusHorBarFilterCount = 0;
  workloadByStatusVerBarFilterCount = 0;
  tasksInProgressFilterCount = 0;
  tasksDeletedFilterCount = 0;
  tasksCompletedFilterCount = 0;
  unassignedTasksFilterCount = 0;
  taskboardStatisticsFilterCount = 0;
  taskListFilterCount = 0;
  numberOfProgressTaskFilterCount = 0;
  numberOfClosedTaskFilterCount = 0;
  numberOfCompletedTaskFilterCount = 0;
  tasksbyAssigneeHorFilterCount = 0;
  tasksbyAssigneeVerFilterCount = 0;
  totalUnAssignedTaskFilterCount = 0;
  totalAssignedNotCompletedTaskFilterCount = 0;
  priorityBreakdownTaskFilterCount = 0;
  priorityBreakdownHorTaskFilterCount = 0;
  priorityBreakdownVerTaskFilterCount = 0;
  totalUrgentTaskFilterCount = 0;
  totalLowTaskFilterCount = 0;
  totalHighTaskFilterCount = 0;
  totalMediumTaskFilterCount = 0;
  totalNoPriorityTaskFilterCount = 0;
  totalPastDueTasksFilterCount = 0;
  totalDueTodayTasksFilterCount = 0;
  totalDueTomorrowTasksFilterCount = 0;
  totalDueInSevenTasksFilterCount = 0;
  showWorkload = false;
  showWorkloadGraph = false;
  showWorkloadByStatusVerBar = false;
  showWorkloadByStatusHorBar = false;
  showTotalUnassignedTasks = false;
  showPriorityBreakdown = false;
  showPriorityBreakdownForVerticalBarChart = false;
  showPriorityBreakdownForHorizontalBarChart = false;
  showAssigneeTaskByTaskname = false;
  showTeamsTaskByTaskname = false;
  showAssigneeTaskByTasknameHorBar = false;
  showAssigneeTaskByTasknameVerBar = false;
  showTeamsTaskByTasknameHorBar = false;
  showTeamsTaskByTasknameVerBar = false;
  showNumberOfRunningTasks = false;
  showNumberOfFailedTasks = false;
  showNumberOfCompletedTasks = false;
  showWorkflowTasksByUsersHorBar = false;
  showWorkflowTasksByUsersVerBar = false;
  showWorkflowTasksByTeamsHorBar = false;
  showWorkflowTasksByTeamsVerBar = false;
  showTotalAssignedNotCompletedTasks = false;
  showTotalUrgentTasks = false;
  showTotalHighTasks = false;
  showTotalMediumTasks = false;
  showTotalLowTasks = false;
  showTotalNoPriorityTasks = false;
  isPaginator = false;
  isworkFlowPaginator = false;
  isworkflowLength = false;
  isLength = false;

  defaultPageSize = 5;
  sortForTaskboard: Sort;
  defaultColumnForTaskboard = 'created_on';
  defaultSortDirection = 'desc';
  taskboardDue = 'all';
  taskboardVO: TaskboardTasksVO[] = [];
  taskboardLength: any;
  highcharts = Highcharts;
  displayedPortfolioColumns: string[] = ['board_name', 'workspace_name', 'progress', 'completed', 'owner'];
  displayedColumns: string[] = ['task_id', 'board_name', 'workspace_name', 'task_name', 'created_on', 'due_date', 'status', 'assignedTo'];
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  displayProcessIntanceColumns: string[] = ['col2', 'col6', 'col3', 'col7', 'col4', 'col5'];
  switchDue = [
    { name: 'All', value: 'all' },
    { name: 'Past Due', value: 'pastDue' },
    { name: 'Due Today', value: 'dueToday' },
    { name: 'Due Tomorrow', value: 'dueTomorrow' },
    { name: 'Due in 7 Days', value: 'dueInSevenDays' }
  ];
  modes = [
    { name: 'Editing', icon: 'edit', isSelected: false },
    { name: 'Viewing', icon: 'visibility', isSelected: false }
  ];
  screenHeight: any;
  screenWidth: any;
  dashboardNameList: any[] = [];
  activeElement: string;
  dashboardId: string;
  public config: PerfectScrollbarConfigInterface = {};
  public dragStartLeft: number;
  addName = false;
  noDashboard = false;
  form: FormGroup;
  filterCount = 0;
  dashboardKey: any;
  wokspaceSwapVO: any[] = [];
  viewMode: any = 'Viewing';
  dashboardFilter: any[] = [];
  taskboardTaskVOList: TaskboardTaskVO[] = [];
  taskIdFromUrl: any;
  viewTaskVO: any;
  taskboardColumnMapVO: TaskboardColumnMapVO[] = [];
  taskboardColumns: any[] = [];
  taskBoardTaskVO = new TaskboardTaskVO();
  selectedColumn: string;
  selectedColumnIndex: number;
  selectedTaskIndex: any;
  mappedTask: any;
  usersList: UserVO[] = [];
  userGroupList: UserVO[] = [];
  groupList: GroupVO[] = [];
  previousDashboard: any;
  workspaceListVO: WorkspaceListVO[];
  filteredDashboardNameList: any[];
  taskListForm: FormGroup;
  progressForm: FormGroup;
  unAssignForm: FormGroup;
  completedTaskForm: FormGroup;
  deletedTaskForm: FormGroup;
  portfolioForm: FormGroup;
  dateFilterForm: FormGroup;
  filterOperator: string;
  columnId: any;
  isDateField = false;
  filterDatatype: any;
  type = 'text';
  selectedItem: any;
  filterCountForTaskboard = 0;
  checkTaskboardAssignedTo = false;
  statusVO: StatusVo[] = [];
  statusVOAssigneeList: StatusVo[] = [];
  statusVOCompletedList: StatusVo[] = [];
  statusVODeletedList: StatusVo[] = [];
  statusVOInProgressList: StatusVo[] = [];
  isFromPreview = false;
  @Input() widget: any;
  @Input() pagination: any;
  @Input() dashboardChart: any;
  @Output() widgetEvent = new EventEmitter<any>();
  @Input() boardNames: any[] = [];
  dashId: any;
  totalPastDueTasks: any;
  totalDueTodayTasks: any;
  totalDueTomorrowTasks: any;
  totalDueInSevenDays: any;
  totalWorkflowPastDueTasks: any;
  totalWorkflowDueTodayTasks: any;
  totalWorkflowDueTomorrowTasks: any;
  totalWorkflowDueInSevenDays: any;
  totalNumberOfRunningTasks: number;
  totalNumberOfFailedTasks: number;
  totalNumberOfCompletedTasks: number;
  sortForWorkflow: Sort;
  defaultColumnForWorkflow = 'created_date';
  paginatorsForWorkflow = new PaginatorForWorkflow();
  workflowVO: WorkflowTasksVO[] = [];
  workflowLength: any;
  isWorkFlowLength = false;
  isWorkflowPaginator = false;
  displayedColumnsForWorkflow: string[] = ['task_name', 'workspace_name', 'createdDate', 'dueDate', 'assigned_to', 'assigned_to_group', 'action'];
  completedProcessInstanceList: any[] = [];
  failedProcessInstanceList: any[] = [];
  runningProcessInstanceList: any[] = [];
  completedListLength: any;
  failedListLength: any;
  runningListLength: any;
  completedPaginators = new Paginator();
  failedPaginators = new Paginator();
  processPaginators = new Paginator();

  maxDate: any;
  filterType: string;
  showWorkflowTaskList = false;
  taskStatus: string;
  processHeader = [
    { value: 'id', headerId: 'col1', headerName: 'Id', datatype: 'uuid', style: '' },
    { value: 'processDefName', headerId: 'col2', headerName: 'Process Name', datatype: 'string', style: '' },
    { value: 'createdBy', headerId: 'col6', headerName: 'Initiated By', datatype: 'string', style: '' },
    { value: 'startTime', headerId: 'col3', headerName: 'Initiated Date', datatype: 'date', style: '' },
    { value: 'updatedBy', headerId: 'col7', headerName: 'End By', datatype: 'string', style: '' },
    { value: 'endTime', headerId: 'col4', headerName: 'End Date', datatype: 'date', style: '' },
    { value: 'time', headerId: 'col5', headerName: 'Total Time Taken', datatype: 'number', style: '' }
  ];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  showCompletedTaskList = false;
  showRunningTaskList = false;
  showErrorTaskList = false;
  filterBoardNamesVO: any;
  dashboardListScrollHeight: string;
  isFreePlan = true;
  constructor(
    private dialog: MatDialog,
    private workspaceService: WorkspaceService,
    private workspaceDashboardService: WorkspaceDashboardService,
    private datePipe: DatePipe, private elementRef: ElementRef,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private taskboardService: TaskBoardService,
    private createDialogService: CreateDialogService,
    private router: Router,
    public activateRoute: ActivatedRoute,
    public themeService: ThemeService,
    private myTaskService: MyTaskService,
    private taskListService: TasklistService,
    private datepipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef,
    private createOrganizationService: CreateOrganizationService
  ) { }

  ngOnInit(): void {

    forkJoin([this.createOrganizationService.getOrgSubscription()]).subscribe(results => {
      if (results[0].planType === 'STARTER') {
        this.isFreePlan = true;
      } else {
        this.isFreePlan = false;
      }
    });
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1) + 'px';
      this.dashboardListScrollHeight = (window.innerHeight - 116) + 'px';
    } else {
      this.screenHeight = (window.innerHeight - 63) + 'px';
      this.dashboardListScrollHeight = (window.innerHeight - 214) + 'px';
    }

    this.loadWorkspaceList();
    if (this.widget !== undefined) {
      this.isFromPreview = true;
      this.loadWidget(this.widget);
      this.boardNamesVO = this.boardNames;
      this.getUserAndGroupList();
      this.initializeForm();
      this.initializeFilterFormTaskboard();
      this.searchFormvalueChanges();
      this.searchTaskListBoardName();
      this.searchDeletedTaskBoardName();
      this.searchProgressFormBoardName();
      this.searchUnAssignFormBoardName();
      this.searchCompletedTaskFormBoardName();
      this.searchPortfolioFormBoardName();
      this.searchWholeTaskBoardName();
    } else {
      this.activateRoute.paramMap.subscribe(params => {
        this.dashId = params.get('id');
        this.getDashboardNameList(params.get('id'));
        this.loadBoardNames();
        this.getUserAndGroupList();
        this.initializeForm();
        this.initializeFilterFormTaskboard();
        this.searchFormvalueChanges();
        this.searchTaskListBoardName();
        this.searchDeletedTaskBoardName();
        this.searchProgressFormBoardName();
        this.searchUnAssignFormBoardName();
        this.searchCompletedTaskFormBoardName();
        this.searchPortfolioFormBoardName();
        this.searchWholeTaskBoardName();
      });
    }
    this.dateForm();
    this.dateFilterForm.get('searchType').setValue('all');
  }

  openLandingDashboard() {
    this.activeElement = 'System Dashboard';
    window.history.pushState('', 'id', 'workspace-dashboard');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1) + 'px';
      this.dashboardListScrollHeight = (window.innerHeight - 116) + 'px';
    } else {
      this.screenHeight = (window.innerHeight - 63) + 'px';
      this.dashboardListScrollHeight = (window.innerHeight - 214) + 'px';
    }
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit() {
    this.changeDetectorRef.markForCheck();
    // if (this.sort !== undefined) {
    //   merge(this.sort.sortChange).subscribe(() => this.loadRunningList('IN_PROCESS'));
    // }
    this.changeDetectorRef.detectChanges();
  }

  filteredTaskboardName(data: string): void {
    const filterData = data.toLowerCase();
    const filterList: any[] = [];
    this.filterBoardNamesVO = this.boardNamesVO.filter(b => b.boardName.toLowerCase().includes(filterData))
  }

  searchWholeTaskBoardName(): void {
    this.form.get('searchBoardName').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.filteredTaskboardName(data);
      } else {
        this.filterBoardNamesVO = this.boardNamesVO;
      }
    });
  }

  searchDeletedTaskBoardName(): void {
    this.deletedTaskForm.get('searchBoardName').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.filteredTaskboardName(data);
      } else {
        this.filterBoardNamesVO = this.boardNamesVO;
      }
    });
  }
  searchTaskListBoardName(): void {
    this.taskListForm.get('searchBoardName').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.filteredTaskboardName(data);
      } else {
        this.filterBoardNamesVO = this.boardNamesVO;
      }
    });
  }
  searchProgressFormBoardName(): void {
    this.progressForm.get('searchBoardName').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.filteredTaskboardName(data);
      } else {
        this.filterBoardNamesVO = this.boardNamesVO;
      }
    });
  }
  searchUnAssignFormBoardName(): void {
    this.unAssignForm.get('searchBoardName').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.filteredTaskboardName(data);
      } else {
        this.filterBoardNamesVO = this.boardNamesVO;
      }
    });
  }
  searchCompletedTaskFormBoardName(): void {
    this.completedTaskForm.get('searchBoardName').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.filteredTaskboardName(data);
      } else {
        this.filterBoardNamesVO = this.boardNamesVO;
      }
    });
  }
  searchPortfolioFormBoardName(): void {
    this.portfolioForm.get('searchBoardName').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.filteredTaskboardName(data);
      } else {
        this.filterBoardNamesVO = this.boardNamesVO;
      }
    });
  }

  loadWorkspaceList(): void {
    this.createDialogService.listAllWorkspaceList().subscribe(res => {
      this.workspaceListVO = res;
    });
  }

  dateForm() {
    this.dateFilterForm = this.fb.group({
      searchType: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  openDateFilterDialog() {
    const dialog = this.dialog.open(DateFilterComponent, {
      width: '330px'
    });

    dialog.afterClosed().subscribe(data => {
      if (data !== false) {
        this.paginationVO.startDate = data.startDate;
        this.paginationVO.endDate = data.endDate;
        this.dashboardChartVO.startDate = data.startDate;
        this.dashboardChartVO.endDate = data.endDate;
        this.filterType = data.searchType;
        this.dashboardChartVO.filterType = data.searchType;
        this.paginationVO.filterType = data.searchType;
        for (const widgets of this.workspaceDashboardVO.dashboardWidgets) {
          this.applyWidgets(widgets.widgetName, data.startDate, data.endDate, data.searchType);
        }
      }
    });
  }

  deleteDashboard(dash) {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '400px',
      data: { type: 'delete-dashboard', name: dash.dashboardName }
    });
    dialog.afterClosed().subscribe((data) => {
      if (data === 'yes') {
        this.workspaceDashboardService.deleteDashboard(dash.id).subscribe(resp => {
          if (resp && resp.response && resp.response.includes('successfully')) {
            this.dashboardNameList = [];
            this.filteredDashboardNameList = [];
            this.activeElement = '';
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: resp.response
            });
            this.getDashboardNameList(null);
          }
        });
      }
    });
  }

  dateSearch(event) {
    const value = event.value;
    if (value === 'betweenDates') {
      this.dateFilterForm.get('startDate').setValidators([Validators.required]);
      this.dateFilterForm.get('endDate').setValidators([Validators.required]);
      this.dateFilterForm.get('startDate').updateValueAndValidity();
      this.dateFilterForm.get('endDate').updateValueAndValidity();
    } else {
      this.paginationVO.filterType = value;
      this.dashboardChartVO.filterType = value;
      this.clearDateSearchValidation();
    }
  }



  clearDateSearchValidation() {
    this.dateFilterForm.get('startDate').setValidators(null);
    this.dateFilterForm.get('endDate').setValidators(null);
    this.dateFilterForm.get('startDate').updateValueAndValidity();
    this.dateFilterForm.get('endDate').updateValueAndValidity();
  }


  clear() {
    this.paginationVO.filterType = 'all';
    this.dashboardChartVO.filterType = 'all';
    this.filterType = 'all';
    this.paginationVO.startDate = null;
    this.paginationVO.endDate = null;
    this.dashboardChartVO.startDate = null;
    this.dashboardChartVO.endDate = null;
    this.dateFilterForm.get('startDate').setValue(null);
    this.dateFilterForm.get('endDate').setValue(null);
    for (const widgets of this.workspaceDashboardVO.dashboardWidgets) {
      this.applyWidgets(widgets.widgetName, null, null, 'all');
    }
  }

  applyWidgets(widget, startDate, endDate, filterType) {

    if (widget === 'Tasks by Assignee') {
      this.showTasksByAssigneeGraph = false;
      this.taskByAssigneeChartVO.startDate = startDate;
      this.taskByAssigneeChartVO.endDate = endDate;
      this.taskByAssigneeChartVO.filterType = filterType;
      this.workspaceDashboardService.getTasksByAssigneeChart(this.taskByAssigneeChartVO).subscribe(res => {
        this.getAssigneeTasks.series[0].data = res;
        this.showTasksByAssigneeGraph = true;
      });
    } else if (widget === 'Workload by Status') {
      this.showWorkloadGraph = false;
      this.workloadByStatusChartVO.startDate = startDate;
      this.workloadByStatusChartVO.endDate = endDate;
      this.workloadByStatusChartVO.filterType = filterType;
      this.workspaceDashboardService.getWorkLoadChart(this.workloadByStatusChartVO).subscribe(res => {
        this.getWidget.series[0].data = res;
        this.showWorkloadGraph = true;
      });
    } else if (widget === 'Tasks in Progress') {
      this.showWidgets = true;
      this.showTasksInProgress = false;
      this.isLength = false;
      this.isPaginator = false;
      this.tasksInProgressPaginationVO = this.getPaginationForTasksInProgress();
      this.tasksInProgressPaginationVO.workspaceIdList = [];
      this.tasksInProgressPaginationVO.startDate = startDate;
      this.tasksInProgressPaginationVO.endDate = endDate;
      this.tasksInProgressPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getAllProgressTaskoardTask(this.tasksInProgressPaginationVO).subscribe(result => {

        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.showTasksInProgress = true;
          this.progressTaskboardVO = result.taskboardTaskVo;
          this.progressTaskboardLength = result.totalRecords;

          if (this.progressTaskboardLength !== 0 && this.progressTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const progressTaskboardVO of this.progressTaskboardVO) {
            if (progressTaskboardVO.dueDate !== undefined &&
              progressTaskboardVO.dueDate !== null && progressTaskboardVO.dueDate !== '') {
              const date = new Date(progressTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              progressTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.showTasksInProgress = true;
          this.progressTaskboardVO = [];
          this.progressTaskboardLength = 0;
        }
      });

    } else if (widget === 'Tasks Deleted') {
      this.showWidgets = true;
      this.showClosedTasks = false;
      this.isLength = false;
      this.isPaginator = false;
      this.tasksDeletedPaginationVO = this.getPaginationForTasksDeleted();
      this.tasksDeletedPaginationVO.workspaceIdList = [];
      this.tasksDeletedPaginationVO.filterColumnName = 'Progress';
      this.tasksDeletedPaginationVO.startDate = startDate;
      this.tasksDeletedPaginationVO.endDate = endDate;
      this.tasksDeletedPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getAllDeletedTaskoardTask(this.tasksDeletedPaginationVO).subscribe(result => {
        if (result) {
          this.showClosedTasks = true;
          if (result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {

            this.deletedTaskboardVO = result.taskboardTaskVo;
            this.deletedTaskboardLength = result.totalRecords;

            if (this.deletedTaskboardLength !== 0 && this.deletedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const deletedTaskboardVO of this.deletedTaskboardVO) {
              if (deletedTaskboardVO.dueDate !== undefined &&
                deletedTaskboardVO.dueDate !== null &&
                deletedTaskboardVO.dueDate !== '') {
                const date = new Date(deletedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                deletedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.showClosedTasks = true;
            this.deletedTaskboardVO = [];
            this.deletedTaskboardLength = 0;
          }
        }
      });
    } else if (widget === 'Tasks Completed') {
      this.showWidgets = true;
      this.showCompletedTasks = false;
      this.isLength = false;
      this.isPaginator = false;
      this.tasksCompletedPaginationVO = this.getPaginationForTasksCompleted();
      this.tasksCompletedPaginationVO.workspaceIdList = [];
      this.tasksCompletedPaginationVO.filterColumnName = 'Progress';
      this.tasksCompletedPaginationVO.startDate = startDate;
      this.tasksCompletedPaginationVO.endDate = endDate;
      this.tasksCompletedPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getAllDoneTaskoardTask(this.tasksCompletedPaginationVO).subscribe(result => {
        if (result) {
          this.showCompletedTasks = true;
          if (result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {

            this.completedTaskboardVO = result.taskboardTaskVo;
            this.completedTaskboardLength = result.totalRecords;

            if (this.completedTaskboardLength !== 0 && this.completedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const completedTaskboardVO of this.completedTaskboardVO) {
              if (completedTaskboardVO.dueDate !== undefined &&
                completedTaskboardVO.dueDate !== null &&
                completedTaskboardVO.dueDate !== '') {
                const date = new Date(completedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                completedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.showCompletedTasks = true;
            this.completedTaskboardVO = [];
            this.completedTaskboardLength = 0;
          }
        }
      });
    } else if (widget === 'Unassigned Tasks') {
      this.showWidgets = true;
      this.showUnassignedTasks = false;
      this.isLength = false;
      this.isPaginator = false;
      this.unassignedTasksPaginationVO = this.getPaginationForUnassignedTasks();
      this.unassignedTasksPaginationVO.workspaceIdList = [];
      this.unassignedTasksPaginationVO.filterColumnName = 'Progress';
      this.unassignedTasksPaginationVO.startDate = startDate;
      this.unassignedTasksPaginationVO.endDate = endDate;
      this.unassignedTasksPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.unassignedTasksPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.showUnassignedTasks = true;
          this.unassignedTaskboardVO = result.taskboardTaskVo;
          this.unassignedTaskboardLength = result.totalRecords;

          if (this.unassignedTaskboardLength !== 0 && this.unassignedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const unassignedTaskboardVO of this.unassignedTaskboardVO) {
            if (unassignedTaskboardVO.dueDate !== undefined &&
              unassignedTaskboardVO.dueDate !== null &&
              unassignedTaskboardVO.dueDate !== '') {
              const date = new Date(unassignedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              unassignedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.showUnassignedTasks = true;
          this.unassignedTaskboardVO = [];
          this.unassignedTaskboardLength = 0;
        }
      });
    } else if (widget === 'Taskboard Statistics') {
      this.showWidgets = true;
      this.showPortfolio = false;
      this.isLength = false;
      this.isPaginator = false;
      this.taskboardStatisticsPaginationVO = this.getPaginationForTaskboardStatistice();
      this.taskboardStatisticsPaginationVO.workspaceIdList = [];
      this.taskboardStatisticsPaginationVO.filterColumnName = 'name';
      this.taskboardStatisticsPaginationVO.startDate = startDate;
      this.taskboardStatisticsPaginationVO.endDate = endDate;
      this.taskboardStatisticsPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getPortfolio(this.taskboardStatisticsPaginationVO).subscribe(result => {
        if (result && result.portfolioList.length > 0) {
          this.showPortfolio = true;
          this.portfolioTaskboardVO = result.portfolioList;
          this.portfolioLength = result.totalRecords;

          if (this.portfolioLength !== 0 && this.portfolioLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const portfolioTaskboardVO of this.portfolioTaskboardVO) {
            if (portfolioTaskboardVO.dueDate !== undefined &&
              portfolioTaskboardVO.dueDate !== null &&
              portfolioTaskboardVO.dueDate !== '') {
              const date = new Date(portfolioTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              portfolioTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }

          }
        } else {
          this.showPortfolio = true;
          this.portfolioTaskboardVO = [];
          this.portfolioLength = 0;
        }
      });
    } else if (widget === 'Task List') {
      this.showWidgets = true;
      this.showTaskList = false;
      this.taskListPaginationVO = this.getPaginationForTaskList();
      this.taskListPaginationVO.taskStatus = 'all';
      this.taskListPaginationVO.startDate = startDate;
      this.taskListPaginationVO.endDate = endDate;
      this.taskListPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getAllTaskList(this.taskListPaginationVO).subscribe(result => {
        if (result != null) {
          this.taskboardVO = result.taskboardTaskVo;
          this.taskboardLength = result.totalRecords;
          if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
            this.showTaskList = true;
            this.isPaginator = true;
            this.isLength = true;
          } else {
            this.showTaskList = true;
            this.isPaginator = false;
            this.isLength = false;
          }
        }
      });
    } else if (widget === 'Number of Tasks in Progress') {
      this.showWidgets = true;
      this.showNumberOfTasksInProgress = false;
      this.isLength = false;
      this.isPaginator = false;
      this.numberOfProgressPaginationVO.startDate = startDate;
      this.numberOfProgressPaginationVO.endDate = endDate;
      this.numberOfProgressPaginationVO.filterType = filterType;

      this.workspaceDashboardService.getAllProgressTaskoardTask(this.numberOfProgressPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showNumberOfTasksInProgress = true;
          this.numberOfTasksInProgress = result.totalRecords;
        }
      });
    } else if (widget === 'Number of Tasks Closed') {
      this.showWidgets = true;
      this.isLength = false;
      this.isPaginator = false;
      this.showNumberOfTasksClosed = false;
      this.numberOfClosedPaginationVO.startDate = startDate;
      this.numberOfClosedPaginationVO.endDate = endDate;
      this.numberOfClosedPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getAllDeletedTaskoardTask(this.numberOfClosedPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showNumberOfTasksClosed = true;
          this.numberOfTasksClosed = result.totalRecords;
        }
      });
    } else if (widget === 'Number of Tasks Completed') {
      this.showWidgets = true;
      this.isLength = false;
      this.isPaginator = false;
      this.showNumberOfTasksInCompleted = false;
      this.numberOfCompletedPaginationVO.startDate = startDate;
      this.numberOfCompletedPaginationVO.endDate = endDate;
      this.numberOfCompletedPaginationVO.filterType = filterType;

      this.workspaceDashboardService.getAllDoneTaskoardTask(this.numberOfCompletedPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showNumberOfTasksInCompleted = true;
          this.numberOfTasksCompleted = result.totalRecords;
        }
      });
    } else if (widget === 'Workload by Status Ver Bar') {
      this.showWidgets = true;
      this.showWorkloadByStatusVerBar = false;
      this.workloadByStatusVerBarChartVO.startDate = startDate;
      this.workloadByStatusVerBarChartVO.endDate = endDate;
      this.workloadByStatusVerBarChartVO.filterType = filterType;
      this.workspaceDashboardService.getWorkloadByStatusHorBar(this.workloadByStatusVerBarChartVO).subscribe(res => {
        this.workloadByStatusVerBar.series[0].data = res.data;
        this.workloadByStatusVerBar.series[0].name = res.name;
        this.workloadByStatusVerBar.xAxis.categories = res.xaxisCategories;
        this.showWorkloadByStatusVerBar = true;
      });
    } else if (widget === 'Workload by Status Hor Bar') {
      this.showWidgets = true;
      this.showWorkloadByStatusHorBar = false;
      this.workloadByStatusHorBarChartVO.startDate = startDate;
      this.workloadByStatusHorBarChartVO.endDate = endDate;
      this.workloadByStatusHorBarChartVO.filterType = filterType;
      this.workspaceDashboardService.getWorkloadByStatusHorBar(this.workloadByStatusHorBarChartVO).subscribe(res => {
        this.workloadByStatusHorBar.series[0].data = res.data;
        this.workloadByStatusHorBar.series[0].name = res.name;
        this.workloadByStatusHorBar.xAxis.categories = res.xaxisCategories;
        this.showWorkloadByStatusHorBar = true;
      });
    } else if (widget === 'Total Unassigned Tasks') {
      this.showWidgets = true;
      this.showTotalUnassignedTasks = false;
      this.totalUnassignedTaskPaginationVO.startDate = startDate;
      this.totalUnassignedTaskPaginationVO.endDate = endDate;
      this.totalUnassignedTaskPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.totalUnassignedTaskPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.totalUnassignedTasks = result.totalRecords;
          this.showTotalUnassignedTasks = true;
        }
      });
    } else if (widget === 'Tasks by Assignee Ver Bar') {
      this.showWidgets = true;
      this.showTasksByAssigneeVerBar = false;
      this.taskByAssigneeVerChartVO.startDate = startDate;
      this.taskByAssigneeVerChartVO.endDate = endDate;
      this.taskByAssigneeVerChartVO.filterType = filterType;
      this.workspaceDashboardService.getTaskByAssigneeVerBar(this.taskByAssigneeVerChartVO).subscribe(res => {
        this.tasksByAssigneeVerBar.series[0].data = res.data;
        this.tasksByAssigneeVerBar.series[0].name = res.name;
        this.tasksByAssigneeVerBar.xAxis.categories = res.xaxisCategories;
        this.showTasksByAssigneeVerBar = true;
      });
    } else if (widget === 'Tasks by Assignee Hor Bar') {
      this.showWidgets = true;
      this.showTasksByAssigneeHorBar = false;
      this.taskByAssigneeHorChartVO.startDate = startDate;
      this.taskByAssigneeHorChartVO.endDate = endDate;
      this.taskByAssigneeHorChartVO.filterType = filterType;
      this.workspaceDashboardService.getTaskByAssigneeVerBar(this.taskByAssigneeHorChartVO).subscribe(res => {
        this.tasksByAssigneeHorBar.series[0].data = res.data;
        this.tasksByAssigneeHorBar.series[0].name = res.name;
        this.tasksByAssigneeHorBar.xAxis.categories = res.xaxisCategories;
        this.showTasksByAssigneeHorBar = true;
      });
    } else if (widget === 'Total Assigned(Not Completed) Tasks') {
      this.showWidgets = true;
      this.showTotalAssignedNotCompletedTasks = false;
      this.totalAssignedNotCompletedTaskPaginationVO.startDate = startDate;
      this.totalAssignedNotCompletedTaskPaginationVO.endDate = endDate;
      this.totalAssignedNotCompletedTaskPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getAssignedTaskCount(this.totalAssignedNotCompletedTaskPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalAssignedNotCompletedTasks = true;
          this.totalAssignedTaskCount = result.totalRecords;
        }
      });
    } else if (widget === 'Priority Breakdown') {
      this.showWidgets = true;
      this.showPriorityBreakdown = false;
      this.priorityBreakdownTaskChartVO.startDate = startDate;
      this.priorityBreakdownTaskChartVO.endDate = endDate;
      this.priorityBreakdownTaskChartVO.filterType = filterType;
      this.workspaceDashboardService.getPriorityPieChart(this.priorityBreakdownTaskChartVO).subscribe(res => {
        this.getPiePriorityChart.series[0].data = res;
        this.showPriorityBreakdown = true;
      });
    } else if (widget === 'Priority Breakdown Hor Bar') {
      this.showWidgets = true;
      this.showPriorityBreakdownForHorizontalBarChart = false;
      this.priorityBreakdownHorTaskChartVO.startDate = startDate;
      this.priorityBreakdownHorTaskChartVO.endDate = endDate;
      this.priorityBreakdownHorTaskChartVO.filterType = filterType;
      this.workspaceDashboardService.getPriorityBarChart(this.priorityBreakdownHorTaskChartVO).subscribe(res => {
        this.getHorizontalBarPriorityChart.series[0].data = res.data;
        this.getHorizontalBarPriorityChart.series[0].name = res.name;
        this.getHorizontalBarPriorityChart.xAxis.categories = res.xaxisCategories;
        this.showPriorityBreakdownForHorizontalBarChart = true;
      });
    } else if (widget === 'Priority Breakdown Ver Bar') {
      this.showWidgets = true;
      this.showPriorityBreakdownForVerticalBarChart = false;
      this.priorityBreakdownVerTaskChartVO.startDate = startDate;
      this.priorityBreakdownVerTaskChartVO.endDate = endDate;
      this.priorityBreakdownVerTaskChartVO.filterType = filterType;
      this.workspaceDashboardService.getPriorityBarChart(this.priorityBreakdownVerTaskChartVO).subscribe(res => {
        this.getVerticalBarPriorityChart.series[0].data = res.data;
        this.getVerticalBarPriorityChart.series[0].name = res.name;
        this.getVerticalBarPriorityChart.xAxis.categories = res.xaxisCategories;
        this.showPriorityBreakdownForVerticalBarChart = true;
      });
    } else if (widget === 'Total Urgent Tasks') {
      this.totalUrgentTaskChartVO.priority = 'Urgent';
      this.showTotalUrgentTasks = false;
      this.totalUrgentTaskChartVO.startDate = startDate;
      this.totalUrgentTaskChartVO.endDate = endDate;
      this.totalUrgentTaskChartVO.filterType = filterType;
      this.workspaceDashboardService.getPriorityTaskCount(this.totalUrgentTaskChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalUrgentTasks = true;
          this.urgentTaskCount = result.totalRecords;
        }
      });
    } else if (widget === 'Total High Tasks') {
      this.totalHighTaskBoardChartVO.priority = 'High';
      this.showTotalHighTasks = false;
      this.totalHighTaskBoardChartVO.startDate = startDate;
      this.totalHighTaskBoardChartVO.endDate = endDate;
      this.totalHighTaskBoardChartVO.filterType = filterType;
      this.workspaceDashboardService.getPriorityTaskCount(this.totalHighTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalHighTasks = true;
          this.highTaskCount = result.totalRecords;
        }
      });
    } else if (widget === 'Total Medium Tasks') {
      this.totalMediumTaskBoardChartVO.priority = 'Medium';
      this.showTotalMediumTasks = false;
      this.totalMediumTaskBoardChartVO.startDate = startDate;
      this.totalMediumTaskBoardChartVO.endDate = endDate;
      this.totalMediumTaskBoardChartVO.filterType = filterType;
      this.workspaceDashboardService.getPriorityTaskCount(this.totalMediumTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalMediumTasks = true;
          this.mediumTaskCount = result.totalRecords;
        }
      });
    } else if (widget === 'Total Low Tasks') {
      this.totalLowTaskBoardChartVO.priority = 'Low';
      this.showTotalLowTasks = false;
      this.totalLowTaskBoardChartVO.startDate = startDate;
      this.totalLowTaskBoardChartVO.endDate = endDate;
      this.totalLowTaskBoardChartVO.filterType = filterType;
      this.workspaceDashboardService.getPriorityTaskCount(this.totalLowTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalLowTasks = true;
          this.lowTaskCount = result.totalRecords;
        }
      });
    } else if (widget === 'Total No Priority Tasks') {
      this.showTotalNoPriorityTasks = false;
      this.totalNoPriorityTaskBoardChartVO.startDate = startDate;
      this.totalNoPriorityTaskBoardChartVO.endDate = endDate;
      this.totalNoPriorityTaskBoardChartVO.filterType = filterType;
      this.workspaceDashboardService.getNoPriorityTaskCount(this.totalNoPriorityTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalNoPriorityTasks = true;
          this.noPriorityTaskCount = result.totalRecords;
        }
      });
    } else if (widget === 'Workflow Task List') {
      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForWorkflow();
        this.workflowPaginationVo.filterType = 'all';
      } else {
        paginationVO = this.pagination;
      }
      paginationVO.startDate = startDate;
      paginationVO.endDate = endDate;
      paginationVO.filterType = filterType;
      this.showWorkflowTaskList = false;
      this.loadWorkflowTableData(paginationVO);
    } else if (widget === 'Assignee Task by Taskname') {

      this.showWidgets = true;
      this.showAssigneeTaskByTaskname = false;
      this.assigneeTaskByTasknameChartVO.startDate = startDate;
      this.assigneeTaskByTasknameChartVO.endDate = endDate;
      this.assigneeTaskByTasknameChartVO.filterType = filterType;
      this.workspaceDashboardService.getAssigneeTaskByTaskname(this.assigneeTaskByTasknameChartVO).subscribe(res => {
        this.assigneeTaskByTaskname.series[0].data = res;
        this.showAssigneeTaskByTaskname = true;
      });

    } else if (widget === 'Teams Task by Taskname') {

      this.showWidgets = true;
      this.showTeamsTaskByTaskname = false;
      this.teamsTaskByTasknameChartVO.startDate = startDate;
      this.teamsTaskByTasknameChartVO.endDate = endDate;
      this.teamsTaskByTasknameChartVO.filterType = filterType;
      this.workspaceDashboardService.getTeamsTaskByTaskname(this.teamsTaskByTasknameChartVO).subscribe(res => {
        this.teamsTaskByTaskname.series[0].data = res;
        this.showTeamsTaskByTaskname = true;
      });

    } else if (widget === 'Completed Tasks') {

      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForCompletedTask('COMPLETED');
        paginationVO.filterType = 'all';
      } else {
        paginationVO = this.pagination;
      }
      this.showCompletedTaskList = false;
      paginationVO.startDate = startDate;
      paginationVO.endDate = endDate;
      paginationVO.filterType = filterType;
      this.loadCompletedList(paginationVO);
    } else if (widget === 'Running Tasks') {
      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForRunningTask('IN_PROCESS');
      } else {
        paginationVO = this.pagination;
      }
      paginationVO.startDate = startDate;
      paginationVO.endDate = endDate;
      paginationVO.filterType = filterType;
      this.showRunningTaskList = false;
      this.loadRunningList(paginationVO);
    } else if (widget === 'Failed Tasks') {

      this.showErrorTaskList = false;
      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForErrorTask('ERROR');
      } else {
        paginationVO = this.pagination;
      }
      paginationVO.startDate = startDate;
      paginationVO.endDate = endDate;
      paginationVO.filterType = filterType;
      this.loadErrorList(paginationVO);
    } else if (widget === 'Tasks by Teams') {
      this.showWorkflowTasksByTeams = false;
      this.taskByTeamsChartVO.startDate = startDate;
      this.taskByTeamsChartVO.endDate = endDate;
      this.taskByTeamsChartVO.filterType = filterType;
      this.workspaceDashboardService.getWorkflowTaskByTeams(this.taskByTeamsChartVO).subscribe(res => {
        this.workflowTaskByTeams.series[0].data = res;
        this.showWorkflowTasksByTeams = true;
      });
    } else if (widget === 'Workflow Tasks by Assignee') {
      this.showWorkflowTasksByUsers = false;
      this.workflowTasksByAssigneeChartVO.startDate = startDate;
      this.workflowTasksByAssigneeChartVO.endDate = endDate;
      this.workflowTasksByAssigneeChartVO.filterType = filterType;
      this.workspaceDashboardService.getWorkflowTaskByUsers(this.workflowTasksByAssigneeChartVO).subscribe(res => {
        this.workflowTaskByUsers.series[0].data = res;
        this.showWorkflowTasksByUsers = true;
      });
    } else if (widget === 'Assignee Task by Taskname Hor Bar') {
      this.showAssigneeTaskByTasknameHorBar = false;
      this.assigneeTaskByTasknameHorChartVO.startDate = startDate;
      this.assigneeTaskByTasknameHorChartVO.endDate = endDate;
      this.assigneeTaskByTasknameHorChartVO.filterType = filterType;
      this.workspaceDashboardService.getBarAssigneeTaskByTaskname(this.assigneeTaskByTasknameHorChartVO).subscribe(res => {
        this.showAssigneeTaskByTasknameHorBar = true;
        this.assigneeTaskByTasknameHorBar.series[0].data = res.data;
        this.assigneeTaskByTasknameHorBar.series[0].name = res.name;
        this.assigneeTaskByTasknameHorBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget === 'Assignee Task by Taskname Ver Bar') {
      this.showAssigneeTaskByTasknameVerBar = false;
      this.assigneeTaskByTasknameVerChartVO.startDate = startDate;
      this.assigneeTaskByTasknameVerChartVO.endDate = endDate;
      this.assigneeTaskByTasknameVerChartVO.filterType = filterType;
      this.workspaceDashboardService.getBarAssigneeTaskByTaskname(this.assigneeTaskByTasknameVerChartVO).subscribe(res => {
        this.showAssigneeTaskByTasknameVerBar = true;
        this.assigneeTaskByTasknameVerBar.series[0].data = res.data;
        this.assigneeTaskByTasknameVerBar.series[0].name = res.name;
        this.assigneeTaskByTasknameVerBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget === 'Teams Task by Taskname Hor Bar') {
      this.showTeamsTaskByTasknameHorBar = false;
      this.teamsTaskByTasknameHorChartVO.startDate = startDate;
      this.teamsTaskByTasknameHorChartVO.endDate = endDate;
      this.teamsTaskByTasknameHorChartVO.filterType = filterType;
      this.workspaceDashboardService.getBarTeamsTaskByTaskname(this.teamsTaskByTasknameHorChartVO).subscribe(res => {
        this.showTeamsTaskByTasknameHorBar = true;
        this.assigneeTaskByTasknameHorBar.series[0].data = res.data;
        this.assigneeTaskByTasknameHorBar.series[0].name = res.name;
        this.assigneeTaskByTasknameHorBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget === 'Teams Task by Taskname Ver Bar') {
      this.showTeamsTaskByTasknameVerBar = false;
      this.teamsTaskByTasknameVerChartVO.startDate = startDate;
      this.teamsTaskByTasknameVerChartVO.endDate = endDate;
      this.teamsTaskByTasknameVerChartVO.filterType = filterType;
      this.workspaceDashboardService.getBarTeamsTaskByTaskname(this.teamsTaskByTasknameVerChartVO).subscribe(res => {
        this.showTeamsTaskByTasknameVerBar = true;
        this.assigneeTaskByTasknameVerBar.series[0].data = res.data;
        this.assigneeTaskByTasknameVerBar.series[0].name = res.name;
        this.assigneeTaskByTasknameVerBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget === 'Number of Running Tasks') {
      this.numberOfWorkflowRunningPaginationVO.taskStatus = 'IN_PROCESS';
      this.showNumberOfRunningTasks = false;
      this.numberOfWorkflowRunningPaginationVO.startDate = startDate;
      this.numberOfWorkflowRunningPaginationVO.endDate = endDate;
      this.numberOfWorkflowRunningPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getProcessInstanceListCount(this.numberOfWorkflowRunningPaginationVO).subscribe(data => {
        if (data && data.totalRecords) {
          this.showNumberOfRunningTasks = true;
          this.totalNumberOfRunningTasks = data.totalRecords;
        }
      });
    } else if (widget === 'Number of Failed Tasks') {
      this.numberOfWorkflowFailedPaginationVO.taskStatus = 'ERROR';
      this.showNumberOfFailedTasks = false;
      this.numberOfWorkflowFailedPaginationVO.startDate = startDate;
      this.numberOfWorkflowFailedPaginationVO.endDate = endDate;
      this.numberOfWorkflowFailedPaginationVO.filterType = filterType;
      this.workspaceDashboardService.getProcessInstanceListCount(this.numberOfWorkflowFailedPaginationVO).subscribe(data => {
        if (data && data.totalRecords) {
          this.showNumberOfFailedTasks = true;
          this.totalNumberOfFailedTasks = data.totalRecords;
        }
      });
    } else if (widget === 'Number of Completed Tasks') {
      this.numberOfWorkflowCompletedPaginationVO.taskStatus = 'COMPLETED';
      this.numberOfWorkflowCompletedPaginationVO.startDate = startDate;
      this.numberOfWorkflowCompletedPaginationVO.endDate = endDate;
      this.numberOfWorkflowCompletedPaginationVO.filterType = filterType;
      this.showNumberOfCompletedTasks = false;
      this.workspaceDashboardService.getProcessInstanceListCount(this.numberOfWorkflowCompletedPaginationVO).subscribe(data => {
        if (data && data.totalRecords) {
          this.showNumberOfCompletedTasks = true;
          this.totalNumberOfCompletedTasks = data.totalRecords;
        }
      });
    } else if (widget === 'Workflow Tasks by Assignee Hor Bar') {
      this.showWorkflowTasksByUsersHorBar = false;
      this.workflowTasksByAssigneeHorChartVO.startDate = startDate;
      this.workflowTasksByAssigneeHorChartVO.endDate = endDate;
      this.workflowTasksByAssigneeHorChartVO.filterType = filterType;
      this.workspaceDashboardService.getBarWorkflowTaskByUsers(this.workflowTasksByAssigneeHorChartVO).subscribe(res => {
        this.showWorkflowTasksByUsersHorBar = true;
        this.workflowTaskByUsersHorBar.series[0].data = res.data;
        this.workflowTaskByUsersHorBar.series[0].name = res.name;
        this.workflowTaskByUsersHorBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget === 'Workflow Tasks by Assignee Ver Bar') {
      this.showWorkflowTasksByUsersVerBar = false;
      this.workflowTasksByAssigneeVerChartVO.startDate = startDate;
      this.workflowTasksByAssigneeVerChartVO.endDate = endDate;
      this.workflowTasksByAssigneeVerChartVO.filterType = filterType;
      this.workspaceDashboardService.getBarWorkflowTaskByUsers(this.workflowTasksByAssigneeVerChartVO).subscribe(res => {
        this.showWorkflowTasksByUsersVerBar = true;
        this.workflowTaskByUsersVerBar.series[0].data = res.data;
        this.workflowTaskByUsersVerBar.series[0].name = res.name;
        this.workflowTaskByUsersVerBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget === 'Tasks by Teams Hor Bar') {
      this.showWorkflowTasksByTeamsHorBar = false;
      this.taskByTeamsHorChartVO.startDate = startDate;
      this.taskByTeamsHorChartVO.endDate = endDate;
      this.taskByTeamsHorChartVO.filterType = filterType;
      this.workspaceDashboardService.getBarWorkflowTaskByTeams(this.taskByTeamsHorChartVO).subscribe(res => {
        this.showWorkflowTasksByTeamsHorBar = true;
        this.workflowTaskByTeamsHorBar.series[0].data = res.data;
        this.workflowTaskByTeamsHorBar.series[0].name = res.name;
        this.workflowTaskByTeamsHorBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget === 'Tasks by Teams Ver Bar') {
      this.showWorkflowTasksByTeamsVerBar = false;
      this.taskByTeamsVerChartVO.startDate = startDate;
      this.taskByTeamsVerChartVO.endDate = endDate;
      this.taskByTeamsVerChartVO.filterType = filterType;
      this.workspaceDashboardService.getBarWorkflowTaskByTeams(this.taskByTeamsVerChartVO).subscribe(res => {
        this.showWorkflowTasksByTeamsVerBar = true;
        this.workflowTaskByTeamsVerBar.series[0].data = res.data;
        this.workflowTaskByTeamsVerBar.series[0].name = res.name;
        this.workflowTaskByTeamsVerBar.xAxis.categories = res.xaxisCategories;
      });
    }
  }

  getWorkspaceName(workspaceId): string {
    if (this.workspaceListVO && this.workspaceListVO.length > 0) {
      const index = this.workspaceListVO.findIndex(t => t.workspaceId === workspaceId);
      if (index !== -1) {
        return this.workspaceListVO[index].workspaceName;
      }
    }
  }

  getWorkspaceUniqueKey(workspaceId) {
    if (this.workspaceListVO && this.workspaceListVO.length > 0) {
      const index = this.workspaceListVO.findIndex(t => t.workspaceId === workspaceId);
      if (index !== -1) {
        return this.workspaceListVO[index].workspaceUniqueId;
      }
    }
  }


  routeTaskboard(task) {
    const workspaceId = this.workspaceService.getWorkspaceID();
    if (workspaceId && this.workspaceListVO && this.workspaceListVO.length > 0) {
      const index = this.workspaceListVO.findIndex(t => t.workspaceId === task.workspaceId);
      if (task?.workspaceId === workspaceId) {
        this.router.navigate(['/' + this.getWorkspaceUniqueKey(task?.workspaceId) + '/taskboard', task?.taskboardKey]);
      } else {
        if (index !== -1) {
          this.switchWorkspace(this.workspaceListVO[index], task);
        }

      }
    }
    this.initializeForm();
    this.getDashboardNameList(workspaceId);
    this.loadBoardNames();
    this.getUserAndGroupList();
    this.initializeFilterFormTaskboard();
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1) + 'px';
      this.screenWidth = (window.innerWidth - 63) + 'px';
    } else {
      this.screenHeight = (window.innerHeight - 63) + 'px';
    }
  }

  getFilterColumn(widget: DashboardWidgetVO, columnId: string): boolean {
    const returnValue: boolean = widget.filteredColumns?.some(f => f === columnId);
    return returnValue;
  }

  initializeForm(): void {
    this.taskListForm = this.initializeFilterForm();
    this.progressForm = this.initializeFilterForm();
    this.unAssignForm = this.initializeFilterForm();
    this.completedTaskForm = this.initializeFilterForm();
    this.deletedTaskForm = this.initializeFilterForm();
    this.portfolioForm = this.initializeFilterForm();
  }

  initializeFilterForm(): FormGroup {
    return this.fb.group({
      filterValue: [''],
      operator: [''],
      search: [''],
      searchForAssignedToTaskboard: [''],
      searchForStatus: [''],
      searchForSubStatus: [''],
      searchBoardName: [''],
      filters: this.fb.array([
        this.addFilterForTaskboard()
      ])
    });
  }

  addFilterForTaskboard(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      dataType: ['string'],
    });
  }

  setDataTypeForTaskboard(headerDetails: string, datatype: string, formGroup: FormGroup): void {
    if (headerDetails === 'board_name' || headerDetails === 'task_name' || headerDetails === 'task_id'
      || headerDetails === 'status' || headerDetails === 'sub_status') {
      if (headerDetails === 'board_name') {
        this.completedTaskForm.get('searchBoardName').setValue('');
        this.taskListForm.get('searchBoardName').setValue('');
        this.progressForm.get('searchBoardName').setValue('');
        this.portfolioForm.get('searchBoardName').setValue('');
        this.deletedTaskForm.get('searchBoardName').setValue('');
        this.unAssignForm.get('searchBoardName').setValue('');
        this.filterBoardNamesVO = this.boardNamesVO;
      }
      this.filterOperator = 'string';
      this.isDateField = false;
      this.type = 'text';
    } else if (headerDetails === 'created_on' || headerDetails === 'due_date') {
      this.filterOperator = 'number';
      this.isDateField = true;
      this.type = null;
    } else if (headerDetails === 'assignedTo') {
      this.filterOperator = 'assigned_to';
      this.isDateField = false;
      this.type = 'text';
    }

    this.filterDatatype = datatype;
    this.columnId = headerDetails;
    const form = (formGroup.get('filters') as FormArray);
    formGroup.get('filterValue').setValue(null);
    formGroup.get('operator').setValue(null);


    for (let i = 0; i < form.length; i++) {
      if (form.get('' + i).get('filterIdColumn').value && form.get('' + i).get('filterIdColumn').value === this.columnId) {
        formGroup.get('filterValue').setValue(form.get('' + i).get('filterIdColumnValue').value);
        formGroup.get('operator').setValue(form.get('' + i).get('operators').value);
        formGroup.get('filterValue').setValidators(null);
        formGroup.get('filterValue').setErrors(null);
        formGroup.get('operator').setErrors(null);
      }
    }
  }

  addValidations(formGroup) {
    formGroup.get('filterValue').setValidators([Validators.required]);
    formGroup.get('operator').setValidators([Validators.required]);
    formGroup.get('filterValue').updateValueAndValidity();
    formGroup.get('operator').updateValueAndValidity();
  }

  removeValidations(formGroup) {
    formGroup.get('filterValue').setValidators(null);
    formGroup.get('operator').setValidators(null);
    formGroup.get('filterValue').updateValueAndValidity();
    formGroup.get('operator').updateValueAndValidity();
  }

  filterApplyForTaskboard(formGroup: FormGroup, widget: DashboardWidgetVO) {
    if (widget.filteredColumns === undefined || widget.filteredColumns === null) {
      widget.filteredColumns = [];
    }
    if (!widget.filteredColumns.some(f => f === this.columnId)) {
      widget.filteredColumns.push(this.columnId);
    }
    let setFilter = false;
    this.addValidations(formGroup);
    if ((formGroup.get('filters') as FormArray).length === 0) {
      (formGroup.get('filters') as FormArray).push(this.addFilterForTaskboard());
    }
    for (let i = 0; i < (formGroup.get('filters') as FormArray).length; i++) {
      if (formGroup.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        formGroup.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        formGroup.get('filters').get('' + i).get('filterIdColumnValue').setValue(formGroup.get('filterValue').value);
        formGroup.get('filters').get('' + i).get('operators').setValue(formGroup.get('operator').value);
        formGroup.get('filters').get('' + i).get('dataType').setValue(this.filterDatatype);
      } else {
        const array = [];
        if ((formGroup.get('filters') as FormArray).length > 1) {
          array.push((formGroup.get('filters') as FormArray).value);
        } else {
          array[0] = formGroup.get('filters') as FormArray;
        }
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCountForTaskboard++;
          if (formGroup.get('filters').get('' + 0).get('filterIdColumn').value) {
            (formGroup.get('filters') as FormArray).push(this.addFilterForTaskboard());
          }
          const length = (formGroup.get('filters') as FormArray).length - 1;
          formGroup.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          formGroup.get('filters').get('' + length).get('filterIdColumnValue').setValue(formGroup.get('filterValue').value);
          formGroup.get('filters').get('' + length).get('operators').setValue(formGroup.get('operator').value);
          formGroup.get('filters').get('' + length).get('dataType').setValue(this.filterDatatype);
        }
      }
    }
    this.paginationVO.index = 0;
    if (formGroup.valid) {
      const form = (formGroup.get('filters') as FormArray);

      if (widget.widgetName === 'Tasks in Progress') {

        this.tasksInProgressPaginationVO = this.getPaginationForTasksInProgress();
        this.tasksInProgressPaginationVO.filterValue = form.value;
        this.workspaceDashboardService.getAllProgressTaskoardTask(this.tasksInProgressPaginationVO).subscribe(result => {
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.progressTaskboardVO = result.taskboardTaskVo;
            this.progressTaskboardLength = result.totalRecords;

            if (this.progressTaskboardLength !== 0 && this.progressTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const progressTaskboardVO of this.progressTaskboardVO) {
              if (progressTaskboardVO.dueDate !== undefined
                && progressTaskboardVO.dueDate !== null
                && progressTaskboardVO.dueDate !== '') {
                const date = new Date(progressTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                progressTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.progressTaskboardVO = [];
            this.progressTaskboardLength = 0;
          }
        });
      } else if (widget.widgetName === 'Tasks Deleted') {

        this.tasksDeletedPaginationVO = this.getPaginationForTasksDeleted();
        this.tasksDeletedPaginationVO.filterValue = form.value;
        this.workspaceDashboardService.getAllDeletedTaskoardTask(this.tasksDeletedPaginationVO).subscribe(result => {
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.deletedTaskboardVO = result.taskboardTaskVo;
            this.deletedTaskboardLength = result.totalRecords;

            if (this.deletedTaskboardLength !== 0 && this.deletedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }


            for (const deletedTaskboardVO of this.deletedTaskboardVO) {
              if (deletedTaskboardVO.dueDate !== undefined
                && deletedTaskboardVO.dueDate !== null
                && deletedTaskboardVO.dueDate !== '') {
                const date = new Date(deletedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                deletedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.deletedTaskboardVO = [];
            this.deletedTaskboardLength = 0;
          }
        });
      } else if (widget.widgetName === 'Tasks Completed') {

        this.tasksCompletedPaginationVO = this.getPaginationForTasksCompleted();
        this.tasksCompletedPaginationVO.filterValue = form.value;
        this.workspaceDashboardService.getAllDoneTaskoardTask(this.tasksCompletedPaginationVO).subscribe(result => {
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.completedTaskboardVO = result.taskboardTaskVo;
            this.completedTaskboardLength = result.totalRecords;

            if (this.completedTaskboardLength !== 0 && this.completedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const completedTaskboardVO of this.completedTaskboardVO) {
              if (completedTaskboardVO.dueDate !== undefined
                && completedTaskboardVO.dueDate !== null
                && completedTaskboardVO.dueDate !== '') {
                const date = new Date(completedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                completedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }

          } else {
            this.completedTaskboardVO = [];
            this.completedTaskboardLength = 0;
          }
        });
      } else if (widget.widgetName === 'Unassigned Tasks') {

        this.unassignedTasksPaginationVO = this.getPaginationForUnassignedTasks();
        this.unassignedTasksPaginationVO.filterValue = form.value;
        this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.unassignedTasksPaginationVO).subscribe(result => {
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.unassignedTaskboardVO = result.taskboardTaskVo;
            this.unassignedTaskboardLength = result.totalRecords;

            if (this.unassignedTaskboardLength !== 0 && this.unassignedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }


            for (const unassignedTaskboardVO of this.unassignedTaskboardVO) {
              if (unassignedTaskboardVO.dueDate !== undefined
                && unassignedTaskboardVO.dueDate !== null
                && unassignedTaskboardVO.dueDate !== '') {
                const date = new Date(unassignedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                unassignedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.unassignedTaskboardVO = [];
            this.unassignedTaskboardLength = 0;
          }
        });
      } else if (widget.widgetName === 'Task List') {
        this.showWidgets = true;
        this.showTaskList = true;
        this.taskListPaginationVO = this.getPaginationForTaskList();
        this.taskListPaginationVO.filterValue = form.value;
        this.loadTaskboardTableData();
      }

    }
  }

  setFilterFormValues(event, filterValue, columnName, formGroup, widget: DashboardWidgetVO) {
    formGroup.get('filterValue').setValue(filterValue);
    formGroup.get('operator').setValue('eq');
    formGroup.get('filterValue').setValidators(null);
    formGroup.get('filterValue').setErrors(null);
    formGroup.get('operator').setErrors(null);
    this.filterApplyForNameAndAssignedTo(event, filterValue, columnName, formGroup, widget);
  }

  filterApplyForNameAndAssignedTo(event, filterValue, columnName, formGroup: FormGroup, widget: DashboardWidgetVO) {
    if (widget.filteredColumns === undefined || widget.filteredColumns === null) {
      widget.filteredColumns = [];
    }
    if (!widget.filteredColumns.some(f => f === columnName)) {
      widget.filteredColumns.push(columnName);
    }

    if (event.checked === true) {
      (formGroup.get('filters') as FormArray).push(this.addFilterForTaskboard());

      for (let i = 0; i < (formGroup.get('filters') as FormArray).length; i++) {
        const length = (formGroup.get('filters') as FormArray).length - 1;
        formGroup.get('filters').get('' + length).get('filterIdColumn').setValue(columnName);
        formGroup.get('filters').get('' + length).get('filterIdColumnValue').setValue(formGroup.get('filterValue').value);
        formGroup.get('filters').get('' + length).get('operators').setValue(formGroup.get('operator').value);
        formGroup.get('filters').get('' + length).get('dataType').setValue('string');
      }
    } else {
      let index = null;
      this.getFilterArray(formGroup).controls.forEach(control => {
        if (control.value.filterIdColumnValue === filterValue) {
          index = this.getFilterArray(formGroup).controls.indexOf(control);
        }
      });

      if (index !== -1 && index !== null) {
        this.getFilterArray(formGroup).removeAt(index);
      }
    }
    this.paginationVO.index = 0;
    if (formGroup.valid) {
      const form = (formGroup.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      if (widget.widgetName === 'Tasks in Progress') {

        this.tasksInProgressPaginationVO = this.getPaginationForTasksInProgress();
        this.tasksInProgressPaginationVO.filterValue = form.value;
        this.workspaceDashboardService.getAllProgressTaskoardTask(this.tasksInProgressPaginationVO).subscribe(result => {
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.progressTaskboardVO = result.taskboardTaskVo;
            this.progressTaskboardLength = result.totalRecords;

            if (this.progressTaskboardLength !== 0 && this.progressTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const progressTaskboardVO of this.progressTaskboardVO) {
              if (progressTaskboardVO.dueDate !== undefined
                && progressTaskboardVO.dueDate !== null
                && progressTaskboardVO.dueDate !== '') {
                const date = new Date(progressTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                progressTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.progressTaskboardVO = [];
            this.progressTaskboardLength = 0;
          }
        });
      } else if (widget.widgetName === 'Tasks Deleted') {

        this.tasksDeletedPaginationVO = this.getPaginationForTasksDeleted();
        this.tasksDeletedPaginationVO.filterValue = form.value;
        this.workspaceDashboardService.getAllDeletedTaskoardTask(this.tasksDeletedPaginationVO).subscribe(result => {
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.deletedTaskboardVO = result.taskboardTaskVo;
            this.deletedTaskboardLength = result.totalRecords;

            if (this.deletedTaskboardLength !== 0 && this.deletedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }


            for (const deletedTaskboardVO of this.deletedTaskboardVO) {
              if (deletedTaskboardVO.dueDate !== undefined
                && deletedTaskboardVO.dueDate !== null
                && deletedTaskboardVO.dueDate !== '') {
                const date = new Date(deletedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                deletedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.deletedTaskboardVO = [];
            this.deletedTaskboardLength = 0;
          }
        });
      } else if (widget.widgetName === 'Tasks Completed') {

        this.tasksCompletedPaginationVO = this.getPaginationForTasksCompleted();
        this.tasksCompletedPaginationVO.filterValue = form.value;
        this.workspaceDashboardService.getAllDoneTaskoardTask(this.tasksCompletedPaginationVO).subscribe(result => {
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.completedTaskboardVO = result.taskboardTaskVo;
            this.completedTaskboardLength = result.totalRecords;

            if (this.completedTaskboardLength !== 0 && this.completedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const completedTaskboardVO of this.completedTaskboardVO) {
              if (completedTaskboardVO.dueDate !== undefined
                && completedTaskboardVO.dueDate !== null
                && completedTaskboardVO.dueDate !== '') {
                const date = new Date(completedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                completedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }

          } else {
            this.completedTaskboardVO = [];
            this.completedTaskboardLength = 0;
          }
        });
      } else if (widget.widgetName === 'Unassigned Tasks') {

        this.unassignedTasksPaginationVO = this.getPaginationForUnassignedTasks();
        this.unassignedTasksPaginationVO.filterValue = form.value;
        this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.unassignedTasksPaginationVO).subscribe(result => {
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.unassignedTaskboardVO = result.taskboardTaskVo;
            this.unassignedTaskboardLength = result.totalRecords;

            if (this.unassignedTaskboardLength !== 0 && this.unassignedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }


            for (const unassignedTaskboardVO of this.unassignedTaskboardVO) {
              if (unassignedTaskboardVO.dueDate !== undefined
                && unassignedTaskboardVO.dueDate !== null
                && unassignedTaskboardVO.dueDate !== '') {
                const date = new Date(unassignedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                unassignedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.unassignedTaskboardVO = [];
            this.unassignedTaskboardLength = 0;
          }
        });
      } else if (widget.widgetName === 'Task List') {
        this.showWidgets = true;
        this.showTaskList = true;
        this.taskListPaginationVO = this.getPaginationForTaskList();
        this.taskListPaginationVO.filterValue = form.value;
        this.loadTaskboardTableData();
      }
    }
  }

  getFilterArray(formGroup) {
    return (formGroup.get('filters') as FormArray);
  }
  changeFilterValue(event, filterValue, columnName, formGroup, widget: DashboardWidgetVO) {
    if (filterValue === 'unAssigned') {
      this.checkTaskboardAssignedTo = true;
    }
    this.setFilterFormValues(event, filterValue, columnName, formGroup, widget);

  }

  emptyPaginator() {
    this.isPaginator = false;
    this.isLength = false;
  }


  switchWorkspace(workspaceVO: WorkspaceListVO, task): void {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { type: 'switchWorkspace', name: workspaceVO.workspaceName }
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === true) {
        this.workspaceService.setWorkspaceID(workspaceVO.workspaceId);
        this.workspaceService.setWorkspaceVO(workspaceVO);
        this.router.navigate(['/' + this.getWorkspaceUniqueKey(workspaceVO.workspaceId) + '/taskboard', task?.taskboardKey]);
      }
    });
  }



  cancel() {
    this.addName = false;
    this.noDashboard = true;
    this.form.reset();
  }

  checkDashboardName() {
    const name = this.form.get('dashboardName').value;
    this.workspaceDashboardService.checkDashboardName(name).subscribe(data => {
      if (data.response.includes('already exist')) {
        this.form.get('dashboardName').setErrors({ alreadyExist: true });
      }
    });
  }

  getDashboardNameList(id) {
    this.workspaceDashboardService.getDashboardNameList().subscribe(data => {
      this.dashboardNameList = data;
      this.filteredDashboardNameList = data;
      if (id !== undefined && id !== null) {
        this.getDashboardListByParam(id);
      } else {
        this.activeElement = 'System Dashboard';
      }
    });
  }

  getUserColor(user: string): string {
    const filteredUser = this.usersList.find(u => u.firstName + ' ' + u.lastName === user);
    return filteredUser?.color;
  }

  getDashboardList() {
    if (this.dashboardNameList && this.dashboardNameList.length > 0) {
      this.workspaceDashboardService.getDashboard(this.dashboardNameList[0].id).subscribe(data => {
        this.activeElement = data.dashboardName;
        this.dashboardId = data.id;
        this.workspaceDashboardVO.id = data.id;
        if (data.dashboardWidgets.length !== 0) {
          this.showWidgets = true;
          this.workspaceDashboardVO.dashboardWidgets = data.dashboardWidgets;
        } else {
          this.showWidgets = false;
        }
        for (const widgets of data.dashboardWidgets) {
          this.loadWidget(widgets);
        }
        window.history.pushState('', 'id', 'workspace-dashboard/' + data.dashbaordId ? data.dashboardId : data.dashboardName.toLowerCase());
      });
    } else {
      this.workspaceDashboardVO.dashboardWidgets = [];
    }
  }

  getDashboardListByParam(id) {
    const index = this.dashboardNameList.findIndex(t => t.dashbaordId === id);
    if (index !== -1) {
      this.workspaceDashboardService.getDashboard(this.dashboardNameList[index].id).subscribe(data => {
        this.activeElement = data.dashboardName;
        this.dashboardId = data.id;
        this.workspaceDashboardVO.id = data.id;
        if (data.dashboardWidgets.length !== 0) {
          this.showWidgets = true;
          this.workspaceDashboardVO.dashboardWidgets = data.dashboardWidgets;
        } else {
          this.showWidgets = false;
        }
        for (const widgets of data.dashboardWidgets) {
          this.loadWidget(widgets);
        }
        window.history.pushState('', 'id', 'workspace-dashboard/' + data.dashbaordId);
      });
    }
  }

  getPaginationForTaskboard() {
    if (this.sortForTaskboard === undefined || this.sortForTaskboard.active === undefined || this.sortForTaskboard.active === '') {
      this.paginationVO.columnName = this.defaultColumnForTaskboard;
    } else {
      this.paginationVO.columnName = this.sortForTaskboard.active;
    }
    if (this.sortForTaskboard === undefined
      || this.sortForTaskboard.direction === '' ||
      this.sortForTaskboard.direction === undefined ||
      this.sortForTaskboard.direction === null) {
      this.paginationVO.direction = this.defaultSortDirection;
    } else {
      this.paginationVO.direction = this.sortForTaskboard.direction;
    }
    if (this.paginatorForTaskboard.index > 0) {
      this.paginationVO.index = this.paginatorForTaskboard.index;
    } else {
      this.paginationVO.index = 0;
    }
    if (this.paginatorForTaskboard.pageSize > 5) {
      this.paginationVO.size = this.paginatorForTaskboard.pageSize;
    } else {
      this.paginationVO.size = this.defaultPageSize;
    }
    return this.paginationVO;
  }

  getPaginationForTaskList() {
    if (this.sortForTaskList === undefined ||
      this.sortForTaskList.active === undefined ||
      this.sortForTaskList.active === '') {
      this.taskListPaginationVO.columnName = this.defaultColumnForTaskboard;
    } else {
      this.taskListPaginationVO.columnName = this.sortForTaskList.active;
    }
    if (this.sortForTaskList === undefined
      || this.sortForTaskList.direction === '' ||
      this.sortForTaskList.direction === undefined ||
      this.sortForTaskList.direction === null) {
      this.taskListPaginationVO.direction = this.defaultSortDirection;
    } else {
      this.taskListPaginationVO.direction = this.sortForTaskList.direction;
    }
    if (this.paginatorForTaskList.index > 0) {
      this.taskListPaginationVO.index = this.paginatorForTaskList.index;
    } else {
      this.taskListPaginationVO.index = 0;
    }
    if (this.paginatorForTaskList.pageSize > 5) {
      this.taskListPaginationVO.size = this.paginatorForTaskList.pageSize;
    } else {
      this.taskListPaginationVO.size = this.defaultPageSize;
    }
    return this.taskListPaginationVO;
  }

  getPaginationForTaskboardStatistice() {
    if (this.sortForTaskboard === undefined || this.sortForTaskboard.active === undefined || this.sortForTaskboard.active === '') {
      this.taskboardStatisticsPaginationVO.columnName = this.defaultColumnForTaskboard;
    } else {
      this.taskboardStatisticsPaginationVO.columnName = this.sortForTaskboard.active;
    }
    if (this.sortForTaskboard === undefined
      || this.sortForTaskboard.direction === '' ||
      this.sortForTaskboard.direction === undefined ||
      this.sortForTaskboard.direction === null) {
      this.taskboardStatisticsPaginationVO.direction = this.defaultSortDirection;
    } else {
      this.taskboardStatisticsPaginationVO.direction = this.sortForTaskboard.direction;
    }
    if (this.paginatorForTaskboardStatistics.index > 0) {
      this.taskboardStatisticsPaginationVO.index = this.paginatorForTaskboardStatistics.index;
    } else {
      this.taskboardStatisticsPaginationVO.index = 0;
    }
    if (this.paginatorForTaskboardStatistics.pageSize > 5) {
      this.taskboardStatisticsPaginationVO.size = this.paginatorForTaskboardStatistics.pageSize;
    } else {
      this.taskboardStatisticsPaginationVO.size = this.defaultPageSize;
    }
    return this.taskboardStatisticsPaginationVO;
  }

  getPaginationForUnassignedTasks() {
    if (this.sortForUnassignedTasks === undefined ||
      this.sortForUnassignedTasks.active === undefined ||
      this.sortForUnassignedTasks.active === '') {
      this.unassignedTasksPaginationVO.columnName = this.defaultColumnForTaskboard;
    } else {
      this.unassignedTasksPaginationVO.columnName = this.sortForUnassignedTasks.active;
    }
    if (this.sortForUnassignedTasks === undefined
      || this.sortForUnassignedTasks.direction === '' ||
      this.sortForUnassignedTasks.direction === undefined ||
      this.sortForUnassignedTasks.direction === null) {
      this.unassignedTasksPaginationVO.direction = this.defaultSortDirection;
    } else {
      this.unassignedTasksPaginationVO.direction = this.sortForUnassignedTasks.direction;
    }
    if (this.paginatorForUnassignedTasks.index > 0) {
      this.unassignedTasksPaginationVO.index = this.paginatorForUnassignedTasks.index;
    } else {
      this.unassignedTasksPaginationVO.index = 0;
    }
    if (this.paginatorForUnassignedTasks.pageSize > 5) {
      this.unassignedTasksPaginationVO.size = this.paginatorForUnassignedTasks.pageSize;
    } else {
      this.unassignedTasksPaginationVO.size = this.defaultPageSize;
    }
    return this.unassignedTasksPaginationVO;
  }

  getPaginationForTasksInProgress() {
    if (this.sortForTasksInProgress === undefined ||
      this.sortForTasksInProgress.active === undefined ||
      this.sortForTasksInProgress.active === '') {
      this.tasksInProgressPaginationVO.columnName = this.defaultColumnForTaskboard;
    } else {
      this.tasksInProgressPaginationVO.columnName = this.sortForTasksInProgress.active;
    }
    if (this.sortForTasksInProgress === undefined
      || this.sortForTasksInProgress.direction === '' ||
      this.sortForTasksInProgress.direction === undefined ||
      this.sortForTasksInProgress.direction === null) {
      this.tasksInProgressPaginationVO.direction = this.defaultSortDirection;
    } else {
      this.tasksInProgressPaginationVO.direction = this.sortForTasksInProgress.direction;
    }
    if (this.paginatorForTasksInProgress.index > 0) {
      this.tasksInProgressPaginationVO.index = this.paginatorForTasksInProgress.index;
    } else {
      this.tasksInProgressPaginationVO.index = 0;
    }
    if (this.paginatorForTasksInProgress.pageSize > 5) {
      this.tasksInProgressPaginationVO.size = this.paginatorForTasksInProgress.pageSize;
    } else {
      this.tasksInProgressPaginationVO.size = this.defaultPageSize;
    }
    return this.tasksInProgressPaginationVO;
  }

  getPaginationForTasksDeleted() {
    if (this.sortForTasksDeleted === undefined || this.sortForTasksDeleted.active === undefined
      || this.sortForTasksDeleted.active === '') {
      this.tasksDeletedPaginationVO.columnName = this.defaultColumnForTaskboard;
    } else {
      this.tasksDeletedPaginationVO.columnName = this.sortForTasksDeleted.active;
    }
    if (this.sortForTasksDeleted === undefined
      || this.sortForTasksDeleted.direction === '' ||
      this.sortForTasksDeleted.direction === undefined ||
      this.sortForTasksDeleted.direction === null) {
      this.tasksDeletedPaginationVO.direction = this.defaultSortDirection;
    } else {
      this.tasksDeletedPaginationVO.direction = this.sortForTasksDeleted.direction;
    }
    if (this.paginatorForTasksDeleted.index > 0) {
      this.tasksDeletedPaginationVO.index = this.paginatorForTasksDeleted.index;
    } else {
      this.tasksDeletedPaginationVO.index = 0;
    }
    if (this.paginatorForTasksDeleted.pageSize > 5) {
      this.tasksDeletedPaginationVO.size = this.paginatorForTasksDeleted.pageSize;
    } else {
      this.tasksDeletedPaginationVO.size = this.defaultPageSize;
    }
    return this.tasksDeletedPaginationVO;
  }

  getPaginationForTasksCompleted() {
    if (this.sortForTasksCompleted === undefined ||
      this.sortForTasksCompleted.active === undefined ||
      this.sortForTasksCompleted.active === '') {
      this.tasksCompletedPaginationVO.columnName = this.defaultColumnForTaskboard;
    } else {
      this.tasksCompletedPaginationVO.columnName = this.sortForTasksCompleted.active;
    }
    if (this.sortForTasksCompleted === undefined
      || this.sortForTasksCompleted.direction === '' ||
      this.sortForTasksCompleted.direction === undefined ||
      this.sortForTasksCompleted.direction === null) {
      this.tasksCompletedPaginationVO.direction = this.defaultSortDirection;
    } else {
      this.tasksCompletedPaginationVO.direction = this.sortForTasksCompleted.direction;
    }
    if (this.paginatorForTasksCompleted.index > 0) {
      this.tasksCompletedPaginationVO.index = this.paginatorForTasksDeleted.index;
    } else {
      this.tasksCompletedPaginationVO.index = 0;
    }
    if (this.paginatorForTasksCompleted.pageSize > 5) {
      this.tasksCompletedPaginationVO.size = this.paginatorForTasksDeleted.pageSize;
    } else {
      this.tasksCompletedPaginationVO.size = this.defaultPageSize;
    }
    return this.tasksCompletedPaginationVO;
  }

  changeMode(mode) {
    this.viewMode = mode;
  }
  addWidget() {
    const dialog = this.dialog.open(AddWidgetComponent, {
      disableClose: true,
      width: '50%',
      height: '60%',

    });
    dialog.afterClosed().subscribe((data) => {
      if (data) {
        this.widgetName = data.name;
        this.saveWidgets(data.name, data.widgetType);
      }
    });
  }

  boardLevelFilter(event, board) {
    if (event.checked === true) {
      this.dashboardFilter.push(board?.taskBoardId);

      const boardIndex = this.boardNamesVO.findIndex(item => item.boardName === board.boardName);
      if (boardIndex !== -1) {
        this.filterBoardNamesVO[boardIndex].isSelected = true;
        this.taskListBoardNamesVO[boardIndex].isSelected = true;
        this.unAssignedTaskBoardNamesVO[boardIndex].isSelected = true;
        this.taskInProgressBoardNamesVO[boardIndex].isSelected = true;
        this.taskDeletedBoardNamesVO[boardIndex].isSelected = true;
        this.taskCompletedBoardNamesVO[boardIndex].isSelected = true;
        this.taskStatisticsBoardNamesVO[boardIndex].isSelected = true;
        this.workloadByStatusBoardNamesVO[boardIndex].isSelected = true;
        this.workloadByStatusHorBarBoardNamesVO[boardIndex].isSelected = true;
        this.workloadByStatusVerBarBoardNamesVO[boardIndex].isSelected = true;
        this.taskByAssigneeBoardNamesVO[boardIndex].isSelected = true;
        this.numberOfClosedBoardNamesVO[boardIndex].isSelected = true;
        this.numberOfProgressBoardNamesVO[boardIndex].isSelected = true;
        this.numberOfCompletedBoardNamesVO[boardIndex].isSelected = true;
        this.taskByAssigneeHorBoardNamesVO[boardIndex].isSelected = true;
        this.taskByAssigneeVerBoardNamesVO[boardIndex].isSelected = true;
        this.totalUnassignedTaskBoardNamesVO[boardIndex].isSelected = true;
        this.totalAssignedNotCompletedTaskBoardNamesVO[boardIndex].isSelected = true;
        this.priorityBreakdownTaskBoardNamesVO[boardIndex].isSelected = true;
        this.priorityBreakdownHorTaskBoardNamesVO[boardIndex].isSelected = true;
        this.priorityBreakdownVerTaskBoardNamesVO[boardIndex].isSelected = true;
        this.totalUrgentTaskBoardNamesVO[boardIndex].isSelected = true;
        this.totalLowTaskBoardNamesVO[boardIndex].isSelected = true;
        this.totalHighTaskBoardNamesVO[boardIndex].isSelected = true;
        this.totalMediumTaskBoardNamesVO[boardIndex].isSelected = true;
        this.totalNoPriorityTaskBoardNamesVO[boardIndex].isSelected = true;
        this.totalPastDueTasksBoardNamesVO[boardIndex].isSelected = true;
        this.totalDueTodayTasksBoardNamesVO[boardIndex].isSelected = true;
        this.totalDueTomorrowTasksBoardNamesVO[boardIndex].isSelected = true;
        this.totalDueInSevenTasksTasksBoardNamesVO[boardIndex].isSelected = true;
      }
    } else if (event.checked === false) {
      const index = this.dashboardFilter.findIndex(boards => boards === board?.taskboardId);
      this.dashboardFilter.splice(index, 1);
      const boardIndex = this.boardNamesVO.findIndex(item => item.boardName === board.boardName);
      if (boardIndex !== -1) {
        this.filterBoardNamesVO[boardIndex].isSelected = false;
        this.taskListBoardNamesVO[boardIndex].isSelected = false;
        this.unAssignedTaskBoardNamesVO[boardIndex].isSelected = false;
        this.taskInProgressBoardNamesVO[boardIndex].isSelected = false;
        this.taskDeletedBoardNamesVO[boardIndex].isSelected = false;
        this.taskCompletedBoardNamesVO[boardIndex].isSelected = false;
        this.taskStatisticsBoardNamesVO[boardIndex].isSelected = false;
        this.workloadByStatusBoardNamesVO[boardIndex].isSelected = false;
        this.workloadByStatusHorBarBoardNamesVO[boardIndex].isSelected = false;
        this.workloadByStatusVerBarBoardNamesVO[boardIndex].isSelected = false;
        this.taskByAssigneeBoardNamesVO[boardIndex].isSelected = false;
        this.numberOfClosedBoardNamesVO[boardIndex].isSelected = false;
        this.numberOfProgressBoardNamesVO[boardIndex].isSelected = false;
        this.numberOfCompletedBoardNamesVO[boardIndex].isSelected = false;
        this.taskByAssigneeHorBoardNamesVO[boardIndex].isSelected = false;
        this.taskByAssigneeVerBoardNamesVO[boardIndex].isSelected = false;
        this.totalUnassignedTaskBoardNamesVO[boardIndex].isSelected = false;
        this.totalAssignedNotCompletedTaskBoardNamesVO[boardIndex].isSelected = false;
        this.priorityBreakdownTaskBoardNamesVO[boardIndex].isSelected = false;
        this.priorityBreakdownHorTaskBoardNamesVO[boardIndex].isSelected = false;
        this.priorityBreakdownVerTaskBoardNamesVO[boardIndex].isSelected = false;
        this.totalUrgentTaskBoardNamesVO[boardIndex].isSelected = false;
        this.totalLowTaskBoardNamesVO[boardIndex].isSelected = false;
        this.totalHighTaskBoardNamesVO[boardIndex].isSelected = false;
        this.totalMediumTaskBoardNamesVO[boardIndex].isSelected = false;
        this.totalNoPriorityTaskBoardNamesVO[boardIndex].isSelected = false;
        this.totalPastDueTasksBoardNamesVO[boardIndex].isSelected = false;
        this.totalDueTodayTasksBoardNamesVO[boardIndex].isSelected = false;
        this.totalDueTomorrowTasksBoardNamesVO[boardIndex].isSelected = false;
        this.totalDueInSevenTasksTasksBoardNamesVO[boardIndex].isSelected = false;
      }
    }

    for (const widgets of this.workspaceDashboardVO.dashboardWidgets) {
      this.changeChartFilterValue(event, widgets.widgetName, board, true);
    }
  }

  openDashboard(dash) {
    this.boardNamesVO.forEach(param => param.isSelected = false);
    this.taskListBoardNamesVO.forEach(param => param.isSelected = false);
    this.unAssignedTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskInProgressBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskDeletedBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskCompletedBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskStatisticsBoardNamesVO.forEach(param => param.isSelected = false);
    this.workloadByStatusBoardNamesVO.forEach(param => param.isSelected = false);
    this.workloadByStatusHorBarBoardNamesVO.forEach(param => param.isSelected = false);
    this.workloadByStatusVerBarBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskByAssigneeBoardNamesVO.forEach(param => param.isSelected = false);
    this.numberOfProgressBoardNamesVO.forEach(param => param.isSelected = false);
    this.numberOfClosedBoardNamesVO.forEach(param => param.isSelected = false);
    this.numberOfCompletedBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskByAssigneeHorBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskByAssigneeVerBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalUnassignedTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalAssignedNotCompletedTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.priorityBreakdownTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.priorityBreakdownHorTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.priorityBreakdownVerTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalUrgentTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalLowTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalHighTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalMediumTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalNoPriorityTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalPastDueTasksBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalDueTodayTasksBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalDueTomorrowTasksBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalDueInSevenTasksTasksBoardNamesVO.forEach(param => param.isSelected = false);
    this.dashboardChartVO.workspaceIdList = [];
    this.dashboardChartVO.taskboardIdList = [];
    this.paginationVO.taskboardIdList = [];
    this.paginationVO.workspaceIdList = [];
    this.showTasksByAssigneeGraph = false;
    this.showWorkloadGraph = false;
    this.dashboardFilter = [];
    this.tasksbyAssigneeFilterCount = 0;
    this.workloadbyStatusFilterCount = 0;
    this.workloadByStatusHorBarFilterCount = 0;
    this.workloadByStatusVerBarFilterCount = 0;
    this.tasksInProgressFilterCount = 0;
    this.tasksDeletedFilterCount = 0;
    this.tasksCompletedFilterCount = 0;
    this.unassignedTasksFilterCount = 0;
    this.taskboardStatisticsFilterCount = 0;
    this.tasksbyAssigneeVerFilterCount = 0;
    this.tasksbyAssigneeHorFilterCount = 0;
    this.totalUnAssignedTaskFilterCount = 0;
    this.taskListFilterCount = 0;
    this.totalAssignedNotCompletedTaskFilterCount = 0;
    this.priorityBreakdownTaskFilterCount = 0;
    this.priorityBreakdownHorTaskFilterCount = 0;
    this.priorityBreakdownVerTaskFilterCount = 0;
    this.totalUrgentTaskFilterCount = 0;
    this.totalLowTaskFilterCount = 0;
    this.totalHighTaskFilterCount = 0;
    this.totalMediumTaskFilterCount = 0;
    this.totalNoPriorityTaskFilterCount = 0;
    this.totalPastDueTasksFilterCount = 0;
    this.totalDueTodayTasksFilterCount = 0;
    this.totalDueTomorrowTasksFilterCount = 0;
    this.totalDueInSevenTasksFilterCount = 0;
    this.progressTaskboardVO = [];
    this.completedTaskboardVO = [];
    this.deletedTaskboardVO = [];
    this.unassignedTaskboardVO = [];
    this.portfolioTaskboardVO = [];
    this.taskboardVO = [];

    this.previousDashboard = dash;
    this.addName = false;
    this.viewMode = 'Viewing';
    this.workspaceDashboardVO.id = dash.id;
    this.dashboardId = this.workspaceDashboardVO.id;
    this.workspaceDashboardVO.dashbaordId = dash.dashbaordId;
    this.workspaceDashboardVO.dashboardWidgets = [];
    this.workspaceDashboardService.getDashboard(dash.id).subscribe(data => {
      this.activeElement = data.dashboardName;
      if (data.dashboardWidgets.length !== 0) {
        this.showWidgets = true;
        this.workspaceDashboardVO.dashboardWidgets = data.dashboardWidgets;
      } else {
        this.showWidgets = false;
      }
      for (const widgets of data.dashboardWidgets) {
        this.loadWidget(widgets);
      }
    });
    window.history.pushState('', 'id', 'workspace-dashboard/' + dash.dashbaordId);
  }

  clearFilterForTaskboard(formGroup: FormGroup, widget: DashboardWidgetVO) {
    this.selectedItem = '';
    const index = widget.filteredColumns.findIndex(w => w === this.columnId);
    widget.filteredColumns.splice(index, 1);
    if ((formGroup.get('filterValue').value !== null ||
      formGroup.get('filterValue').value !== undefined ||
      formGroup.get('filterValue').value !== '')
      && (formGroup.get('operator').value !== null || formGroup.get('operator').value !== undefined || formGroup.get('operator').value !== '')) {
      formGroup.get('filterValue').setValue(null);
      formGroup.get('operator').setValue(null);
      this.filterCountForTaskboard--;
      for (let i = 0; i < (formGroup.get('filters') as FormArray).length; i++) {
        if (formGroup.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (formGroup.get('filters') as FormArray).removeAt(i);
          this.paginationVO.index = 0;
          const form = (formGroup.get('filters') as FormArray);
          this.paginationVO.filterValue = form.value;
          if (widget.widgetName === 'Tasks in Progress') {

            this.tasksInProgressPaginationVO = this.getPaginationForTasksInProgress();
            this.tasksInProgressPaginationVO.filterValue = form.value;
            this.workspaceDashboardService.getAllProgressTaskoardTask(this.tasksInProgressPaginationVO).subscribe(result => {
              if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
                this.progressTaskboardVO = result.taskboardTaskVo;
                this.progressTaskboardLength = result.totalRecords;

                if (this.progressTaskboardLength !== 0 && this.progressTaskboardLength !== '0') {
                  this.isPaginator = true;
                  this.isLength = true;
                }
                else {
                  this.isPaginator = false;
                  this.isLength = false;
                }

                for (const progressTaskboardVO of this.progressTaskboardVO) {
                  if (progressTaskboardVO.dueDate !== undefined
                    && progressTaskboardVO.dueDate !== null
                    && progressTaskboardVO.dueDate !== '') {
                    const date = new Date(progressTaskboardVO.dueDate);
                    date.setDate(date.getDate() + 1);
                    progressTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                    date.setDate(date.getDate() + 1);
                  }
                }
              } else {
                this.progressTaskboardVO = [];
                this.progressTaskboardLength = 0;
              }
            });
          } else if (widget.widgetName === 'Tasks Deleted') {

            this.tasksDeletedPaginationVO = this.getPaginationForTasksDeleted();
            this.tasksDeletedPaginationVO.filterValue = form.value;
            this.workspaceDashboardService.getAllDeletedTaskoardTask(this.tasksDeletedPaginationVO).subscribe(result => {
              if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
                this.deletedTaskboardVO = result.taskboardTaskVo;
                this.deletedTaskboardLength = result.totalRecords;

                if (this.deletedTaskboardLength !== 0 && this.deletedTaskboardLength !== '0') {
                  this.isPaginator = true;
                  this.isLength = true;
                }
                else {
                  this.isPaginator = false;
                  this.isLength = false;
                }


                for (const deletedTaskboardVO of this.deletedTaskboardVO) {
                  if (deletedTaskboardVO.dueDate !== undefined
                    && deletedTaskboardVO.dueDate !== null
                    && deletedTaskboardVO.dueDate !== '') {
                    const date = new Date(deletedTaskboardVO.dueDate);
                    date.setDate(date.getDate() + 1);
                    deletedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                    date.setDate(date.getDate() + 1);
                  }
                }
              } else {
                this.deletedTaskboardVO = [];
                this.deletedTaskboardLength = 0;
              }
            });
          } else if (widget.widgetName === 'Tasks Completed') {

            this.tasksCompletedPaginationVO = this.getPaginationForTasksCompleted();
            this.tasksCompletedPaginationVO.filterValue = form.value;
            this.workspaceDashboardService.getAllDoneTaskoardTask(this.tasksCompletedPaginationVO).subscribe(result => {
              if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
                this.completedTaskboardVO = result.taskboardTaskVo;
                this.completedTaskboardLength = result.totalRecords;

                if (this.completedTaskboardLength !== 0 && this.completedTaskboardLength !== '0') {
                  this.isPaginator = true;
                  this.isLength = true;
                }
                else {
                  this.isPaginator = false;
                  this.isLength = false;
                }

                for (const completedTaskboardVO of this.completedTaskboardVO) {
                  if (completedTaskboardVO.dueDate !== undefined
                    && completedTaskboardVO.dueDate !== null
                    && completedTaskboardVO.dueDate !== '') {
                    const date = new Date(completedTaskboardVO.dueDate);
                    date.setDate(date.getDate() + 1);
                    completedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                    date.setDate(date.getDate() + 1);
                  }
                }

              } else {
                this.completedTaskboardVO = [];
                this.completedTaskboardLength = 0;
              }
            });
          } else if (widget.widgetName === 'Unassigned Tasks') {

            this.unassignedTasksPaginationVO = this.getPaginationForUnassignedTasks();
            this.unassignedTasksPaginationVO.filterValue = form.value;
            this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.unassignedTasksPaginationVO).subscribe(result => {
              if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
                this.unassignedTaskboardVO = result.taskboardTaskVo;
                this.unassignedTaskboardLength = result.totalRecords;

                if (this.unassignedTaskboardLength !== 0 && this.unassignedTaskboardLength !== '0') {
                  this.isPaginator = true;
                  this.isLength = true;
                }
                else {
                  this.isPaginator = false;
                  this.isLength = false;
                }


                for (const unassignedTaskboardVO of this.unassignedTaskboardVO) {
                  if (unassignedTaskboardVO.dueDate !== undefined
                    && unassignedTaskboardVO.dueDate !== null
                    && unassignedTaskboardVO.dueDate !== '') {
                    const date = new Date(unassignedTaskboardVO.dueDate);
                    date.setDate(date.getDate() + 1);
                    unassignedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                    date.setDate(date.getDate() + 1);
                  }
                }
              } else {
                this.unassignedTaskboardVO = [];
                this.unassignedTaskboardLength = 0;
              }
            });
          } else if (widget.widgetName === 'Task List') {
            this.showWidgets = true;
            this.showTaskList = true;
            this.taskListPaginationVO = this.getPaginationForTaskList();
            this.taskListPaginationVO.filterValue = form.value;
            this.loadTaskboardTableData();
          }

        }
      }
    }
  }

  saveWidgets(name, widgetType) {
    this.workspaceDashboardVO.id = this.dashboardId;

    const dashboardWidget = new DashboardWidgetVO();
    dashboardWidget.widgetName = name;
    dashboardWidget.id = null;
    dashboardWidget.dashboardId = null;
    dashboardWidget.rownum = this.getRowNum(this.workspaceDashboardVO.dashboardWidgets);
    dashboardWidget.colnum = this.getColumnNum(this.workspaceDashboardVO.dashboardWidgets);
    dashboardWidget.widgetType = widgetType;
    this.workspaceDashboardVO.dashboardWidgets.push(dashboardWidget);


    this.workspaceDashboardService.saveDashboard(this.workspaceDashboardVO).subscribe(dashboardData => {
      if (dashboardData.response.includes('successfully')) {
        this.workspaceDashboardService.getDashboard(this.workspaceDashboardVO.id).subscribe(data => {
          this.activeElement = data.dashboardName;
          this.dashboardId = data.id;
          this.workspaceDashboardVO.id = data.id;
          if (data.dashboardWidgets.length !== 0) {
            this.showWidgets = true;
            this.workspaceDashboardVO.dashboardWidgets = data.dashboardWidgets;
          } else {
            this.showWidgets = false;
          }
          for (const widgets of data.dashboardWidgets) {
            this.loadWidget(widgets);
          }
          window.history.pushState('', 'id', 'workspace-dashboard/' + data[0].dashbaordId);
        });
      }
    });
  }

  addToNameList(event) {
    if (event !== '' && event !== undefined && event !== null) {
      this.workspaceDashboardService.checkDashboardName(event).subscribe(data => {
        if (data.response.includes('already exist')) {
          this.form.get('dashboardName').setErrors({ alreadyExist: true });
        } else {
          this.dashboardKey = event.split(' ').join('-');
          this.showWidgets = false;
          this.addName = false;
          this.noDashboard = false;
          this.workspaceDashboardVO.dashboardWidgets = [];
          this.workspaceDashboardVO.dashboardName = event;
          this.workspaceDashboardVO.id = null;
          this.workspaceDashboardVO.dashbaordId = this.dashboardKey;
          this.workspaceDashboardService.saveDashboardName(this.workspaceDashboardVO).subscribe(res => {
            if (res.response.includes('saved successfully')) {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: res.response
              });
              this.form.reset();
              this.setDashboardNameList(this.workspaceDashboardVO.dashboardName);
            }
          });
        }
      });
    }
  }

  setDashboardNameList(dashboardName) {
    this.workspaceDashboardService.getDashboardNameList().subscribe(data => {
      this.dashboardNameList = data;
      this.filteredDashboardNameList = data;
      const index = this.filteredDashboardNameList.findIndex(t => t.dashboardName === dashboardName);
      if (index !== -1) {
        this.workspaceDashboardService.getDashboard(this.filteredDashboardNameList[index].id).subscribe(dash => {
          this.activeElement = dash.dashboardName;
          this.dashboardId = dash.dashbaordId;
          this.workspaceDashboardVO.id = dash.id;
          this.dashboardId = dash.id;
          if (dash.dashboardWidgets.length !== 0) {
            this.showWidgets = true;
            this.workspaceDashboardVO.dashboardWidgets = dash.dashboardWidgets;
          } else {
            this.showWidgets = false;
          }
          for (const widgets of dash.dashboardWidgets) {
            this.loadWidget(widgets);
          }
          window.history.pushState('', 'id', 'workspace-dashboard/' + dash.dashbaordId);
        });
      }
    });
  }

  getRowNum(list): number {
    const index = list.length / 2;
    const rowNum = Math.floor(index);
    return rowNum;
  }

  getColumnNum(list): number {
    let columnNum;
    const length = list.length;
    columnNum = length % 2 === 0 ? 0 : 1;
    return columnNum;
  }

  newDashboard() {
    this.addName = true;
    this.showWidgets = false;
    this.activeElement = '';
  }


  loadFilteredWidgets(widget: DashboardWidgetVO): void {
    if (widget.widgetName === 'Task List') {
      this.workspaceDashboardService.getAllTaskList(this.paginationVO).subscribe(result => {
        if (result != null) {
          this.taskboardVO = result.taskboardTaskVo;
          this.taskboardLength = result.totalRecords;
          if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          } else {
            this.isPaginator = false;
            this.isLength = false;
          }
        }
      });
    } else if (widget.widgetName === 'Tasks by Assignee') {
      this.showWidgets = true;
      this.showTasksByAssignee = true;
      this.taskByAssigneeChartVO.workspaceIdList = [];
      this.taskByAssigneeChartVO.taskboardIdList = [];
      this.workspaceDashboardService.getTasksByAssigneeChart(this.taskByAssigneeChartVO).subscribe(res => {
        this.getAssigneeTasks.series[0].data = res;
        this.showTasksByAssigneeGraph = true;
      });
    } else if (widget.widgetName === 'Tasks in Progress') {
      this.tasksInProgressPaginationVO.filterColumnName = 'Progress';
      this.workspaceDashboardService.getAllProgressTaskoardTask(this.tasksInProgressPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.progressTaskboardVO = result.taskboardTaskVo;
          this.progressTaskboardLength = result.totalRecords;
          if (this.progressTaskboardLength !== 0 && this.progressTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          } else {
            this.isPaginator = false;
            this.isLength = false;
          }
        } else {
          this.progressTaskboardVO = [];
          this.progressTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Tasks Deleted') {
      this.showWidgets = true;
      this.showClosedTasks = false;
      this.isLength = false;
      this.isPaginator = false;
      this.tasksDeletedPaginationVO = this.getPaginationForTasksDeleted();
      this.tasksDeletedPaginationVO.workspaceIdList = [];
      this.tasksDeletedPaginationVO.filterColumnName = 'Progress';
      this.workspaceDashboardService.getAllDeletedTaskoardTask(this.tasksDeletedPaginationVO).subscribe(result => {
        if (result) {
          this.showClosedTasks = true;
          if (result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.deletedTaskboardVO = result.taskboardTaskVo;
            this.deletedTaskboardLength = result.totalRecords;

            if (this.deletedTaskboardLength !== 0 && this.deletedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const deletedTaskboardVO of this.deletedTaskboardVO) {
              if (deletedTaskboardVO.dueDate !== undefined &&
                deletedTaskboardVO.dueDate !== null &&
                deletedTaskboardVO.dueDate !== '') {
                const date = new Date(deletedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                deletedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.deletedTaskboardVO = [];
            this.deletedTaskboardLength = 0;
          }
        }
      });
    } else if (widget.widgetName === 'Tasks Completed') {
      this.showWidgets = true;
      this.showCompletedTasks = true;
      this.isLength = false;
      this.isPaginator = false;
      this.tasksCompletedPaginationVO = this.getPaginationForTasksCompleted();
      this.tasksCompletedPaginationVO.workspaceIdList = [];
      this.tasksCompletedPaginationVO.filterColumnName = 'Progress';
      this.workspaceDashboardService.getAllDoneTaskoardTask(this.tasksCompletedPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.completedTaskboardVO = result.taskboardTaskVo;
          this.completedTaskboardLength = result.totalRecords;

          if (this.completedTaskboardLength !== 0 && this.completedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }
          for (const completedTaskboardVO of this.completedTaskboardVO) {
            if (completedTaskboardVO.dueDate !== undefined &&
              completedTaskboardVO.dueDate !== null &&
              completedTaskboardVO.dueDate !== '') {
              const date = new Date(completedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              completedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.completedTaskboardVO = [];
          this.completedTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Unassigned Tasks') {
      this.showWidgets = true;
      this.showUnassignedTasks = true;
      this.isLength = false;
      this.isPaginator = false;
      this.unassignedTasksPaginationVO = this.getPaginationForUnassignedTasks();
      this.unassignedTasksPaginationVO.workspaceIdList = [];
      this.unassignedTasksPaginationVO.filterColumnName = 'Progress';
      this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.unassignedTasksPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.unassignedTaskboardVO = result.taskboardTaskVo;
          this.unassignedTaskboardLength = result.totalRecords;
          if (this.unassignedTaskboardLength !== 0 && this.unassignedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }
          for (const unassignedTaskboardVO of this.unassignedTaskboardVO) {
            if (unassignedTaskboardVO.dueDate !== undefined &&
              unassignedTaskboardVO.dueDate !== null &&
              unassignedTaskboardVO.dueDate !== '') {
              const date = new Date(unassignedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              unassignedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.unassignedTaskboardVO = [];
          this.unassignedTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Taskboard Statistics') {
      this.showWidgets = true;
      this.showPortfolio = true;
      this.isLength = false;
      this.isPaginator = false;
      this.paginationVO.workspaceIdList = [];
      this.paginationVO.filterColumnName = 'name';
      this.workspaceDashboardService.getPortfolio(this.paginationVO).subscribe(result => {
        if (result && result.portfolioList.length > 0) {
          this.portfolioTaskboardVO = result.portfolioList;
          this.portfolioLength = result.totalRecords;

          if (this.portfolioLength !== 0 && this.portfolioLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const portfolioTaskboardVO of this.portfolioTaskboardVO) {
            if (portfolioTaskboardVO.dueDate !== undefined &&
              portfolioTaskboardVO.dueDate !== null &&
              portfolioTaskboardVO.dueDate !== '') {
              const date = new Date(portfolioTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              portfolioTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.portfolioTaskboardVO = [];
          this.portfolioLength = 0;
        }
      });
    }
  }

  loadBoardNames() {
    this.workspaceDashboardService.getTaskboardNamesList().subscribe(names => {
      this.filterBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.boardNamesVO = JSON.parse(JSON.stringify(names));
      this.taskListBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.unAssignedTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.taskInProgressBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.taskDeletedBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.taskCompletedBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.taskStatisticsBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.workloadByStatusBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.taskByAssigneeBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.workloadByStatusHorBarBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.workloadByStatusVerBarBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.numberOfProgressBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.numberOfClosedBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.numberOfCompletedBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.taskByAssigneeHorBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.taskByAssigneeVerBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalUnassignedTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalAssignedNotCompletedTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.priorityBreakdownTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.priorityBreakdownHorTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.priorityBreakdownVerTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalUrgentTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalLowTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalHighTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalMediumTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalNoPriorityTaskBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalPastDueTasksBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalDueTodayTasksBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalDueTomorrowTasksBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.totalDueInSevenTasksTasksBoardNamesVO = JSON.parse(JSON.stringify(names));
      this.boardNamesVO.forEach(param => param.isSelected = false);
      this.taskListBoardNamesVO.forEach(param => param.isSelected = false);
      this.unAssignedTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.taskInProgressBoardNamesVO.forEach(param => param.isSelected = false);
      this.taskDeletedBoardNamesVO.forEach(param => param.isSelected = false);
      this.taskCompletedBoardNamesVO.forEach(param => param.isSelected = false);
      this.taskStatisticsBoardNamesVO.forEach(param => param.isSelected = false);
      this.workloadByStatusBoardNamesVO.forEach(param => param.isSelected = false);
      this.workloadByStatusHorBarBoardNamesVO.forEach(param => param.isSelected = false);
      this.taskByAssigneeBoardNamesVO.forEach(param => param.isSelected = false);
      this.workloadByStatusVerBarBoardNamesVO.forEach(param => param.isSelected = false);
      this.numberOfProgressBoardNamesVO.forEach(param => param.isSelected = false);
      this.numberOfClosedBoardNamesVO.forEach(param => param.isSelected = false);
      this.numberOfCompletedBoardNamesVO.forEach(param => param.isSelected = false);
      this.taskByAssigneeHorBoardNamesVO.forEach(param => param.isSelected = false);
      this.taskByAssigneeVerBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalUnassignedTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalAssignedNotCompletedTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.priorityBreakdownTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.priorityBreakdownHorTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.priorityBreakdownVerTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalUrgentTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalLowTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalHighTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalMediumTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalNoPriorityTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalPastDueTasksBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalDueTodayTasksBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalDueTomorrowTasksBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalDueInSevenTasksTasksBoardNamesVO.forEach(param => param.isSelected = false);

    });
  }

  loadWidget(widget) {
    this.paginationVO.filterType = 'all';

    if (widget.widgetName === 'Workload by Status') {
      this.showWidgets = true;
      this.showWorkload = false;
      this.workloadByStatusChartVO.filterType = 'all';
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.workloadByStatusChartVO.workspaceIdList = [];
        this.workloadByStatusChartVO.taskboardIdList = [];
      } else {
        this.workloadByStatusChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getWorkLoadChart(this.workloadByStatusChartVO).subscribe(res => {
        if (res) {
          this.getWidget.series[0].data = res;
          this.showWorkloadGraph = true;
        }
      });
    } else if (widget.widgetName === 'Task List') {
      this.showWidgets = true;
      this.showTaskList = false;
      this.loadTaskboardTableData();
    } else if (widget.widgetName === 'Tasks by Assignee') {
      this.showWidgets = true;
      this.showTasksByAssignee = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.taskByAssigneeChartVO.workspaceIdList = [];
        this.taskByAssigneeChartVO.taskboardIdList = [];
      } else {
        this.taskByAssigneeChartVO = this.dashboardChart;
      }
      this.taskByAssigneeChartVO.filterType = 'all';
      this.workspaceDashboardService.getTasksByAssigneeChart(this.taskByAssigneeChartVO).subscribe(res => {
        if (res) {
          this.getAssigneeTasks.series[0].data = res;
          this.showTasksByAssigneeGraph = true;
        }
      });
    } else if (widget.widgetName === 'Tasks in Progress') {
      this.showWidgets = true;
      this.showTasksInProgress = false;
      this.isLength = false;
      this.isPaginator = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.tasksInProgressPaginationVO = this.getPaginationForTasksInProgress();
        this.tasksInProgressPaginationVO.workspaceIdList = [];
        this.tasksInProgressPaginationVO.taskboardIdList = [];
        this.tasksInProgressPaginationVO.filterColumnName = 'Progress';
        this.tasksInProgressPaginationVO.filterType = 'all';
      } else {
        this.tasksInProgressPaginationVO = this.pagination;
        if (this.paginatorForTasksInProgress.index > 0) {
          this.tasksInProgressPaginationVO.index = this.paginatorForTasksInProgress.index;
        } else {
          this.tasksInProgressPaginationVO.index = 0;
        }
        if (this.paginatorForTasksInProgress.pageSize > 5) {
          this.tasksInProgressPaginationVO.size = this.paginatorForTasksInProgress.pageSize;
        } else {
          this.tasksInProgressPaginationVO.size = this.defaultPageSize;
        }
      }

      this.workspaceDashboardService.getAllProgressTaskoardTask(this.tasksInProgressPaginationVO).subscribe(result => {
        if (result) {
          this.showTasksInProgress = true;
          if (result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.progressTaskboardVO = result.taskboardTaskVo;
            this.progressTaskboardLength = result.totalRecords;
            this.statusVOInProgressList = result.statusList;

            if (this.progressTaskboardLength !== 0 && this.progressTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

          } else {
            this.progressTaskboardVO = [];
            this.progressTaskboardLength = 0;
          }
        }
      });
    } else if (widget.widgetName === 'Tasks Deleted') {
      this.showWidgets = true;
      this.showClosedTasks = false;
      this.isLength = false;
      this.isPaginator = false;

      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.tasksDeletedPaginationVO = this.getPaginationForTasksDeleted();
        this.tasksDeletedPaginationVO.workspaceIdList = [];
        this.tasksDeletedPaginationVO.taskboardIdList = [];
        this.tasksDeletedPaginationVO.filterColumnName = 'Progress';
        this.tasksDeletedPaginationVO.filterType = 'all';
      } else {
        this.tasksDeletedPaginationVO = this.pagination;
        if (this.paginatorForTasksDeleted.index > 0) {
          this.tasksDeletedPaginationVO.index = this.paginatorForTasksDeleted.index;
        } else {
          this.tasksDeletedPaginationVO.index = 0;
        }
        if (this.paginatorForTasksDeleted.pageSize > 5) {
          this.tasksDeletedPaginationVO.size = this.paginatorForTasksDeleted.pageSize;
        } else {
          this.tasksDeletedPaginationVO.size = this.defaultPageSize;
        }
      }

      this.workspaceDashboardService.getAllDeletedTaskoardTask(this.tasksDeletedPaginationVO).subscribe(result => {
        if (result) {
          this.showClosedTasks = true;
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.deletedTaskboardVO = result.taskboardTaskVo;
            this.deletedTaskboardLength = result.totalRecords;
            this.statusVODeletedList = result.statusList;
            if (this.deletedTaskboardLength !== 0 && this.deletedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const deletedTaskboardVO of this.deletedTaskboardVO) {
              if (deletedTaskboardVO.dueDate !== undefined &&
                deletedTaskboardVO.dueDate !== null &&
                deletedTaskboardVO.dueDate !== '') {
                const date = new Date(deletedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                deletedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.deletedTaskboardVO = [];
            this.deletedTaskboardLength = 0;
          }
        }
      });
    } else if (widget.widgetName === 'Tasks Completed') {
      this.showWidgets = true;
      this.showCompletedTasks = false;
      this.isLength = false;
      this.isPaginator = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.tasksCompletedPaginationVO = this.getPaginationForTasksCompleted();
        this.tasksCompletedPaginationVO.workspaceIdList = [];
        this.tasksCompletedPaginationVO.taskboardIdList = [];
        this.tasksCompletedPaginationVO.filterColumnName = 'Progress';
        this.tasksCompletedPaginationVO.filterType = 'all';
      } else {
        this.tasksCompletedPaginationVO = this.pagination;
      }


      this.workspaceDashboardService.getAllDoneTaskoardTask(this.tasksCompletedPaginationVO).subscribe(result => {
        if (result) {
          this.showCompletedTasks = true;
          if (result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.completedTaskboardVO = result.taskboardTaskVo;
            this.completedTaskboardLength = result.totalRecords;
            this.statusVOCompletedList = result.statusList;
            if (this.completedTaskboardLength !== 0 && this.completedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const completedTaskboardVO of this.completedTaskboardVO) {
              if (completedTaskboardVO.dueDate !== undefined &&
                completedTaskboardVO.dueDate !== null &&
                completedTaskboardVO.dueDate !== '') {
                const date = new Date(completedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                completedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.completedTaskboardVO = [];
            this.completedTaskboardLength = 0;
          }
        }
      });
    } else if (widget.widgetName === 'Unassigned Tasks') {
      this.showWidgets = true;
      this.showUnassignedTasks = false;
      this.isLength = false;
      this.isPaginator = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.unassignedTasksPaginationVO = this.getPaginationForUnassignedTasks();
        this.unassignedTasksPaginationVO.workspaceIdList = [];
        this.unassignedTasksPaginationVO.taskboardIdList = [];
        this.unassignedTasksPaginationVO.filterColumnName = 'Progress';
        this.unassignedTasksPaginationVO.filterType = 'all';
      } else {
        this.unassignedTasksPaginationVO = this.pagination;
      }


      this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.unassignedTasksPaginationVO).subscribe(result => {
        if (result) {
          this.showUnassignedTasks = true;
          if (result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.unassignedTaskboardVO = result.taskboardTaskVo;
            this.unassignedTaskboardLength = result.totalRecords;
            if (this.statusVOAssigneeList === [] || this.statusVOAssigneeList === null || this.statusVOAssigneeList.length === 0) {
              this.statusVOAssigneeList = result.statusList;
            }
            if (this.unassignedTaskboardLength !== 0 && this.unassignedTaskboardLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const unassignedTaskboardVO of this.unassignedTaskboardVO) {
              if (unassignedTaskboardVO.dueDate !== undefined &&
                unassignedTaskboardVO.dueDate !== null &&
                unassignedTaskboardVO.dueDate !== '') {
                const date = new Date(unassignedTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                unassignedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }
            }
          } else {
            this.unassignedTaskboardVO = [];
            this.unassignedTaskboardLength = 0;
          }
        }
      });
    } else if (widget.widgetName === 'Taskboard Statistics') {
      this.showWidgets = true;
      this.showPortfolio = false;
      this.isLength = false;
      this.isPaginator = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.taskboardStatisticsPaginationVO = this.getPaginationForTaskboardStatistice();
        this.taskboardStatisticsPaginationVO.workspaceIdList = [];
        this.taskboardStatisticsPaginationVO.taskboardIdList = [];
        this.taskboardStatisticsPaginationVO.filterColumnName = 'Progress';
        this.taskboardStatisticsPaginationVO.filterType = 'all';
      } else {
        this.taskboardStatisticsPaginationVO = this.pagination;
      }

      this.workspaceDashboardService.getPortfolio(this.taskboardStatisticsPaginationVO).subscribe(result => {
        if (result) {
          this.showPortfolio = true;
          if (result && result.portfolioList.length > 0) {
            this.portfolioTaskboardVO = result.portfolioList;
            this.portfolioLength = result.totalRecords;

            if (this.portfolioLength !== 0 && this.portfolioLength !== '0') {
              this.isPaginator = true;
              this.isLength = true;
            }
            else {
              this.isPaginator = false;
              this.isLength = false;
            }

            for (const portfolioTaskboardVO of this.portfolioTaskboardVO) {
              if (portfolioTaskboardVO.dueDate !== undefined &&
                portfolioTaskboardVO.dueDate !== null &&
                portfolioTaskboardVO.dueDate !== '') {
                const date = new Date(portfolioTaskboardVO.dueDate);
                date.setDate(date.getDate() + 1);
                portfolioTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }

            }
          } else {
            this.portfolioTaskboardVO = [];
            this.portfolioLength = 0;
          }
        }
      });
    } else if (widget.widgetName === 'Number of Tasks in Progress') {
      this.showWidgets = true;
      this.showNumberOfTasksInProgress = false;
      this.isLength = false;
      this.isPaginator = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.numberOfProgressPaginationVO = this.getPaginationForTasksInProgress();
        this.numberOfProgressPaginationVO.workspaceIdList = [];
        this.numberOfProgressPaginationVO.taskboardIdList = [];
        this.numberOfProgressPaginationVO.filterColumnName = 'Progress';
        this.numberOfProgressPaginationVO.filterType = 'all';
      } else {
        this.numberOfProgressPaginationVO = this.pagination;
      }

      this.workspaceDashboardService.getAllProgressTaskoardTask(this.numberOfProgressPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showNumberOfTasksInProgress = true;
          this.numberOfTasksInProgress = result.totalRecords;
        }
      });
    } else if (widget.widgetName === 'Number of Tasks Closed') {
      this.showWidgets = true;
      this.isLength = false;
      this.isPaginator = false;
      this.showNumberOfTasksClosed = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.numberOfClosedPaginationVO = this.getPaginationForTasksDeleted();
        this.numberOfClosedPaginationVO.workspaceIdList = [];
        this.numberOfClosedPaginationVO.taskboardIdList = [];
        this.numberOfClosedPaginationVO.filterColumnName = 'Progress';
        this.numberOfClosedPaginationVO.filterType = 'all';
      } else {
        this.numberOfClosedPaginationVO = this.pagination;
      }

      this.workspaceDashboardService.getAllDeletedTaskoardTask(this.numberOfClosedPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showNumberOfTasksClosed = true;
          this.numberOfTasksClosed = result.totalRecords;
        }
      });
    } else if (widget.widgetName === 'Number of Tasks Completed') {
      this.showWidgets = true;
      this.isLength = false;
      this.isPaginator = false;
      this.showNumberOfTasksInCompleted = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.numberOfCompletedPaginationVO = this.getPaginationForTasksCompleted();
        this.numberOfCompletedPaginationVO.workspaceIdList = [];
        this.numberOfCompletedPaginationVO.taskboardIdList = [];
        this.numberOfCompletedPaginationVO.filterColumnName = 'Progress';
        this.numberOfCompletedPaginationVO.filterType = 'all';
      } else {
        this.numberOfCompletedPaginationVO = this.pagination;
      }

      this.workspaceDashboardService.getAllDoneTaskoardTask(this.numberOfCompletedPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showNumberOfTasksInCompleted = true;
          this.numberOfTasksCompleted = result.totalRecords;
        }
      });
    } else if (widget.widgetName === 'Workload by Status Ver Bar') {
      this.showWidgets = true;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.workloadByStatusVerBarChartVO.workspaceIdList = [];
        this.workloadByStatusVerBarChartVO.taskboardIdList = [];
        this.workloadByStatusVerBarChartVO.filterType = 'all';
      } else {
        this.workloadByStatusVerBarChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getWorkloadByStatusHorBar(this.workloadByStatusVerBarChartVO).subscribe(res => {
        this.workloadByStatusVerBar.series[0].data = res.data;
        this.workloadByStatusVerBar.series[0].name = res.name;
        this.workloadByStatusVerBar.xAxis.categories = res.xaxisCategories;
        this.showWorkloadByStatusVerBar = true;
      });
    } else if (widget.widgetName === 'Total Unassigned Tasks') {
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalUnassignedTaskPaginationVO.taskboardIdList = [];
        this.totalUnassignedTaskPaginationVO.filterType = 'all';
      } else {
        this.totalUnassignedTaskPaginationVO = this.pagination;
      }

      this.showTotalUnassignedTasks = false;
      this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.totalUnassignedTaskPaginationVO).subscribe(result => {
        if (result) {
          this.showTotalUnassignedTasks = true;
          if (result && result.totalRecords) {
            this.totalUnassignedTasks = result.totalRecords;
          }
        }
      });
    } else if (widget.widgetName === 'Tasks by Assignee Ver Bar') {
      this.showWidgets = true;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.taskByAssigneeVerChartVO.workspaceIdList = [];
        this.taskByAssigneeVerChartVO.taskboardIdList = [];
        this.taskByAssigneeVerChartVO.filterType = 'all';
      } else {
        this.taskByAssigneeVerChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getTaskByAssigneeVerBar(this.taskByAssigneeVerChartVO).subscribe(res => {
        this.tasksByAssigneeVerBar.series[0].data = res.data;
        this.tasksByAssigneeVerBar.series[0].name = res.name;
        this.tasksByAssigneeVerBar.xAxis.categories = res.xaxisCategories;
        this.showTasksByAssigneeVerBar = true;
      });
    } else if (widget.widgetName === 'Total Assigned(Not Completed) Tasks') {
      this.showWidgets = true;
      this.showTotalAssignedNotCompletedTasks = false;

      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalAssignedNotCompletedTaskPaginationVO.taskboardIdList = [];
        this.totalAssignedNotCompletedTaskPaginationVO.filterType = 'all';
      } else {
        this.totalAssignedNotCompletedTaskPaginationVO = this.pagination;
      }

      this.workspaceDashboardService.getAssignedTaskCount(this.totalAssignedNotCompletedTaskPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalAssignedNotCompletedTasks = true;
          this.totalAssignedTaskCount = result.totalRecords;
        }
      });
    } else if (widget.widgetName === 'Tasks by Assignee Hor Bar') {
      this.showTasksByAssigneeHorBar = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.taskByAssigneeHorChartVO.workspaceIdList = [];
        this.taskByAssigneeHorChartVO.taskboardIdList = [];
        this.taskByAssigneeHorChartVO.filterType = 'all';
      } else {
        this.taskByAssigneeHorChartVO = this.dashboardChart;
      }


      this.workspaceDashboardService.getTaskByAssigneeVerBar(this.taskByAssigneeHorChartVO).subscribe(res => {
        this.tasksByAssigneeHorBar.series[0].data = res.data;
        this.tasksByAssigneeHorBar.series[0].name = res.name;
        this.tasksByAssigneeHorBar.xAxis.categories = res.xaxisCategories;
        this.showTasksByAssigneeHorBar = true;
      });
    } else if (widget.widgetName === 'Workload by Status Hor Bar') {
      this.showWidgets = true;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.workloadByStatusHorBarChartVO.workspaceIdList = [];
        this.workloadByStatusHorBarChartVO.taskboardIdList = [];
        this.workloadByStatusHorBarChartVO.filterType = 'all';
      } else {
        this.workloadByStatusHorBarChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getWorkloadByStatusHorBar(this.workloadByStatusHorBarChartVO).subscribe(res => {
        this.workloadByStatusHorBar.series[0].data = res.data;
        this.workloadByStatusHorBar.series[0].name = res.name;
        this.workloadByStatusHorBar.xAxis.categories = res.xaxisCategories;
        this.showWorkloadByStatusHorBar = true;
      });
    } else if (widget.widgetName === 'Priority Breakdown') {
      this.showWidgets = true;
      this.showPriorityBreakdown = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.priorityBreakdownTaskChartVO.workspaceIdList = [];
        this.priorityBreakdownTaskChartVO.taskboardIdList = [];
        this.priorityBreakdownTaskChartVO.filterType = 'all';
      } else {
        this.priorityBreakdownTaskChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getPriorityPieChart(this.priorityBreakdownTaskChartVO).subscribe(res => {
        this.getPiePriorityChart.series[0].data = res;
        this.showPriorityBreakdown = true;
      });
    } else if (widget.widgetName === 'Priority Breakdown Hor Bar') {
      this.showWidgets = true;
      this.showPriorityBreakdownForHorizontalBarChart = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.priorityBreakdownHorTaskChartVO.workspaceIdList = [];
        this.priorityBreakdownHorTaskChartVO.taskboardIdList = [];
        this.priorityBreakdownHorTaskChartVO.filterType = 'all';
      } else {
        this.priorityBreakdownHorTaskChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getPriorityBarChart(this.priorityBreakdownHorTaskChartVO).subscribe(res => {
        this.getHorizontalBarPriorityChart.series[0].data = res.data;
        this.getHorizontalBarPriorityChart.series[0].name = res.name;
        this.getHorizontalBarPriorityChart.xAxis.categories = res.xaxisCategories;
        this.showPriorityBreakdownForHorizontalBarChart = true;
      });
    } else if (widget.widgetName === 'Priority Breakdown Ver Bar') {
      this.showWidgets = true;
      this.showPriorityBreakdownForVerticalBarChart = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.priorityBreakdownVerTaskChartVO.workspaceIdList = [];
        this.priorityBreakdownVerTaskChartVO.taskboardIdList = [];
        this.priorityBreakdownVerTaskChartVO.filterType = 'all';
      } else {
        this.priorityBreakdownVerTaskChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getPriorityBarChart(this.priorityBreakdownVerTaskChartVO).subscribe(res => {
        this.getVerticalBarPriorityChart.series[0].data = res.data;
        this.getVerticalBarPriorityChart.series[0].name = res.name;
        this.getVerticalBarPriorityChart.xAxis.categories = res.xaxisCategories;
        this.showPriorityBreakdownForVerticalBarChart = true;
      });
    } else if (widget.widgetName === 'Total Urgent Tasks') {
      this.totalUrgentTaskChartVO.priority = 'Urgent';
      this.showTotalUrgentTasks = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalUrgentTaskChartVO.taskboardIdList = [];
        this.totalUrgentTaskChartVO.filterType = 'all';
      } else {
        this.totalUrgentTaskChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getPriorityTaskCount(this.totalUrgentTaskChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalUrgentTasks = true;
          this.urgentTaskCount = result.totalRecords;
        }
      });
    } else if (widget.widgetName === 'Total High Tasks') {
      this.totalHighTaskBoardChartVO.priority = 'High';
      this.showTotalHighTasks = false;

      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalHighTaskBoardChartVO.taskboardIdList = [];
        this.totalHighTaskBoardChartVO.filterType = 'all';
      } else {
        this.totalHighTaskBoardChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getPriorityTaskCount(this.totalHighTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalHighTasks = true;
          this.highTaskCount = result.totalRecords;
        }
      });
    } else if (widget.widgetName === 'Total Medium Tasks') {
      this.totalMediumTaskBoardChartVO.priority = 'Medium';
      this.showTotalMediumTasks = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalMediumTaskBoardChartVO.taskboardIdList = [];
        this.totalMediumTaskBoardChartVO.filterType = 'all';
      } else {
        this.totalMediumTaskBoardChartVO = this.dashboardChart;
      }


      this.workspaceDashboardService.getPriorityTaskCount(this.totalMediumTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalMediumTasks = true;
          this.mediumTaskCount = result.totalRecords;
        }
      });
    } else if (widget.widgetName === 'Total Low Tasks') {
      this.totalLowTaskBoardChartVO.priority = 'Low';
      this.showTotalLowTasks = false;

      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalLowTaskBoardChartVO.taskboardIdList = [];
        this.totalLowTaskBoardChartVO.filterType = 'all';
      } else {
        this.totalLowTaskBoardChartVO = this.dashboardChart;
      }


      this.workspaceDashboardService.getPriorityTaskCount(this.totalLowTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalLowTasks = true;
          this.lowTaskCount = result.totalRecords;
        }
      });
    } else if (widget.widgetName === 'Total No Priority Tasks') {

      this.showTotalNoPriorityTasks = false;

      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalNoPriorityTaskBoardChartVO.taskboardIdList = [];
        this.totalNoPriorityTaskBoardChartVO.filterType = 'all';
      } else {
        this.totalNoPriorityTaskBoardChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getNoPriorityTaskCount(this.totalNoPriorityTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalNoPriorityTasks = true;
          this.noPriorityTaskCount = result.totalRecords;
        }
      });
    } else if (widget.widgetName === 'Total Past Due Tasks') {
      this.totalPastDueTasksPaginationVO.taskStatus = 'pastDue';

      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalPastDueTasksPaginationVO.taskboardIdList = [];
        this.totalPastDueTasksPaginationVO.filterType = 'all';
      } else {
        this.totalPastDueTasksPaginationVO = this.pagination;
      }

      this.workspaceDashboardService.getTimeTracking(this.totalPastDueTasksPaginationVO).subscribe(result => {
        this.totalPastDueTasks = result.totalRecords;
      });
    } else if (widget.widgetName === 'Total Due Today Tasks') {

      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalDueTodayTasksPaginationVO.taskboardIdList = [];
        this.totalDueTodayTasksPaginationVO.filterType = 'all';
      } else {
        this.totalDueTodayTasksPaginationVO = this.pagination;
      }

      this.totalDueTodayTasksPaginationVO.taskStatus = 'dueToday';

      this.workspaceDashboardService.getTimeTracking(this.totalDueTodayTasksPaginationVO).subscribe(result => {
        this.totalDueTodayTasks = result.totalRecords;
      });
    } else if (widget.widgetName === 'Total Due Tomorrow Tasks') {

      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalDueTodayTasksPaginationVO.taskboardIdList = [];
        this.totalDueTodayTasksPaginationVO.filterType = 'all';
      } else {
        this.totalDueTodayTasksPaginationVO = this.pagination;
      }

      this.totalDueTodayTasksPaginationVO.taskStatus = 'dueTomorrow';

      this.workspaceDashboardService.getTimeTracking(this.totalDueTodayTasksPaginationVO).subscribe(result => {
        this.totalDueTomorrowTasks = result.totalRecords;
      });
    } else if (widget.widgetName === 'Total Due in 7 days Tasks') {

      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.totalDueInSevenTasksTasksPaginationVO.taskboardIdList = [];
        this.totalDueInSevenTasksTasksPaginationVO.filterType = 'all';
      } else {
        this.totalDueInSevenTasksTasksPaginationVO = this.pagination;
      }
      this.totalDueInSevenTasksTasksPaginationVO.taskStatus = 'dueInSevenDays';

      this.workspaceDashboardService.getTimeTracking(this.totalDueInSevenTasksTasksPaginationVO).subscribe(result => {
        this.totalDueInSevenDays = result.totalRecords;
      });
    } else if (widget.widgetName === 'Workflow Task List') {
      this.showWorkflowTaskList = false;
      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForWorkflow();
        this.workflowPaginationVo.filterType = 'all';
      } else {
        paginationVO = this.pagination;
      }
      this.loadWorkflowTableData(paginationVO);
    } else if (widget.widgetName === 'Assignee Task by Taskname') {

      this.showWidgets = true;
      this.showAssigneeTaskByTaskname = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.assigneeTaskByTasknameChartVO.workspaceIdList = [];
        this.assigneeTaskByTasknameChartVO.taskboardIdList = [];
        this.assigneeTaskByTasknameChartVO.filterType = 'all';
      } else {
        this.assigneeTaskByTasknameChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getAssigneeTaskByTaskname(this.assigneeTaskByTasknameChartVO).subscribe(res => {
        this.assigneeTaskByTaskname.series[0].data = res;
        this.showAssigneeTaskByTaskname = true;
      });

    } else if (widget.widgetName === 'Teams Task by Taskname') {

      this.showWidgets = true;
      this.showTeamsTaskByTaskname = false;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        this.teamsTaskByTasknameChartVO.workspaceIdList = [];
        this.teamsTaskByTasknameChartVO.taskboardIdList = [];
        this.teamsTaskByTasknameChartVO.filterType = 'all';
      } else {
        this.teamsTaskByTasknameChartVO = this.dashboardChart;
      }

      this.workspaceDashboardService.getTeamsTaskByTaskname(this.teamsTaskByTasknameChartVO).subscribe(res => {
        this.teamsTaskByTaskname.series[0].data = res;
        this.showTeamsTaskByTaskname = true;
      });

    } else if (widget.widgetName === 'Completed Tasks') {
      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForCompletedTask('COMPLETED');
        paginationVO.filterType = 'all';
      } else {
        paginationVO = this.pagination;
      }
      this.showCompletedTaskList = false;
      this.loadCompletedList(paginationVO);
    } else if (widget.widgetName === 'Running Tasks') {
      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForRunningTask('IN_PROCESS');
        paginationVO.filterType = 'all';
      } else {
        paginationVO = this.pagination;
      }
      this.showRunningTaskList = false;
      this.loadRunningList(paginationVO);
    } else if (widget.widgetName === 'Failed Tasks') {
      this.showErrorTaskList = false;
      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForErrorTask('ERROR');
        paginationVO.filterType = 'all';
      } else {
        paginationVO = this.pagination;
      }
      this.loadErrorList(paginationVO);
    } else if (widget.widgetName === 'Tasks by Teams') {
      this.showWorkflowTasksByTeams = false;
      if (this.isFromPreview) {
        this.taskByTeamsChartVO = this.dashboardChart;
      } else {
        this.taskByTeamsChartVO.filterType = 'all';
      }

      this.workspaceDashboardService.getWorkflowTaskByTeams(this.taskByTeamsChartVO).subscribe(res => {
        this.workflowTaskByTeams.series[0].data = res;
        this.showWorkflowTasksByTeams = true;
      });
    } else if (widget.widgetName === 'Workflow Tasks by Assignee') {
      this.showWorkflowTasksByUsers = false;
      if (this.isFromPreview) {
        this.workflowTasksByAssigneeChartVO = this.dashboardChart;
      } else {
        this.workflowTasksByAssigneeChartVO.filterType = 'all';
      }

      this.workspaceDashboardService.getWorkflowTaskByUsers(this.workflowTasksByAssigneeChartVO).subscribe(res => {
        this.workflowTaskByUsers.series[0].data = res;
        this.showWorkflowTasksByUsers = true;
      });
    } else if (widget.widgetName === 'Assignee Task by Taskname Hor Bar') {
      this.showAssigneeTaskByTasknameHorBar = false;

      if (this.isFromPreview) {
        this.assigneeTaskByTasknameHorChartVO = this.dashboardChart;
      } else {
        this.assigneeTaskByTasknameHorChartVO.filterType = 'all';
      }
      this.workspaceDashboardService.getBarAssigneeTaskByTaskname(this.assigneeTaskByTasknameHorChartVO).subscribe(res => {
        this.showAssigneeTaskByTasknameHorBar = true;
        this.assigneeTaskByTasknameHorBar.series[0].data = res.data;
        this.assigneeTaskByTasknameHorBar.series[0].name = res.name;
        this.assigneeTaskByTasknameHorBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget.widgetName === 'Assignee Task by Taskname Ver Bar') {
      this.showAssigneeTaskByTasknameVerBar = false;
      if (this.isFromPreview) {
        this.assigneeTaskByTasknameVerChartVO = this.dashboardChart;
      } else {
        this.assigneeTaskByTasknameVerChartVO.filterType = 'all';
      }
      this.workspaceDashboardService.getBarAssigneeTaskByTaskname(this.assigneeTaskByTasknameVerChartVO).subscribe(res => {
        this.showAssigneeTaskByTasknameVerBar = true;
        this.assigneeTaskByTasknameVerBar.series[0].data = res.data;
        this.assigneeTaskByTasknameVerBar.series[0].name = res.name;
        this.assigneeTaskByTasknameVerBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget.widgetName === 'Teams Task by Taskname Hor Bar') {
      this.showTeamsTaskByTasknameHorBar = false;
      if (this.isFromPreview) {
        this.teamsTaskByTasknameHorChartVO = this.dashboardChart;
      } else {
        this.teamsTaskByTasknameHorChartVO.filterType = 'all';
      }
      this.workspaceDashboardService.getBarTeamsTaskByTaskname(this.teamsTaskByTasknameHorChartVO).subscribe(res => {
        this.showTeamsTaskByTasknameHorBar = true;
        this.assigneeTaskByTasknameHorBar.series[0].data = res.data;
        this.assigneeTaskByTasknameHorBar.series[0].name = res.name;
        this.assigneeTaskByTasknameHorBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget.widgetName === 'Teams Task by Taskname Ver Bar') {
      this.showTeamsTaskByTasknameVerBar = false;
      if (this.isFromPreview) {
        this.teamsTaskByTasknameVerChartVO = this.dashboardChart;
      } else {
        this.teamsTaskByTasknameVerChartVO.filterType = 'all';
      }
      this.workspaceDashboardService.getBarTeamsTaskByTaskname(this.teamsTaskByTasknameVerChartVO).subscribe(res => {
        this.showTeamsTaskByTasknameVerBar = true;
        this.assigneeTaskByTasknameVerBar.series[0].data = res.data;
        this.assigneeTaskByTasknameVerBar.series[0].name = res.name;
        this.assigneeTaskByTasknameVerBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget.widgetName === 'Number of Running Tasks') {
      if (this.isFromPreview) {
        this.numberOfWorkflowRunningPaginationVO = this.pagination;
      } else {
        this.numberOfWorkflowRunningPaginationVO.filterType = 'all';
      }
      this.numberOfWorkflowRunningPaginationVO.taskStatus = 'IN_PROCESS';
      this.showNumberOfRunningTasks = false;
      this.workspaceDashboardService.getProcessInstanceListCount(this.numberOfWorkflowRunningPaginationVO).subscribe(data => {
        if (data && data.totalRecords) {
          this.totalNumberOfRunningTasks = data.totalRecords;
          this.showNumberOfRunningTasks = true;
        }
      });
    } else if (widget.widgetName === 'Number of Failed Tasks') {
      if (this.isFromPreview) {
        this.numberOfWorkflowFailedPaginationVO = this.pagination;
      } else {
        this.numberOfWorkflowFailedPaginationVO.filterType = 'all';
        this.numberOfWorkflowFailedPaginationVO.taskStatus = 'ERROR';
      }

      this.showNumberOfFailedTasks = false;
      this.workspaceDashboardService.getProcessInstanceListCount(this.numberOfWorkflowFailedPaginationVO).subscribe(data => {
        if (data && data.totalRecords) {
          this.totalNumberOfFailedTasks = data.totalRecords;
          this.showNumberOfFailedTasks = true;
        }
      });
    } else if (widget.widgetName === 'Number of Completed Tasks') {
      if (this.isFromPreview) {
        this.numberOfWorkflowCompletedPaginationVO = this.pagination;
      } else {
        this.numberOfWorkflowCompletedPaginationVO.filterType = 'all';
        this.numberOfWorkflowCompletedPaginationVO.taskStatus = 'COMPLETED';
      }

      this.showNumberOfCompletedTasks = false;
      this.workspaceDashboardService.getProcessInstanceListCount(this.numberOfWorkflowCompletedPaginationVO).subscribe(data => {
        if (data && data.totalRecords) {
          this.totalNumberOfCompletedTasks = data.totalRecords;
          this.showNumberOfCompletedTasks = true;
        }
      });
    } else if (widget.widgetName === 'Workflow Tasks by Assignee Hor Bar') {
      if (this.isFromPreview) {
        this.workflowTasksByAssigneeHorChartVO = this.dashboardChart;
      } else {
        this.workflowTasksByAssigneeHorChartVO.filterType = 'all';
      }
      this.showWorkflowTasksByUsersHorBar = false;
      this.workspaceDashboardService.getBarWorkflowTaskByUsers(this.workflowTasksByAssigneeHorChartVO).subscribe(res => {
        this.showWorkflowTasksByUsersHorBar = true;
        this.workflowTaskByUsersHorBar.series[0].data = res.data;
        this.workflowTaskByUsersHorBar.series[0].name = res.name;
        this.workflowTaskByUsersHorBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget.widgetName === 'Workflow Tasks by Assignee Ver Bar') {
      this.showWorkflowTasksByUsersVerBar = false;
      if (this.isFromPreview) {
        this.workflowTasksByAssigneeVerChartVO = this.dashboardChart;
      } else {
        this.workflowTasksByAssigneeVerChartVO.filterType = 'all';
      }

      this.workspaceDashboardService.getBarWorkflowTaskByUsers(this.workflowTasksByAssigneeVerChartVO).subscribe(res => {
        this.showWorkflowTasksByUsersVerBar = true;
        this.workflowTaskByUsersVerBar.series[0].data = res.data;
        this.workflowTaskByUsersVerBar.series[0].name = res.name;
        this.workflowTaskByUsersVerBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget.widgetName === 'Tasks by Teams Hor Bar') {
      this.showWorkflowTasksByTeamsHorBar = false;
      if (this.isFromPreview) {
        this.taskByTeamsHorChartVO = this.dashboardChart;
      } else {
        this.taskByTeamsHorChartVO.filterType = 'all';
      }

      this.workspaceDashboardService.getBarWorkflowTaskByTeams(this.taskByTeamsHorChartVO).subscribe(res => {
        this.showWorkflowTasksByTeamsHorBar = true;
        this.workflowTaskByTeamsHorBar.series[0].data = res.data;
        this.workflowTaskByTeamsHorBar.series[0].name = res.name;
        this.workflowTaskByTeamsHorBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget.widgetName === 'Tasks by Teams Ver Bar') {
      this.showWorkflowTasksByTeamsVerBar = false;
      if (this.isFromPreview) {
        this.taskByTeamsVerChartVO = this.dashboardChart;
      } else {
        this.taskByTeamsVerChartVO.filterType = 'all';
      }
      this.workspaceDashboardService.getBarWorkflowTaskByTeams(this.taskByTeamsVerChartVO).subscribe(res => {
        this.showWorkflowTasksByTeamsVerBar = true;
        this.workflowTaskByTeamsVerBar.series[0].data = res.data;
        this.workflowTaskByTeamsVerBar.series[0].name = res.name;
        this.workflowTaskByTeamsVerBar.xAxis.categories = res.xaxisCategories;
      });
    } else if (widget.widgetName === 'Total Past Due Tasks (Workflow)') {
      if (this.isFromPreview) {
        this.totalPastDueWorkflowTasksPaginationVO = this.pagination;
      } else {
        this.totalPastDueWorkflowTasksPaginationVO.taskStatus = 'pastDue';
        this.totalPastDueWorkflowTasksPaginationVO.filterType = 'all';
      }

      this.workspaceDashboardService.getWorkflowTimeTracking(this.totalPastDueWorkflowTasksPaginationVO).subscribe(result => {
        this.totalWorkflowPastDueTasks = result.totalRecords;
      });
    } else if (widget.widgetName === 'Total Due Today Tasks (Workflow)') {
      if (this.isFromPreview) {
        this.totalDueTodayWorkflowTasksPaginationVO = this.pagination;
      } else {
        this.totalDueTodayWorkflowTasksPaginationVO.taskStatus = 'dueToday';
        this.totalDueTodayWorkflowTasksPaginationVO.filterType = 'all';
      }

      this.workspaceDashboardService.getWorkflowTimeTracking(this.totalDueTodayWorkflowTasksPaginationVO).subscribe(result => {
        this.totalWorkflowDueTodayTasks = result.totalRecords;
      });
    } else if (widget.widgetName === 'Total Due Tomorrow Tasks (Workflow)') {
      if (this.isFromPreview) {
        this.totalDueTomorrowWorkflowTasksPaginationVO = this.pagination;
      } else {
        this.totalDueTomorrowWorkflowTasksPaginationVO.taskStatus = 'dueTomorrow';
        this.totalDueTomorrowWorkflowTasksPaginationVO.filterType = 'all';
      }

      this.workspaceDashboardService.getWorkflowTimeTracking(this.totalDueTomorrowWorkflowTasksPaginationVO).subscribe(result => {
        this.totalWorkflowDueTomorrowTasks = result.totalRecords;
      });
    } else if (widget.widgetName === 'Total Due in 7 days Tasks (Workflow)') {
      if (this.isFromPreview) {
        this.totalDueInSevenWorkflowTasksTasksPaginationVO = this.pagination;
      } else {
        this.totalDueInSevenWorkflowTasksTasksPaginationVO.taskStatus = 'dueInSevenDays';
        this.totalDueInSevenWorkflowTasksTasksPaginationVO.filterType = 'all';
      }

      this.workspaceDashboardService.getWorkflowTimeTracking(this.totalDueInSevenWorkflowTasksTasksPaginationVO).subscribe(result => {
        this.totalWorkflowDueInSevenDays = result.totalRecords;
      });
    }

  }

  getPagination(status) {
  }

  getPaginationForCompletedTask(status) {
    this.taskStatus = status;
    if (this.sort === undefined || this.sort.active === undefined || this.sort.active === '') {
      this.completedTaskPaginationVO.columnName = 'start_time';
    } else {
      if (this.sort.active === 'col5' || this.sort.active === 'col4') {
        this.completedTaskPaginationVO.columnName = 'end_time';
      } else if (this.sort.active === 'col3') {
        this.completedTaskPaginationVO.columnName = 'start_time';
      } else if (this.sort.active === 'col2') {
        this.completedTaskPaginationVO.columnName = 'processDefinition.processDefinitionName';
      } else {
        this.completedTaskPaginationVO.columnName = 'start_time';
      }
    }
    if (this.sort === undefined || this.sort.direction === undefined || this.sort.direction === '' || this.sort.direction === null) {
      this.completedTaskPaginationVO.direction = 'desc';
    } else {
      this.completedTaskPaginationVO.direction = this.sort.direction;
    }
    if (this.completedPaginators !== null && this.completedPaginators !== undefined &&
      this.completedPaginators.index !== null && this.completedPaginators.pageSize !== null
      && this.completedPaginators !== undefined && this.completedPaginators.index !== undefined &&
      this.completedPaginators.pageSize !== undefined) {
      this.completedTaskPaginationVO.index = this.completedPaginators.index;
      this.completedTaskPaginationVO.size = this.completedPaginators.pageSize;
    } else {
      this.completedTaskPaginationVO.index = 0;
      this.completedTaskPaginationVO.size = this.defaultPageSize;
    }
    this.completedTaskPaginationVO.taskStatus = status;
    return this.completedTaskPaginationVO;
  }

  getPaginationForRunningTask(status) {
    this.taskStatus = status;
    if (this.sort === undefined || this.sort.active === undefined || this.sort.active === '') {
      this.runningTaskPaginationVO.columnName = 'start_time';
    } else {
      if (this.sort.active === 'col5' || this.sort.active === 'col4') {
        this.runningTaskPaginationVO.columnName = 'end_time';
      } else if (this.sort.active === 'col3') {
        this.runningTaskPaginationVO.columnName = 'start_time';
      } else if (this.sort.active === 'col2') {
        this.runningTaskPaginationVO.columnName = 'processDefinition.processDefinitionName';
      } else {
        this.runningTaskPaginationVO.columnName = 'start_time';
      }
    }
    if (this.sort === undefined || this.sort.direction === undefined || this.sort.direction === '' || this.sort.direction === null) {
      this.runningTaskPaginationVO.direction = 'desc';
    } else {
      this.runningTaskPaginationVO.direction = this.sort.direction;
    }
    if (this.processPaginators !== null && this.processPaginators !== undefined &&
      this.processPaginators.index !== null && this.processPaginators.pageSize !== null
      && this.processPaginators !== undefined && this.processPaginators.index !== undefined &&
      this.processPaginators.pageSize !== undefined) {
      this.runningTaskPaginationVO.index = this.processPaginators.index;
      this.runningTaskPaginationVO.size = this.processPaginators.pageSize;
    } else {
      this.runningTaskPaginationVO.index = 0;
      this.runningTaskPaginationVO.size = this.defaultPageSize;
    }
    this.runningTaskPaginationVO.taskStatus = status;
    return this.runningTaskPaginationVO;
  }

  getPaginationForErrorTask(status) {
    this.taskStatus = status;
    if (this.sort === undefined || this.sort.active === undefined || this.sort.active === '') {
      this.failedTaskPaginationVO.columnName = 'start_time';
    } else {
      if (this.sort.active === 'col5' || this.sort.active === 'col4') {
        this.failedTaskPaginationVO.columnName = 'end_time';
      } else if (this.sort.active === 'col3') {
        this.failedTaskPaginationVO.columnName = 'start_time';
      } else if (this.sort.active === 'col2') {
        this.failedTaskPaginationVO.columnName = 'processDefinition.processDefinitionName';
      } else {
        this.failedTaskPaginationVO.columnName = 'start_time';
      }
    }
    if (this.sort === undefined || this.sort.direction === undefined || this.sort.direction === '' || this.sort.direction === null) {
      this.failedTaskPaginationVO.direction = 'desc';
    } else {
      this.failedTaskPaginationVO.direction = this.sort.direction;
    }
    if (this.failedPaginators !== null && this.failedPaginators !== undefined &&
      this.failedPaginators.index !== null && this.failedPaginators.pageSize !== null
      && this.failedPaginators !== undefined && this.failedPaginators.index !== undefined && this.failedPaginators.pageSize !== undefined) {
      this.failedTaskPaginationVO.index = this.failedPaginators.index;
      this.failedTaskPaginationVO.size = this.failedPaginators.pageSize;
    } else {
      this.failedTaskPaginationVO.index = 0;
      this.failedTaskPaginationVO.size = this.defaultPageSize;
    }
    this.failedTaskPaginationVO.taskStatus = status;
    return this.failedTaskPaginationVO;
  }



  getBrowsertime(utcTime) {
    if (utcTime !== undefined && utcTime !== null && utcTime !== '' && utcTime !== 'null' &&
      (new Date(utcTime).toString() !== 'Invalid Date')) {
      const date = new Date(utcTime);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return this.datepipe.transform(new Date(date.getTime() + userTimezoneOffset), 'dd/MMM/yyyy hh:mm:ss a');
    } else {
      return utcTime;
    }
  }

  checkDate(value: string) {
    if (value !== undefined && value != null) {
      return this.getBrowsertime(value);
    }
    return '';
  }

  loadCompletedList(paginationVO) {
    this.workspaceDashboardService.getProcessInstanceList(paginationVO).subscribe(data => {
      this.completedProcessInstanceList = data.data;
      this.completedListLength = data.totalRecords;
      this.showCompletedTaskList = true;
      if (this.completedListLength !== 0 && this.completedListLength !== '0') {
        this.isLength = true;
        this.isPaginator = true;
      } else {
        this.isLength = false;
        this.isPaginator = false;
      }
    });
  }

  loadRunningList(paginationVO) {
    this.workspaceDashboardService.getProcessInstanceList(paginationVO).subscribe(data => {
      this.runningProcessInstanceList = data.data;
      this.runningListLength = data.totalRecords;
      this.showRunningTaskList = true;
      if (this.runningListLength !== 0 && this.runningListLength !== '0') {
        this.isLength = true;
        this.isPaginator = true;
      } else {
        this.isLength = false;
        this.isPaginator = false;
      }
    });
  }

  loadErrorList(paginationVO) {
    this.workspaceDashboardService.getProcessInstanceList(paginationVO).subscribe(data => {
      this.failedProcessInstanceList = data.data;
      this.failedListLength = data.totalRecords;
      this.showErrorTaskList = true;
      if (this.failedListLength !== 0 && this.failedListLength !== '0') {
        this.isLength = true;
        this.isPaginator = true;
      } else {
        this.isLength = false;
        this.isPaginator = false;
      }
    });
  }

  initializeFilterFormTaskboard() {
    this.form = this.fb.group({
      search: [''],
      searchBoardName: [''],
      dashboardName: ['', [Validators.required]],
      filters: this.fb.array([
        this.addFilterValue()
      ])
    });
  }

  searchFormvalueChanges(): void {
    this.form.get('search').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (const dash of this.dashboardNameList) {
          const dashboardName = dash.dashboardName.toLowerCase();
          if (dashboardName.includes(filterData)) {
            filterList.push(dash);
          }
        }
        this.filteredDashboardNameList = filterList;
      } else {
        this.filteredDashboardNameList = this.dashboardNameList;
      }
    });
  }

  addFilterValue(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      dataType: ['string'],
    });
  }

  clearFilters(chart) {
    if (chart === 'Tasks by Assignee') {
      this.showTasksByAssigneeGraph = false;
      this.taskByAssigneeChartVO.workspaceIdList = [];
      this.taskByAssigneeChartVO.taskboardIdList = [];
      this.taskByAssigneeBoardNamesVO.forEach(param => param.isSelected = false);
      this.tasksbyAssigneeFilterCount = 0;
      this.workspaceDashboardService.getTasksByAssigneeChart(this.taskByAssigneeChartVO).subscribe(res => {
        this.getAssigneeTasks.series[0].data = res;
        this.showTasksByAssigneeGraph = true;
      });
    } else if (chart === 'Workload by Status') {
      this.showWorkloadGraph = false;
      this.workloadByStatusChartVO.workspaceIdList = [];
      this.workloadByStatusChartVO.taskboardIdList = [];
      this.workloadByStatusBoardNamesVO.forEach(param => param.isSelected = false);
      this.workspaceDashboardService.getWorkLoadChart(this.workloadByStatusChartVO).subscribe(res => {
        this.getWidget.series[0].data = res;
        this.showWorkloadGraph = true;
      });
      this.workloadbyStatusFilterCount = 0;
    } else if (chart === 'Tasks in Progress') {
      this.showWidgets = true;
      this.showTasksInProgress = true;
      this.isLength = false;
      this.isPaginator = false;
      this.tasksInProgressPaginationVO = this.getPaginationForTasksInProgress();
      this.tasksInProgressPaginationVO.workspaceIdList = [];
      this.tasksInProgressPaginationVO.taskboardIdList = [];
      this.taskInProgressBoardNamesVO.forEach(param => param.isSelected = false);
      this.tasksInProgressFilterCount = 0;
      this.workspaceDashboardService.getAllProgressTaskoardTask(this.tasksInProgressPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.progressTaskboardVO = result.taskboardTaskVo;
          this.progressTaskboardLength = result.totalRecords;

          if (this.progressTaskboardLength !== 0 && this.progressTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const progressTaskboardVO of this.progressTaskboardVO) {
            if (progressTaskboardVO.dueDate !== undefined &&
              progressTaskboardVO.dueDate !== null && progressTaskboardVO.dueDate !== '') {
              const date = new Date(progressTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              progressTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.progressTaskboardVO = [];
          this.progressTaskboardLength = 0;
        }
      });

    } else if (chart === 'Tasks Deleted') {
      this.showWidgets = true;
      this.showClosedTasks = true;
      this.isLength = false;
      this.isPaginator = false;
      this.tasksDeletedPaginationVO = this.getPaginationForTasksDeleted();
      this.tasksDeletedPaginationVO.filterColumnName = 'Progress';
      this.tasksDeletedPaginationVO.workspaceIdList = [];
      this.tasksDeletedPaginationVO.taskboardIdList = [];
      this.taskDeletedBoardNamesVO.forEach(param => param.isSelected = false);
      this.tasksDeletedFilterCount = 0;
      this.workspaceDashboardService.getAllDeletedTaskoardTask(this.tasksDeletedPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.deletedTaskboardVO = result.taskboardTaskVo;
          this.deletedTaskboardLength = result.totalRecords;

          if (this.deletedTaskboardLength !== 0 && this.deletedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const deletedTaskboardVO of this.deletedTaskboardVO) {
            if (deletedTaskboardVO.dueDate !== undefined &&
              deletedTaskboardVO.dueDate !== null &&
              deletedTaskboardVO.dueDate !== '') {
              const date = new Date(deletedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              deletedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.deletedTaskboardVO = [];
          this.deletedTaskboardLength = 0;
        }
      });
    } else if (chart === 'Tasks Completed') {
      this.showWidgets = true;
      this.showCompletedTasks = true;
      this.isLength = false;
      this.isPaginator = false;
      this.tasksCompletedPaginationVO = this.getPaginationForTasksCompleted();
      this.tasksCompletedPaginationVO.filterColumnName = 'Progress';
      this.tasksCompletedPaginationVO.workspaceIdList = [];
      this.tasksCompletedPaginationVO.taskboardIdList = [];
      this.taskCompletedBoardNamesVO.forEach(param => param.isSelected = false);
      this.tasksCompletedFilterCount = 0;
      this.workspaceDashboardService.getAllDoneTaskoardTask(this.tasksCompletedPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.completedTaskboardVO = result.taskboardTaskVo;
          this.completedTaskboardLength = result.totalRecords;

          if (this.completedTaskboardLength !== 0 && this.completedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const completedTaskboardVO of this.completedTaskboardVO) {
            if (completedTaskboardVO.dueDate !== undefined &&
              completedTaskboardVO.dueDate !== null &&
              completedTaskboardVO.dueDate !== '') {
              const date = new Date(completedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              completedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.completedTaskboardVO = [];
          this.completedTaskboardLength = 0;
        }
      });
    } else if (chart === 'Unassigned Tasks') {
      this.showWidgets = true;
      this.showUnassignedTasks = true;
      this.isLength = false;
      this.isPaginator = false;
      this.unassignedTasksPaginationVO = this.getPaginationForUnassignedTasks();
      this.unassignedTasksPaginationVO.workspaceIdList = [];
      this.unassignedTasksPaginationVO.filterColumnName = 'Progress';
      this.unassignedTasksPaginationVO.taskboardIdList = [];
      this.unAssignedTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.unassignedTasksFilterCount = 0;
      this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.unassignedTasksPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.unassignedTaskboardVO = result.taskboardTaskVo;
          this.unassignedTaskboardLength = result.totalRecords;

          if (this.unassignedTaskboardLength !== 0 && this.unassignedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const unassignedTaskboardVO of this.unassignedTaskboardVO) {
            if (unassignedTaskboardVO.dueDate !== undefined &&
              unassignedTaskboardVO.dueDate !== null &&
              unassignedTaskboardVO.dueDate !== '') {
              const date = new Date(unassignedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              unassignedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.unassignedTaskboardVO = [];
          this.unassignedTaskboardLength = 0;
        }
      });
    } else if (chart === 'Taskboard Statistics') {
      this.showWidgets = true;
      this.showPortfolio = true;
      this.isLength = false;
      this.isPaginator = false;
      this.taskboardStatisticsPaginationVO = this.getPaginationForTaskboardStatistice();
      this.taskboardStatisticsPaginationVO.workspaceIdList = [];
      this.taskboardStatisticsPaginationVO.taskboardIdList = [];
      this.taskboardStatisticsPaginationVO.filterColumnName = 'name';
      this.taskStatisticsBoardNamesVO.forEach(param => param.isSelected = false);
      this.taskboardStatisticsFilterCount = 0;
      this.workspaceDashboardService.getPortfolio(this.taskboardStatisticsPaginationVO).subscribe(result => {
        if (result && result.portfolioList.length > 0) {
          this.portfolioTaskboardVO = result.portfolioList;
          this.portfolioLength = result.totalRecords;

          if (this.portfolioLength !== 0 && this.portfolioLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const portfolioTaskboardVO of this.portfolioTaskboardVO) {
            if (portfolioTaskboardVO.dueDate !== undefined &&
              portfolioTaskboardVO.dueDate !== null &&
              portfolioTaskboardVO.dueDate !== '') {
              const date = new Date(portfolioTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              portfolioTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }

          }
        } else {
          this.portfolioTaskboardVO = [];
          this.portfolioLength = 0;
        }
      });
    } else if (chart === 'Task List') {
      this.showWidgets = true;
      this.showTaskList = true;
      this.taskListPaginationVO = this.getPaginationForTaskList();
      this.taskListPaginationVO.taskStatus = 'all';
      this.taskListPaginationVO.workspaceIdList = [];
      this.taskListPaginationVO.taskboardIdList = [];
      this.taskListBoardNamesVO.forEach(param => param.isSelected = false);
      this.taskListFilterCount = 0;
      this.workspaceDashboardService.getAllTaskList(this.taskListPaginationVO).subscribe(result => {
        if (result != null) {
          this.taskboardVO = result.taskboardTaskVo;
          this.taskboardLength = result.totalRecords;
          if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          } else {
            this.isPaginator = false;
            this.isLength = false;
          }
        }
      });
    } else if (chart === 'Workload by Status Hor Bar') {
      this.showWorkloadByStatusHorBar = false;
      this.workloadByStatusHorBarChartVO.workspaceIdList = [];
      this.workloadByStatusHorBarChartVO.taskboardIdList = [];
      this.workloadByStatusHorBarBoardNamesVO.forEach(param => param.isSelected = false);
      this.workspaceDashboardService.getWorkloadByStatusHorBar(this.workloadByStatusHorBarChartVO).subscribe(res => {
        this.workloadByStatusHorBar.series[0].data = res.data;
        this.workloadByStatusHorBar.series[0].name = res.name;
        this.workloadByStatusHorBar.xAxis.categories = res.xaxisCategories;
        this.showWorkloadByStatusHorBar = true;
      });
      this.workloadByStatusHorBarFilterCount = 0;
    } else if (chart === 'Workload by Status Ver Bar') {
      this.showWidgets = true;
      this.showWorkloadByStatusVerBar = false;
      this.workloadByStatusVerBarChartVO.workspaceIdList = [];
      this.workloadByStatusVerBarChartVO.taskboardIdList = [];
      this.workloadByStatusVerBarBoardNamesVO.forEach(param => param.isSelected = false);
      this.workspaceDashboardService.getWorkloadByStatusHorBar(this.workloadByStatusVerBarChartVO).subscribe(res => {
        this.workloadByStatusVerBar.series[0].data = res.data;
        this.workloadByStatusVerBar.series[0].name = res.name;
        this.workloadByStatusVerBar.xAxis.categories = res.xaxisCategories;
        this.showWorkloadByStatusVerBar = true;
      });
      this.workloadByStatusVerBarFilterCount = 0;
    } else if (chart === 'Number of Tasks in Progress') {
      this.numberOfProgressPaginationVO = this.getPaginationForTaskboard();
      this.numberOfProgressPaginationVO.taskStatus = 'all';
      this.numberOfProgressPaginationVO.workspaceIdList = [];
      this.numberOfProgressPaginationVO.taskboardIdList = [];
      this.numberOfProgressBoardNamesVO.forEach(param => param.isSelected = false);
      this.numberOfProgressTaskFilterCount = 0;
      this.showNumberOfTasksInProgress = false;
      this.workspaceDashboardService.getAllProgressTaskoardTask(this.numberOfProgressPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showNumberOfTasksInProgress = true;
          this.numberOfTasksInProgress = result.totalRecords;
        }
      });
    } else if (chart === 'Number of Tasks Closed') {
      this.numberOfClosedPaginationVO = this.getPaginationForTaskboard();
      this.numberOfClosedPaginationVO.taskStatus = 'all';
      this.numberOfClosedPaginationVO.workspaceIdList = [];
      this.numberOfClosedPaginationVO.taskboardIdList = [];
      this.numberOfClosedBoardNamesVO.forEach(param => param.isSelected = false);
      this.numberOfClosedTaskFilterCount = 0;
      this.showNumberOfTasksClosed = false;
      this.workspaceDashboardService.getAllDeletedTaskoardTask(this.numberOfClosedPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showNumberOfTasksClosed = true;
          this.numberOfTasksClosed = result.totalRecords;
        }
      });
    } else if (chart === 'Number of Tasks Completed') {
      this.numberOfCompletedPaginationVO = this.getPaginationForTaskboard();
      this.numberOfCompletedPaginationVO.taskStatus = 'all';
      this.numberOfCompletedPaginationVO.workspaceIdList = [];
      this.numberOfCompletedPaginationVO.taskboardIdList = [];
      this.numberOfCompletedBoardNamesVO.forEach(param => param.isSelected = false);
      this.numberOfCompletedTaskFilterCount = 0;
      this.showNumberOfTasksInCompleted = false;

      this.workspaceDashboardService.getAllDoneTaskoardTask(this.numberOfCompletedPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showNumberOfTasksInCompleted = true;
          this.numberOfTasksCompleted = result.totalRecords;
        }
      });
    } else if (chart === 'Tasks by Assignee Hor Bar') {
      this.taskByAssigneeHorChartVO.workspaceIdList = [];
      this.taskByAssigneeHorChartVO.taskboardIdList = [];
      this.taskByAssigneeHorBoardNamesVO.forEach(param => param.isSelected = false);
      this.showTasksByAssigneeHorBar = false;
      this.tasksbyAssigneeHorFilterCount = 0;
      this.workspaceDashboardService.getTaskByAssigneeVerBar(this.taskByAssigneeHorChartVO).subscribe(res => {
        this.tasksByAssigneeHorBar.series[0].data = res.data;
        this.tasksByAssigneeHorBar.series[0].name = res.name;
        this.tasksByAssigneeHorBar.xAxis.categories = res.xaxisCategories;
        this.showTasksByAssigneeHorBar = true;
      });
    } else if (chart === 'Tasks by Assignee Ver Bar') {
      this.taskByAssigneeVerChartVO.workspaceIdList = [];
      this.taskByAssigneeVerChartVO.taskboardIdList = [];
      this.taskByAssigneeVerBoardNamesVO.forEach(param => param.isSelected = false);
      this.showTasksByAssigneeVerBar = false;
      this.tasksbyAssigneeVerFilterCount = 0;
      this.workspaceDashboardService.getTaskByAssigneeVerBar(this.taskByAssigneeVerChartVO).subscribe(res => {
        this.tasksByAssigneeVerBar.series[0].data = res.data;
        this.tasksByAssigneeVerBar.series[0].name = res.name;
        this.tasksByAssigneeVerBar.xAxis.categories = res.xaxisCategories;
        this.showTasksByAssigneeVerBar = true;
      });
    } else if (chart === 'Total Unassigned Tasks') {
      this.totalUnassignedTaskPaginationVO.workspaceIdList = [];
      this.totalUnassignedTaskPaginationVO.taskboardIdList = [];
      this.totalUnassignedTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.showTotalUnassignedTasks = false;
      this.totalUnAssignedTaskFilterCount = 0;
      this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.totalUnassignedTaskPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.totalUnassignedTasks = result.totalRecords;
          this.showTotalUnassignedTasks = true;
        }
      });
    } else if (chart === 'Total Assigned(Not Completed) Tasks') {
      this.totalAssignedNotCompletedTaskPaginationVO.workspaceIdList = [];
      this.totalAssignedNotCompletedTaskPaginationVO.taskboardIdList = [];
      this.totalAssignedNotCompletedTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalAssignedNotCompletedTaskFilterCount = 0;
      this.showTotalAssignedNotCompletedTasks = false;
      this.totalAssignedNotCompletedTaskPaginationVO.filterType = 'all';
      this.workspaceDashboardService.getAssignedTaskCount(this.totalAssignedNotCompletedTaskPaginationVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalAssignedNotCompletedTasks = true;
          this.totalAssignedTaskCount = result.totalRecords;
        }
      });
    } else if (chart === 'Priority Breakdown') {
      this.showWidgets = true;
      this.showPriorityBreakdown = false;
      this.priorityBreakdownTaskChartVO.workspaceIdList = [];
      this.priorityBreakdownTaskChartVO.taskboardIdList = [];
      this.priorityBreakdownTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.priorityBreakdownTaskChartVO.filterType = 'all';
      this.priorityBreakdownTaskFilterCount = 0;
      this.workspaceDashboardService.getPriorityPieChart(this.priorityBreakdownTaskChartVO).subscribe(res => {
        this.getPiePriorityChart.series[0].data = res;
        this.showPriorityBreakdown = true;
      });
    } else if (chart === 'Priority Breakdown Hor Bar') {
      this.showWidgets = true;
      this.showPriorityBreakdownForHorizontalBarChart = false;

      this.priorityBreakdownHorTaskChartVO.workspaceIdList = [];
      this.priorityBreakdownHorTaskChartVO.taskboardIdList = [];

      this.priorityBreakdownHorTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.priorityBreakdownHorTaskChartVO.filterType = 'all';
      this.priorityBreakdownHorTaskFilterCount = 0;
      this.workspaceDashboardService.getPriorityBarChart(this.priorityBreakdownHorTaskChartVO).subscribe(res => {
        this.getHorizontalBarPriorityChart.series[0].data = res.data;
        this.getHorizontalBarPriorityChart.series[0].name = res.name;
        this.getHorizontalBarPriorityChart.xAxis.categories = res.xaxisCategories;
        this.showPriorityBreakdownForHorizontalBarChart = true;
      });
    } else if (chart === 'Priority Breakdown Ver Bar') {
      this.showWidgets = true;
      this.showPriorityBreakdownForVerticalBarChart = false;

      this.priorityBreakdownVerTaskChartVO.workspaceIdList = [];
      this.priorityBreakdownVerTaskChartVO.taskboardIdList = [];

      this.priorityBreakdownVerTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.priorityBreakdownVerTaskChartVO.filterType = 'all';
      this.priorityBreakdownVerTaskFilterCount = 0;
      this.workspaceDashboardService.getPriorityBarChart(this.priorityBreakdownVerTaskChartVO).subscribe(res => {
        this.getVerticalBarPriorityChart.series[0].data = res.data;
        this.getVerticalBarPriorityChart.series[0].name = res.name;
        this.getVerticalBarPriorityChart.xAxis.categories = res.xaxisCategories;
        this.showPriorityBreakdownForVerticalBarChart = true;
      });
    } else if (chart === 'Total Urgent Tasks') {
      this.totalUrgentTaskChartVO.priority = 'Urgent';
      this.showTotalUrgentTasks = false;
      this.totalUrgentTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalUrgentTaskChartVO.filterType = 'all';
      this.totalUrgentTaskFilterCount = 0;
      this.workspaceDashboardService.getPriorityTaskCount(this.totalUrgentTaskChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalUrgentTasks = true;
          this.urgentTaskCount = result.totalRecords;
        }
      });
    } else if (chart === 'Total High Tasks') {
      this.totalHighTaskBoardChartVO.priority = 'High';
      this.showTotalHighTasks = false;
      this.totalHighTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalHighTaskBoardChartVO.filterType = 'all';
      this.totalHighTaskFilterCount = 0;
      this.workspaceDashboardService.getPriorityTaskCount(this.totalHighTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalHighTasks = true;
          this.highTaskCount = result.totalRecords;
        }
      });
    } else if (chart === 'Total Medium Tasks') {
      this.totalMediumTaskBoardChartVO.priority = 'Medium';
      this.showTotalMediumTasks = false;
      this.totalMediumTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalMediumTaskBoardChartVO.filterType = 'all';
      this.totalMediumTaskFilterCount = 0;
      this.workspaceDashboardService.getPriorityTaskCount(this.totalMediumTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalMediumTasks = true;
          this.mediumTaskCount = result.totalRecords;
        }
      });
    } else if (chart === 'Total Low Tasks') {
      this.totalLowTaskBoardChartVO.priority = 'Low';
      this.showTotalLowTasks = false;
      this.totalLowTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalLowTaskBoardChartVO.filterType = 'all';
      this.totalLowTaskFilterCount = 0;
      this.workspaceDashboardService.getPriorityTaskCount(this.totalLowTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalLowTasks = true;
          this.lowTaskCount = result.totalRecords;
        }
      });
    } else if (chart === 'Total No Priority Tasks') {
      this.totalNoPriorityTaskBoardChartVO.filterType = 'all';
      this.showTotalNoPriorityTasks = false;
      this.totalNoPriorityTaskBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalNoPriorityTaskFilterCount = 0;
      this.workspaceDashboardService.getNoPriorityTaskCount(this.totalNoPriorityTaskBoardChartVO).subscribe(result => {
        if (result && result.totalRecords) {
          this.showTotalNoPriorityTasks = true;
          this.noPriorityTaskCount = result.totalRecords;
        }
      });
    } else if (chart === 'Total Past Due Tasks') {
      this.totalPastDueTasksPaginationVO.taskStatus = 'pastDue';
      this.totalPastDueTasksPaginationVO.filterType = 'all';
      this.totalPastDueTasksBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalPastDueTasksFilterCount = 0;
      this.workspaceDashboardService.getTimeTracking(this.totalPastDueTasksPaginationVO).subscribe(result => {
        this.totalPastDueTasks = result.totalRecords;
      });
    } else if (chart === 'Total Due Today Tasks') {
      this.totalDueTodayTasksPaginationVO.taskStatus = 'dueToday';
      this.totalDueTodayTasksPaginationVO.filterType = 'all';
      this.totalDueTodayTasksBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalDueTodayTasksFilterCount = 0;
      this.workspaceDashboardService.getTimeTracking(this.totalDueTodayTasksPaginationVO).subscribe(result => {
        this.totalDueTodayTasks = result.totalRecords;
      });
    } else if (chart === 'Total Due Tomorrow Tasks') {
      this.totalDueTodayTasksPaginationVO.taskStatus = 'dueTomorrow';
      this.totalDueTodayTasksPaginationVO.filterType = 'all';
      this.totalDueTomorrowTasksBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalDueTomorrowTasksFilterCount = 0;
      this.workspaceDashboardService.getTimeTracking(this.totalDueTodayTasksPaginationVO).subscribe(result => {
        this.totalDueTomorrowTasks = result.totalRecords;
      });
    } else if (chart === 'Total Due in 7 days Tasks') {
      this.totalDueInSevenTasksTasksPaginationVO.taskStatus = 'dueInSevenDays';
      this.totalDueInSevenTasksTasksPaginationVO.filterType = 'all';
      this.totalDueInSevenTasksTasksBoardNamesVO.forEach(param => param.isSelected = false);
      this.totalDueInSevenTasksFilterCount = 0;
      this.workspaceDashboardService.getTimeTracking(this.totalDueInSevenTasksTasksPaginationVO).subscribe(result => {
        this.totalDueInSevenDays = result.totalRecords;
      });
    }
  }

  changeChartFilterValue(event, chart, board, isChecked) {

    if (event.checked === true) {
      isChecked = true;
      this.showWidgets = true;
      const index = this.dashboardChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
      if (index === -1) {
        this.dashboardChartVO.taskboardIdList.push(board.taskBoardId);
      }

      if (chart === 'Tasks by Assignee') {

        const assigneeIndex = this.taskByAssigneeChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (assigneeIndex === -1) {
          this.taskByAssigneeChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const assigneeBoardIndex = this.taskByAssigneeBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (assigneeBoardIndex !== -1) {
          this.taskByAssigneeBoardNamesVO[assigneeBoardIndex].isSelected = true;
        }

        const list = this.taskByAssigneeBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksbyAssigneeFilterCount = list.length;
      } else if (chart === 'Workload by Status') {
        const WorkloadIndex = this.workloadByStatusChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (WorkloadIndex === -1) {
          this.workloadByStatusChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const WorkloadBoardIndex = this.workloadByStatusBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (WorkloadBoardIndex !== -1) {
          this.workloadByStatusBoardNamesVO[WorkloadBoardIndex].isSelected = true;
        }
        const list = this.workloadByStatusBoardNamesVO.filter(t => t.isSelected === true);
        this.workloadbyStatusFilterCount = list.length;
      } else if (chart === 'Tasks in Progress') {

        const tasksInProgressPageIndex = this.tasksInProgressPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (tasksInProgressPageIndex === -1) {
          this.tasksInProgressPaginationVO.taskboardIdList.push(board.taskBoardId);
        }

        const taskInProgressBoardIndex = this.taskInProgressBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (taskInProgressBoardIndex !== -1) {
          this.taskInProgressBoardNamesVO[taskInProgressBoardIndex].isSelected = true;
        }
        const list = this.taskInProgressBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksInProgressFilterCount = list.length;
      } else if (chart === 'Tasks Deleted') {
        const taskDeletedPageIndex = this.tasksDeletedPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (taskDeletedPageIndex === -1) {
          this.tasksDeletedPaginationVO.taskboardIdList.push(board.taskBoardId);
        }

        const taskDeletedBoardIndex = this.taskDeletedBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (taskDeletedBoardIndex !== -1) {
          this.taskDeletedBoardNamesVO[taskDeletedBoardIndex].isSelected = true;
        }
        const list = this.taskDeletedBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksDeletedFilterCount = list.length;
      } else if (chart === 'Tasks Completed') {

        const taskDeletedPageIndex = this.tasksCompletedPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (taskDeletedPageIndex === -1) {
          this.tasksCompletedPaginationVO.taskboardIdList.push(board.taskBoardId);
        }

        const completedTaskboardIndex = this.taskCompletedBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (completedTaskboardIndex !== -1) {
          this.taskCompletedBoardNamesVO[completedTaskboardIndex].isSelected = true;
        }
        const list = this.taskCompletedBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksCompletedFilterCount = list.length;
      } else if (chart === 'Unassigned Tasks') {

        const unassignedTasksPageIndex = this.unassignedTasksPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (unassignedTasksPageIndex === -1) {
          this.unassignedTasksPaginationVO.taskboardIdList.push(board.taskBoardId);
        }

        const unassignedTaskboardIndex = this.unAssignedTaskBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (unassignedTaskboardIndex !== -1) {
          this.unAssignedTaskBoardNamesVO[unassignedTaskboardIndex].isSelected = true;
        }
        const list = this.unAssignedTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.unassignedTasksFilterCount = list.length;
      } else if (chart === 'Taskboard Statistics') {
        const taskboardStatisticsBoardIndex = this.taskStatisticsBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (taskboardStatisticsBoardIndex !== -1) {
          this.taskStatisticsBoardNamesVO[taskboardStatisticsBoardIndex].isSelected = true;
        }
        const list = this.taskStatisticsBoardNamesVO.filter(t => t.isSelected === true);
        this.taskboardStatisticsFilterCount = list.length;

        const taskboardStatisticsPageIndex = this.taskboardStatisticsPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (taskboardStatisticsPageIndex === -1) {
          this.taskboardStatisticsPaginationVO.taskboardIdList.push(board.taskBoardId);
        }
      } else if (chart === 'Task List') {
        const taskListBoardIndex = this.taskListBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (taskListBoardIndex !== -1) {
          this.taskListBoardNamesVO[taskListBoardIndex].isSelected = true;
        }
        const list = this.taskListBoardNamesVO.filter(t => t.isSelected === true);
        this.taskListFilterCount = list.length;

        const taskListPageIndex = this.taskListPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (taskListPageIndex === -1) {
          this.taskListPaginationVO.taskboardIdList.push(board.taskBoardId);
        }
      } else if (chart === 'Workload by Status Hor Bar') {
        const WorkloadIndex = this.workloadByStatusHorBarChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (WorkloadIndex === -1) {
          this.workloadByStatusHorBarChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const WorkloadBoardIndex = this.workloadByStatusHorBarBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (WorkloadBoardIndex !== -1) {
          this.workloadByStatusHorBarBoardNamesVO[WorkloadBoardIndex].isSelected = true;
        }
        const list = this.workloadByStatusHorBarBoardNamesVO.filter(t => t.isSelected === true);
        this.workloadByStatusHorBarFilterCount = list.length;
      } else if (chart === 'Workload by Status Ver Bar') {
        const WorkloadIndex = this.workloadByStatusVerBarChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (WorkloadIndex === -1) {
          this.workloadByStatusVerBarChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const WorkloadBoardIndex = this.workloadByStatusVerBarBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (WorkloadBoardIndex !== -1) {
          this.workloadByStatusVerBarBoardNamesVO[WorkloadBoardIndex].isSelected = true;
        }
        const list = this.workloadByStatusVerBarBoardNamesVO.filter(t => t.isSelected === true);
        this.workloadByStatusVerBarFilterCount = list.length;
      } else if (chart === 'Number of Tasks in Progress') {

        const numberOftasksInProgressPageIndex = this.numberOfProgressPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (numberOftasksInProgressPageIndex === -1) {
          this.numberOfProgressPaginationVO.taskboardIdList.push(board.taskBoardId);
        }

        const numberOfTaskInProgressBoardIndex = this.numberOfProgressBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (numberOfTaskInProgressBoardIndex !== -1) {
          this.numberOfProgressBoardNamesVO[numberOfTaskInProgressBoardIndex].isSelected = true;
        }
        const list = this.numberOfProgressBoardNamesVO.filter(t => t.isSelected === true);
        this.numberOfProgressTaskFilterCount = list.length;
      } else if (chart === 'Number of Tasks Closed') {

        const numberOfTaskClosedPageIndex = this.numberOfClosedPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (numberOfTaskClosedPageIndex === -1) {
          this.numberOfClosedPaginationVO.taskboardIdList.push(board.taskBoardId);
        }

        const numberOfTaskClosedBoardIndex = this.numberOfClosedBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (numberOfTaskClosedBoardIndex !== -1) {
          this.numberOfClosedBoardNamesVO[numberOfTaskClosedBoardIndex].isSelected = true;
        }
        const list = this.numberOfClosedBoardNamesVO.filter(t => t.isSelected === true);
        this.numberOfClosedTaskFilterCount = list.length;
      } else if (chart === 'Number of Tasks Completed') {

        const numberOfTaskCompletedPageIndex = this.numberOfCompletedPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (numberOfTaskCompletedPageIndex === -1) {
          this.numberOfCompletedPaginationVO.taskboardIdList.push(board.taskBoardId);
        }

        const numberOfTaskCompletedBoardIndex = this.numberOfCompletedBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (numberOfTaskCompletedBoardIndex !== -1) {
          this.numberOfCompletedBoardNamesVO[numberOfTaskCompletedBoardIndex].isSelected = true;
        }
        const list = this.numberOfCompletedBoardNamesVO.filter(t => t.isSelected === true);
        this.numberOfCompletedTaskFilterCount = list.length;
      } else if (chart === 'Tasks by Assignee Hor Bar') {

        const assigneeIndex = this.taskByAssigneeHorChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (assigneeIndex === -1) {
          this.taskByAssigneeHorChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const assigneeBoardIndex = this.taskByAssigneeHorBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (assigneeBoardIndex !== -1) {
          this.taskByAssigneeHorBoardNamesVO[assigneeBoardIndex].isSelected = true;
        }

        const list = this.taskByAssigneeHorBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksbyAssigneeHorFilterCount = list.length;
      } else if (chart === 'Tasks by Assignee Ver Bar') {

        const assigneeIndex = this.taskByAssigneeVerChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (assigneeIndex === -1) {
          this.taskByAssigneeVerChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const assigneeBoardIndex = this.taskByAssigneeVerBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (assigneeBoardIndex !== -1) {
          this.taskByAssigneeVerBoardNamesVO[assigneeBoardIndex].isSelected = true;
        }

        const list = this.taskByAssigneeVerBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksbyAssigneeVerFilterCount = list.length;
      } else if (chart === 'Total Unassigned Tasks') {

        const unAssignedTaskPageIndex = this.totalUnassignedTaskPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (unAssignedTaskPageIndex === -1) {
          this.totalUnassignedTaskPaginationVO.taskboardIdList.push(board.taskBoardId);
        }

        const unassignedTaskBoardIndex = this.totalUnassignedTaskBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (unassignedTaskBoardIndex !== -1) {
          this.totalUnassignedTaskBoardNamesVO[unassignedTaskBoardIndex].isSelected = true;
        }
        const list = this.totalUnassignedTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalUnAssignedTaskFilterCount = list.length;
      } else if (chart === 'Total Assigned(Not Completed) Tasks') {
        const totalAssignedNotCompletedTaskPageIndex = this.totalAssignedNotCompletedTaskPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalAssignedNotCompletedTaskPageIndex === -1) {
          this.totalAssignedNotCompletedTaskPaginationVO.taskboardIdList.push(board.taskBoardId);
        }
        const totalAssignedNotCompletedTaskBoardIndex = this.totalAssignedNotCompletedTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalAssignedNotCompletedTaskBoardIndex !== -1) {
          this.totalAssignedNotCompletedTaskBoardNamesVO[totalAssignedNotCompletedTaskBoardIndex].isSelected = true;
        }
        const list = this.totalAssignedNotCompletedTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalAssignedNotCompletedTaskFilterCount = list.length;
      } else if (chart === 'Priority Breakdown') {
        const priorityBreakdownPageIndex = this.priorityBreakdownTaskChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (priorityBreakdownPageIndex === -1) {
          this.priorityBreakdownTaskChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const priorityBreakdownTaskBoardIndex = this.priorityBreakdownTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (priorityBreakdownTaskBoardIndex !== -1) {
          this.priorityBreakdownTaskBoardNamesVO[priorityBreakdownTaskBoardIndex].isSelected = true;
        }
        const list = this.priorityBreakdownTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.priorityBreakdownTaskFilterCount = list.length;
      } else if (chart === 'Priority Breakdown Hor Bar') {
        const priorityBreakdownHorPageIndex = this.priorityBreakdownHorTaskChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (priorityBreakdownHorPageIndex === -1) {
          this.priorityBreakdownHorTaskChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const priorityBreakdownHorTaskBoardIndex = this.priorityBreakdownHorTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (priorityBreakdownHorTaskBoardIndex !== -1) {
          this.priorityBreakdownHorTaskBoardNamesVO[priorityBreakdownHorTaskBoardIndex].isSelected = true;
        }
        const list = this.priorityBreakdownHorTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.priorityBreakdownHorTaskFilterCount = list.length;
      } else if (chart === 'Priority Breakdown Ver Bar') {
        const priorityBreakdownVerPageIndex = this.priorityBreakdownVerTaskChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (priorityBreakdownVerPageIndex === -1) {
          this.priorityBreakdownVerTaskChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const priorityBreakdownVerTaskBoardIndex = this.priorityBreakdownVerTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (priorityBreakdownVerTaskBoardIndex !== -1) {
          this.priorityBreakdownVerTaskBoardNamesVO[priorityBreakdownVerTaskBoardIndex].isSelected = true;
        }
        const list = this.priorityBreakdownVerTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.priorityBreakdownVerTaskFilterCount = list.length;
      } else if (chart === 'Total Urgent Tasks') {
        const totalUrgentTaskIndex = this.totalUrgentTaskChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalUrgentTaskIndex === -1) {
          this.totalUrgentTaskChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const totalUrgentTaskBoardIndex = this.totalUrgentTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalUrgentTaskBoardIndex !== -1) {
          this.totalUrgentTaskBoardNamesVO[totalUrgentTaskBoardIndex].isSelected = true;
        }
        const list = this.totalUrgentTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalUrgentTaskFilterCount = list.length;
      } else if (chart === 'Total High Tasks') {
        const totalHighTaskIndex = this.totalHighTaskBoardChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalHighTaskIndex === -1) {
          this.totalHighTaskBoardChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const totalHighTaskBoardIndex = this.totalHighTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalHighTaskBoardIndex !== -1) {
          this.totalHighTaskBoardNamesVO[totalHighTaskBoardIndex].isSelected = true;
        }
        const list = this.totalHighTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalHighTaskFilterCount = list.length;
      } else if (chart === 'Total Medium Tasks') {
        const totalMediumTaskIndex = this.totalMediumTaskBoardChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalMediumTaskIndex === -1) {
          this.totalMediumTaskBoardChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const totalMediumTaskBoardIndex = this.totalMediumTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalMediumTaskBoardIndex !== -1) {
          this.totalMediumTaskBoardNamesVO[totalMediumTaskBoardIndex].isSelected = true;
        }
        const list = this.totalMediumTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalMediumTaskFilterCount = list.length;
      } else if (chart === 'Total Low Tasks') {
        const totalLowTaskIndex = this.totalLowTaskBoardChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalLowTaskIndex === -1) {
          this.totalLowTaskBoardChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const totalLowTaskBoardIndex = this.totalLowTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalLowTaskBoardIndex !== -1) {
          this.totalLowTaskBoardNamesVO[totalLowTaskBoardIndex].isSelected = true;
        }
        const list = this.totalLowTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalLowTaskFilterCount = list.length;
      } else if (chart === 'Total No Priority Tasks') {
        const totalNoPriorityTaskIndex = this.totalNoPriorityTaskBoardChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalNoPriorityTaskIndex === -1) {
          this.totalNoPriorityTaskBoardChartVO.taskboardIdList.push(board.taskBoardId);
        }
        const totalNoPriorityTaskBoardIndex = this.totalNoPriorityTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalNoPriorityTaskBoardIndex !== -1) {
          this.totalNoPriorityTaskBoardNamesVO[totalNoPriorityTaskBoardIndex].isSelected = true;
        }
        const list = this.totalNoPriorityTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalNoPriorityTaskFilterCount = list.length;
      } else if (chart === 'Total Past Due Tasks') {
        const totalPastDueTasksIndex = this.totalPastDueTasksPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalPastDueTasksIndex === -1) {
          this.totalPastDueTasksPaginationVO.taskboardIdList.push(board.taskBoardId);
        }
        const totalPastDueTasksBoardIndex = this.totalPastDueTasksBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalPastDueTasksBoardIndex !== -1) {
          this.totalPastDueTasksBoardNamesVO[totalPastDueTasksBoardIndex].isSelected = true;
        }
        const list = this.totalPastDueTasksBoardNamesVO.filter(t => t.isSelected === true);
        this.totalPastDueTasksFilterCount = list.length;
      } else if (chart === 'Total Due Today Tasks') {
        const totalDueTodayTasksIndex = this.totalDueTodayTasksPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalDueTodayTasksIndex === -1) {
          this.totalDueTodayTasksPaginationVO.taskboardIdList.push(board.taskBoardId);
        }
        const totalDueTodayTasksBoardIndex = this.totalDueTodayTasksBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalDueTodayTasksBoardIndex !== -1) {
          this.totalDueTodayTasksBoardNamesVO[totalDueTodayTasksBoardIndex].isSelected = true;
        }
        const list = this.totalDueTodayTasksBoardNamesVO.filter(t => t.isSelected === true);
        this.totalDueTodayTasksFilterCount = list.length;
      } else if (chart === 'Total Due Tomorrow Tasks') {
        const totalDueTomorrowTasksIndex = this.totalDueTomorrowTasksPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalDueTomorrowTasksIndex === -1) {
          this.totalDueTomorrowTasksPaginationVO.taskboardIdList.push(board.taskBoardId);
        }
        const totalDueTomorrowTasksBoardIndex = this.totalDueTomorrowTasksBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalDueTomorrowTasksBoardIndex !== -1) {
          this.totalDueTomorrowTasksBoardNamesVO[totalDueTomorrowTasksBoardIndex].isSelected = true;
        }
        const list = this.totalDueTomorrowTasksBoardNamesVO.filter(t => t.isSelected === true);
        this.totalDueTomorrowTasksFilterCount = list.length;
      } else if (chart === 'Total Due in 7 days Tasks') {
        const totalDueInSevenDaysTasksIndex = this.totalDueInSevenTasksTasksPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalDueInSevenDaysTasksIndex === -1) {
          this.totalDueInSevenTasksTasksPaginationVO.taskboardIdList.push(board.taskBoardId);
        }
        const totalDueInSevenDaysTasksBoardIndex = this.totalDueInSevenTasksTasksBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalDueInSevenDaysTasksBoardIndex !== -1) {
          this.totalDueInSevenTasksTasksBoardNamesVO[totalDueInSevenDaysTasksBoardIndex].isSelected = true;
        }
        const list = this.totalDueInSevenTasksTasksBoardNamesVO.filter(t => t.isSelected === true);
        this.totalDueInSevenTasksFilterCount = list.length;
      }

      const pageIndex = this.paginationVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
      if (pageIndex === -1) {
        this.paginationVO.taskboardIdList.push(board.taskBoardId);
      }

    } else if (event.checked === false) {

      const boardIndex = this.filterBoardNamesVO.findIndex(item => item.boardName === board.boardName);
      this.filterBoardNamesVO[boardIndex].isSelected = false;
      isChecked = false;
      const index = this.dashboardChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
      if (index !== -1) {
        this.dashboardChartVO.taskboardIdList.splice(index, 1);
      }

      if (chart === 'Tasks by Assignee') {
        const assigneeIndex = this.taskByAssigneeChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (assigneeIndex !== -1) {
          this.taskByAssigneeChartVO.taskboardIdList.splice(assigneeIndex, 1);
        }

        const assigneeBoardIndex = this.taskByAssigneeBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (assigneeBoardIndex !== -1) {
          this.taskByAssigneeBoardNamesVO[assigneeBoardIndex].isSelected = false;
        }
        const list = this.taskByAssigneeBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksbyAssigneeFilterCount = list.length;
      } else if (chart === 'Workload by Status') {

        const WorkloadIndex = this.workloadByStatusChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (WorkloadIndex !== -1) {
          this.workloadByStatusChartVO.taskboardIdList.splice(WorkloadIndex, 1);
        }

        const WorkloadBoardIndex = this.workloadByStatusBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (WorkloadBoardIndex !== -1) {
          this.workloadByStatusBoardNamesVO[WorkloadBoardIndex].isSelected = false;
        }
        const list = this.workloadByStatusBoardNamesVO.filter(t => t.isSelected === true);
        this.workloadbyStatusFilterCount = list.length;
      } else if (chart === 'Tasks in Progress') {
        const tasksInProgressPageIndex = this.tasksInProgressPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (tasksInProgressPageIndex !== -1) {
          this.tasksInProgressPaginationVO.taskboardIdList.splice(tasksInProgressPageIndex, 1);
        }

        const tasksInProgressBoardIndex = this.taskInProgressBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (tasksInProgressBoardIndex !== -1) {
          this.taskInProgressBoardNamesVO[tasksInProgressBoardIndex].isSelected = false;
        }
        const list = this.taskInProgressBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksInProgressFilterCount = list.length;
      } else if (chart === 'Tasks Deleted') {
        const tasksDeletedPageIndex = this.tasksDeletedPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (tasksDeletedPageIndex !== -1) {
          this.tasksDeletedPaginationVO.taskboardIdList.splice(tasksDeletedPageIndex, 1);
        }

        const taskDeletedBoardIndex = this.taskDeletedBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (taskDeletedBoardIndex !== -1) {
          this.taskDeletedBoardNamesVO[taskDeletedBoardIndex].isSelected = false;
        }
        const list = this.taskDeletedBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksDeletedFilterCount = list.length;
      } else if (chart === 'Tasks Completed') {
        const tasksCompletedPageIndex = this.tasksCompletedPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (tasksCompletedPageIndex !== -1) {
          this.tasksCompletedPaginationVO.taskboardIdList.splice(tasksCompletedPageIndex, 1);
        }

        const completedTaskboardIndex = this.taskCompletedBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (completedTaskboardIndex !== -1) {
          this.taskCompletedBoardNamesVO[completedTaskboardIndex].isSelected = false;
        }
        const list = this.taskCompletedBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksCompletedFilterCount = list.length;
      } else if (chart === 'Unassigned Tasks') {

        const unAssignedTaskPageIndex = this.unassignedTasksPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (unAssignedTaskPageIndex !== -1) {
          this.unassignedTasksPaginationVO.taskboardIdList.splice(unAssignedTaskPageIndex, 1);
        }

        const unassignedBoardIndex = this.unAssignedTaskBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (unassignedBoardIndex !== -1) {
          this.unAssignedTaskBoardNamesVO[unassignedBoardIndex].isSelected = false;
        }
        const list = this.unAssignedTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.unassignedTasksFilterCount = list.length;
      } else if (chart === 'Taskboard Statistics') {

        const taskboardStatisticsPageIndex = this.taskboardStatisticsPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (taskboardStatisticsPageIndex !== -1) {
          this.taskboardStatisticsPaginationVO.taskboardIdList.splice(taskboardStatisticsPageIndex, 1);
        }

        const taskboardStatisticsIndex = this.taskStatisticsBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (taskboardStatisticsIndex !== -1) {
          this.taskStatisticsBoardNamesVO[taskboardStatisticsIndex].isSelected = false;
        }
        const list = this.taskStatisticsBoardNamesVO.filter(t => t.isSelected === true);
        this.taskboardStatisticsFilterCount = list.length;
      } else if (chart === 'Task List') {

        const taskListPageIndex = this.taskListPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (taskListPageIndex !== -1) {
          this.taskListPaginationVO.taskboardIdList.splice(taskListPageIndex, 1);
        }

        const taskListBoardIndex = this.taskListBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (taskListBoardIndex !== -1) {
          this.taskListBoardNamesVO[taskListBoardIndex].isSelected = false;
        }
        const list = this.taskListBoardNamesVO.filter(t => t.isSelected === true);
        this.taskListFilterCount = list.length;
      } else if (chart === 'Workload by Status Hor Bar') {

        const WorkloadIndex = this.workloadByStatusHorBarChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (WorkloadIndex !== -1) {
          this.workloadByStatusHorBarChartVO.taskboardIdList.splice(WorkloadIndex, 1);
        }

        const WorkloadBoardIndex = this.workloadByStatusHorBarBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (WorkloadBoardIndex !== -1) {
          this.workloadByStatusHorBarBoardNamesVO[WorkloadBoardIndex].isSelected = false;
        }
        const list = this.workloadByStatusHorBarBoardNamesVO.filter(t => t.isSelected === true);
        this.workloadByStatusHorBarFilterCount = list.length;
      } else if (chart === 'Workload by Status Ver Bar') {

        const WorkloadIndex = this.workloadByStatusVerBarChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (WorkloadIndex !== -1) {
          this.workloadByStatusVerBarChartVO.taskboardIdList.splice(WorkloadIndex, 1);
        }

        const WorkloadBoardIndex = this.workloadByStatusVerBarBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (WorkloadBoardIndex !== -1) {
          this.workloadByStatusVerBarBoardNamesVO[WorkloadBoardIndex].isSelected = false;
        }
        const list = this.workloadByStatusVerBarBoardNamesVO.filter(t => t.isSelected === true);
        this.workloadByStatusVerBarFilterCount = list.length;
      } else if (chart === 'Number of Tasks in Progress') {
        const numberOfTasksInProgressPageIndex = this.numberOfProgressPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (numberOfTasksInProgressPageIndex !== -1) {
          this.numberOfProgressPaginationVO.taskboardIdList.splice(numberOfTasksInProgressPageIndex, 1);
        }

        const numberOfTasksInProgressBoardIndex = this.numberOfProgressBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (numberOfTasksInProgressBoardIndex !== -1) {
          this.numberOfProgressBoardNamesVO[numberOfTasksInProgressBoardIndex].isSelected = false;
        }
        const list = this.numberOfProgressBoardNamesVO.filter(t => t.isSelected === true);
        this.numberOfProgressTaskFilterCount = list.length;
      } else if (chart === 'Number of Tasks Closed') {
        const numberOfTasksClosedPageIndex = this.numberOfClosedPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (numberOfTasksClosedPageIndex !== -1) {
          this.numberOfClosedPaginationVO.taskboardIdList.splice(numberOfTasksClosedPageIndex, 1);
        }

        const numberOfTasksClosedBoardIndex = this.numberOfClosedBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (numberOfTasksClosedBoardIndex !== -1) {
          this.numberOfClosedBoardNamesVO[numberOfTasksClosedBoardIndex].isSelected = false;
        }
        const list = this.numberOfClosedBoardNamesVO.filter(t => t.isSelected === true);
        this.numberOfClosedTaskFilterCount = list.length;
      } else if (chart === 'Number of Tasks Completed') {
        const numberOfTasksCompletedPageIndex = this.numberOfCompletedPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (numberOfTasksCompletedPageIndex !== -1) {
          this.numberOfCompletedPaginationVO.taskboardIdList.splice(numberOfTasksCompletedPageIndex, 1);
        }

        const numberOfTasksCompletedBoardIndex = this.numberOfCompletedBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (numberOfTasksCompletedBoardIndex !== -1) {
          this.numberOfCompletedBoardNamesVO[numberOfTasksCompletedBoardIndex].isSelected = false;
        }
        const list = this.numberOfCompletedBoardNamesVO.filter(t => t.isSelected === true);
        this.numberOfCompletedTaskFilterCount = list.length;
      } else if (chart === 'Tasks by Assignee Hor Bar') {
        const assigneeIndex = this.taskByAssigneeHorChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (assigneeIndex !== -1) {
          this.taskByAssigneeHorChartVO.taskboardIdList.splice(assigneeIndex, 1);
        }

        const assigneeBoardIndex = this.taskByAssigneeHorBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (assigneeBoardIndex !== -1) {
          this.taskByAssigneeHorBoardNamesVO[assigneeBoardIndex].isSelected = false;
        }
        const list = this.taskByAssigneeHorBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksbyAssigneeHorFilterCount = list.length;
      } else if (chart === 'Tasks by Assignee Ver Bar') {
        const assigneeIndex = this.taskByAssigneeVerChartVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (assigneeIndex !== -1) {
          this.taskByAssigneeVerChartVO.taskboardIdList.splice(assigneeIndex, 1);
        }

        const assigneeBoardIndex = this.taskByAssigneeVerBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (assigneeBoardIndex !== -1) {
          this.taskByAssigneeVerBoardNamesVO[assigneeBoardIndex].isSelected = false;
        }
        const list = this.taskByAssigneeVerBoardNamesVO.filter(t => t.isSelected === true);
        this.tasksbyAssigneeVerFilterCount = list.length;
      } else if (chart === 'Total Unassigned Tasks') {
        const totalUnassignedTaskPageIndex = this.totalUnassignedTaskPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalUnassignedTaskPageIndex !== -1) {
          this.totalUnassignedTaskPaginationVO.taskboardIdList.splice(totalUnassignedTaskPageIndex, 1);
        }

        const totalUnassignedBoardIndex = this.totalUnassignedTaskBoardNamesVO.findIndex(item => item.boardName === board.boardName);
        if (totalUnassignedBoardIndex !== -1) {
          this.totalUnassignedTaskBoardNamesVO[totalUnassignedBoardIndex].isSelected = false;
        }
        const list = this.numberOfClosedBoardNamesVO.filter(t => t.isSelected === true);
        this.totalUnAssignedTaskFilterCount = list.length;
      } else if (chart === 'Total Assigned(Not Completed) Tasks') {
        const totalAssignedNotCompletedTaskPageIndex = this.totalAssignedNotCompletedTaskPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalAssignedNotCompletedTaskPageIndex !== -1) {
          this.totalAssignedNotCompletedTaskPaginationVO.taskboardIdList.splice(totalAssignedNotCompletedTaskPageIndex, 1);
        }

        const totalAassignedNotCompletedTaskBoardIndex = this.totalAssignedNotCompletedTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalAassignedNotCompletedTaskBoardIndex !== -1) {
          this.totalUnassignedTaskBoardNamesVO[totalAassignedNotCompletedTaskBoardIndex].isSelected = false;
        }
        const list = this.totalAssignedNotCompletedTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalAssignedNotCompletedTaskFilterCount = list.length;
      } else if (chart === 'Priority Breakdown') {
        const priorityBreakdownPageIndex = this.priorityBreakdownTaskChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (priorityBreakdownPageIndex !== -1) {
          this.priorityBreakdownTaskChartVO.taskboardIdList.splice(priorityBreakdownPageIndex, 1);
        }
        const priorityBreakdownTaskBoardIndex = this.priorityBreakdownTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (priorityBreakdownTaskBoardIndex !== -1) {
          this.priorityBreakdownTaskBoardNamesVO[priorityBreakdownTaskBoardIndex].isSelected = false;
        }
        const list = this.priorityBreakdownTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.priorityBreakdownTaskFilterCount = list.length;
      } else if (chart === 'Priority Breakdown Hor Bar') {
        const priorityBreakdownHorPageIndex = this.priorityBreakdownHorTaskChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (priorityBreakdownHorPageIndex !== -1) {
          this.priorityBreakdownHorTaskChartVO.taskboardIdList.splice(priorityBreakdownHorPageIndex, 1);
        }
        const priorityBreakdownHorTaskBoardIndex = this.priorityBreakdownHorTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (priorityBreakdownHorTaskBoardIndex !== -1) {
          this.priorityBreakdownHorTaskBoardNamesVO[priorityBreakdownHorTaskBoardIndex].isSelected = false;
        }
        const list = this.priorityBreakdownHorTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.priorityBreakdownHorTaskFilterCount = list.length;
      } else if (chart === 'Priority Breakdown Ver Bar') {
        const priorityBreakdownVerPageIndex = this.priorityBreakdownVerTaskChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (priorityBreakdownVerPageIndex !== -1) {
          this.priorityBreakdownVerTaskChartVO.taskboardIdList.splice(priorityBreakdownVerPageIndex, 1)
        }
        const priorityBreakdownVerTaskBoardIndex = this.priorityBreakdownVerTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (priorityBreakdownVerTaskBoardIndex !== -1) {
          this.priorityBreakdownVerTaskBoardNamesVO[priorityBreakdownVerTaskBoardIndex].isSelected = false;
        }
        const list = this.priorityBreakdownVerTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.priorityBreakdownVerTaskFilterCount = list.length;
      } else if (chart === 'Total Urgent Tasks') {
        const totalUrgentTaskIndex = this.totalUrgentTaskChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalUrgentTaskIndex !== -1) {
          this.totalUrgentTaskChartVO.taskboardIdList.splice(totalUrgentTaskIndex, 1);
        }
        const totalUrgentTaskBoardIndex = this.totalUrgentTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalUrgentTaskBoardIndex !== -1) {
          this.totalUrgentTaskBoardNamesVO[totalUrgentTaskBoardIndex].isSelected = false;
        }
        const list = this.totalUrgentTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalUrgentTaskFilterCount = list.length;
      } else if (chart === 'Total High Tasks') {
        const totalHighTaskIndex = this.totalHighTaskBoardChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalHighTaskIndex !== -1) {
          this.totalHighTaskBoardChartVO.taskboardIdList.splice(totalHighTaskIndex, 1);
        }
        const totalHighTaskBoardIndex = this.totalHighTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalHighTaskBoardIndex !== -1) {
          this.totalHighTaskBoardNamesVO[totalHighTaskBoardIndex].isSelected = false;
        }
        const list = this.totalHighTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalHighTaskFilterCount = list.length;
      } else if (chart === 'Total Medium Tasks') {
        const totalMediumTaskIndex = this.totalMediumTaskBoardChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalMediumTaskIndex !== -1) {
          this.totalMediumTaskBoardChartVO.taskboardIdList.splice(totalMediumTaskIndex, 1);
        }
        const totalMediumTaskBoardIndex = this.totalMediumTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalMediumTaskBoardIndex !== -1) {
          this.totalMediumTaskBoardNamesVO[totalMediumTaskBoardIndex].isSelected = false;
        }
        const list = this.totalMediumTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalMediumTaskFilterCount = list.length;
      } else if (chart === 'Total Low Tasks') {
        const totalLowTaskIndex = this.totalLowTaskBoardChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalLowTaskIndex !== -1) {
          this.totalLowTaskBoardChartVO.taskboardIdList.splice(totalLowTaskIndex, 1);
        }
        const totalLowTaskBoardIndex = this.totalLowTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalLowTaskBoardIndex !== -1) {
          this.totalLowTaskBoardNamesVO[totalLowTaskBoardIndex].isSelected = false;
        }
        const list = this.totalLowTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalLowTaskFilterCount = list.length;
      } else if (chart === 'Total No Priority Tasks') {
        const totalNoPriorityTaskIndex = this.totalNoPriorityTaskBoardChartVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalNoPriorityTaskIndex !== -1) {
          this.totalNoPriorityTaskBoardChartVO.taskboardIdList.splice(totalNoPriorityTaskIndex, 1);
        }
        const totalNoPriorityTaskBoardIndex = this.totalNoPriorityTaskBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalNoPriorityTaskBoardIndex !== -1) {
          this.totalNoPriorityTaskBoardNamesVO[totalNoPriorityTaskBoardIndex].isSelected = false;
        }
        const list = this.totalNoPriorityTaskBoardNamesVO.filter(t => t.isSelected === true);
        this.totalNoPriorityTaskFilterCount = list.length;
      } else if (chart === 'Total Past Due Tasks') {
        const totalPastDueTasksIndex = this.totalPastDueTasksPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalPastDueTasksIndex !== -1) {
          this.totalPastDueTasksPaginationVO.taskboardIdList.splice(totalPastDueTasksIndex, 1);
        }
        const totalPastDueTasksBoardIndex = this.totalPastDueTasksBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalPastDueTasksBoardIndex !== -1) {
          this.totalPastDueTasksBoardNamesVO[totalPastDueTasksBoardIndex].isSelected = false;
        }
        const list = this.totalPastDueTasksBoardNamesVO.filter(t => t.isSelected === true);
        this.totalPastDueTasksFilterCount = list.length;
      } else if (chart === 'Total Due Today Tasks') {
        const totalDueTodayTasksIndex = this.totalDueTodayTasksPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalDueTodayTasksIndex !== -1) {
          this.totalDueTodayTasksPaginationVO.taskboardIdList.splice(totalDueTodayTasksIndex, 1);
        }
        const totalDueTodayTasksBoardIndex = this.totalDueTodayTasksBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalDueTodayTasksBoardIndex !== -1) {
          this.totalDueTodayTasksBoardNamesVO[totalDueTodayTasksBoardIndex].isSelected = false;
        }
        const list = this.totalDueTodayTasksBoardNamesVO.filter(t => t.isSelected === true);
        this.totalDueTodayTasksFilterCount = list.length;
      } else if (chart === 'Total Due Tomorrow Tasks') {
        const totalDueTomorrowTasksIndex = this.totalDueTomorrowTasksPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalDueTomorrowTasksIndex !== -1) {
          this.totalDueTomorrowTasksPaginationVO.taskboardIdList.splice(totalDueTomorrowTasksIndex, 1);
        }
        const totalDueTomorrowTasksBoardIndex = this.totalDueTomorrowTasksBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalDueTomorrowTasksBoardIndex !== -1) {
          this.totalDueTomorrowTasksBoardNamesVO[totalDueTomorrowTasksBoardIndex].isSelected = false;
        }
        const list = this.totalDueTomorrowTasksBoardNamesVO.filter(t => t.isSelected === true);
        this.totalDueTomorrowTasksFilterCount = list.length;
      } else if (chart === 'Total Due in 7 days Tasks') {
        const totalDueInSevenDaysTasksIndex = this.totalDueInSevenTasksTasksPaginationVO.
          taskboardIdList.findIndex(item => item === board.taskBoardId);
        if (totalDueInSevenDaysTasksIndex !== -1) {
          this.totalDueInSevenTasksTasksPaginationVO.taskboardIdList.splice(totalDueInSevenDaysTasksIndex, 1);
        }
        const totalDueInSevenDaysTasksBoardIndex = this.totalDueInSevenTasksTasksBoardNamesVO.
          findIndex(item => item.boardName === board.boardName);
        if (totalDueInSevenDaysTasksBoardIndex !== -1) {
          this.totalDueInSevenTasksTasksBoardNamesVO[totalDueInSevenDaysTasksBoardIndex].isSelected = false;
        }
        const list = this.totalDueInSevenTasksTasksBoardNamesVO.filter(t => t.isSelected === true);
        this.totalDueInSevenTasksFilterCount = list.length;
      }

      const pageIndex = this.paginationVO.taskboardIdList.findIndex(item => item === board.taskBoardId);
      if (pageIndex !== -1) {
        this.paginationVO.taskboardIdList.splice(pageIndex, 1);
      }
      this.showWidgets = true;
    }

    this.applyWidgets(chart, this.dateFilterForm.get('startDate').value,
      this.dateFilterForm.get('endDate').value, this.dateFilterForm.get('searchType').value);

  }



  clearAllFilters() {
    this.filterBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskListBoardNamesVO.forEach(param => param.isSelected = false);
    this.unAssignedTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskInProgressBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskDeletedBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskCompletedBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskStatisticsBoardNamesVO.forEach(param => param.isSelected = false);
    this.workloadByStatusBoardNamesVO.forEach(param => param.isSelected = false);
    this.workloadByStatusHorBarBoardNamesVO.forEach(param => param.isSelected = false);
    this.workloadByStatusVerBarBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskByAssigneeBoardNamesVO.forEach(param => param.isSelected = false);
    this.numberOfClosedBoardNamesVO.forEach(param => param.isSelected = false);
    this.numberOfCompletedBoardNamesVO.forEach(param => param.isSelected = false);
    this.numberOfProgressBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskByAssigneeHorBoardNamesVO.forEach(param => param.isSelected = false);
    this.taskByAssigneeVerBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalUnassignedTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalAssignedNotCompletedTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.priorityBreakdownTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.priorityBreakdownHorTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.priorityBreakdownVerTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalUrgentTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalLowTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalHighTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalMediumTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalNoPriorityTaskBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalPastDueTasksBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalDueTodayTasksBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalDueTomorrowTasksBoardNamesVO.forEach(param => param.isSelected = false);
    this.totalDueInSevenTasksTasksBoardNamesVO.forEach(param => param.isSelected = false);
    const dashindex = this.dashboardNameList.findIndex(t => t.id === this.dashboardId);
    if (dashindex !== -1) {
      this.dashboardChartVO.workspaceIdList = [];
      this.dashboardChartVO.taskboardIdList = [];
      this.paginationVO.taskboardIdList = [];
      this.paginationVO.workspaceIdList = [];
      this.showTasksByAssigneeGraph = false;
      this.showWorkloadGraph = false;
      this.dashboardFilter = [];
      this.tasksbyAssigneeFilterCount = 0;
      this.workloadbyStatusFilterCount = 0;
      this.workloadByStatusHorBarFilterCount = 0;
      this.workloadByStatusVerBarFilterCount = 0;
      this.tasksInProgressFilterCount = 0;
      this.tasksDeletedFilterCount = 0;
      this.tasksCompletedFilterCount = 0;
      this.unassignedTasksFilterCount = 0;
      this.taskboardStatisticsFilterCount = 0;
      this.taskListFilterCount = 0;
      this.numberOfProgressTaskFilterCount = 0;
      this.numberOfClosedTaskFilterCount = 0;
      this.numberOfCompletedTaskFilterCount = 0;
      this.tasksbyAssigneeHorFilterCount = 0;
      this.tasksbyAssigneeVerFilterCount = 0;
      this.totalUnAssignedTaskFilterCount = 0;
      this.totalAssignedNotCompletedTaskFilterCount = 0;
      this.priorityBreakdownTaskFilterCount = 0;
      this.priorityBreakdownHorTaskFilterCount = 0;
      this.priorityBreakdownVerTaskFilterCount = 0;
      this.totalUrgentTaskFilterCount = 0;
      this.totalLowTaskFilterCount = 0;
      this.totalHighTaskFilterCount = 0;
      this.totalMediumTaskFilterCount = 0;
      this.totalNoPriorityTaskFilterCount = 0;
      this.totalPastDueTasksFilterCount = 0;
      this.totalDueTodayTasksFilterCount = 0;
      this.totalDueTomorrowTasksFilterCount = 0;
      this.totalDueInSevenTasksFilterCount = 0;
      const index = this.dashboardNameList.findIndex(t => t.id === this.dashboardId);
      this.workspaceDashboardService.getDashboard(this.dashboardNameList[index].id).subscribe(data => {
        this.activeElement = data.dashboardName;
        this.dashboardId = data.id;
        this.workspaceDashboardVO.id = data.id;
        if (data.dashboardWidgets.length !== 0) {
          this.showWidgets = true;
          this.workspaceDashboardVO.dashboardWidgets = data.dashboardWidgets;
        } else {
          this.showWidgets = false;
        }
        for (const widgets of data.dashboardWidgets) {
          this.loadWidget(widgets);
        }
        window.history.pushState('', 'id', 'workspace-dashboard/' + data.dashbaordId ? data.dashboardId : data.dashboardName.toLowerCase());
      });
    }
  }

  getColor(user: string): string {
    const filteredUser = this.usersList.find(u => u.firstName + ' ' + u.lastName === user);
    if (filteredUser && filteredUser.color) {
      return filteredUser.color;
    }
  }

  getTeamColor(team: string): string {
    const filteredTeam = this.groupList.find(t => t.groupName === team);
    if (filteredTeam && filteredTeam.color) {
      return filteredTeam.color;
    }
  }

  getUserFirstAndLastNamePrefix(task) {
    let name = '';
    const array = task.split(' ');
    if (array && array[0] && array[1]) {
      name = array[0].charAt(0).toUpperCase() + array[1].charAt(0).toUpperCase();
    } else {
      name = array[0].charAt(0).toUpperCase();
    }
    return name;
  }

  getRemainingAssigneeUserCount(users: string[]) {
    if (users) {
      return users.length - 4;
    } else {
      return 0;
    }
  }

  openDraft(taskId) {
    if (taskId != null) {

      this.myTaskService.getTaskInfo(taskId).subscribe(task => {
        if (task) {
          this.openDialogForm(task);
        }
      });
    }
  }

  openDialogForm(task) {
    if (task) {
      const yoroflowVO = {
        isWorkflow: true,
        workflowId: task.processInstanceId,
        workflowTaskId: task.processInstanceTaskId,
        formId: task.formId,
        isApproveRejectForm: task.isApprovalForm,
        isSendBack: task.isSendBack,
        isReject: task.isReject,
        initialValues: task.initialValues,
        isCustomForm: task.isCustomForm,
        isCancelWorkflow: task.isCancelWorkflow,
        cancelButtonName: task.cancelButtonName,
        approveButtonName: task.approveButtonName,
        status: task.status,
        version: task.version,
        enableSaveAsDraft: task.enableSaveAsDraft,
        message: task.message,
        approveMessage: task.approveMessage,
        rejectMessage: task.rejectMessage,
        approvalButtonName: task.approvalButtonName,
        rejectButtonName: task.rejectButtonName,
        sendBackButtonName: task.sendBackButtonName,
      };
      const taskPropertyDialogBox = this.dialog.open(OpenFormDialogBoxComponent, {
        disableClose: true,
        data: yoroflowVO,
        autoFocus: false,
        maxWidth: '96vw',
        width: '100vw',
        height: '94%',
        panelClass: 'full-screen-modal'
      });
      taskPropertyDialogBox.afterClosed().subscribe(taskData => {
        if (taskData === 'isCancelWorkflow') {
          const taskDetailsRequest = { instanceId: task.processInstanceId, instanceTaskId: task.processInstanceTaskId, taskData: null };
          this.taskListService.cancelTask(taskDetailsRequest).subscribe((data: any) => {
            if (data.canProceed === true) {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'Task cancelled successfully'
              });
            }
          });
        }
      });
    }


  }

  viewTaskboardTask(taskboardId, taskId) {
    this.taskboardTaskVOList = [];
    this.taskIdFromUrl = taskId;

    this.taskboardService.getAllTaskboardDetails(taskboardId).subscribe(task => {
      this.viewTaskVO = task;
      this.taskboardService.getDoneTaskoardTask(taskboardId).subscribe(result => {

        this.viewTaskVO.taskboardColumnMapVO[this.viewTaskVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList = result;
        this.taskboardColumnMapVO = task.taskboardColumnMapVO;
        this.taskboardColumns = [];

        for (let i = 0; i < task.taskboardColumnMapVO.length; i++) {
          this.taskboardColumns.push(task.taskboardColumnMapVO[i].taskboardColumnsVO);
          task.taskboardColumnMapVO[i]?.taskboardTaskVOList?.forEach(element => {
            this.taskboardTaskVOList.push(element);
          });
        }

        if (this.taskIdFromUrl !== undefined && this.taskIdFromUrl !== null && this.taskIdFromUrl !== '') {
          this.openTaskDetailsDialog();
        }
      });
    });
  }

  getUserAndGroupList() {
    this.taskboardService.getUserGroupList().subscribe(group => {
      this.groupList = group;
    });
    this.taskboardService.getUsersList().subscribe(users => {
      this.usersList = users;
      this.userGroupList = users;
      this.usersList?.forEach(element => {
        element.randomColor = this.getRandomColor();
      });
    });
  }

  getRandomColor() {
    return '#' + ('000000' + Math.floor(Math.random() * 16777216).toString(16)).substr(-6);
  }

  openTaskDetailsDialog() {
    const taskDetails = this.taskboardTaskVOList.find(task => task.taskId === this.taskIdFromUrl && task.taskType === 'parentTask');

    let item = null;


    item = this.taskboardColumns.find(column => column.columnName === taskDetails.status);
    this.selectedColumn = item.columnName;
    const columnIndex = this.taskboardColumnMapVO.findIndex(column => column.taskboardColumnsVO.columnName === taskDetails.status);
    this.selectedColumnIndex = columnIndex;




    if (this.viewTaskVO.isTaskBoardOwner) {
      item.taskboardColumnSecurity.read = true;
      item.taskboardColumnSecurity.delete = true;
      item.taskboardColumnSecurity.update = true;
    }

    if (item.taskboardColumnSecurity.read === true) {
      this.taskBoardTaskVO = taskDetails;
      const statusList: StatusList[] = [];
      this.taskboardColumnMapVO?.forEach(column => {
        const statusListVO = new StatusList();
        statusListVO.name = column.taskboardColumnsVO.columnName;
        statusListVO.color = column.taskboardColumnsVO.columnColor;
        if (column.taskboardColumnsVO.subStatus && column.taskboardColumnsVO.subStatus.length > 0) {
          statusListVO.subStatusList = column.taskboardColumnsVO.subStatus;
          statusList.push(statusListVO);
        } else {
          statusListVO.subStatusList = [];
          statusList.push(statusListVO);
        }
      });
      const selectedTaskIndex = this.taskboardColumnMapVO[this.selectedColumnIndex].
        taskboardTaskVOList.findIndex(column => column.id === this.taskBoardTaskVO.id);
      this.selectedTaskIndex = selectedTaskIndex;
      this.mappedTask = this.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList;
      let subStatus: string;
      if (this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus
        && this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus.length > 0) {
        subStatus = this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus[0].name;
      }

      const dialog = this.dialog.open(TaskboardFormDetailsComponent, {
        disableClose: false,
        width: '95%',
        maxWidth: '95%',
        height: '95%',
        autoFocus: false,
        data: {
          taskDetails: this.taskBoardTaskVO,
          formId: item.formId,
          version: item.version,
          color: item.columnColor,
          statusList,
          taskList: this.taskboardTaskVOList,
          taskIndex: this.selectedTaskIndex,
          groupList: this.groupList,
          usersList: this.usersList,
          taskName: this.viewTaskVO.taskName,
          taskboardId: this.viewTaskVO.id,
          taskboardColumnId: item.id,
          isTaskBoardOwner: this.viewTaskVO.isTaskBoardOwner,
          taskboardColumnSecurity: item.taskboardColumnSecurity,
          taskboardVO: this.viewTaskVO,
          value: 'fromTask',
          mappedColumnTaskList: this.mappedTask,
          type: null,
          subStatus
        },
      });
      dialog.afterClosed().subscribe((data) => {

        this.loadTaskboardTableData();

      });
    }

  }

  sortDataForTaskboard(sort: Sort, widget) {
    this.sortForTaskboard = sort;
    if (widget.widgetName === 'Tasks in Progress') {
      this.sortForTasksInProgress = sort;
      this.tasksInProgressPaginationVO = this.getPaginationForTasksInProgress();
      this.workspaceDashboardService.getAllProgressTaskoardTask(this.tasksInProgressPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.progressTaskboardVO = result.taskboardTaskVo;
          this.progressTaskboardLength = result.totalRecords;

          if (this.progressTaskboardLength !== 0 && this.progressTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const progressTaskboardVO of this.progressTaskboardVO) {
            if (progressTaskboardVO.dueDate !== undefined
              && progressTaskboardVO.dueDate !== null
              && progressTaskboardVO.dueDate !== '') {
              const date = new Date(progressTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              progressTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.progressTaskboardVO = [];
          this.progressTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Tasks Deleted') {
      this.sortForTasksDeleted = sort;
      this.tasksDeletedPaginationVO = this.getPaginationForTasksDeleted();
      this.workspaceDashboardService.getAllDeletedTaskoardTask(this.tasksDeletedPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.deletedTaskboardVO = result.taskboardTaskVo;
          this.deletedTaskboardLength = result.totalRecords;

          if (this.deletedTaskboardLength !== 0 && this.deletedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }


          for (const deletedTaskboardVO of this.deletedTaskboardVO) {
            if (deletedTaskboardVO.dueDate !== undefined
              && deletedTaskboardVO.dueDate !== null
              && deletedTaskboardVO.dueDate !== '') {
              const date = new Date(deletedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              deletedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.deletedTaskboardVO = [];
          this.deletedTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Tasks Completed') {
      this.sortForTasksCompleted = sort;
      this.tasksCompletedPaginationVO = this.getPaginationForTasksCompleted();
      this.workspaceDashboardService.getAllDoneTaskoardTask(this.tasksCompletedPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.completedTaskboardVO = result.taskboardTaskVo;
          this.completedTaskboardLength = result.totalRecords;

          if (this.completedTaskboardLength !== 0 && this.completedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const completedTaskboardVO of this.completedTaskboardVO) {
            if (completedTaskboardVO.dueDate !== undefined
              && completedTaskboardVO.dueDate !== null
              && completedTaskboardVO.dueDate !== '') {
              const date = new Date(completedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              completedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.completedTaskboardVO = [];
          this.completedTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Unassigned Tasks') {
      this.sortForUnassignedTasks = sort;
      this.unassignedTasksPaginationVO = this.getPaginationForUnassignedTasks();
      this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.unassignedTasksPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.unassignedTaskboardVO = result.taskboardTaskVo;
          this.unassignedTaskboardLength = result.totalRecords;

          if (this.unassignedTaskboardLength !== 0 && this.unassignedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }


          for (const unassignedTaskboardVO of this.unassignedTaskboardVO) {
            if (unassignedTaskboardVO.dueDate !== undefined
              && unassignedTaskboardVO.dueDate !== null
              && unassignedTaskboardVO.dueDate !== '') {
              const date = new Date(unassignedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              unassignedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.unassignedTaskboardVO = [];
          this.unassignedTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Task List') {
      this.showWidgets = true;
      this.showTaskList = true;
      this.sortForTaskList = sort;
      this.taskListPaginationVO = this.getPaginationForTaskList();
      this.loadTaskboardTableData();
    }
  }

  getUserNames(users: string[]) {
    let names = '';
    users?.forEach(name => {
      if (names.length > 0) {
        names = ', ' + names + name;
      } else {
        names = names + name;
      }
    });
    return names;
  }

  pageEventForWidget(event, widget) {

    this.paginatorForTaskboard = event;

    this.paginationVO = this.getPaginationForTaskboard();
    this.paginationVO.workspaceId = this.workspaceService.workspaceID;
    if (widget.widgetName === 'Tasks in Progress') {
      this.paginatorForTasksInProgress = event;

      this.tasksInProgressPaginationVO = this.getPaginationForTasksInProgress();
      this.workspaceDashboardService.getAllProgressTaskoardTask(this.tasksInProgressPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.progressTaskboardVO = result.taskboardTaskVo;
          this.progressTaskboardLength = result.totalRecords;

          if (this.progressTaskboardLength !== 0 && this.progressTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const progressTaskboardVO of this.progressTaskboardVO) {
            if (progressTaskboardVO.dueDate !== undefined
              && progressTaskboardVO.dueDate !== null
              && progressTaskboardVO.dueDate !== '') {
              const date = new Date(progressTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              progressTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.progressTaskboardVO = [];
          this.progressTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Tasks Deleted') {
      this.paginatorForTasksDeleted = event;

      this.tasksDeletedPaginationVO = this.getPaginationForTasksDeleted();
      this.workspaceDashboardService.getAllDeletedTaskoardTask(this.tasksDeletedPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.deletedTaskboardVO = result.taskboardTaskVo;
          this.deletedTaskboardLength = result.totalRecords;

          if (this.deletedTaskboardLength !== 0 && this.deletedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }


          for (const deletedTaskboardVO of this.deletedTaskboardVO) {
            if (deletedTaskboardVO.dueDate !== undefined
              && deletedTaskboardVO.dueDate !== null
              && deletedTaskboardVO.dueDate !== '') {
              const date = new Date(deletedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              deletedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.deletedTaskboardVO = [];
          this.deletedTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Tasks Completed') {
      this.paginatorForTasksCompleted = event;

      this.tasksCompletedPaginationVO = this.getPaginationForTasksCompleted();
      this.workspaceDashboardService.getAllDoneTaskoardTask(this.tasksCompletedPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.completedTaskboardVO = result.taskboardTaskVo;
          this.completedTaskboardLength = result.totalRecords;

          if (this.completedTaskboardLength !== 0 && this.completedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const completedTaskboardVO of this.completedTaskboardVO) {
            if (completedTaskboardVO.dueDate !== undefined
              && completedTaskboardVO.dueDate !== null
              && completedTaskboardVO.dueDate !== '') {
              const date = new Date(completedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              completedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.completedTaskboardVO = [];
          this.completedTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Unassigned Tasks') {
      this.paginatorForUnassignedTasks = event;

      this.unassignedTasksPaginationVO = this.getPaginationForUnassignedTasks();
      this.workspaceDashboardService.getAllUnassignedTaskoardTask(this.unassignedTasksPaginationVO).subscribe(result => {
        if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
          this.unassignedTaskboardVO = result.taskboardTaskVo;
          this.unassignedTaskboardLength = result.totalRecords;

          if (this.unassignedTaskboardLength !== 0 && this.unassignedTaskboardLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }


          for (const unassignedTaskboardVO of this.unassignedTaskboardVO) {
            if (unassignedTaskboardVO.dueDate !== undefined
              && unassignedTaskboardVO.dueDate !== null
              && unassignedTaskboardVO.dueDate !== '') {
              const date = new Date(unassignedTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              unassignedTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.unassignedTaskboardVO = [];
          this.unassignedTaskboardLength = 0;
        }
      });
    } else if (widget.widgetName === 'Taskboard Statistics') {
      this.paginatorForTaskboardStatistics = event;
      this.taskboardStatisticsPaginationVO = this.getPaginationForTaskboardStatistice();
      this.taskboardStatisticsPaginationVO.columnName = 'name';
      this.workspaceDashboardService.getPortfolio(this.taskboardStatisticsPaginationVO).subscribe(result => {
        if (result && result.portfolioList.length > 0) {
          this.portfolioTaskboardVO = result.portfolioList;
          this.portfolioLength = result.totalRecords;

          if (this.portfolioLength !== 0 && this.portfolioLength !== '0') {
            this.isPaginator = true;
            this.isLength = true;
          }
          else {
            this.isPaginator = false;
            this.isLength = false;
          }

          for (const portfolioTaskboardVO of this.portfolioTaskboardVO) {
            if (portfolioTaskboardVO.dueDate !== undefined &&
              portfolioTaskboardVO.dueDate !== null &&
              portfolioTaskboardVO.dueDate !== '') {
              const date = new Date(portfolioTaskboardVO.dueDate);
              date.setDate(date.getDate() + 1);
              portfolioTaskboardVO.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
              date.setDate(date.getDate() + 1);
            }
          }
        } else {
          this.portfolioTaskboardVO = [];
          this.portfolioLength = 0;
        }
      });
    } else if (widget.widgetName === 'Task List') {
      this.showWidgets = true;
      this.showTaskList = true;
      this.paginatorForTaskList = event;
      this.taskListPaginationVO = this.getPaginationForTaskList();
      this.loadTaskboardTableData();
    } else if (widget.widgetName === 'Completed Tasks') {
      this.completedPaginators = event;
      this.showCompletedTaskList = true;
      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForCompletedTask('COMPLETED');
        paginationVO.filterType = 'all';
      } else {
        if (this.completedPaginators.index > 0) {
          this.pagination.index = this.completedPaginators.index;
        } else {
          this.pagination.index = 0;
        }
        if (this.completedPaginators.pageSize > 5) {
          this.pagination.size = this.completedPaginators.pageSize;
        } else {
          this.pagination.size = this.defaultPageSize;
        }
        paginationVO = this.pagination;
      }
      this.loadCompletedList(paginationVO);
    } else if (widget.widgetName === 'Running Tasks') {
      this.processPaginators = event;
      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForRunningTask('IN_PROCESS');
        paginationVO.filterType = 'all';
      } else {
        if (this.processPaginators.index > 0) {
          this.pagination.index = this.processPaginators.index;
        } else {
          this.pagination.index = 0;
        }
        if (this.processPaginators.pageSize > 5) {
          this.pagination.size = this.processPaginators.pageSize;
        } else {
          this.pagination.size = this.defaultPageSize;
        }
        paginationVO = this.pagination;
      }
      this.showRunningTaskList = true;
      this.loadRunningList(paginationVO);
    } else if (widget.widgetName === 'Failed Tasks') {
      this.failedPaginators = event;
      this.showErrorTaskList = true;
      let paginationVO;
      if (this.isFromPreview === undefined || this.isFromPreview === false) {
        paginationVO = this.getPaginationForErrorTask('ERROR');
        paginationVO.filterType = 'all';
      } else {
        if (this.failedPaginators.index > 0) {
          this.pagination.index = this.failedPaginators.index;
        } else {
          this.pagination.index = 0;
        }
        if (this.failedPaginators.pageSize > 5) {
          this.pagination.size = this.failedPaginators.pageSize;
        } else {
          this.pagination.size = this.defaultPageSize;
        }
        paginationVO = this.pagination;
      }
      this.loadErrorList(paginationVO);
    }

  }

  loadTaskboardTableData() {
    if (this.isFromPreview === undefined || this.isFromPreview === false) {
      this.taskListPaginationVO = this.getPaginationForTaskList();
      this.taskListPaginationVO.taskStatus = 'all';
    } else {
      this.taskListPaginationVO = this.pagination;
      if (this.paginatorForTaskList.index > 0) {
        this.taskListPaginationVO.index = this.paginatorForTaskList.index;
      }
      if (this.paginatorForTaskList.pageSize > 5) {
        this.taskListPaginationVO.size = this.paginatorForTaskList.pageSize;
      }
    }
    this.workspaceDashboardService.getAllTaskList(this.taskListPaginationVO).subscribe(result => {
      if (result) {
        this.taskboardVO = result.taskboardTaskVo;
        this.statusVO = result.statusList;
        this.taskboardLength = result.totalRecords;
        this.showTaskList = true;
        if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
          this.isPaginator = true;
          this.isLength = true;
        } else {
          this.isPaginator = false;
          this.isLength = false;
        }
      }
    });
  }

  pageEventForWorkflow(event) {
    this.paginatorsForWorkflow = event;
    this.showWorkflowTaskList = true;
    let paginationVO;
    if (this.isFromPreview === undefined || this.isFromPreview === false) {
      paginationVO = this.getPaginationForWorkflow();
      this.workflowPaginationVo.filterType = 'all';
    } else {
      if (this.paginatorsForWorkflow.index > 0) {
        this.pagination.index = this.paginatorsForWorkflow.index;
      } else {
        this.pagination.index = 0;
      }
      if (this.paginatorsForWorkflow.pageSize > 5) {
        this.pagination.size = this.paginatorsForWorkflow.pageSize;
      } else {
        this.pagination.size = this.defaultPageSize;
      }
      paginationVO = this.pagination;
    }
    this.loadWorkflowTableData(paginationVO);
  }

  getPaginationForWorkflow() {
    if (this.sortForWorkflow === undefined || this.sortForWorkflow.active === undefined || this.sortForWorkflow.active === '') {
      this.workflowPaginationVo.columnName = this.defaultColumnForWorkflow;
    } else {
      this.workflowPaginationVo.columnName = this.sortForWorkflow.active;
    }
    if (this.sortForWorkflow === undefined || this.sortForWorkflow.direction === '' ||
      this.sortForWorkflow.direction === undefined || this.sortForWorkflow.direction === null) {
      this.workflowPaginationVo.direction = this.defaultSortDirection;
    } else {
      this.workflowPaginationVo.direction = this.sortForWorkflow.direction;
    }
    if (this.paginatorsForWorkflow.index > 0) {
      this.workflowPaginationVo.index = this.paginatorsForWorkflow.index;
    } else {
      this.workflowPaginationVo.index = 0;
    }
    if (this.paginatorsForWorkflow.pageSize > 5) {
      this.workflowPaginationVo.size = this.paginatorsForWorkflow.pageSize;
    } else {
      this.workflowPaginationVo.size = this.defaultPageSize;
    }
    return this.workflowPaginationVo;
  }

  sortDataForWorkflow(sort: Sort) {
    this.sortForWorkflow = sort;
    let paginationVO;
    if (this.isFromPreview === undefined || this.isFromPreview === false) {
      paginationVO = this.getPaginationForWorkflow();
      this.workflowPaginationVo.filterType = 'all';
    } else {
      paginationVO = this.pagination;
    }
    this.loadWorkflowTableData(paginationVO);
  }

  loadWorkflowTableData(paginationVO) {
    this.workspaceDashboardService.getWorkflowTaskList(paginationVO).subscribe(result => {
      if (result != null) {
        this.workflowVO = result.workflowTasksVo;
        this.workflowLength = result.totalRecords;
        this.showWorkflowTaskList = true;
        if (this.workflowLength !== 0 && this.workflowLength !== '0') {
          this.isWorkflowPaginator = true;
          this.isWorkFlowLength = true;
        }
        else {
          this.isWorkflowPaginator = false;
          this.isWorkFlowLength = false;
        }
      }
    });
  }

  closeDialog() {
    this.widgetEvent.emit(true);
  }

  remove(widget) {
    if (widget) {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        disableClose: true,
        width: '400px',
        data: { type: 'widget' }
      });
      dialog.afterClosed().subscribe((data) => {
        if (data === 'yes') {
          const index = this.workspaceDashboardVO.dashboardWidgets.findIndex(widgets => widgets.id === widget.id);
          const widgetVo = new DashboardWidgetVO();
          widgetVo.id = this.workspaceDashboardVO.dashboardWidgets[index].id;
          widgetVo.dashboardId = this.workspaceDashboardVO.dashboardWidgets[index].dashboardId;

          this.workspaceDashboardService.deleteDashboardWidget(widgetVo).subscribe(data => {
            if (data && data.response.includes('successfully')) {
              this.workspaceDashboardService.getDashboard(this.workspaceDashboardVO.id).subscribe(data => {
                this.activeElement = data.dashboardName;
                if (data.dashboardWidgets.length !== 0) {
                  this.showWidgets = true;
                  this.workspaceDashboardVO.dashboardWidgets = data.dashboardWidgets;
                } else {
                  this.workspaceDashboardVO.dashboardWidgets = [];
                  this.showWidgets = false;
                  this.noDashboard = false;
                }
                for (const widgets of data.dashboardWidgets) {
                  this.loadWidget(widgets);
                }
              });
            }
          });
        }
      });
    }

  }

  drag(event, index, widget) {
  }
  drop(event: CdkDragDrop<string[]>) {
    const fromIndex = event.previousIndex;
    const toIndex = event.currentIndex;

    this.wokspaceSwapVO = [];
    if (fromIndex !== toIndex) {

      const oldtarget = this.workspaceDashboardVO.dashboardWidgets[event.previousIndex];
      const newtarget = this.workspaceDashboardVO.dashboardWidgets[event.currentIndex];
      this.workspaceDashboardVO.dashboardWidgets[event.previousIndex] = this.workspaceDashboardVO.dashboardWidgets[event.currentIndex];

      this.workspaceDashboardVO.dashboardWidgets[event.currentIndex] = oldtarget;

      this.wokspaceSwapVO.push({ widgetId: oldtarget.id, rownum: newtarget.rownum, columnum: newtarget.colnum });
      this.wokspaceSwapVO.push({ widgetId: newtarget.id, rownum: oldtarget.rownum, columnum: oldtarget.colnum });
      this.workspaceDashboardService.swapWidget(this.dashboardId, this.wokspaceSwapVO).subscribe(data => {
        if (data.response.includes('swaped successfully')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response
          });
          this.workspaceDashboardService.getDashboard(this.workspaceDashboardVO.id).subscribe(data => {
            this.activeElement = data.dashboardName;
            if (data.dashboardWidgets.length !== 0) {
              this.showWidgets = true;
              this.workspaceDashboardVO.dashboardWidgets = data.dashboardWidgets;
            } else {
              this.showWidgets = false;
            }
            for (const widgets of data.dashboardWidgets) {
              this.loadWidget(widgets);
            }
          });
        }
      });
    }
  }
  openFullView(data) {
    let paginationVO;
    let dashboardChartVo;
    if (data.widgetName === 'Workload by Status') {
      dashboardChartVo = this.workloadByStatusChartVO;
    } else if (data.widgetName === 'Tasks by Assignee') {
      dashboardChartVo = this.taskByAssigneeChartVO;
    } else if (data.widgetName === 'Tasks by Assignee Ver Bar') {
      dashboardChartVo = this.taskByAssigneeVerChartVO;
    } else if (data.widgetName === 'Tasks by Assignee Hor Bar') {
      dashboardChartVo = this.taskByAssigneeHorChartVO;
    } else if (data.widgetName === 'Taskboard Statistics') {
      paginationVO = this.taskboardStatisticsPaginationVO;
    } else if (data.widgetName === 'Task List') {
      paginationVO = this.taskListPaginationVO;
    } else if (data.widgetName === 'Tasks in Progress') {
      paginationVO = this.tasksInProgressPaginationVO;
    } else if (data.widgetName === 'Unassigned Tasks') {
      paginationVO = this.unassignedTasksPaginationVO;
    } else if (data.widgetName === 'Tasks Deleted') {
      paginationVO = this.tasksDeletedPaginationVO;
    } else if (data.widgetName === 'Tasks Completed') {
      paginationVO = this.tasksCompletedPaginationVO;
    } else if (data.widgetName === 'Number of Tasks in Progress') {
      paginationVO = this.numberOfProgressPaginationVO;
    } else if (data.widgetName === 'Number of Tasks Closed') {
      paginationVO = this.numberOfClosedPaginationVO;
    } else if (data.widgetName === 'Number of Tasks Completed') {
      paginationVO = this.numberOfCompletedPaginationVO;
    } else if (data.widgetName === 'Workload by Status Ver Bar') {
      dashboardChartVo = this.workloadByStatusVerBarChartVO;
    } else if (data.widgetName === 'Workload by Status Hor Bar') {
      dashboardChartVo = this.workloadByStatusHorBarChartVO;
    } else if (data.widgetName === 'Total Unassigned Tasks') {
      paginationVO = this.totalUnassignedTaskPaginationVO;
    } else if (data.widgetName === 'Total Assigned(Not Completed) Tasks') {
      paginationVO = this.totalAssignedNotCompletedTaskPaginationVO;
    } else if (data.widgetName === 'Priority Breakdown') {
      dashboardChartVo = this.priorityBreakdownTaskChartVO;
    } else if (data.widgetName === 'Priority Breakdown Hor Bar') {
      dashboardChartVo = this.priorityBreakdownHorTaskChartVO;
    } else if (data.widgetName === 'Priority Breakdown Ver Bar') {
      dashboardChartVo = this.priorityBreakdownVerTaskChartVO;
    } else if (data.widgetName === 'Total Urgent Tasks') {
      dashboardChartVo = this.totalUrgentTaskChartVO;
    } else if (data.widgetName === 'Total Urgent Tasks') {
      dashboardChartVo = this.totalUrgentTaskChartVO;
    } else if (data.widgetName === 'Total High Tasks') {
      dashboardChartVo = this.totalHighTaskBoardChartVO;
    } else if (data.widgetName === 'Total Medium Tasks') {
      dashboardChartVo = this.totalMediumTaskBoardChartVO;
    } else if (data.widgetName === 'Total Low Tasks') {
      dashboardChartVo = this.totalLowTaskBoardChartVO;
    } else if (data.widgetName === 'Total No Priority Tasks') {
      dashboardChartVo = this.totalNoPriorityTaskBoardChartVO;
    } else if (data.widgetName === 'Total Past Due Tasks') {
      paginationVO = this.totalPastDueTasksPaginationVO;
    } else if (data.widgetName === 'Total Due Today Tasks') {
      paginationVO = this.totalDueTodayTasksPaginationVO;
    } else if (data.widgetName === 'Total Due Tomorrow Tasks') {
      paginationVO = this.totalDueTomorrowTasksPaginationVO;
    } else if (data.widgetName === 'Total Due in 7 days Tasks') {
      paginationVO = this.totalDueInSevenTasksTasksPaginationVO;
    } else if (data.widgetName === 'Workflow Task List') {
      paginationVO = this.workflowPaginationVo;
    } else if (data.widgetName === 'Assignee Task by Taskname') {
      dashboardChartVo = this.assigneeTaskByTasknameChartVO;
    } else if (data.widgetName === 'Teams Task by Taskname') {
      dashboardChartVo = this.teamsTaskByTasknameChartVO;
    } else if (data.widgetName === 'Completed Tasks') {
      paginationVO = this.completedTaskPaginationVO;
    } else if (data.widgetName === 'Running Tasks') {
      paginationVO = this.runningTaskPaginationVO;
    } else if (data.widgetName === 'Failed Tasks') {
      paginationVO = this.failedTaskPaginationVO;
    } else if (data.widgetName === 'Workflow Tasks by Assignee') {
      dashboardChartVo = this.workflowTasksByAssigneeChartVO;
    } else if (data.widgetName === 'Tasks by Teams') {
      dashboardChartVo = this.taskByTeamsChartVO;
    } else if (data.widgetName === 'Assignee Task by Taskname Hor Bar') {
      dashboardChartVo = this.assigneeTaskByTasknameHorChartVO;
    } else if (data.widgetName === 'Assignee Task by Taskname Ver Bar') {
      dashboardChartVo = this.assigneeTaskByTasknameVerChartVO;
    } else if (data.widgetName === 'Teams Task by Taskname Hor Bar') {
      dashboardChartVo = this.teamsTaskByTasknameHorChartVO;
    } else if (data.widgetName === 'Teams Task by Taskname Ver Bar') {
      dashboardChartVo = this.teamsTaskByTasknameVerChartVO;
    } else if (data.widgetName === 'Number of Running Tasks') {
      paginationVO = this.numberOfWorkflowRunningPaginationVO;
    } else if (data.widgetName === 'Number of Failed Tasks') {
      paginationVO = this.numberOfWorkflowFailedPaginationVO;
    } else if (data.widgetName === 'Number of Completed Tasks') {
      paginationVO = this.numberOfWorkflowCompletedPaginationVO;
    } else if (data.widgetName === 'Workflow Tasks by Assignee Hor Bar') {
      dashboardChartVo = this.workflowTasksByAssigneeHorChartVO;
    } else if (data.widgetName === 'Workflow Tasks by Assignee Ver Bar') {
      dashboardChartVo = this.workflowTasksByAssigneeVerChartVO;
    } else if (data.widgetName === 'Tasks by Teams Hor Bar') {
      dashboardChartVo = this.taskByTeamsHorChartVO;
    } else if (data.widgetName === 'Tasks by Teams Ver Bar') {
      dashboardChartVo = this.taskByTeamsVerChartVO;
    } else if (data.widgetName === 'Total Past Due Tasks (Workflow)') {
      paginationVO = this.totalPastDueWorkflowTasksPaginationVO;
    } else if (data.widgetName === 'Total Due Today Tasks (Workflow)') {
      paginationVO = this.totalDueTodayWorkflowTasksPaginationVO;
    } else if (data.widgetName === 'Total Due Tomorrow Tasks (Workflow)') {
      paginationVO = this.totalDueTomorrowWorkflowTasksPaginationVO;
    } else if (data.widgetName === 'Total Due in 7 days Tasks (Workflow)') {
      paginationVO = this.totalDueInSevenWorkflowTasksTasksPaginationVO;
    }
    const dialog = this.dialog.open(WidgetPreviewComponent, {
      disableClose: false,
      width: '100%',
      height: '98%',
      data: {
        widget: data, pagination: paginationVO, dashboardChartVO: dashboardChartVo,
        boardNames: this.boardNamesVO
      }
    });

    dialog.afterClosed().subscribe(dialogRef => {
      if (dialogRef) {
        this.isFromPreview = false;
      }
    });
  }
}
