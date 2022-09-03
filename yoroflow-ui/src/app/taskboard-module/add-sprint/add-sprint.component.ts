import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { id } from '@swimlane/ngx-charts';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { SprintVO } from '../sprint-dialog/sprint-model';
import { SprintService } from '../sprint-dialog/sprint.service';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';

@Component({
  selector: 'app-add-sprint',
  templateUrl: './add-sprint.component.html',
  styleUrls: ['./add-sprint.component.scss']
})
export class AddSprintComponent implements OnInit {

  form: FormGroup;
  spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent>;
  minDate: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data, private fb: FormBuilder, private dialogRef: MatDialogRef<AddSprintComponent>,
              private sprintService: SprintService,
              private snackbar: MatSnackBar, private taskboardService: TaskBoardService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      sprintStartDate: ['', [Validators.required]],
      sprintEndDate: ['', [Validators.required]],
      sprintCounts: [2, [Validators.required, Validators.min(1)]],
    });
    this.minDate = new Date();
  }

  dateChange(event: MatDatepickerInputEvent<Date>): void {
    let days: number;
    if (this.data.taskboardVO?.sprintSettingsVo?.sprintDurationType === 'w') {
      days = this.data.taskboardVO?.sprintSettingsVo?.sprintDuration * 7;
    } else {
      days = this.data.taskboardVO?.sprintSettingsVo?.sprintDuration;
    }
    const startDate = new Date(this.form.get('sprintStartDate').value);
    const endDate = new Date(startDate.setDate(startDate.getDate() + days - 1));
    this.form.get('sprintEndDate').setValue(endDate);
  }

  dateChangeEnd(event: MatDatepickerInputEvent<Date>): void {
    this.form.get('sprintEndDate').setValue(event.value);
  }

  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }


  save(): void {
    let sprintVo = new SprintVO();
    // sprintVo.sprintCounts = this.form.get('sprintCounts').value;
    // const startDate = this.form.get('sprintStartDate').value;
    // const endDate = this.form.get('sprintEndDate').value
    // sprintVo.sprintStartDate = new Date(startDate.replace(/-/g, '\/').replace(/T.+/, ''));
    // sprintVo.sprintEndDate = new Date(endDate.replace(/-/g, '\/').replace(/T.+/, ''));
    sprintVo = this.form.getRawValue();
    sprintVo.sprintSettingsId = this.data.taskboardVO?.sprintSettingsVo?.sprintSettingsId;
    this.spinnerDialog();
    this.sprintService.saveSprint(sprintVo).subscribe(data => {
      if (data && data !== null) {
        if (data.response.includes('selected date range matches')) {
          this.spinner.close();
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: data.response
          });
        } else {
          this.data.taskboardVO.sprintsVoList = data.sprintVoList;
          if (this.data.from && this.data.from === 'task') {
            this.data.sprintTaskVO.sprintId = this.data.taskboardVO.sprintsVoList[this.data.taskboardVO.sprintsVoList.length - 1].sprintId;
            this.taskboardService.saveTasksToSprint(this.data.sprintTaskVO).subscribe(d => {
              this.spinner.close();
              this.dialogRef.close();
            }, error => {
              this.spinner.close();
            });
          } else {
            this.spinner.close();
            this.dialogRef.close();
          }
        }
      } else {
        this.spinner.close();
        this.dialogRef.close();
      }
    }, error => {
      this.spinner.close();
    });
  }
}
