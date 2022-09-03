import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApplicationComponent } from '../engine-module/application/application.component';
import { AuthGuard } from '../services/core/authentication/auth-guard-service/auth.guard';
import { RoleGuardService } from '../services/core/authentication/role-guard-service/role-guard.service';
import { ReportConfigurationComponent } from './report-configuration/report-configuration.component';
import { TaskFlowComponent } from './task-flow/task-flow.component';

const routes: Routes = [
  // {
  //   path: '', component: ApplicationComponent, canActivate: [AuthGuard], children: [
  { path: 'workflow', component: TaskFlowComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'create', component: TaskFlowComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'template-workflow', component: TaskFlowComponent },
  { path: 'edit/:id/version/:version', component: TaskFlowComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'report-config', component: ReportConfigurationComponent, canActivate: [AuthGuard, RoleGuardService] },
  // {
  //   path: 'get-report/:id', component: ReportGenerateComponent, canActivate: [AuthGuard, RoleGuardService]
  // },
  //   ]
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class YoroflowDesignRoutingModule { }
