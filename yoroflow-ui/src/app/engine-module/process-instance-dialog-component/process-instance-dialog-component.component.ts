import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-process-instance-dialog-component',
  templateUrl: './process-instance-dialog-component.component.html',
  styleUrls: ['./process-instance-dialog-component.component.scss']
})
export class ProcessInstanceDialogComponentComponent implements OnInit {
  form: FormGroup;
  json: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProcessInstanceDialogComponentComponent>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    const response = JSON.stringify(this.data.data);
    if (this.data.taskType === 'WEB_SERVICE_TASK') {
      this.form = this.fb.group({
        url: [{ value: this.data.url, disabled: true }],
        responsePayload: [{ value: response, disabled: true }]
      });
    }
    if (this.data.taskType === 'DB_TASK') {
      this.form = this.fb.group({
        sql: [{ value: this.data.sqlType, disabled: true }],
        dbResponse: [{ value: response, disabled: true }]
      });
    }
    if (this.data.taskType === 'START_TASK') {
      this.form = this.fb.group({
        name: [{ value: this.data.name, disabled: true }],
        propertyType: [{ value: this.data.propertyType, disabled: true }],
        webservicePayload: [{ value: response, disabled: true }]
      });
    }
    if (this.data.taskType === 'COMPUTE_TASK') {
      this.form = this.fb.group({
        name: [{ value: this.data.name, disabled: true }],
        dataType: [{ value: this.data.computeDataType, disabled: true }],
        computeString: [{ value: this.data.computeString, disabled: true }],
        computePayload: [{ value: response, disabled: true }]
      });
    }
    if (this.data.taskType === 'DELAY_TIMER') {
      this.form = this.fb.group({
        name: [{ value: this.data.name, disabled: true }],
        time: [{ value: this.data.time, disabled: true }],
        units: [{ value: this.data.units, disabled: true }]
      });
    }
    if (this.data.taskType === 'DECISION_TASK') {
      this.form = this.fb.group({
        name: [{ value: this.data.name, disabled: true }],
        logic: [{ value: this.data.decisionLogic, disabled: true }],
        rules: [{ value: this.data.decisionRules, disabled: true }]
      });
    }
    if (this.data.taskType === 'SMS_TASK') {
      this.form = this.fb.group({
        name: [{ value: this.data.name, disabled: true }],
        messageBody: [{ value: this.data.messageBody, disabled: true }],
        mobileNumbers: [{ value: this.data.mobileNumbers, disabled: true }]
      });
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
