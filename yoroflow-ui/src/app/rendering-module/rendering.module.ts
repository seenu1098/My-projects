import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { ApplicationDialogBoxComponent } from './application-dialog-box/application-dialog-box.component';
import { ApplicationProvisionComponent } from './application-provision/application-provision.component';
import { DynamicDialogComponent } from './dynamic-dialog/dynamic-dialog.component';
import { DynamicSideNavBarComponent } from './dynamic-side-nav-bar/dynamic-side-nav-bar.component';
import { LoadLogoComponent } from './load-logo/load-logo.component';
import { DynamicHeaderComponent } from './dynamic-header/dynamic-header.component';
import { DynamicMenuComponent } from './dynamic-menu/dynamic-menu.component';
import { ApplicationLauncherComponent } from './application-launcher/application-launcher.component';
import { TestComponent } from './test/test.component';
import { InputComponent } from './shared/components/input/input.component';
import { ButtonComponent } from './shared/components/button/button.component';
import { SelectComponent } from './shared/components/select/select.component';
import { DateComponent } from './shared/components/date/date.component';
import { RadiobuttonComponent } from './shared/components/radiobutton/radiobutton.component';
import { CheckboxComponent } from './shared/components/checkbox/checkbox.component';
import { DynamicFormComponent } from './shared/components/dynamic-form/dynamic-form.component';
import { TextAreaComponent } from './shared/components/text-area/text-area.component';
import { MultipleSelectionComponent } from './shared/components/multiple-selection/multiple-selection.component';
import { GridComponent } from './shared/components/grid/grid.component';
import { ChipComponent } from './shared/components/chip/chip.component';
import { DynamicFieldDirective } from './shared/components/dynamic-field/dynamic-field.directive';
import { DynamicSectionComponent } from './shared/components/dynamic-section/dynamic-section.component';
import { DynamicRowsComponent } from './shared/components/dynamic-rows/dynamic-rows.component';
import { DynamicCardSectionComponent } from './shared/components/dynamic-card-section/dynamic-card-section.component';
import { DynamicCollapsibleSectionComponent } from './shared/components/dynamic-collapsible-section/dynamic-collapsible-section.component';
import { DynamicArrayComponent } from './shared/components/dynamic-array/dynamic-array.component';
import { DynamicPageComponent } from './shared/components/dynamic-page/dynamic-page.component';
import { LabelComponent } from './shared/components/label/label.component';
import { DividerComponent } from './shared/components/divider/divider.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WarningComponent } from './warning/warning.component';
import { ParagraphComponent } from './shared/components/paragraph/paragraph .component';
import { UploadLogoComponent } from './upload-logo/upload-logo.component';
import { TestPageComponent } from './test-page/test-page.component';
import { HeaderComponent } from './header/header.component';
//import { BrowserModule } from '@angular/platform-browser';
import { YoroappsRenderingLibRoutingModule } from './rendering-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatRightSheetModule } from 'mat-right-sheet';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DynamicRightSheetComponent } from './dynamic-right-sheet/dynamic-right-sheet.component';
import { YoroSecurityComponent } from './yoro-security/yoro-security.component';
//import { SnackbarComponent } from './../shared-module/snackbar/snackbar.component';
import { AutoCompleteComponent } from './shared/components/auto-complete/auto-complete.component';
import { ApplicationRightSheetComponent } from './application-right-sheet/application-right-sheet.component';
import { RenderingConfirmDialogBoxComponent } from './rendering-confirm-dialog-box-component/rendering-confirm-dialog-box-component.component';
import { DynamicMenuTabComponent } from './dynamic-menu-tab/dynamic-menu-tab.component';
import { TabbedMenuComponent } from './shared/components/tabbed-menu/tabbed-menu.component';
import { LoadFormComponent } from './load-form/load-form.component';
import { FileUploadComponent } from './shared/components/file-upload/file-upload.component';
import { HyperLinkComponent } from './shared/components/hyper-link/hyper-link.component';
import { ErrorInterceptor } from '../services/core/http/error-interceptor';
import { ApplicationComponent } from './application/application.component';
import { LoaderService } from './shared/service/form-service/loader-service';
import { LoaderInterceptor } from './shared/interceptor/loder-interceptor';
import { MessageNotificationSnackbarComponent } from './message-notification-snackbar/message-notification-snackbar.component';
import { UserPermissionComponent } from './user-permission/user-permission.component';
import { EmbeddedPageComponent } from './shared/components/embedded-page/embedded-page.component';
import { AppLayoutPageComponent } from './shared/components/app-layout-page/app-layout-page.component';
import { PasswordComponent } from './shared/components/password/password.component';
import { LoadLogoService } from './shared/service/load-logo.service';
import { SignaturePadModule } from 'angular2-signaturepad';
import { SignatureComponent } from './shared/components/signature/signature.component';
import { ExportToPdfComponent } from './shared/components/export-to-pdf/export-to-pdf.component';
import { TableComponent } from './shared/components/table/table.component';
import { RecaptchaModule } from 'ng-recaptcha';
import { ImageComponent } from './shared/components/image/image-component';
import { PublicFormComponent } from './public-form/public-form.component';
import { ImageGridComponent } from './shared/components/image-grid/image-grid.component';
import { ImageRenderDialogComponent } from './image-render-dialog/image-render-dialog.component';
import { CardComponent } from './shared/components/card/card.component';
import { ShoppingCardComponent } from './shared/components/shopping-card/shopping-card.component';
import { CurrencyPipe } from '@angular/common';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { MatListModule } from '@angular/material/list';
import { NavService } from "./shared/service/nav.service";
import { MenuListItemComponent } from './menu-list-item/menu-list-item.component';
import { MaterialElevationDirective } from './shared/material-elevation';
//import { PaginatorComponent } from '../shared-module/paginator/paginator/paginator.component';
import { MessageNotificationModule } from '../message-module/message-notification.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared-module/shared.module';
import { DebounceDirective } from './application-provision/debounce.directive';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { CurrencyComponent } from './shared/components/currency/currency.component';
import { TooltipModule } from 'ng2-tooltip-directive';
import { UserDetailsDialogComponent } from './user-details-dialog/user-details-dialog.component';
import { ThemeDialogComponent } from './theme-dialog/theme-dialog.component';
import { DateTimeComponent } from './shared/components/date-time/date-time.component';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { UserFieldComponent } from './shared/components/user-field/user-field.component';
import {GuidedTourModule, GuidedTourService} from 'ngx-guided-tour';
import { DynamicSideNavBarService } from './dynamic-side-nav-bar/dynamic-side-nav-bar.service';
import {MatMenuModule} from '@angular/material/menu';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};


