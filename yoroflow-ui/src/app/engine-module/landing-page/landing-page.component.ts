import { Component, OnInit, ViewChild, Input, ViewChildren, QueryList, AfterViewInit, ElementRef, NgZone } from '@angular/core';
import { UserService } from '../shared/service/user-service';
import { Application } from './appication-vo';
import { ApplicationProvisionService } from './application-provision-service';
import { MyTaskService } from '../../mytasks-module/mytasks/my-task.service';
import { OpenFormDialogBoxComponent } from '../../engine-module/open-form-dialog-box/open-form-dialog-box.component';
import { MatDialog } from '@angular/material/dialog';
import { WorkflowDashboardService } from '../work-flow-dashboard/workflow-dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import * as Highcharts from 'highcharts';
import { DashboardVO, OverviewVO, TaskboardTasksVO, WorkflowTasksVO, LatestWorkflowVO, PaginatorForTaskboard, PaginatorForWorkflow, BoardNameVo, StatusVo, SubStatusVo, GroupsVO, CurrentUserVO } from './landing-page-vo';
import { AssignUserTaskVO, TaskboardLabelsVO, TaskboardTaskVO, UserVO } from '../../taskboard-module/taskboard-form-details/taskboard-task-vo';
import { GroupVO } from '../../designer-module/task-property/model/group-vo';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { StatusList, SubStatusVO, TaskboardColumnMapVO, TaskboardColumns, TaskboardSubStatusVO, TaskboardTemplateJson, TaskboardTemplatesVO, TaskboardVO, TaskSequenceVO } from '../../taskboard-module/taskboard-configuration/taskboard.model';
import { TaskboardFormDetailsComponent } from '../../taskboard-module/taskboard-form-details/taskboard-form-details.component';
import { WorkflowdialogComponent } from '../workflow-dialog/workflow-dialog.component';
import { TaskBoardService } from '../../taskboard-module/taskboard-configuration/taskboard.service';
import { TasklistService } from '../../engine-module/tasklist.service';
import { PaginationVO, FilterValuesVO } from 'src/app/mytasks-module/mytasks/pagination-vo';
import { LandingPageService } from './landing-page.service';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { merge, Observable } from 'rxjs';
import { DatePipe } from '@angular/common';

import More from 'highcharts/highcharts-more';
More(Highcharts);
import Drilldown from 'highcharts/modules/drilldown';
Drilldown(Highcharts);
import Exporting from 'highcharts/modules/exporting';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
Exporting(Highcharts);
import { AddWidgetComponent } from '../add-widget/add-widget.component';
import { CdkDragMove } from '@angular/cdk/drag-drop';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

