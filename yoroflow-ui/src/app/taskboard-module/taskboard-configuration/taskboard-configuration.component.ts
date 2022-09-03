import { Component, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter, Input, HostListener, ChangeDetectionStrategy, Host } from '@angular/core';

import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProcessInstanceListVO } from '../../engine-module/ProcessInstanceListVO';
import { TaskboardConfigurationDialogComponent } from '../taskboard-configuration-dialog/taskboard-configuration-dialog.component';
import { TaskboardFormDetailsComponent } from '../taskboard-form-details/taskboard-form-details.component';
import { AssignTaskVO, AssignUserTaskVO, TaskboardLabelsVO, TaskboardTaskVO, UserVO } from '../taskboard-form-details/taskboard-task-vo';
import { ConfirmationDialogBoxComponentComponent } from '../../engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';

import { GroupByVO, ResolveSecurityForTaskboardVO, StatusList, SubStatusVO, TaskboardColumnMapVO, TaskboardColumns, TaskboardExcelVO, TaskboardSubStatusVO, TaskboardTaskLabelVO, TaskboardTemplateJson, TaskboardTemplatesVO, TaskboardVO, TaskSequenceVO } from './taskboard.model';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TaskBoardService } from './taskboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FormBuilder, FormGroup } from '@angular/forms';
import { GroupVO } from '../../designer-module/task-property/model/group-vo';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskboardSecurityComponent } from '../taskboard-security/taskboard-security.component';
import { EventAutomationComponent } from '../event-automation/event-automation.component';
import { AutomationVO, BoardGroups, EventAutomationVO } from '../event-automation/event-automation.model';
import { IntegrationDialogComponent } from '../integration-dialog/integration-dialog.component';
import { Page } from 'src/app/rendering-module/shared/vo/page-vo';
import { TableListVO, TableObjectsVO } from 'src/app/creation-module/table-objects/table-object-vo';
import { debounceTime, elementAt } from 'rxjs/operators';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { EventAutomationService } from '../event-automation/event-automation.service';
import { YoroFlowConfirmationDialogComponent } from 'src/app/designer-module/yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { CreateFormDialogComponent } from 'src/app/designer-module/create-form-dialog-box/create-form-dialog-box.component';
import { ConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { DragconfirmComponent } from '../dragconfirm/dragconfirm.component';
import { SecurityService } from '../taskboard-security/security.service';
import { SubStatusDialogComponent } from '../sub-status-dialog/sub-status-dialog.component';
import { MatChipInputEvent } from '@angular/material/chips';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { CompletedTasksComponent } from '../completed-tasks/completed-tasks.component';
import { UserService } from 'src/app/rendering-module/shared/service/user-service';
import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { MatSliderChange } from '@angular/material/slider';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TaskboardOwnerDialogComponent } from '../taskboard-owner-dialog/taskboard-owner-dialog.component';
import { id } from '@swimlane/ngx-charts';
import { threadId } from 'worker_threads';
import { PaginationVO } from 'src/app/mytasks-module/mytasks/pagination-vo';

// const nisPackage = require("../../package.json");

import { UserRoleService } from 'src/app/shared-module/services/user-role.service';
import { ThemeService } from 'src/app/services/theme.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { SprintDialogComponent } from '../sprint-dialog/sprint-dialog.component';
import { AddSprintComponent } from '../add-sprint/add-sprint.component';
import { SprintVO } from '../sprint-dialog/sprint-model';
import { D, F } from 'ngx-tethys/util';
import { forkJoin } from 'rxjs';
import { CreateOrganizationService } from 'src/app/creation-module/create-organization/create-organization.service';
import { saveAs } from 'file-saver';
import { TemplateCenterService } from 'src/app/engine-module/template-center/template-center.service';
import { TaskServiceService } from '../grid-view-task/task-service.service';
import { DateFilterComponent } from 'src/app/engine-module/date-filter/date-filter.component';

@Component({
  selector: 'app-taskboard-configuration',
  templateUrl: './taskboard-configuration.component.html',
  styleUrls: ['./taskboard-configuration.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(-90deg)' })),
      state('expandBoard', style({ transform: 'rotate(90deg)' })),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ],
})
export class TaskboardConfigurationComponent implements OnInit {
  spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent, any>;
  weeks = [];
  processInstanceList: ProcessInstanceListVO;
  connectedTo = [];
  assignee: [] = [];
  assigneejoin = '';
  headers = ['To do', 'In Progress', 'Done'];
  taskboardVO: TaskboardVO;
  taskboardColumns: any[] = [];
  container: any[] = [];
  taskId: string;
  showSelectedTaskBoard = false;
  subTaskArr = [];
  parentTaskArr = [];
  taskName = '';
  dueDate: any;
  currentDate: any;
  selectedTaskIndex: any;
  labels: any = [];
  comments: any = [];
  selectedColumnIndex: number;
  activeElement: any;
  hide = false;
  taskBoardTaskVO = new TaskboardTaskVO();
  currentStatus: string;
  taskPropertyForm: FormGroup;
  all = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  even = [10];
  colorArray: any[] = [];
  form: FormGroup;
  taskboardVoList: TaskboardVO[] = [];
  taskboardTaskVOList: TaskboardTaskVO[] = [];
  screenHeight: any;
  screenWidth: any;
  screenHeight1: any;
  screenScrollHeight: any;
  usersList: UserVO[] = [];
  groupList: GroupVO[] = [];
  completedState: any = {};
  setDueDate = false;
  currentDate1 = new Date();
  taskIdFromUrl: any;
  taskboardKey: any;
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  sub: any;
  checked = false;
  array: any = [];
  userName: string;
  remainigUsersLength: number;
  html: any;
  taskboardId: any = null;
  isTaskboardOwner = false;
  isTaskboardSecurityExist = true;
  isTaskboardRead = false;
  isTaskboardupdate = false;
  isTaskboardDelete = false;
  automationVO: AutomationVO[] = [];
  eventAutomations: EventAutomationVO[] = [];
  parentTask: any = [];
  subTask: any = [];
  filterTasks: any;
  dragDisable = false;
  userRoles: any;
  public config: PerfectScrollbarConfigInterface = {};
  selectedColumn: string;
  taskSequenceVo = new TaskSequenceVO();
  taskLabelVO = new TaskboardTaskLabelVO();
  sequenceNo: number[] = [];
  previousTask = new TaskboardTaskVO();
  showColumnColorCard = false;
  updateColumns = new TaskboardColumns();
  oldColumns = new TaskboardColumns();
  backgroundColor = '#ffffff';
  colorIndex: number;
  searchForm: FormGroup;
  filteredTaskboardList: TaskboardVO[] = [];
  show = true;
  publicAcess = false;
  showSubStatus = false;
  selectedTaskSubStatus: string;
  subStatusScrollHeight: number;
  assignTaskVO = new AssignTaskVO();
  licenseVO = new LicenseVO();
  selectedIndex: any;
  mappedTask: any;
  boardGroupsList: BoardGroups[] = [];
  boardUsersList: any[] = [];
  filterBoardUserList: any[] = [];
  filterBoardLabelList: any[] = [];
  selectedUsersList: UserVO[] = [];
  selectedLabelList: any[] = [];
  selectedPriorityList: any[] = [];
  statusList: any = [];
  newTaskLength: any = [];
  page = new Page();
  newLength: any;
  checkDone = false;
  userVo: any;
  taskFilterRequest: any;
  showView = 'board';
  doneColumnName: string;
  priorityArray: any[] = [
    { name: 'Urgent', color: 'red', isSelected: false },
    { name: 'High', color: 'orange', isSelected: false },
    { name: 'Medium', color: 'yellow', isSelected: false },
    { name: 'Low', color: '#37bdff', isSelected: false },
  ];

  filterPriorityList: any[] = [
    { name: 'Urgent', color: 'red', isSelected: false },
    { name: 'High', color: 'orange', isSelected: false },
    { name: 'Medium', color: 'yellow', isSelected: false },
    { name: 'Low', color: '#37bdff', isSelected: false },
  ];
  viewList: any[] = [
    { name: 'Board', color: 'orange', icon: 'auto_awesome_mosaic', isSelected: true, value: 'board', url: 'board-view' },
    { name: 'Grid', color: 'green', icon: 'view_list', isSelected: false, value: 'grid', url: 'grid-view' },
    { name: 'List', color: 'red', icon: 'format_list_bulleted', isSelected: false, value: 'list', url: 'list-view' },
    { name: 'Gantt', color: 'Navy', icon: 'clear_all', isSelected: false, value: 'gantt', url: 'gantt-view' }
  ];
  isUserRestricted = false;
  isAllAllowed = true;
  taskboardColumnVOList: TaskboardColumns[] = [];
  gridViewShow: boolean;
  listViewShow: boolean;
  scrollHeight: number;
  initialTaskboardVO = new TaskboardVO();
  pendingTaskboardDetails = new TaskboardVO();
  filteredColumnMapList: TaskboardColumnMapVO[] = [];

  sum = 0;
  throttle = 20;
  scrollDistance = 1;
  scrollUpDistance = 2;
  doneTaskList: TaskboardTaskVO[] = [];
  manualLength = true;
  initialLoad = false;
  endIndex = 0;
  filterTasksLoad = false;
  taskboardListScrollHeight: any;
  filterApplied = false;
  selectedSprint = new SprintVO();
  isFreePlan = true;
  assigneeIndex = 0;
  @Output() public filterAppliedAfterSwitch: EventEmitter<any> = new EventEmitter<any>();
  @Output() public sprintTasks: EventEmitter<TaskboardVO> = new EventEmitter<TaskboardVO>();
  @Output() public groupByEmitter: EventEmitter<string> = new EventEmitter<string>();
  width: any;
  userShow: boolean;
  isScroll = true;
  isEmptyTasks = false;
  sprintStatusList: any[] = [
    { name: 'In Preparation', value: 'p', color: '#87cefa' },
    { name: 'In Running', value: 'r', color: 'rgb(255, 209, 93)' },
    { name: 'Completed', value: 'c', color: '#20b2aa' }
  ];
  groupByName = 'Status';
  groupByList: any[] = [
    { name: 'Status', value: 'status', icon: 'unfold_more' },
    { name: 'Assignee', value: 'assignee', icon: 'group' },
    { name: 'Priority', value: 'priority', icon: 'flag' }
  ];
  filterByName = 'Created Date';
  filterByList: any[] = [
    { name: 'Created Date', value: 'createdDate' },
    { name: 'Start Date', value: 'startDate' },
    { name: 'Due Date', value: 'dueDate' }
  ];
  dateFilterName = 'All';
  startDate: string;
  endDate: string;
  dateFilterList: any[] = [
    { name: 'All', value: 'all' },
    { name: 'Between Dates', value: 'betweenDates' },
    { name: 'Today', value: 'today' },
    { name: 'Yesterday', value: 'yesterday' },
    { name: 'Last 7 Days', value: 'lastWeek' },
    { name: 'Last 30 Days', value: 'lastMonth' },
    { name: 'Last 60 Days', value: 'startDate' }
  ];

  groupByVO = new GroupByVO();

  // nisVersion = nisPackage.dependencies["ngx-infinite-scroll"];

  constructor(
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private taskboardService: TaskBoardService,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    public activateRoute: ActivatedRoute,
    private router: Router,
    private automationService: EventAutomationService,
    private securityService: SecurityService,
    private userService: UserService,
    private datepipe: DatePipe,
    private roleService: UserRoleService,
    public themeService: ThemeService,
    public workspaceService: WorkspaceService,
    private createOrganizationService: CreateOrganizationService,
    private templateCenterService: TemplateCenterService,
    private taskService: TaskServiceService
  ) {
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.themeService.layoutName === 'modern') {
      this.scrollHeight = Math.round((window.innerHeight - 192));
      // this.screenHeight = (window.innerHeight - 63) + "px";
      this.screenHeight = (window.innerHeight - 1) + 'px';
      this.screenWidth = (window.innerWidth - 63) + 'px';
      this.screenHeight1 = (window.innerHeight - 86) + 'px';
      // this.screenHeight1 = (window.innerHeight ) + "px";
      // this.screenScrollHeight = (window.innerHeight - 250) + "px";
      this.screenScrollHeight = (window.innerHeight - 63) + 'px';
      // this.subStatusScrollHeight = window.innerHeight - 250;
      this.subStatusScrollHeight = window.innerHeight;
      // this.taskboardListScrollHeight = (window.innerHeight - 214) + 'px';
      this.taskboardListScrollHeight = (window.innerHeight) + 'px';
      this.width = (window.innerWidth - 251);
    } else {
      this.scrollHeight = Math.round((window.innerHeight - 192));
      this.screenHeight = (window.innerHeight - 63) + 'px';
      this.screenWidth = (window.innerWidth - 63) + 'px';
      this.screenHeight1 = (window.innerHeight - 63) + 'px';
      this.screenScrollHeight = (window.innerHeight - 149) + 'px';
      this.subStatusScrollHeight = window.innerHeight - 250;
      this.taskboardListScrollHeight = (window.innerHeight - 214) + 'px';
      // this.width = (window.innerWidth/100)*84;
      this.width = (window.innerWidth - 251);
    }

