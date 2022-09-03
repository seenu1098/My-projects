import { filter } from 'rxjs/operators';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { ThemeService } from 'src/app/services/theme.service';
import { AddSprintComponent } from '../add-sprint/add-sprint.component';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';

@Component({
  selector: 'app-sprint-tasks',
  templateUrl: './sprint-tasks.component.html',
  styleUrls: ['./sprint-tasks.component.scss']
})
export class SprintTasksComponent implements OnInit {

  form: FormGroup;
  spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent>;

  sprintStatusList: any[] = [
    { name: 'In Preparation', value: 'p', color: '#87cefa' },
    { name: 'In Running', value: 'r', color: 'rgb(255, 209, 93)' },
    { name: 'Completed', value: 'c', color: '#20b2aa' }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SprintTasksComponent>, private dialog: MatDialog,
    private fb: FormBuilder, private taskboardService: TaskBoardService) { }

  ngOnInit(): void {
    if (this.data?.type !== 'running') {
      this.form = this.fb.group({
        sprint: ['', [Validators.required]]
      });
    }
  }

  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }

  createSprint(): void {
    this.dialogRef.close();
    const dialog = this.dialog.open(AddSprintComponent, {
      width: '400px',
      disableClose: true,
      data: { taskboardVO: this.data?.taskboardVo, sprintTaskVO: this.data.sprintTaskVO, from: 'task' }
    });
  }

  save(userForm: NgForm): void {
    if (userForm.valid) {
      if (this.form.get('sprint').value !== null && this.form.get('sprint').value !== '') {
        this.taskboardService.checkSprintTasksRunning(this.form.get('sprint').value).subscribe(sprint => {
          if (sprint) {
            if (sprint.response === 'r') {
              this.openDialogForCheck();
            } else if (sprint.response !== 'invalid' && sprint.response !== 'c') {
              this.saveTaskTosprint();
            }
          }
        });
      }
    }
  }

  saveTaskTosprint() {
    this.data.sprintTaskVO.sprintId = this.form.get('sprint').value;
    this.spinnerDialog();
    this.taskboardService.saveTasksToSprint(this.data.sprintTaskVO).subscribe(data => {
      this.spinner.close();
      this.dialogRef.close();
    });
  }

  openDialogForCheck() {
    const dialog = this.dialog.open(SprintTasksComponent, {
      width: '550px',
      data: { type: 'running' }
    });
    dialog.afterClosed().subscribe((data) => {
      if (data && data === true) {
        this.saveTaskTosprint();
      }
    });
  }

  closeCheckDialog(value) {
    this.dialogRef.close(value);
  }

  getSprintStatusColor(sprintStatus: string): string {
    return this.sprintStatusList.find(s => s.value === sprintStatus)?.color;
  }

  getSprintStatusName(sprintStatus: string): string {
    return this.sprintStatusList.find(s => s.value === sprintStatus)?.name;
  }

}
