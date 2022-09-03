import { filter } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';

import { AssigntaskDialogComponent } from '../assigntask-dialog/assigntask-dialog.component';
import { WorkLogDialogComponent } from '../work-log-dialog/work-log-dialog.component';
import { LabelsDialogComponent } from '../labels-dialog/labels-dialog.component';
import { DialogviewComponent } from '../dialog-view/dialog-view.component';
import { UppyComponentComponent } from '../../shared-module/uppy-component/uppy-component.component';
import { AssignTaskVO, AssignUserTaskVO, FilesVO, LabelsVO, NestedCommentsVO, Subtask, SubTaskVO, TaskboardActivityLogVo, TaskboardLabelsVO, TaskboardTaskLabelVO, TaskboardTaskVO, TaskCommentsVO } from './taskboard-task-vo';
import * as FileSaver from 'file-saver';

import { ConfirmationDialogBoxComponentComponent } from '../../engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ResolveSecurityForTaskboardVO, StatusList, TaskboardVO } from '../taskboard-configuration/taskboard.model';
import { SecurityService } from '../taskboard-security/security.service';
import { TaskboardSecurityVO } from '../taskboard-security/security.vo';
import { BoardGroups } from '../event-automation/event-automation.model';
import { D, E } from '@angular/cdk/keycodes';
import { UserService } from 'src/app/rendering-module/shared/service/user-service';
import { UserVO } from 'src/app/rendering-module/shared/vo/user-vo';
import { DragconfirmComponent } from '../dragconfirm/dragconfirm.component';
import { SubStatusComponent } from '../sub-status/sub-status.component';
import { TaskboardTasksVO } from 'src/app/engine-module/landing-page/landing-page-vo';
import { Column } from 'src/app/rendering-module/shared/vo/page-vo';
import { element } from 'protractor';
import { ConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { interval, Observable } from 'rxjs';
import { DependencyDialogComponent } from '../dependency-dialog/dependency-dialog.component';
import { TaskDependencies } from '../dependency-dialog/dependency-model';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/theme.service';
import { MatSelectChange } from '@angular/material/select';
import { SprintTasksComponent } from '../sprint-tasks/sprint-tasks.component';
import { SprintTasksVo } from '../sprint-dialog/sprint-model';
import { TaskboardFormDetailsService } from './taskboard-form-details.service';
import { CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/cdk/overlay/overlay-directives';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { Paginator } from 'src/app/shared-module/paginator/paginatorVO';


@Component({
  selector: 'app-taskboard-form-details',
  templateUrl: './taskboard-form-details.component.html',
  styleUrls: ['./taskboard-form-details.component.scss']
})
export class TaskboardFormDetailsComponent implements OnInit {
  taskId: string;
  taskboardId: string;
  activities: any;
  UsrTxt: any;
  length: any;
  sortb = false;
  constructor(private elemRef: ElementRef, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TaskboardFormDetailsComponent>, private taskboardService: TaskBoardService,
    private snackbar: MatSnackBar, private dialog: MatDialog, private datePipe: DatePipe, private securityService: SecurityService,
    private userService: UserService,private cdr:ChangeDetectorRef,
    public translate: TranslateService, public themeService: ThemeService, public activity: TaskboardFormDetailsService) {
    this.taskId = data?.taskDetails?.id;
    this.taskboardId = data?.taskboardId;
  }
  get subtaskForms() {
    return this.form.get('subtaskArray') as FormArray;
  }
  spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent, any>;
  allowClose = false;
  edit = false;
  dependencyIndex: any;
  dependencyType: string;
  showError = false;
  boardGroups: BoardGroups[] = [];
  usersList: UserVO[] = [];
  boardUsers: any[] = [];
  form: FormGroup;
  paginationVO = new PaginationVO();

  taskBoardTaskVO = new TaskboardTaskVO();
  taskboardLabels = new TaskboardLabelsVO();
  taskboardVO = new TaskboardVO();
  isEmit = false;
  date: any;
  dueDateColor: any;
  startDateColor: any;
  dueDate: any;
  taskList: TaskboardTaskVO[] = [];
  index: any;
  taskComponentObject: TaskboardFormDetailsComponent;
  startDate: any;
  start_date: any;
  status = new StatusList();
  description = 'test description';
  selectedSubtask: number;
  currentDate: any = new Date;
  response = false;
  descriptionFieldShow = false;
  isTaskData = false;
  isClick = false;
  dataType: string;
  showSubtaskAssigneeIcon = true;
  closeDialog = false;
  isClose = false;
  isTaskboardRead = true;
  isTaskboardupdate = true;
  isTaskboardDelete = true;
  taskboardSecurityVO = new TaskboardSecurityVO();
  show = true;
  disable_event: boolean;
  disable: boolean;
  show_border: boolean;
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  previousStatus: string;
  checkDone = false;
  isDoneColumn = false;
  dialogClose = false;
  showPreview = true;
  isDelete = false;
  showQuill = false;
  subtaskStatusList = [{ statusColor: '#87cefa', name: 'Todo' },
  { statusColor: 'rgb(255, 209, 93)', name: 'Progress' },
  { statusColor: '#20b2aa', name: 'Done' }];

  @ViewChild('menuTrigger1') input;
  @ViewChild('menuTrigger2') subtaskDuedate;
  @ViewChild('menuTrigger3') end_date;
  @ViewChild('myIdentifier') myIdentifier: ElementRef;
  minDate: any;
  maxDate: any;
  mindueDate: any;
  maxdueDate: any;
  @Output() public formDetails = new EventEmitter<any>();
  @Output() public formValues = new EventEmitter<any>();
  message: string;
  public config: PerfectScrollbarConfigInterface = {};
  taskboardColumnSecurity = new ResolveSecurityForTaskboardVO();
  userVo = new UserVO();
  isSubTaskFormValid = false;
  isOpenView = false;
  viewSubtask = false;
  statusList: any;
  isArchived = false;
  subtaskstatus = false;
  notCheckPristine = false;
  selectedCategory = 'Task form';
  open = true;
  screenHeight: any;
  minSubtaskDate = null;
  categoriesArray: any[] = [
    { name: 'Task form', icon: 'assignment', isSelected: true, color: 'blue' },
    { name: 'Subtasks', icon: 'account_tree', isSelected: false, color: '#ffb100' },
    { name: 'Attachments', icon: 'attach_file', isSelected: false, color: 'green' },
    { name: 'Comments', icon: 'comment', isSelected: false, color: 'red' },
    { name: 'Dependencies', icon: 'recycling', isSelected: false, color: '#ffb100' },
    { name: 'Log work', icon: 'flag', isSelected: false, color: '#ffb100' },
    { name: 'Activity log', icon: 'timer', isSelected: false, color: '#2C3E50' }

  ];
  priorityArray: any[] = [
    { name: 'Urgent', color: 'red' },
    { name: 'High', color: 'orange' },
    { name: 'Medium', color: 'yellow' },
    { name: 'Low', color: '#37bdff' },
  ];
  dependencyArray: any[] = [
    {
      name: 'Waiting On the below tasks',
      description: 'Tasks that must be completed before this task',
      color: '#fc0',
      border: '1px solid rgba(255,204,0,.4)',
      borderLeft: '2px solid #fc0',
      background: 'rgba(255,204,0,.05)',
      icon: 'remove_circle',
      value: 'waitingOn'
    },
    {
      name: 'Blocking the below tasks',
      description: 'Tasks that can\'t start until this task is completed',
      color: '#f74d4b',
      border: '1px solid rgba(247,77,75,.2)',
      borderLeft: '2px solid #f74d4b',
      background: 'rgba(247,77,75,.05)',
      icon: 'block',
      value: 'blocking'
    },
    {
      name: 'Related Tasks',
      description: 'Tasks that relate to each other but aren\'t actually dependent on the other',
      color: '#7b68ee',
      border: '1px solid #b2a3f6',
      borderLeft: '2px solid #7b68ee',
      background: 'rgba(245,243,253,.62)',
      icon: 'task',
      value: 'relatedTask'
    }
  ];
  taskLists: TaskboardTaskVO[] = [];

  fibPoints: number[] = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  freeFlowPoints: number[] = [];

  endPoint = '../workflow-service/taskboard/v1/upload-file';
  metaData: any = { taskId: this.taskBoardTaskVO.id };
  restrictions: any = {};
  isFile = false;
  isUsers = false;
  sprintsVoList: any[] = [];
  isLoad = false;
  sprintStatusList: any[] = [
    { name: 'In Preparation', value: 'p', color: '#87cefa' },
    { name: 'In Running', value: 'r', color: 'rgb(255, 209, 93)' },
    { name: 'Completed', value: 'c', color: '#20b2aa' }
  ];
  @Output() public width: EventEmitter<any> = new EventEmitter<any>();
  @Output() public height: EventEmitter<any> = new EventEmitter<any>();
  selectedLang: any;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = Math.round((window.innerHeight / 100) * 80) + 'px';
  }

  ngOnInit(): void {
    this.activity.users = this.data.usersList;
    for (let i = 1; i < 51; i++) {
      this.freeFlowPoints.push(i);
    }
    this.selectedLang = localStorage.getItem('translate_lang');
    if (this.selectedLang === undefined || this.selectedLang === null || this.selectedLang === 'null' || this.selectedLang === '') {
      this.selectedLang = 'en';
      this.activity.selectedLang = this.selectedLang;
    }
    this.form = this.fb.group({
      taskName: [],
      taskComments: [],
      subtaskArray: this.fb.array([
      ]),
      estimatePoints: [],
      estimateHours: [1, [Validators.min(1)]],
      description: [],
    });
    if (this.data.value !== 'loadTask') {
      this.isLoad = true;
      this.taskBoardTaskVO = this.data.taskDetails;
      this.form.get('description').setValue(this.taskBoardTaskVO.description);
      this.statusList = JSON.parse(JSON.stringify(this.data.statusList));
      this.activity.status = this.statusList;
      if (this.data.value === 'comment') {
        this.selectedCategory = 'Comments';
        this.onCategorySelected(this.categoriesArray.find(category => category.name === this.selectedCategory));
      } else if (this.data.value === 'file') {
        this.selectedCategory = 'Attachments';
        this.onCategorySelected(this.categoriesArray.find(category => category.name === this.selectedCategory));
      } else if (this.data.value === 'subtask') {
        this.selectedCategory = 'Subtasks';
        this.onCategorySelected(this.categoriesArray.find(category => category.name === this.selectedCategory));
      }
      this.screenHeight = Math.round((window.innerHeight / 100) * 80) + 'px';
      if (this.data.type === 'deleted') {
        this.isDoneColumn = true;
        this.isArchived = true;

      }
      if (this.data.value !== 'task') {
        this.loadBoardUsers();
        this.setSprintVoList();
      }
      if (this.taskBoardTaskVO.taskType === 'subtask') {
        this.data.statusList = [{ color: '#87cefa', name: 'Todo' },
        { color: 'rgb(255, 209, 93)', name: 'Progress' },
        { color: '#20b2aa', name: 'Done' }];
      }
      if (this.taskBoardTaskVO.labels === undefined || this.taskBoardTaskVO.labels === null) {
        this.taskBoardTaskVO.labels = [];
      }
      this.taskboardVO = this.data.taskboardVO;
      this.previousStatus = this.taskBoardTaskVO.status;
      if (this.data.value !== 'task') {
        this.securityService.getTaskboardSecurity(this.data.taskboardId).subscribe(data => {
          if (data) {
            this.taskboardSecurityVO = data;
          }
        });
      }
      if (this.data.isTaskBoardOwner === true) {
        this.taskboardColumnSecurity.read = true;
        this.taskboardColumnSecurity.delete = true;
        this.taskboardColumnSecurity.update = true;
      } else {
        this.taskboardColumnSecurity = this.data.taskboardColumnSecurity;
      }

      if (this.taskBoardTaskVO.description !== null) {
        this.descriptionFieldShow = true;
      }
      this.taskList = this.data.taskList;
      this.index = this.data.taskIndex;
      if (this.index === 'true') {
        this.index = this.taskList.findIndex(task => task.id === this.taskBoardTaskVO.id);
      }
      if ((this.index === undefined || this.index === null)
        && this.taskList !== undefined && this.taskList !== null) {
        this.index = this.taskList.findIndex(task => task.id === this.taskBoardTaskVO.id);
      }

      this.taskComponentObject = this;
      if (this.data.value !== 'task') {
        this.getFormData();
        this.loadTaskboardLabels();
      }

      if (this.data.isTaskBoardOwner === false) {
        if (this.taskboardColumnSecurity.read === true) {
          this.isTaskboardRead = true;
        } else {
          this.isTaskboardRead = false;
          this.form.disable();
        }

        if (this.taskboardColumnSecurity.update === true) {
          this.isTaskboardupdate = true;
        } else {
          this.isTaskboardupdate = false;
          this.form.disable();
        }

        if (this.taskboardColumnSecurity.delete === true) {
          this.isTaskboardDelete = true;
        } else {
          this.isTaskboardDelete = false;
        }
      }

      this.userService.getLoggedInUserDetails().subscribe(data => {
        if (data) {
          this.userVo = data;
        }
      });
      this.getTaskList();
    } else {
      this.taskboardService.getTaskboardTask(this.data.taskId, null).subscribe(data => {
        if (data) {
          this.taskBoardTaskVO = data;
          this.taskBoardTaskVO.taskData = this.data.taskData;
          this.isLoad = true;
          this.form.get('taskName').setValue(this.taskBoardTaskVO.taskName);
          if (!this.taskBoardTaskVO.taskName && this.data.taskName !== undefined && this.data.taskName !== null && this.data.taskName !== '' && this.taskBoardTaskVO.taskType !== 'subtask') {
            if (this.data.taskName !== 'generatedTaskId') {
              if (this.taskBoardTaskVO.taskData[this.data.taskName]) {
                this.taskBoardTaskVO.taskName = this.taskBoardTaskVO.taskData[this.data.taskName];
              }
            } else {
              this.taskBoardTaskVO.taskName = this.taskBoardTaskVO.taskId.toUpperCase();
            }
          } else if (this.taskBoardTaskVO.taskType === 'subtask') {
            this.taskBoardTaskVO.taskName = this.taskBoardTaskVO.taskName.toUpperCase();
          }
        }
      });
    }
  }

  getActivity() {
    const pagination = new PaginationVO();
    pagination.index = 0;
    pagination.size = 10;
    pagination.direction = 'desc';
    pagination.columnName = 'createdOn';
    this.paginationVO = pagination;

    this.getActivityService();
  }

  getActivityService() {
    this.activity.getActivitylog(this.paginationVO, 
      this.taskBoardTaskVO?.taskType === 'subtask' ? this.taskBoardTaskVO.id : this.taskId, this.taskboardId).subscribe(res => {
      this.activities = res.taskboardActivityLogVoList;
      this.length = res.totalCount;
    });
  }




  pageEvent(paginator: Paginator): void {
    const pagination = new PaginationVO();
    pagination.index = paginator.index;
    pagination.size = paginator.pageSize;
    pagination.direction = this.paginationVO.direction;
    pagination.columnName = this.paginationVO.columnName;
    this.paginationVO = pagination;
    this.getActivityService();
  }

  setSprintVoList() {
    this.sprintsVoList = this.data?.taskboardList?.find(t => t.id === this.data.taskboardId)
      ?.sprintsVoList?.filter(s => s.sprintStatus !== 'c');
  }

  getSprintStatusColor(sprintStatus: string): string {
    return this.sprintStatusList.find(s => s.value === sprintStatus)?.color;
  }

  getSprintStatusName(sprintStatus: string): string {
    return this.sprintStatusList.find(s => s.value === sprintStatus)?.name;
  }

  saveSprintTask(value): void {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '550px',
      data: { type: 'task-sprint' }
    });
    dialog.afterClosed().subscribe((data) => {
      if (data && data === true) {
        this.taskboardService.checkSprintTasksRunning(this.form.get('sprint').value).subscribe(sprint => {
          if (sprint) {
            if (sprint.response === 'r') {
              this.openDialogForCheck(value);
            } else if (sprint.response !== 'invalid' && sprint.response !== 'c') {
              this.saveTaskTosprint(value);
            }
          }
        });
      }
    });
  }

  checkSprintType(value) {
    const sprintVo = this.data?.taskboardVo?.sprintsVoList.filter(s => s.sprintId === value && s.sprintStatus === 'r');
    if (sprintVo !== null) {
      return false;
    } else {
      return true;
    }
  }

  saveTaskTosprint(value) {
    const sprintTaskVO = new SprintTasksVo();
    sprintTaskVO.taskboardTaskId.push(this.taskBoardTaskVO.id);
    sprintTaskVO.sprintId = value;
    this.spinnerDialog();
    this.taskboardService.saveTasksToSprint(sprintTaskVO).subscribe(data => {
      this.spinner.close();
    },
      error => {
        this.spinner.close();
      });
  }

  openDialogForCheck(value) {
    const dialog = this.dialog.open(SprintTasksComponent, {
      width: '550px',
      data: { type: 'running' }
    });
    dialog.afterClosed().subscribe((data) => {
      if (data && data === true) {
        this.saveTaskTosprint(value);
      }
    });
  }

  getDoneColumn(task: TaskboardTaskVO): boolean {
    let doneColumnName: boolean;
    if (this.data.taskboardVO.taskboardColumnMapVO[this.data.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.columnName === task.status) {
      doneColumnName = true;
    } else if (task.taskId.toLowerCase().includes('parent[') && task.status === 'Done') {
      doneColumnName = true;
    } else {
      doneColumnName = false;
    }
    return doneColumnName;
  }

  getStatusColor(statusName: string): string {
    let statusColor: string;
    this.statusList.forEach(status => {
      if (status.name === statusName) {
        statusColor = status.color;
      }
    });
    return statusColor;
  }


  getTaskList(): void {
    this.data.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
      columnMap.taskboardTaskVOList.forEach(task => {
        if (task.id !== this.taskBoardTaskVO.id) {
          task.isSelected = false;
          this.taskLists.push(task);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    let subscribeElement: any;
    subscribeElement = Observable.interval(500)
      .subscribe((val) => {
        if (this.myIdentifier && this.myIdentifier.nativeElement
          && this.myIdentifier.nativeElement.offsetWidth
          && this.myIdentifier.nativeElement.offsetWidth !== undefined) {
          this.width.emit(Math.round(this.myIdentifier.nativeElement.offsetWidth - 10));
          this.height.emit(Math.round((this.myIdentifier.nativeElement.offsetHeight / 100) * 50));
          subscribeElement.unsubscribe();
        }
      });
  }

  getSubStatus(): string {
    return this.data.statusList.find(element => element.name === this.taskBoardTaskVO.status).subStatusList;
  }

  getSubStatusColor(): string {
    let status = null;
    if (this.taskBoardTaskVO.taskType === 'subtask') {
      this.taskboardVO.taskboardColumnMapVO.forEach(element => {
        const parentTask = element.taskboardTaskVOList.find(task => task.id === this.taskBoardTaskVO.parentTaskId);
        if (parentTask !== undefined && parentTask !== null) {
          status = this.data.statusList.find(status => status.name === parentTask.status);
        }
      });
    } else {
      status = this.data.statusList.find(element => element.name === this.previousStatus);
    }
    if (status && status.subStatusList && status.subStatusList.length > 0) {
      const subStatus = status.subStatusList.find(element => element.name === this.taskBoardTaskVO.subStatus);
      if (subStatus && subStatus.color) {
        return subStatus.color;
      }
      return;
    }
    return;
  }
  checkDoneColumn() {
    if (this.taskboardVO.taskboardColumns[this.taskboardVO.taskboardColumns.length - 1].columnName === this.taskBoardTaskVO.status) {
      this.isDoneColumn = true;
    } else {
      this.isDoneColumn = false;
    }
  }

  getDataDiff(date: string) {
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date();
      const diff = endDate.getTime() - startDate.getTime();
      const days = Math.floor(diff / (60 * 60 * 24 * 1000));
      const hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
      const minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
      const seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
      if (days !== 0) {
        if (days === 1) {
          return days + this.translate.translations[this.selectedLang][' day ago'];
        } else {
          return days + this.translate.translations[this.selectedLang][' days ago'];
        }
      } else if (hours !== 0) {
        if (hours === 1) {
          return hours + this.translate.translations[this.selectedLang][' hour ago'];
        } else {
          return hours + this.translate.translations[this.selectedLang][' hours ago'];
        }
      } else if (minutes !== 0) {
        if (minutes === 1) {
          return minutes + this.translate.translations[this.selectedLang][' minute ago'];
        } else {
          return minutes + this.translate.translations[this.selectedLang][' minutes ago'];
        }
      } else if (seconds !== 0) {
        if (seconds === 1) {
          return seconds + this.translate.translations[this.selectedLang][' second ago'];
        } else {
          return seconds + this.translate.translations[this.selectedLang][' seconds ago'];
        }
      }
    } else {
      return this.translate.translations[this.selectedLang][' 0 day ago'];
    }
  }

  openDescriptionField() {
    if (this.taskboardColumnSecurity.update === true) {
      this.descriptionFieldShow = true;
      this.showQuill = true;
      this.show_border = true;
    }
  }
  input_open() {
    if (this.isDoneColumn === false && this.isArchived === false) {
      this.descriptionFieldShow = true;
      this.showQuill = true;
      this.message = this.form.get('description').value;
      if (this.isDoneColumn === false) {
        this.show_border = true;
      } else {
        this.show_border = false;
      }
    }
  }
  descriptionFocusout() {
    const descriptionValue = this.form.get('description').value;
    if (descriptionValue === undefined || descriptionValue === null || descriptionValue === '') {
      this.descriptionFieldShow = false;
    } else if (this.taskBoardTaskVO.id !== undefined && this.taskBoardTaskVO.id !== null && this.taskBoardTaskVO.id !== '') {
      const taskVO = new TaskboardTaskVO();
      taskVO.id = this.taskBoardTaskVO.id;
      taskVO.description = this.form.get('description').value;
      this.taskboardService.saveDescription(taskVO).subscribe();
      this.show_border = false;
    }
  }

  onSelect(event) {
    const currentDate = new Date;
    const dueDate = new Date(event);
    this.date = event;
    this.maxDate = this.date;
    this.dueDate = this.datePipe.transform(event, 'dd-MMM-yyyy');
    if (dueDate > currentDate) {
      this.dueDateColor = '#039703';
    } else {
      this.dueDateColor = '#c90000';
    }

    this.end_date.closeMenu();
    this.response = false;
    this.dataType = 'false';
    const taskVO = new TaskboardTaskVO();
    taskVO.id = this.taskBoardTaskVO.id;
    taskVO.dueDate = event;
    taskVO.startDate = this.start_date;
    this.taskboardService.saveStartAndDueDate(taskVO).subscribe(data => {
      this.taskBoardTaskVO.dueDate = this.dueDate;
    });
  }
  cancel() {
    this.dialogRef.close({ taskDetails: this.taskBoardTaskVO, status: this.status });
  }

  onSelect_end(event) {
    const currentDate = new Date;
    this.start_date = event;
    this.mindueDate = this.start_date;
    this.startDate = this.datePipe.transform(event, 'dd-MMM-yyyy');
    this.input.closeMenu();
    this.response = false;
    this.dataType = 'false';
    const taskVO = new TaskboardTaskVO();
    taskVO.id = this.taskBoardTaskVO.id;
    taskVO.startDate = event;
    taskVO.dueDate = this.date;
    this.taskboardService.saveStartAndDueDate(taskVO).subscribe(data => {
      this.taskBoardTaskVO.startDate = this.startDate;
    });
  }
  onSelectSubtask(event) {
    const group = ((this.form.get('subtaskArray') as FormArray).get('' + this.selectedSubtask) as FormGroup);
    group.get('showDueDate').setValue(this.datePipe.transform(event, 'dd-MMM-yyyy'));
    group.get('dueDate').setValue(event);
    // group.get('startDate').setValue('');
    this.subtaskDuedate.closeMenu();
    if (group.get('id').value !== undefined && group.get('id').value !== null && group.get('id').value !== '') {
      const subtask = new Subtask();
      subtask.id = group.get('id').value;
      subtask.subtaskStatus = group.get('status').value;
      subtask.startDate = group.get('startDate').value ? new Date(group.get('startDate').value) : null;
      subtask.dueDate = group.get('dueDate').value;
      subtask.taskboardTaskId = this.taskBoardTaskVO.id;
      subtask.taskId = null;
      subtask.taskboardId = null;
      this.taskboardService.saveSubtask(subtask).subscribe(data => {
      });
    }
  }

  loadTaskboardLabels() {
    this.taskboardService.getTaskboardLabelsList(this.taskBoardTaskVO.taskboardId).subscribe(data => {
      this.taskboardLabels = data;
      this.activity.labels = this.taskboardLabels.labels;
    });
  }

  getCurrentSubtaskDueDate(i) {
    const group = ((this.form.get('subtaskArray') as FormArray).get('' + i) as FormGroup);
    const dueDate = new Date(group.get('dueDate').value);
    return dueDate;
  }


  getUserName(user) {
    const index = this.data.usersList.findIndex(users => users.userId === user.assigneeUser);
    if (index !== -1) {
      return 'Assigned To ' + this.data.usersList[index].firstName + ' ' + this.data.usersList[index].lastName;
    } else {
      return '';
    }
  }
  getassigneduser(user) {
    const data = user.split(',');

    const index = this.data.usersList.findIndex(users => users.userId === data);

    if (index !== -1) {
      return 'Assigned To ' + this.data.usersList[index].firstName + ' ' + this.data.usersList[index].lastName;
    } else {
      return '';
    }

  }
  getUserColoras(user) {
    const index = this.usersList.findIndex(
      (users) => users.userId === user
    );
    if (index !== -1) {
      return this.usersList[index].color;
    } else {
      return '#039777';
    }

  }
  getAssigner(user) {
    const index = this.data.usersList.findIndex(users => users.userId === user);
    if (index !== -1) {
      const firstName = this.data.usersList[index].firstName.charAt(0).toUpperCase();
      const lastName = this.data.usersList[index].lastName.charAt(0).toUpperCase();
      return firstName + lastName;
    } else {
      return '';
    }

  }
  sort() {
    if (this.sortb === true) {
      const pagination = new PaginationVO();
      pagination.index = 0;
      pagination.size = 10;
      pagination.direction = 'asc';
      pagination.columnName = 'createdOn';
      this.paginationVO = pagination;
      this.getActivityService();
      this.sortb = false;
    } else {
      const pagination = new PaginationVO();
      pagination.index = 0;
      pagination.size = 10;
      pagination.direction = 'desc';
      pagination.columnName = 'createdOn';
      this.paginationVO = pagination;
      this.getActivityService();
      this.sortb = true;
    }
  }

  getUserColor(user): string {

    const index = this.usersList.findIndex(
      (users) => users.userId === user.assigneeUser
    );
    if (index !== -1) {
      return this.usersList[index].color;
    } else {
      return '#039777';
    }
  }
  getUserFirstAndLastNamePrefix(user) {
    const index = this.data.usersList.findIndex(users => users.userId === user.assigneeUser);
    if (index !== -1) {
      const firstName = this.data.usersList[index].firstName.charAt(0).toUpperCase();
      const lastName = this.data.usersList[index].lastName.charAt(0).toUpperCase();
      return firstName + lastName;
    } else {
      return '';
    }
  }

  getRemainingAssigneeUserCount(assigneeUsers: AssignUserTaskVO[]) {
    const array = [];
    for (let i = 0; i < assigneeUsers.length; i++) {
      const index = this.data.usersList.findIndex(users => users.userId === assigneeUsers[i].assigneeUser);
      array.push(this.data.usersList[index]);
    }
    if (assigneeUsers.length > 4) {
      return assigneeUsers.length - 4;
    }
  }

  getRemainingAssigneeUserList(assigneeUsers: AssignUserTaskVO[]) {
    const array = [];
    for (let i = 0; i < assigneeUsers.length; i++) {
      const index = this.data.usersList.findIndex(users => users.userId === assigneeUsers[i].assigneeUser);
      array.push(this.data.usersList[index]);
    }
    return array;
  }

  getUserNames(assigneeUsers: AssignUserTaskVO[]) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < assigneeUsers.length; i++) {
      if (i > 3) {
        const index = this.data.usersList.findIndex(users => users.userId === assigneeUsers[i].assigneeUser);
        if (userNames === null) {
          userNames = 'Assigned To ' + this.data.usersList[index].firstName + ' ' + this.data.usersList[index].lastName + ', ';
        } else {
          userNames = userNames + this.data.usersList[index].firstName + ' ' + this.data.usersList[index].lastName + ', ';
        }
      }
    }
    return userNames;
  }

  downloadFile(files: FilesVO) {
    this.taskboardService.downloadAttachedFile(files.id).subscribe(data => {
      const file = new Blob([data], { type: data.type });
      FileSaver.saveAs(file, files.fileName);
    });
  }

  deleteFile(files: FilesVO, i: number) {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '250px',
      data: { type: 'deleteFile', file: files, taskVO: this.taskBoardTaskVO, index: i }
    });
  }

  setCommentsVariable(comments: any): void {
    if (comments && comments.length > 0) {
      comments.forEach(comment => {
        comment.openComment = false;
        comment.isEdit = false;
        comment.isReply = false;
        if (comment.nestedComments && comment.nestedComments.length > 0) {
          this.setCommentsVariable(comment.nestedComments);
        }
      });
    }
  }

  getFormData() {
    if (this.taskBoardTaskVO.id !== null) {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        disableClose: true,
        width: '100px',
        data: { type: 'spinner' }
      });
      let sprintId: string;
      if (this.data.sprintVO?.sprintId) {
        sprintId = this.data.sprintVO?.sprintId;
      } else {
        sprintId = null;
      }
      this.taskboardService.getTaskboardTask(this.taskBoardTaskVO.id, sprintId).subscribe(data => {
        if (data.id === null) {
          this.taskBoardTaskVO = this.data.taskDetails;
          this.isTaskData = true;
        }
        this.setCommentsVariable(this.taskBoardTaskVO.taskComments);
        dialog.close();
        let status = null;
        if (data.status === 'Archived') {
          this.isArchived = true;
          this.isDoneColumn = true;
          status = this.data.statusList.find(item => item.name === data.previousStatus);
        } else {
          status = this.data.statusList.find(item => item.name === data.status);
        }
          this.data.color = (status.color !== undefined) ? status.color :'';
          this.cdr.detectChanges();
        this.taskBoardTaskVO = data;
        this.form.get('estimatePoints').setValue(this.taskBoardTaskVO.originalPoints);
        this.form.get('estimateHours').setValue(this.taskBoardTaskVO.estimateHours);
    if(this.taskBoardTaskVO.taskComments !== null){
        this.taskBoardTaskVO.taskComments.forEach(comment => {
          comment.isReply = false;
        });
      }
        this.isTaskData = true;
        this.form.get('taskName').setValue(this.taskBoardTaskVO.taskName);
        if (!this.taskBoardTaskVO.taskName && this.data.taskName !== undefined && this.data.taskName !== null && this.data.taskName !== '' && this.taskBoardTaskVO.taskType !== 'subtask') {
          if (this.data.taskName !== 'generatedTaskId') {
            if (this.taskBoardTaskVO.taskData[this.data.taskName]) {
              this.taskBoardTaskVO.taskName = this.taskBoardTaskVO.taskData[this.data.taskName];
            }
          } else {
            if(this.taskBoardTaskVO.taskId !== null){
              this.taskBoardTaskVO.taskName = this.taskBoardTaskVO.taskId.toUpperCase();
            }
          }
        }
        else if (this.taskBoardTaskVO.taskType === 'subtask') {
          this.taskBoardTaskVO.taskName = this.taskBoardTaskVO.taskName.toUpperCase();
        }
        if(this.taskBoardTaskVO.description !== null) {
          this.descriptionFieldShow = true;
        }
        if (this.taskBoardTaskVO.labels === undefined || this.taskBoardTaskVO.labels === null) {
          this.taskBoardTaskVO.labels = [];
        }
        this.form.get('description').setValue(this.taskBoardTaskVO.description);
        if (this.taskBoardTaskVO.dueDate !== undefined && this.taskBoardTaskVO.dueDate !== null && this.taskBoardTaskVO.dueDate !== '') {
          const date = new Date(this.taskBoardTaskVO.dueDate);
          const currentDate = new Date;
          this.date = date;
          this.maxDate = this.date;
          this.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
          if (date > currentDate) {
            this.dueDateColor = '#039703';
          } else {
            this.dueDateColor = '#c90000';
          }
        }
        if (this.taskBoardTaskVO.startDate !== undefined && this.taskBoardTaskVO.startDate !== null && this.taskBoardTaskVO.startDate !== '') {
          const date = new Date(this.taskBoardTaskVO.startDate);
          const currentDate = new Date;
          this.start_date = date;
          this.mindueDate = this.start_date;
          this.startDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
          if (date.getDate() > currentDate.getDate()) {
            this.startDateColor = '#039703';
          } else {
            this.startDateColor = '#c90000';
          }
        }
        this.loadSubtaskArray();
        if (data.status !== 'Archived') {
          this.checkDoneColumn();
        }

        // this.loadNewForm(data);

      }, error => {
        dialog.close();
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: 'Internal server error'
        });
      });
    } else {
      this.setCommentsVariable(this.taskBoardTaskVO.taskComments);
      this.taskBoardTaskVO.taskComments.forEach(comment => {
        comment.isReply = false;
      });
      this.isTaskData = true;
      if (this.taskBoardTaskVO.dueDate !== undefined && this.taskBoardTaskVO.dueDate !== null && this.taskBoardTaskVO.dueDate !== '') {
        const date = new Date(this.taskBoardTaskVO.dueDate);
        const currentDate = new Date;
        this.date = date;
        this.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
        if (date.getDate() > currentDate.getDate()) {
          this.dueDateColor = '#039703';
        } else {
          this.dueDateColor = 'rgb(232 82 82)';
        }
      }
      if (this.taskBoardTaskVO.startDate !== undefined && this.taskBoardTaskVO.startDate !== null && this.taskBoardTaskVO.startDate !== '') {
        const date = new Date(this.taskBoardTaskVO.startDate);
        const currentDate = new Date;
        this.start_date = date;
        this.startDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
        if (date.getDate() > currentDate.getDate()) {
          this.startDateColor = '#039703';
        } else {
          this.startDateColor = 'rgb(232 82 82)';
        }
      }
      this.loadSubtaskArray();
    }
  }


  loadSubtaskArray() {
    if ( this.taskBoardTaskVO.subTasks.length > 0) {
      for (let i = 0; i < this.taskBoardTaskVO.subTasks.length; i++) {
        (this.form.get('subtaskArray') as FormArray).push(this.subtaskArrayGroup());
        const group = ((this.form.get('subtaskArray') as FormArray).get('' + i) as FormGroup);
        group.get('taskName').setValue(this.taskBoardTaskVO.subTasks[i].taskName);
        group.get('startDate').setValue(this.taskBoardTaskVO.subTasks[i].startDate);
        if (this.taskBoardTaskVO.subTasks[i].dueDate !== undefined && this.taskBoardTaskVO.subTasks[i].dueDate !== null && this.taskBoardTaskVO.subTasks[i].dueDate !== '') {
          const date = new Date(this.taskBoardTaskVO.subTasks[i].dueDate);
          group.get('dueDate').setValue(date);
          group.get('showDueDate').setValue(this.datePipe.transform(date, 'dd-MMM-yyyy'));
        } else {
          group.get('dueDate').setValue(null);
          group.get('showDueDate').setValue(null);
        }
        if (this.taskBoardTaskVO.subTasks[i].startDate !== undefined && this.taskBoardTaskVO.subTasks[i].startDate !== null && this.taskBoardTaskVO.subTasks[i].startDate !== '') {
          const date = new Date(this.taskBoardTaskVO.subTasks[i].startDate);
          // group.get('startDate').setValue(date);
          group.get('startDate').setValue(this.datePipe.transform(date, 'dd-MMM-yyyy'));

        } else {
          group.get('startDate').setValue(null);
          // group.get('showDueDate').setValue(null);
        }
        if (this.taskBoardTaskVO.subTasks[i].status !== undefined && this.taskBoardTaskVO.subTasks[i].status !== null && this.taskBoardTaskVO.subTasks[i].status !== '') {
          group.get('status').setValue(this.taskBoardTaskVO.subTasks[i].status);
          const index = this.subtaskStatusList.findIndex(status => status.name === this.taskBoardTaskVO.subTasks[i].status);
          group.get('color').setValue(this.subtaskStatusList[index].statusColor);
        }
        group.get('taskType').setValue(this.taskBoardTaskVO.subTasks[i].taskType);
        group.get('id').setValue(this.taskBoardTaskVO.subTasks[i].id);
        group.get('showIcons').setValue(true);
      }
    }
  }

  removeSubtaskDueDate(i) {
    const group = ((this.form.get('subtaskArray') as FormArray).get('' + i) as FormGroup);
    group.get('dueDate').setValue(null);
    group.get('startDate').setValue(null);
    group.get('showDueDate').setValue(null);
    const subtask = new Subtask();
    subtask.taskboardId = this.taskBoardTaskVO.taskboardId;
    subtask.taskboardTaskId = this.taskBoardTaskVO.id;
    subtask.id = group.get('id').value;
    subtask.subtaskName = group.get('taskName').value;
    subtask.subtaskStatus = group.get('status').value;
    subtask.dueDate = null;
    this.taskboardService.saveSubtask(subtask).subscribe();
  }

  removeDueDate() {
    this.taskBoardTaskVO.dueDate = null;
    this.dueDate = null;
    this.date = null;
    this.maxDate = null;
    if (this.taskBoardTaskVO.id) {
      this.response = false;
      this.dataType = 'false';
      const taskVO = new TaskboardTaskVO();
      taskVO.id = this.taskBoardTaskVO.id;
      taskVO.dueDate = this.date;
      taskVO.startDate = this.start_date;
      this.taskboardService.saveStartAndDueDate(taskVO).subscribe();
    }
  }
  removestartDate() {
    this.taskBoardTaskVO.startDate = null;
    this.startDate = null;
    this.start_date = null;
    this.mindueDate = null;
    if (this.taskBoardTaskVO.id) {
      this.response = false;
      this.dataType = 'false';
      const taskVO = new TaskboardTaskVO();
      taskVO.id = this.taskBoardTaskVO.id;
      taskVO.dueDate = this.date;
      taskVO.startDate = this.start_date;
      this.taskboardService.saveStartAndDueDate(taskVO).subscribe();
    }
  }


  subtaskArrayGroup(): FormGroup {
    return this.fb.group({
      id: [],
      taskName: ['', [Validators.required]],
      startDate: [new Date],
      dueDate: [],
      showDueDate: [],
      taskType: ['subtask'],
      color: ['#87cefa'],
      status: ['Todo'],
      border: [false],
      showIcons: [false],
      assignTaskVO: [new AssignTaskVO()]
    });
  }

  getSubtaskArray() {
    return (this.form.get('subtaskArray') as FormArray).controls;
  }
  openSubtask(task) {
    this.viewSubtask = true;
    const taskVO = new TaskboardTaskVO();
    taskVO.id = task.value.id;
    this.taskBoardTaskVO = taskVO;
    this.data.statusList = [{ color: '#87cefa', name: 'Todo' },
    { color: 'rgb(255, 209, 93)', name: 'Progress' },
    { color: '#20b2aa', name: 'Done' }];
    const subtask = this.data.statusList.find(subtask => subtask.name === task.value.status);
    this.data.color = subtask.color;
    this.dueDate = null;
    this.startDate = null;
    this.maxDate = null;
    this.mindueDate = null;
    this.getFormData();
    this.categoriesArray.forEach(category => {
      category.isSelected = false;
      if (category.name === 'Task form') {
        category.isSelected = true;
        this.selectedCategory = 'Task form';
      }
    });
  }

  addSubtaskArray() {
    if (this.taskBoardTaskVO.id && this.taskboardColumnSecurity.read === true) {
      (this.form.get('subtaskArray') as FormArray).push(this.subtaskArrayGroup());

      this.form.get('subtaskArray').get('' + ((this.form.get('subtaskArray') as FormArray).length - 1)).get('border').setValue(true);
    }
  }

  removeSubtaskArray(i: number, subtask) {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      width: '400px',
      data: { type: 'delete', name: subtask.value.taskName }
    });
    dialog.afterClosed().subscribe((Data) => {
      if (Data.status === 'yes') {
        this.removeSubtasks(i);
        this.data.mappedColumnTaskList.forEach(element => {
          if (element.id === this.form.get('subtaskArray').get('' + i).get('id').value) {
            this.data.mappedColumnTaskList.splice(i, 1);
          }
        });
        (this.form.get('subtaskArray') as FormArray).removeAt(i);
      }
      else {
        return;
      }
    });

  }

  removeSubtasks(i: number) {
    const value = this.form.get('subtaskArray').get('' + i).get('id').value;
    if (value) {
      if (this.taskBoardTaskVO.removedSubtasks === null) {
        this.taskBoardTaskVO.removedSubtasks = [];
      }
      this.taskBoardTaskVO.removedSubtasks.push(value);
      this.taskBoardTaskVO.subTasks.splice(i, 1);
      this.taskboardService.removeSubtask(value).subscribe();
    }
  }

  removeEmptySubtaskArray() {
    if ((this.form.get('subtaskArray') as FormArray).length) {
      const length = (this.form.get('subtaskArray') as FormArray).length;

      for (let i = 0; i < (this.form.get('subtaskArray') as FormArray).length; i++) {
        if (this.taskBoardTaskVO.subTasks[i] === undefined || this.taskBoardTaskVO.subTasks[i] === null || this.taskBoardTaskVO.subTasks.length === 0) {
          const subtaskVO = new SubTaskVO();
          this.taskBoardTaskVO.subTasks.push(subtaskVO);
        }
        if (this.taskBoardTaskVO.subTasks[i].assignTaskVO === undefined || this.taskBoardTaskVO.subTasks[i].assignTaskVO === null) {
          this.taskBoardTaskVO.subTasks[i].assignTaskVO = new AssignTaskVO();
        }
        const value = (this.form.get('subtaskArray') as FormArray).get('' + i).get('assignTaskVO').value;
        if (value === undefined || value === null) {
          (this.form.get('subtaskArray') as FormArray).get('' + i).get('assignTaskVO').setValue(new AssignTaskVO());
        }
        (this.form.get('subtaskArray') as FormArray).get('' + i).get('assignTaskVO').setValue(this.taskBoardTaskVO.subTasks[i].assignTaskVO);
      }
      const form = this.form.get('subtaskArray').value;
      return form;
    }
  }

  saveTask() {
    if (!this.taskBoardTaskVO.id) {
      this.taskBoardTaskVO.id = null;
    }

    this.taskBoardTaskVO.dueDate = this.date;
    if (this.start_date !== null && this.start_date !== undefined && this.start_date !== '') {
      this.taskBoardTaskVO.startDate = this.start_date;

    }

    else {
      this.taskBoardTaskVO.startDate = new Date();
    }
    // if (this.data.taskName !== undefined && this.data.taskName !== null && this.data.taskName !== '') {
    //   if (this.data.taskName !== 'generatedTaskId') {
    //     this.taskBoardTaskVO.taskName = this.taskBoardTaskVO.taskData[this.data.taskName];
    //   } else {
    //     this.taskBoardTaskVO.taskName = this.taskBoardTaskVO.taskId;
    //   }
    // } else {
    //   this.taskBoardTaskVO.taskName = null;
    // }
    this.taskBoardTaskVO.startDate = this.start_date;

    this.taskBoardTaskVO.taskType = 'parentTask';
    this.taskBoardTaskVO.taskboardId = this.data.taskDetails.taskboardId;
    this.taskBoardTaskVO.subTasks = this.removeEmptySubtaskArray();
    if (this.taskBoardTaskVO.subTasks === undefined || this.taskBoardTaskVO.subTasks === null) {
      this.taskBoardTaskVO.subTasks = [];
    }
    this.taskBoardTaskVO.removedSubtasks = [];
    const dialog1 = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' }
    });
    const taskVO = new TaskboardTaskVO();
    taskVO.id = this.taskBoardTaskVO.id;
    taskVO.status = this.taskBoardTaskVO.status;
    taskVO.taskData = this.taskBoardTaskVO.taskData;
    taskVO.taskId = this.taskBoardTaskVO.taskId;
    taskVO.taskName = this.taskBoardTaskVO.taskName;
    taskVO.taskType = this.taskBoardTaskVO.taskType;
    taskVO.taskboardId = this.taskBoardTaskVO.taskboardId;
    this.taskboardService.saveTaskboardTask(taskVO).subscribe(data => {
      dialog1.close();
      this.taskBoardTaskVO.id = data.uuid;
      if (this.date) {
        this.taskList[this.index].dueDate = this.date;
      }
      if (this.start_date) {
        this.taskList[this.index].startDate = this.start_date;

      }
      if (this.response === true && this.dataType === 'parentTask') {
        this.dialogRef.close({ response: true, id: this.taskBoardTaskVO.taskboardId, taskboardTaskId: data.uuid, taskDetails: this.taskBoardTaskVO });
      } else if (this.dataType === 'subtask' || this.dataType === 'comments') {
        const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
          disableClose: true,
          width: '100px',
          data: { type: 'spinner' }
        });
        let sprintId: string;
        if (this.data.sprintVO?.sprintId) {
          sprintId = this.data.sprintVO?.sprintId;
        } else {
          sprintId = null;
        }
        this.taskboardService.getTaskboardTask(this.taskBoardTaskVO.id, sprintId).subscribe(data => {
          dialog.close();
          this.taskBoardTaskVO = data;
          const index = this.taskList.findIndex(task => task.id === this.taskBoardTaskVO.id);
          this.taskList[index] = this.taskBoardTaskVO;
          this.isTaskData = true;
          // if (this.data.taskName !== undefined && this.data.taskName !== null && this.data.taskName !== '') {
          //   if (this.data.taskName !== 'generatedTaskId') {
          //     this.taskBoardTaskVO.taskName = this.taskBoardTaskVO.taskData[this.data.taskName];
          //   } else {
          //     this.taskBoardTaskVO.taskName = this.taskBoardTaskVO.taskId;
          //   }
          // }
          if (this.taskBoardTaskVO.description !== null) {
            this.descriptionFieldShow = true;
          }
          this.form.get('description').setValue(this.taskBoardTaskVO.description);
          if (this.taskBoardTaskVO.dueDate !== undefined && this.taskBoardTaskVO.dueDate !== null && this.taskBoardTaskVO.dueDate !== '') {
            const date = new Date(this.taskBoardTaskVO.dueDate);
            const currentDate = new Date;
            this.date = date;
            this.dueDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
            if (date > currentDate) {
              this.dueDateColor = '#039703';
            } else {
              this.dueDateColor = '#c90000';
            }
          }
          if (this.taskBoardTaskVO.startDate !== undefined && this.taskBoardTaskVO.startDate !== null && this.taskBoardTaskVO.startDate !== '') {
            const date = new Date(this.taskBoardTaskVO.startDate);
            const currentDate = new Date;
            this.start_date = date;
            this.startDate = this.datePipe.transform(date, 'dd-MMM-yyyy');
            if (date > currentDate) {
              this.startDateColor = '#039703';
            } else {
              this.startDateColor = '#c90000';
            }
          }
          const length = (this.form.get('subtaskArray') as FormArray).length;
          for (let i = 0; i < length; i++) {
            (this.form.get('subtaskArray') as FormArray).removeAt(0);
          }
          this.loadSubtaskArray();
        }, error => {
          dialog.close();
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: 'Internal server error'
          });
        });
      }
    }, error => {
      dialog1.close();
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: 'Internal server error'
      });
    });
  }

  getFormValues(event) {
    //     if(this.allowClose === true && event.isFormChanged === false){
    //       const dialog = this.dialog.open(ConfirmationDialogComponent, {
    //         disableClose: true,
    //         width: '400px',
    //         data: { type: 'valueChanged' }
    //       });
    //       dialog.afterClosed().subscribe((Data) => {
    //         if (Data === true) {
    //           this.dialogRef.close();
    //         }
    //         else {
    //           return;
    //         }
    //       });
    //     }
    // else{
    if (event.isFormChanged === false && this.notCheckPristine === false) {
      if (event && event !== false && event !== [] && event.length !== 0 && this.isOpenView === true) {
        if (event.form) {
          this.taskBoardTaskVO.taskData = event.form.getRawValue();
        } else {
          this.taskBoardTaskVO.taskData = event;
        }
        this.isOpenView = false;
        this.openDialog();
      }
      else {
        this.dialogRef.close();
      }
    } else {
      if (event === 'error contains' || this.dialogClose === true) {
        this.dialogClose = false;
        return;
      }
      if (event && event.length === 0) {
        this.closeDialog = true;
      }
      if (event && event !== false && event !== [] && event.length !== 0 && this.isOpenView === true) {
        if (event.form) {
          this.taskBoardTaskVO.taskData = event.form.getRawValue();
        } else {
          this.taskBoardTaskVO.taskData = event;
        }
        this.isOpenView = false;
        this.openDialog();
      } else {
        if (event && event !== false && event !== [] && event.length !== 0 && this.form.valid) {
          if (!this.taskBoardTaskVO.id) {
            this.taskBoardTaskVO.id = null;
          }

          this.taskBoardTaskVO.dueDate = this.date;
          this.taskBoardTaskVO.startDate = this.start_date;


          // if (!this.taskBoardTaskVO.taskName && this.data.taskName !== undefined && this.data.taskName !== null && this.data.taskName !== '') {
          //   if (this.data.taskName !== 'generatedTaskId') {
          //     if (event[this.data.taskName]) {
          //       this.taskBoardTaskVO.taskName = event[this.data.taskName];
          //     }
          //   } else {
          //     this.taskBoardTaskVO.taskName = this.form.get('taskName').value;
          //   }
          // }

          if (event && event.form && this.notCheckPristine === true) {
            this.taskBoardTaskVO.taskData = event.form.getRawValue();
          } else {
            this.taskBoardTaskVO.taskData = event;
          }
          this.taskBoardTaskVO.status = this.data.taskDetails.status;
          if (this.start_date === undefined) {
            this.taskBoardTaskVO.startDate = new Date();

          }
          else {
            this.taskBoardTaskVO.startDate = this.start_date;

          }

          this.taskBoardTaskVO.taskType = 'parentTask';
          this.taskBoardTaskVO.taskboardId = this.data.taskDetails.taskboardId;
          this.taskBoardTaskVO.subTasks = this.removeEmptySubtaskArray();
          this.taskBoardTaskVO.description = this.form.get('description').value;
          if (this.taskBoardTaskVO.subTasks === undefined || this.taskBoardTaskVO.subTasks === null) {
            this.taskBoardTaskVO.subTasks = [];
          }
          this.taskBoardTaskVO.removedSubtasks = [];

          if (this.taskBoardTaskVO.id) {
            if (this.index === 'true') {
              this.index = this.taskList.findIndex(task => task.id === this.taskBoardTaskVO.id);
              this.taskList[this.index].subTasks = this.taskBoardTaskVO.subTasks;
            }
               
          }
          const taskVO = new TaskboardTaskVO();
          taskVO.id = this.taskBoardTaskVO.id;
          taskVO.status = this.taskBoardTaskVO.status;
          taskVO.taskData = this.taskBoardTaskVO.taskData;
          taskVO.taskId = this.taskBoardTaskVO.taskId;
          taskVO.taskName = this.taskBoardTaskVO.taskName;
          taskVO.taskType = this.taskBoardTaskVO.taskType;
          taskVO.taskboardId = this.taskBoardTaskVO.taskboardId;
          if (this.data.subStatus) {
            taskVO.subStatus = this.data.subStatus;
            this.taskBoardTaskVO.subStatus = this.data.subStatus;
          }
          this.taskboardService.saveTaskboardTask(taskVO).subscribe(data => {
            if (data) {
              if (this.date) {
                this.taskBoardTaskVO.dueDate = this.date;
              }
              if (this.start_date) {
                this.taskBoardTaskVO.startDate = this.start_date;
              }
              this.dialogRef.close({ taskDetails: this.taskBoardTaskVO, status: this.status, id: data.uuid });
            }
          });
        } else if (event === false && this.isOpenView === false) {
          this.dialogRef.close();
        }
      }
      this.isOpenView = false;
    }
    //   this.dialogRef.close();
    // }
  }
  close() {
    this.dialogRef.close({ taskDetails: this.taskBoardTaskVO, status: this.status });
  }
  cancelTask() {
    // this.allowClose = true;
    // this.isEmit = true;
    // this.formDetails.emit(true)
    this.dialogRef.close();
  }

  editTitle() {
    this.edit = true;
  }


  titleChange() {
    const taskName = this.form.get('taskName');
    if (this.form.get('taskName').value && this.form.get('taskName').value.length > 200) {
      this.showError = true;
      taskName.setErrors({ maxError: true });
    } else {
      this.showError = false;
      taskName.setErrors(null);
      this.taskBoardTaskVO.taskName = this.form.get('taskName').value;
      if (this.data.value !== 'task') {
        this.taskboardService.saveTaskboardTask(this.taskBoardTaskVO).subscribe(data => {
          if (data) {
            this.edit = false;
          }
        });
      }
    }
  }

  save() {
    if (this.data.isTaskBoardOwner || (this.taskboardColumnSecurity && this.taskboardColumnSecurity.update === true)) {
      if (this.data.type === 'Archived' || this.data.type === 'deleted' || this.data.type === 'files') {
        this.dialogRef.close();
      }
      if (this.taskBoardTaskVO.taskType === 'subtask') {
        this.dialogRef.close({ taskDetails: this.taskBoardTaskVO, status: this.status, id: this.taskBoardTaskVO.id, type: 'subtask' });
      }
      this.isClose = true;

      const subtaskArrayLength = (this.form.get('subtaskArray') as FormArray).length;
      this.isSubTaskFormValid = false;
      if (subtaskArrayLength > 0) {
        for (let i = 0; i < subtaskArrayLength; i++) {
          if ((this.form.get('subtaskArray').get('' + i).get('id').value === undefined ||
            this.form.get('subtaskArray').get('' + i).get('id').value === null ||
            this.form.get('subtaskArray').get('' + i).get('id').value === '')
            && this.form.get('subtaskArray').valid) {
            this.isSubTaskFormValid = true;
          } else {
            this.isSubTaskFormValid = false;
          }
        }
      }

      if (this.isSubTaskFormValid === false) {
        if (this.form.get('subtaskArray').invalid) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: 'Subtask cannot be empty.'
          });
        }
        this.isEmit = true;
        this.formDetails.emit(true);
        if (this.closeDialog === true) {
          this.closeDialog = false;
          this.dialogRef.close();
        }
      }
      else if (this.form.valid && this.isSubTaskFormValid === true && this.subtaskstatus === false) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: 'You need to save the subtask'
        });
      }

    } else {
      this.dialogRef.close();
    }
  }

  setStatus(status, i): void {

    this.checkDone = false;
    this.status = status;

    this.data.color = status.color;
    //  this.data.taskDetails.status = status.name;
    this.taskBoardTaskVO.status = status.name;
    const subTasks = this.taskBoardTaskVO.subTasks;
    if (this.taskBoardTaskVO.id) {
      this.index = this.taskList.findIndex(task => task.id === this.taskBoardTaskVO.id);
      this.taskList[this.index].status = status.name;
      this.response = false;
      this.dataType = 'false';
      if (this.taskBoardTaskVO.taskType !== 'subtask') {
        this.data.taskDetails.status = status.name;

        if (subTasks !== undefined && subTasks !== null && subTasks.length !== 0 && subTasks.some(ele => ele.status !== 'Done') && i === this.data.statusList.length - 1) {
          this.checkDone = true;
          const dialog = this.dialog.open(DragconfirmComponent, {
            disableClose: true,
            width: '450px',
            data: { type: 'subtask', pendingSubTaskCount: subTasks.length, taskId: this.taskBoardTaskVO.taskId },

          });
          dialog.afterClosed().subscribe(() => {
          });
          this.data.taskDetails.status = this.previousStatus;
          this.taskBoardTaskVO.status = this.previousStatus;
          const index = this.data.statusList.findIndex(name => name.name === this.previousStatus);
          this.data.color = this.data.statusList[index].color;
          this.taskList[this.index].status = this.previousStatus;

        }
        else {
          this.checkDone = false;
          for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
            if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName === this.previousStatus) {
              const index = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.findIndex(f => f.id === this.taskBoardTaskVO.id);
              this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.splice(index, 1);
            }
            if (this.taskboardVO.taskboardColumnMapVO[i].taskboardColumnsVO.columnName === status.name) {

              this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.push(this.taskBoardTaskVO);
            }
          }
        }
      }
      else {
        for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
          for (let j = 0; j < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j++) {
            if (this.taskBoardTaskVO.parentTaskId === this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j].id) {
              const index = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.findIndex(f => f.id === this.taskBoardTaskVO.parentTaskId);
              for (let k = 0; k < this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[index].subTasks.length; k++) {
                if (this.taskBoardTaskVO.id === this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[index].subTasks[k].id) {
                  const index1 = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[j].subTasks.findIndex(f => f.id === this.taskBoardTaskVO.id);
                  this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList[index].subTasks[index1].status = this.taskBoardTaskVO.status;
                }
              }
            }

          }
        }
      }
      this.taskBoardTaskVO.sequenceNo = null;
      const taskVO = new TaskboardTaskVO();
      taskVO.id = this.taskBoardTaskVO.id;

      taskVO.sequenceNo = null;
      if (this.checkDone === false) {
        if (status.subStatusList && status.subStatusList.length > 0) {
          const dialog = this.dialog.open(SubStatusComponent, {
            disableClose: false,
            width: '400px',
            data: { subStatusList: status.subStatusList }
          });
          dialog.afterClosed().subscribe(data => {
            if (data && data !== false) {
              taskVO.subStatus = data;
              this.taskBoardTaskVO.subStatus = data;
              this.taskList[this.index].subStatus = data;
              taskVO.status = this.taskBoardTaskVO.status;
              this.statusChange(taskVO, status.name);
            } else {
              taskVO.subStatus = null;
              this.taskBoardTaskVO.subStatus = null;
              this.taskList[this.index].subStatus = null;
              taskVO.status = this.previousStatus;
              this.taskBoardTaskVO.status = this.previousStatus;
              const status = this.statusList.find(status => status.name === this.previousStatus);
              this.data.color = status.color;
              // this.statusChange(taskVO, this.previousStatus);
            }
          });
        } else {
          if (this.taskBoardTaskVO.taskType === 'subtask' && this.data.taskDetails.subStatus !== null && this.data.taskDetails.subStatus !== undefined && this.data.taskDetails.subStatus !== '') {
            taskVO.subStatus = this.data.taskDetails.subStatus;
          }
          else {
            taskVO.subStatus = null;
            this.taskBoardTaskVO.subStatus = null;
            this.taskList[this.index].subStatus = null;
          }
          taskVO.status = this.taskBoardTaskVO.status;
          this.statusChange(taskVO, status.name);
        }
      }
    }
  }

  statusChange(taskVO: any, status: string): void {
    this.taskboardService.setTaskBoardStatus(taskVO).subscribe(data => {
      if (data) {
        this.previousStatus = status;
        const index = this.taskboardVO.taskboardColumnMapVO.findIndex(task => task.taskboardColumnsVO.columnName === status);
        for (let j = 0; j < this.data.mappedColumnTaskList.length; j++) {
          for (let k = 0; k < this.taskBoardTaskVO.subTasks.length; k++) {
            if (this.data.mappedColumnTaskList[j].taskName === this.taskBoardTaskVO.subTasks[k].taskName) {
              this.taskboardVO.taskboardColumnMapVO[index].taskboardTaskVOList.push(this.data.mappedColumnTaskList[j]);
              this.data.mappedColumnTaskList.splice(j, 1);
            }
          }

        }
        this.data.mappedColumnTaskList.forEach(element => {

          if (element.id === this.taskBoardTaskVO.id) {
            element.status = taskVO.status;
          }
        });
      }
    });
  }

  setSubStatus(subStatusName: string): void {
    const taskVO = new TaskboardTaskVO();
    taskVO.id = this.taskBoardTaskVO.id;
    taskVO.status = this.taskBoardTaskVO.status;
    taskVO.subStatus = subStatusName;
    const oldSubStatusName = this.taskBoardTaskVO.subStatus;
    this.taskBoardTaskVO.subStatus = subStatusName;
    this.taskboardService.setTaskBoardStatus(taskVO).subscribe(data => {
      if (data) {
        this.index = this.taskList.findIndex(task => task.id === this.taskBoardTaskVO.id);
        this.taskList[this.index].subStatus = subStatusName;
      }
    }, error => {
      this.taskBoardTaskVO.subStatus = oldSubStatusName;
    });
  }

  setSubtaskStatus(status) {
    const group = ((this.form.get('subtaskArray') as FormArray).get('' + this.selectedSubtask) as FormGroup);
    group.get('status').setValue(status.name);
    group.get('color').setValue(status.statusColor);
    if (group.get('id').value !== undefined && group.get('id').value !== null && group.get('id').value !== '') {
      const subtaskStatus = new Subtask();
      subtaskStatus.id = group.get('id').value;
      subtaskStatus.subtaskStatus = group.get('status').value;
      subtaskStatus.dueDate = group.get('dueDate').value;
      subtaskStatus.startDate = group.get('startDate').value ? new Date(group.get('startDate').value) : null;
      subtaskStatus.subtaskName = group.get('taskName').value;
      subtaskStatus.taskboardTaskId = this.taskBoardTaskVO.id;
      subtaskStatus.taskboardId = null;
      subtaskStatus.taskId = null;
      subtaskStatus.subStatus = null;
      this.taskboardService.saveSubtask(subtaskStatus).subscribe(data => {
        this.data.mappedColumnTaskList.forEach(element => {
          if (element.id === subtaskStatus.id) {
            element.status = subtaskStatus.subtaskStatus;
          }
        });

      });
    }
  }

  onClick() {
    if (this.taskBoardTaskVO.id && this.taskboardColumnSecurity.read === true) {
      const metaData = { taskId: this.taskBoardTaskVO.id };
      const dialog = this.dialog.open(UppyComponentComponent, {
        width: '660px',
        disableClose: true,
        maxHeight: '650px',
        data: { from: 'taskboard-task', metaData, endpoint: 'workflow-service/taskboard/v1/upload-file', restrictions: { maxFileSize: 50000000 } },
      });
      dialog.afterClosed().subscribe(data => {
        const dialog1 = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
          disableClose: true,
          width: '100px',
          data: { type: 'spinner' }
        });
        this.taskboardService.getFiles(this.taskBoardTaskVO.id).subscribe(data => {
          dialog1.close();
          this.taskBoardTaskVO.files = data;
        }, error => {
          dialog1.close();
        });
      });
    }
  }

  getFile(): void {
    this.isFile = true;
    this.taskboardService.getFiles(this.taskBoardTaskVO.id).subscribe(data => {
      this.taskBoardTaskVO.files = data;
      this.isFile = false;
    });
  }

  setBorder(i) {
    if (this.taskboardColumnSecurity.update === true) {
      const group = ((this.form.get('subtaskArray') as FormArray).get('' + i) as FormGroup);
      group.get('border').setValue(true);
    }
  }

  subtaskFocusout(i) {
    const group = ((this.form.get('subtaskArray') as FormArray).get('' + i) as FormGroup);

    if (group.get('taskName').value !== undefined &&
      group.get('taskName').value !== null &&
      group.get('taskName').value !== '') {
      group.get('showIcons').setValue(true);
      group.get('border').setValue(false);
    }
    if (group.get('status').value !== 'Done' && this.taskboardColumnSecurity.update === true) {
      let taskName = null;
      if (this.taskBoardTaskVO.subTasks[i] !== undefined && this.taskBoardTaskVO.subTasks[i] !== null && this.taskBoardTaskVO.subTasks[i].taskName) {
        taskName = this.taskBoardTaskVO.subTasks[i].taskName;
      }
      if (group.get('taskName').value !== undefined &&
        group.get('taskName').value !== null &&
        group.get('taskName').value !== '' &&
        (taskName === null || (taskName !== null && group.get('taskName').value !== taskName))) {
        this.dataType = 'subtask';
        const subtask = new Subtask();
        subtask.taskboardId = this.taskBoardTaskVO.taskboardId;
        subtask.taskboardTaskId = this.taskBoardTaskVO.id;
        subtask.id = group.get('id').value;
        subtask.subtaskName = group.get('taskName').value;
        subtask.subtaskStatus = group.get('status').value;
        subtask.subStatus = this.taskBoardTaskVO.subStatus;
        subtask.taskId = 'Parent[' + this.taskBoardTaskVO.taskId + ']';
        this.taskboardService.saveSubtask(subtask).subscribe(data => {
          if (subtask.id === undefined || subtask.id === null || subtask.id === '') {
            group.get('id').setValue(data.uuid);
            const taskVO = new TaskboardTaskVO();
            taskVO.id = data.uuid;
            taskVO.taskName = subtask.subtaskName;
            taskVO.taskType = 'subtask';
            taskVO.status = subtask.subtaskStatus;
            taskVO.dueDate = null;
            taskVO.startDate = null;
            taskVO.subStatus = this.taskBoardTaskVO.subStatus;
            taskVO.taskId = 'Parent[' + this.taskBoardTaskVO.taskId + ']';
            taskVO.taskData = null;
            taskVO.parentTaskId = this.taskBoardTaskVO.id;
            this.data.mappedColumnTaskList.push(taskVO);
            this.taskList.push(taskVO);
            this.data.taskDetails.subTasks.push(group.getRawValue());
          }
          else {
            this.data.mappedColumnTaskList.forEach(element => {
              if (element.id === subtask.id) {
                element.taskName = subtask.subtaskName;
              }
            });
          }
          this.isSubTaskFormValid = false;
          this.taskBoardTaskVO.subTasks.push(group.getRawValue());
        });
      }
    }
  }

  openLabelDialog() {
    if (this.taskBoardTaskVO.id && this.taskboardColumnSecurity.read === true) {
      const dialog = this.dialog.open(LabelsDialogComponent, {
        disableClose: true,
        width: '450px',
        minHeight: '200px',
        maxHeight: '600px',
        data: {
          labels: this.taskBoardTaskVO.labels, taskboardLabels: this.taskboardLabels,
          taskboardId: this.taskBoardTaskVO.taskboardId, taskList: this.taskList, taskIndex: this.index,
          eventAutomation: false
        }
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          const removedIdList: string[] = [];
          let selectedLabels: LabelsVO[] = [];
          const taskboardlabelIdList: string[] = [];
          let taskboardLabels: any;
          if (this.taskboardVO.taskboardLabels === undefined || this.taskboardVO.taskboardLabels === null) {
            taskboardLabels = {
              id: this.taskboardVO.id,
              labels: data.taskboardLabels
            };
            this.taskboardVO.taskboardLabels = taskboardLabels;
          } else {
            this.taskboardVO.taskboardLabels.labels = data.taskboardLabels;
          }

          if (this.taskBoardTaskVO.labels === undefined || this.taskBoardTaskVO.labels === null || this.taskBoardTaskVO.labels.length === 0) {
            this.taskBoardTaskVO.labels = data.labelVO;
            selectedLabels = data.labelVO;
          } else {
            let labelsVO: LabelsVO[];
            labelsVO = data.labelVO;
            labelsVO.forEach(element => {
              if (!this.taskBoardTaskVO.labels.some(label => label.taskboardLabelId === element.taskboardLabelId) && !taskboardlabelIdList.includes(element.taskboardLabelId)) {
                selectedLabels.push(element);
                taskboardlabelIdList.push(element.taskboardLabelId);
              }
            });
            data.labels.forEach(element => {
              if (element.isSelected === false && this.taskBoardTaskVO.labels.some(label => label.taskboardLabelId === element.id)) {
                removedIdList.push(element.taskboardTaskLabelId);
              }
            });
            this.taskBoardTaskVO.labels;
          }
          this.taskboardLabels.labels = data.taskboardLabels;
          this.taskboardLabels.taskboardId = this.taskBoardTaskVO.taskboardId;
          this.taskBoardTaskVO.labels = data.labelVO;
          this.taskList[this.index] = this.taskBoardTaskVO;
          this.response = false;
          this.dataType = 'false';
          if (selectedLabels.length > 0 || removedIdList.length > 0) {
            const taskboardTaskLabels = new TaskboardTaskLabelVO();
            taskboardTaskLabels.id = this.taskBoardTaskVO.id;
            taskboardTaskLabels.labels = selectedLabels;
            taskboardTaskLabels.removedIdList = removedIdList;
            this.taskboardService.saveTaskboardTaskLabel(taskboardTaskLabels).subscribe(data => {
              let taskLabels = new TaskboardTaskLabelVO();
              taskLabels = data.object;
              for (let i = 0; i < this.taskBoardTaskVO.labels.length; i++) {
                if (taskLabels.labels.some(label => label.taskboardLabelId === this.taskBoardTaskVO.labels[i].taskboardLabelId)) {
                  const label = taskLabels.labels.find(label => label.taskboardLabelId === this.taskBoardTaskVO.labels[i].taskboardLabelId);
                  this.taskBoardTaskVO.labels[i].taskboardTaskLabelId = label.taskboardTaskLabelId;
                }
              }
              for (let i = 0; i < this.taskboardLabels.labels.length; i++) {
                if (taskLabels.labels.some(label => label.taskboardLabelId === this.taskboardLabels.labels[i].taskboardLabelId)) {
                  const label = taskLabels.labels.find(label => label.taskboardLabelId === this.taskboardLabels.labels[i].taskboardLabelId);
                  this.taskboardLabels.labels[i].taskboardTaskLabelId = label.taskboardTaskLabelId;
                }
              }
            });
          }
        }
      });
    }
  }

  removeLabel(labels, index) {

    if (this.taskboardColumnSecurity && this.taskboardColumnSecurity.update === true) {
      this.taskBoardTaskVO.labels.forEach((element, index) => {
        if (element === labels) { this.taskBoardTaskVO.labels.splice(index, 1); }
      });
      this.taskboardService.removeLabel(labels.taskboardTaskLabelId).subscribe();
    }
  }

  setMessage(event: any) {
    if (event.message !== undefined && event.message !== null && event.message !== '') {
      const taskcomments = new TaskCommentsVO();
      taskcomments.id = null;
      taskcomments.taskId = this.taskBoardTaskVO.id;
      taskcomments.comments = event.message;
      taskcomments.createdOn = new Date();
      taskcomments.modifiedOn = new Date();
      taskcomments.createdBy = this.taskBoardTaskVO.loggedInUserName;
      taskcomments.isReply = false;
      taskcomments.mentionedUsersEmail = event.contactMails;
      taskcomments.mentionedUsersId = event.usersId;
      this.taskBoardTaskVO.taskComments.push(taskcomments);
      this.taskBoardTaskVO.commentsLength = this.taskBoardTaskVO.commentsLength + 1;
      this.form.get('taskComments').setValue('');
      if (this.taskBoardTaskVO.id) {
        if (this.index === 'true') {
          this.index = this.taskList.findIndex(task => task.id === this.taskBoardTaskVO.id);
        }
        this.response = false;
        this.dataType = 'comments';
        this.taskboardService.saveComments(taskcomments).subscribe(data => {
          if (data) {
            this.taskBoardTaskVO.taskComments[this.taskBoardTaskVO.taskComments.length - 1].id = data.uuid;
            this.taskList[this.index] = this.taskBoardTaskVO;
          }
        }, error => {
          this.taskBoardTaskVO.taskComments.splice(this.taskBoardTaskVO.taskComments.length - 1, 1);
        });
      }
    }
  }

  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }

  mousedown(i) {
    this.selectedSubtask = i;
    if (this.taskBoardTaskVO.subTasks[i]?.startDate) {
      this.minSubtaskDate = new Date(this.taskBoardTaskVO.subTasks[i]?.startDate);
    } else {
      this.minSubtaskDate = null;
    }
  }



  assignSubtask(i) {
    this.index = this.taskList.findIndex(element => element.id === this.taskBoardTaskVO.id);
    if (this.taskBoardTaskVO.id) {
      if (this.form.get('subtaskArray').get('' + i).get('status').value !== 'Done') {
        const dialog = this.dialog.open(AssigntaskDialogComponent, {
          disableClose: true,
          width: '50%',
          height: '75%',
          data: {
            type: 'subtask', i,
            taskboardId: this.taskBoardTaskVO.taskboardId, taskList: this.taskList, taskIndex: this.index,
            taskVO: this.taskBoardTaskVO, groupList: this.data.groupList,
            usersList: this.boardUsers, taskboardSecurityVO: this.taskboardSecurityVO, taskboardColumnId: this.data.taskboardColumnId
          }
        });
        dialog.afterClosed().subscribe(data => {
          if (data && this.taskBoardTaskVO.id) {
            this.response = true;
            this.dataType = data.type;
            const taskVO = new TaskboardTaskVO();
            taskVO.id = this.taskBoardTaskVO.subTasks[i].id;
            taskVO.assignTaskVO = this.taskBoardTaskVO.subTasks[i].assignTaskVO;
            let sprintId: string;
            if (this.data.sprintVO?.sprintId) {
              sprintId = this.data.sprintVO?.sprintId;
            } else {
              sprintId = null;
            }
            this.taskboardService.saveAssigneeUser(taskVO).subscribe(data => {
              if (data && !taskVO.assignTaskVO.assigneeUserTaskList.some(user => user.assigneeUser === this.userVo.userId)) {
                this.taskboardService.getTaskboardTask(this.taskBoardTaskVO.id, sprintId).subscribe(data => {
                  this.taskBoardTaskVO = data;
                  const length = (this.form.get('subtaskArray') as FormArray).length;
                  for (let i = 0; i < length; i++) {
                    (this.form.get('subtaskArray') as FormArray).removeAt(0);
                  }
                  this.loadSubtaskArray();
                });
              } else {
                if (data.object.length > 0 && this.taskBoardTaskVO.subTasks[i].assignTaskVO.assigneeUserTaskList.length > 0) {
                  for (let k = 0; k < data.object.length; k++) {
                    for (let j = 0; j < this.taskBoardTaskVO.subTasks[i].assignTaskVO.assigneeUserTaskList.length; j++) {
                      if (this.taskBoardTaskVO.subTasks[i].assignTaskVO.assigneeUserTaskList[j].assigneeUser === data.object[k].assigneeUser) {
                        this.taskBoardTaskVO.subTasks[i].assignTaskVO.assigneeUserTaskList[j].id = data.object[k].id;
                      }
                    }

                  }
                }
              }
            });
          }
        });
      }
    }
  }

  logWorkdialog() {
    const dialog = this.dialog.open(WorkLogDialogComponent, {
      data: this.taskBoardTaskVO,
      disableClose: true,
      width: '35%',
      height: '57%',
    });
  }

  openAssignTaskDialog() {
    this.index = this.taskList.findIndex(element => element.id === this.taskBoardTaskVO.id);
    if (this.taskBoardTaskVO.id) {
      const dialog = this.dialog.open(AssigntaskDialogComponent, {
        disableClose: true,
        width: '50%',
        height: '75%',
        data: {
          type: 'parentTask',
          taskboardId: this.taskBoardTaskVO.taskboardId, taskList: this.taskList, taskIndex: this.index,
          taskVO: this.taskBoardTaskVO, groupList: this.data.groupList,
          usersList: this.boardUsers, taskboardSecurityVO: this.taskboardSecurityVO, taskboardColumnId: this.data.taskboardColumnId
        }
      });
      dialog.afterClosed().subscribe(data => {
        if (data && this.taskBoardTaskVO.id) {
          this.dataType = data.type;
          this.response = true;
          const taskVO = new TaskboardTaskVO();
          taskVO.id = this.taskBoardTaskVO.id;
          taskVO.assignTaskVO = this.taskBoardTaskVO.assignTaskVO;
          this.taskboardService.saveAssigneeUser(taskVO).subscribe(data => {
            this.boardUsers.forEach(param => param.isSelected = false);
            if (data && !taskVO.assignTaskVO.assigneeUserTaskList.some(user => user.assigneeUser === this.userVo.userId)) {
              this.dialogRef.close({ response: true, id: this.taskBoardTaskVO.taskboardId, taskboardTaskId: this.taskBoardTaskVO.id, taskDetails: this.taskBoardTaskVO });
            } else {
              if (data.object.length > 0 && this.taskBoardTaskVO.assignTaskVO.assigneeUserTaskList.length > 0) {
                for (let i = 0; i < data.object.length; i++) {
                  for (let j = 0; j < this.taskBoardTaskVO.assignTaskVO.assigneeUserTaskList.length; j++) {
                    if (this.taskBoardTaskVO.assignTaskVO.assigneeUserTaskList[j].assigneeUser === data.object[i].assigneeUser) {
                      this.taskBoardTaskVO.assignTaskVO.assigneeUserTaskList[j].id = data.object[i].id;
                    }
                  }
                }
              }
            }
          });
        }
      });
    }
  }

  open_fullview() {
    this.isOpenView = true;
    this.isEmit = true;
    this.notCheckPristine = false;
    this.formDetails.emit(true);
  }

  openDialog() {
    this.show = false;
    const dialog = this.dialog.open(DialogviewComponent, {
      disableClose: true,
      width: '1200px',
      height: '98%',
      data: {
        id: this.data.formId,
        version: this.data.version,
        taskVO: this.taskBoardTaskVO,
        pageFrom: 'popoutView',
        object: this,
        pageSecurity: this.data.taskboardColumnSecurity,
        isDoneColumn: this.isDoneColumn
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.taskBoardTaskVO.taskData = data;
        this.notCheckPristine = true;
        this.show = true;
        this.dialogClose = true;
      } else {
        this.show = true;
        this.dialogClose = true;
      }
    });
  }



  loadBoardUsers() {
    this.securityService.getTaskboardSecurity(this.data.taskboardId).subscribe(data => {
      this.boardGroups = data.securityList;
      this.isUsers = true;
      this.usersList = this.data.usersList;
      this.activity.usersList = this.usersList;
      for (let i = 0; i < this.boardGroups.length; i++) {
        this.usersList.forEach(element => {
          element.groupVOList.forEach(group => {
            if (group.groupName === this.boardGroups[i].groupId) {
              this.boardUsers.push(element);
            }
          });
        });
      }
      for (let i = 0; i < data.columnSecurityList.length; i++) {
        for (let j = 0; j < data.columnSecurityList[i].columnPermissions.length; j++) {
          this.usersList.forEach(element => {
            element.groupVOList.forEach(group => {
              if (group.groupName === data.columnSecurityList[i].columnPermissions[j].groupId) {
                this.boardUsers.push(element);
              }
            });
          });
        }
      }
      for (let i = 0; i < data.taskboardOwner.length; i++) {
        const user = this.usersList.find(user => user.userId === data.taskboardOwner[i]);
        this.boardUsers.push(user);
      }
      this.boardUsers = this.boardUsers.filter((v, i) => this.boardUsers.findIndex(item => item.userId === v.userId) === i);
    });
  }
  back() {

    const taskVO = new TaskboardTaskVO();
    taskVO.id = this.data.taskDetails.id;
    this.taskBoardTaskVO = taskVO;
    this.data.statusList = this.statusList;
    this.subtaskForms.clear();
    const group = (this.form.get('subtaskArray') as FormArray).length;
    this.startDate = null;
    this.dueDate = null;
    this.getFormData();
  }

  loadMessage(message): void {
    const descriptionValue = message;
    if (descriptionValue === undefined || descriptionValue === null || descriptionValue === '') {
      this.descriptionFieldShow = false;
    } else if (this.taskBoardTaskVO.id !== undefined && this.taskBoardTaskVO.id !== null && this.taskBoardTaskVO.id !== '') {
      const taskVO = new TaskboardTaskVO();
      taskVO.id = this.taskBoardTaskVO.id;
      taskVO.description = message;
      this.taskboardService.saveDescription(taskVO).subscribe(data => {
        if (data) {
          this.descriptionFieldShow = true;
          this.showQuill = false;
          this.form.get('description').setValue(message);
          this.taskBoardTaskVO.description = message;
        }
      });
    }


  }

  cancelDescription(event) {
    this.descriptionFieldShow = true;
    this.showQuill = false;
  }

  onCategorySelected(category: any): void {
    this.categoriesArray.forEach(category => category.isSelected = false);
    category.isSelected = true;
    this.selectedCategory = category.name;
  }

  mouseEnter(i: number, dependencyType: string): void {
    this.dependencyIndex = i;
    this.dependencyType = dependencyType;
  }

  mouseLeave(): void {
    this.dependencyIndex = '';
  }

  removeDependencies(task: TaskboardTaskVO): void {
    this.spinnerDialog();
    this.taskboardService.removeDependency(task.dependencyId).subscribe(data => {
      this.spinner.close();
      if (data) {
        if (this.dependencyType === 'waitingOn') {
          this.taskBoardTaskVO.taskDependenciesVO.waitingOn.splice(this.taskBoardTaskVO.taskDependenciesVO.waitingOn.findIndex(dependency => dependency.dependencyId === task.dependencyId), 1);
        } else if (this.dependencyType === 'blocking') {
          this.taskBoardTaskVO.taskDependenciesVO.blocking.splice(this.taskBoardTaskVO.taskDependenciesVO.blocking.findIndex(dependency => dependency.dependencyId === task.dependencyId), 1);
        } else {
          this.taskBoardTaskVO.taskDependenciesVO.relatedTasks.splice(this.taskBoardTaskVO.taskDependenciesVO.relatedTasks.findIndex(dependency => dependency.dependencyId === task.dependencyId), 1);
        }
      }
    }, error => {
      this.spinner.close();
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: 'Internal server error'
      });
    });
  }

  loadDependencies(id: string): string {
    const task = this.taskLists.find(task => task.id === id);
    if (task) {
      return task.taskId;
    } else {
      return '';
    }
  }

  expandOrCollapse(value: string): void {
    if (value === 'open') {
      this.open = true;
    } else {
      this.open = false;
    }
    this.ngAfterViewInit();
  }

  replyComment(comment: any): void {
    comment.isReply = true;
  }

  setReplyMessage(replyMessage: string, comment: any): void {
    if (replyMessage !== undefined && replyMessage !== null && replyMessage !== '') {
      comment.isReply = false;
      const nestedComments = new NestedCommentsVO();
      nestedComments.parentCommentId = comment.id;
      nestedComments.nestedComment = replyMessage;
      nestedComments.createdBy = comment.createdBy;
      nestedComments.id = null;
      nestedComments.createdOn = new Date();
      if (comment.nestedComments === undefined || comment.nestedComments === null) {
        comment.nestedComments = [];
      }
      comment.nestedComments.push(nestedComments);
      const taskcomments = new TaskCommentsVO();
      taskcomments.id = null;
      taskcomments.parentCommentId = comment.id;
      taskcomments.taskId = this.taskBoardTaskVO.id;
      taskcomments.comments = replyMessage;
      taskcomments.createdOn = new Date();
      taskcomments.createdBy = this.taskBoardTaskVO.loggedInUserName;
      taskcomments.isReply = false;
      this.form.get('taskComments').setValue('');
      if (this.taskBoardTaskVO.id) {
        if (this.index === 'true') {
          this.index = this.taskList.findIndex(task => task.id === this.taskBoardTaskVO.id);
        }
        this.taskList[this.index] = this.taskBoardTaskVO;
        this.response = false;
        this.dataType = 'comments';
        this.taskboardService.saveComments(taskcomments).subscribe();
      }
    }
  }

  getCommentsUserPrefix(createdBy: string): string {
    const user = this.data.usersList.find(user => user.firstName + ' ' + user.lastName === createdBy);
    const firstName = user.firstName.charAt(0).toUpperCase();
    const lastName = user.lastName.charAt(0).toUpperCase();
    return firstName + lastName;
  }

  closeQuill(comment: any): void {
    comment.isReply = false;
  }



  savePriority(priority: any): void {
    const taskVO = new TaskboardTaskVO();
    taskVO.id = this.taskBoardTaskVO.id;
    taskVO.priority = priority.name;
    this.spinnerDialog();
    this.taskboardService.savePriority(taskVO).subscribe(data => {
      if (data && data.response.includes('updated')) {
        this.spinner.close();
        this.taskBoardTaskVO.priority = priority.name;
      }
    });
  }

  getFlagColor(): string {
    this.activity.priority = this.priorityArray;
    let returnValue = 'grey';
    if (this.taskBoardTaskVO.priority) {
      const priority = this.priorityArray.find(p => p.name === this.taskBoardTaskVO.priority);
      if (priority && priority != null) {
        returnValue = priority.color;
      }
    }
    return returnValue;
  }

  addDependencies(dependencyType: string): void {
    const dialog = this.dialog.open(DependencyDialogComponent, {
      width: '600px',
      height: '550px',
      data: { type: dependencyType, taskId: this.taskBoardTaskVO.id, taskboard: this.data.taskboardVO, taskVO: this.taskBoardTaskVO }
    });
  }

  saveEstimatePoint(point: any): void {
    const taskVO = new TaskboardTaskVO();
    taskVO.id = this.taskBoardTaskVO.id;
    if (point === 'hours') {
      if (this.form.get('estimateHours').valid) {
        taskVO.originalPoints = this.form.get('estimateHours').value;
      } else {
        return;
      }
    } else {
      taskVO.originalPoints = point;
    }
    const value = this.taskBoardTaskVO.originalPoints;
    this.taskBoardTaskVO.originalPoints = taskVO.originalPoints;
    this.taskboardService.saveEstimatePoints(taskVO).subscribe(data => {
      if (data) {

      }
    }, error => {
      this.taskBoardTaskVO.originalPoints = value;
    });
  }

  saveEstimateHours(): void {
    if (this.form.get('estimateHours').valid) {
      const taskVO = new TaskboardTaskVO();
      taskVO.id = this.taskBoardTaskVO.id;
      taskVO.estimateHours = this.form.get('estimateHours').value;
      const value = this.taskBoardTaskVO.estimateHours;
      this.taskBoardTaskVO.estimateHours = this.form.get('estimateHours').value;
      this.taskboardService.saveEstimateHours(taskVO).subscribe(data => {

      }, error => {
        this.taskBoardTaskVO.estimateHours = value;
      });
    }
  }

  hoursMenuOpen(): void {
    if (this.taskBoardTaskVO.estimateHours && this.taskBoardTaskVO.estimateHours > 0) {
      this.form.get('estimateHours').setValue(this.taskBoardTaskVO.estimateHours);
    } else {
      this.form.get('estimateHours').setValue(1);
    }
  }

  pointMenuOpen(): void {
    if (this.data.sprintSettingsVo.sprintEstimations === 'in-hours' && this.taskBoardTaskVO.originalPoints
      && this.taskBoardTaskVO.originalPoints > 0) {
      this.form.get('estimateHours').setValue(this.taskBoardTaskVO.originalPoints);
    } else {
      this.form.get('estimateHours').setValue(1);
    }
  }

  addTaskToSprint(): void {
    const sprintTaskVO = new SprintTasksVo();
    sprintTaskVO.taskboardTaskId.push(this.taskBoardTaskVO.id);
    const dialog = this.dialog.open(SprintTasksComponent, {
      width: '550px',
      data: { taskboardVo: this.data.taskboardList.find(t => t.id === this.taskboardVO.id), sprintTaskVO }
    });
  }
}
