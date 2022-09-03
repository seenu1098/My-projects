import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../services/core/authentication/auth-guard-service/auth.guard';
import { RoleGuardService } from '../services/core/authentication/role-guard-service/role-guard.service';
import { MyPendingTaskComponent } from './my-pending-task/my-pending-task.component';
import { MyRequestRoutingComponent } from './my-request-routing/my-request-routing.component';
import { MytasksComponent } from './mytasks/mytasks.component';

const routes: Routes = [
  { path: 'my-pending-task', component: MyRequestRoutingComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'my-pending-task/:id', component: MyRequestRoutingComponent, canActivate: [AuthGuard, RoleGuardService] },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MytasksRoutingModule { }
