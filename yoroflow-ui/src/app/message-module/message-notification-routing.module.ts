import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../services/core/authentication/auth-guard-service/auth.guard";
import { NotificationPageComponent } from "./notification-page/notification-page.component";


const routes: Routes = [
    { path: ':workspace/notification', component: NotificationPageComponent, canActivate: [AuthGuard] }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class MessageNotificationRoutingModule { }