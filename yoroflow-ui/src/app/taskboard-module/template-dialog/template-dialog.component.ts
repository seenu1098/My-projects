import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Page, Security } from 'src/app/rendering-module/shared/vo/page-vo';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { EventAutomationService } from '../event-automation/event-automation.service';
import { SprintDialogComponent } from '../sprint-dialog/sprint-dialog.component';
import { TaskboardVO } from '../taskboard-configuration/taskboard.model';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';

@Component({
  selector: 'app-template-dialog',
  templateUrl: './template-dialog.component.html',
  styleUrls: ['./template-dialog.component.scss']
})
export class TemplateDialogComponent implements OnInit {
  form: FormGroup;
  taskboardVO: TaskboardVO;
  sprintSettings: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TemplateDialogComponent>,
    private taskService: TaskBoardService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private automationService: EventAutomationService,
    private router: Router) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      taskboardKey: ['', [Validators.required]],
      sprintEnabled: [false]
    });
    this.form.get('name').valueChanges.subscribe((res) => {
      const taskboardKey = this.form
        .get('name')
        .value.toLowerCase()
        .split(' ')
        .join('-');
      this.form.get('taskboardKey').setValue(taskboardKey);
    });
  }

  closeDialog() {
    const taskVO = null;
    const flag = false;
    const newTask = null;
    this.dialogRef.close({ taskVO, flag, newTask });
  }




  checkTaskboardNameExist() {
    if (this.form.get('name').value !== null &&
      this.form.get('name').value !== '') {
      this.taskService
        .checkTaskboardName(this.form.get('name').value)
        .subscribe((data) => {
          if (data.response !== 'New Name') {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            this.form.get('name').setErrors({ alreadyExist: true });
            this.form.markAllAsTouched();
          } else {
            this.form.get('name').setErrors(null);
          }
        });
    }
  }

  checkTaskboardKeyExist() {
    if (
      this.form.get('taskboardKey').value !== '' &&
      this.form.get('taskboardKey').value !== null
    ) {
      this.taskService
        .checkTaskboardKey(this.form.get('taskboardKey').value)
        .subscribe((data) => {
          if (data.response !== 'New Key') {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            this.form.get('taskboardKey').setErrors({ alreadyExist: true });
          } else {
            this.form.get('taskboardKey').setErrors(null);
          }
        });
    }
  }


  save() {
    if (this.form.valid) {
      let page = new Page();
      page = this.data.page;
      page.yorosisPageId = null;
      page.applicationId = '511401b9-1300-45c7-99cc-36e8b95aae52';
      page.applicationName = 'Yoroflow-App';
      this.taskService.savePage(page).subscribe(pageResponse => {
        if (pageResponse && pageResponse.response.includes('successfully')) {
          if (this.data.tableObjectListVO.length > 0) {
            this.taskService.saveTableListVO(this.data.tableObjectListVO).subscribe(tableResponse => {
            });
          }
        }
      });

      this.taskboardVO = this.data.taskboardVO;
      this.taskboardVO.taskboardColumns.forEach(c => c.isDoneColumn = false);
      this.taskboardVO.taskboardColumns[this.taskboardVO.taskboardColumns.length - 1].isDoneColumn = true;
      this.taskboardVO.sprintEnabled = this.form.get('sprintEnabled').value;
      this.taskboardVO.name = this.form.get('name').value;
      this.taskboardVO.taskboardKey = this.form.get('taskboardKey').value;
      if (this.form.get('sprintEnabled').value === true && this.sprintSettings?.sprintDuration) {
        this.taskboardVO.sprintSettingsVo = this.sprintSettings;
      }

      this.taskService
        .posttaskConfiguration(this.taskboardVO)
        .subscribe((resp) => {
          if (resp.response.includes('Successfully')) {
            const taskVO = resp.taskboardVO;
            const flag = true;
            const newTask = resp.taskboardTask;
            this.dialogRef.close({ taskVO, flag, newTask });

            if (this.data.automations !== undefined
              && this.data.automations !== null
              && this.data.automations.length > 0) {
              for (let i = 0; i < this.data.automations.length; i++) {
                this.data.automations[i].id = null;
                this.data.automations[i].taskboardId = taskVO.id;
              }
              this.automationService.saveMultipleAutomations(this.data.automations).subscribe();
            }
            if (this.data.taskboardLabels &&
              this.data.taskboardLabels.labels !== undefined
              && this.data.taskboardLabels.labels !== null &&
              this.data.taskboardLabels.labels.length > 0) {
              this.data.taskboardLabels.taskboardId = taskVO.id;
              this.data.taskService.saveTaskboardLebles(this.data.taskboardLabels).subscribe();
            }

          } else if (resp.response.includes('exceeded your limit')) {
            const dialog = this.dialog.open(AlertmessageComponent, {
              width: '450px',
              data: resp.licenseVO
            });
          }
        });
    }
  }

  openSprintSettings(): void {
    const dialog = this.dialog.open(SprintDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { taskboardId: this.taskboardVO?.id, sprintSettings: this.taskboardVO?.sprintSettingsVo }
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data.sprintSettings) {
        this.sprintSettings = data.sprintSettings
      } else if (!data) {
        this.form.get('sprintEnabled').setValue(false);
      }
    });
  }

}
