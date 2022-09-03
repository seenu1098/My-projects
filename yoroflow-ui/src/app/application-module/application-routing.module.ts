import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../services/core/authentication/auth-guard-service/auth.guard";
import { RoleGuardService } from "../services/core/authentication/role-guard-service/role-guard.service";
import { ApplicationTemplatesComponent } from "./application-templates/application-templates.component";
import { CreateApplicationComponent } from "./create-application/create-application.component";

const routes: Routes = [
    {
        path: '',
        children: [
            { path: 'my-apps', component: ApplicationTemplatesComponent, canActivate: [AuthGuard, RoleGuardService] }
        ]
    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ApplicationRoutingModule { }