import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MyTaskService } from '../../mytasks-module/mytasks/my-task.service';
import { OpenFormDialogBoxComponent } from '../open-form-dialog-box/open-form-dialog-box.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { TasklistService } from '../tasklist.service';
import { WorkflowDashboardService } from '../../engine-module/work-flow-dashboard/workflow-dashboard.service';
import { WorkFlowList } from '../../engine-module/work-flow-dashboard/workflow-list-vo';

@Component({
  selector: 'lib-pinned-workflow-items',
  templateUrl: './pinned-workflow-items.component.html',
  styleUrls: ['./pinned-workflow-items.component.css']
})
export class PinnedWorkflowItemsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar, private dialog: MatDialog,
              private taskService: MyTaskService, private taskListService: TasklistService, private service: WorkflowDashboardService,
              private dialogRef: MatDialogRef<PinnedWorkflowItemsComponent>) { }
  show = false;
  workFlowList: WorkFlowList[];
  noPinnedWorkflow = false;
  ngOnInit(): void {
this.getpinnedworkflows();
  }

  getpinnedworkflows() {
    this.taskService.getPinedWorkflow().subscribe(data => {
      this.workFlowList = data;
      if (this.workFlowList.length === 0) {
        this.noPinnedWorkflow = true;
      }
      this.show = true;
    });
  }

  onNoClick() {
    this.dialogRef.close();
  }

  openDialogForm(taskId) {
    if (taskId != null) {
      this.taskService.getTaskInfo(taskId).subscribe(task => {
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
      });
    }
  }

  launch(workflowKey, workflowVersion, startType) {
    if (startType === 'launch') {
      this.service.getWebhookForLaunchWorkflow(workflowKey, workflowVersion, null).subscribe(webData => {
        if (webData.status === 'proceed') {
          this.launchWorkflow(workflowKey, workflowVersion);
        }
      });
    } else {
      this.launchWorkflow(workflowKey, workflowVersion);
    }
  }

  launchWorkflow(workflowKey, workflowVersion) {
    this.service.launchWorkflow(workflowKey, workflowVersion, null, null).subscribe(data => {
      if (data.canProceed === false && (data.taskType === 'USER_TASK' || data.taskType === 'START_TASK'
        || data.taskType === 'APPROVAL_TASK')) {
        this.openDialogForm(data.instanceTaskId);
        // this.router.navigate(['/my-pending-task', data.instanceTaskId]);
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Workflow launched successfully'
        });
      }
    });
  }

  // launch(workflow) {

  // }

}
