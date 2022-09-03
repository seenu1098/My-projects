import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TaskboardConfigurationComponent } from './taskboard-configuration/taskboard-configuration.component';
import { TaskboardFormDetailsComponent } from './taskboard-form-details/taskboard-form-details.component';
//import { UppyComponentComponent } from '../shared-module/uppy-component/uppy-component.component';
import { LabelsDialogComponent } from './labels-dialog/labels-dialog.component';
import { AssigntaskDialogComponent } from './assigntask-dialog/assigntask-dialog.component';
import { TaskboardRoutingModule } from './taskboard-routing.module';
import { TaskboardConfigurationDialogComponent } from './taskboard-configuration-dialog/taskboard-configuration-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CdkTableModule } from '@angular/cdk/table';
import {
  PerfectScrollbarModule, PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';
import { DragDropModule } from '@angular/cdk/drag-drop';
//import { YoroflowDesignModule } from '../designer-module/designer.module';
import { TaskboardSecurityComponent } from './taskboard-security/taskboard-security.component';
import { TaskboardOwnerDialogComponent } from './taskboard-owner-dialog/taskboard-owner-dialog.component';
import { EventAutomationComponent } from './event-automation/event-automation.component';
import { AutomationStatusComponent } from './shared/automation-status/automation-status.component';
import { AutomationLabelComponent } from './shared/automation-label/automation-label.component';
import { AutomationAssignedUserComponent } from './shared/automation-assigned-user/automation-assigned-user.component';
import { DebounceDirective } from './taskboard-form-details/debounce.directive';
import { DialogviewComponent } from './dialog-view/dialog-view.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared-module/shared.module';
import { YoroappsRenderingModule } from '../rendering-module/rendering.module';
import { ScrollableDirective } from './taskboard-configuration/scrollable.directive';

import { ConfirmationDialogComponent } from './yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { IntegrationDialogComponent } from './integration-dialog/integration-dialog.component';
import { YoroappsCreationModule } from '../creation-module/creation.module';
import { SubStatusDialogComponent } from './sub-status-dialog/sub-status-dialog.component';
import { DragconfirmComponent } from './dragconfirm/dragconfirm.component';
import { TaskFieldComponent } from './shared/task-field/task-field.component';
import { SubStatusComponent } from './sub-status/sub-status.component';
import { AutomationTaskboardComponent } from './shared/automation-taskboard/automation-taskboard.component';
import { DateDialogComponent } from './shared/date-dialog/date-dialog.component';
import { ApplicationConfigurationComponent } from './application-configuration/application-configuration.component';
import { AutomationAppIntegrationComponent } from './shared/automation-app-integration/automation-app-integration.component';
import { IntegrateApplicationComponent } from './integrate-application/integrate-application.component';
import { MaterialElevationDirective } from './shared/material-elevation';
import { EmailServerComponent } from './shared/email-server/email-server.component';
import { AutomationMailColumnComponent } from './shared/automation-mail-column/automation-mail-column.component';
import { AutomationSubjectComponent } from './shared/automation-subject/automation-subject.component';
import { TaskCommentsComponent } from './task-comments/task-comments.component';
import { TaskboarddocumentsComponent } from './taskboard-documents/taskboard-documents.component';
import { AutomationQuillEditorComponent } from './shared/automation-quill-editor/automation-quill-editor.component';
import { QuillModule } from 'ngx-quill';
import { GridViewTaskComponent } from './grid-view-task/grid-view-task.component';
import { TranslateModule } from '@ngx-translate/core';
import { ListViewTaskComponent } from './list-view-task/list-view-task.component';
import { DependencyDialogComponent } from './dependency-dialog/dependency-dialog.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TemplateDialogComponent } from './template-dialog/template-dialog.component';
import { AutomationOutlookIntegrationComponent } from './shared/automation-outlook-integration/automation-outlook-integration.component';
import { AutomationDateTimeComponent } from './shared/automation-date-time/automation-date-time.component';
import { AutomationLocationComponent } from './shared/automation-location/automation-location.component';
import { NgxMatDateAdapter, NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';
import { CustomDateAdapter } from '../creation-module/table/custom-date-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { SprintDialogComponent } from './sprint-dialog/sprint-dialog.component';
import { AddSprintComponent } from './add-sprint/add-sprint.component';
import { SprintTasksComponent } from './sprint-tasks/sprint-tasks.component';
import { WorkLogDialogComponent } from './work-log-dialog/work-log-dialog.component';
import { WorkLogListComponent } from './work-log-list/work-log-list.component';
import { LaunchTaskboardDialogComponent } from './launch-taskboard-dialog/launch-taskboard-dialog.component';
import { AutomationFieldValueComponent } from './shared/automation-field-value/automation-field-value.component';
import { AutomationDataTableComponent } from './shared/automation-data-table/automation-data-table.component';
import { TaskboardFormDetailsService } from './taskboard-form-details/taskboard-form-details.service';
import { SharedRoutingModule } from '../shared-module/shared-routing.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};

@NgModule({
  imports: [
    // YoroflowDesignModule,
    PerfectScrollbarModule,
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    FormsModule,
    TaskboardRoutingModule,
    DragDropModule,
    YoroappsRenderingModule,
    SharedModule,
    YoroappsCreationModule,
    QuillModule.forRoot(),
    TranslateModule,
    GoogleChartsModule.forRoot(),
    InfiniteScrollModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatMomentModule,
    ScrollingModule
  ],
  declarations: [
    TaskboardConfigurationComponent,
    MaterialElevationDirective,
    TaskboardFormDetailsComponent,
    DebounceDirective,
    //  UppyComponentComponent, 
    AssigntaskDialogComponent,
    LabelsDialogComponent,
    TaskboardConfigurationDialogComponent,
    TaskboardSecurityComponent,
    TaskboardOwnerDialogComponent,
    EventAutomationComponent,
    AutomationStatusComponent,
    AutomationLabelComponent,
    AutomationAssignedUserComponent,
    DialogviewComponent,
    TaskboardOwnerDialogComponent,
    ConfirmationDialogComponent,
    ScrollableDirective,
    IntegrationDialogComponent,
    SubStatusDialogComponent,
    DragconfirmComponent,
    TaskFieldComponent,
    SubStatusComponent,
    AutomationTaskboardComponent,
    DateDialogComponent,
    ApplicationConfigurationComponent,
    AutomationAppIntegrationComponent,
    IntegrateApplicationComponent,
    EmailServerComponent,
    AutomationMailColumnComponent,
    AutomationSubjectComponent,
    TaskCommentsComponent,
    TaskboarddocumentsComponent,
    AutomationQuillEditorComponent,
    GridViewTaskComponent,
    ListViewTaskComponent,
    DependencyDialogComponent,
    TemplateDialogComponent,
    AutomationOutlookIntegrationComponent,
    AutomationDateTimeComponent,
    AutomationLocationComponent,
    SprintDialogComponent,
    AddSprintComponent,
    SprintTasksComponent,
    WorkLogDialogComponent,
    WorkLogListComponent,
    LaunchTaskboardDialogComponent,
    AutomationFieldValueComponent,
    AutomationDataTableComponent,
  ],
  exports: [
    RouterModule,
    // UppyComponentComponent,
    DialogviewComponent,
    TaskboardConfigurationDialogComponent,
    TaskboardFormDetailsComponent,
    DragconfirmComponent,
    TranslateModule,
    TaskboardFormDetailsComponent
  ],
  entryComponents: [
    AssigntaskDialogComponent,
    LabelsDialogComponent,
    TaskboardConfigurationDialogComponent,
    DialogviewComponent,
    DragconfirmComponent,
    TaskboardFormDetailsComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    // {
    //   provide: NgxMatDateAdapter,
    //   useClass: CustomDateAdapter,
    //   deps: [MAT_DATE_LOCALE, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    // }
  ]

})
export class TaskboardModule { }

