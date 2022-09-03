import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Page, Section } from 'src/app/rendering-module/shared/vo/page-vo';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';

@Component({
  selector: 'app-automation-mail-column',
  templateUrl: './automation-mail-column.component.html',
  styleUrls: ['./automation-mail-column.component.scss']
})
export class AutomationMailColumnComponent implements OnInit {

  constructor(private fb: FormBuilder, private snackbar: MatSnackBar) { }

  @Output() columnNameEmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() selectedScript: any;
  @Input() page: Page;
  @Input() customMail: string[] = [];

  tableColumnNames: string[] = [];
  tableControlId: string;
  form: FormGroup;
  customMails: string[] = [];

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  ngOnInit(): void {
    this.form = this.fb.group({
      customMails: ['', [Validators.email]]
    });
    this.loadTaskFieldNames(this.page.sections);
    if (this.customMail.length > 0) {
      this.customMails = this.customMail;
    } else {
      this.customMails = [];
    }
  }

  loadTaskFieldNames(sections: Section[]): void {
    sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'table') {
            this.tableControlId = column.field.control.tableId;
            column.field.control.columns.forEach(tableColumn => {
              if (tableColumn.field.dataType === 'string') {
                this.tableColumnNames.push(tableColumn.field.name);
              }
            });
          }
        });
      });
    });
  }

  getColumnName(columnName: string): void {
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.columnName);
    this.selectedScript.words[index] = columnName;
    this.selectedScript.keyValuePair.columnName = columnName;
    this.selectedScript.keyValuePair.tableId = this.tableControlId;
    this.columnNameEmit.emit(true);
  }

  addCustomMails(event: MatChipInputEvent): void {
    if ((event.value || '').trim()) {
      if (!this.form.get('customMails').errors) {
        this.customMails.push(event.value);
        this.form.get('customMails').setValue('');
        event.chipInput.clear();
      }
    }
  }

  removeCustomMails(index: number): void {
    this.customMails.splice(index, 1);
  }

  applyCustomMails(userForm: NgForm): void {
    if (userForm.valid && this.customMails.length > 0) {
      const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.columnName);
      var customMail: string;
      for (let i = 0; i < this.customMails.length; i++) {
        if (i === 0) {
          customMail = this.customMails[i];
        } else {
          customMail = customMail + ' ,' + this.customMails[i];
        }
      }
      this.selectedScript.words[index] = customMail;
      this.selectedScript.keyValuePair.columnName = customMail;
      this.selectedScript.keyValuePair.customMails = this.customMails;
      this.selectedScript.keyValuePair.tableId = null;
      this.columnNameEmit.emit(true);
    } else if (this.customMails.length === 0) {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: 'Please enter a mail'
      });
    }
  }

}
