import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyPendingTaskComponent } from './my-pending-task/my-pending-task.component';
import { YoroFlowConfirmationDialogComponent } from './yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { YoroappsCreationModule } from '../creation-module/creation.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MytasksComponent } from './mytasks/mytasks.component';
import {
  PerfectScrollbarModule, PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';
import { MytasksRoutingModule } from './mytasks-routing.module';
import { Routes, RouterModule } from '@angular/router';
import {  OpenFormDialogBoxComponent} from './open-form-dialog-box/open-form-dialog-box.component';
import { SharedModule }from '../shared-module/shared.module';
import {MatInputModule} from '@angular/material/input';
import { MySubmittedRequestsComponent } from './my-submitted-requests/my-submitted-requests.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';
import { MyRequestRoutingComponent } from './my-request-routing/my-request-routing.component';
import { DataTablePageComponent } from './data-table-page/data-table-page.component';


@NgModule({
  declarations: [
    MyPendingTaskComponent,
    YoroFlowConfirmationDialogComponent,
    MytasksComponent,
    OpenFormDialogBoxComponent, 
    MyRequestRoutingComponent, 
    MyRequestsComponent, 
    MySubmittedRequestsComponent, 
    DataTablePageComponent
  ],
  imports: [
    CommonModule,
    MytasksRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    YoroappsCreationModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    SharedModule,
    MatInputModule,
    YoroappsCreationModule
  ],
  exports: [RouterModule,MytasksComponent,OpenFormDialogBoxComponent,YoroFlowConfirmationDialogComponent,MatInputModule],
  entryComponents:[OpenFormDialogBoxComponent,YoroFlowConfirmationDialogComponent]

})
export class MytasksModule { }
