import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './services/core/authentication/auth-guard-service/auth.guard';
import { SignupComponent } from './engine-module/signup/signup.component';
import { YoroflowOAuthBeginComponent } from './oauth-module/oauth-begin.component';
import { YoroflowOAuthReturnComponent } from './oauth-module/oauth-return.component';
import { LoginInitialComponent } from './engine-module/login-initial/login-initial.component';
import { InitialLoadComponent } from './initial-load/initial-load.component';
import { MicrosoftAuthLoginComponent } from './login-module/microsoft-auth-login/microsoft-auth-login.component';
import { MicrosoftAuthReturnComponent } from './login-module/microsoft-auth-return/microsoft-auth-return.component';

const routes: Routes = [
  { path: 'board/signup', component: SignupComponent },
  { path: 'board/account-creation/:accountToken', component: SignupComponent },
  { path: 'board/signup1/:taskId', component: SignupComponent },
  { path: 'single-signon/begin', component: YoroflowOAuthBeginComponent },
  { path: 'single-signon/return', component: YoroflowOAuthReturnComponent },
  { path: 'single-signon/begin-board', component: YoroflowOAuthBeginComponent },
  { path: 'single-signon/return-board', component: YoroflowOAuthReturnComponent },
  { path: 'microsoft-azure', component: YoroflowOAuthReturnComponent },
  { path: 'domain', component: LoginInitialComponent },
  { path: 'microsoft', component: MicrosoftAuthLoginComponent },
  { path: 'microsoft-return', component: MicrosoftAuthReturnComponent },
  {
    path: 'loading',
    component: InitialLoadComponent,
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login-module/login.module').then((m) => m.LoginModule),
  },
  {
    path: ':workspace/mytask',
    loadChildren: () =>
      import('./mytasks-module/mytasks.module').then((m) => m.MytasksModule),
  },

  {
    path: ':workspace/yoroflow-engine',
    loadChildren: () =>
      import('./engine-module/engine.module').then(
        (m) => m.YoroflowEngineModule
      ),
  },
  {
    path: ':workspace/yoroflow-design',
    loadChildren: () =>
      import('./designer-module/designer.module').then(
        (m) => m.YoroflowDesignModule
      ),
  },
  {
    path: 'yoroapps-rendering',
    loadChildren: () =>
      import('./rendering-module/rendering.module').then(
        (m) => m.YoroappsRenderingModule
      ),
  },
  {
    path: 'yoroapps-creation',
    loadChildren: () =>
      import('./creation-module/creation.module').then(
        (m) => m.YoroappsCreationModule
      ),
  },
  {
    path: ':workspace/messaging-ui',
    loadChildren: () =>
      import('./message-module/message-notification.module').then(
        (m) => m.MessageNotificationModule
      ),
  },

  {
    path: ':workspace/task',
    loadChildren: () =>
      import('./taskboard-module/taskboard.module').then(
        (m) => m.TaskboardModule
      ),
  },
  {
    path: ':workspace/workspace',
    loadChildren: () =>
      import('./workspace-module/workspace.module').then(
        (m) => m.WorkspaceModule
      ),
  },
  {
    path: ':workspace/yorodocs',
    loadChildren: () =>
      import('./document-module/yoroflow-document.module').then((m) => m.YoroflowDocumentModule),
  },
  {
    path: ':workspace/yoroapps',
    loadChildren: () =>
      import('./application-module/application.module').then((m) => m.ApplicationModule),
  },
  {
    path: '',
    redirectTo: 'loading',
    pathMatch: 'full',
  },
  // ]}
];

@NgModule({ 
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
