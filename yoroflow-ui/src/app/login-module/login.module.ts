import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { LoginRoutingModule } from './login-routing.module';
import { MaterialElevationDirective } from './shared/material-elevation';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MicrosoftRedirectComponent } from './microsoft-redirect/microsoft-redirect.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { SubscriptionExpireComponent } from './subscription-expire/subscription-expire.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { CreateOrganizationComponent } from '../creation-module/create-organization/create-organization.component';
import { YoroappsCreationModule } from '../creation-module/creation.module';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { MicrosoftAuthLoginComponent } from './microsoft-auth-login/microsoft-auth-login.component';
import { MicrosoftAuthReturnComponent } from './microsoft-auth-return/microsoft-auth-return.component';


@NgModule({
  imports: [FlexLayoutModule, CommonModule, MaterialModule, LoginRoutingModule,
    RecaptchaFormsModule, RecaptchaModule, ReactiveFormsModule, FormsModule, YoroappsCreationModule
  ],
  declarations: [LoginComponent, MaterialElevationDirective, MicrosoftRedirectComponent,
    TermsConditionsComponent, ErrorDialogComponent, SubscriptionExpireComponent,
    SubscriptionComponent,
    MessageDialogComponent,
    MicrosoftAuthLoginComponent,
    MicrosoftAuthReturnComponent],
  exports: [RouterModule]

})
export class LoginModule { }