// import '@angular/localize/init';
// import { loadTranslations } from '@angular/localize'
@Component({
  selector: 'lib-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  @ViewChild('resizeBox') resizeBox: ElementRef;
  @ViewChild('dragHandleCorner') dragHandleCorner: ElementRef;
  @ViewChild('dragHandleRight') dragHandleRight: ElementRef;
  @ViewChild('dragHandleBottom') dragHandleBottom: ElementRef;
  mappedTask: any;
  columnStatus: any;
  constructor(public userService: UserService,
    public applicationProvisionService: ApplicationProvisionService,
    private router: Router,
    public activateRoute: ActivatedRoute,
    private landingPageService: LandingPageService,
    private myTaskService: MyTaskService,
    private dialog: MatDialog,
    public workflowDashboardService: WorkflowDashboardService,
    public taskboardService: TaskBoardService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private taskListService: TasklistService, private datePipe: DatePipe, private workspaceService: WorkspaceService,
    private ngZone: NgZone) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;

  public config: PerfectScrollbarConfigInterface = {};
  @Input('defaultColumn')
  defaultColumnForTaskboard = 'created_on';
  @Input('defaultColumn')
  defaultColumnForWorkflow = 'createdDate';
  @Input('defaultSortDirection')
  defaultSortDirection = 'desc';
  @ViewChild('menuTrigger') input;
  @ViewChild('menuTriggerWorkflow') inputForWorkflow;

  @Input() isFromTaskboard: any;
  @Input() taskboardId: any;
  @Input() assignedUsersList: any;
  @Input() columnName: any;
  @Input() taskboardKey: any;
  taskboardForm: FormGroup;
  workflowForm: FormGroup;
  isPaginator = false;
  isworkFlowPaginator = false;
  isworkflowLength = false;
  isLength = false;
  columnValue: any;
  filterCountForTaskboard = 0;
  filterCountForWorkflow = 0;

  filterOperator: string;
  columnId: any;
  isDateField = false;
  filterDatatype: any;
  type = 'text';

  sortForTaskboard: Sort;
  sortForWorkflow: Sort;
  id: string;
  selectedCard: any = 'all';
  pageId: any;
  applicationVO: Application;
  dashboardVO: DashboardVO;
  overviewVO: OverviewVO;
  taskboardVO: TaskboardTasksVO[] = [];
  workflowVO: WorkflowTasksVO[] = [];
  latestWorkflowVO: LatestWorkflowVO[] = [];
  paginationVO = new PaginationVO();
  filterValuesVO = new FilterValuesVO();
  taskboardTaskVO = new TaskboardTaskVO();

  selectedtaskboardVO: TaskboardVO;
  taskboardColumnMapVO: TaskboardColumnMapVO[] = [];
  usersList: UserVO[] = [];
  userGroupList: UserVO[] = [];
  groupList: GroupVO[] = [];
  assignedWorkflowGroup: GroupsVO[] = [];
  assignedGroups: GroupsVO[] = [];
  taskboardTaskVOList: TaskboardTaskVO[] = [];
  taskBoardTaskVO = new TaskboardTaskVO();
  taskIdFromUrl: any;
  selectedColumn: string;
  selectedColumnIndex: number;
  selectedTaskIndex: any;
  taskboardColumns: any[] = [];
  paginatorForTaskboard = new PaginatorForTaskboard();
  paginatorsForWorkflow = new PaginatorForWorkflow();
  boardNamesVO: BoardNameVo[] = [];
  boardList: BoardNameVo[] = [];
  statusVO: StatusVo[] = [];
  statusList: StatusVo[] = [];
  subStatusVO: SubStatusVo[] = [];
  subStatusList: SubStatusVo[] = [];
  viewTaskVO: any;
  defaultPageSize = 5;

  displayedColumns: string[] = ['task_id', 'board_name', 'task_name', 'subtasks', 'created_on', 'due_date', 'status', 'sub_status', 'assignedTo', 'action'];
  displayedDoneAndArchiveColumns: string[] = ['task_id', 'task_name', 'subtasks', 'created_on', 'due_date', 'status', 'sub_status', 'assignedTo', 'action', 'archiveAction'];
  displayedColumnsForWorkflow: string[] = ['task_name', 'createdDate', 'dueDate', 'assigned_to', 'assigned_to_group', 'action'];
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  selectedOverviewValue = 'last60Days';
  taskboardDue = 'all';
  workflowDue = 'all';
  show = false;
  showGraph = false;
  checkTaskboardAssignedTo = false;
  assignedToSelected = false;
  checkAssignedTo = false;
  taskboardLength: any;
  workflowLength: any;
  currentUser = new CurrentUserVO();
  currentUserId: any;
  highcharts = Highcharts;
  select = 'Completed';
  taskStatusType: any;
  selectedItem: any;
  isWorkFlowLength = false;
  isWorkflowPaginator = false;
  switchDue = [
    { name: $localize`:@@switchdueInSevenDays:Due in 7 Days`, value: 'dueInSevenDays' },
    { name: $localize`:@@switchdueTomorrow:Due Tomorrow`, value: 'dueTomorrow' },
    { name: $localize`:@@switchdueToday:Due Today`, value: 'dueToday' },
    { name: $localize`:@@switchpastDue:Past Due`, value: 'pastDue' },
    { name: $localize`:@@switchall:All`, value: 'all' }
  ];
  overviews = [
    { name: $localize`:@@switchthisMonth:This Month`, value: 'thisMonth' },
    { name: $localize`:@@switchlastMonth:Last Month`, value: 'lastMonth' },
    { name: $localize`:@@switchthisWeek:This Week`, value: 'thisWeek' },
    { name: $localize`:@@switchlastWeek:Last Week`, value: 'lastWeek' },
    { name: $localize`:@@switchlast60Days:Past 60 Days`, value: 'last60Days' }
  ];
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

  getchart = {
    chart: {
      type: 'column'
    },
    title: {
      text: $localize`:@@chartTitle:Overview of Taskboard, Workflow and Due`
    },
    subtitle: {
      text: $localize`:@@chartSubTitle:Click the columns to view individual task count`
    },
    accessibility: {
      announceNewData: {
        enabled: true
      }
    },
    xAxis: {
      type: 'category'
    },
    yAxis: {
      title: {
        text: $localize`:@@chartSubTitleyAxis:Count`
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.y}'
        }
      }
    },
    exporting: {
      enabled: false
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
    },
    series: [
      {
        name: $localize`:@@chartData:Tasks`,
        colorByPoint: true,
        data: [
          { name: $localize`:@@chartData1:Taskboard`, y: 23, drilldown: 'Taskboard', color: '#3f5bff' },
          { name: $localize`:@@chartData2:Workflow`, y: 15, drilldown: 'Workflow', color: '#1171ef' },
          { name: $localize`:@@chartData3:Due`, y: 8, drilldown: 'Due', color: '#f56036' }]
      }
    ],
    drilldown: {
      series: [
        {
          name: $localize`:@@chartData1:Taskboard`,
          id: 'Taskboard',
          data: [[$localize`:@@chartTaskboardInProgress:In Progress`, 5], [$localize`:@@chartTaskboardTodo:Todo`, 8], [$localize`:@@chartTaskboardCompleted:Completed`, 10]]
        },
        {
          name: $localize`:@@chartData2:Workflow`,
          id: 'Workflow',
          data: [[$localize`:@@chartWorkflowInProgress:In Progress`, 7], [$localize`:@@chartWorkflowCompleted:Completed`, 9]]
        },
        {
          name: $localize`:@@chartData3:Due`,
          id: 'Due',
          data: [[$localize`:@@chartDueTaskboard:Taskboard`, 3], [$localize`:@@chartDueWorkflow:Workflow`, 5]]
        }
      ]
    }
  };

  getWidget = {
    chart: {
      type: 'pie'
    },
    title: {
      text: 'Workload by status'
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
        // allowPointSelect: true,
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
  showWidgets = false;

  showWorkload = false;
  get resizeBoxElement(): HTMLElement {
    return this.resizeBox.nativeElement;
  }

  get dragHandleCornerElement(): HTMLElement {
    return this.dragHandleCorner.nativeElement;
  }

  get dragHandleRightElement(): HTMLElement {
    return this.dragHandleRight.nativeElement;
  }

  get dragHandleBottomElement(): HTMLElement {
    return this.dragHandleBottom.nativeElement;
  }
  ngOnInit(): void {
    this.loadlandingDashboard();
    this.landingPageService.workSpaceSwitchEmitter.subscribe(data => {
      this.loadlandingDashboard();
    });
  }

  loadlandingDashboard(): void {
    this.initializeFilterFormTaskboard();
    this.initializeFilterFormWorkflow();
    const sub = Observable.interval(500).subscribe(val => {
      if (this.workspaceService.workspaceID) {
        if (this.isFromTaskboard) {
          this.usersList = this.assignedUsersList;
          this.loadDoneTaskboardTableData();
          this.loadSubStatusList();
          this.searchUservalueChanges();
          this.searchSubStatusValueChanges();
        } else {
        
          // this.loadApplication('yoroflow');
          this.loadCardData();
          this.loadOverviewData();
          this.loadTaskboardTableData();
          this.loadBoardNames();
          this.loadWorkflowTableData();
          this.getWorkflowLaunch();
          this.getUserAndGroupList();
          this.loadWorkflowGroups();
          this.loadCurrentUser();
          this.searchUservalueChanges();
          this.searchSubStatusValueChanges();
          this.searchStatusValueChanges();
          this.searchBoardValueChanges();
          this.searchAssignedToGroupValueChanges();
        }
        sub.unsubscribe();
      }
    });
  }

  backToTaskboard() {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/taskboard/' + this.taskboardKey]);
  }
  deletedTasks(status) {
    this.isLength = false;
    this.isPaginator = false;
    this.columnStatus = status;
    this.select = status;
    this.paginationVO = this.getPaginationForTaskboard();
    this.paginationVO.taskboardId = this.taskboardId;
    this.paginationVO.filterColumnName = this.columnStatus;
    this.landingPageService.getDoneTaskoardTask(this.paginationVO).subscribe(result => {
      if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
        this.taskboardVO = result.taskboardTaskVo;
        this.taskboardLength = result.totalRecords;

        if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
          this.isPaginator = true;
          this.isLength = true;
        }
        else {
          this.isPaginator = false;
          this.isLength = false;
        }

        for (let i = 0; i < this.taskboardVO.length; i++) {
          if (this.taskboardVO[i].dueDate !== undefined && this.taskboardVO[i].dueDate !== null && this.taskboardVO[i].dueDate !== '') {
            const date = new Date(this.taskboardVO[i].dueDate);
            date.setDate(date.getDate() + 1);
            this.taskboardVO[i].dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
            date.setDate(date.getDate() + 1);
          }

        }
      } else {
        this.taskboardVO = [];
        this.taskboardLength = 0;
      }
    });
    this.paginationVO = this.getPaginationForTaskboard();
    this.paginationVO.taskboardId = this.taskboardId;
    this.paginationVO.filterColumnName = this.columnStatus;
    this.landingPageService.getDoneSubStatusList(this.paginationVO).subscribe(names => {
      this.subStatusVO = names.subStatusList;
      this.subStatusList = names.subStatusList;
      this.statusList = names.statusList;
      if (this.subStatusList.length > 0) {
        for (let i = 0; i < this.subStatusList.length; i++) {
          this.subStatusList[i].isSelected = false;
        }
      }

    });
  }
  archivedTasks(status) {
    this.isPaginator = false;
    this.isLength = false;
    this.columnStatus = status;
    this.select = status;
    this.paginationVO = this.getPaginationForTaskboard();
    this.paginationVO.taskboardId = this.taskboardId;
    this.paginationVO.filterColumnName = this.columnStatus;
    this.landingPageService.getDoneTaskoardTask(this.paginationVO).subscribe(result => {
      if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
        this.taskboardVO = result.taskboardTaskVo;
        this.taskboardLength = result.totalRecords;

        if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
          this.isPaginator = true;
          this.isLength = true;
        }
        else {
          this.isPaginator = false;
          this.isLength = false;
        }
        for (let i = 0; i < this.taskboardVO.length; i++) {
          if (this.taskboardVO[i].dueDate !== undefined && this.taskboardVO[i].dueDate !== null && this.taskboardVO[i].dueDate !== '') {
            const date = new Date(this.taskboardVO[i].dueDate);
            date.setDate(date.getDate() + 1);
            this.taskboardVO[i].dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
            date.setDate(date.getDate() + 1);
          }

        }
      } else {
        this.taskboardVO = [];
        this.taskboardLength = 0;
      }
    });
    this.paginationVO = this.getPaginationForTaskboard();
    this.paginationVO.taskboardId = this.taskboardId;
    this.paginationVO.filterColumnName = this.columnStatus;
    this.landingPageService.getDoneSubStatusList(this.paginationVO).subscribe(names => {
      this.subStatusVO = names.subStatusList;
      this.subStatusList = names.subStatusList;
      if (this.subStatusList.length > 0) {
        for (let i = 0; i < this.subStatusList.length; i++) {
          this.subStatusList[i].isSelected = false;
        }
      }

    });
  }

  loadSubStatusList() {
    this.paginationVO = this.getPaginationForTaskboard();
    this.paginationVO.taskboardId = this.taskboardId;
    this.paginationVO.filterColumnName = this.columnName;
    this.landingPageService.getDoneSubStatusList(this.paginationVO).subscribe(names => {
      this.subStatusVO = names.subStatusList;
      this.subStatusList = names.subStatusList;
      if (this.subStatusList.length > 0) {
        for (let i = 0; i < this.subStatusList.length; i++) {
          this.subStatusList[i].isSelected = false;
        }
      }

    });
  }

  searchUservalueChanges(): void {
    this.taskboardForm.get('searchForAssignedToTaskboard').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (let i = 0; i < this.usersList.length; i++) {
          const firstName = this.usersList[i].firstName.toLowerCase();
          const lastName = this.usersList[i].lastName.toLowerCase();
          if (firstName.includes(filterData) || lastName.includes(filterData)) {
            filterList.push(this.usersList[i]);
          }
        }
        this.usersList = filterList;
      } else {
        if (this.isFromTaskboard) {
          this.usersList = this.assignedUsersList;
        } else {
          this.usersList = this.userGroupList;
        }

      }
    });
  }

  searchSubStatusValueChanges(): void {
    this.taskboardForm.get('searchForSubStatus').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (let i = 0; i < this.subStatusVO.length; i++) {
          const subStatus = this.subStatusVO[i].subStatus.toLowerCase();
          if (subStatus.includes(filterData)) {
            filterList.push(this.subStatusVO[i]);
          }
        }
        this.subStatusVO = filterList;
      } else {
        this.subStatusVO = this.subStatusList;
      }
    });
  }
  completedTasks(status) {
    this.isLength = false;
    this.isPaginator = false;
    this.select = status;
    this.columnStatus = status;
    this.loadDoneTaskboardTableData();
    this.loadSubStatusList();
  }
  searchStatusValueChanges(): void {
    this.taskboardForm.get('searchForStatus').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (let i = 0; i < this.statusVO.length; i++) {
          const status = this.statusVO[i].status.toLowerCase();
          if (status.includes(filterData)) {
            filterList.push(this.statusVO[i]);
          }
        }
        this.statusVO = filterList;
      } else {
        this.statusVO = this.statusList;
      }
    });
  }

  searchBoardValueChanges(): void {
    this.taskboardForm.get('search').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (let i = 0; i < this.boardNamesVO.length; i++) {
          const boardName = this.boardNamesVO[i].boardName.toLowerCase();
          if (boardName.includes(filterData)) {
            filterList.push(this.boardNamesVO[i]);
          }
        }
        this.boardNamesVO = filterList;
      } else {
        this.boardNamesVO = this.boardList;
      }
    });
  }

  searchAssignedToGroupValueChanges(): void {
    this.workflowForm.get('searchForAssignedToGroup').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (let i = 0; i < this.assignedWorkflowGroup.length; i++) {
          const groupName = this.assignedWorkflowGroup[i].groupName.toLowerCase();
          if (groupName.includes(filterData)) {
            filterList.push(this.assignedWorkflowGroup[i]);
          }
        }
        this.assignedWorkflowGroup = filterList;
      } else {
        this.assignedWorkflowGroup = this.assignedGroups;
      }
    });
  }

  uncheckAllWorkflows() {
    this.assignedWorkflowGroup.forEach((element) => {
      element.isSelected = false;
    });
    this.currentUser.isSelected = false;
    this.assignedToSelected = false;
    this.checkAssignedTo = false;
  }
  uncheckAllTaskboard() {
    this.usersList.forEach(element => {
      element.isSelected = false;
    });
    this.boardNamesVO.forEach(element => {
      element.isSelected = false;
    });

    this.statusVO.forEach(element => {
      element.isSelected = false;
    });
    this.subStatusVO.forEach(element => {
      element.isSelected = false;
    });
    this.checkTaskboardAssignedTo = false;
  }
  loadBoardNames() {
    this.landingPageService.getBoardNames().subscribe(names => {
      this.boardNamesVO = names.boardNameList;
      this.boardList = names.boardNameList;
      this.statusVO = names.statusList;
      this.statusList = names.statusList;
      this.subStatusVO = names.subStatusList;
      this.subStatusList = names.subStatusList;
    });
  }
  loadCurrentUser() {
    this.landingPageService.getLoggedInUserDetails().subscribe(user => {
      this.currentUser = user;
      this.currentUserId = user.userId;
    });
  }

  loadWorkflowGroups() {
    this.landingPageService.getWorkflowGroups().subscribe(groups => {
      this.assignedWorkflowGroup = groups;
      this.assignedGroups = groups;

    });
  }

  changeFilterValue(event, filterValue, columnName, datatype, checked) {
    if (filterValue === 'unAssigned') {
      this.checkTaskboardAssignedTo = true;
    }
    this.filterOperator = 'string';
    this.columnId = columnName;
    this.setFilterFormValues(filterValue, datatype);
    if (event.checked === true) {
      this.selectedItem = this.columnId;

      if (this.isFromTaskboard && filterValue !== 'unAssigned') {
        const index = this.assignedUsersList.findIndex(t => t.userId === filterValue);
        if (index !== -1) {
          this.assignedUsersList[index].isSelected = true;
        }
        const subStatusIndex = this.subStatusList.findIndex(t => t.subStatus === filterValue);
        if (subStatusIndex !== -1) {
          this.subStatusList[subStatusIndex].isSelected = true;
        }
      }
      checked = true;
      this.filterForBoardTrue();
    }
    if (event.checked === false) {
      this.selectedItem = '';

      if (this.isFromTaskboard && filterValue !== 'unAssigned') {
        const index = this.assignedUsersList.findIndex(t => t.userId === filterValue);
        if (index !== -1) {
          this.assignedUsersList[index].isSelected = false;
        }
      }
      checked = false;
      this.filterForBoardFalse();
    }
  }

  setFilterFormValues(filterValue, datatype) {
    this.filterDatatype = datatype;
    const form = (this.taskboardForm.get('filters') as FormArray);
    this.taskboardForm.get('filterValue').setValue(null);
    this.taskboardForm.get('operator').setValue(null);
    for (let i = 0; i < form.length; i++) {
      this.taskboardForm.get('filterValue').setValue(filterValue);
      this.taskboardForm.get('operator').setValue('eq');
      this.taskboardForm.get('filterValue').setValidators(null);
      this.taskboardForm.get('filterValue').setErrors(null);
      this.taskboardForm.get('operator').setErrors(null);
    }
  }

  filterForBoardTrue() {
    const array = [];
    if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
      this.filterCountForTaskboard++;
      if (this.filterCountForTaskboard >= 1) {
        (this.taskboardForm.get('filters') as FormArray).push(this.addFilterForTaskboard());
      }
      const index = (this.taskboardForm.get('filters') as FormArray).length - 1;
      this.taskboardForm.get('filters').get('' + index).get('filterIdColumn').setValue(this.columnId);
      this.taskboardForm.get('filters').get('' + index).get('filterIdColumnValue').setValue(this.taskboardForm.get('filterValue').value);
      this.taskboardForm.get('filters').get('' + index).get('operators').setValue(this.taskboardForm.get('operator').value);
      this.taskboardForm.get('filters').get('' + index).get('dataType').setValue(this.filterDatatype);
    }
    if (this.taskboardForm.valid) {
      this.input.closeMenu();
      const form = (this.taskboardForm.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.paginatorForTaskboard.index = 0;
      this.paginatorForTaskboard.pageSize = 5;
      if (this.isFromTaskboard) {
        if (this.columnStatus === 'Completed' || this.columnStatus === undefined) {
          this.loadDoneTaskboardTableData();

        }
        else {
          this.paginationVO = this.getPaginationForTaskboard();
          this.paginationVO.taskboardId = this.taskboardId;
          this.paginationVO.filterColumnName = this.columnStatus;
          this.landingPageService.getDoneTaskoardTask(this.paginationVO).subscribe(result => {
            if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
              this.taskboardVO = result.taskboardTaskVo;

              this.taskboardLength = result.totalRecords;
            } else {
              this.taskboardVO = [];
              this.taskboardLength = 0;
            }
          });
        }
      } else {
        this.loadTaskboardTableData();

      }
      this.removeValidations();
      this.emptyPaginator();
    }
  }

  filterForBoardFalse() {
    this.filterCountForTaskboard--;
    for (let i = 0; i < (this.taskboardForm.get('filters') as FormArray).length; i++) {
      if (this.taskboardForm.get('filters').get('' + i).get('filterIdColumnValue').value === this.taskboardForm.get('filterValue').value) {
        (this.taskboardForm.get('filters') as FormArray).removeAt(i);
        this.input.closeMenu();
        this.paginationVO.index = 0;
        this.paginatorForTaskboard.pageSize = 5;
        const form = (this.taskboardForm.get('filters') as FormArray);
        this.paginationVO.filterValue = form.value;
        if (this.isFromTaskboard) {
          if (this.columnStatus === 'Completed' || this.columnStatus === undefined) {
            this.loadDoneTaskboardTableData();

          }
          else {
            this.paginationVO = this.getPaginationForTaskboard();
            this.paginationVO.taskboardId = this.taskboardId;
            this.paginationVO.filterColumnName = this.columnStatus;
            this.landingPageService.getDoneTaskoardTask(this.paginationVO).subscribe(result => {
              if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
                this.taskboardVO = result.taskboardTaskVo;

                this.taskboardLength = result.totalRecords;
              } else {
                this.taskboardVO = [];
                this.taskboardLength = 0;
              }
            });
          }
        } else {
          this.loadTaskboardTableData();
        }
      }
      this.emptyPaginator();
    }
  }

  getAssignedToGroup(event, groupName, columnName, datatype, checked) {
    if (columnName === 'assignedToGroupWorkflow' && groupName === 'unAssigned') {
      this.filterOperator = 'string';
      this.checkAssignedTo = true;
    } else if (columnName === 'assignedTo' && groupName === 'unAssigned') {
      this.filterOperator = 'string';
      this.assignedToSelected = true;
    }
    this.filterDatatype = datatype;
    this.columnId = columnName;
    const form = (this.workflowForm.get('filters') as FormArray);
    this.workflowForm.get('filterValue').setValue(null);
    this.workflowForm.get('operator').setValue(null);
    for (let i = 0; i < form.length; i++) {
      this.workflowForm.get('filterValue').setValue(groupName);
      this.workflowForm.get('operator').setValue('eq');
      this.workflowForm.get('filterValue').setValidators(null);
      this.workflowForm.get('filterValue').setErrors(null);
      this.workflowForm.get('operator').setErrors(null);
    }
    if (event.checked === true) {
      this.selectedItem = this.columnId;
      checked = true;
      this.filterAssignedToGroupTrue();
    }
    if (event.checked === false) {
      this.selectedItem = '';
      checked = false;
      this.filterForAssignedToGroupFalse();
    }
  }

  filterAssignedToGroupTrue() {
    const array = [];
    if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
      this.filterCountForWorkflow++;
      if (this.filterCountForWorkflow >= 1) {
        (this.workflowForm.get('filters') as FormArray).push(this.addFilterForWorkflow());
      }
      const index = (this.workflowForm.get('filters') as FormArray).length - 1;
      this.workflowForm.get('filters').get('' + index).get('filterIdColumn').setValue(this.columnId);
      this.workflowForm.get('filters').get('' + index).get('filterIdColumnValue').setValue(this.workflowForm.get('filterValue').value);
      this.workflowForm.get('filters').get('' + index).get('operators').setValue(this.workflowForm.get('operator').value);
      this.workflowForm.get('filters').get('' + index).get('dataType').setValue(this.filterDatatype);
    }

    if (this.workflowForm.valid) {
      this.input.closeMenu();
      const form = (this.workflowForm.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.paginatorsForWorkflow.index = 0;
      this.paginatorsForWorkflow.pageSize = 5;
      this.loadWorkflowTableData();
      this.emptyworkPaginator();
      this.removeValidations();
    }
  }

  filterForAssignedToGroupFalse() {
    this.filterCountForWorkflow--;
    for (let i = 0; i < (this.workflowForm.get('filters') as FormArray).length; i++) {
      if (this.workflowForm.get('filters').get('' + i).get('filterIdColumnValue').value === this.workflowForm.get('filterValue').value) {
        (this.workflowForm.get('filters') as FormArray).removeAt(i);
        this.input.closeMenu();
        this.paginationVO.index = 0;
        this.paginatorsForWorkflow.pageSize = 5;
        const form = (this.workflowForm.get('filters') as FormArray);
        this.paginationVO.filterValue = form.value;
        this.loadWorkflowTableData();
        this.emptyworkPaginator();

      }
    }
  }

  initializeFilterFormTaskboard() {
    this.taskboardForm = this.fb.group({
      filterValue: [''],
      operator: [''],
      search: [''],
      searchForAssignedToTaskboard: [''],
      searchForStatus: [''],
      searchForSubStatus: [''],
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

  initializeFilterFormWorkflow() {
    this.workflowForm = this.fb.group({
      filterValue: [''],
      operator: [''],
      searchForAssignedTo: [''],
      searchForAssignedToGroup: [''],
      filters: this.fb.array([
        this.addFilterForWorkflow()
      ])
    });
  }

  addFilterForWorkflow(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      dataType: ['string'],
    });
  }

  addValidations() {
    this.taskboardForm.get('filterValue').setValidators([Validators.required]);
    this.taskboardForm.get('operator').setValidators([Validators.required]);
    this.taskboardForm.get('filterValue').updateValueAndValidity();
    this.taskboardForm.get('operator').updateValueAndValidity();
  }

  removeValidations() {
    this.taskboardForm.get('filterValue').setValidators(null);
    this.taskboardForm.get('operator').setValidators(null);
    this.taskboardForm.get('filterValue').updateValueAndValidity();
    this.taskboardForm.get('operator').updateValueAndValidity();
  }

  clearFilterForTaskboard() {
    this.selectedItem = '';
    if (this.isFromTaskboard) {
      this.checkTaskboardAssignedTo = false;
      this.taskboardForm.get('filterValue').setValue(null);
      this.taskboardForm.get('operator').setValue(null);

      for (let i = 0; i < this.assignedUsersList.length; i++) {
        this.assignedUsersList[i].isSelected = false;
      }
      for (let i = 0; i < this.subStatusList.length; i++) {
        this.subStatusList[i].isSelected = false;
      }
    }
    if ((this.taskboardForm.get('filterValue').value !== null || this.taskboardForm.get('filterValue').value !== undefined || this.taskboardForm.get('filterValue').value !== '')
      && (this.taskboardForm.get('operator').value !== null || this.taskboardForm.get('operator').value !== undefined || this.taskboardForm.get('operator').value !== '')) {
      this.taskboardForm.get('filterValue').setValue(null);
      this.taskboardForm.get('operator').setValue(null);
      this.filterCountForTaskboard--;
      for (let i = 0; i < (this.taskboardForm.get('filters') as FormArray).length; i++) {
        if (this.taskboardForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.taskboardForm.get('filters') as FormArray).removeAt(i);
          this.input.closeMenu();
          this.paginationVO.index = 0;
          this.paginatorForTaskboard.pageSize = 5;
          const form = (this.taskboardForm.get('filters') as FormArray);
          this.paginationVO.filterValue = form.value;
          if (this.isFromTaskboard) {
            this.paginationVO.filterValue = [];
            this.loadDoneTaskboardTableData();
            this.emptyPaginator();
          } else {
            this.loadTaskboardTableData();
            this.emptyPaginator();
          }
        }
      }
    }
  }

  filterApplyForTaskboard() {
    this.selectedItem = this.columnId;
    let setFilter = false;
    this.addValidations();
    for (let i = 0; i < (this.taskboardForm.get('filters') as FormArray).length; i++) {
      if (this.taskboardForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        this.taskboardForm.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        this.taskboardForm.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.taskboardForm.get('filterValue').value);
        this.taskboardForm.get('filters').get('' + i).get('operators').setValue(this.taskboardForm.get('operator').value);
        this.taskboardForm.get('filters').get('' + i).get('dataType').setValue(this.filterDatatype);
      } else {
        const array = [];
        array.push((this.taskboardForm.get('filters') as FormArray).value);
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCountForTaskboard++;
          if (this.filterCountForTaskboard >= 1) {
            (this.taskboardForm.get('filters') as FormArray).push(this.addFilterForTaskboard());
          }
          const length = (this.taskboardForm.get('filters') as FormArray).length - 1;
          this.taskboardForm.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          this.taskboardForm.get('filters').get('' + length).get('filterIdColumnValue').setValue(this.taskboardForm.get('filterValue').value);
          this.taskboardForm.get('filters').get('' + length).get('operators').setValue(this.taskboardForm.get('operator').value);
          this.taskboardForm.get('filters').get('' + length).get('dataType').setValue(this.filterDatatype);
        }
      }
    }
    this.paginationVO.index = 0;
    if (this.taskboardForm.valid) {
      this.input.closeMenu();
      const form = (this.taskboardForm.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.paginatorForTaskboard.index = 0;
      this.paginatorForTaskboard.pageSize = 5;
      if (this.isFromTaskboard) {
        if (this.columnStatus === 'Completed' || this.columnStatus === undefined) {
          this.loadDoneTaskboardTableData();

        }
        else {
          this.paginationVO = this.getPaginationForTaskboard();
          this.paginationVO.taskboardId = this.taskboardId;
          this.paginationVO.filterColumnName = this.columnStatus;
          this.landingPageService.getDoneTaskoardTask(this.paginationVO).subscribe(result => {
            if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
              this.taskboardVO = result.taskboardTaskVo;
              this.taskboardLength = result.totalRecords;
              if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
                this.isPaginator = true;
                this.isLength = true;
              }
              else {
                this.isPaginator = false;
                this.isLength = false;
              }
            } else {
              this.taskboardVO = [];
              this.taskboardLength = 0;
            }
          });
        }
      } else {
        this.loadTaskboardTableData();
      }
      this.removeValidations();
      this.emptyPaginator();

    }
  }
  emptyworkPaginator() {
    this.isWorkflowPaginator = false;
    this.isWorkFlowLength = false;
  }
  emptyPaginator() {
    this.isPaginator = false;
    this.isLength = false;
  }
  filterApplyForWorkflow() {
    this.selectedItem = this.columnId;
    let setFilter = false;
    this.addValidations();

    for (let i = 0; i < (this.workflowForm.get('filters') as FormArray).length; i++) {
      if (this.workflowForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        this.workflowForm.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        this.workflowForm.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.workflowForm.get('filterValue').value);
        this.workflowForm.get('filters').get('' + i).get('operators').setValue(this.workflowForm.get('operator').value);
        this.workflowForm.get('filters').get('' + i).get('dataType').setValue(this.filterDatatype);
      } else {
        const array = [];
        array.push((this.workflowForm.get('filters') as FormArray).value);
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCountForWorkflow++;
          if (this.filterCountForWorkflow >= 1) {
            (this.workflowForm.get('filters') as FormArray).push(this.addFilterForWorkflow());
          }
          const length = (this.workflowForm.get('filters') as FormArray).length - 1;
          this.workflowForm.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          this.workflowForm.get('filters').get('' + length).get('filterIdColumnValue').setValue(this.workflowForm.get('filterValue').value);
          this.workflowForm.get('filters').get('' + length).get('operators').setValue(this.workflowForm.get('operator').value);
          this.workflowForm.get('filters').get('' + length).get('dataType').setValue(this.filterDatatype);
        }
      }
    }
    this.paginationVO.index = 0;
    if (this.workflowForm.valid) {
      this.inputForWorkflow.closeMenu();
      const form = (this.workflowForm.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.paginatorsForWorkflow.index = 0;
      this.paginatorsForWorkflow.pageSize = 5;
      this.loadWorkflowTableData();
      this.emptyworkPaginator();
      this.removeValidations();
    }
  }

  setDataTypeForTaskboard(headerDetails, datatype) {
    if (headerDetails === 'board_name' || headerDetails === 'task_name' || headerDetails === 'task_id'
      || headerDetails === 'status' || headerDetails === 'sub_status') {
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
    const form = (this.taskboardForm.get('filters') as FormArray);
    this.taskboardForm.get('filterValue').setValue(null);
    this.taskboardForm.get('operator').setValue(null);

    for (let i = 0; i < form.length; i++) {
      if (form.get('' + i).get('filterIdColumn').value && form.get('' + i).get('filterIdColumn').value === this.columnId) {
        this.taskboardForm.get('filterValue').setValue(form.get('' + i).get('filterIdColumnValue').value);
        this.taskboardForm.get('operator').setValue(form.get('' + i).get('operators').value);
        this.taskboardForm.get('filterValue').setValidators(null);
        this.taskboardForm.get('filterValue').setErrors(null);
        this.taskboardForm.get('operator').setErrors(null);
      }
    }
  }

  clearFilterForWorkflow() {
    this.selectedItem = '';
    if ((this.workflowForm.get('filterValue').value !== null || this.workflowForm.get('filterValue').value !== undefined || this.workflowForm.get('filterValue').value !== '')
      && (this.workflowForm.get('operator').value !== null || this.workflowForm.get('operator').value !== undefined || this.workflowForm.get('operator').value !== '')) {
      this.workflowForm.get('filterValue').setValue(null);
      this.workflowForm.get('operator').setValue(null);
      this.filterCountForWorkflow--;
      for (let i = 0; i < (this.workflowForm.get('filters') as FormArray).length; i++) {
        if (this.workflowForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.workflowForm.get('filters') as FormArray).removeAt(i);
          this.inputForWorkflow.closeMenu();
          this.paginationVO.index = 0;
          this.paginatorsForWorkflow.pageSize = 5;
          const form = (this.workflowForm.get('filters') as FormArray);
          this.paginationVO.filterValue = form.value;
          this.loadWorkflowTableData();
          this.emptyworkPaginator();
        }
      }
    }
  }

  clearAllFilterTaskboard() {
    this.selectedItem = '';
    if ((this.taskboardForm.get('filters') as FormArray).length > 1
      || ((this.taskboardForm.get('filters') as FormArray).length === 1 &&
        this.taskboardForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== null
        && this.taskboardForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== undefined
        && this.taskboardForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== '')) {
      const length = (this.taskboardForm.get('filters') as FormArray).length;
      for (let i = 0; i < length; i++) {
        (this.taskboardForm.get('filters') as FormArray).removeAt(0);
      }
      this.paginationVO.index = 0;
      this.paginatorForTaskboard.pageSize = 5;
      const form = (this.taskboardForm.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.loadTaskboardTableData();
      this.uncheckAllTaskboard();
      this.loadBoardNames();
      this.emptyPaginator();
      this.getUserAndGroupList();

      (this.taskboardForm.get('filters') as FormArray).push(this.addFilterForTaskboard());
      this.filterCountForTaskboard = 0;
    }
  }

  clearAllFilterWorkflow() {
    this.selectedItem = '';
    if ((this.workflowForm.get('filters') as FormArray).length > 1
      || ((this.workflowForm.get('filters') as FormArray).length === 1 &&
        this.workflowForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== null
        && this.workflowForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== undefined
        && this.workflowForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== '')) {
      const length = (this.workflowForm.get('filters') as FormArray).length;
      for (let i = 0; i < length; i++) {
        (this.workflowForm.get('filters') as FormArray).removeAt(0);
      }
      this.paginationVO.index = 0;
      this.paginatorsForWorkflow.pageSize = 5;
      const form = (this.workflowForm.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.loadWorkflowTableData();
      this.uncheckAllWorkflows();
      this.loadWorkflowGroups();
      this.emptyworkPaginator();

      (this.workflowForm.get('filters') as FormArray).push(this.addFilterForWorkflow());
      this.filterCountForWorkflow = 0;
    }
  }

  setDataTypeForWorkflow(headerDetails, datatype) {
    if (headerDetails === 'Task Name') {
      this.filterOperator = 'string';
      this.isDateField = false;
      this.type = 'text';
    } else if (headerDetails === 'Created Date' || headerDetails === 'Due Date') {
      this.filterOperator = 'number';
      this.isDateField = true;
      this.type = null;
    }
    this.filterDatatype = datatype;
    this.columnId = headerDetails;
    const form = (this.workflowForm.get('filters') as FormArray);
    this.workflowForm.get('filterValue').setValue(null);
    this.workflowForm.get('operator').setValue(null);
    for (let i = 0; i < form.length; i++) {
      if (form.get('' + i).get('filterIdColumn').value && form.get('' + i).get('filterIdColumn').value === this.columnId) {
        this.workflowForm.get('filterValue').setValue(form.get('' + i).get('filterIdColumnValue').value);
        this.workflowForm.get('operator').setValue(form.get('' + i).get('operators').value);
        this.workflowForm.get('filterValue').setValidators(null);
        this.workflowForm.get('filterValue').setErrors(null);
        this.workflowForm.get('operator').setErrors(null);
      }
    }
  }

  getWorkflowLaunch() {
    this.landingPageService.getLatestWorkflowData().subscribe(launch => {
      this.latestWorkflowVO = launch;
    });
  }

  allowLaunch(workflowKey, workflowVersion, taskData) {
    this.workflowDashboardService.getWebhookForLaunchWorkflow(workflowKey, workflowVersion, null).subscribe(webData => {
      if (webData.status === 'proceed') {
        this.workflowDashboardService.launchWorkflow(workflowKey, workflowVersion, taskData, null).subscribe(data => {
          if (data.canProceed === false && (data.taskType === 'USER_TASK' || data.taskType === 'START_TASK'
            || data.taskType === 'APPROVAL_TASK')) {
            this.openDraft(data.instanceTaskId);
            // this.router.navigate(['/my-pending-task', data.instanceTaskId]);
          } else {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Workflow launched successfully'
            });
          }
        });
      }
    });
  }

  launchWorkflow(workflow, workflowKey, workflowVersion) {
    this.workflowDashboardService.getFormIdentifierLaunchWorkflow(workflowKey, workflowVersion, null).subscribe(form => {
      if (form && form !== null && form.hasDraft === true) {
        const dialog = this.dialog.open(WorkflowdialogComponent, {
          disableClose: true,
          width: '450px',

        });
        dialog.afterClosed().subscribe((data) => {
          if (data.status === 'yes') {
            this.workflowDashboardService.workflowDraft(workflow.id).subscribe(res => {
              if (res !== null && res !== undefined && res !== '') {
                this.openDialogForm(res);

              }
            });
          }
          else {
            this.allowLaunch(workflowKey, workflowVersion, null);

          }
        });
      }
      else {
        this.allowLaunch(workflowKey, workflowVersion, null);

      }
    });
  }



  loadGraphData() {
    this.getchart.series.forEach(data => {
      data.data.forEach(res => {
        if (res.name === 'Taskboard') {
          res.y = +this.overviewVO.taskBoardAll;
        } else if (res.name === 'Workflow') {
          res.y = +this.overviewVO.workflowAll;
        } else if (res.name === 'Due') {
          res.y = +this.overviewVO.dueAll;
        }
      });
    });
    this.getchart.drilldown.series.forEach(element => {
      if (element.name === 'Taskboard') {
        element.data = [['Todo', +this.overviewVO.taskBoardTodo],
        ['In Progress', +this.overviewVO.taskBoardProgress],
        ['Completed', +this.overviewVO.taskBoardDone]];
      } else if (element.name === 'Workflow') {
        element.data = [['In Progress', +this.overviewVO.workflowProcess],
        ['Completed', +this.overviewVO.workflowCompleted]];
      } else if (element.name === 'Due') {
        element.data = [['Taskboard', +this.overviewVO.taskBoardDueDate],
        ['Workflow', +this.overviewVO.workflowDueDate]];
      }
    });
    this.showGraph = true;
  }

  loadCardData() {
    this.landingPageService.dashboardCard().subscribe(result => {
      if (result != null) {
        this.dashboardVO = result;
      }
    });
  }
  loadOverviewData() {
    this.showGraph = false;
    this.landingPageService.overviewCard(this.selectedOverviewValue).subscribe(result => {
      if (result != null) {
        this.overviewVO = result;
        this.loadGraphData();
        this.showGraph = true;
      }
    }, error => {
      this.showGraph = true;
    });
  }

  getPaginationForTaskboard() {
    this.paginationVO.taskStatus = this.taskboardDue;
    if (this.sortForTaskboard === undefined || this.sortForTaskboard.active === undefined || this.sortForTaskboard.active === '') {
      this.paginationVO.columnName = this.defaultColumnForTaskboard;
    } else {
      this.paginationVO.columnName = this.sortForTaskboard.active;
    }
    if (this.sortForTaskboard === undefined || this.sortForTaskboard.direction === '' || this.sortForTaskboard.direction === undefined || this.sortForTaskboard.direction === null) {
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

  getPaginationForWorkflow() {
    this.paginationVO.taskStatus = this.workflowDue;
    if (this.sortForWorkflow === undefined || this.sortForWorkflow.active === undefined || this.sortForWorkflow.active === '') {
      this.paginationVO.columnName = this.defaultColumnForWorkflow;
    } else {
      this.paginationVO.columnName = this.sortForWorkflow.active;
    }
    if (this.sortForWorkflow === undefined || this.sortForWorkflow.direction === '' || this.sortForWorkflow.direction === undefined || this.sortForWorkflow.direction === null) {
      this.paginationVO.direction = this.defaultSortDirection;
    } else {
      this.paginationVO.direction = this.sortForWorkflow.direction;
    }
    if (this.paginatorsForWorkflow.index > 0) {
      this.paginationVO.index = this.paginatorsForWorkflow.index;
    } else {
      this.paginationVO.index = 0;
    }
    if (this.paginatorsForWorkflow.pageSize > 5) {
      this.paginationVO.size = this.paginatorsForWorkflow.pageSize;
    } else {
      this.paginationVO.size = this.defaultPageSize;
    }
    return this.paginationVO;
  }

  sortDataForTaskboard(sort: Sort) {
    this.sortForTaskboard = sort;
    if (this.isFromTaskboard) {
      if (this.columnStatus === 'Completed' || this.columnStatus === undefined) {
        this.loadDoneTaskboardTableData();

      }
      else {
        this.paginationVO = this.getPaginationForTaskboard();
        this.paginationVO.taskboardId = this.taskboardId;
        this.paginationVO.filterColumnName = this.columnStatus;
        this.landingPageService.getDoneTaskoardTask(this.paginationVO).subscribe(result => {
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.taskboardVO = result.taskboardTaskVo;
            for (let i = 0; i < this.taskboardVO.length; i++) {
              if (this.taskboardVO[i].dueDate !== undefined && this.taskboardVO[i].dueDate !== null && this.taskboardVO[i].dueDate !== '') {
                const date = new Date(this.taskboardVO[i].dueDate);
                date.setDate(date.getDate() + 1);
                this.taskboardVO[i].dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                date.setDate(date.getDate() + 1);
              }

            }
            this.taskboardLength = result.totalRecords;
          } else {
            this.taskboardVO = [];
            this.taskboardLength = 0;
          }
        });
      }
    } else {
      this.loadTaskboardTableData();
    }

  }

  sortDataForWorkflow(sort: Sort) {
    this.sortForWorkflow = sort;
    this.loadWorkflowTableData();
  }

  pageEventForTaskboard(event) {

    this.paginatorForTaskboard = event;
    if (this.isFromTaskboard) {
      if (this.columnStatus === 'Completed' || this.columnStatus === undefined) {
        this.loadDoneTaskboardTableData();

      }
      else {
        this.paginationVO = this.getPaginationForTaskboard();
        this.paginationVO.taskboardId = this.taskboardId;
        this.paginationVO.filterColumnName = this.columnStatus;
        this.landingPageService.getDoneTaskoardTask(this.paginationVO).subscribe(result => {
          if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
            this.taskboardVO = result.taskboardTaskVo;

            this.taskboardLength = result.totalRecords;
          } else {
            this.taskboardVO = [];
            this.taskboardLength = 0;
          }
        });
      }
      // this.loadDoneTaskboardTableData();
    } else {
      this.loadTaskboardTableData();
    }

  }

  loadTaskboardTableData() {
    this.landingPageService.getTaskboardTableData(this.getPaginationForTaskboard()).subscribe(result => {
      if (result != null) {
        this.taskboardVO = result.taskboardTaskVo;
        this.taskboardLength = result.totalRecords;
        if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
          this.isPaginator = true;
          this.isLength = true;
        }
        else {
          this.isPaginator = false;
          this.isLength = false;
        }
      }
    });
  }

  loadDoneTaskboardTableData() {
    this.paginationVO = this.getPaginationForTaskboard();

    this.paginationVO.taskboardId = this.taskboardId;
    if (this.columnStatus === 'Completed' || this.columnStatus === undefined) {
      this.paginationVO.filterColumnName = this.columnName;

    }
    else {
      this.paginationVO.filterColumnName = this.columnStatus;

    }
    this.landingPageService.getDoneTaskoardTask(this.paginationVO).subscribe(result => {
      if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
        this.taskboardVO = result.taskboardTaskVo;
        this.taskboardLength = result.totalRecords;
        if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
          this.isPaginator = true;
          this.isLength = true;
        }
        else {
          this.isPaginator = false;
          this.isLength = false;
        }
      } else {
        this.taskboardVO = [];
        this.taskboardLength = 0;
      }
    });
  }
  pageEventForWorkflow(event) {
    this.paginatorsForWorkflow = event;
    this.loadWorkflowTableData();
  }

  loadWorkflowTableData() {
    this.landingPageService.getWorkflowTableData(this.getPaginationForWorkflow()).subscribe(result => {
      if (result != null) {
        this.workflowVO = result.workflowTasksVo;
        this.workflowLength = result.totalRecords;
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

  // loadApplication(applicationIdentifier) {
  //   this.applicationProvisionService.getApplication(applicationIdentifier).subscribe(data => {
  //     this.applicationVO = data;
  //     this.show = true;
  //     // this.overlayContainer.getContainerElement().classList.add(this.applicationVO.themeId);
  //   });
  // }

  receiveMessage($event): void {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/get/page', $event.col1]);
  }

  cardSelect(card) {
    this.selectedCard = card;
    if (card === 'pastDue' || card === 'all') {
      this.taskboardDue = card;
      this.workflowDue = card;
      this.loadTaskboardTableData();
      this.loadWorkflowTableData();
    }
  }

  selectedDueForTaskBoard(due) {
    this.taskboardDue = due;
    this.loadTaskboardTableData();
  }

  selectedDueForWorkflow(due) {
    this.workflowDue = due;
    this.loadWorkflowTableData();
  }

  selectedOverview(overview) {
    this.selectedOverviewValue = overview;
    this.loadOverviewData();
  }

  getUserAndGroupList() {
    this.taskboardService.getUserGroupList().subscribe(group => {
      this.groupList = group;

    });
    this.taskboardService.getUsersList().subscribe(users => {
      this.usersList = users;
      this.userGroupList = users;
      this.usersList.forEach(element => {
        element.randomColor = this.getRandomColor();
      });
    });
  }
  getRandomColor() {
    // var color = Math.floor(Math.random() * 16777216).toString(16);
    // return '#000000'.slice(0, -color.length) + color;
    return '#' + ('000000' + Math.floor(Math.random() * 16777216).toString(16)).substr(-6);
  }

  viewTaskboardTask(taskboardId, taskId) {
    this.taskboardTaskVOList = [];
    this.taskIdFromUrl = taskId;

    this.taskboardService.getAllTaskboardDetails(taskboardId).subscribe(task => {
      this.viewTaskVO = task;
      this.taskboardService.getAllDoneTasks(taskboardId).subscribe(result => {

        this.viewTaskVO.taskboardColumnMapVO[this.viewTaskVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList = result;
        this.taskboardColumnMapVO = task.taskboardColumnMapVO;
        this.taskboardColumns = [];

        for (let i = 0; i < task.taskboardColumnMapVO.length; i++) {
          this.taskboardColumns.push(task.taskboardColumnMapVO[i].taskboardColumnsVO);
          task.taskboardColumnMapVO[i].taskboardTaskVOList.forEach(element => {
            this.taskboardTaskVOList.push(element);
          });
        }

        if (this.taskIdFromUrl !== undefined && this.taskIdFromUrl !== null && this.taskIdFromUrl !== '') {
          this.openTaskDetailsDialog();
        }
      });
    });
  }

  viewArchivedTaskboardTask(taskboardId, taskId) {
    this.taskboardTaskVOList = [];
    this.taskIdFromUrl = taskId;
    this.taskboardService.getArchivedTaskboardDetails(taskboardId).subscribe(task => {
      this.viewTaskVO = task;
      this.taskboardService.getDoneTaskoardTask(taskboardId).subscribe(result => {

        this.viewTaskVO.taskboardColumnMapVO[this.viewTaskVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList = result;

        this.taskboardColumnMapVO = task.taskboardColumnMapVO;
        this.taskboardColumns = [];

        for (let i = 0; i < task.taskboardColumnMapVO.length; i++) {
          this.taskboardColumns.push(task.taskboardColumnMapVO[i].taskboardColumnsVO);
          task.taskboardColumnMapVO[i].taskboardTaskVOList.forEach(element => {
            this.taskboardTaskVOList.push(element);
          });
        }

        if (this.taskIdFromUrl !== undefined && this.taskIdFromUrl !== null && this.taskIdFromUrl !== '') {
          this.openTaskDetailsDialog();
        }
      });
    });
  }
  viewDeletedTaskboardTask(task, taskboardId, taskId) {

    this.taskboardTaskVOList = [];
    this.taskIdFromUrl = taskId;
    this.taskboardService.getDeletedTaskboardDetails(taskboardId).subscribe(response => {

      this.viewTaskVO = response;
      this.taskboardService.getDoneTaskoardTask(taskboardId).subscribe(result => {

        this.taskboardColumnMapVO = response.taskboardColumnMapVO;
        this.taskboardColumns = [];

        for (let i = 0; i < response.taskboardColumnMapVO.length; i++) {
          this.taskboardColumns.push(response.taskboardColumnMapVO[i].taskboardColumnsVO);
          response.taskboardColumnMapVO[i].taskboardTaskVOList.forEach(element => {
            this.taskboardTaskVOList.push(element);
          });
        }

        if (this.taskIdFromUrl !== undefined && this.taskIdFromUrl !== null && this.taskIdFromUrl !== '') {
          this.openTaskDetailsDialog();
        }
      });
    });
  }

  unArchiveTask(task) {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '400px',
      data: { type: 'taskUnArchive', taskDetails: task }
    });
    dialog.afterClosed().subscribe((data) => {
      if (data.status === 'yes') {
        this.taskboardService.unArchiveTask(task.id).subscribe(response => {
          if (response.response.includes('successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: response.response
            });
            if (this.isFromTaskboard) {
              this.paginationVO = this.getPaginationForTaskboard();
              this.paginationVO.taskboardId = this.taskboardId;
              this.paginationVO.filterColumnName = 'Archived';
              this.landingPageService.getDoneTaskoardTask(this.paginationVO).subscribe(result => {
                if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
                  this.taskboardVO = result.taskboardTaskVo;
                  for (let i = 0; i < this.taskboardVO.length; i++) {
                    if (this.taskboardVO[i].dueDate !== undefined && this.taskboardVO[i].dueDate !== null && this.taskboardVO[i].dueDate !== '') {
                      const date = new Date(this.taskboardVO[i].dueDate);
                      date.setDate(date.getDate() + 1);
                      this.taskboardVO[i].dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                      date.setDate(date.getDate() + 1);
                    }

                  }
                  this.taskboardLength = result.totalRecords;
                } else {
                  this.taskboardVO = [];
                  this.taskboardLength = 0;
                }
              });
            }
          }

        });
      }
      else {
        return;
      }
    });
  }
  unDeleteTask(task) {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '400px',
      data: { type: 'taskUnDelete', taskDetails: task }
    });
    dialog.afterClosed().subscribe((data) => {
      if (data.status === 'yes') {
        this.taskboardService.unDeleteTask(task.id).subscribe(response => {
          if (response.response.includes('successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: response.response
            });
            if (this.isFromTaskboard) {
              this.paginationVO = this.getPaginationForTaskboard();
              this.paginationVO.taskboardId = this.taskboardId;
              this.paginationVO.filterColumnName = 'deleted';
              this.landingPageService.getDoneTaskoardTask(this.paginationVO).subscribe(result => {
                if (result && result.taskboardTaskVo && result.taskboardTaskVo.length > 0) {
                  this.taskboardVO = result.taskboardTaskVo;
                  for (let i = 0; i < this.taskboardVO.length; i++) {
                    if (this.taskboardVO[i].dueDate !== undefined && this.taskboardVO[i].dueDate !== null && this.taskboardVO[i].dueDate !== '') {
                      const date = new Date(this.taskboardVO[i].dueDate);
                      date.setDate(date.getDate() + 1);
                      this.taskboardVO[i].dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
                      date.setDate(date.getDate() + 1);
                    }

                  }
                  this.taskboardLength = result.totalRecords;
                } else {
                  this.taskboardVO = [];
                  this.taskboardLength = 0;
                }
              });
            }
          }

        });
      }
      else {
        return;
      }
    });
  }

  openTaskDetailsDialog() {
    const taskDetails = this.taskboardTaskVOList.find(task => task.taskId === this.taskIdFromUrl && task.taskType === 'parentTask');
    if (this.columnStatus === 'deleted') {
      this.taskStatusType = 'deleted';

    }
    let item = null;
    if (this.columnStatus === 'Archived') {
      this.taskStatusType = 'Archived';
      if (taskDetails && taskDetails.previousStatus) {
        item = this.taskboardColumns.find(column => column.columnName === taskDetails.previousStatus);
        this.selectedColumn = item.columnName;
        const columnIndex = this.taskboardColumnMapVO.findIndex
          (column => column.taskboardColumnsVO.columnName === taskDetails.previousStatus);
        this.selectedColumnIndex = columnIndex;
      }
    }
    else {
      item = this.taskboardColumns.find(column => column.columnName === taskDetails.status);
      this.selectedColumn = item.columnName;
      const columnIndex = this.taskboardColumnMapVO.findIndex(column => column.taskboardColumnsVO.columnName === taskDetails.status);
      this.selectedColumnIndex = columnIndex;
    }



    if (this.viewTaskVO.isTaskBoardOwner) {
      item.taskboardColumnSecurity.read = true;
      item.taskboardColumnSecurity.delete = true;
      item.taskboardColumnSecurity.update = true;
    }

    if (item.taskboardColumnSecurity.read === true) {
      this.taskBoardTaskVO = taskDetails;
      const statusList: StatusList[] = [];
      this.taskboardColumnMapVO.forEach(column => {
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
      const selectedTaskIndex = this.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList.findIndex(column => column.id === this.taskBoardTaskVO.id);
      this.selectedTaskIndex = selectedTaskIndex;
      this.mappedTask = this.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList;
      let subStatus: string;
      if (this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus
        && this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus.length > 0) {
        subStatus = this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus[0].name;
      }

      const dialog = this.dialog.open(TaskboardFormDetailsComponent, {
        disableClose: false,
        // width: "1200px",
        // height: "620px",
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
          type: this.taskStatusType,
          subStatus
        },
      });
      dialog.afterClosed().subscribe((data) => {
        if (this.isFromTaskboard) {
          this.loadDoneTaskboardTableData();
        } else {
          this.loadTaskboardTableData();
        }
      });
    }

  }
  getColor(user) {
    const filteredUser = this.usersList.find(u => u.firstName + ' ' + u.lastName === user);
    return filteredUser?.color;
  }



  getTeamColor(team: string): string {
    const filteredTeam = this.groupList.find(t => t.groupName === team);
    return filteredTeam?.color;
  }

  getUserFirstAndLastNamePrefix(task) {
    let name = '';
    const array = task.split(' ');
    if (array[0] && array[1]) {
      name = array[0].charAt(0).toUpperCase() + array[1].charAt(0).toUpperCase();
    } else {
      name = array[0].charAt(0).toUpperCase();
    }
    return name;
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

  getUserNames(users: string[]) {
    let names = '';
    users.forEach(name => {
      if (names.length > 0) {
        names = ', ' + names + name;
      } else {
        names = names + name;
      }
    });
    return names;
  }

  getRemainingAssigneeUserCount(users: string[]) {
    return users.length - 4;
  }
  addWidget() {
    const dialog = this.dialog.open(AddWidgetComponent, {
      disableClose: true,
      width: '50%',
      height: '60%',

    });
    dialog.afterClosed().subscribe((data) => {
      if (data) {
        this.showWidgets = true;
        this.landingPageService.getWorkLoadChart().subscribe(res => {
          this.getWidget.series[0].data = res;
          this.showWorkload = true;
        });

      }
    });
  }

  setAllHandleTransform() {
    const rect = this.resizeBoxElement.getBoundingClientRect();
    this.setHandleTransform(this.dragHandleCornerElement, rect, 'both');
    this.setHandleTransform(this.dragHandleRightElement, rect, 'x');
    this.setHandleTransform(this.dragHandleBottomElement, rect, 'y');
  }

  setHandleTransform(
    dragHandle: HTMLElement,
    targetRect: ClientRect | DOMRect,
    position: 'x' | 'y' | 'both'
  ) {
    const dragRect = dragHandle.getBoundingClientRect();
    const translateX = targetRect.width - dragRect.width;
    const translateY = targetRect.height - dragRect.height;

    if (position === 'x') {
      dragHandle.style.transform = `translate(${translateX}px, 0)`;
    }

    if (position === 'y') {
      dragHandle.style.transform = `translate(0, ${translateY}px)`;
    }

    if (position === 'both') {
      dragHandle.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
  }

  dragMove(dragHandle: HTMLElement, $event: CdkDragMove<any>) {
    this.ngZone.runOutsideAngular(() => {
      this.resize(dragHandle, this.resizeBoxElement);
    });
  }

  resize(dragHandle: HTMLElement, target: HTMLElement) {
    const dragRect = dragHandle.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const width = dragRect.left - targetRect.left + dragRect.width;
    const height = dragRect.top - targetRect.top + dragRect.height;

    target.style.width = width + 'px';
    target.style.height = height + 'px';

    this.setAllHandleTransform();
  }
  ngAfterViewInit() {
    this.setAllHandleTransform();
  }
}
