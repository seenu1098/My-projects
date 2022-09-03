import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import 'hammerjs';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ClaimsComponent } from './claims/claims.component';
import { CreateTemplateComponent } from './create-template/create-template.component';
import { ListTemplatesComponent } from './list-templates/list-templates.component';
import { ListclaimsComponent } from './list-claims/list-claims.component';
import { CreateTestgroupComponent } from './create-testgroup/create-testgroup.component';
import { ListTestGroupsComponent } from './list-test-groups/list-test-groups.component';

import { EnvironmentComponent } from './environment/environment.component';
import { LivetestService } from '../shared/service/livetest.service';
import { TestcaseGroupListComponent } from './testcase-groups-list/testcase-groups-list.component';
import { ClaimTypeComponent } from './claim-type/claim-type.component';
import { MAT_CHECKBOX_CLICK_ACTION } from '@angular/material/checkbox';
import { SnackBarComponent } from './snack-bar/snack-bar.component';
import { ExpectedElementsConfigurationComponent } from './expected-elements-configuration/expected-elements-configuration.component';
import { YorogridComponent } from './yorogrid/yorogrid.component';
import { ClaimDetailsDialogBoxComponent } from './claim-details-dialog-box/claim-details-dialog-box.component';
import { TestCaseExecutionResultsComponent } from './test-case-execution-results/test-case-execution-results.component';
import { LoginComponent } from './login/login.component';
import { ConfirmationDialogBoxComponent } from './confirmation-dialog-box/confirmation-dialog-box.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UserService } from '../shared/service/user-service';
import { JwtInterceptor } from '../shared/interceptor/jwt-interceptor';
import { ErrorInterceptor } from '../shared/interceptor/error-interceptor';
import { LookupDataComponent } from './lookup-data/lookup-data.component';
import { ValidationPassword } from './change-password/validation-for-change-password';
import { SignupComponent } from './signup/signup.component';
import { UserListComponent } from './user-list/user-list.component';
import { BatchReportComponent } from './batch-report/batch-report.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { FormTypeBasedReportComponent } from './form-type-based-report/form-type-based-report.component';
import { DayBasedReportComponent } from './day-based-report/day-based-report.component';
import { ReplacementOptionExecuteComponent } from './replacement-option-execute/replacement-option-execute.component';
import { BeneficiaryPresetComponent } from './beneficiary-preset/beneficiary-preset.component';
import { ProviderPresetComponent } from './provider-preset/provider-preset.component';
import { PaPresetComponent } from './payor-preset/payor-preset.component';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher,  MatBottomSheetModule  } from '@angular/material';
import { PaEnvironmentPresetComponent } from './pa-environment-preset/pa-environment-preset.component';
import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
import exporting from 'highcharts/modules/exporting.src.js';
import { LoaderInterceptor } from 'src/shared/loader/loader.interceptor';
import { LoaderService } from 'src/shared/loader/loader.service';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { LoaderComponent } from 'src/shared/loader/loader.component';
import { MatRightSheetModule } from 'mat-right-sheet';
import { FooterComponent } from './footer/footer.component';
import { PrintTestResultsDialogComponent } from './print-test-results-dialog/print-test-results-dialog.component';
import { BatchTestcaseComponent } from './batch-testcase/batch-testcase.component';
import { BatchTestcaseResultComponent } from './batch-testcase-result/batch-testcase-result.component';

export function highchartsModules() {
  return [exporting];
}
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ClaimsComponent,
    CreateTemplateComponent,
    ListTemplatesComponent,
    routingComponents,
    ListclaimsComponent,
    CreateTestgroupComponent,
    ListTestGroupsComponent,
    ValidationPassword,
    EnvironmentComponent,
    TestcaseGroupListComponent,
    ClaimTypeComponent,
    SnackBarComponent,
    ExpectedElementsConfigurationComponent,
    YorogridComponent,
    ClaimDetailsDialogBoxComponent,
    TestCaseExecutionResultsComponent,
    LoginComponent,
    ConfirmationDialogBoxComponent,
    ChangePasswordComponent,
    LookupDataComponent,
    SignupComponent,
    UserListComponent,
    BatchReportComponent,
    FormTypeBasedReportComponent,
    DayBasedReportComponent,
    ReplacementOptionExecuteComponent,
    BeneficiaryPresetComponent,
    ProviderPresetComponent,
    PaPresetComponent,
    PaEnvironmentPresetComponent,
    LoaderComponent,
    FooterComponent,
    PrintTestResultsDialogComponent,
    BatchTestcaseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    MatIconModule,
    HttpClientModule,
    HighchartsChartModule,
    ChartModule,
    MatBottomSheetModule,
    NgxMaterialTimepickerModule,
    MatRightSheetModule
  ],
  entryComponents: [ClaimDetailsDialogBoxComponent, SnackBarComponent,
    ConfirmationDialogBoxComponent, ReplacementOptionExecuteComponent, PrintTestResultsDialogComponent , 
    BatchTestcaseComponent , BatchTestcaseResultComponent],
  providers: [LivetestService, DatePipe, UserService,
    { provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'check' },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    { provide: HIGHCHARTS_MODULES, useFactory: highchartsModules },
    LoaderService, { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
