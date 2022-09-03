import { Component, HostListener, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from 'src/app/creation-module/user-management/user-service';
import { OpenFormDialogBoxComponent } from 'src/app/engine-module/open-form-dialog-box/open-form-dialog-box.component';
import { TasklistService } from 'src/app/engine-module/tasklist.service';
import { WorkflowDashboardService } from 'src/app/engine-module/work-flow-dashboard/workflow-dashboard.service';
import { EnablePin, WorkFlowList } from 'src/app/engine-module/work-flow-dashboard/workflow-list-vo';
import { WorkflowdialogComponent } from 'src/app/engine-module/workflow-dialog/workflow-dialog.component';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { GroupVO, TaskboardTaskVO, UserVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import decode from 'jwt-decode';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { Paginator } from 'src/app/shared-module/paginator/paginatorVO';
import { HeaderVO } from 'src/app/creation-module/summary-report/summary-report-model';
import { MyRequestService } from './my-request.service';
import { MyRequestVO } from './my-request-vo';
import { T } from 'ngx-tethys/util';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { NumericDictionary } from 'ngx-tethys/types';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { StatusList, TaskboardColumnMapVO } from 'src/app/taskboard-module/taskboard-configuration/taskboard.model';
import { TaskboardFormDetailsComponent } from '../../taskboard-module/taskboard-form-details/taskboard-form-details.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { MyTaskService } from '../mytasks/my-task.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-my-requests',
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.scss']
})
export class MyRequestsComponent implements OnInit {
  sum = 25;
  constructor(
    private fb: FormBuilder,
    private service: WorkflowDashboardService,
    private workspaceService: WorkspaceService,
    private router: Router,
    private dialog: MatDialog,
    private myTaskService: MyTaskService,
    private snackBar: MatSnackBar,
    public userService: UserService,
    private taskListService: TasklistService,
    private myRequestService: MyRequestService,
    public taskboardService: TaskBoardService,
    public themeService: ThemeService) { }



  workFlowList: WorkFlowList[];
  showButton = false;
  showDashboard = false;
  show = false;
  workflowDataSource: any;
  columnHeaders: HeaderVO[] = [];
  displayedColumns: string[] = [];
  title: string;
  paginationVO = new PaginationVO();
  paginators = new Paginator();
  length: number;
  requestVO: MyRequestVO[] = [];
  paginatorRequestVO: MyRequestVO[] = [];
  scrollHeight: any;
  taskboardTaskVOList: TaskboardTaskVO[] = [];
  taskBoardTaskVO = new TaskboardTaskVO();
  viewTaskVO: any;
  taskboardColumns: any[] = [];
  taskboardColumnMapVO: TaskboardColumnMapVO[] = [];
  selectedColumn: string;
  selectedColumnIndex: number;
  selectedTaskIndex: any;
  mappedTask: any;
  columnStatus: any;
  taskStatusType: any;
  usersList: UserVO[] = [];
  userGroupList: UserVO[] = [];
  groupList: GroupVO[] = [];
  searchForm: FormGroup;
  filteredRequestList: MyRequestVO[] = [];
  leftSideRequestList: MyRequestVO[] = [];
  rightSideRequestList: MyRequestVO[] = [];
  filteredLeftSideRequestList: MyRequestVO[] = [];
  filteredRightSideRequestList: MyRequestVO[] = [];
  spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent>;
  isWorkspace = false;

