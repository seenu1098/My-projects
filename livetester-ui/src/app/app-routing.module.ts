import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClaimsComponent } from './claims/claims.component';
import { CreateTemplateComponent } from './create-template/create-template.component';
import { ListTemplatesComponent } from './list-templates/list-templates.component';
import { ListclaimsComponent } from './list-claims/list-claims.component';
import { CreateTestgroupComponent } from './create-testgroup/create-testgroup.component';
import { ListTestGroupsComponent } from './list-test-groups/list-test-groups.component';
import { EnvironmentComponent } from './environment/environment.component';
import { TestcaseGroupListComponent } from './testcase-groups-list/testcase-groups-list.component';
import { ClaimTypeComponent } from './claim-type/claim-type.component';
import { ExpectedElementsConfigurationComponent } from './expected-elements-configuration/expected-elements-configuration.component';
import { TestCaseExecutionResultsComponent } from './test-case-execution-results/test-case-execution-results.component';
import { BatchTestcaseResultComponent } from './batch-testcase-result/batch-testcase-result.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AuthGuard } from '../shared/auth-guard-service/auth.guard';
import { LookupDataComponent } from './lookup-data/lookup-data.component';
import { SignupComponent } from './signup/signup.component';
import { UserListComponent } from './user-list/user-list.component';
import { BatchReportComponent } from './batch-report/batch-report.component';
import { FormTypeBasedReportComponent } from './form-type-based-report/form-type-based-report.component';
import { DayBasedReportComponent } from './day-based-report/day-based-report.component';
import { BeneficiaryPresetComponent } from './beneficiary-preset/beneficiary-preset.component';
import { ProviderPresetComponent } from './provider-preset/provider-preset.component';
import { PaPresetComponent } from './payor-preset/payor-preset.component';
import { PaEnvironmentPresetComponent } from './pa-environment-preset/pa-environment-preset.component';


const routes: Routes = [
  { path: 'create-template', component: CreateTemplateComponent, canActivate: [AuthGuard] },
  { path: 'list-template', component: ListTemplatesComponent, canActivate: [AuthGuard] },
  { path: 'create-claims', component: ClaimsComponent, canActivate: [AuthGuard] },
  { path: 'create-claims/:id', component: ClaimsComponent, canActivate: [AuthGuard] },
  { path: 'list-claims', component: ListclaimsComponent, canActivate: [AuthGuard] },
  { path: 'create-testgroup', component: CreateTestgroupComponent, canActivate: [AuthGuard] },
  { path: 'list-testgroups', component: ListTestGroupsComponent, canActivate: [AuthGuard] },
  { path: 'environment', component: EnvironmentComponent, canActivate: [AuthGuard] },
  { path: 'execution', component: TestcaseGroupListComponent, canActivate: [AuthGuard] },
  { path: 'execution/:name', component: TestcaseGroupListComponent, canActivate: [AuthGuard] },
  { path: 'claim_type', component: ClaimTypeComponent, canActivate: [AuthGuard] },
  { path: 'element-configuration', component: ExpectedElementsConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'testcase-results', component: TestCaseExecutionResultsComponent, canActivate: [AuthGuard] },
  { path: 'result', component: BatchTestcaseResultComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: '', component: LoginComponent },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'lookup-data', component: LookupDataComponent, canActivate: [AuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [AuthGuard] },
  { path: 'user-list', component: UserListComponent, canActivate: [AuthGuard] },
  { path: 'batch-report', component: BatchReportComponent, canActivate: [AuthGuard] },
  { path: 'formtype-based-report', component: FormTypeBasedReportComponent, canActivate: [AuthGuard] },
  { path: 'day-based-report', component: DayBasedReportComponent, canActivate: [AuthGuard] },
  { path: 'beneficiary-preset', component: BeneficiaryPresetComponent, canActivate: [AuthGuard] },
  { path: 'provider-preset', component: ProviderPresetComponent, canActivate: [AuthGuard] },
  { path: 'payor-preset', component: PaPresetComponent, canActivate: [AuthGuard] },
  { path: 'pa-preset', component: PaEnvironmentPresetComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routingComponents = [CreateTemplateComponent, ClaimsComponent, ListclaimsComponent
  , CreateTestgroupComponent, ListTestGroupsComponent, TestcaseGroupListComponent, EnvironmentComponent
  , ClaimTypeComponent, TestCaseExecutionResultsComponent, BatchTestcaseResultComponent, DayBasedReportComponent
  , LookupDataComponent, SignupComponent, UserListComponent, BatchReportComponent,
  FormTypeBasedReportComponent, BeneficiaryPresetComponent, ProviderPresetComponent, PaPresetComponent
  , PaEnvironmentPresetComponent];

