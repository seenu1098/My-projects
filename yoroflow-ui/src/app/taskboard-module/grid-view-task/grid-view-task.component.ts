import { AssignGroupTaskVO } from './../taskboard-form-details/taskboard-task-vo';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { debounceTime, retryWhen } from 'rxjs/operators';
import { CreateFormService } from 'src/app/rendering-module/shared/service/form-service/create-form.service';
import { LoadFormService } from 'src/app/rendering-module/shared/service/form-service/load-form.service';
import { Page, Section } from 'src/app/rendering-module/shared/vo/page-vo';
import { AssigntaskDialogComponent } from '../assigntask-dialog/assigntask-dialog.component';
import { DragconfirmComponent } from '../dragconfirm/dragconfirm.component';
import { LabelsDialogComponent } from '../labels-dialog/labels-dialog.component';
import { GroupByVO, ResolveSecurityForTaskboardVO, StatusList, SubStatusVO, TaskboardColumnMapVO, TaskboardColumns, TaskboardVO, TaskSequenceVO } from '../taskboard-configuration/taskboard.model';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';
import { AssignTaskVO, AssignUserTaskVO, GroupVO, LabelsVO, Subtask, TaskboardTaskLabelVO, TaskboardTaskVO, UserVO } from '../taskboard-form-details/taskboard-task-vo';
import { TaskboardFormDetailsComponent } from "../taskboard-form-details/taskboard-form-details.component";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Observable } from 'rxjs';
import { TaskboardConfigurationComponent } from '../taskboard-configuration/taskboard-configuration.component';
import { ThemeService } from 'src/app/services/theme.service';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskServiceService } from './task-service.service';

