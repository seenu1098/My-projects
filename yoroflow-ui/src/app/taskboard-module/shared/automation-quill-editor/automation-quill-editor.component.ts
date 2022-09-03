import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { Page, Section } from 'src/app/rendering-module/shared/vo/page-vo';
import { QuillService } from 'src/app/shared-module/quill-editor/quill.service';
import { Action } from '../../event-automation/actions';

export interface Field {
  displayName: any;
  formControl: string;
}

@Component({
  selector: 'app-automation-quill-editor',
  templateUrl: './automation-quill-editor.component.html',
  styleUrls: ['./automation-quill-editor.component.scss']
})
export class AutomationQuillEditorComponent implements OnInit {

  @Input() inputMessage: string;
  @Input() createTask: boolean;
  @Input() selectedScript: any;
  @Input() page = new Page();
  @Output() message: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private quillservice: QuillService, private action: Action) { }

  form: FormGroup;
  @ViewChild('quill', { static: true }) quill: QuillEditorComponent;

  quillConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'], // remove formatting button
        ['image', 'link'],
        ['code-block'],
      ],
      handlers: {
        'code-block': () => {
          this.formatChange();
        }
      }
    },
    mention: {}
  };

  format = 'html';
  systemVariables: any;
  applicationName: string;
  fields: Field[] = [];

  ngOnInit(): void {
    this.action.appNameList.forEach(app => {
      if (this.selectedScript.automation.includes(app.value)) {
        this.applicationName = app.name;
      }
    });
    this.form = this.fb.group({
      editor: []
    });
    this.form.get('editor').setValue(this.selectedScript.keyValuePair.message);
    this.quillservice.getSystemVariables().subscribe(res => {
      if (this.createTask === true) {
        this.systemVariables = res.filter(field => !field.fieldId.startsWith('log'));
      } else {
        this.systemVariables = res;
      }
    });
    this.loadFormFields(this.page.sections);
  }

  formatChange(): void {
    this.format = this.format === 'html' ? 'text' : 'html';
    if (this.format === 'text') {
      const htmlText = this.form.get('editor').value;
      this.quill.quillEditor.setText(htmlText);
    } else if (this.format === 'html') {
      const htmlText = this.form.get('editor').value;
      this.quill.quillEditor.setText('');
      this.quill.quillEditor.pasteHTML(0, htmlText);
    }
  }

  apply(): void {
    this.form.get('editor').setValue(this.quill.quillEditor.root.innerText);
    const htmlText = this.form.get('editor').value;
    this.quill.quillEditor.setText('');
    this.quill.quillEditor.pasteHTML(0, htmlText);
    if (this.quill.quillEditor.root.innerText === 'message') {
      this.quill.quillEditor.root.innerText = 'message ';
    }
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.message);
    this.selectedScript.words[index] = this.quill.quillEditor.root.innerText;
    this.selectedScript.keyValuePair.message = this.quill.quillEditor.root.innerText;
    this.message.emit(true);
  }

  selectChip(chipName: any): void {
    const selection = this.quill.quillEditor.selection;
    if (this.form.get('editor').value === undefined || this.form.get('editor').value === null || this.form.get('editor').value === '') {
      this.form.get('editor').setValue('{{' + chipName.fieldId + '}}');
    } else {
      this.quill.quillEditor.insertText(selection.savedRange.index, '{{' + chipName.fieldId + '}}');
    }
  }

  selectField(field: Field): void {
    const selection = this.quill.quillEditor.selection;
    if (this.form.get('editor').value === undefined || this.form.get('editor').value === null || this.form.get('editor').value === '') {
      this.form.get('editor').setValue('{{' + field.formControl + '}}');
    } else {
      this.quill.quillEditor.insertText(selection.savedRange.index, '{{' + field.formControl + '}}');
    }
  }

  loadFormFields(sections: Section[]): void {
    sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType !== 'label' && column.controlType !== 'button' && column.field.label && column.field.label.labelName) {
            this.fields.push({ displayName: column.field.label.labelName, formControl: column.field.name });
          } else if (column.controlType !== 'label' && column.controlType !== 'button') {
            this.fields.push({ displayName: column.field.name, formControl: column.field.name });
          }
        });
      });
    });
  }
}
