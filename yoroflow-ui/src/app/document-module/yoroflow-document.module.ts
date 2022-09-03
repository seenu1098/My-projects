import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentEditorComponent } from './document-editor/document-editor.component';
import { YoroflowDocumentRoutingModule } from './yoroflow-document-routing.module';
import { YoroflowDocumentsComponent } from './yoroflow-documents/yoroflow-documents.component';
import { MaterialModule } from '../material/material.module';
import { QuillModule } from 'ngx-quill';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  PerfectScrollbarModule, PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentTeamComponent } from './document-team/document-team.component';
import { DocumentTeamDialogListComponent } from './document-team-dialog-list/document-team-dialog-list.component';
import { DocumentCommentComponent } from './document-comment/document-comment.component';
import { DocCommentsComponent } from './doc-comments/doc-comments.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
}
@NgModule({
  declarations: [YoroflowDocumentsComponent, DocumentEditorComponent, DocumentTeamComponent, DocumentTeamDialogListComponent, DocumentCommentComponent, DocCommentsComponent],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    YoroflowDocumentRoutingModule,
    MaterialModule,
    QuillModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TranslateModule

  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
  ],
  exports: [TranslateModule],
  entryComponents: []
})
export class YoroflowDocumentModule { }
