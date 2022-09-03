import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { MicrosoftRedirectComponent } from './microsoft-redirect/microsoft-redirect.component';
import { SubscriptionExpireComponent } from './subscription-expire/subscription-expire.component';
import { SubscriptionComponent } from './subscription/subscription.component';
const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'microsoft/redirect', component: MicrosoftRedirectComponent },
  { path: 'subscription-expire/:username/:id', component: SubscriptionExpireComponent },
  { path: 'subscription-update/:username/:id', component: SubscriptionComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
