import { NgModule } from '@angular/core';
import { YoroflowDesignComponent } from './designer.component';
import {  SharedModule } from '../shared-module/shared.module';
import { TaskFlowComponent } from './task-flow/task-flow.component';
import { TaskPropertyComponent } from './task-property/task-property.component';
import { CreateFormDialogComponent } from './create-form-dialog-box/create-form-dialog-box.component';
import { EnvironmentVariableDialogComponent } from './environment-variable-dialog/environment-variable-dialog.component';
import { ImportDialogComponent } from './import-dialog/import-dialog.component';
import { RemainderDialogComponent } from './remainder-dialog/remainder-dialog.component';

import { OpenFormDialogBoxComponent } from './open-form-dialog-box/open-form-dialog-box.component';

// tslint:disable-next-line:max-line-length
import { YoroSecurityComponent } from './yoro-security/yoro-security.component';
import { YoroFLowChipComponent } from './chip/yoroflow-chip.component';
//import { SnackbarComponent } from '../shared-module/snackbar/snackbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
// import { CreateFormDialogComponent } from './create-form-dialog-box/create-form-dialog-box.component';
import { MatDialogModule } from '@angular/material/dialog';
//import { BrowserModule } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRightSheetModule } from 'mat-right-sheet';
import { MaterialModule } from '../material/material.module';
import { YoroflowDesignRoutingModule } from './designer-routing.module';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationDialogBoxComponentComponent } from './confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTableModule } from '@angular/cdk/table';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxChartsModule } from '@swimlane/ngx-charts';
// tslint:disable-next-line:max-line-length
import { YoroFlowConfirmationDialogComponent } from './yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
// import { OpenFormDialogBoxComponent } from './open-form-dialog-box/open-form-dialog-box.component';
// import { EnvironmentVariableDialogComponent } from './environment-variable-dialog/environment-variable-dialog.component';
import { MatCardModule } from '@angular/material/card';
// import { YoroappsCreationModule } from 'yoroapps-creation';
// import { YoroappsRenderingModule, } from 'yoroapps-rendering-lib';
import { SignaturePadModule } from 'angular2-signaturepad';
import { TableCreationDialogBoxComponent } from './table-creation-dialog-box/table-creation-dialog-box.component';
// import { ImportDialogComponent } from './import-dialog/import-dialog.component';
// import { RemainderDialogComponent } from './remainder-dialog/remainder-dialog.component';
import { ReportConfigurationComponent } from './report-configuration/report-configuration.component';
import { YoroappsCreationModule } from '../creation-module/creation.module';
import { YoroappsRenderingModule } from '../rendering-module/rendering.module';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};
@NgModule({
  declarations: [
    YoroflowDesignComponent,
    TaskFlowComponent,
    TaskPropertyComponent,
    ImportDialogComponent,
    RemainderDialogComponent,
    EnvironmentVariableDialogComponent,
    CreateFormDialogComponent, 
   
    ConfirmationDialogBoxComponentComponent,
    YoroFLowChipComponent,
    YoroFlowConfirmationDialogComponent,
    YoroSecurityComponent,
   OpenFormDialogBoxComponent,
    TableCreationDialogBoxComponent,
    ReportConfigurationComponent
  ],
  imports: [
    // BrowserModule,
    YoroflowDesignRoutingModule,
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    FormsModule,
    SharedModule,
    NgxGraphModule,
    NgxChartsModule,
    DragDropModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatRightSheetModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    CdkTableModule,
    MatCardModule,
    SignaturePadModule,
    YoroappsCreationModule,
    YoroappsRenderingModule,
    PerfectScrollbarModule,
    QuillModule.forRoot(),
    TranslateModule,
  ],
  providers: [DatePipe,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    MatMenuModule,
    FormsModule,
    MaterialModule,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
  ],
  exports: [YoroflowDesignComponent, 
    
    ConfirmationDialogBoxComponentComponent,
    YoroFLowChipComponent,
    YoroFlowConfirmationDialogComponent,
    YoroSecurityComponent,
    TaskFlowComponent, 
    TaskPropertyComponent,
   // OpenFormDialogBoxComponent,
    //EnvironmentVariableDialogComponent,
    TableCreationDialogBoxComponent,
    TranslateModule,
   // ImportDialogComponent,
    //RemainderDialogComponent
  ],
  entryComponents: [YoroFLowChipComponent, 
    YoroFlowConfirmationDialogComponent,  YoroSecurityComponent,
     TableCreationDialogBoxComponent,ImportDialogComponent, RemainderDialogComponent, CreateFormDialogComponent
    ]
})
export class YoroflowDesignModule { }
