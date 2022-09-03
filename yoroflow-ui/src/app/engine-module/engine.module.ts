import { NgModule } from '@angular/core';
import { YoroflowEngineComponent } from './engine.component';
import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree/ngx-graph-org-tree.component';
import { LineDrawComponent } from './line-draw/line-draw.component';
import { DialogComponent } from './dialog/dialog.component';
import { AddtaskComponent } from './board/addtask/addtask.component';
import { MenuComponent } from './menu/menu.component';
import { MyDoneTaskComponent } from './my-done-task/my-done-task.component';

import { ConfirmationDialogBoxComponentComponent } from './confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { YoroFlowConfirmationDialogComponent } from './yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { YoroFLowChipComponent } from './chip/yoroflow-chip.component';
import { WorkFlowDashboardComponent } from './work-flow-dashboard/work-flow-dashboard.component';
import { CreateFormDialogComponent } from './create-form-dialog-box/create-form-dialog-box.component';
import { OpenFormDialogBoxComponent } from './open-form-dialog-box/open-form-dialog-box.component';
import { MyLaunchedTaskComponent } from './my-launched-task/my-launched-task.component';
import { YoroSecurityComponent } from './yoro-security/yoro-security.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { AdhocTaskService } from './board/addtask/adhoc-task.service';
import { JwtInterceptor } from '../services/core/http/jwt-interceptor';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRightSheetModule } from 'mat-right-sheet';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTableModule } from '@angular/cdk/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MaterialModule } from '../material/material.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskComponent } from './task/task.component';
import { UserService } from './shared/service/user-service';
import { HighchartsChartModule } from 'highcharts-angular';
import { LandingPageComponent } from './landing-page/landing-page.component';
// import { YoroappsRenderingModule } from 'yoroapps-rendering-lib';
import { TableObjectComponent } from './table-object/table-object.component';
import { GroupComponent } from './group/group.component';
import { GenerateReportsComponent } from './generate-reports/generate-reports.component';
import { MytasksModule } from '../mytasks-module/mytasks.module';
import { ProcessInstanceListComponent } from './process-instance-list/process-instance-list.component';
import { ProcessInstanceTaskListComponent } from './process-instance-task-list/process-instance-task-list.component';
import { ProcessInstanceFailedListComponent } from './process-instance-failed-list/process-instance-failed-list.component';
import { ProcessInstanceRunningListComponent } from './process-instance-running-list/process-instance-running-list.component';
import { ProcessInstanceCompletedListComponent } from './process-instance-completed-list/process-instance-completed-list.component';
import { ProcessInstanceDialogComponentComponent } from './process-instance-dialog-component/process-instance-dialog-component.component';
import { ApplicationComponent } from './application/application.component';
import { AuthGuard } from '../services/core/authentication/auth-guard-service/auth.guard';
import { WorkflowItemsComponent } from './workflow-items/workflow-items.component';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { JwtHelperService, JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { SignaturePadModule } from 'angular2-signaturepad';
import { LoginInitialComponent } from './login-initial/login-initial.component';
import { MetricDataDetailsComponent } from './metric-data-details/metric-data-details.component';
import { PinnedWorkflowItemsComponent } from './pinned-workflow-items/pinned-workflow-items.component';
import { ErrorInstanceDialogComponent } from './error-instance-dialog/error-instance-dialog.component';
import { MarketPlaceComponent } from './market-place/market-place.component';
import {
  PerfectScrollbarModule, PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';
import { MglTimelineModule } from 'angular-mgl-timeline';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { QrSetupComponent } from './qr-setup/qr-setup.component';
import { ClipboardModule } from 'ngx-clipboard';
import { YoroflowEngineRoutingModule } from './engine-routing.module';
import { YoroappsCreationModule } from '../creation-module/creation.module';
import { YoroappsRenderingModule } from '../rendering-module/rendering.module';
import { MessageNotificationModule } from '../message-module/message-notification.module';

import { SharedModule } from '../shared-module/shared.module';
import { WorkflowdialogComponent } from './workflow-dialog/workflow-dialog.component';
import { TaskboardModule } from '../taskboard-module/taskboard.module';
import { CreateWorkflowComponent } from './create-workflow/create-workflow.component';
import { MaterialElevationDirective } from './shared/material-elevation';
import { WorkflowCommentsComponent } from './workflow-comments/workflow-comments.component';
import { TranslateModule } from '@ngx-translate/core';
import { AddTeamComponent } from './add-team/add-team.component';
import { AddWidgetComponent } from './add-widget/add-widget.component';
import { WorkspaceDashboardComponent } from './workspace-dashboard/workspace-dashboard.component';
import { WidgetPreviewComponent } from './widget-preview/widget-preview.component';
import { ReportGenerateComponent } from './report-generate/report-generate.component';
import { YoroflowDesignModule } from '../designer-module/designer.module';
import { DateFilterComponent } from './date-filter/date-filter.component';
import { TemplateCenterComponent } from './template-center/template-center.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};
const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 ||
  window.navigator.userAgent.indexOf("Trident/") > -1; // Remove this line to use Angular Universal

export function tokenGetter() {
  return localStorage.getItem('token');
}

export function getAuthScheme(request) {
  return 'Bearer ';
}

export function jwtOptionsFactory() {
  return {
    tokenGetter,
    authScheme: getAuthScheme,
  };
}



@NgModule({
  declarations: [
    YoroflowEngineComponent,
    NgxGraphOrgTreeComponent,
    LineDrawComponent,
    DialogComponent,
    AddtaskComponent,
    TaskComponent,
    MenuComponent,
    MyDoneTaskComponent,
    ConfirmationDialogBoxComponentComponent,
    YoroFlowConfirmationDialogComponent,
    YoroFLowChipComponent,
    WorkFlowDashboardComponent,
    CreateFormDialogComponent,
    OpenFormDialogBoxComponent,
    MyLaunchedTaskComponent,
    YoroSecurityComponent,
    DialogComponent,
    LandingPageComponent,
    TableObjectComponent,
    GroupComponent,
    GenerateReportsComponent,
    ProcessInstanceListComponent,
    ProcessInstanceTaskListComponent,
    ProcessInstanceFailedListComponent,
    ProcessInstanceRunningListComponent,
    ProcessInstanceCompletedListComponent,
    ProcessInstanceDialogComponentComponent,
    ApplicationComponent,
    WorkflowItemsComponent,
    LoginInitialComponent,
    MetricDataDetailsComponent,
    PinnedWorkflowItemsComponent,
    ErrorInstanceDialogComponent,
    MarketPlaceComponent,
    QrSetupComponent,
    WorkflowdialogComponent,
    CreateWorkflowComponent,
    MaterialElevationDirective,
    WorkflowCommentsComponent,
    AddTeamComponent,
    AddWidgetComponent,
    WorkspaceDashboardComponent,
    WidgetPreviewComponent,
    ReportGenerateComponent,
    DateFilterComponent,
    TemplateCenterComponent
  ],
  imports: [

    YoroappsCreationModule,
    SharedModule,
    YoroflowDesignModule,
    TaskboardModule,
    YoroappsRenderingModule,
    YoroflowEngineRoutingModule,
    NgxGraphModule,
    NgxChartsModule,
    DragDropModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatRightSheetModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
    HttpClientModule,
    CommonModule,
    CdkTableModule,
    HighchartsChartModule,
    MessageNotificationModule,
    RecaptchaModule,
    SignaturePadModule,
    PerfectScrollbarModule,
    ClipboardModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
      },
    }),
    MglTimelineModule,
    RecaptchaFormsModule,
    TranslateModule
  ],
  providers: [DatePipe, AdhocTaskService,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },


  ],
  exports: [
    YoroflowEngineComponent,
    NgxGraphOrgTreeComponent,
    LineDrawComponent,
    DialogComponent,

    AddtaskComponent,
    TaskComponent,


    MenuComponent,
    MyDoneTaskComponent,

    ConfirmationDialogBoxComponentComponent,
    YoroFlowConfirmationDialogComponent,
    YoroFLowChipComponent,
    WorkFlowDashboardComponent,
    CreateFormDialogComponent,
    OpenFormDialogBoxComponent,
    MyLaunchedTaskComponent,
    YoroSecurityComponent,
    LandingPageComponent,
    ApplicationComponent,
    GroupComponent,
    ProcessInstanceCompletedListComponent,
    ProcessInstanceFailedListComponent,
    ProcessInstanceRunningListComponent,
    ProcessInstanceTaskListComponent,
    GenerateReportsComponent,
    WorkflowItemsComponent,
    LoginInitialComponent,
    MetricDataDetailsComponent,
    TranslateModule
  ],
  bootstrap: [YoroflowEngineComponent],
  entryComponents: [DialogComponent, TaskComponent, YoroFLowChipComponent,
    ConfirmationDialogBoxComponentComponent, CreateFormDialogComponent, OpenFormDialogBoxComponent,
    YoroFlowConfirmationDialogComponent,
    YoroSecurityComponent, LandingPageComponent, ProcessInstanceDialogComponentComponent,
    GroupComponent,
    ProcessInstanceCompletedListComponent,
    ProcessInstanceFailedListComponent,
    ProcessInstanceRunningListComponent,
    ProcessInstanceTaskListComponent,
    GenerateReportsComponent,
    MetricDataDetailsComponent,
    ErrorInstanceDialogComponent,
    QrSetupComponent,
    WorkflowdialogComponent
  ]
})
export class YoroflowEngineModule { }