@NgModule({
  declarations: [
    DebounceDirective,
    TestComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    DynamicFormComponent,
    TextAreaComponent,
    MultipleSelectionComponent,
    GridComponent,
    ChipComponent,
    DynamicFieldDirective,
    DynamicSectionComponent,
    DynamicRowsComponent,
    DynamicMenuComponent,
    DynamicCardSectionComponent,
    DynamicCollapsibleSectionComponent,
    DynamicArrayComponent,
    ApplicationProvisionComponent,
    DynamicPageComponent,
    LabelComponent,
    TabbedMenuComponent,
    //LoginComponent,
    DividerComponent,
    DashboardComponent,
    WarningComponent,
    ParagraphComponent,
    LoadLogoComponent,
    UploadLogoComponent,
    TestPageComponent,
    HeaderComponent,
    ApplicationLauncherComponent,
    DynamicHeaderComponent,
    DynamicSideNavBarComponent,
    DynamicDialogComponent,
    DynamicRightSheetComponent,
    ApplicationDialogBoxComponent,
    YoroSecurityComponent,
  //  SnackbarComponent,
    AutoCompleteComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    DynamicFormComponent,
    TextAreaComponent,
    MultipleSelectionComponent,
    GridComponent,
    ChipComponent,
    DynamicFieldDirective,
    DynamicSectionComponent,
    DynamicRowsComponent,
    DynamicMenuComponent,
    DynamicCardSectionComponent,
    DynamicCollapsibleSectionComponent,
    DynamicArrayComponent,
    ApplicationRightSheetComponent,
    RenderingConfirmDialogBoxComponent,
    DynamicMenuTabComponent,
    LoadFormComponent,
    FileUploadComponent,
    HyperLinkComponent,
    ApplicationComponent,
    MessageNotificationSnackbarComponent,
    UserPermissionComponent,
    EmbeddedPageComponent,
    AppLayoutPageComponent,
    PasswordComponent,
    SignatureComponent,
    ExportToPdfComponent,
    TableComponent,
    ImageComponent,
    PublicFormComponent,
    ImageGridComponent,
    ImageRenderDialogComponent,
    CardComponent,
    ShoppingCardComponent,
    MenuListItemComponent,
    MaterialElevationDirective,
    CurrencyComponent,
    UserDetailsDialogComponent,
    ThemeDialogComponent,
    DateTimeComponent,
    UserFieldComponent,
    //PaginatorComponent
  ],
  entryComponents: [
    TestComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    DynamicFormComponent,
    TextAreaComponent,
    MultipleSelectionComponent,
    GridComponent,
    ChipComponent,
    DynamicSectionComponent,
    FileUploadComponent,
    DynamicRowsComponent,
    DynamicCardSectionComponent,
    DynamicCollapsibleSectionComponent,
    DynamicArrayComponent,
    ParagraphComponent,
    TestComponent,
    DynamicRowsComponent,
    DynamicPageComponent,
    LabelComponent,
    DividerComponent,
   // SnackbarComponent,
    DynamicRightSheetComponent,
    DynamicDialogComponent,
    DynamicMenuTabComponent,
    TabbedMenuComponent,
    AutoCompleteComponent,
    RenderingConfirmDialogBoxComponent,
    HyperLinkComponent,
    ApplicationComponent,
    EmbeddedPageComponent,
    AppLayoutPageComponent,
    PasswordComponent,
    SignatureComponent,
    ExportToPdfComponent,
    TableComponent,
    ImageComponent,
    PublicFormComponent,
    ImageGridComponent,
    ImageRenderDialogComponent,
    ShoppingCardComponent,
    DateTimeComponent
  ],
  imports: [
   // BrowserModule,
   GuidedTourModule,
   CommonModule,
   SharedModule,
   MatMenuModule, 
   //PaginatorComponent,
   //YorogridComponent,
    YoroappsRenderingLibRoutingModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    MatRightSheetModule,
    FlexLayoutModule,
    //BrowserAnimationsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    MessageNotificationModule,
    SignaturePadModule,
    RecaptchaModule,
    PerfectScrollbarModule,
    MatListModule,
    NgxIntlTelInputModule,
    TooltipModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatMomentModule
  ],

  exports: [
    //YorogridComponent,
    TestComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    DynamicFormComponent,
    TextAreaComponent,
    MultipleSelectionComponent,
    AutoCompleteComponent,
    GridComponent,
    ChipComponent,
    DynamicFieldDirective,
    DynamicSectionComponent,
    DynamicRowsComponent,
    DynamicMenuComponent,
    DynamicCardSectionComponent,
    DynamicCollapsibleSectionComponent,
    DynamicArrayComponent,
    ApplicationProvisionComponent,
    DynamicPageComponent,
    LabelComponent,
    TabbedMenuComponent,
    FileUploadComponent,
    //LoginComponent,
    DividerComponent,
    DashboardComponent,
    WarningComponent,
    ParagraphComponent,
    LoadLogoComponent,
    UploadLogoComponent,
    TestPageComponent,
    HeaderComponent,
    ApplicationLauncherComponent,
    DynamicHeaderComponent,
    DynamicSideNavBarComponent,
    DynamicDialogComponent,
    DynamicRightSheetComponent,
    ApplicationDialogBoxComponent,
    YoroSecurityComponent,
   // SnackbarComponent,
    AutoCompleteComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    DynamicFormComponent,
    TextAreaComponent,
    MultipleSelectionComponent,
    GridComponent,
    ChipComponent,
    DynamicFieldDirective,
    DynamicSectionComponent,
    DynamicRowsComponent,
    DynamicMenuComponent,
    DynamicCardSectionComponent,
    DynamicCollapsibleSectionComponent,
    DynamicArrayComponent,
    ApplicationRightSheetComponent,
    RenderingConfirmDialogBoxComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    DynamicFormComponent,
    TextAreaComponent,
    MultipleSelectionComponent,
    GridComponent,
    ChipComponent,
    DynamicSectionComponent,
    DynamicRowsComponent,
    DynamicCardSectionComponent,
    DynamicCollapsibleSectionComponent,
    DynamicArrayComponent,
    ParagraphComponent,
    TestComponent,
    DynamicRowsComponent,
    LabelComponent,
    DynamicRightSheetComponent,
    DynamicDialogComponent,
    DividerComponent,
    DynamicMenuTabComponent,
    LoadFormComponent,
    RenderingConfirmDialogBoxComponent,
    HyperLinkComponent,
    ApplicationComponent,
    UserPermissionComponent,
    EmbeddedPageComponent,
    AppLayoutPageComponent,
    PasswordComponent,
    SignatureComponent,
    ExportToPdfComponent,
    TableComponent,
    ImageComponent,
    PublicFormComponent,
    ImageGridComponent,
    ShoppingCardComponent,
    DateTimeComponent
    //PaginatorComponent
  ],
  providers: [CurrencyPipe, { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }, DynamicSideNavBarService,
  LoaderService, DynamicPageComponent, DynamicFormComponent, PublicFormComponent,
  {
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  },
  NavService,GuidedTourService
],
  schemas: [],
})
export class YoroappsRenderingModule { }
