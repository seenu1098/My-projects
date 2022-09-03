import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskboardConfigurationComponent } from './taskboard-configuration/taskboard-configuration.component';
import { TaskboardFormDetailsComponent } from './taskboard-form-details/taskboard-form-details.component';
//import { UppyComponentComponent } from './uppy-component/uppy-component.component';
import { LabelsDialogComponent } from './labels-dialog/labels-dialog.component';
import { AssigntaskDialogComponent } from './assigntask-dialog/assigntask-dialog.component';

import { TaskboardConfigurationDialogComponent } from './taskboard-configuration-dialog/taskboard-configuration-dialog.component';
import { CompletedTasksComponent } from './completed-tasks/completed-tasks.component';
import { IntegrateApplicationComponent } from './integrate-application/integrate-application.component';
import { TaskboarddocumentsComponent } from './taskboard-documents/taskboard-documents.component';
import { AuthGuard } from '../services/core/authentication/auth-guard-service/auth.guard';
import { RoleGuardService } from '../services/core/authentication/role-guard-service/role-guard.service';
import { SprintTasksComponent } from './sprint-tasks/sprint-tasks.component';
const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'taskboard', component: TaskboardConfigurationComponent, canActivate: [AuthGuard, RoleGuardService] },
      {
        path: 'taskboard/board-view/:taskboard-key', component: TaskboardConfigurationComponent,
        canActivate: [AuthGuard, RoleGuardService]
      },
      {
        path: 'taskboard/board-view/:taskboard-key/:task-id',
        component: TaskboardConfigurationComponent, canActivate: [AuthGuard, RoleGuardService]
      },
      {
        path: 'taskboard/grid-view/:taskboard-key', component: TaskboardConfigurationComponent,
        canActivate: [AuthGuard, RoleGuardService]
      },
      {
        path: 'taskboard/grid-view/:taskboard-key/:task-id', component: TaskboardConfigurationComponent,
        canActivate: [AuthGuard, RoleGuardService]
      },
      {
        path: 'taskboard/list-view/:taskboard-key', component: TaskboardConfigurationComponent,
        canActivate: [AuthGuard, RoleGuardService]
      },
      {
        path: 'taskboard/list-view/:taskboard-key/:task-id', component: TaskboardConfigurationComponent,
        canActivate: [AuthGuard, RoleGuardService]
      },
      {
        path: 'taskboard/gantt-view/:taskboard-key', component: TaskboardConfigurationComponent,
        canActivate: [AuthGuard, RoleGuardService]
      },
      {
        path: 'taskboard/gantt-view/:taskboard-key/:task-id', component: TaskboardConfigurationComponent,
        canActivate: [AuthGuard, RoleGuardService]
      },
      // { path: 'my-apps', component: IntegrateApplicationComponent, canActivate: [AuthGuard, RoleGuardService] },
      {
        path: ':workspace/taskboard/completed-tasks/:taskboard-key/:taskboard-id/:column-name',
        component: CompletedTasksComponent, canActivate: [AuthGuard, RoleGuardService]
      },
      { path: 'files', component: TaskboarddocumentsComponent, canActivate: [AuthGuard, RoleGuardService] },
      // { path: 'sprint', component: SprintTasksComponent }
      { path: 'taskboard-template', component: TaskboardConfigurationComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskboardRoutingModule { }
