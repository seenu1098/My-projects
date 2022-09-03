import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { CreateDialogComponent } from './create-dialog/create-dialog.component';
import { AuthGuard } from '../services/core/authentication/auth-guard-service/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'create', component: CreateComponent, canActivate: [AuthGuard]},
      { path: 'add', component: CreateDialogComponent, canActivate: [AuthGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
