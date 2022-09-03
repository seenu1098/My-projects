import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../services/core/authentication/auth-guard-service/auth.guard';
import { RoleGuardService } from '../services/core/authentication/role-guard-service/role-guard.service';
import { YoroflowDocumentsComponent } from './yoroflow-documents/yoroflow-documents.component';

const routes: Routes = [
    { path: 'documents', component: YoroflowDocumentsComponent, canActivate: [AuthGuard, RoleGuardService] },
    { path: 'documents/:title', component: YoroflowDocumentsComponent, canActivate: [AuthGuard, RoleGuardService] },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class YoroflowDocumentRoutingModule { }
