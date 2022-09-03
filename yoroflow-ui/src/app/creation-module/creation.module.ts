import { NgModule } from '@angular/core';
import { YoroappsCreationComponent } from './creation.component';
import { GridConfigurationComponent } from './grid-configuration/grid-configuration.component';
import { MenuConfigurationComponent } from './menu-configuration/menu-configuration.component';
import { MaterialModule } from '../material/material.module';

import { MenuComponent } from './menu/menu.component';
import { SharedModule } from '../shared-module/shared.module';
//import { YorogridComponent } from '../shared-module/yorogrid/yorogrid.component';
//import { SnackbarComponent } from '../shared-module/snackbar/snackbar.component';
import { ColumnComponent } from './column/column.component';
import { FormfieldComponent } from './formfield/formfield.component';
import { SectionComponent } from './section/section.component';
import { NestedSectionComponent } from './nested-section/nested-section.component';
import { ConfirmationDialogBoxComponentComponent } from './confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { RowDetailsComponent } from './row-details/row-details.component';
import { PageComponent } from './page/page.component';
import { FilterComponent } from './filter/filter.component';
import { FilterControlsComponent } from './filter-controls/filter-controls.component';
import { LoadControlsComponent } from './load-controls/load-controls.component';
//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatRightSheetModule } from 'mat-right-sheet';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { CKEditorModule } from 'ng2-ckeditor';
import { PageGridConfigurationComponent } from './page-grid-configuration/page-grid-configuration.component';
import { YoroappsCreationRoutingModule } from './creation-routing.module';
import { PageListComponent } from './page-list/page-list.component';
import { TableObjectsComponent } from './table-objects/table-objects.component';
import { YoroSecurityComponent } from './yoro-security/yoro-security.component';
import { CustomPagesComponent } from './custom-pages/custom-pages.component';
import { DynamicMenuTabComponent } from './dynamic-menu-tab/dynamic-menu-tab.component';
import { CreatePageComponent } from './create-page/create-page.component';
import { ApplicationLayoutPageComponent } from './application-layout-page/application-layout-page.component';
import { AppLayoutPageListComponent } from './app-layout-page-list/app-layout-page-list.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { QuillModule } from 'ngx-quill';
import { SignaturePadModule } from 'angular2-signaturepad';
import { UserProfileManagementComponent } from './user-profile-management/user-profile-management.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { UserManagementComponent } from './user-management/user-management.component';
import { ProfilePictureDialogBoxComponent } from './profile-picture-dialog-box/profile-picture-dialog-box.component';
import { CreateOrganizationComponent } from './create-organization/create-organization.component';
import { UploadLogoComponent } from './upload-logo/upload-logo.component';
import { LoadLogoComponent } from './load-logo/load-logo.component';
import { UpdateOrganizationComponent } from './update-organization/update-organization.component';
import { SectionSecurityComponent } from './section-security/section-security.component';
import { ApiKeyDialogBoxComponent } from './api-key-dialog-box/api-key-dialog-box.component';
import { UserCustomAttributesComponent } from './user-custom-attributes/user-custom-attributes.component';
import { OrgCustomAttributesComponent } from './org-custom-attributes/org-custom-attributes.component';
import { InviteUserComponent } from './invite-user/invite-user.component';
import { InactivateUserComponent } from './inactivate-user/inactivate-user.component';
import { ReactivateUserComponent } from './reactivate-user/reactivate-user.component';
import { TableComponent } from './table/table.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { TableControlValidationComponent } from './table-control-validation/table-control-validation.component';
import { UserUpdateOrganizationComponent } from './user-update-organization/user-update-organization.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ApplicationProvisionComponent } from './application-provision/application-provision.component';
import { WorkflowPageComponent } from './workflow-page/workflow-page.component';
import { WorkflowPageListComponent } from './workflow-page-list/workflow-page-list.component';
import { MatInputModule } from '@angular/material/input';
import { PrintConfigurationComponent } from './print-configuration/print-configuration.component';
import { PrintConfigurationPropertiesComponent } from './print-configuration-properties/print-configuration-properties.component';
import { SmsKeyGenerationComponent } from './sms-key-generation/sms-key-generation.component';
import { ImportDialogComponent } from './import-dialog/import-dialog.component';
import { PaymentProcessComponent } from './payment-process/payment-process.component';
import { ShoppingCardStepNameComponent } from './shopping-card-step-name/shopping-card-step-name.component';
import { ShoppingCartConfigurationComponent } from './shopping-cart-configuration/shopping-cart-configuration.component';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
//import { PaginatorComponent } from '../shared-module/paginator/paginator/paginator.component';
import { ResizableModule } from 'angular-resizable-element';
import { MaterialElevationDirective } from './shared/material-elevation';
import { GlobalPermissionComponent } from './global-permission/global-permission.component';
import { PaymentSettingsComponent } from './payment-settings/payment-settings.component';
import { FilterPipe } from './search-filter.pipe';
import { YoroappsRenderingModule } from '../rendering-module/rendering.module';
import { UserGroupAssociationComponent } from './user-group-association/user-group-association.component';
import { UserRoleAssociationComponent } from './user-role-association/user-role-association.component';
import { PageSettingsComponent } from './page-settings/page-settings.component';
import { EmailSettingDialogComponent } from './email-setting-dialog/email-setting-dialog.component';
import { SignaturedialogComponent } from './signaturedialog/signaturedialog.component';
import { CreditCardDirective } from './payment-process/credit-card.directive';
import { TextMaskModule } from 'angular2-text-mask';
import { FormErrorsComponent } from './form-errors/form-errors.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { SummaryReportComponent } from './summary-report/summary-report.component';
import { SummaryReportDialogComponent } from './summary-report-dialog/summary-report-dialog.component';
import { DataTableComponent } from './data-table/data-table.component';
import { DataTableDialogComponent } from './data-table-dialog/data-table-dialog.component';
import { ResizableDirective } from './resizable/resizable.directive';
import { ResizableComponent } from './resizable/resizable.component';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { ImportDataTableComponent } from './import-data-table/import-data-table.component';
import { DataTableteamComponent } from './data-tableteam/data-tableteam.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};
@NgModule({
  declarations: [YoroappsCreationComponent,
    GridConfigurationComponent,
    MenuConfigurationComponent,
    MenuComponent,
    //YorogridComponent,
    //  SnackbarComponent,
    ColumnComponent,
    FormfieldComponent,
    MenuConfigurationComponent,
    SectionComponent,
    NestedSectionComponent,
    ConfirmationDialogBoxComponentComponent,
    RowDetailsComponent,
    PageComponent,
    FilterComponent,
    FilterControlsComponent,
    LoadControlsComponent,
    PageGridConfigurationComponent,
    TableObjectsComponent,
    PageListComponent,
    YoroSecurityComponent,
    CustomPagesComponent,
    DynamicMenuTabComponent,
    CreatePageComponent,
    ApplicationLayoutPageComponent,
    AppLayoutPageListComponent,
    UserProfileManagementComponent,
    ChangePasswordComponent,
    UserManagementComponent,
    ProfilePictureDialogBoxComponent,
    CreateOrganizationComponent,
    UploadLogoComponent,
    LoadLogoComponent,
    UpdateOrganizationComponent,
    SectionSecurityComponent,
    ApiKeyDialogBoxComponent,
    UserCustomAttributesComponent,
    OrgCustomAttributesComponent,
    InviteUserComponent,
    InactivateUserComponent,
    ReactivateUserComponent,
    TableComponent,
    EmailTemplateComponent,
    TableControlValidationComponent,
    UserUpdateOrganizationComponent,
    ResetPasswordComponent,
    ApplicationProvisionComponent,
    WorkflowPageComponent,
    WorkflowPageListComponent,
    PrintConfigurationComponent,
    PrintConfigurationPropertiesComponent,
    SmsKeyGenerationComponent,
    ImportDialogComponent,
    PaymentProcessComponent,
    ShoppingCardStepNameComponent,
    ShoppingCartConfigurationComponent,
    //PaginatorComponent,
    MaterialElevationDirective,
    GlobalPermissionComponent,
    PaymentSettingsComponent,
    FilterPipe,
    UserRoleAssociationComponent,
    UserGroupAssociationComponent,
    PageSettingsComponent,
    EmailSettingDialogComponent,
    SignaturedialogComponent,

    CreditCardDirective,
    FormErrorsComponent,
    PaymentHistoryComponent,
    SummaryReportComponent,
    SummaryReportDialogComponent,
    DataTableComponent,
    DataTableDialogComponent,
    ResizableDirective,
    ResizableComponent,
    ImportDataTableComponent,
    DataTableteamComponent,
  ],
  imports: [
    TextMaskModule,
    //BrowserModule,
    FormsModule,
    //YorogridComponent,
    //PaginatorComponent,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MaterialModule,
    //BrowserAnimationsModule,
    HttpClientModule,
    FlexLayoutModule,
    MatRightSheetModule,
    // CKEditorModule,
    DragDropModule,
    YoroappsCreationRoutingModule,
    SignaturePadModule,
    ImageCropperModule,
    QuillModule.forRoot(),
    MatInputModule,
    PerfectScrollbarModule,
    ResizableModule,
    YoroappsRenderingModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule
  ], entryComponents: [
    // SnackbarComponent,
    PageSettingsComponent,
    ColumnComponent,
    FormfieldComponent,
    SectionComponent,
    NestedSectionComponent,
    ConfirmationDialogBoxComponentComponent,
    PageGridConfigurationComponent,
    YoroSecurityComponent,
    DynamicMenuTabComponent,
    ApplicationLayoutPageComponent,
    UserManagementComponent,
    ProfilePictureDialogBoxComponent,
    ApiKeyDialogBoxComponent,
    ImportDialogComponent,
  ],

  exports: [YoroappsCreationComponent,
    GridConfigurationComponent,
    MenuConfigurationComponent,
    MenuComponent,
    //YorogridComponent,
    // SnackbarComponent,
    ColumnComponent,
    FormfieldComponent,
    MenuConfigurationComponent,
    SectionComponent,
    NestedSectionComponent,
    ConfirmationDialogBoxComponentComponent,
    RowDetailsComponent,
    PageComponent,
    FilterComponent,
    FilterControlsComponent,
    LoadControlsComponent,
    PageGridConfigurationComponent,
    PageListComponent,
    YoroSecurityComponent,
    TableObjectsComponent,
    DynamicMenuTabComponent,
    CustomPagesComponent,
    ApplicationLayoutPageComponent,
    AppLayoutPageListComponent,
    UserManagementComponent,
    ProfilePictureDialogBoxComponent,
    UpdateOrganizationComponent,
    ApiKeyDialogBoxComponent,
    UserCustomAttributesComponent,
    EmailTemplateComponent,
    UserUpdateOrganizationComponent,
    WorkflowPageComponent,
    WorkflowPageListComponent,
    SmsKeyGenerationComponent,
    ShoppingCartConfigurationComponent,
    GlobalPermissionComponent,
    UserGroupAssociationComponent,
    PageSettingsComponent,
    CreateOrganizationComponent,
    PaymentProcessComponent,
    DataTableComponent
    //PaginatorComponent,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
  ]
})
export class YoroappsCreationModule { }
