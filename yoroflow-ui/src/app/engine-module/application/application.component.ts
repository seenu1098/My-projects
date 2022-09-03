import { TaskboardFormDetailsComponent } from './../../taskboard-module/taskboard-form-details/taskboard-form-details.component';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/service/user-service';
import { OpenFormDialogBoxComponent } from '../open-form-dialog-box/open-form-dialog-box.component';
import { MatDialog } from '@angular/material/dialog';
import { ProcessInstanceTaskListService } from '../process-instance-task-list/process-instance-task-list.service';
import { MyTaskService } from '../../mytasks-module/mytasks/my-task.service';
import { PinnedWorkflowItemsComponent } from '../pinned-workflow-items/pinned-workflow-items.component';
import { NotificationComponent } from 'src/app/message-module/notification/notification.component';
import { TaskboardTaskVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { StatusList, TaskboardColumnMapVO } from 'src/app/taskboard-module/taskboard-configuration/taskboard.model';
import { UserVO } from '../../taskboard-module/taskboard-form-details/taskboard-task-vo';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { GroupVO } from '../../designer-module/task-property/model/group-vo';
import { NotificationServices } from 'src/app/message-module/notification/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit {

  taskboardTaskVOList: TaskboardTaskVO[] = [];
  taskBoardTaskVO = new TaskboardTaskVO();
  viewTaskVO: any;
  taskboardColumnMapVO: TaskboardColumnMapVO[] = [];
  usersList: UserVO[] = [];
  userGroupList: UserVO[] = [];
  taskboardColumns: any[] = [];
  taskIdFromUrl: any;
  selectedColumn: string;
  selectedColumnIndex: number;
  selectedTaskIndex: any;
  groupList: GroupVO[] = [];
  mappedTask: any;
  constructor(public userService: UserService, private dialog: MatDialog, private taskService: MyTaskService
    , private processInstanceTaskListService: ProcessInstanceTaskListService, public taskboardService: TaskBoardService,
    private notificationService: NotificationServices, private snackbar: MatSnackBar) { }
  notificationObject: NotificationComponent;
  ngOnInit(): void {
    this.getUserAndGroupList();
    this.notificationService.notificationComponentEmitter.subscribe(data => {
      this.getNotification(data);
    });
  }

  getTaskId($event) {
    let taskId;
    if (!$event.taskId) {
      taskId = $event;
    } else if ($event.taskId) {
      taskId = $event.taskId;
    }
    if (taskId) {
      this.taskService.getTaskInfo(taskId).subscribe(data => {
        if (data.taskType === 'START_TASK' || data.taskType === 'USER_TASK' || data.taskType === 'APPROVAL_TASK') {
          this.openForm(data);
          if ($event.notification !== null && $event.notification !== undefined) {
            ($event.notification as NotificationComponent).updateReadTime();
          }
        }
      });
    }
  }

  getNotification($event) {
    let taskId;
    if (!$event.taskId) {
      taskId = $event;
    } else if ($event.taskId) {
      taskId = $event.taskId;
    }
    if ($event.type === 'taskboard') {
      this.viewTaskboardTask($event.taskboardId, $event.taskboardTaskId);
    } else if (taskId) {
      this.taskService.getTaskInfo(taskId).subscribe(data => {
        if (data.taskType === 'START_TASK' || data.taskType === 'USER_TASK' || data.taskType === 'APPROVAL_TASK') {
          this.openForm(data);
          if ($event.notification !== null && $event.notification !== undefined) {
            ($event.notification as NotificationComponent).updateReadTime();
          }
        }
      });
    }
  }

  pinClicked(event) {
    if (event === true) {
      const pinneddialogBox = this.dialog.open(PinnedWorkflowItemsComponent, {
        // disableClose: true,
        width: '547px',
        height: '547px',
        autoFocus: false,
        panelClass: 'custom-dialog-container'
      });
      pinneddialogBox.updatePosition({ right: '0px', top: '0px' });
    }
  }

  openForm(task) {
    const yoroflowVO = {
      isWorkflow: true,
      workflowId: task.processInstanceId,
      workflowTaskId: task.processInstanceTaskId,
      formId: task.formId,
      isApproveRejectForm: task.isApprovalForm,
      isSendBack: task.isSendBack,
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
      maxWidth: '96vw',
      width: '100vw',
      height: '94%',
      panelClass: 'full-screen-modal',
      autoFocus: false,
    });
  }

  getUserAndGroupList() {
    this.taskboardService.getUserGroupList().subscribe(group => {
      this.groupList = group;
    })
    this.taskboardService.getUsersList().subscribe(users => {
      this.usersList = users;
      this.userGroupList = users;
      this.usersList.forEach(element => {
        element.randomColor = this.getRandomColor();
      });
    })
  }

  getRandomColor() {
    return "#" + ("000000" + Math.floor(Math.random() * 16777216).toString(16)).substr(-6);
  }

  viewTaskboardTask(taskboardId, taskId) {
    this.taskboardTaskVOList = [];
    this.taskIdFromUrl = taskId;
    this.taskboardService.getAllTaskboardDetails(taskboardId).subscribe(task => {
      if (task.id) {
        this.viewTaskVO = task;
        this.taskboardColumnMapVO = task.taskboardColumnMapVO;
        this.taskboardColumns = []

        for (let i = 0; i < task.taskboardColumnMapVO.length; i++) {
          this.taskboardColumns.push(task.taskboardColumnMapVO[i].taskboardColumnsVO);
          task.taskboardColumnMapVO[i].taskboardTaskVOList.forEach(element => {
            this.taskboardTaskVOList.push(element)
          });
        }

        if (this.taskIdFromUrl !== undefined && this.taskIdFromUrl !== null && this.taskIdFromUrl !== '') {
          this.openTaskDetailsDialog();
        }
      } else {
        this.dialog.open(ConfirmationDialogBoxComponentComponent, {
          data: { type: 'board_exist' }
        });
      }
    });
  }

  openTaskDetailsDialog() {
    const taskDetails = this.taskboardTaskVOList.find(task => task.id === this.taskIdFromUrl);
    let item = null;
    if (taskDetails.taskType === 'parentTask') {
      if (taskDetails.status === 'Archived') {
        item = this.taskboardColumns.find(column => column.columnName === taskDetails.previousStatus);
        this.selectedColumn = item.columnName;
        const columnIndex = this.taskboardColumnMapVO.findIndex(column => column.taskboardColumnsVO.columnName === taskDetails.previousStatus);
        this.selectedColumnIndex = columnIndex;
      } else {
        item = this.taskboardColumns.find(column => column.columnName === taskDetails.status);
        this.selectedColumn = item.columnName;
        const columnIndex = this.taskboardColumnMapVO.findIndex(column => column.taskboardColumnsVO.columnName === taskDetails.status);
        this.selectedColumnIndex = columnIndex;
      }
    } else {
      const task = this.taskboardTaskVOList.find(task => task.id === taskDetails.parentTaskId);
      status = task.status;
      item = this.taskboardColumns.find(column => column.columnName === status);
      this.selectedColumn = item.columnName;
      const columnIndex = this.taskboardColumnMapVO.findIndex(column => column.taskboardColumnsVO.columnName === status);
      this.selectedColumnIndex = columnIndex;
    }



    if (this.viewTaskVO.isTaskBoardOwner) {
      item.taskboardColumnSecurity.read = true;
      item.taskboardColumnSecurity.delete = true;
      item.taskboardColumnSecurity.update = true;
    }

    if (item.taskboardColumnSecurity.read === true) {
      this.taskBoardTaskVO = taskDetails;
      var statusList: StatusList[] = [];
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
      var subStatus: string;
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
          subStatus
        },
      });
    }

  }

}
