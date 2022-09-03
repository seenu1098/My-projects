import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YoroflowOAuthBeginComponent } from './oauth-begin.component';
import { YoroflowOAuthReturnComponent } from './oauth-return.component';
const routes: Routes = [
  { path: 'begin', component: YoroflowOAuthBeginComponent },
  { path: 'return', component: YoroflowOAuthReturnComponent },
  { path: 'begin-board', component: YoroflowOAuthBeginComponent },
  { path: 'return-board', component: YoroflowOAuthReturnComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class YoroOAuthRoutingModule { }
