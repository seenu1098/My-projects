import { Component, OnInit } from '@angular/core';
import { WorkflowDashboardService } from './workflow-dashboard.service';
import { WorkFlowList } from './workflow-list-vo';
import { Router } from '@angular/router';
import { OpenFormDialogBoxComponent } from '../open-form-dialog-box/open-form-dialog-box.component';
import { CreateWorkflowComponent } from '../create-workflow/create-workflow.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../engine-module/shared/service/user-service';
import { UserVO } from '../../engine-module/shared/vo/user-vo';
import decode from 'jwt-decode';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { UserRoleService } from 'src/app/shared-module/services/user-role.service';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-work-flow-dashboard',
  templateUrl: './work-flow-dashboard.component.html',
  styleUrls: ['./work-flow-dashboard.component.css']
})
export class WorkFlowDashboardComponent implements OnInit {

  constructor(private service: WorkflowDashboardService, private router: Router, private dialog: MatDialog,
              private snackBar: MatSnackBar, public userService: UserService, private workspaceService: WorkspaceService,
              private userRoleService: UserRoleService) {
    if (window.matchMedia('only screen and (max-width: 600px)').matches ||
      window.matchMedia('only screen and (max-width: 768px)').matches ||
      window.matchMedia('only screen and (max-width: 1024px)').matches) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  workflowListCount: any;
  enableCount = false;
  userVo = new UserVO();
  showButton = false;
  isMobile: boolean;
  licenseVO = new LicenseVO();
  userRoles: any[];
  allowFailedTask = false;
  ngOnInit() {
    this.userService.getLoggedInUserDetails().subscribe(data => {
      this.userVo = data;
      // if (this.userVo.emailId === 'admin@yoroflow.com') {
      //   this.showButton = true;
      // } else {
      //   this.router.navigate(['workflow-items']);
      //   this.showButton = false;
      // }

      const token = localStorage.getItem('token');
      // decode the token to get its payload
      const tokenPayload = decode(token);
      if (tokenPayload.user_role.some(userRole => userRole === 'dashboard')) {
        this.showButton = true;
      } else {
        this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/workflow-application']);
        this.showButton = false;
      }
    });
    this.getCount();
    this.checkRoles();
  }

  checkRoles() {
    this.userRoles = this.userRoleService.getUserRoles();
    if (this.userRoles != null &&
      (this.userRoles.includes('Account Owner') || this.userRoles.includes('Account Owner'))) {
      this.allowFailedTask = true;
    }
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

  getCount() {
    this.service.getWorkflowListCount().subscribe(data => {
      this.workflowListCount = data;
      this.enableCount = true;
    });
  }


  navigateTask(status) {
    if (status === 'completed') {
      this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/process-instance-completed-list']);
    } else if (status === 'running') {
      this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/process-instance-running-list']);
    } else if (status === 'failed') {
      this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/process-instance-failed-list']);
    }
  }

  createWorkflow() {
    const configDialog = this.dialog.open(
      CreateWorkflowComponent,
      {
        disableClose: true,
        width: '95%',
        maxWidth: '95%',
        height: '95%',
        panelClass: 'config-dialog',
        data: {
          pageName: "Workflow Dashboard",
          // showNewConfig: true,
          fromScratch: true
        },
      }
    );
  }

  workflowItems() {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/workflow-application']);
  }

  smsCount() {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/metric-data-details']);
  }
}
