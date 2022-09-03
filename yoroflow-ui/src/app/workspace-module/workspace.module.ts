import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { CreateComponent } from './create/create.component';
import { SharedModule } from '../shared-module/shared.module';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CreateDialogComponent } from './create-dialog/create-dialog.component';
import { TeamListComponent } from './team-list/team-list.component';

import {
  PerfectScrollbarModule, PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EditTeamsComponent } from './edit-teams/edit-teams.component';
import { EditAvatarComponent } from './edit-avatar/edit-avatar.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};
@NgModule({
  declarations: [
    CreateComponent,
    CreateDialogComponent,
    TeamListComponent,
    ConfirmationDialogComponent,
    EditTeamsComponent,
    EditAvatarComponent
  ],
  imports: [
    CommonModule,
    WorkspaceRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    PerfectScrollbarModule,
    FlexLayoutModule
  ],
  exports: [
    TeamListComponent,
    CreateDialogComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
  ]
})
export class WorkspaceModule { }