@Component({
  selector: 'app-grid-view-task',
  templateUrl: './grid-view-task.component.html',
  styleUrls: ['./grid-view-task.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(90deg)' })),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class GridViewTaskComponent implements OnInit {

  @Input() taskboardVO = new TaskboardVO();
  @Input() usersList: UserVO[] = [];
  @Input() taskList: TaskboardTaskVO[] = [];
  @Input() boardUsers: UserVO[] = [];
  @Input() groupList: GroupVO[] = [];
  @Input() page = new Page();
  @Input() loggenInUser = new UserVO();
  @Input() id: string;
  @Input() filterApplied: boolean;
  @Input() object: any;
  @Input() assignTaskVO: any;
  @Input() taskboardVoList: TaskboardVO[] = [];

  @ViewChild('menuTrigger') dateMenu: MatMenuTrigger;
  @ViewChild('menuTrigger1') dateMenu1: MatMenuTrigger;


  public config: PerfectScrollbarConfigInterface = {};

  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  connectedTo: string[] = [];
  hoverTaskIndex: any;
  hoverTaskIndexFromSubtask: any;
  hoverColumnIndex: any;
  hoverAssigneeIndex: any;
  hoverLabelIndex: any;
  hoverFieldIndex: any;
  hoverSubTaskAssigneeIndex: any;
  hoverSubTaskLabelIndex: any;
  hoverSubTaskIndex: any;
  hoverStartDateIndex: any;
  hoverDueDateIndex: any;
  formFields: any[] = [];
  columnWidth: any;
  columnLeftWidth: any;
  asssigneeColumnWidth: any;
  screenWidth: any;
  selectedColumnIndex: number;
  selectedTaskIndex: number;
  taskBoardTaskVO = new TaskboardTaskVO();
  form: FormGroup;
  formLists: any;
  taskSequenceVo = new TaskSequenceVO();
  checkDone = false;
  selectedTaskSubStatus: any;
  taskboardColumns: any[];
  subStatusScrollHeight: any;
  subTaskColumnWidth: string;
  scrollHeight: any;
  currentDate = new Date();

  subtaskStatusList = [{ statusColor: '#87cefa', name: 'Todo' },
  { statusColor: 'rgb(255, 209, 93)', name: 'Progress' },
  { statusColor: '#20b2aa', name: 'Done' }];
  fieldWidth: string;
  spinner: any;
  dateType: any;
  doneColumnName: string;
  taskboardDetailsVO = new TaskboardVO();
  pendingTaskboardDetails = new TaskboardVO();
  doneTaskList: TaskboardTaskVO[] = [];
  manualLength = true;
  isLoad = false;
  load = false;
  taskboardConfigurationComponent: TaskboardConfigurationComponent;
  filterAppliedAfterSwitch = false;
  enableTaskView = false;
  isScroll = true;
  sum = 1;
  isSprintTask: boolean;

  groupByName = 'Status';
  groupByList: any[] = [
    { name: 'Status', value: 'status', icon: 'unfold_more' },
    { name: 'Assignee', value: 'assignee', icon: 'group' },
    { name: 'Priority', value: 'priority', icon: 'flag' }
  ];

  groupByVO = new GroupByVO();

  constructor(private dialog: MatDialog, private taskboardService: TaskBoardService, private formService: CreateFormService,
    public loadFormService: LoadFormService, private sanitizer: DomSanitizer, public themeService: ThemeService, private snackbar: MatSnackBar,
    public taskService: TaskServiceService) {
  }

  @HostListener('scroll', ['$event'])
  onScrollEvent(event: any): void {
    if (event.target.offsetHeight + event.target.scrollTop + 5 >= event.target.scrollHeight) {
      // if (this.pendingTaskboardDetails.taskboardColumnMapVO.length > 0 && this.filterApplied !== true
      //   && !this.checkFilterAppiledAfterSwitch() && this.isScroll === true) {
      //   this.sum += 1;
      //   if (this.isSprintTask === true) {
      //     this.loadPendingSprintTasks();
      //   } else {
      //     // this.loadPendingTasks();
      if (this.taskService.allTasksLoad === false) {
        this.taskService.loadTasks(this.taskboardVO, this.taskService.columnName, this.taskService.taskIndex + 1,
          this.taskboardConfigurationComponent.groupByName, this.taskService.columnIndex, this.taskboardConfigurationComponent.assignTaskVO);
        // }
        this.setAssigntaskVO();
        this.loadSubTasks();
        this.setMaxAndMindate();
      }
      // }
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.loadDynamicLayout();
  }

  ngOnInit(): void {
    this.taskService.allTasksLoad = false;
    this.taskboardConfigurationComponent = this.object;
    // if (this.filterApplied !== true) {
      this.gridViewInit();
    // } else {
    //   this.setData();
    //   this.setConnectedTo();
    //   this.loadDynamicLayout();
    //   this.themeService.layoutEmitter.subscribe(data => {
    //     this.loadDynamicLayout();
    //   });
    // }
    if (this.taskboardConfigurationComponent) {
      this.taskboardConfigurationComponent.filterAppliedAfterSwitch.subscribe(filter => {
        // if (filter !== undefined && filter === false) {
        //   this.gridViewInit();
        // }
        if (filter) {
          this.enableTaskView = filter;
          // this.setConnectedTo();
        }
        this.gridViewInit();
      });
      this.taskboardConfigurationComponent.sprintTasks.subscribe(sprintTasks => {
        if (sprintTasks) {
          this.taskboardVO = sprintTasks;
          this.setData();
          this.isLoad = true;
          this.isSprintTask = true;
        }
      });
      this.taskboardConfigurationComponent.groupByEmitter.subscribe(groupBy => {
        if (groupBy) {
          this.gridViewInit();
        }
      });
    }
  }

  checkFilterAppiledAfterSwitch() {
    let filterAppliedAfterSwitch = false;
    if (this.taskboardConfigurationComponent) {
      this.taskboardConfigurationComponent.filterAppliedAfterSwitch.subscribe(filter => {
        if (filter) {
          filterAppliedAfterSwitch = filter;
        }
      });
    }
    return filterAppliedAfterSwitch;
  }

  gridViewInit(): void {
    this.taskService.loadColumns(this.taskboardConfigurationComponent.groupByName, this.taskboardVO);
    this.taskService.allTasksLoad = false;
    this.isScroll = true;
    this.spinnerDialog();
    this.isLoad = false;
    this.taskService.loadTasks(this.taskboardVO, this.taskboardVO.taskboardColumns[0].columnName, 0,
      this.taskboardConfigurationComponent.groupByName, 0, this.taskboardConfigurationComponent.assignTaskVO);
    // this.taskboardService.getTaskboardDetailsByType(this.id, 0).subscribe((data) => {
    this.taskboardVO.taskboardColumnMapVO = [];
    // this.taskboardDetailsVO = data;
    this.taskboardDetailsVO = this.taskboardVO;
    // this.loadTaskboard(0, 'initial');
    this.spinner.close();
    this.load = true;
    this.form = this.formService.createForm(this.page.sections);
    this.columnWidth = '307px';
    this.asssigneeColumnWidth = '140px';
    this.columnLeftWidth = '331px';
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    this.setAssigntaskVO();
    this.setConnectedTo();
    this.loadPageFields(this.page.sections);
    this.loadSubTasks();
    this.setMaxAndMindate();
    // if (this.filterApplied !== true) {
    //   this.doneColumnName = this.taskboardDetailsVO.taskboardColumnMapVO[this.taskboardDetailsVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.columnName;
    //   this.taskboardService.getDoneTaskoardTask(this.taskboardDetailsVO.id).subscribe(result => {
    //     if (this.taskboardVO.taskboardColumnMapVO?.some(c => c.taskboardColumnsVO.columnName === this.doneColumnName)) {
    //       this.loadDoneTasks(result);
    //     }
    //     this.doneTaskList = result;
    //   });
    //   this.taskboardService.getTaskboardDetailsByType(this.taskboardDetailsVO.id, 1).subscribe(taskboard => {
    //     this.pendingTaskboardDetails = taskboard;
    //     // this.loadTasks(columnMapVO);
    this.isLoad = true;
    //     this.setBoardData();
    //     this.loadTaskVO();
    //   });
    // }
    // });
  }

  setData() {
    this.taskboardDetailsVO = this.taskboardVO;
    this.load = true;
    this.isLoad = true;
    this.form = this.formService.createForm(this.page.sections);
    this.screenWidth = window.innerWidth + 'px';
    this.columnWidth = '307px';
    this.fieldWidth = Math.round((window.innerWidth / 100) * 10) + "px";
    this.asssigneeColumnWidth = '140px';
    this.columnLeftWidth = '331px';
    this.subTaskColumnWidth = Math.round(((window.innerWidth / 100) * 20) - 20) + "px";
    this.scrollHeight = Math.round((window.innerHeight - 192));
    this.setAssigntaskVO();
    this.setConnectedTo();
    this.loadPageFields(this.page.sections);
    this.loadSubTasks();
    this.setMaxAndMindate();
  }

  loadDynamicLayout(): void {
    this.screenWidth = window.innerWidth + 'px';
    this.fieldWidth = Math.round((window.innerWidth / 100) * 10) + "px";
    // this.subStatusScrollHeight = (window.innerHeight - 250) + "px";
    this.subStatusScrollHeight = (window.innerHeight) + "px";
    this.subTaskColumnWidth = Math.round(((window.innerWidth / 100) * 20) - 20) + "px";
    if (this.themeService.layoutName === 'modern') {
      this.scrollHeight = Math.round((window.innerHeight - 110));
    } else {
      this.scrollHeight = Math.round(window.innerHeight - 155);
    }
  }

  loadTaskVO(): void {
    this.taskList = [];
    this.taskboardDetailsVO.taskboardColumnMapVO.forEach(columnMap => {
      this.taskList.push(...columnMap.taskboardTaskVOList);
    });
  }

  setBoardData(): void {
    this.taskboardDetailsVO.taskboardColumnMapVO.forEach(columnMap => {
      const columnMapVO = this.pendingTaskboardDetails.taskboardColumnMapVO.find(map => map.taskboardColumnsVO.columnName === columnMap.taskboardColumnsVO.columnName);
      if (columnMapVO?.taskboardTaskVOList) {
        columnMap.taskboardTaskVOList.push(...columnMapVO.taskboardTaskVOList);
      }
      if (columnMapVO.taskboardColumnsVO.columnName === this.doneColumnName) {
        columnMap.taskboardTaskVOList = this.doneTaskList;
      }
    });
    this.loadTaskboard(0, 'secondary');
  }

  loadTaskboard(i: number, type: string): void {
    if (type === 'initial') {
      for (let j = 0; j < this.taskboardDetailsVO.taskboardColumnMapVO.length; j++) {
        const columnMap = new TaskboardColumnMapVO();
        columnMap.taskLength = 0;
        columnMap.taskboardColumnsVO = this.taskboardDetailsVO.taskboardColumnMapVO[j].taskboardColumnsVO;
        this.taskboardVO.taskboardColumnMapVO.push(columnMap);
      }
    }
    const columnMap = new TaskboardColumnMapVO();
    let filterTasks: any;
    if (i === this.taskboardDetailsVO.taskboardColumnMapVO.length - 1) {
      filterTasks = this.doneTaskList;
    } else {
      filterTasks = this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList
    }
    if (filterTasks.length > 15) {
      let length = filterTasks.length;
      for (let j = 0; j < length; j++) {
        if (filterTasks[j].taskType === 'parentTask') {
          columnMap.taskboardTaskVOList.push(filterTasks[j]);
        }
        if (columnMap.taskboardTaskVOList.length === 15) {
          length = 0;
        }
      }
    } else if (filterTasks.length <= 15) {
      columnMap.taskboardTaskVOList = filterTasks;
    }
    if (columnMap.taskboardTaskVOList.length <= 10) {
      this.loadColumnSubtasks(this.taskboardDetailsVO.taskboardColumnMapVO[i], i);
      i++;
      if (this.taskboardVO.taskboardColumnMapVO.length > i && type !== 'initial') {
        this.loadTaskboard(i, 'secondary');
      }
    } else {
      this.loadColumnSubtasks(this.taskboardDetailsVO.taskboardColumnMapVO[i], i);
    }
  }

  loadColumnSubtasks(columnMap: TaskboardColumnMapVO, i: number): void {
    columnMap.taskboardTaskVOList.forEach(task => {
      task.subTaskVO = columnMap.taskboardTaskVOList?.filter(subtask => task.subTasks?.find(subTaskVO => subTaskVO.id === subtask.id));
    });
    this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList = columnMap.taskboardTaskVOList;
    this.taskboardVO.taskboardColumnMapVO[i].taskLength = 1;
    this.setAssigntaskVO();
    this.setMaxAndMindate();
  }

  loadSubTasks(): void {
    this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
      columnMap.taskboardTaskVOList.forEach(task => {
        task.subTaskVO = columnMap.taskboardTaskVOList?.filter(subtask => task.subTasks?.find(subTaskVO => subTaskVO.id === subtask.id));
      });
    });
  }

  loadDoneTasks(taskList: TaskboardTaskVO[]): void {
    const columnMap = this.taskboardVO.taskboardColumnMapVO.find(columnMap => columnMap.taskboardColumnsVO.columnName === this.doneColumnName);
    taskList.forEach(task => {
      this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList.push(task);
    });
    this.setAssigntaskVO();
    this.loadSubTasks();
    this.setMaxAndMindate();
  }

  loadTasks(startIndex, endIndex): void {
    // this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
    //   columnMapVOList.forEach(secColumnMap => {
    //     if (columnMap.taskboardColumnsVO.columnName === secColumnMap.taskboardColumnsVO.columnName) {
    //       secColumnMap.taskboardTaskVOList.forEach(task => {
    //         columnMap.taskboardTaskVOList.push(task);
    //       });
    //     }
    //   })
    // });
    const length = this.taskboardVO.taskboardColumnMapVO.length - 1;
    // this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
    //   columnMapVOList.forEach(secColumnMap => {
    //     if (columnMap.taskboardColumnsVO.columnName === secColumnMap.taskboardColumnsVO.columnName) {
    //       // secColumnMap.taskboardTaskVOList.forEach(task => {
    //       //   columnMap.taskboardTaskVOList.push(task);
    //       // });
    //       columnMap.taskboardTaskVOList.push(...secColumnMap.taskboardTaskVOList);
    //     }
    //   })
    // });
    // for (let i = 0; i < length; i++) {
    if (startIndex === 0) {
      for (let j = 15; j < 25; j++) {
        if (this.doneTaskList[j]) {
          this.taskboardVO.taskboardColumnMapVO[length].taskboardTaskVOList.push(this.doneTaskList[j]);
        }
      }
    }

    let lengths: number[] = [];
    for (let i = length; i > 0; i--) {
      const length = this.pendingTaskboardDetails.taskboardColumnMapVO[i - 1].taskboardTaskVOList.length;
      lengths.push(length);
    }
    lengths.push(this.doneTaskList.length);
    const max = lengths.reduce((a, b) => Math.max(a, b));
    if (max <= endIndex) {
      this.manualLength = false;
    }

    for (let i = length; i > 0; i--) {
      const columnMap = this.taskboardVO.taskboardColumnMapVO[i - 1];
      const taskList = this.pendingTaskboardDetails.taskboardColumnMapVO[i - 1].taskboardTaskVOList;
      for (let j = startIndex; j < endIndex; j++) {
        if (this.pendingTaskboardDetails.taskboardColumnMapVO[i - 1].taskboardTaskVOList[j]) {
          columnMap.taskboardTaskVOList.push(this.pendingTaskboardDetails.taskboardColumnMapVO[i - 1].taskboardTaskVOList[j])
        }
      }
      // columnMap.taskboardTaskVOList.push(...columnMapVOList[i - 1].taskboardTaskVOList)
    }
    this.setAssigntaskVO();
    this.loadSubTasks();
    this.setMaxAndMindate();
  }

  openSubTask(task: TaskboardTaskVO, columnMap: TaskboardColumnMapVO): void {
    if (!task.isSubtask) {
      task.isSubtask = true;
    } else {
      task.isSubtask = false;
    }
  }

  openSubStasks(columnMap: TaskboardColumnMapVO): void {
    if (columnMap.isSubtask === false) {
      columnMap.taskboardTaskVOList.forEach(task => {
        task.isSubtask = true;
      });
      columnMap.isSubtask = true;
    } else {
      columnMap.taskboardTaskVOList.forEach(task => {
        task.isSubtask = false;
      });
      columnMap.isSubtask = false;
    }
  }

  loadPageFields(sections: Section[]): void {
    sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.field.name) {
            this.formFields.push({ label: column.field.label.labelName, name: column.field.name, type: column.controlType, isEdit: false });
          }
        });
      });
      if (section.sections) {
        this.loadNestedSectionName(section.sections);
      }
    });
  }

  loadNestedSectionName(sections: Section[]): void {
    sections.forEach(section => {
      if (section.name) {
        this.formFields.push({ label: section.name, name: section.name, type: 'nestedSection' });
      } else if (section.repeatableName) {
        this.formFields.push({ label: section.repeatableName, name: section.repeatableName, type: 'nestedSection' });
      }
    });
  }

  setMaxAndMindate(): void {
    this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
      columnMap.taskboardTaskVOList.forEach(task => {
        task.minDueDate = this.setMinDueDate(task);
        task.maxStartDate = this.setMaxStartDate(task);
      })
    })
  }

  loadImage(field: any, task: TaskboardTaskVO): SafeResourceUrl {
    let image: string;
    if (field.type === 'image') {
      this.page.sections.forEach(section => {
        section.rows.forEach(row => {
          row.columns.forEach(column => {
            if (column.field.name === field.name && column.controlType === 'image') {
              image = column.field.control.image;
            }
          });
        });
      });
    } else if (field.type === 'signaturecontrol') {
      const signature = task.taskData[field.name];
      if (signature && signature.includes('data:image')) {
        image = task.taskData[field.name];
      }
    }
    if (image === undefined || image === null) {
      image = '';
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(image);
  }


  setConnectedTo(): void {
    this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
      this.connectedTo.push(columnMap.taskboardColumnsVO.columnName);
    });
  }

  setAssigntaskVO(): void {
    this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
      columnMap.taskboardTaskVOList.forEach(task => {
        if (task.assignTaskVO === undefined || task.assignTaskVO === null) {
          const assignTaskVO = new AssignTaskVO();
          task.assignTaskVO = assignTaskVO;
        }
      });
    });
  }

  getBoderColor(columnColor: string): string {
    return '5px solid ' + columnColor;
  }

  getUserName(user) {
    const index = this.usersList.findIndex(
      (users) => users.userId === user.assigneeUser
    );
    if (this.usersList[index]?.firstName && this.usersList[index]?.lastName) {
      return (
        "Assigned To " +
        this.usersList[index].firstName +
        " " +
        this.usersList[index].lastName
      );
    } else {
      return '';
    }
  }

  getUserFirstAndLastNamePrefix(user) {
    const index = this.usersList.findIndex(
      (users) => users.userId === user.assigneeUser
    );
    const firstName = this.usersList[index].firstName.charAt(0).toUpperCase();
    const lastName = this.usersList[index].lastName.charAt(0).toUpperCase();
    return firstName + lastName;
  }

  getRemainingAssigneeUserCount(assigneeUsers: AssignUserTaskVO[]) {
    // let array = [];
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
    let array = [];
    for (let i = 0; i < assigneeUsers.length; i++) {
      const index = this.usersList.findIndex(
        (users) => users.userId === assigneeUsers[i].assigneeUser
      );
      array.push(this.usersList[index]);
    }
    return array;
  }

  getUserNames(assigneeUsers: AssignUserTaskVO[]) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < assigneeUsers.length; i++) {
      if (i > 4) {
        const index = this.usersList.findIndex(
          (users) => users.userId === assigneeUsers[i].assigneeUser
        );
        if (userNames === null) {
          userNames =
            "Assigned To " +
            this.usersList[index].firstName +
            " " +
            this.usersList[index].lastName +
            ", ";
        } else {
          userNames =
            userNames +
            this.usersList[index].firstName +
            " " +
            this.usersList[index].lastName +
            ", ";
        }
      }
    }
    return userNames;
  }

  mouseEnter(taskIndex: number, columnIndex: number): void {
    this.hoverTaskIndex = taskIndex;
    this.hoverColumnIndex = columnIndex;
  }

  mouseLeave(): void {
    this.hoverTaskIndex = '';
    this.hoverColumnIndex = '';
  }

  mouseDown(taskIndex: number, columnIndex: number, task: TaskboardTaskVO, column: TaskboardColumns): void {
    this.selectedColumnIndex = columnIndex;
    this.selectedTaskIndex = taskIndex;
    this.taskBoardTaskVO = task;
    this.taskSequenceVo.columnName = column.columnName;
  }

  asssigneeMouseEnter(taskIndex: number): void {
    this.hoverAssigneeIndex = taskIndex;
  }

  subtaskAssigneeMouseEnter(taskIndex: number, subTaskIndex: number): void {
    this.hoverAssigneeIndex = taskIndex;
    this.hoverSubTaskAssigneeIndex = subTaskIndex;
  }

  asigneeMouseLeave(): void {
    this.hoverAssigneeIndex = '';
    this.hoverAssigneeIndex = '';
  }

  labelMouseEnter(taskIndex: number): void {
    this.hoverLabelIndex = taskIndex;
  }

  subtaskLabelMouseEnter(taskIndex: number, subTaskIndex: number): void {
    this.hoverLabelIndex = taskIndex;
    this.hoverSubTaskLabelIndex = subTaskIndex;
  }

  labelMouseLeave(): void {
    this.hoverLabelIndex = '';
    this.hoverSubTaskLabelIndex = '';
  }

  fieldMouseEnter(fieldIndex: number): void {
    this.hoverFieldIndex = fieldIndex;
  }

  fieldMouseLeave(): void {
    this.hoverFieldIndex = '';
  }

  mouseDownSubStatus(taskIndex: number, columnIndex: number, task: TaskboardTaskVO, column: TaskboardColumns, subStatus: SubStatusVO): void {
    this.selectedColumnIndex = columnIndex;
    this.selectedTaskIndex = taskIndex;
    this.taskBoardTaskVO = task;
    this.taskSequenceVo.columnName = column.columnName;
    this.selectedTaskSubStatus = subStatus;
  }

  mouseDownSubtask(taskIndex: number, columnIndex: number, task: TaskboardTaskVO, column: TaskboardColumns, subtask: TaskboardTaskVO, subTaskIndex: number): void {
    this.selectedColumnIndex = columnIndex;
    this.selectedTaskIndex = taskIndex;
    this.taskBoardTaskVO = task;
    this.taskSequenceVo.columnName = column.columnName;
  }

  mouseEnterSubtask(taskIndex: number, columnIndex: number, subTaskIndex: number): void {
    this.hoverTaskIndexFromSubtask = taskIndex;
    this.hoverColumnIndex = columnIndex;
    this.hoverSubTaskIndex = subTaskIndex;
  }

  mouseLeaveSubtask(): void {
    this.hoverTaskIndex = '';
    this.hoverColumnIndex = '';
    this.hoverSubTaskIndex = '';
    this.hoverTaskIndexFromSubtask = '';
  }

  startDateMouseEnter(taskIndex: number): void {
    this.hoverStartDateIndex = taskIndex;
  }

  startDateMouseLeave(): void {
    this.hoverStartDateIndex = '';
  }


  dueDateMouseEnter(taskIndex: number): void {
    this.hoverDueDateIndex = taskIndex;
  }

  dueDateMouseLeave(): void {
    this.hoverDueDateIndex = '';
  }

  getFieldValue(field: any, task: TaskboardTaskVO): string {
    let returnValue = task.taskData[field.name];
    if (field.type === 'tel') {
      returnValue = returnValue?.number;
    }
    if (returnValue === undefined || returnValue === null) {
      returnValue = '';
    }
    return returnValue;
  }

  getSubStatusColor(subStatusName: string, column: TaskboardColumns): string {
    let subStaus = column.subStatus.find(subStatus => subStatus.name === subStatusName);
    return subStaus?.color;
  }

  getSubtaskColor(status: string): string {
    let subTask = this.subtaskStatusList.find(subtask => subtask.name === status);
    return subTask.statusColor;
  }

  getSubtaskBoderColor(status: string): string {
    let subTask = this.subtaskStatusList.find(subtask => subtask.name === status);
    return '5px solid ' + subTask.statusColor;
  }

  getSubtasks(task: TaskboardTaskVO): boolean {
    let returnValue = false;
    if (task.subTasks && task.subTasks.length > 0) {
      returnValue = true;
    }
    return returnValue;
  }

  getSubTaskList(taskVO: TaskboardTaskVO, taskList: TaskboardTaskVO[]): TaskboardTaskVO[] {
    let taskVOList: TaskboardTaskVO[] = [];
    taskVO.subTasks.forEach(subTask => {
      taskList.forEach(task => {
        if (task.id === subTask.id) {
          taskVOList.push(task);
        }
      });
    });
    return taskVOList;
  }

  checkSubStatusTask(taskList: TaskboardTaskVO[], subStatusName: string): boolean {
    let returnValue = false;
    let subStatus = taskList.filter(task => task?.subStatus === subStatusName);
    if (subStatus !== undefined && subStatus !== null && subStatus.length !== 0) {
      returnValue = true;
    }
    return returnValue;
  }

  isSubTask(taskList: TaskboardTaskVO[], subtaskStatus): boolean {
    return taskList.some(task => task.status === subtaskStatus);
  }

  changeSubStatus(subStatus: SubStatusVO, task: TaskboardTaskVO): void {
    const taskVO = task;
    taskVO.subStatus = subStatus.name;
    this.taskboardService.setTaskBoardStatus(taskVO).subscribe(data => {
      if (data.response.includes('Successfully')) {
        task = taskVO;
      }
    });
  }

  dropped(event: CdkDragDrop<string[]>, currentColumnIndex: number, taskboardColumnMapVO: any): void {
    if (this.taskboardConfigurationComponent.groupByName === 'Status') {
      if (event) {
        const previousIndex = this.selectedColumnIndex;
        if (previousIndex !== currentColumnIndex) {
          let task = this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex];
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
                // const filteredTasks = task.taskDependenciesVO.waitingOn.filter(taskVo => taskVo.status !== doneColumn.columnName
                //   || (taskVo.taskType === 'subtask' && taskVo.status !== 'Done'));
                if (doneColumn.columnName === taskboardColumnMapVO.taskboardColumnsVO.columnName
                  && task.taskDependenciesVO?.waitingOn && task.taskDependenciesVO.waitingOn.length > 0
                  && task.taskDependenciesVO.waitingOn.length > 0) {
                  this.checkDone = true;
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
                } else if (doneColumn.columnName === taskboardColumnMapVO.taskboardColumnsVO.columnName &&
                  task.subTasks !== null && task.subTasks.length > 0) {
                  // if (doneColumn.columnName === taskboardColumnMapVO.taskboardColumnsVO.columnName && 
                  // subTask !== undefined && subTask !== null && subTask.length !== 0 && subTask.some(ele => ele.status !== 'Done')) {
                  const subtasks = task.subTasks;
                  this.checkDone = true;

                  const dialog = this.dialog.open(DragconfirmComponent, {
                    disableClose: true,
                    width: '400px',
                    data: {
                      type: 'subtask', pendingSubTaskCount: subtasks.length,
                      taskId: this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].
                        taskboardTaskVOList[this.selectedTaskIndex].taskId
                    },
                  });
                  dialog.afterClosed().subscribe(data => {
                    return;
                  }

                  )
                } else {
                  this.checkDone = false;
                  this.taskboardVO.taskboardColumnMapVO[previousIndex].taskboardTaskVOList[this.selectedTaskIndex].status = this.taskboardVO.taskboardColumnMapVO[currentColumnIndex].taskboardColumnsVO.columnName;
                  this.taskboardVO.taskboardColumnMapVO[currentColumnIndex].taskboardTaskVOList.push(
                    this.taskboardVO.taskboardColumnMapVO[previousIndex].taskboardTaskVOList[this.selectedTaskIndex]);
                  this.taskboardVO.taskboardColumnMapVO[previousIndex].taskboardTaskVOList.splice(this.selectedTaskIndex, 1);
                }
                if (this.checkDone === false) {
                  if (this.taskboardVO.taskboardColumnMapVO[currentColumnIndex].taskboardColumnsVO.subStatus && this.taskboardVO.taskboardColumnMapVO[currentColumnIndex].taskboardColumnsVO.subStatus.length > 0) {
                    let subStatus = this.taskboardVO.taskboardColumnMapVO[currentColumnIndex].taskboardColumnsVO.subStatus;
                    const filterSubStatus = subStatus.find(subStatus => subStatus.columnOrder === currentColumnIndex);
                    task.subStatus = filterSubStatus.name;
                  } else {
                    task.subStatus = null;
                  }
                  task.status = this.taskboardVO.taskboardColumnMapVO[currentColumnIndex].taskboardColumnsVO.columnName;
                  this.taskboardService.setTaskBoardStatus(task).subscribe(data => {
                    if (data.response.includes('Successfully')) {
                      this.loadTaskBySequence(currentColumnIndex);
                      this.loadTaskBySequence(this.selectedColumnIndex);
                    }
                  });
                }
              }
            },
              error => {
                this.spinner.close();
              });
          }
        } else if (event.currentIndex !== event.previousIndex) {
          const previousIndex = this.taskboardVO.taskboardColumnMapVO[currentColumnIndex].taskboardTaskVOList.findIndex(task => task.taskId === this.taskBoardTaskVO.taskId);
          const currentIndex = event.currentIndex;
          if (currentIndex !== previousIndex) {
            const columnMap = this.taskboardVO.taskboardColumnMapVO[currentColumnIndex];
            const taskList = columnMap.taskboardTaskVOList;
            let tasks = JSON.parse(JSON.stringify(taskList));
            let currentIndexColumn = taskList[previousIndex];
            if (previousIndex > currentIndex) {
              for (let i = 0; i < previousIndex + 1; i++) {
                if (i > currentIndex) {
                  taskList[i] = tasks[i - 1];
                } else if (i === currentIndex) {
                  taskList[i] = currentIndexColumn;
                }
              }
            } else {
              for (let i = currentIndex; i >= previousIndex; i--) {
                if (i < currentIndex) {
                  taskList[i] = tasks[i + 1];
                } else if (i === currentIndex) {
                  taskList[i] = currentIndexColumn;
                }
              }
            }
            this.loadTaskBySequence(currentColumnIndex);
          }
        }
      }
    } else {
      if (this.selectedColumnIndex !== currentColumnIndex) {
        const task = this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex];
        this.spinnerDialog();
        this.taskboardService.getTaskboardTask(task.id, null).subscribe(data => {
          if (this.taskboardConfigurationComponent.groupByName === 'Assignee') {
            const taskVO = new TaskboardTaskVO();
            taskVO.id = task.id;
            const assignTaskVO = new AssignTaskVO();
            if (data.assignTaskVO && data.assignTaskVO?.assigneeUserTaskList?.length > 0) {
              data.assignTaskVO?.assigneeUserTaskList.forEach(a => {
                assignTaskVO.removedAssigneeList.push(a.id);
              });
            }
            if (taskboardColumnMapVO?.taskboardColumnsVO.columnName !== 'Unassigned') {
              taskboardColumnMapVO?.taskboardColumnsVO?.userFieldList.forEach(u => {
                assignTaskVO.assigneeUserTaskList.push({ id: null, assigneeUser: u.id });
              });
            }
            taskVO.assignTaskVO = assignTaskVO;
            this.taskboardService.saveAssigneeUser(taskVO).subscribe(data => {
              const groupBy = this.groupByList.find(g => g.name === this.taskboardConfigurationComponent.groupByName);
              this.setGroupBy(groupBy, 0);
            }, err => {
              this.spinner.close();
            });
          } else if (this.taskboardConfigurationComponent.groupByName === 'Priority') {
            const taskVO = new TaskboardTaskVO();
            taskVO.id = task.id;
            taskVO.priority = taskboardColumnMapVO?.taskboardColumnsVO.columnName === 'No Priority' ? '' : taskboardColumnMapVO?.taskboardColumnsVO.columnName;
            this.taskboardService.savePriority(taskVO).subscribe(data => {
              const groupBy = this.groupByList.find(g => g.name === this.taskboardConfigurationComponent.groupByName);
              this.setGroupBy(groupBy, 0);
            }, err => {
              this.spinner.close();
            });
          }
        }, error => {
          this.spinner.close();
        });
      } else if (event.currentIndex !== event.previousIndex) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: 'You can swap the task while applying group by status filter only'
        });
      }
    }
  }

  assignSubtask(task: TaskboardTaskVO, i: number, column: TaskboardColumns): void {
    let index = this.taskList.findIndex(element => element.id === this.taskBoardTaskVO.id);
    if (this.taskBoardTaskVO.id && this.doneColumnName !== column.columnName) {
      if (task.status !== 'Done') {
        const dialog = this.dialog.open(AssigntaskDialogComponent, {
          disableClose: true,
          width: '50%',
          height: '75%',
          data: {
            type: 'subtask', i: i,
            taskboardId: this.taskBoardTaskVO.taskboardId, taskList: this.taskList, taskIndex: index,
            taskVO: this.taskBoardTaskVO, groupList: this.groupList,
            usersList: this.boardUsers, taskboardSecurityVO: this.taskboardVO.taskboardSecurity, taskboardColumnId: column.id
          }
        });
        dialog.afterClosed().subscribe(data => {
          if (data && this.taskBoardTaskVO.id) {
            const taskVO = new TaskboardTaskVO();
            taskVO.id = this.taskBoardTaskVO.subTasks[i].id;
            taskVO.assignTaskVO = this.taskBoardTaskVO.subTasks[i].assignTaskVO;
            this.taskboardService.saveAssigneeUser(taskVO).subscribe(data => {
              if (data && !taskVO.assignTaskVO.assigneeUserTaskList.some(user => user.assigneeUser === this.loggenInUser.userId)) {
                this.taskboardService.getTaskboardTask(this.taskBoardTaskVO.id, null).subscribe(data => {
                  this.taskBoardTaskVO = data;
                  task = data;
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

  openAssignTaskDialog(column: TaskboardColumns): void {
    let index = this.taskList.findIndex(element => element.id === this.taskBoardTaskVO.id);
    if (this.taskBoardTaskVO.id && this.doneColumnName !== column.columnName) {
      const dialog = this.dialog.open(AssigntaskDialogComponent, {
        disableClose: true,
        width: '50%',
        height: '75%',
        data: {
          type: 'parentTask',
          taskboardId: this.taskBoardTaskVO.taskboardId, taskList: this.taskList, taskIndex: index,
          taskVO: this.taskBoardTaskVO, groupList: this.groupList,
          usersList: this.boardUsers, taskboardSecurityVO: this.taskboardVO.taskboardSecurity, taskboardColumnId: column.id
        }
      });
      dialog.afterClosed().subscribe(data => {
        if (data && this.taskBoardTaskVO.id) {
          const taskVO = new TaskboardTaskVO();
          taskVO.id = this.taskBoardTaskVO.id;
          taskVO.assignTaskVO = this.taskBoardTaskVO.assignTaskVO;
          this.taskboardService.saveAssigneeUser(taskVO).subscribe(data => {
            this.boardUsers.forEach(param => param.isSelected = false);
            if (this.taskboardConfigurationComponent.groupByName === 'Status') {
              if (data.object.length > 0 && this.taskBoardTaskVO.assignTaskVO.assigneeUserTaskList.length > 0) {
                for (let i = 0; i < data.object.length; i++) {
                  for (let j = 0; j < this.taskBoardTaskVO.assignTaskVO.assigneeUserTaskList.length; j++) {
                    if (this.taskBoardTaskVO.assignTaskVO.assigneeUserTaskList[j].assigneeUser === data.object[i].assigneeUser) {
                      this.taskBoardTaskVO.assignTaskVO.assigneeUserTaskList[j].id = data.object[i].id;
                    }
                  }
                }
              }
            } else {
              const groupBy = this.groupByList.find(g => g.name === this.taskboardConfigurationComponent.groupByName);
              this.setGroupBy(groupBy, 0);
            }
          });
        }
      });
    }
  }

  getUserColor(user) {
    const userVO = this.usersList.find(
      (users) => users.userId === user.assigneeUser
    );
    return userVO.color;
  }

  removeLabel(labels: any, column: TaskboardColumns): void {
    if (this.taskboardVO.isTaskBoardOwner === true || (column.taskboardColumnSecurity && column.taskboardColumnSecurity.update === true)) {
      this.taskBoardTaskVO.labels.forEach((element, index) => {
        if (element == labels) this.taskBoardTaskVO.labels.splice(index, 1);
      });
      this.taskboardService.removeLabel(labels.taskboardTaskLabelId).subscribe();
    }
  }

  openLabelDialog(column: TaskboardColumns, task: TaskboardTaskVO): void {
    this.taskBoardTaskVO = task;
    let index = this.taskList.findIndex(element => element.id === this.taskBoardTaskVO.id);
    if (this.taskBoardTaskVO.id && (this.taskboardVO.isTaskBoardOwner === true || (column.taskboardColumnSecurity && column.taskboardColumnSecurity.read === true))) {
      const dialog = this.dialog.open(LabelsDialogComponent, {
        disableClose: true,
        width: '450px',
        maxHeight: '600px',
        data: {
          labels: this.taskBoardTaskVO.labels, taskboardLabels: this.taskboardVO.taskboardLabels,
          taskboardId: this.taskBoardTaskVO.taskboardId, taskList: this.taskList, taskIndex: index,
          eventAutomation: false
        }
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          let removedIdList: string[] = [];
          let selectedLabels: LabelsVO[] = [];
          let taskboardlabelIdList: string[] = [];
          let taskboardLabels: any;
          if (this.taskboardVO.taskboardLabels === undefined || this.taskboardVO.taskboardLabels === null) {
            taskboardLabels = {
              id: this.taskboardVO.id,
              labels: data.taskboardLabels
            }
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
            this.taskBoardTaskVO.labels
          }
          this.taskboardVO.taskboardLabels.labels = data.taskboardLabels;
          this.taskboardVO.taskboardLabels.taskboardId = this.taskBoardTaskVO.taskboardId;
          this.taskBoardTaskVO.labels = data.labelVO;
          this.taskList[index] = this.taskBoardTaskVO;
          // this.response = false;
          // this.dataType = 'false';
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
              for (let i = 0; i < this.taskboardVO.taskboardLabels.labels.length; i++) {
                if (taskLabels.labels.some(label => label.taskboardLabelId === this.taskboardVO.taskboardLabels.labels[i].taskboardLabelId)) {
                  const label = taskLabels.labels.find(label => label.taskboardLabelId === this.taskboardVO.taskboardLabels.labels[i].taskboardLabelId);
                  this.taskboardVO.taskboardLabels.labels[i].taskboardTaskLabelId = label.taskboardTaskLabelId;
                }
              }
            });
          }
        }
      })
    }
  }

  save(task: TaskboardTaskVO, field: any, value: any): void {
    const fieldValue = task.taskData[field.name];
    field.isEdit = false;
    if (value !== undefined && value !== null && fieldValue !== value) {
      task.taskData[field.name] = value;
      const taskVO = new TaskboardTaskVO();
      taskVO.id = task.id;
      taskVO.status = task.status;
      taskVO.taskData = task.taskData;
      taskVO.taskId = task.taskId;
      taskVO.taskName = task.taskName;
      taskVO.taskType = task.taskType;
      taskVO.taskboardId = task.taskboardId;
      this.taskboardService.saveTaskboardTask(taskVO).subscribe(data => {

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
      const taskSequenceNumber = { sequenceNumber: i, taskName: taskList.taskboardTaskVOList[i].taskName, taskId: taskList.taskboardTaskVOList[i].id }
      this.taskSequenceVo.taskSequenceNumber.push(taskSequenceNumber);
    }
    this.taskSequenceVo.taskboardId = this.taskboardVO.id;
    this.taskboardService.updateSequenceNumber(this.taskSequenceVo).subscribe(data => {
      // this.loadSubStatusContainer();
    });
  }

  addTask(column: TaskboardColumns, columnMap: TaskboardColumnMapVO, i: number): void {
    this.taskboardService.resolvetaskboardFields(this.taskboardVO.id).subscribe(data => {
      this.selectedColumnIndex = this.taskboardVO.taskboardColumnMapVO.
        findIndex(columnMapVo => columnMapVo.taskboardColumnsVO.columnOrder === column.columnOrder);
      const taskboardTaskVO = new TaskboardTaskVO();
      taskboardTaskVO.id = null;
      taskboardTaskVO.status = this.taskboardVO.taskboardColumns[i].columnName;
      taskboardTaskVO.taskboardId = this.taskboardVO.id;
      if (data && data.fieldMapping != null) {
        taskboardTaskVO.taskData = data.fieldMapping;
      }
      this.openTaskForm(taskboardTaskVO, columnMap, 'task');
    });
  }

  openTaskForm(task: TaskboardTaskVO, columnMap: TaskboardColumnMapVO, type: string): void {
    if (this.taskboardVO.isTaskBoardOwner) {
      columnMap.taskboardColumnsVO.taskboardColumnSecurity = new ResolveSecurityForTaskboardVO();
      columnMap.taskboardColumnsVO.taskboardColumnSecurity.read = true;
      columnMap.taskboardColumnsVO.taskboardColumnSecurity.delete = true;
      columnMap.taskboardColumnsVO.taskboardColumnSecurity.update = true;
    } else {
      columnMap.taskboardColumnsVO.taskboardColumnSecurity = this.taskboardVO.taskboardColumns.find(c => c.columnName === task.status)['taskboardColumnSecurity'];
    }
    let subStatus: string;
    if (this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus
      && this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus.length > 0) {
      subStatus = this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus[0].name
    }
    let statusList: StatusList[] = [];
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
    this.loadTaskVO();
    const dialog = this.dialog.open(TaskboardFormDetailsComponent, {
      disableClose: false,
      width: '95%',
      maxWidth: '95%',
      height: '95%',
      autoFocus: false,
      data: {
        taskDetails: task,
        formId: this.taskboardVO.taskboardColumns[0].formId,
        status: this.taskBoardTaskVO.status,
        version: this.taskboardVO.taskboardColumns[0].version,
        color: columnMap.taskboardColumnsVO.columnColor,
        statusList: statusList,
        taskList: this.taskList,
        taskIndex: this.selectedTaskIndex,
        groupList: this.groupList,
        usersList: this.usersList,
        taskName: this.taskboardVO.taskName,
        taskboardId: this.taskboardVO.id,
        taskboardColumnId: columnMap.taskboardColumnsVO.id,
        isTaskBoardOwner: this.taskboardVO.isTaskBoardOwner,
        taskboardColumnSecurity: columnMap.taskboardColumnsVO.taskboardColumnSecurity,
        taskboardVO: this.taskboardVO,
        value: type,
        mappedColumnTaskList: columnMap.taskboardTaskVOList,
        subStatus: subStatus,
        taskboardList: this.taskboardVoList,
        sprintVO: this.taskboardConfigurationComponent?.selectedSprint,
        sprintSettingsVo: this.taskboardVoList.find(t => t.id === this.taskboardVO.id).sprintSettingsVo
      },
    });
    dialog.afterClosed().subscribe(data => {
      // if (data && data.taskDetails && type !== 'task') {
      //   this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex] = data.taskDetails;
      // } else if ((type === 'task' && data && data.taskDetails) || type === 'subtask') {
      //   this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList.push(data.taskDetails);
      // this.spinnerDialog();
      // this.taskboardService.getTaskboardDetailsByType(this.taskboardVO.id, true).subscribe((data) => {
      //   this.taskboardVO.taskboardColumnMapVO = data.taskboardColumnMapVO;
      //   this.spinner.close();
      //   this.loadSubTasks();
      //   this.taskboardService.getDoneTaskoardTask(this.taskboardVO.id).subscribe(result => {
      //     this.loadDoneTasks(result);
      //   });
      //   this.taskboardService.getTaskboardDetailsByType(this.taskboardVO.id, false).subscribe(taskboard => {
      //     var columnMapVO: TaskboardColumnMapVO[] = [];
      //     columnMapVO = taskboard.taskboardColumnMapVO;
      //     // this.loadTasks(columnMapVO);
      //   });
      // });

      // if (this.taskboardConfigurationComponent.groupByName === 'Status') {
      //   if (this.filterApplied !== true) {
      //     this.gridViewInit();
      //   } else {
      //     this.loadTaskByFilter();
      //   }
      // } else {
      //   const groupBy = this.groupByList.find(g => g.name === this.taskboardConfigurationComponent.groupByName);
      //   this.setGroupBy(groupBy, 0);
      // }
      this.gridViewInit();
      // }
    });
  }

  setGroupBy(groupBy: any, index: number): void {
    this.groupByName = groupBy.name;
    this.groupByVO.groupBy = groupBy.value;
    this.groupByVO.id = this.taskboardVO.id;
    this.groupByVO.index = index;
    this.sum = index;
    this.filterApplied = true;
    if (this.object?.selectedSprint?.sprintId) {
      this.groupByVO.sprintId = this.object?.selectedSprint.sprintId;
    }

    this.taskboardService.groupByTaskboard(this.groupByVO).subscribe(data => {
      if (data) {
        if (index === 0) {
          this.taskboardVO = data;
          if (this.groupByName === 'Status') {
            if (!this.object?.selectedSprint?.sprintId) {
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
            }
          }
        } else {
          this.taskboardVO.taskboardColumnMapVO.forEach((columnMap, i) => {
            columnMap.taskboardTaskVOList.push(...data.taskboardColumnMapVO[i].taskboardTaskVOList);
          });
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
      }
    }, error => {
      this.filterApplied = false;
      if (this.spinner) {
        this.spinner.close();
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

  getDueDateColor(dueDate: any): any {
    return new Date(dueDate);
  }

  setMaxStartDate(task: TaskboardTaskVO): string {
    let maxDate = null;
    if (task.dueDate) {
      maxDate = new Date(task.dueDate);
    }
    return maxDate;
  }

  setMinDueDate(task: TaskboardTaskVO): string {
    let minDate = null;
    if (task.startDate) {
      minDate = new Date(task.startDate);
    }
    return minDate;
  }

  removeDate(task: TaskboardTaskVO, type: string): void {
    const taskVO = new TaskboardTaskVO();
    taskVO.id = this.taskBoardTaskVO.id;
    if (type === 'due') {
      taskVO.dueDate = null;
      if (task.startDate) {
        taskVO.startDate = new Date(task.startDate);
      }
    } else {
      if (task.dueDate) {
        taskVO.dueDate = new Date(task.dueDate);
      }
      taskVO.startDate = null;
    }
    this.spinnerDialog();
    this.taskboardService.saveStartAndDueDate(taskVO).subscribe(data => {
      this.spinner.close();
      if (data) {
        if (type === 'start') {
          task.startDate = null;
        } else {
          task.dueDate = null;
        }
      }
    }, error => {
      this.spinner.close();
    });
  }

  dateMouseDown(task: TaskboardTaskVO, type: string): void {
    this.taskBoardTaskVO = task;
    this.dateType = type;
  }

  subTaskDateMouseDown(task: TaskboardTaskVO, type: string): void {
    this.taskBoardTaskVO = task;
    this.dateType = type;
  }

  openMenu(): void {
    this.dateMenu.openMenu();
  }

  onSelectDueDate(event: any): void {
    this.dateMenu1.closeMenu();
    this.onSelect(event);
  }

  onSelect(event: any): void {
    this.dateMenu.closeMenu();
    const taskVO = new TaskboardTaskVO();
    taskVO.id = this.taskBoardTaskVO.id;
    if (this.dateType === 'dueDate') {
      taskVO.dueDate = event;
      taskVO.startDate = this.taskBoardTaskVO.startDate;
      this.taskBoardTaskVO.dueDate = event;
    } else {
      taskVO.dueDate = this.taskBoardTaskVO.dueDate;
      taskVO.startDate = event;
      this.taskBoardTaskVO.startDate = event;
    }
    this.spinnerDialog();
    this.taskboardService.saveStartAndDueDate(taskVO).subscribe(data => {
      // this.taskboardService.getTaskboardDetailsByType(this.taskboardVO.id, true).subscribe(board => {
      //   this.taskboardVO.taskboardColumnMapVO = board.taskboardColumnMapVO;
      //   this.spinner.close();
      //   this.loadSubTasks();
      //   this.setMaxAndMindate();
      //   this.taskboardService.getDoneTaskoardTask(this.taskboardVO.id).subscribe(result => {
      //     this.loadDoneTasks(result);
      //   });
      //   this.taskboardService.getTaskboardDetailsByType(this.taskboardVO.id, false).subscribe(taskboard => {
      //     var columnMapVO: TaskboardColumnMapVO[] = [];
      //     columnMapVO = taskboard.taskboardColumnMapVO;
      //     // this.loadTasks(columnMapVO);
      //   });
      //   this.dateMenu.closeMenu();
      // });
      this.spinner.close();
      if (this.taskboardConfigurationComponent.groupByName === 'Status') {
        if (this.filterApplied !== true) {
          this.gridViewInit();
        } else {
          this.loadTaskByFilter();
        }
      } else {
        const groupBy = this.groupByList.find(g => g.name === this.taskboardConfigurationComponent.groupByName);
        this.setGroupBy(groupBy, 0);
      }

      this.dateMenu.closeMenu();
    }, error => {
      this.spinner.close();
    });
  }

  loadTaskByFilter() {
    this.taskboardService.getTaskboardTaskByUser(this.assignTaskVO, this.object?.selectedSprint?.sprintId).subscribe(data => {
      this.filterApplied = true;
      this.taskboardVO.taskboardColumnMapVO = data;
    });
  }

  changeSubtaskStatus(status: any, task: TaskboardTaskVO): void {
    const taskVO = new TaskboardTaskVO();
    taskVO.id = task.id;
    taskVO.subStatus = task.subStatus;
    taskVO.status = status.name;
    this.spinnerDialog();
    this.taskboardService.setTaskBoardStatus(taskVO).subscribe(data => {
      this.spinner.close();
      if (data) {
        task.status = status.name;
      }
    }, error => {
      this.spinner.close();
    });
  }

  loadPendingTasks(): void {
    this.taskboardService.getTaskboardDetailsByType(this.id, this.sum).subscribe(taskboard => {
      this.pendingTaskboardDetails = taskboard;
      let count = 0;
      this.pendingTaskboardDetails?.taskboardColumnMapVO.forEach(columnMap => {
        if (columnMap.taskboardTaskVOList.length === 0) {
          count++;
        }
      });
      if (count === this.pendingTaskboardDetails?.taskboardColumnMapVO.length) {
        this.isScroll = false;
      } else {
        this.taskboardDetailsVO.taskboardColumnMapVO.forEach((columnMap, i) => {
          if (this.pendingTaskboardDetails.taskboardColumnMapVO[i].taskboardTaskVOList?.length > 0) {
            columnMap.taskboardTaskVOList.push(...this.pendingTaskboardDetails.taskboardColumnMapVO[i].taskboardTaskVOList);
          }
        });
        for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
          if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length < this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length) {
            let length = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length + 15;
            length = length < this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length ? length : this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length;
            for (let j = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j < length; j++) {
              this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.push(this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
            }
            if (length < this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length) {
              return;
            }
          }
        }
      }
    });
  }

  loadPendingSprintTasks(): void {
    this.taskboardService.getSprintTasks(this.taskboardConfigurationComponent.selectedSprint.sprintId, this.taskboardVO.id, this.sum).subscribe(taskboard => {
      this.pendingTaskboardDetails = taskboard;
      let count = 0;
      this.pendingTaskboardDetails?.taskboardColumnMapVO.forEach(columnMap => {
        if (columnMap.taskboardTaskVOList.length === 0) {
          count++;
        }
      });
      if (count === this.pendingTaskboardDetails?.taskboardColumnMapVO.length) {
        this.isScroll = false;
      } else {
        this.taskboardDetailsVO.taskboardColumnMapVO.forEach((columnMap, i) => {
          if (this.pendingTaskboardDetails.taskboardColumnMapVO[i].taskboardTaskVOList?.length > 0) {
            columnMap.taskboardTaskVOList.push(...this.pendingTaskboardDetails.taskboardColumnMapVO[i].taskboardTaskVOList);
          }
        });
        for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
          if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length < this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length) {
            let length = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length + 15;
            length = length < this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length ? length : this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length;
            for (let j = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j < length; j++) {
              this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.push(this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
            }
            if (length < this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length) {
              return;
            }
          }
        }
      }
    });
  }

  // loadPendingTasks(): void {
  //   for (let i = 0; i < this.taskboardVO.taskboardColumnMapVO.length; i++) {
  //     if (this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length < this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length) {
  //       let length = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length + 15;
  //       length = length < this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length ? length : this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length;
  //       for (let j = this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.length; j < length; j++) {
  //         this.taskboardVO.taskboardColumnMapVO[i].taskboardTaskVOList.push(this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList[j]);
  //       }
  //       if (length < this.taskboardDetailsVO.taskboardColumnMapVO[i].taskboardTaskVOList.length) {
  //         return;
  //       }
  //     }
  //   }
  // }

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

}


