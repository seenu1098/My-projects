import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { remainderDetails, remainderForm, SMSKeyWorkflowVO } from '../task-property/page-field-vo';
import { TaskPropertyComponent } from '../task-property/task-property.component';
import { SmsKeyGenerationComponent } from '../../creation-module/sms-key-generation/sms-key-generation.component';
import { TaskPropertyService } from '../task-property/task-property.service';
import { YoroFlowConfirmationDialogComponent } from '../../designer-module/yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';

// import { YoroFlowConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
// import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs/operators';
import { merge } from "rxjs";
@Component({
  selector: 'lib-remainder-dialog',
  templateUrl: './remainder-dialog.component.html',
  styleUrls: ['./remainder-dialog.component.css']
})
export class RemainderDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RemainderDialogComponent>, private taskPropertyService: TaskPropertyService,
    @Inject(MAT_DIALOG_DATA) public data: any, private formBuilder: FormBuilder, private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  remainderForm: FormGroup;
  SMSProviderNameList: SMSKeyWorkflowVO[];
  reminderDetails: remainderForm[];
  showInfoButton = false;
  ngOnInit(): void {
    this.initializeRemainderForm();
    this.loadRemainder();
  }

  initializeRemainderForm() {
    this.remainderForm = this.formBuilder.group({
      remainderDetails: this.formBuilder.array([this.remainderFormGroup()])
    });
  }



  loadRemainder() {
    let length = this.getRemainderDetailsArrayFormarray().length;
    if (length === 1) {
      this.getRemainderDetailsArrayFormarray().get('' + 0).get('remainderLevel').setValue(1);
    }
   let remainderDetails: remainderForm[] = [];
   if(this.data.remainderDetails ){
    remainderDetails = this.data.remainderDetails.remainderDetails;

   }

    if (remainderDetails && remainderDetails.length > 0) {
      for (let i = 0; i < remainderDetails.length; i++) {
        const index = '' + i;
        if (i > 0) {
          this.addRemainderFormGroup(i);
        }
        const sortBy = (this.getRemainderDetailsArrayFormarray().get(index) as FormGroup);
        sortBy.patchValue(remainderDetails[i]);
      }
    }
  }

  remainderFormGroup() {
    return this.formBuilder.group({
      remainderType: ['', Validators.required],
      remainderLevel: [{ value: '', disabled: true }, Validators.required],
      reminderTime: ['', Validators.required],
      reminderUnits: ['', Validators.required],
      smsNotification: [],
      emailNotification: [],
      systemNotification: []
    });
  }

  removeExcelReportarray(i) {
    this.getRemainderDetailsArrayFormarray().removeAt(i);
    if (this.getRemainderDetailsArrayFormarray().length === 0) {
      this.addRemainderFormGroup(i);
    }
    this.remainderForm.markAsDirty();
    let length = this.getRemainderDetailsArrayFormarray().length;
    for (let j = 0; j < length; j++) {
      this.getRemainderDetailsArrayFormarray().get('' + (j)).get('remainderLevel').setValue(j + 1);
    }
    this.remainderForm.markAsDirty();
  }

  addRemainderFormGroup(i) {
    this.getRemainderDetailsArrayFormarray().push(this.remainderFormGroup());
    let length = this.getRemainderDetailsArrayFormarray().length;
    this.getRemainderDetailsArrayFormarray().get('' + (length - 1)).get('remainderLevel').setValue(length);
    // this.reminderTimeValidation(i);
  }

  reminderTimeValidation(i) {
    let previousReminderTime = null;
    let previousReminderUnits = null;
    previousReminderTime = this.getRemainderDetailsArrayFormarray().get('' + i).get('reminderTime').value;
    previousReminderUnits = this.getRemainderDetailsArrayFormarray().get('' + i).get('reminderUnits').value;

    if (previousReminderTime < 5 && previousReminderUnits === 'minutes') {
      this.getRemainderDetailsArrayFormarray().get('' + i).get('reminderTime').setErrors({ minTime: true });
    } else {
      this.getRemainderDetailsArrayFormarray().get('' + i).get('reminderTime').setErrors({ minTime: false });
    }
    const reminderTime = this.getRemainderDetailsArrayFormarray().get('' + (i + 1)).get('reminderTime');
    const reminderUnits = this.getRemainderDetailsArrayFormarray().get('' + (i + 1)).get('reminderUnits');
    // reminderTime.valueChanges.pipe(debounceTime(500)).subscribe(() => {
    //   reminderUnits.valueChanges.pipe(debounceTime(500)).subscribe(() => {
    //     if (reminderTime.value && reminderUnits.value && previousReminderTime && previousReminderUnits) {
    //       if ((previousReminderTime > reminderTime.value && reminderUnits.value === previousReminderUnits)
    //         || (previousReminderUnits === 'hours' && reminderUnits.value === 'minutes')) {
    //         this.getRemainderDetailsArrayFormarray().get('' + i).get('reminderTime').setErrors({ maxTime: true });
    //       } else if (reminderTime.value < 5 && reminderUnits.value === 'minutes') {
    //         this.getRemainderDetailsArrayFormarray().get('' + i).get('reminderTime').setErrors({ minTime: true });
    //       } else if ((previousReminderTime === reminderTime.value) && (reminderUnits.value === previousReminderUnits)) {
    //         this.getRemainderDetailsArrayFormarray().get('' + i).get('reminderTime').setErrors({ sameTime: true });
    //       } else {
    //         this.getRemainderDetailsArrayFormarray().get('' + i).get('reminderTime').setErrors(null);
    //       }
    //     }
    //   });
    // });

    merge(reminderTime.valueChanges, reminderUnits.valueChanges).pipe(debounceTime(500)).subscribe(() => {
      if (reminderTime.value && reminderUnits.value && previousReminderTime && previousReminderUnits) {
        if ((previousReminderTime > reminderTime.value && reminderUnits.value === previousReminderUnits)
          || (previousReminderUnits === 'hours' && reminderUnits.value === 'minutes')) {
          this.getRemainderDetailsArrayFormarray().get('' + (i + 1)).get('reminderTime').setErrors({ maxTime: true });
        } else if (reminderTime.value < 5 && reminderUnits.value === 'minutes') {
          this.getRemainderDetailsArrayFormarray().get('' + (i + 1)).get('reminderTime').setErrors({ minTime: true });
        } else if ((previousReminderTime === reminderTime.value) && (reminderUnits.value === previousReminderUnits)) {
          this.getRemainderDetailsArrayFormarray().get('' + (i + 1)).get('reminderTime').setErrors({ sameTime: true });
        } else {
          this.getRemainderDetailsArrayFormarray().get('' + (i + 1)).get('reminderTime').setErrors(null);
        }
      }
    });

  }

  checkTimeAndUnitValidation(reminderDetails) {
    for (let i = 0; i < reminderDetails.length; i++) {

    }
  }

  getRemainderDetailsArrayFormarray() {
    return (this.remainderForm.get('remainderDetails') as FormArray);
  }

  notificationType($event, remainder) {
    if ($event.isUserInput === true) {
      if ($event.source.value === 'smsNotification') {
        // this.getSmsAndEmailDetails('SMS_TASK', remainder);
        this.loadProviderNames(remainder);
      }
      if ($event.source.value === 'emailNotification') {
        this.getSmsAndEmailDetails('EMAIL_TASK', remainder);
      }
      if ($event.source.value === 'systemNotification') {
        this.getSmsAndEmailDetails('SYSTEM_TASK', remainder);
      }
    }
  }

  getSmsAndEmailDetails(taskType, remainder) {
   
    const taskPropertyDialogBox = this.dialog.open(TaskPropertyComponent, {
      disableClose: true,
      width: '800px',
      height: '75%',
      data: {
        propertyName: this.data.propertyName, SMSProviderNameList: this.SMSProviderNameList, remainder: true,
        workflowStructure: this.data.workflowStructure, initialFieldList: this.data.initialFieldList, taskType,groupNameList: this.data.groupNameList, userNameList: this.data.userNameList
      },
      panelClass: 'task-property-dialogBox',
      autoFocus: false,
    });
    taskPropertyDialogBox.afterClosed().subscribe(remainderDetails => {
      if (remainderDetails) {
        if (taskType === 'SMS_TASK') {
          remainder.get('smsNotification').setValue(remainderDetails.propertyValue);
        }
        if (taskType === 'EMAIL_TASK') {
          remainder.get('emailNotification').setValue(remainderDetails.propertyValue);
        }
        if (taskType === 'SYSTEM_TASK') {
          remainder.get('systemNotification').setValue(remainderDetails.propertyValue);
        }
      }
    });
  }

  loadProviderNames(remainder) {
    if (this.SMSProviderNameList === undefined || this.SMSProviderNameList.length < 0) {
      this.taskPropertyService.getProviderNames().subscribe(data => {
        if (data && data.length > 0) {
          this.SMSProviderNameList = data;
          this.getSmsAndEmailDetails('SMS_TASK', remainder);
        } else if (data && data.length === 0) {
          const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
            data: { data: 'no-providers' },
          });
          dialogRef.afterClosed().subscribe(response => {
            if (response === true) {
              const dialogRef = this.dialog.open(SmsKeyGenerationComponent, {
                disableClose: true,
                height: '65%',
                width: '100vw',
                maxWidth: '90vw',
                maxHeight: '100vh',
                panelClass: 'full-screen-modal',
              });
            }
          });
          dialogRef.afterClosed().subscribe(saved => {
            if (saved === true) {
              this.getSmsAndEmailDetails('SMS_TASK', remainder);
            } else {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'Add Provider to create SMS task',
              });
            }
          });
        }
      });
    } else {
      this.getSmsAndEmailDetails('SMS_TASK', remainder);
    }

  }

  openSmsAndEmailInfo(taskType, remainder) {
    let value = null;
    if (taskType === 'SMS_TASK') {
      value = remainder.get('smsNotification').value;
    }
    if (taskType === 'EMAIL_TASK') {
      value = remainder.get('emailNotification').value;
    }
    if (taskType === 'SYSTEM_TASK') {
      value = remainder.get('systemNotification').value;
    }
    const taskPropertyDialogBox = this.dialog.open(TaskPropertyComponent, {
      disableClose: true,
      width: '800px',
      data: {
        propertyName: value, SMSProviderNameList: this.SMSProviderNameList, remainder: true,
        workflowStructure: this.data.workflowStructure, initialFieldList: this.data.initialFieldList, taskType,
        groupNameList: this.data.groupNameList, userNameList: this.data.userNameList
      },
      panelClass: 'task-property-dialogBox',
      autoFocus: false,
    });
    taskPropertyDialogBox.afterClosed().subscribe(remainderDetails => {
      if (remainderDetails) {
        if (taskType === 'SMS_TASK') {
          remainder.get('smsNotification').setValue(remainderDetails.propertyValue);
        }
        if (taskType === 'EMAIL_TASK') {
          remainder.get('emailNotification').setValue(remainderDetails.propertyValue);
        }
        if (taskType === 'SYSTEM_TASK') {
          remainder.get('systemNotification').setValue(remainderDetails.propertyValue);
        }
        this.remainderForm.markAsDirty();
      }
    });
  }

  submit(userform) {
    this.reminderDetails = this.remainderForm.getRawValue().remainderDetails;

    for (let i = 0; i < this.reminderDetails.length; i++) {
      if (this.reminderDetails[i].remainderType === 'emailNotification'
        && this.reminderDetails[i].emailNotification === null) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Email Configuration cannot be empty'
        });
        this.getRemainderDetailsArrayFormarray().get('' + i).get('remainderType').setErrors({ emailEmptyConfig: true });
      } else if (this.reminderDetails[i].remainderType === 'smsNotification'
        && this.reminderDetails[i].smsNotification === null) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'SMS Configuration cannot be empty'
        });
        this.getRemainderDetailsArrayFormarray().get('' + i).get('remainderType').setErrors({ smsEmptyConfig: true });
      } else {
        this.getRemainderDetailsArrayFormarray().get('' + i).get('remainderType').setErrors(null);
      }
    }

    if (this.getRemainderDetailsArrayFormarray().length === 1
    && this.getRemainderDetailsArrayFormarray().get('' + 0).get('remainderType').value === ''
    && this.getRemainderDetailsArrayFormarray().get('' + 0).get('reminderTime').value === ''
    && this.getRemainderDetailsArrayFormarray().get('' + 0).get('reminderUnits').value === '') {
      this.dialogRef.close({ data: true, remainder: this.remainderForm.getRawValue() });
    }

    if (userform.valid) {
      this.dialogRef.close({ data: true, remainder: this.remainderForm.getRawValue() });
    }
  }

  cancel() {
    this.dialogRef.close({ data: false});
  }

}