  ngOnInit() {
    this.searchForm = this.fb.group({
      search: []
    });
    this.loadLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadLayout();
    });
    this.loadTableHeaderData();
    this.isWorkspace = this.myTaskService.isWorkspace;
    this.loadData();
    this.searchFormvalueChanges();
    this.allWorkspaceChange();
  }

  loadData(): void {
    let workspaceId: string;
    if (this.isWorkspace === false) {
      workspaceId = this.workspaceService.workspaceID;
    } else {
      workspaceId = 'all';
    }
    forkJoin([this.service.getWorkspaceWorkFlowList('manual', workspaceId), this.myRequestService.getTaskboardList(workspaceId)]).subscribe(results => {
      this.requestVO = [];
      if (results[0] && results[0].length > 0) {
        results[0].filter(w => w.status === 'published').forEach(t => {
          const requestVO = new MyRequestVO();
          requestVO.data = t;
          requestVO.launchButtonName = t.launchButtonName;
          requestVO.name = t.processDefinitionName;
          requestVO.taskType = 'workflow';
          this.requestVO.push(requestVO);
        });
      }

      if (results[1] && results[1].length > 0) {
        results[1].forEach(element => {
          const requestVO = new MyRequestVO();
          requestVO.data = element;
          requestVO.launchButtonName = element.launchButtonName;
          requestVO.name = element.name;
          requestVO.taskType = 'taskboard';
          this.requestVO.push(requestVO);
        });
      }

      if (this.requestVO && this.requestVO.length > 0) {

        this.requestVO.sort((a, b) => {
          let fa = a.name.toLowerCase(),
            fb = b.name.toLowerCase();

          if (fa < fb) {
            return -1;
          }
          if (fa > fb) {
            return 1;
          }
          return 0;
        });
        this.loadRequests();
      } else {
        this.showDashboard = true;
        this.filteredLeftSideRequestList = [];
        this.filteredRightSideRequestList = [];
      }
    });
  }

  allWorkspaceChange(): void {
    this.myTaskService.isWorkspaceEmit.subscribe(data => {
      this.isWorkspace = data;
      this.loadData();
    });
  }

  searchFormvalueChanges(): void {
    this.searchForm.get('search').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        let leftFilterList: any[] = [];
        for (let i = 0; i < this.leftSideRequestList.length; i++) {
          const taskboardName = this.leftSideRequestList[i].name.toLowerCase();
          if (taskboardName.includes(filterData)) {
            leftFilterList.push(this.leftSideRequestList[i]);
          }
        }
        this.filteredLeftSideRequestList = leftFilterList;
      } else {
        this.filteredLeftSideRequestList = this.leftSideRequestList;
      }
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        let rightFilterList: any[] = [];
        for (let i = 0; i < this.rightSideRequestList.length; i++) {
          const taskboardName = this.rightSideRequestList[i].name.toLowerCase();
          if (taskboardName.includes(filterData)) {
            rightFilterList.push(this.rightSideRequestList[i]);
          }
        }
        this.filteredRightSideRequestList = rightFilterList;
      } else {
        this.filteredRightSideRequestList = this.rightSideRequestList;
      }
    });
  }


  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.loadLayout();
  }


  loadLayout() {
    if (this.themeService.layoutName === 'modern') {
      this.scrollHeight = Math.round((window.innerHeight - 117));
    } else {
      this.scrollHeight = Math.round((window.innerHeight - 177));
    }
  }
  loadRequests(): void {
    const list = JSON.parse(JSON.stringify(this.requestVO));
    const fullList = JSON.parse(JSON.stringify(this.requestVO));

    let half = Math.ceil(list.length / 2);

    this.leftSideRequestList = list.splice(0, half);
    this.filteredLeftSideRequestList = this.leftSideRequestList;

    this.rightSideRequestList = fullList.splice(half, fullList.length - half);
    this.filteredRightSideRequestList = this.rightSideRequestList
    this.showDashboard = true;
  }

  loadTableHeaderData(): void {
    const header1 = new HeaderVO();
    header1.headerId = 'name';
    header1.headerName = 'Name';
    header1.widthPercentage = 70;
    const header2 = new HeaderVO();
    header2.headerId = 'launchButtonName';
    header2.headerName = 'Actions';
    header2.widthPercentage = 30;
    this.columnHeaders.push(header1);
    this.columnHeaders.push(header2);
    this.displayedColumns = ['name', 'launchButtonName'];
  }

  loadWorkFlowList(propertyType) {
    let workspaceId: string;
    if (this.isWorkspace === false) {
      workspaceId = this.workspaceService.workspaceID;
    } else {
      workspaceId = 'all';
    }
    this.service.getWorkspaceWorkFlowList(propertyType, workspaceId).subscribe(data => {
      this.workFlowList = data;
      this.workflowDataSource = this.workFlowList.filter(w => w.status === 'published');

      this.workFlowList.filter(w => w.status === 'published').forEach(t => {
        const requestVO = new MyRequestVO();
        requestVO.data = t;
        requestVO.launchButtonName = t.launchButtonName;
        requestVO.name = t.processDefinitionName
        this.requestVO.push(requestVO);
      });
      this.show = true;
      this.showDashboard = true;
      // this.workflowDataSource = [];
      // this.workFlowList.forEach((w, i) => {
      //   if (i < 10) {
      //     this.workflowDataSource.push(w);
      //   }
      // });
      this.length = this.workflowDataSource.length;
    });
  }

  getTaskboardList() {
    let workspaceId: string;
    if (this.isWorkspace === false) {
      workspaceId = this.workspaceService.workspaceID;
    } else {
      workspaceId = 'all';
    }
    this.myRequestService.getTaskboardList(workspaceId).subscribe(data => {

      if (data && data.length > 0) {
        data.forEach(element => {
          const requestVO = new MyRequestVO();
          requestVO.data = element;
          requestVO.launchButtonName = 'Launch';
          requestVO.name = element.name;
          this.requestVO.push(requestVO);
        });
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

  viewTaskboardTask(taskboardId) {
    this.taskboardTaskVOList = [];
    this.spinnerDialog();
    this.taskboardService.getAllTaskboardDetails(taskboardId).subscribe(task => {
      this.viewTaskVO = task;
      this.taskboardColumns = [];

      for (let i = 0; i < task.taskboardColumnMapVO.length; i++) {
        this.taskboardColumns.push(task.taskboardColumnMapVO[i].taskboardColumnsVO);
        task.taskboardColumnMapVO[i].taskboardTaskVOList.forEach(element => {
          this.taskboardTaskVOList.push(element);
        });
      }
      this.resolveInitialValues();
      //   this.taskboardService.getAllDoneTasks(taskboardId).subscribe(result => {

      //     this.viewTaskVO.taskboardColumnMapVO[this.viewTaskVO.taskboardColumnMapVO.length - 1].taskboardTaskVOList = result;
      //     this.taskboardColumnMapVO = task.taskboardColumnMapVO;
      //     this.taskboardColumns = [];

      //     for (let i = 0; i < task.taskboardColumnMapVO.length; i++) {
      //       this.taskboardColumns.push(task.taskboardColumnMapVO[i].taskboardColumnsVO);
      //       task.taskboardColumnMapVO[i].taskboardTaskVOList.forEach(element => {
      //         this.taskboardTaskVOList.push(element);
      //       });
      //     }


      //   }, error => {
      //     this.spinner.close();
      //   });
    }, error => {
      this.spinner.close();
    });
  }

  resolveInitialValues() {
    let item = null;
    item = this.taskboardColumns.find(column => column.columnOrder === 0);
    if (item && item !== null) {
      this.taskboardService.resolvetaskboardFields(this.viewTaskVO.id).subscribe(data => {
        this.spinner.close();
        const taskboardTaskVO = new TaskboardTaskVO();
        taskboardTaskVO.id = null;
        taskboardTaskVO.status = item.columnName;
        taskboardTaskVO.taskboardId = this.viewTaskVO.id;
        if (data && data.fieldMapping != null) {
          taskboardTaskVO.taskData = data.fieldMapping;
        }
        this.taskBoardTaskVO = taskboardTaskVO;
        this.openTaskDetailsDialog(item);
      }, error => {
        this.spinner.close();
      });
    }
  }

  openTaskDetailsDialog(item) {
    // const taskDetails = new TaskboardTaskVO();
    // if (this.columnStatus === 'deleted') {
    //   this.taskStatusType = 'deleted';

    // }
    // let item = null;

    // const taskboardTaskVO = new TaskboardTaskVO();
    //   taskboardTaskVO.id = null;
    //   taskboardTaskVO.status = item.columnName;
    //   taskboardTaskVO.taskboardId = this.viewTaskVO.id;
    //   this.taskBoardTaskVO = taskboardTaskVO;

    // if (this.columnStatus === 'Archived') {
    //   this.taskStatusType = 'Archived';
    //   if (taskDetails && taskDetails.previousStatus) {
    //     item = this.taskboardColumns.find(column => column.columnName === taskDetails.previousStatus);
    //     this.selectedColumn = item.columnName;
    //     const columnIndex = this.taskboardColumnMapVO.findIndex
    //       (column => column.taskboardColumnsVO.columnName === taskDetails.previousStatus);
    //     this.selectedColumnIndex = columnIndex;
    //   }
    // }
    // else {
    //   item = this.taskboardColumns.find(column => column.columnOrder === 0);
    //   this.selectedColumn = item.columnName;
    //   const columnIndex = this.taskboardColumnMapVO.findIndex(column => column.taskboardColumnsVO.columnName === item.columnName);
    //   this.selectedColumnIndex = columnIndex;
    // }



    // if (this.viewTaskVO.isTaskBoardOwner) {
    //   item.taskboardColumnSecurity.read = true;
    //   item.taskboardColumnSecurity.delete = true;
    //   item.taskboardColumnSecurity.update = true;
    // }



    // if (item.taskboardColumnSecurity.read === true) {
    //   this.taskBoardTaskVO = taskDetails;
    //   const statusList: StatusList[] = [];
    //   this.taskboardColumnMapVO.forEach(column => {
    //     const statusListVO = new StatusList();
    //     statusListVO.name = column.taskboardColumnsVO.columnName;
    //     statusListVO.color = column.taskboardColumnsVO.columnColor;
    //     if (column.taskboardColumnsVO.subStatus && column.taskboardColumnsVO.subStatus.length > 0) {
    //       statusListVO.subStatusList = column.taskboardColumnsVO.subStatus;
    //       statusList.push(statusListVO);
    //     } else {
    //       statusListVO.subStatusList = [];
    //       statusList.push(statusListVO);
    //     }
    //   });
    //   const selectedTaskIndex = this.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList.findIndex(column => column.id === item.id);
    //   this.selectedTaskIndex = selectedTaskIndex;
    //   this.mappedTask = this.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList;
    //   let subStatus: string;
    //   if (this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus
    //     && this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus.length > 0) {
    //     subStatus = this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus[0].name;
    //   }

    // if (this.viewTaskVO.isTaskBoardOwner) {
    item.taskboardColumnSecurity.read = true;
    item.taskboardColumnSecurity.delete = true;
    item.taskboardColumnSecurity.update = true;
    // }
    if (item.taskboardColumnSecurity.read === true) {
      this.mappedTask = '';
      this.selectedTaskIndex = undefined;
      // const taskboardTaskVO = new TaskboardTaskVO();
      // taskboardTaskVO.id = null;
      // taskboardTaskVO.status = item.columnName;
      // taskboardTaskVO.taskboardId = this.viewTaskVO.id;
      // this.taskBoardTaskVO = taskboardTaskVO;
      let array: any[] = [];
      if (
        this.taskboardTaskVOList === undefined ||
        this.taskboardTaskVOList === null ||
        this.taskboardTaskVOList.length > 0
      ) {
        for (let i = 0; i < this.taskboardTaskVOList.length; i++) {
          if (this.taskboardTaskVOList[i].taskType === "parentTask") {
            array.push(this.taskboardTaskVOList[i]);
          }
        }
      }

      var subStatus: string;
      if (this.viewTaskVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus
        && this.viewTaskVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus.length > 0) {
        subStatus = this.viewTaskVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus[0].name
      }
      var statusList: StatusList[] = [];
      this.viewTaskVO.taskboardColumnMapVO.forEach(column => {
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
      // setTimeout(() => {
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
          formId: item.formId,
          status: this.taskBoardTaskVO.status,
          version: item.version,
          color: item.color,
          statusList: statusList,
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
          value: 'task',
          mappedColumnTaskList: this.mappedTask,
          subStatus: subStatus,
        },
      });
      dialog.afterClosed().subscribe(data => {
        this.myRequestService.invokeSubmittedReqEmitter();
      });
      // }, 500);
    }

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

  openDraft(taskId) {
    if (taskId != null) {
      this.myTaskService.getTaskInfo(taskId).subscribe(task => {
        if (task) {
          this.spinner.close();
          this.openDialogForm(task);
        } else {
          this.spinner.close();
        }
      }, error => {
        this.spinner.close();
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
        this.myRequestService.invokeSubmittedReqEmitter();
      });
    }
  }

  allowLaunch(workflowKey, workflowVersion, taskData, workspaceId) {
    this.spinnerDialog();
    this.service.getWebhookForLaunchWorkflow(workflowKey, workflowVersion, workspaceId).subscribe(webData => {
      if (webData && webData.status === 'proceed') {
        this.service.launchWorkflow(workflowKey, workflowVersion, taskData, workspaceId).subscribe(data => {
          if ((data.taskType === 'USER_TASK' || data.taskType === 'START_TASK'
            || data.taskType === 'APPROVAL_TASK')) {
            this.taskListService.invokeLaunchEmitter();
            this.openDraft(data.instanceTaskId);
          } else {
            this.spinner.close();
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Workflow launched successfully'
            });
          }
        }, error => {
          this.spinner.close();
        });
      }
    }, error => {
      this.spinner.close();
    });
  }

  launchWorkflow(workflow, workflowKey, workflowVersion, workspaceId) {
    this.spinnerDialog();
    this.service.getFormIdentifierLaunchWorkflow(workflowKey, workflowVersion, workspaceId).subscribe(form => {
      this.spinner.close();
      if (form && form !== null && form.hasDraft === true) {
        const dialog = this.dialog.open(WorkflowdialogComponent, {
          disableClose: true,
          width: '450px',

        });
        dialog.afterClosed().subscribe((data) => {
          if (data.status === 'yes') {
            this.service.workflowDraft(workflow.processDefinitionId).subscribe(res => {
              if (res !== null && res !== undefined && res !== '') {
                this.openDialogForm(res);

              }
            });
          }
          else {
            this.allowLaunch(workflowKey, workflowVersion, null, workspaceId);

          }
        });
      }
      else {
        this.allowLaunch(workflowKey, workflowVersion, null, workspaceId);

      }
    }, error => {
      this.spinner.close();
    });
  }

  getLaunchButtonName(workflow) {
    return workflow.launchButtonName == null
      ? 'Launch'
      : workflow.launchButtonName;
  }

  pageEvent(paginator: Paginator): void {
    const pagination = new PaginationVO();
    pagination.index = paginator.index;
    pagination.size = paginator.pageSize;
    // this.workflowDataSource = [];
    // this.workFlowList.forEach((w, i) => {
    //   if ((pagination.size * pagination.index) < (pagination.size * (pagination.index + 1))) {
    //     this.workflowDataSource.push(w);
    //   }
    // });
  }

}
