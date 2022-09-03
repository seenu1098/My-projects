import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuillEditorComponent } from 'ngx-quill';
import { AlertmessageComponent } from './alert-message/alert-message.component';

const routes: Routes = [
  { path: 'notify', component: AlertmessageComponent },
  { path: 'quill', component: QuillEditorComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],

})
export class SharedRoutingModule { }
