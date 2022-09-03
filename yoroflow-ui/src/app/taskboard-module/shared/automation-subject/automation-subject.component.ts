import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { Page, Section, Validator } from 'src/app/rendering-module/shared/vo/page-vo';
import { QuillService } from 'src/app/shared-module/quill-editor/quill.service';
import { ActionMap } from '../automation-outlook-integration/outlook-action-model';

export interface Field {
  displayName: any;
  formControl: string;
}

@Component({
  selector: 'app-automation-subject',
  templateUrl: './automation-subject.component.html',
  styleUrls: ['./automation-subject.component.scss']
})
export class AutomationSubjectComponent implements OnInit {

  @Output() subjectEmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() selectedScript: any;
  @Input() subject: string;
  @Input() page = new Page();

  form: FormGroup;
  systemVariables: any;
  format = 'html';
  fields: Field[] = [];
  @ViewChild('quill', { static: true }) quill: QuillEditorComponent;

  quillConfig = {
    toolbar: {
      container: [
        // ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        // [{ header: 1 }, { header: 2 }], // custom button values
        // [{ list: 'ordered' }, { list: 'bullet' }],
        // ['clean'], // remove formatting button
        // ['image', 'link'],
      ],
    },
    mention: {}
  };

  constructor(private fb: FormBuilder, private quillservice: QuillService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      subject: [this.subject, [Validators.required]]
    });
    if (this.selectedScript?.keyValuePair?.actionSpecificMaps?.header) {
      this.form.get('subject').setValue(this.selectedScript.keyValuePair.actionSpecificMaps.header);
    }
    this.quillservice.getSystemVariables().subscribe(res => {
      this.systemVariables = res;
    });
    this.loadFormFields(this.page.sections);
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

  apply(userForm: NgForm): void {
    if (userForm.valid) {
      this.form.get('subject').setValue(this.quill.quillEditor.root.innerText);
      const htmlText = this.form.get('subject').value;
      this.quill.quillEditor.setText('');
      this.quill.quillEditor.pasteHTML(0, htmlText);
      if (this.selectedScript.automation.includes('outlook')) {
        const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.header);
        this.selectedScript.words[index] = this.quill.quillEditor.root.innerText;
        this.selectedScript.keyValuePair.header = this.quill.quillEditor.root.innerText;
        if (this.selectedScript.keyValuePair.actionSpecificMaps) {
          this.selectedScript.keyValuePair.actionSpecificMaps.header = this.quill.quillEditor.root.innerText;
        } else {
          const actionSpecificMaps = new ActionMap();
          actionSpecificMaps.header = this.form.get('subject').value;
          this.selectedScript.keyValuePair.actionSpecificMaps = actionSpecificMaps;
        }
        this.subjectEmit.emit(true);
      } else {
        const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.subject);
        this.selectedScript.words[index] = this.quill.quillEditor.root.innerText;
        this.selectedScript.keyValuePair.subject = this.quill.quillEditor.root.innerText;
        this.subjectEmit.emit(true);
      }
    }
  }

  selectChip(chipName: any): void {
    const selection = this.quill.quillEditor.selection;
    if (this.form.get('subject').value === undefined || this.form.get('subject').value === null || this.form.get('subject').value === '') {
      this.form.get('subject').setValue('{{' + chipName.fieldId + '}}');
    } else {
      this.quill.quillEditor.insertText(selection.savedRange.index, '{{' + chipName.fieldId + '}}');
    }
  }

  selectField(field: Field): void {
    const selection = this.quill.quillEditor.selection;
    if (this.form.get('subject').value === undefined || this.form.get('subject').value === null || this.form.get('subject').value === '') {
      this.form.get('subject').setValue('{{' + field.formControl + '}}');
    } else {
      this.quill.quillEditor.insertText(selection.savedRange.index, '{{' + field.formControl + '}}');
    }
  }

}
