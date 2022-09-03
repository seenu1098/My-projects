import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DynamicPageComponent } from './shared/components/dynamic-page/dynamic-page.component';
import { LoadFormComponent } from './load-form/load-form.component';
import { ApplicationLauncherComponent } from './application-launcher/application-launcher.component';
import { AuthGuard } from '../services/core/authentication/auth-guard-service/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApplicationProvisionComponent } from './application-provision/application-provision.component';
import { CanDeactivateGuardService } from './shared/service/can-deactivate-guard.service';
import { RoleGuardService } from '../services/core/authentication/role-guard-service/role-guard.service';
import { UserPermissionComponent } from './user-permission/user-permission.component';
import { PublicFormComponent } from './public-form/public-form.component';
import { ApplicationComponent } from '../engine-module/application/application.component';
// import { ReportGenerateComponent } from '../designer-module/report-generate/report-generate.component';
import { ReportConfigurationComponent } from '../designer-module/report-configuration/report-configuration.component';
import { TaskboardConfigurationComponent } from '../taskboard-module/taskboard-configuration/taskboard-configuration.component';
import { TaskFlowComponent } from '../designer-module/task-flow/task-flow.component';
import { ExpireDialogComponent } from '../shared-module/expire-dialog/expire-dialog.component';
import { ReportGenerateComponent } from '../engine-module/report-generate/report-generate.component';



const routes: Routes = [
  // {
  //   path: 'page/:id/:version', component: DynamicPageComponent, children: [{
  //     path: 'load-info/:id/:controlName/:uuid', component: LoadFormComponent,
  //   },
  //   ]
  // },
  // {
  //   path: 'app/:id', component: ApplicationLauncherComponent, canActivate: [AuthGuard]
  //   , children: [
  //     { path: 'page/:id', component: DynamicPageComponent }
  //   ]
  // },
  // {
  //   path: '', component: ApplicationComponent, canActivate: [AuthGuard], children: [
  { path: 'application-dashboard', component: DashboardComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'user-permission', component: UserPermissionComponent, canActivate: [AuthGuard] },
  {
    path: 'app/edit/:id', component: ApplicationProvisionComponent, canActivate: [AuthGuard, RoleGuardService]

  },
  {
    path: 'app/create', component: ApplicationProvisionComponent, canActivate: [AuthGuard, RoleGuardService]

  },
  { path: 'application/:id', component: ApplicationProvisionComponent, canActivate: [AuthGuard, RoleGuardService] },

  // {
  //   path: 'app/:id', component: ApplicationLauncherComponent, canActivate: [AuthGuard]
  // },
  {
    path: 'app/:id', component: ApplicationLauncherComponent
    , children: [
      { path: ':workspace/page/:id/:version', component: DynamicPageComponent, canActivate: [AuthGuard, RoleGuardService] }
    ]
  },
  {
    path: ':workspace/page/:id/:version', component: DynamicPageComponent, children: [{
      path: 'load-info/:id/:version', component: DynamicPageComponent, canActivate: [AuthGuard, RoleGuardService]
    }, {
      path: 'load-info/:id/:version/:controlName/:uuid', component: LoadFormComponent,
    },
    {
      path: ':workspace/page/:id/:version', component: DynamicPageComponent, canActivate: [AuthGuard, RoleGuardService]
    }]
  },
  { path: 'public/:id', component: PublicFormComponent },
  {
    path: ':workspace/get-report/:id', component: ReportGenerateComponent, canActivate: [AuthGuard, RoleGuardService]
  },
  { path: ':workspace/taskboard', component: TaskboardConfigurationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/taskboard/:taskboard-key', component: TaskboardConfigurationComponent, canActivate: [AuthGuard, RoleGuardService] },
  {
    path: ':workspace/taskboard/:taskboard-key/:task-id', component: TaskboardConfigurationComponent,
    canActivate: [AuthGuard, RoleGuardService]
  },

  { path: ':workspace/workflow', component: TaskFlowComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/create', component: TaskFlowComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/edit/:id/version/:version', component: TaskFlowComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/report-config', component: ReportConfigurationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'expire-dialog', component: ExpireDialogComponent, canActivate: [AuthGuard, RoleGuardService] },
  //   ]
  // },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class YoroappsRenderingLibRoutingModule { }
