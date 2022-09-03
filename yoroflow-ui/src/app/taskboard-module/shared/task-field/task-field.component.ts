import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CreateFormService } from 'src/app/rendering-module/shared/service/form-service/create-form.service';
import { Page, Section } from 'src/app/rendering-module/shared/vo/page-vo';

@Component({
  selector: 'app-task-field',
  templateUrl: './task-field.component.html',
  styleUrls: ['./task-field.component.scss']
})
export class TaskFieldComponent implements OnInit {

  constructor(private formService: CreateFormService) { }

  fieldNames: string[] = [];

  @Input() page: Page;
  @Input() selectedScript: any;
  @Input() automationType: string;
  @Output() fieldName: EventEmitter<any> = new EventEmitter<any>();
  form: FormGroup;
  fields: any[] = [];

  ngOnInit(): void {
    this.form = this.formService.createForm(this.page.sections);
    this.loadTaskFieldNames(this.page.sections);
  }

  loadTaskFieldNames(sections: Section[]): void {
    sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (this.form.get(column.field.name)) {
            if (column.field.label && column.field.label.labelName) {
              this.fields.push({ label: column.field.label.labelName, name: column.field.name });
            } else {
              this.fields.push({ label: column.field.name, name: column.field.name });
            }
          }
        });
      });
    });
  }

  getFieldName(field: string): void {
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.selectedField);
    this.selectedScript.words[index] = field;
    this.selectedScript.keyValuePair.selectedField = field;
    this.fieldName.emit('field_value');
  }

}
