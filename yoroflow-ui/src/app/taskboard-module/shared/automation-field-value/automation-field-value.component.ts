import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Page, Section } from 'src/app/rendering-module/shared/vo/page-vo';

@Component({
  selector: 'app-automation-field-value',
  templateUrl: './automation-field-value.component.html',
  styleUrls: ['./automation-field-value.component.scss']
})
export class AutomationFieldValueComponent implements OnInit {

  constructor(private fb: FormBuilder) { }

  @Input() page: Page;
  @Input() selectedScript: any;
  @Input() automationType: string;
  @Output() columnNameEmit: EventEmitter<any> = new EventEmitter<any>();

  fieldType: string;
  form: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      fieldValue: [,[Validators.required]]
    });
    this.loadTaskFieldType(this.page.sections);
  }

  loadTaskFieldType(sections: Section[]): void {
    sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.field.name === this.selectedScript.keyValuePair.selectedField) {
            this.fieldType = column.controlType;
            if (this.selectedScript.keyValuePair.fieldType && this.selectedScript.keyValuePair.fieldType !== this.fieldType) {
              this.form.get('fieldValue').setValue('');
            } else if(this.selectedScript.keyValuePair.fieldValue) {
              this.form.get('fieldValue').setValue(this.selectedScript.keyValuePair.fieldValue);
            }
          }
        });
      });
    });
  }

  apply(): void {
    if (this.form.valid) {
      const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.fieldValue);
      this.selectedScript.words[index] = this.form.get('fieldValue').value;
      this.selectedScript.keyValuePair.fieldValue = this.form.get('fieldValue').value;
      this.selectedScript.keyValuePair.fieldType = this.fieldType;
      this.columnNameEmit.emit(true);
    }
  }

}
