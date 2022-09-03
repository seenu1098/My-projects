import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { PublicFormComponent } from '../rendering-module/public-form/public-form.component';
//import { TaskboardConfigurationComponent } from '../taskboard-configuration/taskboard-configuration.component';
import { ApplicationComponent } from './application/application.component';
import { AddtaskComponent } from './board/addtask/addtask.component';
import { GenerateReportsComponent } from './generate-reports/generate-reports.component';
import { GroupComponent } from './group/group.component';
import { LineDrawComponent } from './line-draw/line-draw.component';
import { LoginInitialComponent } from './login-initial/login-initial.component';
//import { LoginComponent } from './login/login.component';
import { MarketPlaceComponent } from './market-place/market-place.component';
import { MetricDataDetailsComponent } from './metric-data-details/metric-data-details.component';
import { MyDoneTaskComponent } from './my-done-task/my-done-task.component';
import { MyLaunchedTaskComponent } from './my-launched-task/my-launched-task.component';
// import { MyPendingTaskComponent } from './my-pending-task/my-pending-task.component';
import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree/ngx-graph-org-tree.component';
import { ProcessInstanceCompletedListComponent } from './process-instance-completed-list/process-instance-completed-list.component';
import { ProcessInstanceFailedListComponent } from './process-instance-failed-list/process-instance-failed-list.component';
import { ProcessInstanceRunningListComponent } from './process-instance-running-list/process-instance-running-list.component';
import { ProcessInstanceTaskListComponent } from './process-instance-task-list/process-instance-task-list.component';
import { AuthGuard } from '../services/core/authentication/auth-guard-service/auth.guard';
import { RoleGuardService } from '../services/core/authentication/role-guard-service/role-guard.service';
import { TableObjectComponent } from './table-object/table-object.component';
import { WorkFlowDashboardComponent } from './work-flow-dashboard/work-flow-dashboard.component';
import { WorkflowItemsComponent } from './workflow-items/workflow-items.component';

import { LandingPageComponent } from './landing-page/landing-page.component';
import { IntegrateApplicationComponent } from '../taskboard-module/integrate-application/integrate-application.component';
import { ExpireDialogComponent } from '../shared-module/expire-dialog/expire-dialog.component';
import { WorkspaceDashboardComponent } from './workspace-dashboard/workspace-dashboard.component';
import { ReportGenerateComponent } from './report-generate/report-generate.component';
import { TemplateCenterComponent } from './template-center/template-center.component';
const routes: Routes = [
    { path: 'domain', component: LoginInitialComponent },

    //{ path: 'login', component: LoginComponent },
    // {
    //     path: ':workspace', canActivate: [AuthGuard], children: [
    // { path: 'my-pending-task', component: MyPendingTaskComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: 'line', component: LineDrawComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: 'org', component: NgxGraphOrgTreeComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: 'board', component: AddtaskComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: ':workspace/my-done-task', component: MyDoneTaskComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: ':workspace/my-launched-task', component: MyLaunchedTaskComponent, canActivate: [AuthGuard, RoleGuardService] },
    // { path: 'my-pending-task/:id', component: MyPendingTaskComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: 'table-object', component: TableObjectComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: 'group', component: GroupComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: ':workspace/landing-dashboard', component: LandingPageComponent, canActivate: [AuthGuard] },
    { path: 'generate-reports', component: GenerateReportsComponent, canActivate: [AuthGuard, RoleGuardService] },
    {
        path: ':workspace/process-instance-completed-list',
        component: ProcessInstanceCompletedListComponent, canActivate: [AuthGuard, RoleGuardService]
    },
    {
        path: ':workspace/process-instance-failed-list',
        component: ProcessInstanceFailedListComponent, canActivate: [AuthGuard, RoleGuardService]
    },
    {
        path: ':workspace/process-instance-running-list',
        component: ProcessInstanceRunningListComponent, canActivate: [AuthGuard, RoleGuardService]
    },
    { path: ':workspace/metric-data-details', component: MetricDataDetailsComponent, canActivate: [AuthGuard, RoleGuardService] },
    {
        path: ':workspace/view-task-list/:status/:id',
        component: ProcessInstanceTaskListComponent, canActivate: [AuthGuard, RoleGuardService]
    },
    { path: ':workspace/workflow-application', component: WorkflowItemsComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: ':workspace/dashboard', component: WorkFlowDashboardComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: ':workspace/market-place', component: MarketPlaceComponent, canActivate: [AuthGuard] },
    { path: ':workspace/board/:board-name/:id', component: PublicFormComponent },
    { path: 'expire-dialog', component: ExpireDialogComponent },
    {
        path: 'get-report/:id', component: ReportGenerateComponent, canActivate: [AuthGuard, RoleGuardService]
    },
    { path: 'workspace-dashboard', component: WorkspaceDashboardComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: 'workspace-dashboard/:id', component: WorkspaceDashboardComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: 'template-center', component: TemplateCenterComponent, canActivate: [AuthGuard, RoleGuardService]  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class YoroflowEngineRoutingModule { }