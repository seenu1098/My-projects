import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';;
import { FlexLayoutModule } from '@angular/flex-layout';
import { DatePipe, CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatRightSheetModule } from 'mat-right-sheet';
import { CdkTableModule } from '@angular/cdk/table';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { YoroflowEngineModule } from 'src/app/engine-module/engine.module';
import { MatInputModule } from '@angular/material/input';
import { ResizableModule } from 'angular-resizable-element';
import { MessageNotificationModule } from './message-module/message-notification.module';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { ToastrModule } from 'ngx-toastr';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { LoginModule } from './login-module/login.module';
import { SharedModule } from './shared-module/shared.module';
import { CoreModule } from './services/core/core.module';
import { SignupComponent } from './engine-module/signup/signup.component';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { JwtInterceptor } from './services/core/http/jwt-interceptor';
import { CompletedTasksComponent } from './taskboard-module/completed-tasks/completed-tasks.component';
import { ErrorInterceptor } from './services/core/http/error-interceptor';
import { OAuthModule } from 'angular-oauth2-oidc';
import { ExpireDialogComponent } from './shared-module/expire-dialog/expire-dialog.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};

import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { YoroflowOAuthBeginComponent } from './oauth-module/oauth-begin.component';
import { YoroflowOAuthReturnComponent } from './oauth-module/oauth-return.component';
import { InitialLoadComponent } from './initial-load/initial-load.component';
import {GuidedTourModule, GuidedTourService} from 'ngx-guided-tour';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [AppComponent, SignupComponent, CompletedTasksComponent, YoroflowOAuthBeginComponent, YoroflowOAuthReturnComponent, InitialLoadComponent],
  imports: [
    GuidedTourModule,
    RecaptchaFormsModule,
    BrowserModule,
    SharedModule,
    LoginModule,
    AppRoutingModule,
    NgxGraphModule,
    CoreModule,
    NgxChartsModule,
    ToastrModule.forRoot(),
    CdkStepperModule,
    BrowserAnimationsModule,
    DragDropModule,
    ReactiveFormsModule,
    MatRightSheetModule,
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
    HttpClientModule,
    CommonModule,
    CdkTableModule,
    YoroflowEngineModule,
    MessageNotificationModule,
    MatInputModule,
    ResizableModule,
    RecaptchaModule,
    OAuthModule.forRoot(),
    PerfectScrollbarModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    DatePipe,
    GuidedTourService,
    HttpClientModule,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  entryComponents: [],
})
export class AppModule {}