    if (this.taskboardVO && this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
      for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
        if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus
          && this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length > 0) {
          const length = this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length;
          this.taskboardVO.taskboardColumnMapVO[i].containerHeight = (this.subStatusScrollHeight / length) - 30 + 'px';
          for (let j = 0; j < length; j++) {
            this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].border = '2.5px solid ' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].color;
          }
        }
      }
    }
  }

  @HostListener('scroll', ['$event'])
  scrollEvent(event: any): void {
    if (this.groupByName === 'Assignee') {
      if (Math.round(event.target.scrollLeft) + Math.round(event.target.offsetWidth) === Math.round(event.target.scrollWidth)) {
        this.setAssigneeGroupByHorizontal(1);
      }
    }
  }


  showRecycleTasks(taskboardVO: TaskboardVO) {

    const length = taskboardVO.taskboardColumns.length;
    const lastcolumnName = taskboardVO.taskboardColumns.find(name => name.columnOrder === length - 1);
    this.router.navigate([this.workspaceService.getWorkSpaceKey() +
      '/taskboard/completed-tasks/' + this.taskboardKey + '/' + this.taskboardVO.id + '/' + lastcolumnName.columnName]);

  }


  ngOnInit(): void {
    this.workspaceService.setHideHover(false);
    this.workspaceService.setHideSubMenu(true);
    this.workspaceService.setActiveElement('Taskboard');

    this.getUsers();
    this.searchForm = this.fb.group({
      search: [],
      searchTask: [],
      searchUser: [],
      searchLabel: [],
      searchPriority: [],
      isUnAssignedUser: [false],
      isNoLabel: [false],
      isNoPriority: [false],
      startDate: [],
      endDate: []
    });
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    this.activateRoute.paramMap.subscribe(params => {
      if (params.get('taskboard-key') !== undefined && params.get('taskboard-key') !== null) {
        this.taskboardKey = params.get('taskboard-key');
        this.taskboardService.getAlltaskboardNames().subscribe((data) => {
          this.filteredTaskboardList = data;
          this.taskboardVoList = data;
          this.taskboardVoList.forEach(b => { b.expanded = false; });
          this.checked = true;
          const index = this.taskboardVoList.findIndex(taskboard => taskboard.taskboardKey === params.get('taskboard-key'));
          this.taskboardVO = this.taskboardVoList[index];
          this.form.get('taskboard').setValue(this.taskboardVoList[index].id);
          if (params.get('task-id') !== undefined && params.get('task-id') !== null) {
            this.taskIdFromUrl = params.get('task-id');
            this.selectedTaskIndex = 'true';
          }
          this.selectedTaskboard(this.taskboardVO);
          if (this.taskboardVO && this.taskboardVO?.formId && this.taskboardVO?.version
            && this.taskboardVO?.id) {
            this.getPageFromTaskboard(this.taskboardVO?.formId, this.taskboardVO?.version);
            this.loadBoardUsers(this.taskboardVO?.id);
          }
        });
      } else {
        this.loadAllTaskboardNames();
      }
    });
    this.showSelectedTaskBoard = false;
    this.form = this.fb.group({
      taskboard: [],
      columnName: [],
      columnColor: [],
      isColumnBackground: []
    });
    this.loadUserAndGroupList();
    this.loadColumnColor();
    this.searchFormvalueChanges();
    this.searchUservalueChanges();
    this.searchLabelvalueChanges();
    this.searchPriorityValueChanges();
    this.getLoggedInUser();
    this.taskboardService.getUserLicenseForTaskboard().subscribe(data => {
      if (data.isAllowed === 'N') {
        this.isUserRestricted = true;
      } else {
        this.isUserRestricted = false;
      }
    });

    this.licenseVO.category = 'taskboards';
    this.licenseVO.featureName = 'user_restriction';
    this.taskboardService.isAllAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'N') {
        this.isAllAllowed = false;
      }
    });


    forkJoin([this.createOrganizationService.getOrgSubscription()]).subscribe(results => {
      if (results[0].planType === 'STARTER') {
        this.isFreePlan = true;
      } else {
        this.isFreePlan = false;
      }
    });

    if (window.location.href.includes('taskboard-template')) {
      this.saveTemplate(this.templateCenterService.json);
    }
  }

  setDateFilter(dateFilter: any): void {
    if (dateFilter.value === 'betweenDates') {
      const dialog = this.dialog.open(DateFilterComponent, {
        width: '330px',
        data: 'fromTaskboard'
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          this.searchForm.get('startDate').setValue(data.startDate);
          this.searchForm.get('endDate').setValue(data.endDate);
          this.dateFilterName = dateFilter.name;
          this.startDate = this.datePipe.transform(new Date(data.startDate));
          this.endDate = this.datePipe.transform(new Date(data.endDate));
          this.setDateFilterByInAssignTaskVO();
          if (this.showView === 'board') {
            // if (this.groupByName === 'Status') {
            //   this.setDateFilterByInAssignTaskVO();
            //   this.loadAssigneeFilter();
            // } else {
            this.filterApplied = true;
            this.setDateFilterByInGroupByVO();
            const groupBy = this.groupByList.find(g => g.name === this.groupByName);
            this.setGroupBy(groupBy, 0);
            // }
          } else {
            if (this.groupByName === 'Assignee') {
              this.taskService.loadAssigneeCombinationsWithFilter(this.taskboardVO);
            }
            this.filterAppliedAfterSwitch.emit(true);
          }
        }
      });
    } else {
      this.dateFilterName = dateFilter.name;
      this.searchForm.get('startDate').setValue(null);
      this.searchForm.get('endDate').setValue(null);
      this.setDateFilterByInAssignTaskVO();
      if (this.showView === 'board') {
        // if (this.groupByName === 'Status') {
        //   this.setDateFilterByInAssignTaskVO();
        //   this.loadAssigneeFilter();
        // } else {
        this.setDateFilterByInGroupByVO();
        const groupBy = this.groupByList.find(g => g.name === this.groupByName);
        this.filterApplied = true;
        this.setGroupBy(groupBy, 0);
        // }
      } else {
        if (this.groupByName === 'Assignee') {
          this.taskService.loadAssigneeCombinationsWithFilter(this.taskboardVO);
        }
        this.filterAppliedAfterSwitch.emit(true);
      }
    }
  }

  setFilterBy(filterBy: any): void {
    if (this.dateFilterName !== 'None') {
      this.filterByName = filterBy.name;
      this.assignTaskVO.filterType = this.dateFilterList.find(d => d.name === this.dateFilterName).value;
      this.assignTaskVO.filterBy = filterBy.value;
      this.assignTaskVO.startDate = this.searchForm.get('startDate').value;
      this.assignTaskVO.endDate = this.searchForm.get('endDate').value;
      this.assignTaskVO.taskboardId = this.taskboardVO.id;
      this.setDateFilterByInGroupByVO();
      if (this.showView === 'board') {
        // if (this.groupByName === 'Status') {
        //   this.setDateFilterByInAssignTaskVO();
        //   this.loadAssigneeFilter();
        // } else {
        this.setDateFilterByInGroupByVO();
        const groupBy = this.groupByList.find(g => g.name === this.groupByName);
        this.filterApplied = true;
        this.setGroupBy(groupBy, 0);
        // }
      } else {
        if (this.groupByName === 'Assignee') {
          this.taskService.loadAssigneeCombinationsWithFilter(this.taskboardVO);
        }
        this.filterAppliedAfterSwitch.emit(true);
      }
    }
  }

  setDateFilterByInAssignTaskVO(): void {
    if (this.dateFilterName !== 'None') {
      this.assignTaskVO.filterBy = this.filterByList.find(f => f.name === this.filterByName).value;
      this.assignTaskVO.filterType = this.dateFilterList.find(d => d.name === this.dateFilterName).value;
      this.assignTaskVO.startDate = this.searchForm.get('startDate').value;
      this.assignTaskVO.endDate = this.searchForm.get('endDate').value;
      this.assignTaskVO.taskboardId = this.taskboardVO.id;
    }
  }

  setDateFilterByInGroupByVO(): void {
    if (this.dateFilterName !== 'None') {
      this.groupByVO.filterBy = this.filterByList.find(f => f.name === this.filterByName).value;
      this.groupByVO.filterType = this.dateFilterList.find(d => d.name === this.dateFilterName).value;
      this.groupByVO.startDate = this.searchForm.get('startDate').value;
      this.groupByVO.endDate = this.searchForm.get('endDate').value;
      this.groupByVO.id = this.taskboardVO.id;
    }
  }

  loadAssigneeFilter(): void {
    if (this.taskFilterRequest) {
      this.taskFilterRequest.unsubscribe();
    }

    this.taskFilterRequest = this.taskboardService
      .getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
        this.filterApplied = true;
        this.initialLoad = false;
        this.pendingTaskboardDetails = new TaskboardVO();
        this.taskboardVO.taskboardColumnMapVO = data;
        this.filteredColumnMapList = data;
        this.endIndex = 0;
        // this.loadFilteredTasks();
        this.filterTasks = data;
        if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
          this.taskboardTaskVOList = [];
          for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
            if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
              for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
                this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
              }
            }
          }
        }
        this.loadSubStatusContainer();
        this.filterAppliedAfterSwitch.emit(true);
      });
  }

  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'modern') {
      this.scrollHeight = Math.round((window.innerHeight - 192));
      // this.screenHeight = (window.innerHeight - 63) + "px";
      this.screenHeight = (window.innerHeight - 1) + 'px';
      this.screenWidth = (window.innerWidth - 63) + 'px';
      this.screenHeight1 = (window.innerHeight - 86) + 'px';
      // this.screenHeight1 = (window.innerHeight ) + "px";
      // this.screenScrollHeight = (window.innerHeight - 250) + "px";
      this.screenScrollHeight = (window.innerHeight - 63) + 'px';
      // this.subStatusScrollHeight = window.innerHeight - 250;
      this.subStatusScrollHeight = window.innerHeight;
      // this.taskboardListScrollHeight = (window.innerHeight - 214) + 'px';
      this.taskboardListScrollHeight = (window.innerHeight) + 'px';
      this.width = (window.innerWidth - 251);
    } else {
      this.scrollHeight = Math.round((window.innerHeight - 192));
      this.screenHeight = (window.innerHeight - 63) + 'px';
      this.screenWidth = (window.innerWidth - 63) + 'px';
      this.screenHeight1 = (window.innerHeight - 63) + 'px';
      this.screenScrollHeight = (window.innerHeight - 149) + 'px';
      this.subStatusScrollHeight = window.innerHeight - 250;
      this.taskboardListScrollHeight = (window.innerHeight - 214) + 'px';
      // this.width = (window.innerWidth/100)*84;
      this.width = (window.innerWidth - 251);
    }
  }

  getUsers() {
    this.userRoles = this.roleService.getUserRoles();
    if (this.userRoles && this.userRoles.length === 1 && this.userRoles[0] === 'Guest') {
      this.dragDisable = true;
    }

  }

  setGroupBy(groupBy: any, index: number): void {
    this.groupByName = groupBy.name;
    this.groupByVO.groupBy = groupBy.value;
    this.groupByVO.id = this.taskboardVO.id;
    this.groupByVO.index = index;
    this.sum = index;
    this.filterApplied = true;
    if (this.selectedSprint?.sprintId) {
      this.groupByVO.sprintId = this.selectedSprint.sprintId;
    }
    this.groupByVO.isForCount = false;
    this.taskboardService.groupByTaskboard(this.groupByVO).subscribe(data => {
      if (data) {
        // if (this.groupByName !== 'Status') {
        this.getTasksCount();
        // }
        if (index === 0) {
          this.taskboardVO = data;
          if (this.groupByName === 'Status') {
            if (!this.selectedSprint?.sprintId) {
              this.doneColumnName = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.columnName;
              // this.taskboardService.getDoneTaskoardTask(this.taskboardVO.id).subscribe(result => {
              this.taskboardService.getDoneTaskWithGroupByVO(this.groupByVO).subscribe(result => {
                this.getDoneTaskCount();
                const donelength = result.length > 15 ? 15 : result.length;
                for (let i = 0; i < donelength; i++) {
                  this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList.push(result[i]);
                }
                const length = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus.length;
                for (let j = 0; j < length; j++) {
                  const taskList = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList.filter(task => task.subStatus === this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus[j].name);
                  this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus[j].taskLength = taskList.length;
                }
                this.doneTaskList = result;
                this.spinner.close();
              });
            }
          }
        } else {
          this.taskboardVO.taskboardColumnMapVO.forEach((columnMap, i) => {
            columnMap.taskboardTaskVOList.push(...data.taskboardColumnMapVO[i].taskboardTaskVOList);
          });
        }
        this.showSelectedTaskBoard = true;
        if (this.showView !== 'board' && this.showView !== 'gantt') {
          this.filterAppliedAfterSwitch.emit(true);
        }
        if (this.spinner) {
          this.spinner.close();
        }
        this.taskService.taskboardVO = this.taskboardVO;
        if (!this.selectedSprint?.sprintId) {
          this.taskService.sprintId = null;
        }
        this.connectedTo = [];
        this.taskboardColumns = [];
        for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
          this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
          if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus
            && this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length > 0) {
            for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length; j++) {
              this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].name + '-' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
            }
          }
          this.taskboardColumns.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO);
        }
        if (this.groupByName === 'Assignee') {
          this.taskService.loadAssigneeCombinationsWithFilter(this.taskboardVO);
        } else {
          this.taskService.loadAssigneeConmbinations();
        }
      }
    }, error => {
      this.filterApplied = false;
      if (this.spinner) {
        this.spinner.close();
      }
    });
  }

  getTasksCount(): void {
    this.groupByVO.isForCount = true;
    this.taskboardService.groupByTaskboard(this.groupByVO).subscribe(data => {
      if (data) {
        this.taskboardVO.taskboardColumnMapVO.forEach((columnMap) => {
          const index = data.taskboardColumnMapVO.
          findIndex(t => columnMap.taskboardColumnsVO.columnName === t.taskboardColumnsVO.columnName);
          const doneColumn = this.taskboardVO.taskboardColumns.find(c => c.isDoneColumn === true);
          if (index !== -1 && doneColumn && doneColumn.columnName !== columnMap.taskboardColumnsVO.columnName) {
            columnMap.taskboardColumnsVO.taskCount = data.taskboardColumnMapVO[index].taskboardColumnsVO.taskCount;
          }
        });
      }
    });
  }

  getDoneTaskCount(): void {
    this.taskboardService.getDoneTaskWithGroupByCount(this.groupByVO).subscribe(boardVO => {
      if (boardVO) {
        this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.taskCount = boardVO.doneTaskLength;
      }
    });
  }

  setAssigneeGroupByHorizontal(index) {
    this.groupByVO.assigneeIndex = this.groupByVO.assigneeIndex + index;
    this.groupByVO.isForCount = false;
    this.taskboardService.getAssigneeGroupTaskByHorizontal(this.groupByVO).subscribe(data => {
      if (data) {

        data.taskboardColumnMapVO.forEach(element => {
          this.taskboardVO.taskboardColumnMapVO.push(element);
        });
        this.getTasksCount();

        this.showSelectedTaskBoard = true;
        if (this.showView !== 'board' && this.showView !== 'gantt') {
          this.filterAppliedAfterSwitch.emit(true);
        }
        if (this.spinner) {
          this.spinner.close();
        }
        this.connectedTo = [];
        this.taskboardColumns = [];
        for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
          this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
          if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus
            && this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length > 0) {
            for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length; j++) {
              this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].name + '-' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
            }
          }
          this.taskboardColumns.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO);
        }
        this.taskService.loadAssigneeCombinationsWithFilter(this.taskboardVO);
      }
    }, error => {
      this.filterApplied = false;
      if (this.spinner) {
        this.spinner.close();
      }
    });

  }

  setAssigneeGroupByVertical() {
    this.groupByVO.index = this.sum;
    this.groupByVO.isForCount = false;
    this.taskboardService.getAssigneeGroupTaskByVertical(this.groupByVO).subscribe(data => {
      if (data) {

        this.taskboardVO.taskboardColumnMapVO.forEach((columnMap, i) => {
          columnMap.taskboardTaskVOList.push(...data.taskboardColumnMapVO[i].taskboardTaskVOList);
        });
        this.getTasksCount();

        this.showSelectedTaskBoard = true;
        if (this.showView !== 'board' && this.showView !== 'gantt') {
          this.filterAppliedAfterSwitch.emit(true);
        }
        if (this.spinner) {
          this.spinner.close();
        }
      }
    }, error => {
      this.filterApplied = false;
      if (this.spinner) {
        this.spinner.close();
      }
    });
  }

  setNullValues() {
    this.selectedUsersList = [];
    this.selectedLabelList = [];
    this.selectedPriorityList = [];
    this.searchForm.get('searchUser').setValue(null);
    this.searchForm.get('isUnAssignedUser').setValue(false);
    this.searchForm.get('isNoLabel').setValue(false);
    this.searchForm.get('searchTask').setValue('');
    this.searchForm.get('searchPriority').setValue('');
    this.searchForm.get('isNoPriority').setValue(false);
    this.isScroll = true;
    this.initialLoad = true;
    for (let i = 0; i < this.boardUsersList.length; i++) {
      this.boardUsersList[i].isSelected = false;
    }
    for (let j = 0; j < this.priorityArray.length; j++) {
      this.priorityArray[j].isSelected = false;
    }
    if (this.taskLabelVO.labels && this.taskLabelVO.labels.length > 0) {
      for (let i = 0; i < this.taskLabelVO.labels.length; i++) {
        this.taskLabelVO.labels[i].isSelected = false;
      }
    }
    this.filterBoardUserList = this.boardUsersList;
    this.filterBoardLabelList = this.taskLabelVO.labels;
    this.assignTaskVO.assignedUserIdList = [];
    this.assignTaskVO.taskboardLabelIdList = [];
    this.assignTaskVO.taskboardPriorityList = [];
    this.assignTaskVO.searchByTaskId = null;
    this.assignTaskVO.taskboardId = this.taskboardVO.id;
    this.assignTaskVO.isUnAssignedUser = this.searchForm.get('isUnAssignedUser').value;
    this.assignTaskVO.isNoLabel = this.searchForm.get('isNoLabel').value;
    this.assignTaskVO.isNoPriority = this.searchForm.get('isNoPriority').value;
    this.assignTaskVO.filterBy = null;
    this.assignTaskVO.filterType = null;
    this.assignTaskVO.startDate = null;
    this.assignTaskVO.endDate = null;
    this.groupByVO.assignedUserIdList = [];
    this.groupByVO.taskboardLabelIdList = [];
    this.groupByVO.taskboardPriorityList = [];
    this.groupByVO.isUnAssignedUser = this.searchForm.get('isUnAssignedUser').value;
    this.groupByVO.isNoLabel = this.searchForm.get('isNoLabel').value;
    this.groupByVO.isNoPriority = this.searchForm.get('isNoPriority').value;
    this.groupByVO.searchByTaskId = null;
    this.groupByVO.filterBy = null;
    this.groupByVO.filterType = null;
    this.groupByVO.startDate = null;
    this.groupByVO.endDate = null;
    this.dateFilterName = 'All';
    this.filterByName = 'Created Date';
  }


  setFilterNullBasedGroupBy(): void {
    if (this.groupByName === 'Priority') {
      this.searchForm.get('isNoPriority').setValue(false);
      this.groupByVO.isNoPriority = false;
      this.assignTaskVO.isNoPriority = false;
      this.groupByVO.taskboardPriorityList = [];
      this.assignTaskVO.taskboardPriorityList = [];
      this.selectedPriorityList = [];
      this.filterPriorityList.forEach(f => f.isSelected = false);
    } else if (this.groupByName === 'Assignee') {
      this.searchForm.get('isUnAssignedUser').setValue(false);
      this.groupByVO.isUnAssignedUser = false;
      this.assignTaskVO.isUnAssignedUser = false;
      this.groupByVO.assignedUserIdList = [];
      this.assignTaskVO.assignedUserIdList = [];
      this.selectedUsersList = [];
      this.filterBoardUserList.forEach(f => f.isSelected = false);
    }
  }

  changeGroupBy(groupBy: any, index: number): void {
    this.groupByName = groupBy.name;
    this.setFilterNullBasedGroupBy();
    this.groupByVO.groupBy = groupBy.value;
    this.groupByVO.id = this.taskboardVO.id;
    this.groupByVO.index = index;
    this.groupByVO.assigneeIndex = 0;
    this.sum = index;
    this.filterApplied = false;
    if (this.selectedSprint?.sprintId) {
      this.groupByVO.sprintId = this.selectedSprint.sprintId;
    }

    this.groupByVO.isForCount = false;
    this.groupByEmitter.emit(groupBy);
    if (this.showView === 'board') {
      this.taskboardService.groupByTaskboard(this.groupByVO).subscribe(data => {
        if (data) {
          if (index === 0) {
            this.taskboardVO = data;
            if (this.groupByName === 'Status') {
              if (!this.selectedSprint?.sprintId) {
                this.doneColumnName = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.columnName;
                // this.taskboardService.getDoneTaskoardTask(this.taskboardVO.id).subscribe(result => {
                this.taskboardService.getDoneTaskWithGroupByVO(this.groupByVO).subscribe(result => {
                  this.getDoneTaskCount();
                  const donelength = result.length > 15 ? 15 : result.length;
                  for (let i = 0; i < donelength; i++) {
                    this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList.push(result[i]);
                  }
                  const length = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus.length;
                  for (let j = 0; j < length; j++) {
                    const taskList = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList.filter(task => task.subStatus === this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus[j].name);
                    this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus[j].taskLength = taskList.length;
                  }
                  this.doneTaskList = result;
                  this.spinner.close();
                });
              }
            }
          } else {
            this.taskboardVO.taskboardColumnMapVO.forEach((columnMap, i) => {
              columnMap.taskboardTaskVOList.push(...data.taskboardColumnMapVO[i].taskboardTaskVOList);
            });
          }
          this.showSelectedTaskBoard = true;
          if (this.showView !== 'board' && this.showView !== 'gantt') {
            this.filterAppliedAfterSwitch.emit(true);
          }
          if (this.spinner) {
            this.spinner.close();
          }
          this.connectedTo = [];
          this.taskboardColumns = [];
          for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
            this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
            if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus
              && this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length > 0) {
              for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length; j++) {
                this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].name + '-' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
              }
            }
            this.taskboardColumns.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO);
          }
          // if (this.groupByName !== 'Status') {
          this.getTasksCount();
          // }
          if (this.groupByName === 'Assignee') {
            this.taskService.loadAssigneeCombinationsWithFilter(this.taskboardVO);
          } else {
            this.taskService.loadAssigneeConmbinations();
          }
        }
      }, error => {
        if (this.spinner) {
          this.spinner.close();
        }
      });
    }

  }

  deleteColumn(item) {
    if (this.taskboardVO && this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
      const index = this.taskboardVO.taskboardColumnMapVO.findIndex(t => t.taskboardColumnsVO.columnName === item.columnName);
      if (index !== -1) {
        if (this.taskboardVO.taskboardColumnMapVO[index].taskboardTaskVOList.length === 0) {
          const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
            disableClose: true,
            width: '430px',
            data: { type: 'delete-column', name: item.columnName },
          });
          dialog.afterClosed().subscribe(data => {
            if (data) {
              // this.taskboardService.removeColumn(item.id).subscribe(data => {
              //   if (data && data.response) {
              //     this.snackbar.openFromComponent(SnackbarComponent, {
              //       data: data.response,
              //     });
              //     if (data.response.includes('successfully')) {
              //       this.getTaskboardDetails(this.taskboardVO.id);
              //     }
              //   }
              // });
              if (this.taskboardVO.taskboardColumns.length > 3) {
                this.taskboardVO.removedColumnsIdList = [item.id];
                this.taskboardVO.taskboardColumns.splice(this.taskboardVO.taskboardColumns.findIndex(c => c.id === item.id), 1);
                this.taskboardVO.taskboardColumnMapVO.splice(this.taskboardVO.taskboardColumnMapVO.findIndex(c => c.taskboardColumnsVO.id === item.id), 1);
                this.taskboardVO.taskboardColumns.forEach((column, columnIndex) => {
                  column.columnOrder = columnIndex;
                  this.taskboardVO.taskboardColumnMapVO[columnIndex].taskboardColumnsVO.columnOrder = columnIndex;
                });
                this.taskboardService.posttaskConfiguration(this.taskboardVO).subscribe((resp) => {
                  if (resp.response.includes('Successfully')) {
                    if (data && data.response) {
                      this.snackbar.openFromComponent(SnackbarComponent, {
                        data: 'Column deleted successfully',
                      });
                      if (data.response.includes('Successfully')) {
                        this.loadTaskboardDetails();
                      }
                    }
                  }
                });
              } else {
                this.snackbar.openFromComponent(SnackbarComponent, {
                  data: 'Minimum three columns required'
                });
              }
            }
          });
        } else {
          const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
            disableClose: true,
            width: '500px',
            data: { type: 'delete-warning', name: item.columnName },
          });
        }
      }
    }
  }

  viewSelection(view: any, selectionFrom: string): void {
    this.viewList.forEach(views => {
      views.isSelected = false;
      if (window.location.href.includes(views.url)) {
        this.setViewUrl(view, views);
      }
    });
    view.isSelected = true;

    if (view.value === 'gantt') {
      if (this.isFreePlan === true) {
        const dialog = this.dialog.open(AlertmessageComponent, {
          width: '450px',
          data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
        });
      } else {
        this.showView = view.value;
        this.loadTaskboardColumn();
      }
    }
    if (view.value === 'grid' && selectionFrom === 'viewSelection') {
      this.gridViewShow = true;
      this.showView = view.value;
      // if (this.groupByName !== 'Status') {
      //   const groupBy = this.groupByList.find(g => g.name === this.groupByName);
      //   this.groupByVO.assigneeIndex = 0;
      //   this.setGroupBy(groupBy, 0);
      // }
    }
    if (view.value === 'list' && selectionFrom === 'viewSelection') {
      this.listViewShow = true;
      this.gridViewShow = true;
      this.showView = view.value;
      if (this.groupByName !== 'Status') {
        const groupBy = this.groupByList.find(g => g.name === this.groupByName);
        this.groupByVO.assigneeIndex = 0;
        this.setGroupBy(groupBy, 0);
      }
    }
    if (view.value === 'board') {
      this.showView = view.value;
      if (selectionFrom !== 'taskSelection' && !this.selectedSprint.sprintId && this.groupByName === 'Status') {
        this.taskboardVO.taskboardColumnMapVO = [];
        this.selectedTaskboard(this.taskboardVO);
      }
      if (this.groupByName !== 'Status') {
        const groupBy = this.groupByList.find(g => g.name === this.groupByName);
        this.groupByVO.assigneeIndex = 0;
        this.setGroupBy(groupBy, 0);
      }

    }
  }

  setViewUrl(selectedView: any, view: any): void {
    if (this.taskIdFromUrl === undefined || this.taskIdFromUrl === null || this.taskIdFromUrl === '') {
      window.history.pushState('', 'Title',
        this.workspaceService.getWorkSpaceKey() + '/' + 'task/taskboard/' + selectedView.url + '/' + this.taskboardVO.taskboardKey);
    } else {
      window.history.pushState('', 'Title',
        this.workspaceService.getWorkSpaceKey() + '/' + 'task/taskboard/' + selectedView.url + '/' + this.taskboardVO.taskboardKey
        + '/' + this.taskIdFromUrl);
    }
  }

  loadTaskboardColumn(): void {
    this.taskboardColumnVOList = [];
    this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
      this.taskboardColumnVOList.push(columnMap.taskboardColumnsVO);
    });
    this.gridViewShow = true;
  }

  loadView(view: string): void {
    this.showView = view;
    if (this.showView === 'board') {
      this.loadSubStatusContainer();
      this.filterTasks = this.taskboardVO;
      this.taskboardTaskVOList = [];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
        if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
          // tslint:disable-next-line:prefer-for-of
          for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
            this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
          }
        }
      }
    }
  }

  clearFilters() {
    this.setNullValues();
    // this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO).subscribe(data => {
    //   this.pendingTaskboardDetails = new TaskboardVO();
    //   this.taskboardVO.taskboardColumnMapVO = data;
    //   if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
    //     this.taskboardTaskVOList = [];
    //     for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
    //       if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
    //         for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
    //           this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
    //         }
    //       }
    //     }
    //   }
    //   this.loadSubStatusContainer();
    // });
    if (this.groupByName === 'Status') {
      if (this.showView === 'board') {
        this.loadTaskboardDetails();
      } else {
        this.filterAppliedAfterSwitch.emit(false);
      }
    } else {
      if (this.showView === 'board') {
        const groupBy = this.groupByList.find(g => g.name === this.groupByName);
        this.setGroupBy(groupBy, 0);
      } else {
        this.filterAppliedAfterSwitch.emit(false);
      }
    }
    this.filterApplied = false;
  }

  loadFilterUsers(): void {
    this.userShow = false;
    this.loadBoardUsers(this.taskboardVO.id);
  }

  loadBoardUsers(id) {
    this.boardUsersList = [];
    this.filterBoardUserList = [];
    this.boardGroupsList = [];
    this.securityService.getTaskboardSecurity(id).subscribe(data => {
      this.userShow = true;
      this.boardGroupsList = data.securityList;
      this.boardUsersList.forEach(user => {
        user.isSelected = false;
      });
      for (let i = 0; i < this.boardGroupsList.length; i++) {
        this.usersList.forEach(element => {
          element.groupVOList.forEach(group => {
            if (group.groupName === this.boardGroupsList[i].groupId) {
              this.boardUsersList.push(element);
            }
          });
        });
      }
      for (let i = 0; i < data.columnSecurityList.length; i++) {
        for (let j = 0; j < data.columnSecurityList[i].columnPermissions.length; j++) {
          this.usersList.forEach(element => {
            element.groupVOList.forEach(group => {
              if (group.groupName === data.columnSecurityList[i].columnPermissions[j].groupId) {
                this.boardUsersList.push(element);
              }
            });
          });
        }
      }
      for (let i = 0; i < data.taskboardOwner.length; i++) {
        const user = this.usersList.find(u => u.userId === data.taskboardOwner[i]);
        if (user) {
          this.boardUsersList.push(user);
        }
      }
      this.boardUsersList = this.boardUsersList.filter((v, i) => this.boardUsersList.findIndex(item => item.userId === v.userId) === i);
      this.boardUsersList.sort((a, b) =>
        a.firstName.localeCompare(b.firstName)
      );
      this.filterBoardUserList = this.boardUsersList;
    });
  }

  searchFormvalueChanges(): void {
    this.searchForm.get('search').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (let i = 0; i < this.taskboardVoList.length; i++) {
          const taskboardName = this.taskboardVoList[i].name.toLowerCase();
          if (taskboardName.includes(filterData)) {
            filterList.push(this.taskboardVoList[i]);
          }
        }
        this.filteredTaskboardList = filterList;
      } else {
        this.filteredTaskboardList = this.taskboardVoList;
      }
    });
  }




  searchUservalueChanges(): void {
    this.searchForm.get('searchUser').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (let i = 0; i < this.boardUsersList.length; i++) {
          const firstName = this.boardUsersList[i].firstName.toLowerCase();
          const lastName = this.boardUsersList[i].lastName.toLowerCase();
          if (firstName.includes(filterData) || lastName.includes(filterData)) {
            filterList.push(this.boardUsersList[i]);
          }
        }
        this.filterBoardUserList = filterList;
      } else {
        this.filterBoardUserList = this.boardUsersList;
      }
    });
  }



  searchLabelvalueChanges(): void {
    this.searchForm.get('searchLabel').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (let i = 0; i < this.taskLabelVO.labels.length; i++) {
          const labelName = this.taskLabelVO.labels[i].labelName.toLowerCase();
          if (labelName.includes(filterData)) {
            filterList.push(this.taskLabelVO.labels[i]);
          }
        }
        this.filterBoardLabelList = filterList;
      } else {
        this.filterBoardLabelList = this.taskLabelVO.labels;
      }
    });
  }

  searchPriorityValueChanges(): void {
    this.searchForm.get('searchPriority').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (let i = 0; i < this.priorityArray.length; i++) {
          const name = this.priorityArray[i].name.toLowerCase();
          if (name.includes(filterData)) {
            filterList.push(this.priorityArray[i]);
          }
        }
        this.filterPriorityList = filterList;
      } else {
        this.filterPriorityList = this.priorityArray;
      }
    });
  }

  getYPosition(e: Event): number {
    return (e.target as Element).scrollTop;
  }
  loadColumnColor() {
    this.form.get('columnColor').valueChanges.pipe(debounceTime(300)).subscribe(data => {
      if (data !== null && data !== '') {
        this.updateColumns.columnColor = this.form.get('columnColor').value;
        this.updateColumns.isColumnBackground = this.form.get('isColumnBackground').value;
        for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
          if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName === this.updateColumns.columnName) {
            this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnColor = this.updateColumns.columnColor;
          }
        }
      }
    });
  }

  setColor() {
    this.updateColumns.columnColor = this.form.get('columnColor').value;
    this.updateColumns.isColumnBackground = this.form.get('isColumnBackground').value;
    for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
      if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName === this.updateColumns.columnName) {
        this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnColor = this.updateColumns.columnColor;
      }
    }
  }
  saveColorChanges() {
    for (let i = 0; i < this.taskboardVO.taskboardColumns.length; i++) {
      if (this.taskboardVO.taskboardColumns[i].columnName === this.updateColumns.columnName) {
        this.taskboardVO.taskboardColumns[i].columnColor = this.updateColumns.columnColor;
      }
    }
    this.taskboardService.updateColumnColor(this.updateColumns).subscribe(data => {
      if (data.response.includes('Successfully')) {
        this.showColumnColorCard = false;
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: data.response
        });
      }
    });
  }


  dialogClose() {
    this.oldColumns = JSON.parse(JSON.stringify(this.oldColumns));
    for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
      if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName === this.oldColumns.columnName) {
        this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnColor = this.oldColumns.columnColor;
        this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.isColumnBackground = this.oldColumns.isColumnBackground;
      }
    }
    this.showColumnColorCard = false;
  }

  applyBackgroundColor($event) {
    if ($event.checked === true) {
      this.updateColumns.isColumnBackground = true;
      this.updateColumns.columnColor = this.form.get('columnColor').value;
      for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
        if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName === this.updateColumns.columnName) {
          this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnColor = this.updateColumns.columnColor;
        }

      }

    } else {
      this.updateColumns.isColumnBackground = false;
    }
  }

  loadUserAndGroupList() {
    this.taskboardService.getUserGroupList().subscribe((data) => {
      this.groupList = data;
    });
    this.taskboardService.getUsersList().subscribe((data) => {
      this.usersList = data;
      if (this.usersList.length > 0) {
        for (let i = 0; i < this.usersList.length; i++) {
          this.usersList[i].randomColor = this.getRandomColor();
          this.usersList[i].isSelected = false;
        }
      }
    });
  }


  loadAllTaskboardNames() {
    this.taskboardService.getAlltaskboardNames().subscribe((data) => {
      this.taskboardVoList = data;
      this.filteredTaskboardList = data;
      if (
        this.taskboardVO &&
        this.taskboardVO.name &&
        this.taskboardVoList.some((data) => data.name === this.taskboardVO.name)
      ) {
        this.form.get('taskboard').setValue(this.taskboardVO.id);
        this.activeElement = this.taskboardVO.name;
      }
      this.taskboardVoList.forEach(b => { b.expanded = false; });
    });
  }
  loadSubTaskList(taskboardVO) {
    for (let i = 0; i < taskboardVO.taskboardColumnMapVO.length; i++) {
      if (taskboardVO.taskboardColumnMapVO[i].taskboardTaskList && taskboardVO.taskboardColumnMapVO[i].taskboardTaskList.length) {
        taskboardVO.taskboardColumnMapVO[i].taskboardTaskList.forEach((element) => {
          if (element.taskType === 'parentTask') {
            this.parentTaskArr.push(element);
            this.parentTaskArr.forEach((res, index) => {
              this.taskName = res.taskName;
              this.comments = this.taskboardVO.taskComments;
            });
          }
        });
        for (let j = 0; j < this.taskboardTaskVOList.length; j++) {
          if (this.taskboardTaskVOList[j].taskType === 'parentTask') {
            this.taskboardTaskVOList[j].subTaskCount = 0;
            for (let i = 0; i < this.taskboardTaskVOList.length; i++) {
              if (
                this.taskboardTaskVOList[i].taskType === 'subtask' &&
                this.taskboardTaskVOList[i].parentTaskId ===
                this.taskboardTaskVOList[j].id
              ) {
                this.taskboardTaskVOList[j].subTaskCount =
                  this.taskboardTaskVOList[j].subTaskCount + 1;
              }
              const startDate = new Date(
                this.taskboardTaskVOList[i].startDate
              ).toDateString();
              const dueDate = new Date(
                this.taskboardTaskVOList[i].dueDate
              ).toDateString();
              const currentDate = new Date().toDateString();
              this.currentDate = this.datePipe.transform(
                new Date().toDateString(),
                'dd-MMM-yyyy'
              );
              this.dueDate = this.datePipe.transform(
                this.taskboardTaskVOList[i].dueDate,
                'dd-MMM-yyyy'
              );
            }
          }
        }
      }
    }
  }

  loadFilteredTasks(): void {
    const startIndex = this.endIndex;
    this.endIndex += 15;
    if (this.taskboardVO.taskboardColumnMapVO.length === 0) {
      this.filteredColumnMapList.forEach(columnMap => {
        const columnMapVo = new TaskboardColumnMapVO();
        columnMapVo.taskboardColumnsVO = columnMap.taskboardColumnsVO;
        this.taskboardVO.taskboardColumnMapVO.push(columnMapVo);
      });
    }
    this.filteredColumnMapList.forEach(columnMap => {
      const columnMapVO = new TaskboardColumnMapVO();
      for (let i = startIndex; i < this.endIndex; i++) {
        // if (i = 0) {
        //   columnMapVO.taskboardTaskVOList = [];
        // }
        if (columnMap.taskboardTaskVOList[i]) {
          columnMapVO.taskboardTaskVOList.push(columnMap.taskboardTaskVOList[i]);
        }
      }
      const filteredColumnMap = this.taskboardVO.taskboardColumnMapVO.find(map => map.taskboardColumnsVO.columnName === columnMap.taskboardColumnsVO.columnName);
      // filteredColumnMap.taskboardTaskVOList=
    });
  }

  getTaskboardTaskById() {
    if (this.assignTaskVO.assignedUserIdList.length > 0) {
      this.assignTaskVO.assignedUserIdList = this.assignTaskVO.assignedUserIdList;
    }
    if (this.assignTaskVO.taskboardLabelIdList.length > 0) {
      this.assignTaskVO.taskboardLabelIdList = this.assignTaskVO.taskboardLabelIdList;
    }
    this.assignTaskVO.taskboardId = this.taskboardVO.id;
    this.assignTaskVO.isUnAssignedUser = this.searchForm.get('isUnAssignedUser').value;
    this.assignTaskVO.isNoLabel = this.searchForm.get('isNoLabel').value;
    this.assignTaskVO.searchByTaskId = this.searchForm.get('searchTask').value;
    this.filterApplied = true;

    // if (this.groupByName === 'Status') {
    //   this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
    //     this.filterApplied = true;
    //     this.initialLoad = false;

    //     this.pendingTaskboardDetails = new TaskboardVO();
    //     this.taskboardVO.taskboardColumnMapVO = data;
    //     this.filteredColumnMapList = data;
    //     this.endIndex = 0;
    //     // this.loadFilteredTasks();
    //     if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
    //       this.taskboardTaskVOList = [];
    //       for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
    //         if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
    //           for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
    //             this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
    //           }
    //         }
    //       }
    //     }
    //     this.loadSubStatusContainer();
    //     this.filterAppliedAfterSwitch.emit(true);
    //   });
    // } else {
    if (this.showView === 'board') {
      this.groupByVO.assignedUserIdList = this.assignTaskVO.assignedUserIdList;
      this.groupByVO.taskboardLabelIdList = this.assignTaskVO.taskboardLabelIdList;
      this.groupByVO.id = this.assignTaskVO.taskboardId;
      this.groupByVO.isUnAssignedUser = this.assignTaskVO.isUnAssignedUser;
      this.groupByVO.isNoLabel = this.assignTaskVO.isNoLabel;
      this.groupByVO.searchByTaskId = this.assignTaskVO.searchByTaskId;
      const groupBy = this.groupByList.find(g => g.name === this.groupByName);
      this.setGroupBy(groupBy, 0);
    } else {
      this.filterAppliedAfterSwitch.emit(true);
    }
    // }
  }


  getTaskboardTaskByUser(user) {
    if (this.searchForm.get('searchTask').value === '') {
      this.assignTaskVO.searchByTaskId = null;
    }
    if (this.assignTaskVO.assignedUserIdList.length > 0) {
      const index = this.assignTaskVO.assignedUserIdList.findIndex(t => t === user.userId);
      if (index !== -1) {
        user.isSelected = false;
        this.assignTaskVO.assignedUserIdList.splice(index, 1);
        const userIndex = this.selectedUsersList.findIndex(t => t.userId === user.userId);
        this.selectedUsersList.splice(userIndex, 1);
      } else {
        user.isSelected = true;
        this.assignTaskVO.assignedUserIdList.push(user.userId);
        this.selectedUsersList.push(user);
      }
    } else {
      user.isSelected = true;
      this.assignTaskVO.assignedUserIdList.push(user.userId);
      this.selectedUsersList.push(user);
    }
    this.assignTaskVO.taskboardId = this.taskboardVO.id;
    this.assignTaskVO.isUnAssignedUser = this.searchForm.get('isUnAssignedUser').value;
    this.assignTaskVO.isNoLabel = this.searchForm.get('isNoLabel').value;
    this.filterApplied = true;

    // if (this.groupByName === 'Status') {
    //   if (this.taskFilterRequest) {
    //     this.taskFilterRequest.unsubscribe();
    //   }
    //   this.taskFilterRequest = this.taskboardService
    //     .getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
    //       this.filterApplied = true;
    //       this.initialLoad = false;
    //       this.pendingTaskboardDetails = new TaskboardVO();
    //       this.taskboardVO.taskboardColumnMapVO = data;
    //       this.filteredColumnMapList = data;
    //       this.endIndex = 0;
    //       // this.loadFilteredTasks();
    //       this.filterTasks = data;
    //       if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
    //         this.taskboardTaskVOList = [];
    //         for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
    //           if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
    //             for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
    //               this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);

    //             }
    //           }
    //         }
    //       }
    //       this.loadSubStatusContainer();
    //       this.filterAppliedAfterSwitch.emit(true);
    //     });
    // } else if (this.groupByName === 'Priority') {
    if (this.showView === 'board') {
      this.groupByVO.groupBy = 'priority';
      this.groupByVO.id = this.taskboardVO.id;
      this.groupByVO.index = 0;
      this.groupByVO.assignedUserIdList = this.assignTaskVO.assignedUserIdList;
      this.filterApplied = false;
      if (this.selectedSprint?.sprintId) {
        this.groupByVO.sprintId = this.selectedSprint.sprintId;
      }

      const groupBy = this.groupByList.find(g => g.name === this.groupByName);
      this.setGroupBy(groupBy, 0);
    } else {
      this.filterAppliedAfterSwitch.emit(false);
    }
    // }
  }

  getTaskboardTaskByPriority(priority) {
    if (this.searchForm.get('searchTask').value === '') {
      this.assignTaskVO.searchByTaskId = null;
    }

    if (priority != null) {
      if (this.assignTaskVO.taskboardPriorityList.length > 0) {
        const index = this.assignTaskVO.taskboardPriorityList.findIndex(t => t === priority.name);
        if (index !== -1) {
          priority.isSelected = false;
          this.assignTaskVO.taskboardPriorityList.splice(index, 1);
          const priorityIndex = this.selectedPriorityList.findIndex(t => t.name === priority.name);
          this.selectedPriorityList.splice(priorityIndex, 1);
        } else {
          priority.isSelected = true;
          this.assignTaskVO.taskboardPriorityList.push(priority.name);
          this.selectedPriorityList.push(priority);
        }
      } else {
        priority.isSelected = true;
        this.assignTaskVO.taskboardPriorityList.push(priority.name);
        this.selectedPriorityList.push(priority);
      }
    }

    this.assignTaskVO.taskboardId = this.taskboardVO.id;
    this.assignTaskVO.isUnAssignedUser = this.searchForm.get('isUnAssignedUser').value;
    this.assignTaskVO.isNoLabel = this.searchForm.get('isNoLabel').value;
    this.assignTaskVO.isNoPriority = this.searchForm.get('isNoPriority').value;
    this.filterApplied = true;

    // if (this.groupByName === 'Status') {
    //   if (this.taskFilterRequest) {
    //     this.taskFilterRequest.unsubscribe();
    //   }

    //   this.taskFilterRequest = this.taskboardService
    //     .getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
    //       this.filterApplied = true;
    //       this.initialLoad = false;
    //       this.pendingTaskboardDetails = new TaskboardVO();
    //       this.taskboardVO.taskboardColumnMapVO = data;
    //       this.filteredColumnMapList = data;
    //       this.endIndex = 0;
    //       // this.loadFilteredTasks();
    //       this.filterTasks = data;
    //       if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
    //         this.taskboardTaskVOList = [];
    //         for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
    //           if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
    //             for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
    //               this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
    //             }
    //           }
    //         }
    //       }
    //       this.loadSubStatusContainer();
    //       this.filterAppliedAfterSwitch.emit(true);
    //     });
    // } else if (this.groupByName === 'Assignee') {
    if (this.showView === 'board') {
      this.groupByVO.groupBy = 'assignee';
      this.groupByVO.id = this.taskboardVO.id;
      this.groupByVO.index = 0;
      this.groupByVO.taskboardPriorityList = this.assignTaskVO.taskboardPriorityList;
      this.groupByVO.isUnAssignedUser = this.assignTaskVO.isUnAssignedUser;
      this.groupByVO.isNoLabel = this.assignTaskVO.isNoLabel;
      this.groupByVO.isNoPriority = this.assignTaskVO.isNoPriority;
      this.filterApplied = false;
      if (this.selectedSprint?.sprintId) {
        this.groupByVO.sprintId = this.selectedSprint.sprintId;
      }
      const groupBy = this.groupByList.find(g => g.name === this.groupByName);
      this.setGroupBy(groupBy, 0);
    } else {
      this.filterAppliedAfterSwitch.emit(true);
    }
    // }

  }

  getTaskboardTaskByLabel(label) {
    if (this.searchForm.get('searchTask').value === '') {
      this.assignTaskVO.searchByTaskId = null;
    }
    if (this.assignTaskVO.taskboardLabelIdList.length > 0) {
      const index = this.assignTaskVO.taskboardLabelIdList.findIndex(t => t === label.taskboardLabelId);
      if (index !== -1) {
        label.isSelected = false;
        this.assignTaskVO.taskboardLabelIdList.splice(index, 1);
        const labelIndex = this.selectedLabelList.findIndex(t => t.taskboardLabelId === label.taskboardLabelId);
        this.selectedLabelList.splice(labelIndex, 1);
      } else {
        label.isSelected = true;
        this.assignTaskVO.taskboardLabelIdList.push(label.taskboardLabelId);
        this.selectedLabelList.push(label);
      }
    } else {
      label.isSelected = true;
      this.assignTaskVO.taskboardLabelIdList.push(label.taskboardLabelId);
      this.selectedLabelList.push(label);
    }
    this.assignTaskVO.taskboardId = this.taskboardVO.id;
    this.assignTaskVO.isUnAssignedUser = this.searchForm.get('isUnAssignedUser').value;
    this.assignTaskVO.isNoLabel = this.searchForm.get('isNoLabel').value;
    this.filterApplied = true;

    // if (this.groupByName === 'Status') {
    //   if (this.taskFilterRequest) {
    //     this.taskFilterRequest.unsubscribe();
    //   }
    //   this.taskFilterRequest = this.taskboardService
    //     .getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
    //       this.filterApplied = true;
    //       this.initialLoad = false;
    //       this.pendingTaskboardDetails = new TaskboardVO();
    //       this.taskboardVO.taskboardColumnMapVO = data;
    //       this.filteredColumnMapList = data;
    //       this.endIndex = 0;
    //       // this.loadFilteredTasks();
    //       this.filterTasks = data;
    //       if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
    //         this.taskboardTaskVOList = [];
    //         for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
    //           if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
    //             for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
    //               this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
    //             }
    //           }
    //         }
    //       }
    //       this.loadSubStatusContainer();
    //       this.filterAppliedAfterSwitch.emit(true);
    //     });

    // } else if (this.groupByName === 'Priority' || this.groupByName === 'Assignee') {
    if (this.showView === 'board') {
      if (this.groupByName === 'Priority') {
        this.groupByVO.groupBy = 'priority';
      } else if (this.groupByName === 'Assignee') {
        this.groupByVO.groupBy = 'assignee';
      }
      this.groupByVO.id = this.taskboardVO.id;
      this.groupByVO.index = 0;
      this.groupByVO.taskboardLabelIdList = this.assignTaskVO.taskboardLabelIdList;
      this.filterApplied = false;
      if (this.selectedSprint?.sprintId) {
        this.groupByVO.sprintId = this.selectedSprint.sprintId;
      }

      const groupBy = this.groupByList.find(g => g.name === this.groupByName);
      this.setGroupBy(groupBy, 0);
    } else {
      this.filterAppliedAfterSwitch.emit(true);
    }
    // }
  }

  getTaskboardTaskByUnassinedUser() {
    this.assignTaskVO.taskboardId = this.taskboardVO.id;
    this.assignTaskVO.isUnAssignedUser = this.searchForm.get('isUnAssignedUser').value;
    this.assignTaskVO.isNoLabel = this.searchForm.get('isNoLabel').value;
    this.filterApplied = true;

    // if (this.groupByName === 'Status') {
    //   if (this.taskFilterRequest) {
    //     this.taskFilterRequest.unsubscribe();
    //   }
    //   this.taskFilterRequest = this.taskboardService
    //     .getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
    //       this.filterApplied = true;
    //       this.initialLoad = false;
    //       this.taskboardVO.taskboardColumnMapVO = data;
    //       this.pendingTaskboardDetails = new TaskboardVO();
    //       this.filteredColumnMapList = data;
    //       this.endIndex = 0;
    //       // this.loadFilteredTasks();
    //       this.filterTasks = data;
    //       if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
    //         this.taskboardTaskVOList = [];
    //         for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
    //           if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
    //             for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
    //               this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
    //             }
    //           }
    //         }
    //       }
    //       this.loadSubStatusContainer();
    //       this.filterAppliedAfterSwitch.emit(true);
    //     });

    // } else if (this.groupByName === 'Priority') {
    if (this.showView === 'board') {
      this.groupByVO.groupBy = 'priority';
      this.groupByVO.id = this.taskboardVO.id;
      this.groupByVO.index = 0;
      this.groupByVO.isUnAssignedUser = this.assignTaskVO.isUnAssignedUser;
      this.groupByVO.isNoLabel = this.assignTaskVO.isNoLabel;
      this.filterApplied = false;
      if (this.selectedSprint?.sprintId) {
        this.groupByVO.sprintId = this.selectedSprint.sprintId;
      }

      const groupBy = this.groupByList.find(g => g.name === this.groupByName);
      this.setGroupBy(groupBy, 0);
    } else {
      this.filterAppliedAfterSwitch.emit(true);
    }
    // }
  }

  getTaskboardTaskWithOrWithoutLabels() {
    this.assignTaskVO.taskboardId = this.taskboardVO.id;
    this.assignTaskVO.isUnAssignedUser = this.searchForm.get('isUnAssignedUser').value;
    this.assignTaskVO.isNoLabel = this.searchForm.get('isNoLabel').value;
    this.filterApplied = true;

    // if (this.groupByName === 'Status') {
    //   if (this.taskFilterRequest) {
    //     this.taskFilterRequest.unsubscribe();
    //   }
    //   this.taskFilterRequest = this.taskboardService
    //     .getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
    //       this.filterApplied = true;
    //       this.initialLoad = false;
    //       this.pendingTaskboardDetails = new TaskboardVO();
    //       this.taskboardVO.taskboardColumnMapVO = data;
    //       this.filteredColumnMapList = data;
    //       this.endIndex = 0;
    //       // this.loadFilteredTasks();
    //       this.filterTasks = data;
    //       if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
    //         this.taskboardTaskVOList = [];
    //         for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
    //           if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
    //             for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
    //               this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
    //             }
    //           }
    //         }
    //       }
    //       this.loadSubStatusContainer();
    //       this.filterAppliedAfterSwitch.emit(true);
    //     });
    // } else if (this.groupByName === 'Priority' || this.groupByName === 'Assignee') {
    if (this.showView === 'board') {
      if (this.groupByName === 'Priority') {
        this.groupByVO.groupBy = 'priority';
      } else if (this.groupByName === 'Assignee') {
        this.groupByVO.groupBy = 'assignee';
      }
      this.groupByVO.id = this.taskboardVO.id;
      this.groupByVO.index = 0;
      this.groupByVO.isUnAssignedUser = this.assignTaskVO.isUnAssignedUser;
      this.groupByVO.isNoLabel = this.assignTaskVO.isNoLabel;
      this.filterApplied = false;
      if (this.selectedSprint?.sprintId) {
        this.groupByVO.sprintId = this.selectedSprint.sprintId;
      }

      const groupBy = this.groupByList.find(g => g.name === this.groupByName);
      this.setGroupBy(groupBy, 0);
    } else {
      this.filterAppliedAfterSwitch.emit(true);
    }
    // }
  }

  addItems(startIndex, endIndex): void {
    for (let i = startIndex; i < endIndex; ++i) {
      this.initialTaskboardVO.taskboardColumnMapVO.forEach(columnMap => {
        const taskboardColumnMapVO = this.taskboardVO.taskboardColumnMapVO.find(columnMapVO => columnMapVO.taskboardColumnsVO.columnName === columnMap.taskboardColumnsVO.columnName);
        if (taskboardColumnMapVO && columnMap.taskboardTaskVOList[i]) {
          taskboardColumnMapVO.taskboardTaskVOList.push(columnMap.taskboardTaskVOList[i]);
        }
      });
    }
  }

  onScrollDown(ev): void {

    // add another 20 items
    const start = this.sum;
    this.sum += 20;
    this.addItems(start, this.sum);

    // this.direction = "down";
  }

  loadTaskLength(columnIndex: number): number {
    let length = 0;
    if (this.pendingTaskboardDetails.taskboardColumnMapVO[columnIndex]?.taskboardTaskVOList?.length > 0) {
      const length1 = this.taskboardVO.taskboardColumnMapVO[columnIndex].taskboardTaskVOList.length;
      let length2: any;
      if (this.taskboardVO.taskboardColumnMapVO.length - 1 === columnIndex) {
        length = this.doneTaskList.length;
      } else {
        length2 = this.pendingTaskboardDetails.taskboardColumnMapVO[columnIndex].taskboardTaskVOList.length;
        length = length1 + length2;
      }
    } else {
      if (columnIndex === this.taskboardVO.taskboardColumnMapVO.length - 1) {
        length = this.doneTaskList.length;
      } else {
        length = this.taskboardVO.taskboardColumnMapVO[columnIndex].taskboardTaskVOList?.length;
      }
    }
    return length ? length : 0;
  }

  loadLabelFilters(): void {
    this.taskboardVO?.taskboardLabels?.labels?.forEach(param => {
      if (!this.filterBoardLabelList || this.filterBoardLabelList.length === 0 || !this.filterBoardLabelList.some(t => t.taskboardLabelId === param.taskboardLabelId && t.isSelected === true)) {
        param.isSelected = false;
      } else {
        param.isSelected = true;
      }
    });
    this.filterBoardLabelList = this.taskboardVO?.taskboardLabels?.labels;
  }

  selectedTaskboard(taskboard) {
    this.selectedSprint = new SprintVO();
    this.sum = 0;
    this.manualLength = true;
    this.initialLoad = true;
    this.isScroll = true;
    this.filterApplied = false;
    this.pendingTaskboardDetails = new TaskboardVO();
    this.searchForm.get('searchUser').setValue(null);
    this.searchForm.get('isUnAssignedUser').setValue(false);
    this.searchForm.get('isNoLabel').setValue(false);
    this.searchForm.get('searchTask').setValue('');
    this.searchForm.get('searchPriority').setValue('');
    for (let i = 0; i < this.boardUsersList.length; i++) {
      this.boardUsersList[i].isSelected = false;
    }
    for (let j = 0; j < this.priorityArray.length; j++) {
      this.priorityArray[j].isSelected = false;
    }
    this.taskboardColumns = [];
    this.selectedLabelList = [];
    this.filterBoardLabelList = [];
    this.filterBoardUserList = [];
    this.selectedUsersList = [];
    this.selectedPriorityList = [];
    this.activeElement = taskboard.name;
    this.isTaskboardSecurityExist = true;
    this.taskboardVO = this.taskboardVoList.find(taskboardVO => taskboardVO.id === taskboard.id);
    this.taskboardKey = this.taskboardVO.taskboardKey;
    let selectedView = this.viewList.find(view => window.location.href.includes(view.url));
    selectedView = selectedView ? selectedView.url : 'board-view';
    if (this.taskIdFromUrl === undefined || this.taskIdFromUrl === null || this.taskIdFromUrl === '') {
      window.history.pushState('', 'Title',
        this.workspaceService.getWorkSpaceKey() +
        this.workspaceService.getWorkSpaceKey() + '/' + 'task/taskboard/' + selectedView + '/' + this.taskboardVO.taskboardKey);
    } else {
      window.history.pushState('', 'Title',
        this.workspaceService.getWorkSpaceKey() +
        this.workspaceService.getWorkSpaceKey() + '/' + 'task/taskboard/' + selectedView + '/' + this.taskboardVO.taskboardKey
        + '/' + this.taskIdFromUrl);
    }

    this.showSelectedTaskBoard = false;
    this.taskboardTaskVOList = [];
    this.gridViewShow = false;
    this.spinnerDialog();
    this.assignTaskVO = new AssignTaskVO();
    this.dateFilterName = 'All';
    this.filterByName = 'Created Date';
    // if (this.groupByName === 'Status') {
    //   this.taskboardVO = null;
    //   this.taskboardService.getTaskboardDetailsByType(taskboard.id, 0).subscribe((data) => {
    //     this.taskboardVO = data;
    //     this.loadSelectedView();
    //     this.taskService.taskboardVO = this.taskboardVO;
    //     this.taskService.sprintId = null;
    //     this.taskService.loadAssigneeConmbinations();
    //     this.showSelectedTaskBoard = true;
    //     this.doneColumnName = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.columnName;
    //     if (this.showView === 'board') {
    //       this.taskboardService.getDoneTaskoardTask(this.taskboardVO.id).subscribe(result => {
    //         const donelength = result.length > 15 ? 15 : result.length;
    //         for (let i = 0; i < donelength; i++) {
    //           this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO?.length - 1]?.taskboardTaskVOList.push(result[i]);
    //         }
    //         const length = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus.length;
    //         for (let j = 0; j < length; j++) {
    //           const taskList = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList.filter(task => task.subStatus === this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus[j].name);
    //           this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus[j].taskLength = taskList.length;
    //         }
    //         this.doneTaskList = result;
    //         this.spinner.close();
    //       });
    //     } else {
    //       this.spinner.close();
    //     }
    //     this.taskLabelVO = this.taskboardVO.taskboardLabels;
    //     this.taskLabelVO.labels.forEach(param => {
    //       param.isSelected = false;
    //     });
    //     this.filterBoardLabelList = this.taskLabelVO.labels;
    //     this.checkSecurity(data);
    //     this.taskboardId = data.id;
    //     this.isEmptyTaskboard();
    //     for (let i = 0; i < data.taskboardColumnMapVO.length; i++) {
    //       if (data.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
    //         for (let j = 0; j < data.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
    //           this.taskboardTaskVOList.push(data.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
    //         }
    //       }
    //     }

    //     for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
    //       if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus
    //         && this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length > 0) {
    //         const length = this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length;
    //         // const taskboardColumnMapVO = new TaskboardColumnMapVO();
    //         // taskboardColumnMapVO.taskboardColumnsVO = this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO;
    //         // taskboardColumnMapVO.taskboardTaskVOList = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList;
    //         // taskboardColumnMapVO.containerHeight = (this.subStatusScrollHeight / length) - 30 + 'px';
    //         // this.taskboardVO.taskboardColumnMapVO[i] = taskboardColumnMapVO;
    //         for (let j = 0; j < length; j++) {
    //           // this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].border = '2.5px solid ' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].color;
    //           const taskList = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.filter(task => task.subStatus === this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].name);
    //           this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].taskLength = taskList.length;
    //         }
    //       }
    //     }


    //     if (
    //       this.taskboardTaskVOList !== undefined &&
    //       this.taskboardTaskVOList !== null
    //     ) {
    //       for (let i = 0; i < this.taskboardTaskVOList.length; i++) {
    //         if (this.taskboardTaskVOList[i].taskComments === null) {
    //           this.taskboardTaskVOList[i].taskComments = [];
    //         }
    //         if (this.taskboardTaskVOList[i].subTasks === null) {
    //           this.taskboardTaskVOList[i].subTasks = [];
    //         }
    //         if (this.taskboardTaskVOList[i].files === null) {
    //           this.taskboardTaskVOList[i].files = [];
    //         }
    //       }
    //     }
    //     this.loadSubTaskList(this.taskboardVO);

    //     for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
    //       this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
    //       if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus
    //         && this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length > 0) {
    //         for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length; j++) {
    //           this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].name + '-' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
    //         }
    //       }
    //       this.taskboardColumns.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO);
    //     }

    //     if (this.taskIdFromUrl !== undefined && this.taskIdFromUrl !== null && this.taskIdFromUrl !== '') {
    //       this.openTaskDeatilsFormDialog();
    //     }
    //     const length = this.taskboardColumns.length;
    //     this.completedState = this.taskboardColumns[length - 1];
    //   }, error => {
    //     this.snackbar.openFromComponent(SnackbarComponent, {
    //       data: 'Internal server error'
    //     });
    //     this.spinner.close();
    //   });
    // } else {
    this.groupByVO.assigneeIndex = 0;
    this.groupByVO.filterType = 'all';
    this.groupByVO.filterBy = 'createdDate';
    this.groupByVO.sprintId = null;
    const groupBy = this.groupByList.find(g => g.name === this.groupByName);
    this.setGroupBy(groupBy, 0);
    // this.showSelectedTaskBoard = true;
    // }
    // this.taskboardService.getTaskboardDetailsByType(taskboard.id, false).subscribe(taskboard => {
    //   let columnMapVO: TaskboardColumnMapVO[] = [];
    //   columnMapVO = taskboard.taskboardColumnMapVO;
    //   this.pendingTaskboardDetails = taskboard;
    //   // this.loadTasks(columnMapVO);
    //   // this.taskboardVO.taskboardColumnMapVO.
    // });
    this.currentStatus = null;
    if (taskboard && taskboard?.formId && taskboard?.version && taskboard?.id) {
      this.getPageFromTaskboard(taskboard?.formId, taskboard?.version);
      this.loadBoardUsers(taskboard?.id);
    }
  }


  loadSelectedView(): void {
    if (window.location.href.includes('taskboard/board-view/')) {
      this.showView = 'board';
      this.viewSelection(this.viewList[0], 'taskSelection');
    } else if (window.location.href.includes('taskboard/grid-view/')) {
      this.showView = 'grid';
      this.viewSelection(this.viewList[1], 'taskSelection');
    } else if (window.location.href.includes('taskboard/list-view/')) {
      this.showView = 'list';
      this.viewSelection(this.viewList[2], 'taskSelection');
    } else if (window.location.href.includes('taskboard/gantt-view/')) {
      this.showView = 'gantt';
      this.viewSelection(this.viewList[3], 'taskSelection');
    }
  }

  loadTasks(startIndex: number, endIndex: number): void {
    const length = this.taskboardVO.taskboardColumnMapVO.length - 1;
    if (this.sum === 0) {
      for (let j = 15; j < 25; j++) {
        if (this.doneTaskList[j]) {

          this.taskboardVO.taskboardColumnMapVO[length].taskboardTaskVOList.push(this.doneTaskList[j]);
          this.taskboardTaskVOList.push(this.doneTaskList[j]);
        }
      }
    }
    this.taskboardService.getTaskboardDetailsByType(this.taskboardVO.id, this.sum).subscribe((data) => {
      this.pendingTaskboardDetails = data;
      let count = 0;
      this.pendingTaskboardDetails?.taskboardColumnMapVO.forEach(columnMap => {
        if (columnMap.taskboardTaskVOList.length === 0) {
          count++;
        }
      });
      if (count === this.pendingTaskboardDetails.taskboardColumnMapVO.length) {
        this.isScroll = false;
      }
      const lengths: number[] = [];
      for (let i = length; i > 0; i--) {
        if (this.pendingTaskboardDetails?.taskboardColumnMapVO[i - 1]?.taskboardTaskVOList) {
          const length = this.pendingTaskboardDetails.taskboardColumnMapVO[i - 1].taskboardTaskVOList.length;
        }
        lengths.push(length);
      }
      for (let i = 0; i < length; i++) {
        this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.push(...this.pendingTaskboardDetails.taskboardColumnMapVO[i].taskboardTaskVOList);
      }
      // lengths.push(this.doneTaskList.length);
      // const max = lengths.reduce((a, b) => Math.max(a, b));
      // if (max <= endIndex) {
      //   this.manualLength = false;
      // }
      // for (let i = length; i > 0; i--) {
      //   const columnMap = this.taskboardVO.taskboardColumnMapVO[i - 1];
      //   if (this.pendingTaskboardDetails?.taskboardColumnMapVO[i - 1]?.taskboardTaskVOList) {
      //     const taskList = this.pendingTaskboardDetails.taskboardColumnMapVO[i - 1].taskboardTaskVOList;

      //   }
      //   for (let j = startIndex; j < endIndex; j++) {
      //     if (this.pendingTaskboardDetails?.taskboardColumnMapVO[i - 1]?.taskboardTaskVOList[j]) {
      //       columnMap.taskboardTaskVOList.push(this.pendingTaskboardDetails.taskboardColumnMapVO[i - 1].taskboardTaskVOList[j]);
      //       this.taskboardTaskVOList.push(this.pendingTaskboardDetails.taskboardColumnMapVO[i - 1].taskboardTaskVOList[j]);
      //     }
      //   }
      // }
    }, error => {
      this.sum -= 1;
    });
  }

  checkSecurity(taskboardVO: TaskboardVO) {
    if (taskboardVO && (taskboardVO.isTaskBoardOwner === false || taskboardVO.isTaskBoardOwner === null)) {
      if (taskboardVO.taskboardSecurity.read === false &&
        taskboardVO.taskboardSecurity.update === false &&
        taskboardVO.taskboardSecurity.delete === false) {
        this.isTaskboardSecurityExist = false;
      } else {
        this.isTaskboardSecurityExist = true;
      }
    } else {
      this.isTaskboardSecurityExist = true;
    }
  }
  getDueDate(i, j) {
    const dueDate = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j].dueDate;
    if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
      const date = new Date(dueDate);
      return date;
    }
  }

  getPageFromTaskboard(formId, version): void {
    // const spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
    //   disableClose: true,
    //   width: '100px',
    //   data: { type: 'spinner' },
    // });
    this.taskboardService.getTaskIdDetails(formId, version).subscribe(data => {
      this.page = data;
      this.gridViewShow = true;
      // this.spinner.close();
    }, error => {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: 'Internal server error'
      });
      // this.spinner.close();
    });
  }

  changeColumnColor(taskboardColumnsVO) {
    this.showColumnColorCard = true;
    this.updateColumns = taskboardColumnsVO;
    this.oldColumns = JSON.parse(JSON.stringify(taskboardColumnsVO));
    this.form.get('columnName').setValue(this.updateColumns.columnName);
    this.form.get('columnColor').setValue(this.updateColumns.columnColor);
    this.form.get('isColumnBackground').setValue(this.updateColumns.isColumnBackground);
  }

  getRandomColor() {
    return (
      '#' +
      ('000000' + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
    );
  }

  openRenameColumnDialog(item) {
    const dialog = this.dialog.open(TaskboardOwnerDialogComponent, {
      disableClose: true,
      width: '20',
      height: '10',
      data: {
        taskboardColumns: item,
        taskboardId: this.taskboardVO.id,
        type: 'rename-column'
      }
    });
    dialog.afterClosed().subscribe((taskData) => {
      if (taskData === true) {
        this.getTaskboardDetails(this.taskboardVO.id);
      }
    });
  }

  drop(event: CdkDragDrop<number[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  titleCase(str) {
    const assignee = str.split(' ');
    for (let i = 0; i < assignee.length; i++) {
      assignee[i] = assignee[i].charAt(0).toUpperCase();
    }
    return assignee.join('');
  }

  openDialog(): void {
    this.taskboardService.isAllowed().subscribe(data => {
      if (data.response.includes('exceeded')) {
        const dialog = this.dialog.open(AlertmessageComponent, {
          width: '450px',
          data: { licenseVO: data, pageName: 'Taskboard' }
        });
      } else {
        const configDialog = this.dialog.open(
          TaskboardConfigurationDialogComponent,
          {
            disableClose: true,
            width: '95%',
            maxWidth: '95%',
            height: '95%',
            panelClass: 'config-dialog',
            data: {
              pageName: 'Taskboard Configuration',
              showNewConfig: true,
              fromScratch: true,
              taskboardList: this.taskboardVoList
            },
          }
        );
        configDialog.afterClosed().subscribe((taskData) => {
          if (taskData && taskData.flag === true && taskData.taskVO) {
            if (!this.taskboardVO) {
              this.taskboardVO = new TaskboardVO();
            }
            this.taskboardVO.id = taskData.taskVO.id;
            this.loadTaskboardDetails();
            this.taskboardTaskVOList = [];
            this.loadAllTaskboardNames();
          }
        });
      }
    });
  }

  saveTemplate(taskData) {
    if (taskData && taskData.flag === true && taskData.taskVO) {
      if (!this.taskboardVO) {
        this.taskboardVO = new TaskboardVO();
      }
      this.taskboardVO.id = taskData.taskVO.id;
      this.loadTaskboardDetails();
      this.taskboardTaskVOList = [];
      this.loadAllTaskboardNames();
    }
  }


  openTaskboardPermissions() {
    if (!this.isAllAllowed) {
      const dialog = this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
      });
    } else {
      const taskSecurityDialog = this.dialog.open(TaskboardSecurityComponent, {
        disableClose: true,
        width: '850px',
        height: '550px',
        data: { id: this.taskboardVO.id, columns: this.taskboardColumns, securityType: 'task-security', groupList: this.groupList },
        panelClass: 'taskboard-security-container',
      });
      taskSecurityDialog.afterClosed().subscribe((data) => {
        if (data && data.boardUsers && data.boardUsers.length > 0) {
          this.boardUsersList = [];
          this.boardUsersList = data.boardUsers;
          for (let i = 0; i < this.boardUsersList.length; i++) {
            this.boardUsersList[i].randomColor = this.getRandomColor();
            this.boardUsersList[i].isSelected = false;
          }
          this.boardUsersList.sort((a, b) =>
            a.firstName.localeCompare(b.firstName)
          );
          this.filterBoardUserList = this.boardUsersList;
        }
      });
    }
  }

  openTaskboardColumnPermission(item) {
    const columnList = this.taskboardColumns.filter(column => column.columnName === item.columnName);
    const securityDialog = this.dialog.open(TaskboardSecurityComponent, {
      disableClose: true,
      width: '850px',
      height: '550px',
      data: { id: this.taskboardId, columns: columnList, securityType: 'task-column-security' },
      panelClass: 'taskboard-security-container',
    });
    securityDialog.afterClosed().subscribe((data) => {
      if (data && data.boardUsers && data.boardUsers.length > 0) {
        this.boardUsersList = [];
        this.boardUsersList = data.boardUsers;
        for (let i = 0; i < this.boardUsersList.length; i++) {
          this.boardUsersList[i].randomColor = this.getRandomColor();
          this.boardUsersList[i].isSelected = false;
        }
        this.boardUsersList.sort((a, b) =>
          a.firstName.localeCompare(b.firstName)
        );
        this.filterBoardUserList = this.boardUsersList;
      }
    });
  }


  opentaskConfig() {
    if (
      this.taskboardVO &&
      this.taskboardVO.taskboardColumns &&
      this.taskboardVO.taskboardColumns.length
    ) {
      // this.taskboardService
      //   .getTaskboardDetails(this.taskboardVO.id)
      //   .subscribe((data) => {
      //     this.taskboardVO = data;
      //     this.loadSubStatusContainer();
      //   });
      // this.loadTaskboardDetails();
      const configDialog = this.dialog.open(
        TaskboardConfigurationDialogComponent,
        {
          disableClose: true,
          width: '500px',
          height: '620px',
          panelClass: 'config-dialog',
          data: {
            pageName: 'Taskboard Configuration',
            selectedTaskboard: this.taskboardVO,
            showselection: true,
            showEditConfig: true,
            taskboardTaskVOList: this.taskboardTaskVOList,
            fromScratch: false,
            taskboardList: this.taskboardVoList
          },
        }
      );
      configDialog.afterClosed().subscribe((taskData) => {
        if (taskData && taskData.flag === true) {
          // this.getTaskboardDetails(taskData.taskVO.id);
          if (!this.taskboardVO) {
            this.taskboardVO = new TaskboardVO();
          }
          this.taskboardVO.id = taskData.taskVO.id;
          this.loadTaskboardDetails();
          this.taskboardTaskVOList = [];
          this.loadAllTaskboardNames();
        }
      });
    }

  }

  getTaskboardDetails(id) {

    this.taskboardService
      .getTaskboardDetails(id)
      .subscribe((data) => {
        this.taskboardVO = data;

        this.checkSecurity(data);
        this.taskboardId = data.id;
        for (let i = 0; i < data.taskboardColumnMapVO.length; i++) {
          if (data.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
            for (let j = 0; j < data.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
              this.taskboardTaskVOList.push(data.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
            }
          }
        }
        if (this.taskboardColumns) {
          this.taskboardColumns = [];
        }
        for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
          this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
          if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus
            && this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length > 0) {
            for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length; j++) {
              this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].name + '-' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
            }
          }
          this.taskboardColumns.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO);
        }
        this.taskboardService.getDoneTaskoardTask(this.taskboardVO.id).subscribe(result => {
          this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList = result;
        });
        if (this.taskboardVO.taskboardColumns.length) {
          for (
            let i = 0;
            i < this.taskboardVO.taskboardColumns.length;
            i++
          ) {
            this.connectedTo.push(
              this.taskboardVO.taskboardColumns[i].columnName
            );
            if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus
              && this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length > 0) {
              for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length; j++) {
                this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].name + '-' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
              }
            }
            if (i === 0) {
              const array = {
                columnName: this.taskboardVO.taskboardColumns[i]
                  .columnName,
              };
              this.container.push(array);
            } else {
              const array = {
                columnName: this.taskboardVO.taskboardColumns[i]
                  .columnName,
              };
              this.container.push(array);
            }
          }
        }
        this.loadAllTaskboardNames();
        this.loadSubStatusContainer();

      });

  }

  loadTaskboardDetails(): void {
    this.sum = 0;
    this.manualLength = true;
    this.isScroll = true;
    this.pendingTaskboardDetails = new TaskboardVO();
    // if (this.groupByName === 'Status') {
    //   if (!this.selectedSprint?.sprintId) {
    //     this.taskboardService.getTaskboardDetailsByType(this.taskboardVO.id, 0).subscribe(data => {
    //       this.taskboardVO = data;
    //       this.filterTasks = data;
    //       this.showSelectedTaskBoard = true;
    //       this.doneColumnName = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.columnName;
    //       this.taskboardService.getDoneTaskoardTask(this.taskboardVO.id).subscribe(result => {
    //         const donelength = result.length > 15 ? 15 : result.length;
    //         for (let i = 0; i < donelength; i++) {
    //           this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList.push(result[i]);
    //         }
    //         this.doneTaskList = result;
    //       });
    //     });
    //     // this.taskboardService.getTaskboardDetailsByType(this.taskboardVO.id, false).subscribe(taskboard => {
    //     //   this.pendingTaskboardDetails = taskboard;
    //     // });
    //   } else {
    //     let doneTasks: any;
    //     this.taskboardService.getSprintDoneTasks(this.selectedSprint.sprintId, this.taskboardVO.id).subscribe(data => {
    //       if (data && data?.length > 0) {
    //         doneTasks = data;
    //       }
    //     });
    //     this.taskboardService.getSprintTasks(this.selectedSprint.sprintId, this.taskboardVO.id, 0).subscribe(data => {
    //       if (data) {
    //         this.spinner.close();
    //         this.taskboardVO = data;
    //         this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList = doneTasks;
    //         this.sprintTasks.emit(this.taskboardVO);
    //         this.filterApplied = true;
    //         this.initialLoad = false;
    //       }
    //     }, error => {
    //       this.spinner.close();
    //     });
    //   }
    // } else {
    const groupBy = this.groupByList.find(g => g.name === this.groupByName);
    this.groupByVO.assigneeIndex = 0;
    this.setGroupBy(groupBy, 0);
    // }
    this.loadSubStatusContainer();
  }

  openTaskDeatilsFormDialog() {
    const taskDetails = this.taskboardTaskVOList.find(task => task.taskId === this.taskIdFromUrl);
    let status: string;
    if (taskDetails.taskType === 'parentTask') {
      status = taskDetails.status;
    } else {
      const task = this.taskboardTaskVOList.find(task => task.id === taskDetails.parentTaskId);
      status = task.status;
    }
    const item = this.taskboardColumns.find(column => column.columnName === status);
    this.selectedColumn = item.columnName;
    const columnIndex = this.taskboardVO.taskboardColumnMapVO.findIndex(column => column.taskboardColumnsVO.columnName === status);
    this.selectedColumnIndex = columnIndex;

    if (this.taskboardVO.isTaskBoardOwner) {
      item.taskboardColumnSecurity = new ResolveSecurityForTaskboardVO();
      item.taskboardColumnSecurity.read = true;
      item.taskboardColumnSecurity.delete = true;
      item.taskboardColumnSecurity.update = true;
    } else {
      item.taskboardColumnSecurity = this.taskboardVO.taskboardColumns.find(c => c.columnName === status).taskboardColumnSecurity;
    }
    if (item.taskboardColumnSecurity.read === true) {
      this.taskBoardTaskVO = taskDetails;
      const statusList: StatusList[] = [];
      this.taskboardVO.taskboardColumns.forEach(column => {
        const statusListVO = new StatusList();
        statusListVO.name = column.columnName;
        statusListVO.color = column.columnColor;
        if (column.subStatus && column.subStatus.length > 0) {
          statusListVO.subStatusList = column.subStatus;
          statusList.push(statusListVO);
        } else {
          statusListVO.subStatusList = [];
          statusList.push(statusListVO);
        }
      });
      if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
        this.taskboardTaskVOList = [];
        for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
          if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
            for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
              this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
            }
          }
        }
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
          taskName: this.taskboardVO.taskName,
          taskboardId: this.taskboardVO.id,
          taskboardColumnId: item.id,
          isTaskBoardOwner: this.taskboardVO.isTaskBoardOwner,
          taskboardColumnSecurity: item.taskboardColumnSecurity,
          taskboardVO: this.taskboardVO,
          taskboardList: this.taskboardVoList,
          sprintVO: this.selectedSprint,
          sprintSettingsVo: this.taskboardVoList.find(t => t.id === this.taskboardVO.id).sprintSettingsVo
        },
      });
      dialog.afterClosed().subscribe((data) => {
        this.isScroll = true;
        let selectedView = this.viewList.find(view => window.location.href.includes(view.url));
        selectedView = selectedView ? selectedView.url : 'board-view';
        window.history.pushState('', 'Title',
          this.workspaceService.getWorkSpaceKey() + '/' + 'task/taskboard/' + selectedView + '/' + this.taskboardVO.taskboardKey);
        this.taskIdFromUrl = null;
        // if (this.searchForm.get('searchTask').value === '' &&
        //   this.searchForm.get('isNoLabel').value === false &&
        //   this.searchForm.get('isUnAssignedUser').value === false &&
        //   this.searchForm.get('isNoPriority').value === false &&
        //   this.selectedUsersList.length === 0 &&
        //   this.selectedLabelList.length === 0 &&
        //   this.selectedPriorityList.length === 0) {
        //   this.loadTaskboardDetails();
        // } else {
        //   this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
        //     this.filterApplied = true;
        //     this.initialLoad = false;
        //     this.pendingTaskboardDetails = new TaskboardVO();
        //     this.taskboardVO.taskboardColumnMapVO = data;
        //     this.filteredColumnMapList = data;
        //     this.endIndex = 0;
        //     // this.loadFilteredTasks();
        //     this.filterTasks = data;

        //     if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
        //       this.taskboardTaskVOList = [];
        //       for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
        //         if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
        //           for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
        //             this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
        //           }
        //         }
        //       }
        //     }
        //     this.loadSubStatusContainer();
        //     this.filterAppliedAfterSwitch.emit(true);
        //   });
        // }
        const groupBy = this.groupByList.find(g => g.name === this.groupByName);
        this.groupByVO.assigneeIndex = 0;
        this.setGroupBy(groupBy, 0);
        if (data && data.taskDetails && data.taskDetails.taskData) {
          this.taskBoardTaskVO = data.taskDetails;

          if (this.selectedTaskIndex === undefined) {
            for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
              if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
                if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName = this.taskBoardTaskVO.status) {
                  this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.push(this.taskBoardTaskVO);
                }
              }
            }
            this.taskBoardTaskVO.id = data.id;
            this.taskboardTaskVOList.push(this.taskBoardTaskVO);
            if (this.taskboardVO.parentTaskLength === undefined || this.taskboardVO.parentTaskLength === null) {
              this.taskboardVO.parentTaskLength = 0;
            }
            this.taskboardVO.parentTaskLength = this.taskboardVO.parentTaskLength + 1;
          } else {
            const selectedTaskIndex = this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList.findIndex(column => column.id === this.taskBoardTaskVO.id);
            this.selectedTaskIndex = selectedTaskIndex;
            if (this.selectedColumn === this.taskBoardTaskVO.status) {
              this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex] = this.taskBoardTaskVO;
            }
          }
          this.comments = this.taskboardVO.taskComments;
          this.loadSubStatusContainer();
        }
        this.loadSubStatusContainer();
        const taskVOList: TaskboardTaskVO[] = [];
        for (let k = 0; k < this.taskboardVO.taskboardColumnMapVO[0].taskboardTaskVOList.length; k++) {
          const parentTask = this.taskboardVO.taskboardColumnMapVO[0].taskboardTaskVOList[k];
          if (parentTask.taskType === 'parentTask') {
            taskVOList.push(parentTask);
            for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[0].taskboardTaskVOList.length; j++) {
              const subTask = this.taskboardVO.taskboardColumnMapVO[0].taskboardTaskVOList[j];
              if (parentTask.id === subTask.parentTaskId) {
                parentTask.subTasks.forEach(param => {
                  if (param.id === subTask.id) {
                    taskVOList.push(subTask);
                  }
                });
              }
            }
          }
        }
        const taskList = this.taskboardVO.taskboardColumnMapVO[0];
        taskList.taskboardTaskVOList = taskVOList;
        for (let i = 0; i < taskList.taskboardTaskVOList.length; i++) {
          const taskSequenceNumber = { sequenceNumber: i, taskName: taskList.taskboardTaskVOList[i].taskName, taskId: taskList.taskboardTaskVOList[i].id };
          this.taskSequenceVo.taskSequenceNumber.push(taskSequenceNumber);
        }
        this.taskSequenceVo.taskboardId = this.taskboardVO.id;
        this.taskboardService.updateSequenceNumber(this.taskSequenceVo).subscribe();
      });


    }
  }

  resolveInitialValues(item, i, value, taskboardTask, taskboardColumnSecurity) {
    this.taskboardService.resolvetaskboardFields(this.taskboardVO.id).subscribe(data => {
      const taskboardTaskVO = new TaskboardTaskVO();
      taskboardTaskVO.id = null;
      taskboardTaskVO.status = item.columnName;
      taskboardTaskVO.taskboardId = this.taskboardVO.id;
      if (data && data.fieldMapping != null) {
        taskboardTaskVO.taskData = data.fieldMapping;
      }
      this.taskBoardTaskVO = taskboardTaskVO;
      this.openTaskDetailsDialog(item, i, value, taskboardTask, taskboardColumnSecurity);
    });
  }

  openTaskDetailsDialog(item, i, value, taskboardTask, taskboardColumnSecurity) {
    let columnName: string;
    if (taskboardTask === 'value') {
      columnName = this.taskboardVO.taskboardColumns[0].columnName;
    } else {
      columnName = taskboardTask.status;
    }
    if (this.taskboardVO.isTaskBoardOwner) {
      taskboardColumnSecurity = new ResolveSecurityForTaskboardVO();
      taskboardColumnSecurity.read = true;
      taskboardColumnSecurity.delete = true;
      taskboardColumnSecurity.update = true;
    } else {
      taskboardColumnSecurity = this.taskboardVO.taskboardColumns.find(c => c.columnName === columnName).taskboardColumnSecurity;
    }
    if (taskboardColumnSecurity.read === true) {
      if (this.taskBoardTaskVO === undefined || this.taskBoardTaskVO === null) {
        this.taskBoardTaskVO = new TaskboardTaskVO();
      }
      if (this.taskBoardTaskVO.taskType === 'subtask') {
        this.taskBoardTaskVO.status = this.taskBoardTaskVO.status;
      } else {
        this.taskBoardTaskVO.status = columnName;
      }
      this.taskBoardTaskVO.taskboardId = this.taskboardVO.id;
      if (value === 'task') {
        this.mappedTask = '';
        this.selectedTaskIndex = undefined;
        // const taskboardTaskVO = new TaskboardTaskVO();
        // taskboardTaskVO.id = null;
        // taskboardTaskVO.status = item.columnName;
        // taskboardTaskVO.taskboardId = this.taskboardVO.id;
        // this.taskBoardTaskVO = taskboardTaskVO;
        const array: any[] = [];
        if (
          this.taskboardTaskVOList === undefined ||
          this.taskboardTaskVOList === null ||
          this.taskboardTaskVOList.length > 0
        ) {
          for (let i = 0; i < this.taskboardTaskVOList.length; i++) {
            if (this.taskboardTaskVOList[i].taskType === 'parentTask') {
              array.push(this.taskboardTaskVOList[i]);
            }
          }
        }
        // if (array === undefined || array === null || array.length === 0) {
        //   this.taskBoardTaskVO.taskId = this.taskboardVO.generatedTaskId + "-001";
        // } else {
        // let count = Math.round(this.taskboardVO.parentTaskLength + 1);
        // if (this.taskboardVO.parentTaskLength < 9) {
        //   this.taskBoardTaskVO.taskId =
        //     this.taskboardVO.generatedTaskId + "-00" + count;
        // } else if (this.taskboardVO.parentTaskLength < 99) {
        //   this.taskBoardTaskVO.taskId =
        //     this.taskboardVO.generatedTaskId + "-0" + count;
        // } else {
        //   this.taskBoardTaskVO.taskId =
        //     this.taskboardVO.generatedTaskId + "-" + count;
        // }
        // }
        this.taskIdFromUrl = '/' + this.taskBoardTaskVO.taskId;
      }
      else {
        this.mappedTask = this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList;

        this.taskId = taskboardTask.id;
        this.taskBoardTaskVO = taskboardTask;
        this.taskIdFromUrl = '/' + taskboardTask.taskId;
      }
      let selectedView = this.viewList.find(view => window.location.href.includes(view.url));
      selectedView = selectedView ? selectedView.url : 'board-view';
      window.history.pushState('', 'Title',
        this.workspaceService.getWorkSpaceKey() + '/' + 'task/taskboard/' + selectedView + '/'
        + this.taskboardVO.taskboardKey + this.taskIdFromUrl);
      let color: string;
      if (this.taskBoardTaskVO.taskType === 'subtask' && value !== 'task') {
        const subtaskStatusColor = [{ color: '#87cefa', name: 'Todo' },
        { color: 'rgb(255, 209, 93)', name: 'Progress' },
        { color: '#20b2aa', name: 'Done' }];
        const subtask = subtaskStatusColor.find(subtask => subtask.name === this.taskBoardTaskVO.status);
        color = subtask.color;
      }
      else {
        color = item.columnColor;
      }
      let subStatus: string;
      if (value === 'task' && this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus
        && this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus.length > 0) {
        subStatus = this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus[0].name;
      }
      const statusList: StatusList[] = [];
      this.taskboardVO.taskboardColumns.forEach(column => {
        const statusListVO = new StatusList();
        statusListVO.name = column.columnName;
        statusListVO.color = column.columnColor;
        if (column.subStatus && column.subStatus.length > 0) {
          statusListVO.subStatusList = column.subStatus;
          statusList.push(statusListVO);
        } else {
          statusListVO.subStatusList = [];
          statusList.push(statusListVO);
        }
      });
      if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
        this.taskboardTaskVOList = [];
        for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
          if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
            for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
              this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
            }
          }
        }
      }
      const dialog = this.dialog.open(TaskboardFormDetailsComponent, {
        disableClose: false,
        // width: "1000px",
        // height: "620px",
        width: '95%',
        maxWidth: '95%',
        height: '95%',
        autoFocus: false,
        data: {
          taskDetails: this.taskBoardTaskVO,
          formId: this.taskboardVO.taskboardColumns[0].formId,
          status: this.taskBoardTaskVO.status,
          version: this.taskboardVO.taskboardColumns[0].version,
          color,
          statusList,
          taskList: this.taskboardTaskVOList,
          taskIndex: this.selectedTaskIndex,
          groupList: this.groupList,
          usersList: this.usersList,
          taskName: this.taskboardVO.taskName,
          taskboardId: this.taskboardVO.id,
          taskboardColumnId: item.id,
          isTaskBoardOwner: this.taskboardVO.isTaskBoardOwner,
          taskboardColumnSecurity,
          taskboardVO: this.taskboardVO,
          value,
          mappedColumnTaskList: this.mappedTask,
          subStatus,
          taskboardList: this.taskboardVoList,
          sprintVO: this.selectedSprint,
          sprintSettingsVo: this.taskboardVoList.find(t => t.id === this.taskboardVO.id).sprintSettingsVo
        },
      });
      dialog.afterClosed().subscribe((data) => {
        this.isScroll = true;
        // if(data){
        let selectedView = this.viewList.find(view => window.location.href.includes(view.url));
        selectedView = selectedView ? selectedView.url : 'board-view';
        window.history.pushState('', 'Title',
          this.workspaceService.getWorkSpaceKey() + '/' + 'task/taskboard/' + selectedView + '/' + this.taskboardVO.taskboardKey);
        // window.history.pushState('', 'Title', 'task/taskboard/board-view/' + this.taskboardVO.taskboardKey);
        this.taskIdFromUrl = null;
        // if (this.searchForm.get('searchTask').value === '' &&
        //   this.searchForm.get('isNoLabel').value === false &&
        //   this.searchForm.get('isUnAssignedUser').value === false &&
        //   this.searchForm.get('isNoPriority').value === false &&
        //   this.selectedUsersList.length === 0 &&
        //   this.selectedLabelList.length === 0 &&
        //   this.selectedPriorityList.length === 0) {
        //   this.loadTaskBySequence(i);
        //   this.loadTaskboardDetails();
        // } else {
        //   if (this.groupByName === 'Status') {
        //     this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
        //       this.filterApplied = true;
        //       this.initialLoad = false;
        //       this.pendingTaskboardDetails = new TaskboardVO();
        //       this.taskboardVO.taskboardColumnMapVO = data;
        //       this.filteredColumnMapList = data;
        //       this.endIndex = 0;
        //       // this.loadFilteredTasks();
        //       this.filterTasks = data;

        //       if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
        //         this.taskboardTaskVOList = [];
        //         for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
        //           if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
        //             for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
        //               this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
        //             }
        //           }
        //         }
        //       }
        //       this.loadSubStatusContainer();
        //       this.loadTaskBySequence(i);
        //       this.filterAppliedAfterSwitch.emit(true);
        //     });
        //   } else {
        const groupBy = this.groupByList.find(g => g.name === this.groupByName);
        this.groupByVO.assigneeIndex = 0;
        this.setGroupBy(groupBy, 0);
        //   }
        // }
        if (data && data.taskDetails && data.taskDetails.taskData && data.taskDetails.taskType === 'parentTask') {

          this.taskBoardTaskVO = data.taskDetails;
          if (this.selectedTaskIndex === undefined) {

            for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
              if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName === this.taskBoardTaskVO.status) {

                this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.push(this.taskBoardTaskVO);
              }
            }
            this.taskBoardTaskVO.id = data.id;
            this.taskboardTaskVOList.push(this.taskBoardTaskVO);
            if (
              this.taskboardVO.parentTaskLength === undefined ||
              this.taskboardVO.parentTaskLength === null
            ) {
              this.taskboardVO.parentTaskLength = 0;
            }
            this.taskboardVO.parentTaskLength =
              this.taskboardVO.parentTaskLength + 1;
          } else {

            if (this.selectedColumn === this.taskBoardTaskVO.status) {
              this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex] = this.taskBoardTaskVO;
            }
          }
          this.comments = this.taskboardVO.taskComments;
          this.loadSubStatusContainer();
        }
        else if (this.taskBoardTaskVO.taskType === 'subtask') {
          this.taskBoardTaskVO = data?.taskDetails;
          this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex] = this.taskBoardTaskVO;

        }
        this.loadSubStatusContainer();
        // }
      });

    }

  }

  loadTaskBySequence(i: number) {
    this.taskSequenceVo.taskSequenceNumber = [];
    const taskVOList: TaskboardTaskVO[] = [];
    const taskList = this.taskboardVO.taskboardColumnMapVO[i];
    if (this.taskboardVO.isTaskBoardOwner) {
      for (let k = 0; k < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; k++) {
        const parentTask = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[k];
        if (parentTask.taskType === 'parentTask') {
          taskVOList.push(parentTask);
          for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
            const subTask = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j];
            if (parentTask.id === subTask.parentTaskId) {
              parentTask.subTasks.forEach(param => {
                if (param.id === subTask.id) {
                  taskVOList.push(subTask);
                }
              });
            }
          }
        }
      }
      taskList.taskboardTaskVOList = taskVOList;
    }
    for (let i = 0; i < taskList.taskboardTaskVOList.length; i++) {
      const taskSequenceNumber = {
        sequenceNumber: i, taskName: taskList.taskboardTaskVOList[i].taskName,
        taskId: taskList.taskboardTaskVOList[i].id
      };
      this.taskSequenceVo.taskSequenceNumber.push(taskSequenceNumber);
    }
    this.taskSequenceVo.taskboardId = this.taskboardVO.id;
    this.taskboardService.updateSequenceNumber(this.taskSequenceVo).subscribe(data => {
      this.loadSubStatusContainer();
    });
  }

  getUserName(user) {
    const index = this.usersList.findIndex(
      (users) => users.userId === user.assigneeUser
    );
    return (
      'Assigned To ' +
      this.usersList[index]?.firstName +
      ' ' +
      this.usersList[index]?.lastName
    );
  }

  getUserNameForOwner(user) {
    const index = this.usersList.findIndex(
      (users) => users.userId === user.userId
    );
    return (this.usersList[index]?.firstName +
      ' ' +
      this.usersList[index]?.lastName
    );
  }

  getUserColor(user): string {
    const index = this.usersList.findIndex(
      (users) => users.userId === user.assigneeUser
    );
    return this.usersList[index]?.color;
  }

  getUserFirstAndLastNamePrefix(user) {
    const index = this.usersList.findIndex(
      (users) => users.userId === user.assigneeUser
    );
    const firstName = this.usersList[index]?.firstName.charAt(0).toUpperCase();
    const lastName = this.usersList[index]?.lastName.charAt(0).toUpperCase();
    if (firstName && lastName) {
      return firstName + lastName;
    } else {
      return;
    }
  }

  getUserFirstAndLastNamePrefixForUser(user) {
    const index = this.usersList.findIndex(
      (users) => users.userId === user.userId
    );
    const firstName = this.usersList[index]?.firstName.charAt(0).toUpperCase();
    const lastName = this.usersList[index]?.lastName.charAt(0).toUpperCase();
    if (firstName && lastName) {
      return firstName + lastName;
    } else {
      return;
    }
  }

  getUserNamePrefix(userName): string {
    if (userName.includes(' ')) {
      const splitName = userName.split(' ', 2);
      if (splitName) {
        return splitName[0]?.charAt(0).toUpperCase() + splitName[1]?.charAt(0).toUpperCase();
      }
    } else {
      return 'UA';
    }
  }

  getUserNameForAssigneeColumn(userName): string {
    return userName === 'Unassigned' ? userName : 'Assigned to ' + userName;
  }

  getRemainingUserNamesForAssigneeColumn(userList): string {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < userList.length; i++) {
      if (i > 4) {
        if (userNames === null) {
          userNames = 'Assigned To ' + userList[i].name + ', ';
        } else {
          userNames = userNames + userList[i].name + ', ';
        }
      }
    }
    return userNames;
  }

  getUsernamesFromUserFieldList(userList) {
    const array = [];
    for (let i = 0; i < userList.length; i++) {
      array.push(userList[i]);
    }
    return array;
  }

  getRemainingAssigneeUserCount(assigneeUsers: AssignUserTaskVO[]) {
    // const array = [];
    // for (let i = 0; i < assigneeUsers.length; i++) {
    //   const index = this.usersList.findIndex(
    //     (users) => users.userId === assigneeUsers[i].assigneeUser
    //   );
    //   array.push(this.usersList[index]);
    // }
    if (assigneeUsers.length > 4) {
      return assigneeUsers.length - 4;
    }
  }

  getRemainingAssigneeUsersList(assigneeUsers: AssignUserTaskVO[]) {
    const array = [];
    for (let i = 0; i < assigneeUsers.length; i++) {
      const index = this.usersList.findIndex(
        (users) => users.userId === assigneeUsers[i].assigneeUser
      );
      array.push(this.usersList[index]);
    }
    return array;
  }

  getRemainingUsersCount(usersList) {
    if (usersList.length > 4) {
      return usersList.length - 4;
    }
  }

  getUserNamesForOwner(usersList) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < usersList.length; i++) {
      if (i > 4) {
        const index = this.usersList.findIndex(users => users.userId === usersList[i].userId);
        if (userNames === null) {
          userNames = this.usersList[index].firstName + ' ' + this.usersList[index].lastName;
        }
      }
    }
    return userNames;
  }

  getUserNames(assigneeUsers: AssignUserTaskVO[]) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < assigneeUsers.length; i++) {
      if (i > 3) {
        const index = this.usersList.findIndex(
          (users) => users.userId === assigneeUsers[i].assigneeUser
        );
        if (userNames === null) {
          userNames =
            'Assigned To ' +
            this.usersList[index].firstName +
            ' ' +
            this.usersList[index].lastName +
            ', ';
        } else {
          userNames =
            userNames +
            this.usersList[index].firstName +
            ' ' +
            this.usersList[index].lastName +
            ', ';
        }
      }
    }
    return userNames;
  }

  dropped(event, item, i) {
    if (this.groupByName === 'Status') {
      this.checkDone = false;
      const currentIndex = event.currentIndex;
      const previousIndex = event.previousIndex;
      this.taskSequenceVo.taskSequenceNumber = [];
      let task = this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex];
      if (this.selectedColumnIndex !== i) {
        if (task.taskType === 'parentTask') {
          const columnLength = this.taskboardVO.taskboardColumns.length;
          const doneColumn = this.taskboardVO.taskboardColumns.find(x => x.columnOrder === columnLength - 1);
          const subTask = this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex]
            .taskboardTaskVOList[this.selectedTaskIndex].subTasks;
          this.spinnerDialog();
          this.taskboardService.getCheckWaitingOn(task.id).subscribe(data => {
            this.spinner.close();
            if (data && data.id) {
              task = data;
              // var filteredTasks = task.taskDependenciesVO.waitingOn.filter(t => t.status !== doneColumn.columnName || (t.taskType === 'subtask' && t.status !== 'Done'));
              if (task.taskDependenciesVO?.waitingOn &&
                doneColumn.columnName === item.taskboardColumnsVO.columnName &&
                task.taskDependenciesVO?.waitingOn && task.taskDependenciesVO?.waitingOn.length > 0
                && task.taskDependenciesVO?.waitingOn.length > 0) {
                const dialog = this.dialog.open(DragconfirmComponent, {
                  disableClose: true,
                  width: '400px',
                  maxHeight: '550px',
                  data: { type: 'dependency', dependency: task.taskDependenciesVO.waitingOn, taskId: task.taskId },
                });
                dialog.afterClosed().subscribe(d => {
                  return;
                });
              } else if (doneColumn.columnName === item.taskboardColumnsVO.columnName &&
                task.subTasks !== null && task.subTasks.length > 0) {
                // if (doneColumn.columnName === item.taskboardColumnsVO.columnName &&
                //   subTask !== undefined && subTask !== null && subTask.length !== 0 && subTask.some(ele => ele.status !== 'Done')) {
                const subtasks = task.subTasks;
                this.checkDone = true;
                const dialog = this.dialog.open(DragconfirmComponent, {
                  disableClose: true,
                  width: '400px',
                  data: {
                    type: 'subtask', pendingSubTaskCount: subtasks.length,
                    taskId: this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex].taskId
                  },
                });
                dialog.afterClosed().subscribe(data => {
                  return;
                });
              } else {
                this.checkDone = false;
                this.previousTask.status = item.taskboardColumnsVO.columnName;
                item.taskboardTaskVOList.push(this.previousTask);

                this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList.splice(this.selectedTaskIndex, 1);
                const taskList = JSON.parse(JSON.stringify(this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList));
                const spliceIndexs = [];
                for (let i = 0; i < taskList.length; i++) {
                  this.previousTask.subTasks?.forEach(ele => {
                    if (ele.id === this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[i].id) {
                      item.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[i]);
                      spliceIndexs.push(i);

                    }
                  });
                }
                for (let i = spliceIndexs.length; i > 0; i--) {
                  this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList.splice(spliceIndexs[i - 1], 1);
                }
                if (this.checkDone === false) {
                  this.previousTask.subStatus = null;
                  this.taskboardService.setTaskBoardStatus(this.previousTask).subscribe(data => {
                    if (data.response.includes('Successfully')) {
                      this.loadTaskBySequence(i);
                      this.loadTaskBySequence(this.selectedColumnIndex);
                      // if (this.selectedColumnIndex === this.taskboardVO.taskboardColumns.length - 1) {
                      //   this.doneTaskList.splice(this.doneTaskList.findIndex(t=>t.id===this.previousTask.id),1);
                      // }
                      // if (this.searchForm.get('searchTask').value === '' &&
                      //   this.searchForm.get('isNoLabel').value === false &&
                      //   this.searchForm.get('isUnAssignedUser').value === false &&
                      //   this.searchForm.get('isNoPriority').value === false &&
                      //   this.selectedUsersList.length === 0 &&
                      //   this.selectedLabelList.length === 0 &&
                      //   this.selectedPriorityList.length === 0) {
                      //   this.loadTaskboardDetails();
                      // } else {
                      //   this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
                      //     this.filterApplied = true;
                      //     this.initialLoad = false;
                      //     this.pendingTaskboardDetails = new TaskboardVO();
                      //     this.taskboardVO.taskboardColumnMapVO = data;
                      //     this.filteredColumnMapList = data;
                      //     this.endIndex = 0;
                      //     // this.loadFilteredTasks();
                      //     this.filterTasks = data;

                      //     if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
                      //       this.taskboardTaskVOList = [];
                      //       for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
                      //         if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
                      //           for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
                      //             this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
                      //           }
                      //         }
                      //       }
                      //     }
                      //     this.loadSubStatusContainer();
                      //     this.filterAppliedAfterSwitch.emit(true);
                      //   });
                      // }
                      this.groupByVO.assigneeIndex = 0;
                      const groupBy = this.groupByList.find(g => g.name === this.groupByName);
                      this.setGroupBy(groupBy, 0);
                    }
                  });
                }
              }
            }
          });
        }
      }
      else if (this.selectedColumnIndex === i) {
        if (this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[currentIndex].taskType !== 'subtask'
          && this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[previousIndex].taskType !== 'subtask') {
          if (task.taskType === 'parentTask') {
            if (currentIndex !== previousIndex) {
              const taskList = this.taskboardVO.taskboardColumnMapVO[i];
              const columns = JSON.parse(JSON.stringify(taskList.taskboardTaskVOList));
              const currentIndexColumn = taskList.taskboardTaskVOList[previousIndex];
              if (previousIndex > currentIndex) {
                for (let i = 0; i < previousIndex + 1; i++) {
                  if (i > currentIndex) {
                    taskList.taskboardTaskVOList[i] = columns[i - 1];
                  } else if (i === currentIndex) {
                    taskList.taskboardTaskVOList[i] = currentIndexColumn;
                  }
                }
              } else {
                for (let i = currentIndex; i >= previousIndex; i--) {
                  if (i < currentIndex) {
                    taskList.taskboardTaskVOList[i] = columns[i + 1];
                  } else if (i === currentIndex) {
                    taskList.taskboardTaskVOList[i] = currentIndexColumn;
                  }
                }
              }
              this.loadTaskBySequence(i);
            }
          }

        } else {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: 'Parent task cannot be swapped with sub Task',
          });
        }
        this.loadSubStatusContainer();
      }
    } else {
      if (this.selectedColumnIndex !== i) {
        const task = this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex];
        this.spinnerDialog();
        this.taskboardService.getTaskboardTask(task.id, null).subscribe(data => {
          if (this.groupByName === 'Assignee') {
            const taskVO = new TaskboardTaskVO();
            taskVO.id = task.id;
            const assignTaskVO = new AssignTaskVO();
            if (data.assignTaskVO && data.assignTaskVO?.assigneeUserTaskList?.length > 0) {
              data.assignTaskVO?.assigneeUserTaskList.forEach(a => {
                assignTaskVO.removedAssigneeList.push(a.id);
              });
            }
            if (item?.taskboardColumnsVO.columnName !== 'Unassigned') {
              item?.taskboardColumnsVO?.userFieldList.forEach(u => {
                assignTaskVO.assigneeUserTaskList.push({ id: null, assigneeUser: u.id });
              });
            }
            taskVO.assignTaskVO = assignTaskVO;
            this.taskboardService.saveAssigneeUser(taskVO).subscribe(data => {
              this.groupByVO.assigneeIndex = 0;
              const groupBy = this.groupByList.find(g => g.name === this.groupByName);
              this.setGroupBy(groupBy, 0);
            }, err => {
              this.spinner.close();
            });
          } else {
            const taskVO = new TaskboardTaskVO();
            taskVO.id = task.id;
            taskVO.priority = item?.taskboardColumnsVO.columnName === 'No Priority' ? '' : item?.taskboardColumnsVO.columnName;
            this.taskboardService.savePriority(taskVO).subscribe(data => {
              this.groupByVO.assigneeIndex = 0;
              const groupBy = this.groupByList.find(g => g.name === this.groupByName);
              this.setGroupBy(groupBy, 0);
            }, err => {
              this.spinner.close();
            });
          }
        }, error => {
          this.spinner.close();
        });
      } else if (this.selectedColumnIndex === i) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: 'You can swap the task while applying group by status filter only'
        });
      }
    }
  }

  handleSubStatus(subStatus: SubStatusVO): void {
    if (subStatus.collapse === undefined || subStatus.collapse === null || subStatus.collapse === false) {
      subStatus.collapse = true;
    } else {
      subStatus.collapse = false;
    }
  }

  droppedSubStatus(event: any, item: TaskboardColumnMapVO, i: number, subStatus: SubStatusVO): void {
    if (this.selectedTaskSubStatus === undefined
      || this.selectedTaskSubStatus === null
      || this.selectedTaskSubStatus !== subStatus.name
      || (this.selectedColumn !== item.taskboardColumnsVO.columnName && this.selectedTaskSubStatus === subStatus.name)) {
      const columnLength = this.taskboardVO.taskboardColumns.length;
      const doneColumn = this.taskboardVO.taskboardColumns.find(x => x.columnOrder === columnLength - 1);
      const subTask = this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex].subTasks;
      let task = this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex];
      this.spinnerDialog();
      this.taskboardService.getCheckWaitingOn(task.id).subscribe(data => {
        this.spinner.close();
        if (data && data.id) {
          task = data;
          // const filteredTasks = task.taskDependenciesVO.waitingOn.filter(taskVo => taskVo.status !== doneColumn.columnName
          //   || (taskVo.taskType === 'subtask' && taskVo.status !== 'Done'));
          if (doneColumn.columnName === item.taskboardColumnsVO.columnName
            && task.taskDependenciesVO?.waitingOn && task.taskDependenciesVO.waitingOn.length > 0 &&
            task.taskDependenciesVO.waitingOn && task.taskDependenciesVO.waitingOn.length > 0) {
            const dialog = this.dialog.open(DragconfirmComponent, {
              disableClose: true,
              width: '400px',
              maxHeight: '550px',
              data: {
                type: 'dependency', dependency:
                  task.taskDependenciesVO.waitingOn,
                taskId: task.taskId
              },
            });
            dialog.afterClosed().subscribe(data1 => {
              return;
            });
          } else if (doneColumn.columnName === item.taskboardColumnsVO.columnName &&
            subTask !== undefined && subTask !== null && subTask.length !== 0 && subTask.some(ele => ele.status !== 'Done')) {
            const subtasks = subTask.filter(ele => ele.status !== 'Done');
            this.checkDone = true;
            const dialog = this.dialog.open(DragconfirmComponent, {
              disableClose: true,
              width: '400px',
              data: {
                type: 'subtask', pendingSubTaskCount: subtasks.length,
                taskId: this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex].taskId
              },
            });
          } else {

            this.checkDone = false;
            this.previousTask.status = item.taskboardColumnsVO.columnName;
            this.previousTask.subStatus = subStatus.name;
            item.taskboardTaskVOList.push(this.previousTask);
            this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList.splice(this.selectedTaskIndex, 1);
            const taskList = JSON.parse(JSON.stringify(this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList));
            const spliceIndexs = [];

            for (let i = 0; i < taskList.length; i++) {
              this.previousTask?.subTasks?.forEach(ele => {
                if (ele.id === this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[i].id) {
                  this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[i].subStatus = subStatus.name;
                  item.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[i]);
                  spliceIndexs.push(i);
                }
              });
            }
            for (let i = spliceIndexs.length; i > 0; i--) {
              this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList.splice(spliceIndexs[i - 1], 1);
            }
          }
          if (this.checkDone === false) {
            this.taskboardService.setTaskBoardStatus(this.previousTask).subscribe(d => {
              if (d) {
                this.getTasksCount();
                this.getDoneTaskCount();
              }
            });
          }
        }
        this.loadSubStatusContainer();
      },
        error => {
          this.spinner.close();
        }
      );
    } else if (this.selectedTaskSubStatus === subStatus.name) {
      const taskList = this.taskboardVO.taskboardColumnMapVO[i];
      const columns = JSON.parse(JSON.stringify(taskList.taskboardTaskVOList));
      const currentIndex = event.currentIndex;
      const previousIndex = event.previousIndex;
      const currentIndexColumn = taskList.taskboardTaskVOList[previousIndex];
      if (previousIndex > currentIndex) {
        for (let i = 0; i < previousIndex + 1; i++) {
          if (i > currentIndex) {
            taskList.taskboardTaskVOList[i] = columns[i - 1];
          } else if (i === currentIndex) {
            taskList.taskboardTaskVOList[i] = currentIndexColumn;
          }
        }
      } else {
        for (let i = currentIndex; i >= previousIndex; i--) {
          if (i < currentIndex) {
            taskList.taskboardTaskVOList[i] = columns[i + 1];
          } else if (i === currentIndex) {
            taskList.taskboardTaskVOList[i] = currentIndexColumn;
          }
        }
      }
      this.loadSubStatusContainer();
    }
  }

  mousedown($event: MouseEvent, item: TaskboardColumns, i: number, taskboardTask: TaskboardTaskVO, j: number): void {
    this.previousTask = taskboardTask;
    this.selectedTaskIndex = j;
    this.selectedColumnIndex = i;
    this.selectedColumn = item.columnName;
    this.taskSequenceVo.columnName = item.columnName;
    this.selectedTaskSubStatus = taskboardTask.subStatus;
  }

  checkDoneColumn(column: any): void {
    const doneColumn = this.taskboardVO.taskboardColumns[this.taskboardVO.taskboardColumns.length - 1].columnName;
    if (column.columnName === doneColumn) {
      this.showSubStatus = true;
    } else {
      this.showSubStatus = false;
    }
  }


  addSubStatus(taskboardColumnsVO: TaskboardColumns, taskboardColumnMapVO: TaskboardColumnMapVO): void {
    let buttonName = 'Create';
    if (taskboardColumnsVO.subStatus && taskboardColumnsVO.subStatus.length > 0) {
      buttonName = 'Update';
    } else {
      buttonName = 'Create';
    }
    const dialog = this.dialog.open(SubStatusDialogComponent, {
      width: '400px',
      data: {
        type: 'subStatus', data: taskboardColumnsVO.subStatus, columnId: taskboardColumnsVO.id,
        taskList: taskboardColumnMapVO.taskboardTaskVOList, buttonName
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data !== false) {
        const taskboardSubStatus = new TaskboardSubStatusVO();
        taskboardSubStatus.taskboardColumnId = taskboardColumnsVO.id;
        taskboardSubStatus.subStatus = data.formValue.subStatus;
        taskboardSubStatus.deletedIdList = data.deleteIdList;
        this.taskboardService.saveSubStatus(taskboardSubStatus).subscribe(subStatusVOList => {
          taskboardColumnsVO.subStatus = data.formValue.subStatus;
          let count = 0;
          if (taskboardColumnsVO.subStatus && taskboardColumnsVO.subStatus.length > 0) {
            taskboardColumnsVO.subStatus.forEach(element => {
              if (element.id === undefined || element.id === null || element.id === '') {
                if (taskboardColumnMapVO.taskboardTaskVOList && taskboardColumnMapVO.taskboardTaskVOList.length > 0 && count === 0) {
                  taskboardColumnMapVO.taskboardTaskVOList.forEach(task => {
                    task.subStatus = taskboardColumnsVO.subStatus[0].name;
                  });
                  count++;
                }
                subStatusVOList.forEach(responseElement => {
                  if (responseElement.name === element.name) {
                    element.id = responseElement.id;
                  }
                });
              } else {
                taskboardColumnMapVO.taskboardTaskVOList.forEach(task => {
                  if (element.previousName === task.subStatus) {
                    task.subStatus = element.name;
                  }
                });
                for (let i = 0; i < data.formValue.subStatus.length; i++) {
                  for (let j = 0; j < subStatusVOList.length; j++) {
                    if (data.formValue.subStatus[i].name === subStatusVOList[j].name) {
                      if (data.formValue.subStatus[i].id === '') {
                        data.formValue.subStatus[i].id = subStatusVOList[j].id;
                      }
                    }
                  }
                }
              }
              element.previousName = element.name;
            });
          }
          const length = taskboardColumnMapVO.taskboardColumnsVO.subStatus.length;
          taskboardColumnMapVO.containerHeight = (this.subStatusScrollHeight / length) - 30 + 'px';
          for (let i = 0; i < length; i++) {
            taskboardColumnMapVO.taskboardColumnsVO.subStatus[i].border = '2.5px solid ' + taskboardColumnMapVO.taskboardColumnsVO.subStatus[i].color;
          }
          const taskboardColumnMapVOList = this.taskboardVO.taskboardColumnMapVO;
          for (let i = 0; i < taskboardColumnMapVOList.length; i++) {
            for (let j = 0; j < taskboardColumnMapVOList[i].taskboardColumnsVO.subStatus.length; j++) {
              const taskList = taskboardColumnMapVOList[i].taskboardTaskVOList.filter(task => task.subStatus === taskboardColumnMapVOList[i].taskboardColumnsVO.subStatus[j].name);
              const filteredTaskList = taskList.filter(task => (task.taskType === 'subtask' && task.status !== 'Done') || task.taskType === 'parentTask');
              taskboardColumnMapVOList[i].taskboardColumnsVO.subStatus[j].taskLength = filteredTaskList.length;
            }
          }
          this.connectedTo = [];
          for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
            this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
            if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus
              && this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length > 0) {
              for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length; j++) {
                this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].name + '-' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
              }
            }
          }
        });

      }
    });
  }

  show_hide(value): void {
    this.hide = value;
  }

  openEventautomationDialog(): void {
    if (!this.isAllAllowed) {
      const dialog = this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
      });
    } else {
      let labels: any;
      if (this.taskboardVO.taskboardLabels === null) {
        labels = [];
      } else {
        labels = this.taskboardVO.taskboardLabels.labels;
      }
      const statusList: any[] = [];
      this.taskboardColumns.forEach((data) => {
        const name = data.columnName;
        const color = data.columnColor;
        statusList.push({ name, color });
      });
      const dialog = this.dialog.open(EventAutomationComponent, {
        disableClose: true,
        width: '95%',
        maxWidth: '95%',
        height: '95%',
        autoFocus: false,
        data: {
          statusList,
          userList: this.usersList,
          groupList: this.groupList,
          labelsList: labels,
          taskboardId: this.taskboardVO.id,
          taskboardVO: this.taskboardVO,
          page: this.page,
          taskboardList: this.taskboardVoList,
          boardName: this.taskboardVO.name
        }
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          this.automationVO = data;
        }
      });
    }
  }

  openIntegrationsDialog(): void {
    const dialog = this.dialog.open(IntegrationDialogComponent, {
      disableClose: true,
      // width: '95%',
      // maxWidth: '95%',
      // height: '95%',
      width: '600px',
      height: '600px',
      data: { taskboardId: this.taskboardVO.id, taskboardName: this.taskboardVO.name }
    });
    dialog.afterClosed().subscribe(data => {

    });
  }

  getPage(): void {
    this.taskboardService.getTaskIdDetails(this.taskboardVO.taskboardColumns[0].formId, this.taskboardVO.taskboardColumns[0].version).subscribe(data => {
      let page = new Page();
      page = data;
      this.automationService.getAutomationList(this.taskboardVO.id).subscribe(data => {
        this.eventAutomations = data;
        this.taskboardService.getTaskboardLabelsList(this.taskboardVO.id).subscribe(data => {
          let taskboardLabelsList = new TaskboardLabelsVO;
          taskboardLabelsList = data;
          this.checkTableExist(page, this.eventAutomations, taskboardLabelsList);
        });
      });
    });
  }

  checkTableExist(page: any, automations: EventAutomationVO[], taskboardLabels: TaskboardLabelsVO): void {
    const tableList: any[] = [];
    page.sections.forEach(mainSection => {
      mainSection.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'select' || column.controlType === 'multipleselect' ||
            column.controlType === 'radiobutton') {
            if (column.field.control.optionType === 'd' && column.field.control.filter.tableName) {
              tableList.push(column.field.control.filter.tableName);
            }
          } else if (column.controlType === 'autocomplete') {
            if (column.field.control.tableName) {
              tableList.push(column.field.control.tableName);
            }
          } else if (column.controlType === 'input') {
            if (column.field.enableHyperlink === true && column.field.control.targetPageName) {
              tableList.push(column.field.control.targetPageId);
            }
          } else if (column.controlType === 'grid') {
            if (page.pageIdWithPrefix) {
              tableList.push(page.pageIdWithPrefix);
            }
          } else if (column.controlType === 'table') {
            if (column.field.control.tableId) {
              tableList.push(column.field.control.tableId);
            }
          } else if (column.controlType === 'button' && column.field.control.buttonType &&
            column.field.control.buttonType === 'action') {
            if (column.field.control.screenType && column.field.control.screenType !== 'webServiceCall'
              && column.field.control.screenType !== 'callWorkflow') {
              tableList.push(column.field.control.targetPageId);
            }
          }
        });
      });
      if (mainSection.sections && mainSection.sections.length > 0) {
        this.checkTableExist(mainSection, automations, taskboardLabels);
      }
    });
    if (tableList.length > 0) {
      const tableListVO = new TableListVO();
      tableListVO.tableList = tableList;
      this.taskboardService.getTableListVO(tableListVO).subscribe(data => {
        let tableObjectListVO: TableObjectsVO[] = [];
        tableObjectListVO = data;
        this.export(page, tableObjectListVO, automations, taskboardLabels);
      });
    } else {
      const tableObjectListVO: TableObjectsVO[] = [];
      this.export(page, tableObjectListVO, automations, taskboardLabels);
    }
  }

  export(page: Page, tableObjectListVO: TableObjectsVO[], automations: EventAutomationVO[], taskboardLabels: TaskboardLabelsVO): void {
    const taskboardTemplateJson = new TaskboardTemplateJson();
    taskboardTemplateJson.page = page;
    taskboardTemplateJson.tableObjectListVO = tableObjectListVO;
    taskboardTemplateJson.taskboardVO = this.taskboardVO;
    taskboardTemplateJson.automations = automations;
    taskboardTemplateJson.taskboardLabels = taskboardLabels;
    taskboardTemplateJson.taskboardVO.taskboardColumnMapVO = [];
    const templateVO = new TaskboardTemplatesVO();
    templateVO.id = null;
    templateVO.templateName = this.taskboardVO.name;
    templateVO.data = taskboardTemplateJson;
    // this.taskboardService.temaplateSave(templateVO).subscribe(data => {
    //   if (data) {
    //     this.snackbar.openFromComponent(SnackbarComponent, {
    //       data: 'Template saved successfully',
    //     });
    //   }
    // });
    const Jsondata = JSON.stringify(templateVO);
    const a = document.createElement('a');
    const file = new Blob([Jsondata], { type: 'text/json' });
    a.href = URL.createObjectURL(file);
    a.download = this.taskboardVO.name + '.json';
    a.click();
  }

  exportTemplateData(): void {
    this.getPage();
  }

  copyTaskboard(): void {
    if (!this.isAllAllowed) {
      const dialog = this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
      });
    } else {
      const configDialog = this.dialog.open(TaskboardConfigurationDialogComponent, {
        disableClose: true,
        width: '500px',
        height: '620px',
        panelClass: 'config-dialog',
        data: {
          pageName: 'Taskboard Configuration',
          configType: 'copy',
          selectedTaskboard: this.taskboardVO,
          showselection: true,
          showEditConfig: true,
          taskboardTaskVOList: this.taskboardTaskVOList,
          fromScratch: false,
          duplicate: true,
          taskboardList: this.taskboardVoList
        },
      });
      configDialog.afterClosed().subscribe((taskData) => {
        if (taskData && taskData.flag === true) {
          this.automationService.getAutomationList(this.taskboardVO.id).subscribe(data => {
            if (data !== undefined && data !== null && data.length > 0) {
              this.eventAutomations = data;
              for (let i = 0; i < this.eventAutomations.length; i++) {
                this.eventAutomations[i].id = null;
                this.eventAutomations[i].taskboardId = taskData.taskVO.id;
              }
              this.automationService.saveMultipleAutomations(this.eventAutomations).subscribe();
            }
          });
          this.taskboardService.getTaskboardLabelsList(this.taskboardVO.id).subscribe(data => {
            if (data && data.labels !== undefined && data.labels !== null && data.labels.length > 0) {
              let taskboardLabelsList = new TaskboardLabelsVO;
              taskboardLabelsList = data;
              taskboardLabelsList.taskboardId = taskData.taskVO.id;
              this.taskboardService.saveTaskboardLebles(taskboardLabelsList).subscribe(data => {
                if (data) {
                  this.getTaskboardDetails(taskData.taskVO.id);
                }
              });
            } else {
              this.getTaskboardDetails(taskData.taskVO.id);
            }
          });
        }
      });
    }
  }
  editForm() {
    if (this.taskboardColumns[0].layoutType === 'workflowForms') {
      this.publicAcess = false;
    }
    else {
      this.publicAcess = true;

    }
    return this.dialog.open(CreateFormDialogComponent, {
      disableClose: true,
      height: '97%',
      width: '100vw',
      maxWidth: '90vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-modal',

      data: { id: this.taskboardColumns[0].formId, versionId: this.taskboardColumns[0].version, publicform: this.publicAcess },
    });

  }

  loadDoneTaskSubStatusLength(columnIndex: number, subStatusName: string): number {
    if (this.manualLength === false) {
      const taskList = this.taskboardVO.taskboardColumnMapVO[columnIndex].taskboardTaskVOList.filter(task => task.subStatus === subStatusName);
      const filteredTaskList = taskList.filter(task => (task.taskType === 'subtask' && task.status !== 'Done') || task.taskType === 'parentTask');
      return filteredTaskList.length;
    } else {
      const pendingTasks = this.doneTaskList.filter(task => task.subStatus === subStatusName);
      const filteredPendingTaskList = pendingTasks.filter(task => (task.taskType === 'subtask' && task.status !== 'Done') || task.taskType === 'parentTask');
      return filteredPendingTaskList.length;
    }
  }

  loadSubStatusLength(columnIndex: number, subStatusName: string): number {
    if (this.manualLength === false) {
      const taskList = this.taskboardVO.taskboardColumnMapVO[columnIndex].taskboardTaskVOList.filter(task => task.subStatus === subStatusName);
      const filteredTaskList = taskList.filter(task => (task.taskType === 'subtask' && task.status !== 'Done') || task.taskType === 'parentTask');
      return filteredTaskList.length;
    } else {
      const taskList = this.taskboardVO.taskboardColumnMapVO[columnIndex].taskboardTaskVOList.filter(task => task.subStatus === subStatusName);
      const filteredTaskList = taskList.filter(task => (task.taskType === 'subtask' && task.status !== 'Done') || task.taskType === 'parentTask');
      let pendingTasks: TaskboardTaskVO[] = [];
      if (this.pendingTaskboardDetails?.taskboardColumnMapVO[columnIndex]?.taskboardTaskVOList) {
        pendingTasks = this.pendingTaskboardDetails.taskboardColumnMapVO[columnIndex].taskboardTaskVOList.filter(task => task.subStatus === subStatusName);
      }
      const filteredPendingTaskList = pendingTasks.filter(task => (task.taskType === 'subtask' && task.status !== 'Done') || task.taskType === 'parentTask');
      return filteredTaskList.length + filteredPendingTaskList.length;
    }
  }

  loadSubStatusContainer() {
    this.connectedTo = [];
    this.taskboardColumns = [];
    for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
      this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
      if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus
        && this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length > 0) {
        for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus.length; j++) {
          this.connectedTo.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].name + '-' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName);
        }
      }
      this.taskboardColumns.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO);
      const length = this.taskboardVO.taskboardColumnMapVO[i]?.taskboardColumnsVO?.subStatus?.length;
      for (let j = 0; j < length; j++) {
        this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].border = '2.5px solid ' + this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].color;
        const taskList = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.filter(task => task.subStatus === this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].name);
        const filteredTaskList = taskList.filter(task => (task.taskType === 'subtask' && task.status !== 'Done') || task.taskType === 'parentTask');
        this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.subStatus[j].taskLength = filteredTaskList.length;
      }
    }


    for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO?.length; i++) {
      const tasks = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.filter(task => task.taskType === 'parentTask');
      if (this.taskboardVO.taskboardColumnMapVO[i]?.taskLength === undefined || this.taskboardVO.taskboardColumnMapVO[i]?.taskLength === null) {
        const length = this.taskboardVO.taskboardColumnMapVO[i]?.taskboardColumnsVO?.subStatus?.length;
        const taskboardColumnMapVO = new TaskboardColumnMapVO();
        taskboardColumnMapVO.taskboardColumnsVO = this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO;
        taskboardColumnMapVO.taskboardTaskVOList = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList;
        taskboardColumnMapVO.taskLength = 0;
        taskboardColumnMapVO.containerHeight = (this.subStatusScrollHeight / length) - 30 + 'px';
        this.taskboardVO.taskboardColumnMapVO[i] = taskboardColumnMapVO;
      }
      if (tasks && tasks.length) {
        this.taskboardVO.taskboardColumnMapVO[i].taskLength = tasks.length;
      }
    }
  }

  getcount(task) {
    this.newTaskLength = [];
    if (task.taskboardTaskVOList.length > 0) {
      for (let i = 0; i < task.taskboardTaskVOList.length; i++) {
        if (task.taskboardTaskVOList[i].taskType === 'subtask' && task.taskboardTaskVOList[i].status === 'Done') {
          this.newTaskLength.push(task.taskboardTaskVOList[i]);
        }
      }
    }
    this.newLength = +task.taskboardTaskVOList.length - +this.newTaskLength.length;
    return this.newLength;
  }

  deleteTask(task, index) {

    if (this.taskboardVO.isTaskBoardOwner === true) {
      const dialog = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        width: '400px',
        data: { type: 'taskDelete', taskDetails: task }
      });
      dialog.afterClosed().subscribe((data) => {
        if (data.status === 'yes') {
          this.taskboardService.removeTask(task.id).subscribe(response => {
            if (response.response.includes('successfully')) {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: response.response
              });
            }
            if (this.searchForm.get('searchTask').value === '' && this.searchForm.get('searchPriority').value === '' && this.searchForm.get('isNoPriority').value === false && this.searchForm.get('isNoLabel').value === false && this.searchForm.get('isUnAssignedUser').value === false
              && this.selectedUsersList.length === 0 && this.selectedLabelList.length === 0 && this.selectedPriorityList.length === 0) {
              // this.getTaskboardDetails(this.taskboardVO.id);
              // this.getTaskboard(this.taskboardVO);
              this.loadTaskboardDetails();
            } else {
              this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
                this.filterApplied = true;
                this.initialLoad = false;
                this.pendingTaskboardDetails = new TaskboardVO();
                this.taskboardVO.taskboardColumnMapVO = data;
                this.filteredColumnMapList = data;
                this.endIndex = 0;
                // this.loadFilteredTasks();
                this.filterTasks = data;

                if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
                  this.taskboardTaskVOList = [];
                  for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
                    if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
                      for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
                        this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
                      }
                    }
                  }
                }
                this.loadSubStatusContainer();
                this.filterAppliedAfterSwitch.emit(true);
              });
            }
          });
        }
        else {
          return;
        }
      });
    }

    else if (index === 0 && this.taskboardVO.taskboardSecurity.delete === true) {
      const dialog = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        width: '400px',
        data: { type: 'taskDelete', taskDetails: task }
      });
      dialog.afterClosed().subscribe((data) => {
        if (data.status === 'yes') {
          this.taskboardService.removeTask(task.id).subscribe(data => {
            if (data.response.includes('successfully')) {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: data.response
              });
            }
            if (this.searchForm.get('searchTask').value === '' && this.searchForm.get('isNoLabel').value === false && this.searchForm.get('isUnAssignedUser').value === false
              && this.selectedUsersList.length === 0 && this.selectedLabelList.length === 0) {
              // this.getTaskboardDetails(this.taskboardVO.id);
              this.getTaskboard(this.taskboardVO);
            } else {
              this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
                this.filterApplied = true;
                this.initialLoad = false;
                this.pendingTaskboardDetails = new TaskboardVO();
                this.taskboardVO.taskboardColumnMapVO = data;
                this.filteredColumnMapList = data;
                this.endIndex = 0;
                // this.loadFilteredTasks();
                this.filterTasks = data;

                if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
                  this.taskboardTaskVOList = [];
                  for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
                    if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
                      for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
                        this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
                      }
                    }
                  }
                }
                this.loadSubStatusContainer();
                this.filterAppliedAfterSwitch.emit(true);
              });
            }
          });
        }
        else {
          return;
        }
      });
    }
    else {
      const dialog = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        width: '400px',
        data: { type: 'trash', taskDetails: this.taskboardVO, index }
      });
      dialog.afterClosed().subscribe((data) => {
      });
    }
  }

  getLoggedInUser() {
    this.userService.getLoggedInUserDetails().subscribe(data => {
      if (data) {
        this.userVo = data;

      }
    });
  }

  checkLoggedInUser(task) {
    let isnotCreatedUser = false;
    if (this.userVo !== undefined && this.userVo !== null &&
      task.createdBy === this.userVo.firstName + ' ' + this.userVo.lastName || this.taskboardVO.isTaskBoardOwner === true) {
      isnotCreatedUser = true;
    }
    return isnotCreatedUser;
  }

  archiveTask(task, index) {
    if (this.taskboardVO.isTaskBoardOwner === true) {
      const dialog = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        width: '400px',
        data: { type: 'taskArchive', taskDetails: task }
      });
      dialog.afterClosed().subscribe((data) => {
        if (data.status === 'yes') {
          this.taskboardService.archiveTask(task.id).subscribe(response => {
            if (response.response.includes('successfully')) {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: response.response
              });
            }
            if (this.searchForm.get('searchTask').value === '' && this.searchForm.get('searchPriority').value === '' && this.searchForm.get('isNoPriority').value === false && this.searchForm.get('isNoLabel').value === false && this.searchForm.get('isUnAssignedUser').value === false
              && this.selectedUsersList.length === 0 && this.selectedLabelList.length === 0 && this.selectedPriorityList.length === 0) {
              // this.getTaskboardDetails(this.taskboardVO.id);
              // this.getTaskboard(this.taskboardVO);
              this.loadTaskboardDetails();
            } else {
              this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
                this.filterApplied = true;
                this.initialLoad = false;
                this.pendingTaskboardDetails = new TaskboardVO();
                this.taskboardVO.taskboardColumnMapVO = data;
                this.filteredColumnMapList = data;
                this.endIndex = 0;
                // this.loadFilteredTasks();
                this.filterTasks = data;

                if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
                  this.taskboardTaskVOList = [];
                  for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
                    if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
                      for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
                        this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
                      }
                    }
                  }
                }
                this.loadSubStatusContainer();
                this.filterAppliedAfterSwitch.emit(true);
              });
            }

          });
        }
        else {
          return;
        }
      });
    }

    else if (index === 0 && this.taskboardVO.taskboardSecurity.delete === true) {
      const dialog = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        width: '400px',
        data: { type: 'taskArchive', taskDetails: task }
      });
      dialog.afterClosed().subscribe((data) => {
        if (data.status === 'yes') {
          this.taskboardService.archiveTask(task.id).subscribe(data => {
            if (data.response.includes('successfully')) {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: data.response
              });
            }
            if (this.searchForm.get('searchTask').value === '' && this.searchForm.get('isNoLabel').value === false && this.searchForm.get('isUnAssignedUser').value === false
              && this.selectedUsersList.length === 0 && this.selectedLabelList.length === 0) {
              // this.getTaskboardDetails(this.taskboardVO.id);
              // this.getTaskboard(this.taskboardVO);
              this.loadTaskboardDetails();
            } else {
              this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
                this.filterApplied = true;
                this.initialLoad = false;
                this.pendingTaskboardDetails = new TaskboardVO();
                this.taskboardVO.taskboardColumnMapVO = data;
                this.filteredColumnMapList = data;
                this.endIndex = 0;
                // this.loadFilteredTasks();
                this.filterTasks = data;

                if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
                  this.taskboardTaskVOList = [];
                  for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
                    if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
                      for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
                        this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
                      }
                    }
                  }
                }
                this.loadSubStatusContainer();
                this.filterAppliedAfterSwitch.emit(true);
              });
            }
          });
        }
        else {
          return;
        }
      });
    }
    else {
      const dialog = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        width: '400px',
        data: { type: 'trash', taskDetails: this.taskboardVO, index }
      });
      dialog.afterClosed().subscribe((data) => {
      });
    }
  }


  getTaskboard(taskboard: TaskboardVO): void {
    this.taskboardService.getTaskboardDetailsByType(taskboard.id, true).subscribe((data) => {
      this.taskboardVO = data;
      this.showSelectedTaskBoard = true;
      this.doneColumnName = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.columnName;
      this.taskboardService.getDoneTaskoardTask(this.taskboardVO.id).subscribe(result => {
        const donelength = result.length > 15 ? 15 : result.length;
        for (let i = 0; i < donelength; i++) {
          this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList.push(result[i]);
        }
        const length = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus.length;
        for (let j = 0; j < length; j++) {
          const taskList = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList.filter(task => task.subStatus === this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus[j].name);
          this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.subStatus[j].taskLength = taskList.length;
        }
        this.doneTaskList = result;
        this.spinner.close();
      });
    });
    this.taskboardService.getTaskboardDetailsByType(taskboard.id, false).subscribe(taskboard => {
      let columnMapVO: TaskboardColumnMapVO[] = [];
      columnMapVO = taskboard.taskboardColumnMapVO;
      this.pendingTaskboardDetails = taskboard;
    });
  }

  getFlagColor(task: TaskboardTaskVO): string {
    let returnValue = 'grey';
    if (task.priority) {
      const priority = this.priorityArray.find(p => p.name === task.priority);
      if (priority && priority !== null) {
        returnValue = priority.color;
      }
    }
    return returnValue;
  }

  savePriority(priority: any, taskboardTask, security): void {
    const taskVO = new TaskboardTaskVO();
    taskVO.id = taskboardTask.id;
    taskVO.priority = priority.name;
    this.spinnerDialog();
    this.taskboardService.savePriority(taskVO).subscribe(data => {
      if (data && data.response.includes('updated')) {
        this.spinner.close();
        this.taskBoardTaskVO.priority = priority.name;
        if (this.groupByName === 'Status') {
          if (this.searchForm.get('searchTask').value === '' &&
            this.searchForm.get('isNoLabel').value === false &&
            this.searchForm.get('isUnAssignedUser').value === false &&
            this.searchForm.get('isNoPriority').value === false &&
            this.selectedUsersList.length === 0 &&
            this.selectedLabelList.length === 0 &&
            this.selectedPriorityList.length === 0) {
            if (this.selectedSprint.sprintId) {
              this.getSprintTasks(this.selectedSprint, this.taskboardVO);
            } else {
              // this.getTaskboardDetails(this.taskboardVO.id);
              this.loadTaskboardDetails();
            }
          } else {
            this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO, this.selectedSprint?.sprintId).subscribe(data => {
              this.filterApplied = true;
              this.initialLoad = false;
              this.pendingTaskboardDetails = new TaskboardVO();
              this.taskboardVO.taskboardColumnMapVO = data;
              this.filteredColumnMapList = data;
              this.endIndex = 0;
              // this.loadFilteredTasks();
              this.filterTasks = data;

              if (this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
                this.taskboardTaskVOList = [];
                for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
                  if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length > 0) {
                    for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
                      this.taskboardTaskVOList.push(this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
                    }
                  }
                }
              }
              this.loadSubStatusContainer();
              this.filterAppliedAfterSwitch.emit(true);
            });
          }
        } else {
          const groupBy = this.groupByList.find(g => g.name === this.groupByName);
          this.setGroupBy(groupBy, 0);
        }
      }
    });
  }
  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }

  deleteTaskboard(): void {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { type: 'deleteTaskboard', taskboardId: this.taskboardVO.id, name: this.taskboardVO.name }
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === 'yes') {
        this.taskboardService.deleteTaskboard(this.taskboardVO.id).subscribe(data => {
          if (data.response.includes('deleted')) {
            this.taskboardVoList?.splice(this.taskboardVoList.findIndex(t => t.id === this.taskboardVO.id), 1);
            this.selectedTaskboard(this.taskboardVoList[0]);
          }
        });
      }
    });
  }


  onScrollEvent(event): void {
    if (this.showView === 'board' && this.isScroll === true) {
      const startIndex = this.sum;
      this.sum += 1;

      if (this.groupByName === 'Assignee') {
        this.setAssigneeGroupByVertical();
      } else {
        // if (this.groupByName === 'Status') {
        //   if (this.filterApplied !== true) {
        //     if (this.selectedSprint.sprintId) {
        //       this.loadSprintTasks();
        //     } else {
        //       this.loadTasks(startIndex, this.sum);
        //     }
        //   }
        // } else {
        const groupBy = this.groupByList.find(g => g.name === this.groupByName);
        this.setGroupBy(groupBy, this.sum);
        // }
      }
    }
  }

  loadSprintTasks(): void {
    this.taskboardService.getSprintTasks(this.selectedSprint.sprintId, this.taskboardVO.id, this.sum).subscribe(data => {
      if (data) {
        const doneTasks = JSON.parse(JSON.stringify(this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList));
        this.taskboardVO = data;
        this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList = doneTasks;
        this.sprintTasks.emit(this.taskboardVO);
        this.filterApplied = true;
        this.initialLoad = false;
      }
    });
  }

  openSprintDialog(taskboard: TaskboardVO): void {
    const dialog = this.dialog.open(AddSprintComponent, {
      width: '400px',
      disableClose: true,
      data: { taskboardVO: taskboard }
    });
  }

  excelService() {
    const taskboardExcelVO = new TaskboardExcelVO();
    taskboardExcelVO.taskboardId = this.taskboardId;
    taskboardExcelVO.workspaceId = this.workspaceService.getWorkspaceID();
    this.taskboardService.getExcelData(taskboardExcelVO).subscribe((response) => {
      const blob = new Blob([response], { type: 'xlsx' });
      const currentDate = new Date;
      const date = this.datePipe.transform(currentDate, 'MM-dd-yyyy');
      saveAs(blob, this.taskboardVO.name + '(' + date + ')' + '.xlsx');
    });
  }

  isEmptyTaskboard() {
    const taskboardExcelVO = new TaskboardExcelVO();
    taskboardExcelVO.taskboardId = this.taskboardId;
    taskboardExcelVO.workspaceId = this.workspaceService.getWorkspaceID();
    this.taskboardService.isEmptyTaskboard(taskboardExcelVO).subscribe(data => {
      if (data) {
        this.isEmptyTasks = data.emptyTaskboard;
      }
    });
  }

  openSprintSettings(taskboard: TaskboardVO): void {
    const dialog = this.dialog.open(SprintDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { taskboardId: taskboard.id, sprintSettings: taskboard?.sprintSettingsVo, taskboardVO: taskboard }
    });
  }

  getSprintTasks(sprint: SprintVO, taskboard: TaskboardVO): void {
    this.taskService.sprintId = sprint.sprintId;
    this.spinnerDialog();
    this.showSelectedTaskBoard = false;
    this.getPageFromTaskboard(taskboard?.formId, taskboard?.version);
    this.loadBoardUsers(taskboard?.id);
    this.isScroll = true;
    this.initialLoad = true;
    const doneTasks: TaskboardTaskVO[] = [];
    this.selectedSprint = sprint;
    // if (this.groupByName === 'Status') {
    //   this.taskboardService.getSprintDoneTasks(sprint.sprintId, taskboard.id).subscribe(data => {
    //     if (data && data?.length > 0) {
    //       doneTasks = data;
    //     }
    //   });
    //   this.taskboardService.getSprintTasks(sprint.sprintId, taskboard.id, 0).subscribe(data => {
    //     if (data) {
    //       this.spinner.close();
    //       this.taskboardVO = data;
    //       this.taskService.taskboardVO = this.taskboardVO;
    //       this.taskService.loadAssigneeConmbinations();
    //       this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList = doneTasks;
    //       this.sprintTasks.emit(this.taskboardVO);
    //       this.filterApplied = true;
    //       this.showSelectedTaskBoard = true;
    //     }
    //   }, error => {
    //     this.spinner.close();
    //   });
    // } else {
    const groupBy = this.groupByList.find(g => g.name === this.groupByName);
    this.setGroupBy(groupBy, 0);
    // }
  }

  getSprintStatusColor(sprintStatus: string): string {
    return this.sprintStatusList.find(s => s.value === sprintStatus).color;
  }

  getSprintStatusName(sprintStatus: string): string {
    return this.sprintStatusList.find(s => s.value === sprintStatus).name;
  }

  isStartSprintEnable(sprintStartDate: string): boolean {
    const currentDate = new Date();
    const startDate = new Date(sprintStartDate);
    startDate.setHours(0, 0, 0, 0);
    if (startDate.getDate() === currentDate.getDate()) {
      return true;
    } else {
      const nextDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      if (startDate.getDate() === nextDate.getDate()) {
        return true;
      } else {
        return false;
      }
    }
  }

  startSprint(sprintVo: SprintVO): void {
    this.taskboardService.startSprint(sprintVo.sprintId).subscribe(data => {
      if (data && data.response.includes('Sprint Started Successfully')) {
        sprintVo.sprintStatus = 'r';
      }
    });
  }

  deleteSprint(sprintVo: SprintVO, taskboard: TaskboardVO): void {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { type: 'deleteSprint', sprintVO: sprintVo }
    });
    dialog.afterClosed().subscribe(res => {
      if (res && res === 'yes') {
        if (this.selectedSprint?.sprintId === sprintVo.sprintId) {
          this.selectedTaskboard(taskboard);
        }
        this.taskboardService.deleteSprint(sprintVo.sprintId).subscribe(data => {
          if (data) {
            taskboard.sprintsVoList.splice(taskboard.sprintsVoList.findIndex(s => s.sprintId === sprintVo.sprintId), 1);
          }
        });
      }
    });
  }

  completeSprint(sprintVO: SprintVO): void {
    this.taskboardService.completeSprint(sprintVO.sprintId).subscribe(data => {
      if (data && data.response.includes('Sprint Completed Successfully')) {
        sprintVO.sprintStatus = 'c';
      } else {
        const dialog = this.dialog.open(ConfirmationDialogComponent, {
          width: '400px',
          data: { type: 'taskComplete' }
        });
      }
    });
  }

  boardExpand(taskboard: TaskboardVO): void {
    if (taskboard.expanded) {
      taskboard.expanded = false;
    } else {
      taskboard.expanded = true;
    }
  }
}

