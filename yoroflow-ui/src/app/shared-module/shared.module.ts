import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedRoutingModule } from './shared-routing.module';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { YorogridComponent } from './yorogrid/yorogrid.component';
import { TokenHeaderService } from './services/token-header.service';
import { PaginatorComponent } from './paginator/paginator/paginator.component';
import { Routes, RouterModule } from '@angular/router';
import { OrgPrefrenceService } from './services/org-prefrence.service';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtHelperService, JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { CronComponent } from './cron/cron.component';
import { UppyComponentComponent } from './uppy-component/uppy-component.component';
import { UppyAngularModule } from 'uppy-angular';
import { CustomQuillEditorComponent } from './quill-editor/quill-editor.component';
import { QuillModule } from 'ngx-quill';
import { TimezoneComponent } from './timezone/timezone.component';
import { ZonefilterPipe } from './zonefilter.pipe';
import { ConfirmdialogComponent } from './confirmdialog/confirmdialog.component';
import { CountryListComponent } from './country-list/country-list.component';
import { TelephoneComponent } from './telephone/telephone.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { TranslateModule } from '@ngx-translate/core';
import { AlertmessageComponent } from './alert-message/alert-message.component';
import { ExpireDialogComponent } from './expire-dialog/expire-dialog.component';
import { GanttChartComponent } from './gantt/gantt.component';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { ThyButtonModule } from 'ngx-tethys/button';
import { ThyNavModule } from 'ngx-tethys/nav';
import { ThyLayoutModule } from 'ngx-tethys/layout';
import { ThyNotifyModule } from 'ngx-tethys/notify';
import { NgxGanttModule } from './packages/gantt/src/public-api';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};

@NgModule({
  declarations: [SnackbarComponent,
    YorogridComponent,
    PaginatorComponent,
    CronComponent,
    UppyComponentComponent,
    CustomQuillEditorComponent,
    TimezoneComponent,
    ZonefilterPipe,
    ConfirmdialogComponent,
    CountryListComponent,
    TelephoneComponent,
    AlertmessageComponent,
    ExpireDialogComponent,
    GanttChartComponent
  ],
  imports: [
    MaterialModule,
    CommonModule,
    SharedRoutingModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    UppyAngularModule,
    QuillModule.forRoot(),
    NgxIntlTelInputModule,
    TranslateModule,
    NgxGanttModule,
    PerfectScrollbarModule,
    ThyButtonModule,
    ThyNavModule,
    ThyLayoutModule,
    ThyNotifyModule,
  ],
  providers: [TokenHeaderService, OrgPrefrenceService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
  ],
  exports: [YorogridComponent,
    PaginatorComponent,
    RouterModule,
    UppyComponentComponent,
    CustomQuillEditorComponent,
    TimezoneComponent,
    CountryListComponent,
    TelephoneComponent,
    TranslateModule,
    AlertmessageComponent,
    ExpireDialogComponent,
    GanttChartComponent
  ]
})
export class SharedModule { }
