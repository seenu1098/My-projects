import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LineDrawComponent } from './line-draw/line-draw.component';
import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree/ngx-graph-org-tree.component';
import { AddtaskComponent } from './board/addtask/addtask.component';
import { MyDoneTaskComponent } from './my-done-task/my-done-task.component';
import { WorkFlowDashboardComponent } from './work-flow-dashboard/work-flow-dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from '../services/core/authentication/auth-guard-service/auth.guard';
import { DeactivateGuardService } from './shared/service/deactivate-guard-service/deactivate-guard.service';

import { MyLaunchedTaskComponent } from './my-launched-task/my-launched-task.component';
import { TableObjectComponent } from './table-object/table-object.component';
import { GroupComponent } from './group/group.component';
import { GenerateReportsComponent } from './generate-reports/generate-reports.component';
import { UserGroupAssociationComponent } from '../creation-module/user-group-association/user-group-association.component';
import { MyPendingTaskComponent } from './my-pending-task/my-pending-task.component';
import { ProcessInstanceCompletedListComponent } from './process-instance-completed-list/process-instance-completed-list.component';
import { ProcessInstanceFailedListComponent } from './process-instance-failed-list/process-instance-failed-list.component';
import { ProcessInstanceRunningListComponent } from './process-instance-running-list/process-instance-running-list.component';
import { ProcessInstanceTaskListComponent } from './process-instance-task-list/process-instance-task-list.component';
import { DashboardComponent, ApplicationLauncherComponent,
   DynamicPageComponent, ApplicationProvisionComponent} from 'yoroapps-rendering-lib';
import {
  GridConfigurationComponent, MenuConfigurationComponent,
  PageComponent, PageListComponent, TableObjectsComponent, CustomPagesComponent
} from 'yoroapps-creation';
import { ApplicationComponent } from './application/application.component';
import { LoginInitialComponent } from './login-initial/login-initial.component';

const routes: Routes = [
  { path: '', component: LoginInitialComponent },
  { path: 'domain', component: LoginInitialComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'app/:id', component: ApplicationLauncherComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]
    , children: [
      { path: 'page/:id', component: DynamicPageComponent, canActivate: [AuthGuard],canDeactivate: [DeactivateGuardService] }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
