import { Component, OnInit } from '@angular/core';
import { WorkflowDashboardService } from '../work-flow-dashboard/workflow-dashboard.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../engine-module/shared/service/user-service';
import { EnablePin, WorkFlowList } from '../work-flow-dashboard/workflow-list-vo';
import { UserVO } from '../../engine-module/shared/vo/user-vo';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { OpenFormDialogBoxComponent } from '../../engine-module/open-form-dialog-box/open-form-dialog-box.component';
import decode from 'jwt-decode';
import { MyTaskService } from '../../mytasks-module/mytasks/my-task.service';
import { TasklistService } from '../../engine-module/tasklist.service';
import { WorkflowdialogComponent } from '../workflow-dialog/workflow-dialog.component';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'app-workflow-items',
  templateUrl: './workflow-items.component.html',
  styleUrls: ['./workflow-items.component.scss']
})
export class WorkflowItemsComponent implements OnInit {

  constructor(private service: WorkflowDashboardService, private workspaceService: WorkspaceService,
    private router: Router, private dialog: MatDialog, private myTaskService: MyTaskService,
    private snackBar: MatSnackBar, public userService: UserService, private taskListService: TasklistService) {
    this.isMobile = window.matchMedia('only screen and (max-width: 720px)').matches;
    if (window.matchMedia('only screen and (max-width: 768px)').matches
      || window.matchMedia('only screen and (max-width: 1024px)').matches) {
      this.isTablet = true;
    } else {
      this.isTablet = false;
    }
  }
  workFlowList: WorkFlowList[];
  manualList: WorkFlowList[];
  scheduleList: WorkFlowList[];
  webServiceList: WorkFlowList[];
  userVo = new UserVO();
  showButton = false;
  showDashboard = false;
  show = false;
  index: any;
  isMobile: boolean;
  isTablet: boolean;
  manualListCount: any;
  schedueListCount: any;
  webserviceListCount: any;
  isAllowed = true;
  isScheduleAllowed = true;
  isWebServiceAllowed = true;
  licenseVO = new LicenseVO();
  ngOnInit() {
    this.index = 0;
    this.enableCreateWorkflow();
    this.loadWorkFlowList('manual');
    this.getWorkflowApplicationsCount();
    this.checkScheduleWorkflows();
    this.checkWebServiceWorkflows();
  }

  checkScheduleWorkflows() {
    this.licenseVO.category = 'workflow_and_automations';
    this.licenseVO.featureName = 'scheduled_workflow';
    this.service.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'N') {
        this.isScheduleAllowed = false;
      }
    });
  }

  checkWebServiceWorkflows() {
    this.licenseVO.category = 'workflow_and_automations';
    this.licenseVO.featureName = 'web_service_workflow';
    this.service.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'N') {
        this.isWebServiceAllowed = false;
      }
    });
  }

  getWorkflowApplicationsCount() {
    this.service.getListCount().subscribe(data => {
      this.manualListCount = data.manualWorkflowsCount;
      this.schedueListCount = data.scheduledWorkflowsCount;
      this.webserviceListCount = data.webserviceWorkflowsCount;
    });
  }

  routeWorkflow() {
    this.licenseVO.category = 'general';
    this.licenseVO.featureName = 'workflows';
    this.service.isAllowed(this.licenseVO).subscribe(data => {
      if (data.response.includes('exceeded')) {
        const dialog = this.dialog.open(AlertmessageComponent, {
          width: '450px',
          data: { licenseVO: data, pageName: 'Workflow' }
        });
      } else {
        this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/yoroflow-design/create']);
      }
    });
  }


  enableCreateWorkflow() {
    const token = localStorage.getItem('token');
    const tokenPayload = decode(token);
    if (tokenPayload.user_role.some(userRole => userRole === 'workflow')) {
      this.showButton = true;
    } else {
      this.showButton = false;
    }
  }

  loadWorkFlowList(propertyType) {
    this.service.getWorkFlowList(propertyType).subscribe(data => {
      this.workFlowList = data;
      this.show = true;
      this.showDashboard = true;
      this.setWorkflowCount(propertyType);
    });
  }

  setWorkflowCount(propertyType) {
    if (propertyType === 'manual') {
      this.manualListCount = this.workFlowList.length;
    }
    if (propertyType === 'scheduled') {
      this.schedueListCount = this.workFlowList.length;
    }
    if (propertyType === 'launch') {
      this.webserviceListCount = this.workFlowList.length;
    }
  }

  record($event) {
    this.index = $event.index;
    this.show = false;
    if ($event.index === 0) {
      this.loadWorkFlowList('manual');
    } else if ($event.index === 1) {
      this.loadWorkFlowList('scheduled');
    } else {
      this.loadWorkFlowList('launch');
    }
  }

  setBackground(i, status): string {
    if (status === 'published') {
      return '#4caf50';
    } else if (status === 'draft') {
      return '#039be5';
    } else {
      return '#039be5';
    }
  }

  createWorkFlow() {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/workflow']);
  }

  editWorkFlow(processDefinitionId, workflowVersion) {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() +
      '/yoroflow-design/edit', processDefinitionId, 'version', workflowVersion]);
  }

  publishWorkFlow(key, workflowVersion) {
    this.service.publishWorkFlow(key, workflowVersion).subscribe(data => {
      if (data.response === 'No Provider For SMS Task') {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response
        });
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response
        });
        if (this.index === 0) {
          this.loadWorkFlowList('manual');
        } else if (this.index === 1) {
          this.loadWorkFlowList('scheduled');
        } else {
          this.loadWorkFlowList('launch');
        }
      }
    });
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

  allowLaunch(workflowKey, workflowVersion, taskData) {
    this.service.getWebhookForLaunchWorkflow(workflowKey, workflowVersion, null).subscribe(webData => {
      if (webData.status === 'proceed') {
        this.service.launchWorkflow(workflowKey, workflowVersion, taskData, null).subscribe(data => {
          if (data.canProceed === false && (data.taskType === 'USER_TASK' || data.taskType === 'START_TASK'
            || data.taskType === 'APPROVAL_TASK')) {
            this.openDraft(data.instanceTaskId);
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
    this.service.getFormIdentifierLaunchWorkflow(workflowKey, workflowVersion, null).subscribe(form => {
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
            this.allowLaunch(workflowKey, workflowVersion, null);

          }
        });
      }
      else {
        this.allowLaunch(workflowKey, workflowVersion, null);

      }
    });
  }

  openForm() {
    const taskPropertyDialogBox = this.dialog.open(OpenFormDialogBoxComponent, {
      disableClose: false,
      data: '',
      panelClass: 'task-property-dialogBox',
    });
  }

  getLaunchButtonName(workflow) {
    return workflow.launchButtonName == null
      ? 'Launch'
      : workflow.launchButtonName;
  }

  enableBin(event, workflow) {
    const enablePin = new EnablePin();
    if (event === 'pin') {
      enablePin.enablePin = true;
    }
    if (event === 'unpin') {
      enablePin.enablePin = false;
    }
    enablePin.processDefinitionKey = workflow.key;
    this.service.saveEnablePIn(enablePin).subscribe(data => {
      if (data) {
        if (event === 'pin') {
          workflow.enablePin = true;
        }
        if (event === 'unpin') {
          workflow.enablePin = false;
        }
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response
        });
      }
    });
  }
}
