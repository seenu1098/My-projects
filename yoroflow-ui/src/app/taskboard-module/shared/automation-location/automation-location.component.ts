import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { QuillEditorComponent } from 'ngx-quill';
import { Page, Section } from 'src/app/rendering-module/shared/vo/page-vo';
import { QuillService } from 'src/app/shared-module/quill-editor/quill.service';
import { ActionMap } from '../automation-outlook-integration/outlook-action-model';

export interface Field {
  displayName: any;
  formControl: string;
}

@Component({
  selector: 'app-automation-location',
  templateUrl: './automation-location.component.html',
  styleUrls: ['./automation-location.component.scss']
})
export class AutomationLocationComponent implements OnInit {

  @Input() selectedScript: any;
  @Input() page = new Page();
  @Output() columnNameEmit: EventEmitter<any> = new EventEmitter<any>();

  // locationCntrl = new FormControl();
  meetingAppCntrl = new FormControl();
  isCheck: boolean = false;
  form: FormGroup;
  systemVariables: any;
  format = 'html';
  fields: Field[] = [];
  @ViewChild('quill', { static: true }) quill: QuillEditorComponent;

  quillConfig = {
    toolbar: {
      container: [
      //   ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      //   [{ header: 1 }, { header: 2 }], // custom button values
      //   [{ list: 'ordered' }, { list: 'bullet' }],
      //   ['clean'], // remove formatting button
      //   ['image', 'link'],
      ],
    },
    mention: {}
  };

  constructor(private fb: FormBuilder, private quillservice: QuillService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      locationCntrl: [, [Validators.required]]
    });
    if (this.selectedScript?.keyValuePair?.actionSpecificMaps?.location) {
      this.form.get('locationCntrl').setValue(this.selectedScript.keyValuePair.actionSpecificMaps.location);
    }
    if (this.selectedScript?.keyValuePair?.actionSpecificMaps?.enableVirtualMeeting) {
      this.isCheck = this.selectedScript?.keyValuePair?.actionSpecificMaps?.enableVirtualMeeting;
      if (this.isCheck) {
        this.meetingAppCntrl.setValue(this.selectedScript?.keyValuePair?.actionSpecificMaps?.meetingApp);
      }
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
          if (column.controlType!=='label' && column.controlType !== 'button' && column.field.label && column.field.label.labelName) {
            this.fields.push({ displayName: column.field.label.labelName, formControl: column.field.name });
          } else if(column.controlType!=='label' && column.controlType !== 'button') {
            this.fields.push({ displayName: column.field.name, formControl: column.field.name });
          }
        });
      });
    });
  }

  apply(): void {
    if (this.form.valid) {
      this.form.get('locationCntrl').setValue(this.quill.quillEditor.root.innerText);
      const htmlText = this.form.get('locationCntrl').value;
      this.quill.quillEditor.setText('');
      this.quill.quillEditor.pasteHTML(0, htmlText);
      const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.location);
      this.selectedScript.words[index] = this.quill.quillEditor.root.innerText;
      this.selectedScript.keyValuePair.location = this.quill.quillEditor.root.innerText;
      if (this.selectedScript.keyValuePair.actionSpecificMaps) {
        this.selectedScript.keyValuePair.actionSpecificMaps.location = this.quill.quillEditor.root.innerText;
      } else {
        const actionSpecificMaps = new ActionMap();
        actionSpecificMaps.location = this.quill.quillEditor.root.innerText;
        this.selectedScript.keyValuePair.actionSpecificMaps = actionSpecificMaps;
      }
      if (this.isCheck === true) {
        if (this.meetingAppCntrl.valid) {
          this.selectedScript.keyValuePair.actionSpecificMaps.enableVirtualMeeting = this.isCheck;
          this.selectedScript.keyValuePair.actionSpecificMaps.meetingApp = this.meetingAppCntrl.value;
          this.columnNameEmit.emit(true);
        } else {
          this.meetingAppCntrl.markAsTouched();
        }
      } else {
        this.selectedScript.keyValuePair.actionSpecificMaps.enableVirtualMeeting = this.isCheck;
        this.selectedScript.keyValuePair.actionSpecificMaps.meetingApp = this.meetingAppCntrl.value;
        this.columnNameEmit.emit(true);
      }
    }
  }

  onlineMeeting(event: MatCheckboxChange): void {
    this.isCheck = event.checked;
    if (this.isCheck === true) {
      this.meetingAppCntrl.setValidators([Validators.required]);
      this.meetingAppCntrl.updateValueAndValidity();
    } else {
      this.meetingAppCntrl.clearValidators();
      this.meetingAppCntrl.updateValueAndValidity();
    }
  }

  selectChip(chipName: any): void {
    const selection = this.quill.quillEditor.selection;
    if (this.form.get('locationCntrl').value === undefined || this.form.get('locationCntrl').value === null || this.form.get('locationCntrl').value === '') {
      this.form.get('locationCntrl').setValue('{{' + chipName.fieldId + '}}');
    } else {
      this.quill.quillEditor.insertText(selection.savedRange.index, '{{' + chipName.fieldId + '}}');
    }
  }

  selectField(field: Field): void {
    const selection = this.quill.quillEditor.selection;
    if (this.form.get('locationCntrl').value === undefined || this.form.get('locationCntrl').value === null || this.form.get('locationCntrl').value === '') {
      this.form.get('locationCntrl').setValue('{{' + field.formControl + '}}');
    } else {
      this.quill.quillEditor.insertText(selection.savedRange.index, '{{' + field.formControl + '}}');
    }
  }

}
