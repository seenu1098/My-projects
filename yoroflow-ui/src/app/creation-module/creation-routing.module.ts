import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GridConfigurationComponent } from './grid-configuration/grid-configuration.component';
import { MenuConfigurationComponent } from './menu-configuration/menu-configuration.component';
import { PageComponent } from './page/page.component';
import { PageListComponent } from './page-list/page-list.component';
import { TableObjectsComponent } from './table-objects/table-objects.component';
import { CustomPagesComponent } from './custom-pages/custom-pages.component';
import { ApplicationLayoutPageComponent } from './application-layout-page/application-layout-page.component';
import { UserProfileManagementComponent } from './user-profile-management/user-profile-management.component';
import { CreateOrganizationComponent } from './create-organization/create-organization.component';
import { AuthGuard } from '../services/core/authentication/auth-guard-service/auth.guard';
import { DeactivateGuardService } from '../engine-module/shared/service/deactivate-guard-service/deactivate-guard.service';
import { RoleGuardService } from '../services/core/authentication/role-guard-service/role-guard.service';
import { UserManagementComponent } from './user-management/user-management.component';
import { AppLayoutPageListComponent } from './app-layout-page-list/app-layout-page-list.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UpdateOrganizationComponent } from './update-organization/update-organization.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { UserUpdateOrganizationComponent } from './user-update-organization/user-update-organization.component';
import { WorkflowPageListComponent } from './workflow-page-list/workflow-page-list.component';
import { WorkflowPageComponent } from './workflow-page/workflow-page.component';
import { PaymentProcessComponent } from './payment-process/payment-process.component';
import { ShoppingCartConfigurationComponent } from './shopping-cart-configuration/shopping-cart-configuration.component';
import { ApplicationComponent } from '../engine-module/application/application.component';
import { ComponentCanDeactivate } from '../services/core/authentication/component-can-deactivate';
import { CanDeactivateGuard } from '../services/core/authentication/authentication.guard.deactivate';
import { UserRoleAssociationComponent } from './user-role-association/user-role-association.component';
import { UserGroupAssociationComponent } from './user-group-association/user-group-association.component';
import { PaymentSettingsComponent } from './payment-settings/payment-settings.component';
import { DataTableComponent } from './data-table/data-table.component';


const routes: Routes = [
  // {
  //   path: '', component: ApplicationComponent, canActivate: [AuthGuard], children: [
  { path: 'user-role-association', component: UserRoleAssociationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'user-group-association', component: UserGroupAssociationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'subscription', component: CreateOrganizationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'payment-settings', component: PaymentSettingsComponent, canActivate: [AuthGuard, RoleGuardService] },

  { path: 'grid-config', component: GridConfigurationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'menu-config', component: MenuConfigurationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/custom-page', component: CustomPagesComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/create/page', component: PageComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/page-list', component: PageListComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/get/page/:id', component: PageComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'data-table-list', component: TableObjectsComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'data-table/:id', component: DataTableComponent, canActivate: [AuthGuard] },
  { path: 'user-profile', component: UserProfileManagementComponent },
  { path: 'create-org', component: CreateOrganizationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'grid-config', component: GridConfigurationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'menu-config', component: MenuConfigurationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/create/page', component: PageComponent, canActivate: [AuthGuard, RoleGuardService],
   canDeactivate: [DeactivateGuardService] },
  { path: ':workspace/page-list', component: PageListComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/get/page/:id', component: PageComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/get/workflow-page/:id', component: PageComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/custom-page', component: CustomPagesComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/app-layout', component: ApplicationLayoutPageComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/get/app-layout-page/:id', component: ApplicationLayoutPageComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/app-layout-page-list', component: AppLayoutPageListComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'user-profile', component: UserProfileManagementComponent, canActivate: [AuthGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'create-org', component: CreateOrganizationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'update-org', component: UpdateOrganizationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'update-organization', component: UpdateOrganizationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'email-template', component: EmailTemplateComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'user-update-org', component: UserUpdateOrganizationComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/workflow-page', component: WorkflowPageComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: ':workspace/workflow-page-list', component: WorkflowPageListComponent, canActivate: [AuthGuard, RoleGuardService] },
  { path: 'payment-process', component: PaymentProcessComponent },
  { path: ':workspace/shopping-cart', component: ShoppingCartConfigurationComponent, canActivate: [AuthGuard, RoleGuardService] }
  //   ]
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class YoroappsCreationRoutingModule { }
