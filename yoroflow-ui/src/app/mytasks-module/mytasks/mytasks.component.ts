import { Component, OnInit, ViewChild, Input, ElementRef, ChangeDetectorRef, IterableDiffers, HostListener, Output, EventEmitter } from '@angular/core';
import { TasklistService } from '../../engine-module/tasklist.service';
import { ProcessInstanceListVO } from '../../engine-module/ProcessInstanceListVO';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { PaginationVO, ReassignTaskVO, FieldValueVO, FilterValuesVO } from './pagination-vo';
import { merge, Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { OpenFormDialogBoxComponent } from '../../engine-module/open-form-dialog-box/open-form-dialog-box.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MyTaskService } from './my-task.service';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { YoroFlowConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import 'rxjs/add/observable/interval';
import * as moment from 'moment';
import { OrgPrefrenceService } from '../../shared-module/services/org-prefrence.service';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FilterValueVO } from '../../shared-module/yorogrid/pagination-vo';
import { ConfirmationDialogBoxComponentComponent } from '../../designer-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { ThemePalette } from '@angular/material/core';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import { MatInputModule } from '@angular/material/input';
import { interval } from 'rxjs/internal/observable/interval';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { LandingPageService } from 'src/app/engine-module/landing-page/landing-page.service';
import { GroupsVO, PaginatorForWorkflow } from 'src/app/engine-module/landing-page/landing-page-vo';
import { HeaderVO } from 'src/app/shared-module/yorogrid/headers-vo';
import { ThemeService } from 'src/app/services/theme.service';
import { UserVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { Group } from 'src/app/engine-module/group/group-vo';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { MyRequestRoutingComponent } from '../my-request-routing/my-request-routing.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { OpenFormDialogService } from 'src/app/engine-module/open-form-dialog-box/open-form.service';
import { ThemeDialogComponent } from 'src/app/rendering-module/theme-dialog/theme-dialog.component';

export class FilterVO {
  value: string;
  color: ThemePalette;
}

@Component({
  selector: 'app-mytasks',
  templateUrl: './mytasks.component.html',
  styleUrls: ['./mytasks.component.scss']
})

export class MytasksComponent implements OnInit {

  constructor(private taskListService: TasklistService, private datePipe: DatePipe, private myTaskService: MyTaskService,
              private changeDetectorRef: ChangeDetectorRef, private dialog: MatDialog, private activatedRoute: ActivatedRoute,
              private router: Router, private fb: FormBuilder, private snackBar: MatSnackBar, private orgPrfrenceService: OrgPrefrenceService, media: MediaMatcher,
              private datepipe: DatePipe, private landingservice: LandingPageService, private iterableDiffers: IterableDiffers, public themeService: ThemeService
    ,         private workspaceService: WorkspaceService, private taskboardService: TaskBoardService, public activity: OpenFormDialogService
  ) {
    setInterval(() => {
      this.now = new Date();
    }, 1);
    this.sub = interval(500).subscribe((val) => {
      this.screenWidth = Math.round((21 / 100) * window.innerWidth - 20) + 'px';
      this.screenHeight1 = (window.innerHeight - 57) + 'px';
      this.screenHeight2 = (window.innerHeight - 61) + 'px';
    });
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.ipadResolution = media.matchMedia('(max-width: 768px)');
    this.ipadProResolution = media.matchMedia('(max-width: 1024px)');
    this.mobileQueryListener = () => {
      changeDetectorRef.detectChanges();
      this.resolutionChanges();
    };
    this.resolutionChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);
    this.ipadResolution.addListener(this.mobileQueryListener);
  }

  // tslint:disable-next-line: no-input-rename
  @Input('status') status: any;
  @Input() object: MyRequestRoutingComponent;
  @Output() public countEmitter: EventEmitter<any> = new EventEmitter<any>();


  taskList: any = [];
  taskBackground: any;
  filterHeader: HeaderVO[];
  dynamicVO = new PaginationVO();
  assignedGroups: GroupsVO[] = [];
  filterColumns: FieldValueVO[] = [];
  totalFilterColumns: FieldValueVO[] = [];
  duplicateOrders = false;
  paginationVO = new PaginationVO();
  reassignTaskVo = new ReassignTaskVO();
  taskListLength: string;
  descriptionLength = false;
  selectable = true;
  removable = true;
  filterValues: any[] = [];
  filterField: any[] = [];
  filterFieldValues: any[] = [];
  count = 0;
  filterBy='All Task'
  remove: any[] = [];
  datePicker = false;
  enableDatePicker = false;
  totalGroupRecordsCount: any;
  totalAssignedRecordsCount: any;
  @ViewChild('chipCntl') chipCntl: ElementRef<HTMLInputElement>;
  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;
  taskPassedDueDate = false;
  colorDueDate = false;
  index: any;
  draftTask = true;
  pendingUserTask = true;
  pendingGroupTask = true;
  draft = true;
  public now: Date = new Date();
  form: FormGroup;
  version: any;
  enableFilters = true;
  totalRecords = '';
  callForFilter = true;
  sub: any;
  checked = false;
  isMobile: boolean;
  totalDraftCount = '0';
  totalAssignedCount = '0';
  totalGroupCount = '0';
  removeValFromIndex: any;
  filterDataTypeIndex = 0;
  enableFilterField = false;
  style: any;
  selectedIndex = -1;
  mappingFieldValues: any[] = [];
  taskNameList: any[] = [];
  allTaskList: any;
  showTaskField = false;
  backGroundColor = this.themeService.primaryColor;
  pushedList = [];
  pageSize = 10;
  pageIndex = 0;
  filterIndex = undefined;
  reload = false;
  sortForWorkflow: Sort;
  selectedItem: any[] = [];
  filterCountForWorkflow = 0;
  filterCountForDynamic = 0;
  assignedToSelected = false;
  checkAssignedTo = false;
  showFilter = false;
  filteredColumn: Observable<FieldValueVO[]>;
  displayedColumns: string[] = ['startTime', 'dueDate', 'status',
    'savedAsDraft', 'button', 'cancelButton'];
  displayedDraftOrGroupColumns: string[] = ['processDefinitionTask.taskName', 'startTime', 'dueDate',
    'status', 'savedAsDraft', 'assignToMe', 'button', 'cancelButton'];
  displayCompletedColumns: string[] = ['processDefinitionTask.taskName', 'startTime',
    'endTime', 'status', 'duration', 'button'];
  displayLaunchedColumns: string[] = ['taskName', 'startTime',
    'status'];
  displayedColumnsForWorkflow: string[] = ['processDefinitionTask.taskName', 'createdDate', 'dueDate', 'assigned_to', 'assigned_to_group', 'action'];
  filterDatatype: any;
  assignedWorkflowGroup: GroupsVO[] = [];

  defaultPageSize = 10;
  screenWidth: any;
  screenHeight1: any;
  screenHeight2: any;
  taskName = 'all';
  reloadTaskName: any;
  taskType = 'all';
  public config: PerfectScrollbarConfigInterface = {};
  private mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;
  ipadResolution: MediaQueryList;
  ipadProResolution: MediaQueryList;
  autoRefresh = false;
  filterRefresh = true;
  filterColumnName: string;
  indexList: any[] = [];
  filterHeadersList: any[] = [];
  taskHeadersList: any[] = [];
  userCount: number;
  groupCount: number;
  totalCount: number;
  length: string;
  showCollapse = false;
  showAll = false;
  paginatorsForWorkflow = new PaginatorForWorkflow();
  @Input('defaultColumn')
  defaultColumnForWorkflow = 'createdDate';
  @Input('defaultSortDirection')
  columnId: any;
  sortForDynamic: Sort;
  defaultSortDirection = 'desc';
  columnWidth: any;
  workflowForm: FormGroup;
  dynamicForm: FormGroup;
  type = 'text';
  paginationworkflowVO = new PaginationVO();

  @ViewChild('menuTrigger', { static: true }) public input: any;
  filterDataType: any[] = [];
  checkboxIndex: any[] = [];
  indexes: any[] = [];
  show = false;
  isTablet: boolean;
  filterVO: FilterVO[];
  workflowDue = 'all';
  @ViewChild('menuTriggerWorkflow') inputForWorkflow;


  dataType = {
    number: [{ value: 'eq', description: 'equals' },
    { value: 'gt', description: 'greater than' },
    { value: 'ge', description: 'greater than or equal to' },
    { value: 'lt', description: 'less than' },
    { value: 'le', description: 'less than or equal to' },
    ],
    string: [
      { value: 'eq', description: 'equals' },
      { value: 'bw', description: 'begins with' },
      { value: 'ew', description: 'ends with' },
      { value: 'cn', description: 'contains' },
    ],
    boolean: [
      { value: 'tr', description: 'true' },
      { value: 'fa', description: 'false' },
    ]
  };
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  elemnt: HTMLElement = document.getElementById('filter_Name') as HTMLElement;
  workflowVO: any;
  workflowLength: any;
  isWorkflowPaginator = false;
  isWorkFlowLength = false;

  isSingleWorkflowPaginator = false;
  isSingleWorkflowLength = false;
  asssigneeColumnWidth: any;
  isDateField = false;
  filterOperator: string;
  loadGroupCount: string;
  loadUserCount: string;
  loadTotalCount: string;
  taskCount: string;
  screenHeight: any;
  usersList: UserVO[] = [];
  groupList: any[] = [];
  requestRoutingComponent: MyRequestRoutingComponent;
  isWorkspace = false;
  resolutionChanges() {
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.columnWidth = Math.round((window.innerWidth / 100) * 20) + 'px';
    this.asssigneeColumnWidth = Math.round((window.innerWidth / 100) * 14) + 'px';
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1) + 'px';
    } else {
      this.screenHeight = (window.innerHeight - 63) + 'px';
    }
  }


  ngOnInit() {
    this.isWorkspace = this.myTaskService.isWorkspace;
    this.requestRoutingComponent = this.object;
    this.loadUserAndGroupList();
    this.form = this.fb.group({
      filterValue: ['', [Validators.required]],
      operator: ['', [Validators.required]],
      filters: this.fb.array([
        this.addFilter()
      ]),
    });
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    this.themeService.themeEmittter.subscribe(data => {
      if (this.taskName === 'all') {
        this.backGroundColor = this.themeService.primaryColor;
      }
    });
    this.showAll = true;
    this.showFilter = false;
    this.loadWorkFlow();
    if (this.status === 'launched') {
      this.enableFilterField = true;
    }
    this.loadWorkflowGroups();
    this.initializeFilterForm();
    this.initializeFilterFormWorkflow();
    this.initializeDynamicFormWorkflow();

    this.getAllTaskNames(false);
    this.openUserTask();
    this.taskListService.myTaskLaunchEmitter.subscribe(data => {
      if (data === true) {
        this.getAllTaskNames(false);
      }
    });
    this.requestRoutingComponent?.myTaskEmitter.subscribe(data => {
      if (data === true) {
        this.checked = true;
        this.AutoRefresh({ checked: true });
      } else {
        this.checked = false;
        if (this.sub) {
          this.sub.unsubscribe();
        }
      }
    });
    this.searchFilter();
    this.allWorkspaceChange();
  }

  loadUserAndGroupList() {
    this.myTaskService.getTeamList().subscribe((data) => {
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

  loadDynamicLayout(): void {
    this.columnWidth = Math.round((window.innerWidth / 100) * 20) + 'px';
    this.asssigneeColumnWidth = Math.round((window.innerWidth / 100) * 14) + 'px';
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1) + 'px';
    } else {
      this.screenHeight = (window.innerHeight - 63) + 'px';
    }
  }

  initializeFilterFormWorkflow() {
    this.workflowForm = this.fb.group({
      filterValue: [''],
      operator: [''],
      searchForAssignedTo: [''],
      searchForAssignedToGroup: [''],
      filters: this.fb.array([
        this.addFilterForWorkflowList()
      ])
    });
  }
  initializeDynamicFormWorkflow() {
    this.dynamicForm = this.fb.group({
      filterValue: [''],
      operator: [''],
      filters: this.fb.array([
        this.addDynamicFilter()
      ])
    });
  }

  getFieldValue(field: any, task): string {

    let returnValue = field.fieldValues[task];
    if (returnValue === undefined || returnValue === null) {
      returnValue = '';
    }
    return returnValue;

  }
  loadWorkflowGroups() {
    this.landingservice.getWorkflowGroups().subscribe(groups => {
      this.assignedWorkflowGroup = groups;
      this.assignedGroups = groups;

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

  isSelectedColumn(columnName) {
    const index = this.selectedItem.findIndex(t => t === columnName);
    if (index !== -1) {
      return true;
    } else {
      return false;
    }
  }

  addFilterForWorkflowList(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      dataType: ['string'],
    });
  }
  addDynamicFilter() {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      filterDataType: ['string'],
    });
  }
  openAll(taskName, i) {
    this.taskName = taskName;
    this.showFilter = false;
    this.showAll = true;
    if (this.taskType === 'all' && this.taskName === 'all') {
      this.filterRefresh = true;
    } else {
      this.filterRefresh = false;
    }
    if (i === -1) {
      this.backGroundColor = this.themeService.primaryColor;
      this.themeService.themeEmittter.subscribe(data => {
        this.backGroundColor = this.themeService.primaryColor;
      });
    } else {
      this.backGroundColor = '#f5f5f5';
    }
    this.selectedIndex = i;
    const form = (this.workflowForm.get('filters') as FormArray);
    form.clear();
    this.paginationworkflowVO.filterValue = [];
    this.selectedItem = [];
    this.loadWorkFlow();
  }

  loadWorkFlow() {
    this.taskListService.getTaskList(this.getPaginationForWorkflow()).subscribe(res => {
      this.pendingUserTask = false;
      this.workflowVO = res.workflowTasksVo;
      this.activity.labels = this.usersList;

      this.workflowLength = res.totalRecords;
      if (this.workflowLength !== 0 && this.workflowLength !== '0') {
        this.isWorkflowPaginator = true;
        this.isWorkFlowLength = true;
      } else {
        this.isWorkflowPaginator = false;
        this.isWorkFlowLength = false;
      }
      this.autoRefresh = true;
    });

  }
  pageEventForWorkflow(event) {
    this.paginatorsForWorkflow = event;
    this.loadWorkFlow();
  }

  pageEventForSingleTask(event) {
    this.paginatorsForWorkflow = event;
    this.loadList();
  }

  allWorkspaceChange(): void {
    this.myTaskService.isWorkspaceEmit.subscribe(data => {
      this.isWorkspace = data;
      this.getAllTaskNames(false);
      this.loadList();
    });
  }

  getPaginationForWorkflow() {
    this.paginationworkflowVO.taskName = this.taskName;
    this.paginationworkflowVO.taskType = this.taskType;
    this.paginationworkflowVO.allWorkspace = this.isWorkspace;
    if (this.sortForWorkflow === undefined || this.sortForWorkflow.active === undefined || this.sortForWorkflow.active === '') {
      this.paginationworkflowVO.columnName = this.defaultColumnForWorkflow;
    } else {
      this.paginationworkflowVO.columnName = this.sortForWorkflow.active;
    }
    if (this.sortForWorkflow === undefined || this.sortForWorkflow.direction === '' ||
      this.sortForWorkflow.direction === undefined || this.sortForWorkflow.direction === null) {
      this.paginationworkflowVO.direction = this.defaultSortDirection;
    } else {
      this.paginationworkflowVO.direction = this.sortForWorkflow.direction;
    }
    if (this.paginatorsForWorkflow.index) {
      this.paginationworkflowVO.index = this.paginatorsForWorkflow.index;
    } else {
      this.paginationworkflowVO.index = 0;
    }
    if (this.paginatorsForWorkflow.pageSize) {
      this.paginationworkflowVO.size = this.paginatorsForWorkflow.pageSize;
    } else {
      this.paginationworkflowVO.size = this.defaultPageSize;
    }
    return this.paginationworkflowVO;
  }

  getGroupNames(group) {
    let names = '';
    group.forEach(name => {
      if (names.length > 0) {
        names = ', ' + names + name.groupName;
      } else {
        names = names + name.groupName;
      }
    });
    return names;
  }
  getUserFirstAndLastNamePrefix(groupName) {
    if (groupName !== null) {
      let name = '';
      const array = groupName.split(' ');
      if (array[0] && array[1]) {
        name = array[0].charAt(0).toUpperCase() + array[1].charAt(0).toUpperCase();
      } else {
        name = array[0].charAt(0).toUpperCase();
      }
      return name;
    }
  }

  getUserColor(user: string): string {
    const filteredUser = this.usersList.find(u => u.firstName + ' ' + u.lastName === user);
    return filteredUser?.color;
  }

  getTeamColor(team: any): string {
    const group = this.groupList.find(t => t.name === team);
    return group?.color;
  }

  filterByTask(event) {
    this.isWorkflowPaginator = false;
    this.isWorkFlowLength = false;
    this.show = false;
    this.showFilter = true;
    this.taskType = event;
    this.taskList = [];
    this.indexList = [];
    if(this.taskType === 'all'){
      this.filterBy = 'All Task';
    }else if(this.taskType === 'user'){
      this.filterBy = 'My Assigned Task';
    }else{
      this.filterBy = 'My Team Task';
    }
    if (this.taskType === 'all' && this.taskName === 'all') {
      this.filterRefresh = true;
    } else {
      this.filterRefresh = false;
    }
    this.pageSize = 5;
    this.pageIndex = 0;
    this.paginatorsForWorkflow.index = 0;
    this.paginatorsForWorkflow.pageSize = 10;
    this.selectedItem = [];
    this.paginationworkflowVO.filterValue = [];
    if (this.showAll) {
      this.isWorkflowPaginator = false;
      this.loadWorkFlow();
    } else {
      this.isSingleWorkflowPaginator = false;
      if (this.taskType === 'all') {
        this.length = this.loadTotalCount;
      } else if (this.taskType === 'user') {
        this.length = this.loadUserCount;
      } else if (this.taskType === 'group') {
        this.length = this.loadGroupCount;
      }
      this.loadList();
    }
  }

  getAllTaskNames(reload: boolean) {
    this.taskListService.setMyTaskCount();
    this.taskListService.getAllTaskNames(this.isWorkspace).subscribe(data => {
      if (data) {
        this.taskNameList = data.allTaskNamesWithCount;
        // this.countEmitter.emit((+data.totalAssignedRecordsCount) + (+data.totalGroupRecordsCount));
        if ((this.totalAssignedRecordsCount !== data.totalAssignedRecordsCount
          || this.totalGroupRecordsCount !== data.totalGroupRecordsCount || reload)) {
          this.taskList = [];
          this.indexList = [];
          if (this.showAll) {
            this.loadWorkFlow();
          } else {
            const index = this.taskNameList.findIndex(param => param.taskName === this.taskName);
            if (index !== -1) {
              this.loadTotalCount = (this.taskNameList[index].groupCount + this.taskNameList[index].userCount) + '';
              this.loadUserCount = (this.taskNameList[index].userCount) + '';
              this.loadGroupCount = (this.taskNameList[index].groupCount) + '';
              if (this.taskType === 'all') {
                this.length = this.loadTotalCount;
              } else if (this.taskType === 'user') {
                this.length = this.loadUserCount;
              } else if (this.taskType === 'group') {
                this.length = this.loadGroupCount;
              }
            }
            this.loadList();
          }

        } else {
          this.autoRefresh = true;
        }
        this.totalGroupRecordsCount = data.totalGroupRecordsCount;
        this.totalAssignedRecordsCount = data.totalAssignedRecordsCount;
        this.taskNameList.forEach(element => {
          element.randomColor = this.getRandomColor();
        });

      }
    });
  }


  getTotalTaskCount() {
    this.myTaskService.getTotalTaskCount().subscribe(data => {
      this.totalDraftCount = data.draftRecordsCount;
      this.totalAssignedCount = data.assignedRecordsCount;
      this.totalGroupCount = data.groupRecordsCount;
    });
  }

  openUserTask() {
    this.activatedRoute.paramMap.subscribe(params => {
      const taskId = params.get('id');
      if (taskId) {
        this.openDialogForm(taskId);
      }
    });
  }
  openAllTask() {
    this.loadList();
    this.backGroundColor = this.themeService.primaryColor;
    this.selectedIndex = -1;
  }

  openTask(task, i) {
    this.showFilter = true;
    this.showAll = false;
    this.taskList = [];
    this.indexList = [];
    this.taskName = task.taskName;
    this.paginationworkflowVO.filterValue = [];
    if (this.taskType === 'all' && this.taskName === 'all') {
      this.filterRefresh = true;
    } else {
      this.filterRefresh = false;
    }
    if (i === -1) {
      this.backGroundColor = this.themeService.primaryColor;
      this.themeService.themeEmittter.subscribe(data => {
        this.backGroundColor = this.themeService.primaryColor;
      });
    } else {
      this.backGroundColor = '#f5f5f5';
    }
    this.selectedIndex = i;

    if (this.mobileQuery.matches || this.ipadResolution.matches || this.ipadProResolution.matches) {
      this.sidenav.close();
    }
    this.loadTotalCount = (task.groupCount + task.userCount) + '';
    this.loadUserCount = (task.userCount) + '';
    this.loadGroupCount = (task.groupCount) + '';
    if (this.taskType === 'all') {
      this.length = (task.groupCount + task.userCount) + '';
    } else if (this.taskType === 'user') {
      this.length = (task.userCount) + '';
    } else if (this.taskType === 'group') {
      this.length = (task.groupCount) + '';
    }

    if (this.showAll) {
      this.isWorkflowPaginator = false;
    } else {
      this.isSingleWorkflowPaginator = false;
    }
    this.paginatorsForWorkflow.index = 0;
    this.paginatorsForWorkflow.pageSize = 10;
    this.paginatorsForWorkflow.totalRecords = this.length;
    const form = (this.dynamicForm.get('filters') as FormArray);
    form.clear();
    this.selectedItem = [];
    this.loadList();
  }

  loadMore() {
    if (this.paginationVO.size) {
      this.autoRefresh = false;
      const size = this.paginationVO.size;
      if (this.taskName === 'all') {
        const index = this.paginationVO.filterIndex;
        this.pageIndex = index + 1;
      } else {
        this.taskList = [];
        this.indexList = [];
      }
      this.pageSize = size + 5;
      this.loadList();
    }
  }

  loadList() {

    this.taskListService.getTaskList(this.getPaginationForWorkflow()).subscribe(data => {
      this.pendingUserTask = false;
      if (data.taskType === this.taskType && data.taskName === this.taskName) {
        this.taskList = data.allTaskLists;
        this.taskCount = data.taskCount;
        this.groupCount = data.totalGroupRecordsCount;
        this.userCount = data.totalAssignedRecordsCount;
        if (!this.isSingleWorkflowPaginator && this.length !== '0') {
          this.isSingleWorkflowPaginator = true;
          this.isSingleWorkflowLength = true;
        } else if (this.length === '0') {
          this.isSingleWorkflowPaginator = false;
          this.isSingleWorkflowLength = false;
        }
      }
      this.autoRefresh = true;
      this.reload = false;
    });
  }

  getFiltersFields(value) {
    this.paginationVO.filterValue = [];
    this.filterHeadersList.forEach(param => {
      if (param !== 'star') {
        const filterValue = new FilterValuesVO();
        filterValue.operators = 'cn';
        filterValue.filterIdColumnValue = value;
        filterValue.filterIdColumn = param;
        filterValue.filterDataType = 'string';
        this.paginationVO.filterValue.push(filterValue);
      }
    });
  }

  getFilterHeaderList(taskList) {
    this.taskHeadersList = [];
    this.filterHeadersList = [];
    taskList.forEach(element => {
      element.fieldHeaders.forEach(param => {
        if (param !== 'star') {
          this.filterHeadersList.push(param);
          this.taskHeadersList.push(param);
        }
      });
    });

  }

  searchFilter() {
    this.paginationVO.index = 0;
    const searchValue = this.form.get('searchValue');
    searchValue.valueChanges.pipe(debounceTime(500)).subscribe(data => {
      if (searchValue.value !== '') {
        this.getFiltersFields(searchValue.value);
        this.paginationVO.forFilterList = true;
        this.indexList = [];
        this.taskList = [];
        this.loadList();
      } else {
        this.paginationVO.filterValue = [];
        this.paginationVO.forFilterList = false;
        this.indexList = [];
        this.taskList = [];
        this.pageIndex = 0;
        this.loadList();
      }
    });
  }



  setFilterColumn(event, columnName) {
    if (this.filterHeadersList) {
      const findIndex = this.filterHeadersList.findIndex(x => x === columnName);
      if (event.checked === false) {
        if (findIndex !== -1) {
          this.filterHeadersList.splice(findIndex, 1);
        }
      } else if (event.checked === true) {
        this.filterHeadersList.push(columnName);
      }
    }

  }




  loadTaskBackground() {
    this.myTaskService.getTaskBackground().subscribe(colors => {
      if (colors) {
        this.taskBackground = colors;
      }
    });
  }

  AutoRefresh(event) {
    if (event.checked === true) {
      this.sub = Observable.interval(30000)
        .subscribe((val) => {
          if (this.autoRefresh) {
            this.getAllTaskNames(false);
            this.autoRefresh = false;
          }
        });
      this.router.events.subscribe(data => {
        if (data) {
          this.sub.unsubscribe();
        }
      });
    } else if (event.checked === false) {
      this.sub.unsubscribe();
    }
  }

  cancelTask(task) {
    const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
      width: '400px',
      data: { type: 'cancelTask' }
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === true) {
        let taskDetailsRequest = null;
        if (this.showAll) {
          taskDetailsRequest = { instanceId: task.instanceId, instanceTaskId: task.id, taskData: null };
        } else {
          taskDetailsRequest = { instanceId: task.instanceId, instanceTaskId: task.instanceTaskId, taskData: null };
        }
        this.taskListService.cancelTask(taskDetailsRequest).subscribe((data: any) => {
          if (data.canProceed === true) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Task cancelled successfully'
            });
            this.reloadTasks();
          }
        });
      }
    });
  }



  openDialogForm(taskId) {
    if (taskId != null) {
      window.history.pushState('', 'Title', this.workspaceService.getWorkSpaceKey() + '/mytask/my-pending-task/' + taskId);
      this.myTaskService.getTaskInfo(taskId).subscribe(task => {
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
            window.history.pushState('', 'Title', this.workspaceService.getWorkSpaceKey() + '/mytask/my-pending-task');
            if (taskData === true) {
              this.reloadTasks();
            } else if (taskData === 'saveAsDraft') {
              this.reloadTasks();
            }
          });
        }
      });
    }
  }


  openForm(task, status) {
    // if (status === 'groupTask') {
    //   this.assignedToMe(task, status);
    // } else {
    this.openDialogForm(task.instanceTaskId);
    // }
  }
  openTable(task, status) {
    // if (status === 'groupTask') {
    //   this.assignedToMe(task, status);
    // } else {
    this.openDialogForm(task);
    // }
  }


  openCompletedForm(taskId) {
    this.openDialogForm(taskId);
  }

  reloadTasks() {
    this.indexList = [];
    this.taskList = [];
    this.reload = true;
    this.getAllTaskNames(true);
  }

  assignedToMe(task, status) {
    this.reassignTaskVo.instanceId = task.instanceId;
    if (this.taskName === 'all') {
      this.reassignTaskVo.assignedToUser = task.assignToId;
      this.reassignTaskVo.instanceTaskId = task.id;
      this.reassignTaskVo.assignedToGroup = null;
    } else {
      this.reassignTaskVo.assignedToUser = task.assignedToUser;
      this.reassignTaskVo.assignedToGroup = task.assignedToGroup;
    }
    this.reassignTaskVo.status = status;

    this.taskListService.reAssignTask(this.reassignTaskVo).subscribe((reassign: any) => {
      if (reassign.reassigned === true) {
        this.reloadTasks();
        if (status !== 'userTask') {
          this.openDialogForm(task.processInstanceTaskId);
        }
      } else {
        const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
          width: '400px',
          data: { json: reassign, type: 'reassign' }
        });
        dialogRef.afterClosed().subscribe(taskData => {
          if (taskData === true) {
            this.reloadTasks();
          }
        });
      }
    });
  }

  addFilterColumsForLaunchedTask(status) {
    if (status === 'launched') {
      this.filterColumns = [];
      const taskName = new FieldValueVO();
      taskName.fieldId = 'Task Name';
      taskName.fieldName = 'Task Name';
      taskName.datatype = 'string';
      this.filterColumns.push(taskName);
      const startDate = new FieldValueVO();
      startDate.fieldId = 'Start Date';
      startDate.fieldName = 'Start Date';
      startDate.datatype = 'date';
      this.filterColumns.push(startDate);
      const Status = new FieldValueVO();
      Status.fieldId = 'Status';
      Status.fieldName = 'Status';
      Status.datatype = 'string';
      this.filterColumns.push(Status);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.filterColumns.length; i++) {
        const filterColumnValue = {
          fieldId: this.filterColumns[i].fieldId,
          value: this.filterColumns[i].fieldId,
          values: this.filterColumns[i].fieldId,
          color: '#5d4e9e'
        };
        this.filterValues.push(filterColumnValue);
      }
    }
  }

  getData(fieldVO) {
    if (fieldVO !== undefined) {
      if (fieldVO !== undefined && fieldVO !== null && fieldVO !== '' && fieldVO !== 'null' &&
        isNaN(fieldVO)
        && (new Date(fieldVO).toString() !== 'Invalid Date')) {
        return this.getBrowsertime(fieldVO);
      } else {
        return fieldVO;
      }
    }
  }


  getRandomColor() {
    return '#' + ('000000' + Math.floor(Math.random() * 16777216).toString(16)).substr(-6);
  }



  callFilterValues() {
    this.taskListService.getFilterList(this.getPaginationInfo()).subscribe(filter => {
      this.enableFilterField = true;
      this.filterColumns = [];
      let count = 0;
      if (filter) {
        this.enableFilters = true;
        this.filterValues = [];
        filter.forEach(fieldName => {
          if (!this.filterColumns.some(filterColumn => filterColumn.fieldId === fieldName.fieldId)) {
            this.filterColumns.push(fieldName);
            count++;
            const filterColumnValue = {
              fieldId: fieldName.fieldId,
              value: fieldName.fieldId,
              values: fieldName.fieldId,
            };
            this.filterValues.push(filterColumnValue);
          }
        });
      } else {
        this.enableFilters = false;
      }
      this.filterEnable();
    });
  }
  filterEnable() {
    const forms = (this.form.get('filters') as FormArray);
    for (let i = 0; i < forms.length; i++) {
      const index = '' + i;
      const form = (this.form.get('filters') as FormArray).get(index);
      if (this.enableFilters === false) {
        form.get('filterIdColumnValue').disable();
        form.get('operators').disable();
        form.get('filterIdColumn').disable();
      } else {
        form.get('filterIdColumnValue').enable();
        form.get('operators').enable();
        form.get('filterIdColumn').enable();
      }
    }
  }


  dateChange(event) {
    const input = event.targetElement;
    const filterVO = new FilterVO();
    filterVO.value = input.value;
    filterVO.color = 'primary';
    this.filterField.push(filterVO);
    this.enableDatePicker = false;
    this.datePicker = false;
    this.filterFieldValues.push(new Date(this.form.get('chip').value).toISOString());
    this.filterColumns.forEach(fieldName => {
      const filterColumnValue = {
        fieldId: fieldName.fieldId,
        value: fieldName.fieldId,
        values: fieldName.fieldId,
      };
      this.filterValues.push(filterColumnValue);
    });
    if (input.value) {
      input.value = '';
    }

  }

  add(event) {
    if (this.filterField.length === 0 && this.status !== 'launched') {
      this.form.get('wildSearch').setValue(this.form.get('chip').value);
      this.filterValues = [];
      this.filterField.push({ value: this.form.get('chip').value });
      const input = event.input;
      if (input) {
        input.value = '';
      }
    } else {
      if ((this.filterFieldValues.length + 1) % 3 === 0) {
        const input = event.input;
        const value = event.value;
        const Status = new FieldValueVO();
        const filterVO = new FilterVO();
        if ((value || '').trim()) {
          filterVO.value = value.trim();
          filterVO.color = 'primary';
          this.filterField.push(filterVO);
          this.filterFieldValues.push(this.form.get('chip').value);
          this.remove.push(value);
          this.filterColumns.forEach(fieldName => {
            const filterColumnValue = {
              fieldId: fieldName.fieldId,
              value: fieldName.fieldId,
              values: fieldName.fieldId,
            };
            this.filterValues.push(filterColumnValue);
          });
        }
        if (input) {
          input.value = '';
        }
      }
    }
  }



  removeItemsFromChipList(filterColumn) {
    if (this.form.get('wildSearch').value !== '' && this.form.get('wildSearch').value !== null
     && this.form.get('wildSearch').value !== undefined) {
      this.clearFilterValues();
    } else {
      const index = this.filterFieldValues.length - 1;
      if (this.filterField.length % 3 === 0) {
        this.filterColumns.forEach(filter => {
          if (filter.fieldId === this.filterField[this.filterField.length - 3].value) {
            if (filter.datatype === 'date') {
              this.datePicker = true;
              this.enableDatePicker = true;
              this.form.get('chip').setValue('');
            } else {
              this.datePicker = false;
              this.enableDatePicker = false;
            }
          }
        });
      } else {
        this.datePicker = false;
        this.enableDatePicker = false;
      }
      if (index >= 0) {
        if ((this.filterFieldValues.length - 1) % 3 === 0) {
          if (this.filterDataType.length !== 0) {
            this.filterDataType.splice(this.filterDataType.length - 1, 1);
            this.filterDataTypeIndex = this.filterDataType.length - 1;
          }
        }
        this.filterField.splice(index, 1);
        this.filterFieldValues.splice(index, 1);
        if (this.filterFieldValues.length % 3 !== 0) {
          this.getDataType(0, this.filterFieldValues[index - 1], this.filterDataTypeIndex);
        } else {
          this.filterValues = [];
          this.filterColumns.forEach(fieldName => {
            const filterColumnValue = {
              fieldId: fieldName.fieldId,
              value: fieldName.fieldId,
              values: fieldName.fieldId,
            };
            this.filterValues.push(filterColumnValue);
          });
        }
      }
    }
  }

  clearFilterValues() {
    this.filterField = [];
    this.filterValues = [];
    this.datePicker = false;
    this.filterColumns.forEach(fieldName => {
      const filterColumnValue = {
        fieldId: fieldName.fieldId,
        value: fieldName.fieldId,
        values: fieldName.fieldId,
      };
      this.filterValues.push(filterColumnValue);
    });
    const value = this.form.get('filters').value;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < value.length; i++) {
      (this.form.get('filters') as FormArray).removeAt(0);
    }
    this.form.get('wildSearch').setValue('');
    this.addAnotherFilter();
    this.filterFieldValues = [];
    this.filterDataType = [];
    this.filterDataTypeIndex = 0;
    this.enableDatePicker = false;
  }

  clearFilter() {
    if (this.filterField.length > 0) {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '400px',
        data: 'chipCancel'
      });
      dialog.afterClosed().subscribe(data => {
        if (data === true) {
          this.clearFilterValues();
        }
      });
    }
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit() {
    // tslint:disable-next-line: max-line-length
  }

  task(i) {
  }

  getPaginationInfo() {
    this.changeDetectorRef.detectChanges();



    if (this.taskNameList.length > 0) {
      if (this.taskNameList[this.selectedIndex] !== undefined) {
        this.taskName = this.taskNameList[this.selectedIndex].taskName;
      } else if (this.selectedIndex === -1) {
        this.taskName = 'all';
      }

    }

    this.paginationVO.columnName = 'startTime';
    this.paginationVO.direction = 'asc';
    this.paginationVO.size = this.pageSize;
    this.paginationVO.index = 0;
    this.paginationVO.filterIndex = this.pageIndex;
    this.paginationVO.taskName = this.taskName;
    this.paginationVO.taskType = this.taskType;
    return this.paginationVO;
  }
  tasksPassedDueDate(event) {
    this.taskPassedDueDate = event.checked;
    this.paginationVO.taskStatus = this.status;
  }

  initializeFilterForm() {
    this.form = this.fb.group({
      wildSearch: [''],
      searchValue: [''],
      taskType: ['all'],
      filterColumnName: [''],
      filters: this.fb.array([
        this.addFilter()
      ])
    });
  }

  addFilter(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      filterDataType: ['']
    });
  }

  getFiltersFormArray() {
    return (this.form.get('filters') as FormArray).controls;
  }

  addAnotherFilter() {

    (this.form.get('filters') as FormArray).push(this.addFilter());
  }

  removeThisService(i: number) {
    (this.form.get('filters') as FormArray).removeAt(i);
  }

  addFilterValues(i, value) {
    if (i === 0) {
      value = 0;
    }
    (this.form.get('filters') as FormArray).push(this.addFilter());

    const group = ((this.form.get('filters') as FormArray).get('' + i) as FormGroup);
    group.get('filterIdColumn').setValue(this.filterFieldValues[value]);
    group.get('operators').setValue(this.filterFieldValues[value + 1]);
    group.get('filterIdColumnValue').setValue(this.filterFieldValues[value + 2]);
    group.get('filterDataType').setValue(this.filterDataType[i]);
  }




  checkValidation(index: number) {
    const i = '' + index;
    const form = (this.form.get('filters') as FormArray).get(i);
    const formRemove = (this.form.get('filters') as FormArray);
    const filterIdColumnValue = form.get('filterIdColumnValue');
    const operators = form.get('operators');
    const filterIdColumn = form.get('filterIdColumn');
    const filterDataType = form.get('filterDataType');
    filterIdColumnValue.markAllAsTouched();
    operators.markAllAsTouched();
    filterIdColumn.markAllAsTouched();
    if (!filterIdColumnValue.value && !operators.value && !filterIdColumn.value && index !== 0) {
      formRemove.removeAt(index);
    } else if (!filterIdColumnValue.value && !operators.value && !filterIdColumn.value && index === 0) {
      operators.setErrors({ operatorsRequired: true });
      filterIdColumn.setErrors({ filterIdColumnRequired: true });
      if (filterDataType.value !== 'boolean') {
        filterIdColumnValue.setErrors({ filterIdColumnValueRequired: true });
      }
    }
    if (!filterIdColumn.value) {
      filterIdColumn.setErrors({ filterIdColumnRequired: true });
    }
    if (!operators.value) {
      operators.setErrors({ operatorsRequired: true });
    }
    if (!filterIdColumnValue.value && filterDataType.value !== 'boolean') {
      filterIdColumnValue.setErrors({ filterIdColumnValueRequired: true });
    }
    if (filterIdColumn.value && operators.value && filterIdColumnValue.value) {
      operators.setErrors(null);
      filterIdColumn.setErrors(null);
      filterIdColumnValue.setErrors(null);
    }

  }


  reset() {
    this.form.reset();
    this.paginationVO.index = 0;
    this.paginationVO.wildSearch = '';
    this.filterFieldValues = [];
    this.filterField = [];
    this.loadList();
    this.getTotalTaskCount();
    this.filterDataType = [];
    this.datePicker = false;
    this.enableDatePicker = false;
  }

  close(i, filterColumn) {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      data: 'removeFilter'
    });
    dialog.afterClosed().subscribe(data => {
      if (data === true) {
        for (let j = 0; j <= 2; j++) {
          this.filterField.splice(i - j, 1);
          this.filterFieldValues.splice(i - j, 1);
        }
        let length = i % 3;
        if (i === 2) {
          length = 1;
        }
        const k = length - 1;
        if (this.form.get('filters').get('' + k).get('operators') && this.form.get('filters').get('' + k).get('operators').value) {
          (this.form.get('filters') as FormArray).removeAt(length - 1);
          const value = this.form.get('filters').value;
          if (value.length === 0) {
            this.addAnotherFilter();
          }
        }
        this.filterDataType.splice(length - 1, 1);
        this.filterDataTypeIndex = this.filterDataTypeIndex - 1;
        const index = this.remove.indexOf(filterColumn.value);
        this.remove.splice(index, 1);
      }
    });
  }

  getIcon(i) {
    if ((i + 1) % 3 === 0) {
      return true;
    } else {
      return false;
    }
  }

  selected(event: MatAutocompleteSelectedEvent, i): void {
    const filter: any[] = [];
    const filterVO = new FilterVO();
    if (event.option.viewValue === '=equals') {
      filterVO.value = '=';
      filterVO.color = 'accent';
      this.filterField.push(filterVO);
    } else if (event.option.viewValue === '>greater than') {
      filterVO.value = '>';
      filterVO.color = 'accent';
      this.filterField.push(filterVO);
    } else if (event.option.viewValue === '>=greater than or equal to') {
      filterVO.value = '>=';
      filterVO.color = 'accent';
      this.filterField.push(filterVO);
    } else if (event.option.viewValue === '<less than') {
      filterVO.value = '<';
      filterVO.color = 'accent';
      this.filterField.push(filterVO);
    } else if (event.option.viewValue === '<=less than or equal to') {
      filterVO.value = '<=';
      filterVO.color = 'accent';
      this.filterField.push(filterVO);
    } else if (event.option.viewValue === 'a%begins with') {
      filterVO.value = 'a%';
      filterVO.color = 'accent';
      this.filterField.push(filterVO);
    } else if (event.option.viewValue === '%aends with') {
      filterVO.value = '%a';
      filterVO.color = 'accent';
      this.filterField.push(filterVO);
    } else if (event.option.viewValue === '!=false') {
      filterVO.value = '!=';
      filterVO.color = 'accent';
      this.filterField.push(filterVO);
    } else if (event.option.viewValue === '=true') {
      filterVO.value = '=';
      filterVO.color = 'accent';
      this.filterField.push(filterVO);
    } else if (event.option.viewValue === '_%_contains') {
      filterVO.value = '_%_';
      filterVO.color = 'accent';
      this.filterField.push(filterVO);
    } else {
      filterVO.value = event.option.viewValue;
      filterVO.color = 'primary';
      this.filterField.push(filterVO);
    }

    if (this.datePicker === true) {
      this.enableDatePicker = true;
    }

    if ((this.filterField.length + 1) % 3 === 0) {
      this.filterColumns.forEach(filter => {
        if (filter.fieldId === this.filterField[this.filterField.length - 2].value) {
          if (filter.datatype === 'date') {
            this.datePicker = true;
            this.enableDatePicker = true;
          } else {
            this.datePicker = false;
            this.enableDatePicker = false;
          }
        }
      });
    }

    this.filterFieldValues.push(this.form.get('chip').value);

    if (this.filterField.length % 3 !== 0) {
      if (this.filterDataType.length !== 0 && (this.filterFieldValues.length - 1) % 3 === 0) {
        this.filterDataTypeIndex = this.filterDataType.length;
      }
      this.getDataTypeForLaunchedTasks(this.filterDataTypeIndex);
      this.form.get('chip').markAsUntouched();
      this.getDataType(i, event.option.viewValue, this.filterDataTypeIndex);
    } else {
      this.filterColumns.forEach(fieldName => {
        const filterColumnValue = {
          fieldId: fieldName.fieldId,
          value: fieldName.fieldId,
          values: fieldName.fieldId,
        };
        this.filterValues.push(filterColumnValue);
      });
    }
    this.form.get('chip').markAsTouched();
  }

  getDataTypeForLaunchedTasks(filterDataTypeIndex: any) {
    if (this.filterFieldValues[this.filterFieldValues.length - 1] === 'Start Date') {
      this.filterDataType[filterDataTypeIndex] = 'date';
    } else if (this.filterFieldValues[this.filterFieldValues.length - 1] === 'Task Name'
      || this.filterFieldValues[this.filterFieldValues.length - 1] === 'Status') {
      this.filterDataType[filterDataTypeIndex] = 'string';
    }
  }

  getDataType(i: any, headerId: any, filterDataTypeIndex: any) {
    const index = '' + i;
    const form = (this.form.get('filters') as FormArray).get(index);
    const filterDataType = form.get('filterDataType');
    this.filterValues = [];
    if ((headerId || '').trim()) {
      this.filterColumns.forEach(filter => {
        if (filter.fieldId === headerId.trim()) {
          if (filter.datatype === 'string' || filter.datatype === 'text') {
            this.filterDataType[filterDataTypeIndex] = 'string';
            filterDataType.setValue(filter.datatype);
            const filterColumnValue = this.dataType[filter.datatype];
            for (let i = 0; i < filterColumnValue.length; i++) {
              this.filterValues.push(filterColumnValue[i]);
            }
            this.datePicker = false;
            this.enableDatePicker = false;
            this.form.get('chip').markAsTouched();
            this.elemnt.click();
          } else if (filter.datatype === 'long' ||
            filter.datatype === 'double' || filter.datatype === 'date') {
            if (filter.datatype === 'date') {
              this.filterDataType[filterDataTypeIndex] = 'date';
            } else {
              this.filterDataType[filterDataTypeIndex] = 'number';
            }
            filterDataType.setValue(filter.datatype);
            const filterColumnValue = this.dataType.number;
            for (let i = 0; i < filterColumnValue.length; i++) {
              this.filterValues.push(filterColumnValue[i]);
            }
            if (filter.datatype === 'date') {
              this.datePicker = true;
            } else {
              this.datePicker = false;
              this.enableDatePicker = false;
            }
            this.form.get('chip').markAsTouched();
          } else if (filter.datatype === 'boolean') {
            this.filterDataType[filterDataTypeIndex] = 'boolean';
            filterDataType.setValue('boolean');
            const filterColumnValue = this.dataType[filter.datatype];
            for (let i = 0; i < filterColumnValue.length; i++) {
              this.filterValues.push(filterColumnValue[i]);
            }
            this.datePicker = false;
            this.enableDatePicker = false;
            this.form.get('chip').markAsTouched();
          } else {
            filterDataType.setValue(null);
          }
        }
      });
    }
  }

  getBrowsertime(utcTime) {
    if (utcTime !== undefined && utcTime !== null && utcTime !== '' && utcTime !== 'null' &&
      (new Date(utcTime).toString() !== 'Invalid Date')) {
      return this.datepipe.transform(moment.utc(utcTime).toDate(), 'MMM d, y, h:mm:ss a');
    } else {
      return utcTime;
    }
  }
  open_collapse() {
    this.showCollapse = true;
  }
  close_collapse() {
    this.showCollapse = false;
  }
  setDataType(column) {
    this.columnId = column.headerName;
    if (column.dataType === 'string') {
      this.filterOperator = 'string';
      this.isDateField = false;
      this.type = 'text';
    } else if (column.dataType === 'date') {
      this.filterOperator = 'number';
      this.isDateField = true;
      this.type = null;
    }
    this.filterDatatype = column.dataType;
    const form = (this.dynamicForm.get('filters') as FormArray);
    this.dynamicForm.get('filterValue').setValue(null);
    this.dynamicForm.get('operator').setValue(null);
    this.dynamicForm.get('filterValue').setValidators(null);
    this.dynamicForm.get('filterValue').setErrors(null);
    this.dynamicForm.get('operator').setValidators(null);
    this.dynamicForm.get('operator').setErrors(null);
    for (let i = 0; i < form.length; i++) {
      if (form.get('' + i).get('filterIdColumn').value && form.get('' + i).get('filterIdColumn').value === this.columnId) {
        this.dynamicForm.get('filterValue').setValue(form.get('' + i).get('filterIdColumnValue').value);
        this.dynamicForm.get('operator').setValue(form.get('' + i).get('operators').value);
        this.dynamicForm.get('filterDataType').setValue(this.filterDatatype);
        this.dynamicForm.get('filterValue').setValidators(null);
        this.dynamicForm.get('filterValue').setErrors(null);
        this.dynamicForm.get('operator').setErrors(null);
      }
    }

  }


  setDataTypeForWorkflow(headerDetails, datatype) {
    if (headerDetails === 'assignedToGroupWorkflow') {
      this.columnId = headerDetails;
    } else {
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
      this.workflowForm.get('filterValue').setValidators(null);
      this.workflowForm.get('filterValue').setErrors(null);
      this.workflowForm.get('operator').setValidators(null);
      this.workflowForm.get('operator').setErrors(null);
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
  }
  filterApplyForWorkflow() {

    let setFilter = false;
    this.addValidations();
    this.workflowForm.get('filterValue').markAsTouched();
    this.workflowForm.get('operator').markAsTouched();
    if ((this.workflowForm.get('filters') as FormArray).length === 0) {
      (this.workflowForm.get('filters') as FormArray).push(this.addFilterForWorkflowList());
    }
    for (let i = 0; i < (this.workflowForm.get('filters') as FormArray).length; i++) {
      if (this.workflowForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        this.workflowForm.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        this.workflowForm.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.workflowForm.get('filterValue').value);
        this.workflowForm.get('filters').get('' + i).get('operators').setValue(this.workflowForm.get('operator').value);
        this.workflowForm.get('filters').get('' + i).get('dataType').setValue(this.filterDatatype);
      } else {
        let array = [];
        array = (this.workflowForm.get('filters') as FormArray).value;
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCountForWorkflow++;
          if (this.filterCountForWorkflow >= 1) {
            (this.workflowForm.get('filters') as FormArray).push(this.addFilterForWorkflowList());
          }
          const length = (this.workflowForm.get('filters') as FormArray).length - 1;
          this.workflowForm.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          this.workflowForm.get('filters').get('' + length).get('filterIdColumnValue').setValue(this.workflowForm.get('filterValue').value);
          this.workflowForm.get('filters').get('' + length).get('operators').setValue(this.workflowForm.get('operator').value);
          this.workflowForm.get('filters').get('' + length).get('dataType').setValue(this.filterDatatype);
        }
      }
    }
    this.paginationworkflowVO.index = 0;
    if (this.workflowForm.valid) {
      const index = this.selectedItem.findIndex(t => t === this.columnId);
      if (index === -1) {
        this.selectedItem.push(this.columnId);
      }
      this.inputForWorkflow.closeMenu();
      const form = (this.workflowForm.get('filters') as FormArray);
      this.paginationworkflowVO.filterValue = form.value;
      this.paginatorsForWorkflow.index = 0;
      this.paginatorsForWorkflow.pageSize = 10;
      this.loadWorkFlow();
      this.emptyworkPaginator();
      this.removeValidations();
    }
  }
  addValidations() {

    this.workflowForm.get('filterValue').setValidators([Validators.required]);
    this.workflowForm.get('operator').setValidators([Validators.required]);
    this.workflowForm.get('filterValue').updateValueAndValidity();
    this.workflowForm.get('operator').updateValueAndValidity();
  }
  removeValidations() {
    this.workflowForm.get('filterValue').setValidators(null);
    this.workflowForm.get('operator').setValidators(null);
    this.workflowForm.get('filterValue').updateValueAndValidity();
    this.workflowForm.get('operator').updateValueAndValidity();

  }

  addDynamicValidations() {
    this.dynamicForm.get('filterValue').setValidators([Validators.required]);
    this.dynamicForm.get('operator').setValidators([Validators.required]);
    this.dynamicForm.get('filterValue').updateValueAndValidity();
    this.dynamicForm.get('operator').updateValueAndValidity();
  }
  removeDynamicValidations() {
    this.dynamicForm.get('filterValue').setValidators(null);
    this.dynamicForm.get('operator').setValidators(null);
    this.dynamicForm.get('filterValue').updateValueAndValidity();
    this.dynamicForm.get('operator').updateValueAndValidity();
  }

  clearFilterForDynamic() {
    const index = this.selectedItem.findIndex(t => t === this.columnId);
    if (index !== -1) {
      this.selectedItem.splice(index, 1);
    }
    if ((this.dynamicForm.get('filterValue').value !== null
      || this.dynamicForm.get('filterValue').value !== undefined ||
      this.dynamicForm.get('filterValue').value !== '')
      && (this.dynamicForm.get('operator').value !== null || this.dynamicForm.get('operator').value !== undefined || this.dynamicForm.get('operator').value !== '')) {
      this.dynamicForm.get('filterValue').setValue(null);
      this.dynamicForm.get('operator').setValue(null);
      this.filterCountForDynamic--;
      for (let i = 0; i < (this.dynamicForm.get('filters') as FormArray).length; i++) {
        if (this.dynamicForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.dynamicForm.get('filters') as FormArray).removeAt(i);
          if (this.showAll) {
            this.inputForWorkflow.closeMenu();
          }
          this.isSingleWorkflowPaginator = false;
          this.paginatorsForWorkflow.index = 0;
          this.paginatorsForWorkflow.pageSize = 10;
          this.paginatorsForWorkflow.totalRecords = this.length;
          const form = (this.dynamicForm.get('filters') as FormArray);
          this.paginationworkflowVO.filterValue = form.value;
          this.removeEmptyArray();
          this.loadList();
          this.emptyworkPaginator();
          this.dynamicForm.markAsUntouched();
        }
      }
    }
  }
  clearFilterForWorkflow() {
    const index = this.selectedItem.findIndex(t => t === this.columnId);
    if (index !== -1) {
      this.selectedItem.splice(index, 1);
    }
    if ((this.workflowForm.get('filterValue').value !== null ||
      this.workflowForm.get('filterValue').value !== undefined ||
      this.workflowForm.get('filterValue').value !== '')
      && (this.workflowForm.get('operator').value !== null ||
        this.workflowForm.get('operator').value !== undefined ||
        this.workflowForm.get('operator').value !== '')) {
      this.workflowForm.get('filterValue').setValue(null);
      this.workflowForm.get('operator').setValue(null);
      this.filterCountForWorkflow--;
      for (let i = 0; i < (this.workflowForm.get('filters') as FormArray).length; i++) {
        if (this.workflowForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.workflowForm.get('filters') as FormArray).removeAt(i);
          this.inputForWorkflow.closeMenu();
          this.paginatorsForWorkflow.index = 0;
          this.paginatorsForWorkflow.pageSize = 10;
          const form = (this.workflowForm.get('filters') as FormArray);
          this.paginationworkflowVO.filterValue = form.value;
          this.loadWorkFlow();
          this.emptyworkPaginator();
          this.workflowForm.markAsUntouched();
        }
      }
    }
  }

  clearFilterForAll() {
    if (this.showAll) {
      this.inputForWorkflow.closeMenu();
      this.paginatorsForWorkflow.index = 0;
      this.paginatorsForWorkflow.pageSize = 10;
      const form = (this.workflowForm.get('filters') as FormArray);
      form.clear();
      this.paginationworkflowVO.filterValue = form.value;
      this.loadWorkFlow();
      this.emptyworkPaginator();
      this.workflowForm.markAsUntouched();
      this.selectedItem = [];
      this.checkAssignedTo = false;
      if (this.assignedWorkflowGroup && this.assignedWorkflowGroup.length > 0) {
        for (let i = 0; i < this.assignedWorkflowGroup.length; i++) {
          this.assignedWorkflowGroup[i].isSelected = false;
        }
      }
    } else {
      this.paginatorsForWorkflow.index = 0;
      this.paginatorsForWorkflow.pageSize = 10;
      const form = (this.dynamicForm.get('filters') as FormArray);
      form.clear();
      this.paginationworkflowVO.filterValue = form.value;
      this.loadList();
      this.emptyworkPaginator();
      this.dynamicForm.markAsUntouched();
      this.selectedItem = [];
    }
  }

  emptyworkPaginator() {
    this.isWorkflowPaginator = false;
    this.isWorkFlowLength = false;
  }
  clearAllWorkflow() {
    const index = this.selectedItem.findIndex(t => t === this.columnId);
    if (index !== -1) {
      this.selectedItem.splice(index, 1);
    }
    if ((this.workflowForm.get('filterValue').value !== null ||
      this.workflowForm.get('filterValue').value !== undefined ||
      this.workflowForm.get('filterValue').value !== '')
      && (this.workflowForm.get('operator').value !== null ||
        this.workflowForm.get('operator').value !== undefined ||
        this.workflowForm.get('operator').value !== '')) {
      this.workflowForm.get('filterValue').setValue(null);
      this.workflowForm.get('operator').setValue(null);
      this.filterCountForWorkflow--;
      for (let i = 0; i < (this.workflowForm.get('filters') as FormArray).length; i++) {
        if (this.workflowForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.workflowForm.get('filters') as FormArray).removeAt(i);
          this.inputForWorkflow.closeMenu();
          this.paginatorsForWorkflow.index = 0;
          this.paginatorsForWorkflow.pageSize = 10;
          const form = (this.workflowForm.get('filters') as FormArray);
          this.paginationworkflowVO.filterValue = form.value;
          this.loadWorkFlow();
          this.emptyworkPaginator();
        }
      }
    }
  }

  dynamicFilterApply() {
    let setFilter = false;
    this.addDynamicValidations();
    this.dynamicForm.get('filterValue').markAsTouched();
    this.dynamicForm.get('operator').markAsTouched();
    if ((this.dynamicForm.get('filters') as FormArray).length === 0) {
      (this.dynamicForm.get('filters') as FormArray).push(this.addDynamicFilter());
    }
    for (let i = 0; i < (this.dynamicForm.get('filters') as FormArray).length; i++) {
      if (this.dynamicForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        this.dynamicForm.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        this.dynamicForm.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.dynamicForm.get('filterValue').value);
        this.dynamicForm.get('filters').get('' + i).get('operators').setValue(this.dynamicForm.get('operator').value);
        this.dynamicForm.get('filters').get('' + i).get('filterDataType').setValue(this.filterDatatype);
      } else {
        let array = [];
        array = (this.dynamicForm.get('filters') as FormArray).value;
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCountForDynamic++;
          if (this.filterCountForDynamic >= 1) {
            (this.dynamicForm.get('filters') as FormArray).push(this.addDynamicFilter());
          }
          const length = (this.dynamicForm.get('filters') as FormArray).length - 1;
          this.dynamicForm.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          this.dynamicForm.get('filters').get('' + length).get('filterIdColumnValue').setValue(this.dynamicForm.get('filterValue').value);
          this.dynamicForm.get('filters').get('' + length).get('operators').setValue(this.dynamicForm.get('operator').value);
          this.dynamicForm.get('filters').get('' + length).get('filterDataType').setValue(this.filterDatatype);
        }
      }
    }
    if (this.dynamicForm.valid) {
      const index = this.selectedItem.findIndex(t => t === this.columnId);
      if (index === -1) {
        this.selectedItem.push(this.columnId);
      }
      this.paginationworkflowVO.index = 0;
      const form = (this.dynamicForm.get('filters') as FormArray);
      this.paginationworkflowVO.filterValue = form.value;
      this.paginatorsForWorkflow.index = 0;
      this.paginatorsForWorkflow.pageSize = 10;
      this.paginatorsForWorkflow.totalRecords = this.taskCount;
      this.isSingleWorkflowPaginator = false;
      this.removeEmptyArray();
      this.loadList();
      this.removeDynamicValidations();
    }
  }

  removeEmptyArray() {
    for (let i = 0; i < this.paginationworkflowVO.filterValue.length; i++) {
      if (this.paginationworkflowVO.filterValue[i].filterIdColumn === '' &&
        this.paginationworkflowVO.filterValue[i].filterIdColumnValue === '' &&
        this.paginationworkflowVO.filterValue[i].operators === '') {
        this.paginationworkflowVO.filterValue.splice(i, 1);
      }
    }
  }

  getPaginationForDynamic() {
    if (this.sortForDynamic === undefined || this.sortForDynamic.active === undefined || this.sortForDynamic.active === '') {
      this.paginationworkflowVO.columnName = this.defaultColumnForWorkflow;
    } else {
      this.paginationworkflowVO.columnName = this.sortForDynamic.active;
    }
    // tslint:disable-next-line: max-line-length
    if (this.sortForDynamic === undefined || this.sortForDynamic.direction === '' || this.sortForDynamic.direction === undefined || this.sortForDynamic.direction === null) {
      this.paginationworkflowVO.direction = this.defaultSortDirection;
    } else {
      this.paginationworkflowVO.direction = this.sortForDynamic.direction;
    }
    if (this.paginatorsForWorkflow.index > 0) {
      this.paginationworkflowVO.index = this.paginatorsForWorkflow.index;
    } else {
      this.paginationworkflowVO.index = 0;
    }
    if (this.paginatorsForWorkflow.pageSize > 5) {
      this.paginationworkflowVO.size = this.paginatorsForWorkflow.pageSize;
    } else {
      this.paginationworkflowVO.size = this.defaultPageSize;
    }
    return this.paginationworkflowVO;
  }

  sortData(sort: Sort) {
    this.sortForDynamic = sort;
    this.loadWorkFlow();

  }
  sortDataForWorkflow(sort: Sort) {
    this.sortForWorkflow = sort;
    this.loadWorkFlow();
  }
  getAssignedToGroup(event, groupName, columnName, datatype, checked) {
    if (columnName === 'assignedToGroupWorkflow' && groupName === 'unAssigned') {
      this.filterOperator = 'string';
      if (event.checked === true) {
        this.checkAssignedTo = true;
      } else {
        this.checkAssignedTo = false;
      }
    } else if (columnName === 'assignedTo' && groupName === 'unAssigned') {
      this.filterOperator = 'string';
      this.assignedToSelected = true;
    }

    if (groupName !== 'unAssigned') {
      if (this.assignedWorkflowGroup && this.assignedWorkflowGroup.length > 0) {
        for (let i = 0; i < this.assignedWorkflowGroup.length; i++) {
          if (this.assignedWorkflowGroup[i].groupId === groupName) {
            if (event.checked === true) {
              this.assignedWorkflowGroup[i].isSelected = true;
            } else {
              this.assignedWorkflowGroup[i].isSelected = false;
            }

          }
        }
      }
    }
    this.filterDatatype = datatype;
    this.columnId = columnName;
    const form = (this.workflowForm.get('filters') as FormArray);
    this.workflowForm.get('filterValue').setValue(null);
    this.workflowForm.get('operator').setValue(null);
    if (form.length === 0) {
      form.push(this.addFilterForWorkflowList());
    }
    for (let i = 0; i < form.length; i++) {
      this.workflowForm.get('filterValue').setValue(groupName);
      this.workflowForm.get('operator').setValue('eq');
      this.workflowForm.get('filterValue').setValidators(null);
      this.workflowForm.get('filterValue').setErrors(null);
      this.workflowForm.get('operator').setErrors(null);
    }
    if (event.checked === true) {
      const index = this.selectedItem.findIndex(t => t === this.columnId);
      if (index === -1) {
        this.selectedItem.push(this.columnId);
      }
      checked = true;
      this.filterAssignedToGroupTrue();
    }
    if (event.checked === false) {
      const index = this.selectedItem.findIndex(t => t === columnName);
      if (index !== -1) {
        this.selectedItem.splice(index, 1);
      }
      checked = false;
      this.filterForAssignedToGroupFalse();
    }
  }
  filterAssignedToGroupTrue() {
    const array = [];
    if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
      this.filterCountForWorkflow++;
      if (this.filterCountForWorkflow >= 1) {
        (this.workflowForm.get('filters') as FormArray).push(this.addFilterForWorkflowList());
      }
      const index = (this.workflowForm.get('filters') as FormArray).length - 1;
      this.workflowForm.get('filters').get('' + index).get('filterIdColumn').setValue(this.columnId);
      this.workflowForm.get('filters').get('' + index).get('filterIdColumnValue').setValue(this.workflowForm.get('filterValue').value);
      this.workflowForm.get('filters').get('' + index).get('operators').setValue(this.workflowForm.get('operator').value);
      this.workflowForm.get('filters').get('' + index).get('dataType').setValue(this.filterDatatype);
    }

    if (this.workflowForm.valid) {
      this.inputForWorkflow.closeMenu();
      const form = (this.workflowForm.get('filters') as FormArray);
      this.paginationworkflowVO.filterValue = form.value;
      this.paginatorsForWorkflow.index = 0;
      this.paginatorsForWorkflow.pageSize = 10;
      this.loadWorkFlow();
      this.removeValidations();
    }
  }

  filterForAssignedToGroupFalse() {
    this.filterCountForWorkflow--;
    for (let i = 0; i < (this.workflowForm.get('filters') as FormArray).length; i++) {
      if (this.workflowForm.get('filters').get('' + i).get('filterIdColumnValue').value === this.workflowForm.get('filterValue').value) {
        (this.workflowForm.get('filters') as FormArray).removeAt(i);
        this.inputForWorkflow.closeMenu();
        this.paginatorsForWorkflow.index = 0;
        this.paginatorsForWorkflow.pageSize = 10;
        const form = (this.workflowForm.get('filters') as FormArray);
        this.paginationworkflowVO.filterValue = form.value;
        this.loadWorkFlow();
      }
    }
  }
}
