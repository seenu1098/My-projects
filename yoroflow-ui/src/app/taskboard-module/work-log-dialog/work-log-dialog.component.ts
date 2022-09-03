import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, NgModel, NgForm, Form } from '@angular/forms';
import { WorkLogVo } from './work-log-model';
import { WorkLogService } from '../work-log-dialog/work-log.service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';



@Component({
  selector: 'app-work-log-dialog',
  templateUrl: './work-log-dialog.component.html',
  styleUrls: ['./work-log-dialog.component.scss']
})
export class WorkLogDialogComponent implements OnInit {

  workLogForm: FormGroup;
  minDate = new Date();
  maxDate = new Date();

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<WorkLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private worklogservice: WorkLogService, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.initialize();
    this.setMinAndMaxDate();
  }

  setMinAndMaxDate() {
    this.minDate = this.data?.taskVO?.sprintsVo?.sprintStartDate == null ? new Date() : this.data?.taskVO?.sprintsVo?.sprintStartDate;
    this.maxDate = this.data?.taskVO?.sprintsVo?.sprintEndDate == null ? new Date() : this.data?.taskVO?.sprintsVo?.sprintEndDate;
  }

  initialize(): void {
    this.workLogForm = this.fb.group({
      timespent: ['', [Validators.required, Validators.min(1)]],
      workDate: ['', [Validators.required]],
      description: [''],
      workLogId: []
    });
    if (this.data.workLogVo) {
      this.workLogForm.patchValue(this.data.workLogVo);
    }
  }

  onSubmit(userForm): void {
    if (userForm.valid) {
      let workLogVo = new WorkLogVo();
      workLogVo = this.workLogForm.getRawValue();
      workLogVo.sprintTaskId = this.data.taskVO.sprintTaskId;
      this.worklogservice.saveWorkLog(workLogVo).subscribe(d => {
        if (d !== null) {
          this.dialogRef.close(true);
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: d.response
          });
          this.worklogservice.getRemainingHours(this.data.taskVO.sprintTaskId).subscribe(res => {
            this.data.taskVO.remainingHours = res.remainingHours;
          });
        }
      }, error => {
        this.dialogRef.close(false);
      });
    }
  }


  // getWorkListInfo(){
  //   this.worklogservice.getWorkList(this.getPaginationForWorkLog()).subscribe(d=>{
  //     if(d !== null){
  //       this.workLog = d.workLogVoList;
  //       if(d.totalRecords !== null ){
  //         this.resultsLength = d.totalRecords;
  //       } else{
  //         this.resultsLength = 0;
  //       }
  //       this.isPaginator = true;
  //       this.isLength = true;
  //     }
  //   })
  //   }
}
