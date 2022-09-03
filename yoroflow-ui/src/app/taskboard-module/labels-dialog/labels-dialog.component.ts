import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { element } from 'protractor';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';
import { LabelSelectedVO, LabelsVO, TaskboardLabelsVO, TaskboardTaskLabelVO, TaskboardTaskVO } from '../taskboard-form-details/taskboard-task-vo';

@Component({
  selector: 'app-labels-dialog',
  templateUrl: './labels-dialog.component.html',
  styleUrls: ['./labels-dialog.component.scss']
})
export class LabelsDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<LabelsDialogComponent>,
    private dialog: MatDialog, private fb: FormBuilder, private taskboardService: TaskBoardService, private snackbar: MatSnackBar) { }

  isFinance = false;
  isOnboard = false;
  isHardware = false;
  form: FormGroup;

  labelVO: LabelsVO[] = [];
  taskboardlabels = new TaskboardLabelsVO();

  addNewLabel: boolean = false;
  labelsVO: LabelSelectedVO[] = [];
  taskList: TaskboardTaskVO[] = [];
  index: number;

  ngOnInit(): void {
    this.form = this.fb.group({
      label: [],
    });
    if (this.data) {
      this.taskList = this.data.taskList;
      this.index = this.data.taskIndex;
      if (this.data.taskboardLabels.labels && this.data.taskboardLabels.labels.length && this.data.taskboardLabels.labels.length > 0) {
        this.taskboardlabels.labels = this.data.taskboardLabels.labels;
        for (let i = 0; i < this.data.taskboardLabels.labels.length; i++) {
          const labelsVO = new LabelSelectedVO();
          labelsVO.labelName = this.data.taskboardLabels.labels[i].labelName;
          labelsVO.labelcolor = this.data.taskboardLabels.labels[i].labelcolor;
          labelsVO.isSelected = false;
          labelsVO.id = this.data.taskboardLabels.labels[i].taskboardLabelId;
          labelsVO.taskboardTaskLabelId = this.data.taskboardLabels.labels[i].taskboardTaskLabelId;
          this.labelsVO.push(labelsVO);
        }
      }
      this.labelVO = this.data.labels;
      for (let i = 0; i < this.labelVO.length; i++) {
        this.labelsVO.forEach(data => {
          if (data.labelName === this.labelVO[i].labelName) {
            data.isSelected = true;
          }
        });
      }
    }
    this.formValueChanges();
  }

  formValueChanges(): void {
    this.form.get('label').valueChanges.subscribe(data => {
      if (data !== '') {
        let count: number = 0;
        this.labelsVO.forEach(element => {
          if (element.labelName === data) {
            count++;
          }
        });
        if (count > 0) {
          this.form.get('label').setErrors({ unique: true });
        } else if (this.form.get('label').errors?.unique) {
          this.form.get('label').setErrors(null);
        }
        if (data.length > 50) {
          this.form.get('label').setErrors({ maxError: true });
        } else if (this.form.get('label').errors?.maxError) {
          this.form.get('label').setErrors(null);
        }
      }
    });
  }

  onClick(label, i) {
    if (!this.data.eventAutomation) {
      this.labelsVO.forEach(data => {
        if (data.labelName === label.labelName) {
          if (data.isSelected === false) {
            data.isSelected = true;
          } else {
            data.isSelected = false;
          }
        }
      });
    }
  }

  close() {
    let removedIdList: string[] = [];
    this.labelVO = [];
    this.labelsVO.forEach(data => {
      if (data.isSelected === true) {
        const labelVO = new LabelsVO();
        labelVO.labelName = data.labelName;
        labelVO.labelcolor = data.labelcolor;
        labelVO.taskboardLabelId = data.id;
        this.labelVO.push(labelVO);
      }
    });
    const labelVO = this.labelVO;
    const taskboardLabels = this.taskboardlabels.labels;
    this.dialogRef.close({ labelVO: labelVO, taskboardLabels: taskboardLabels, labels: this.labelsVO, removedIdList: removedIdList });
  }

  addLabels() {
    this.addNewLabel = true;
  }

  getRandomColor() {
    return ("#" + ("000000" + Math.floor(Math.random() * 16777216).toString(16)).substr(-6));
  }

  saveLabels(event) {
    if (this.form.get('label').value !== undefined && this.form.get('label').value !== null && this.form.get('label').value !== '') {
      const newLabels = new LabelSelectedVO();
      newLabels.labelName = this.form.get('label').value;
      newLabels.labelcolor = this.getRandomColor();
      newLabels.isSelected = false;
      const label = {
        'labelName': this.form.get('label').value,
        'labelcolor': newLabels.labelcolor
      }
      if (this.taskboardlabels.labels === undefined || this.taskboardlabels.labels === null) {
        this.taskboardlabels.labels = [];
      }
      // this.taskboardlabels.labels.push(label);
      this.form.get('label').setValue('');
      this.addNewLabel = false;
      this.taskboardlabels.taskboardId = this.data.taskboardId;
      const taskboardLabelVO = new TaskboardLabelsVO();
      taskboardLabelVO.taskboardId = this.data.taskboardId;
      const labels = new LabelsVO();
      labels.labelName = newLabels.labelName;
      labels.labelcolor = newLabels.labelcolor;
      if (taskboardLabelVO.labels === undefined || taskboardLabelVO.labels === null) {
        taskboardLabelVO.labels = [];
      }
      taskboardLabelVO.labels.push(labels);
      // this.taskboardService.saveTaskboardLebles(this.taskboardlabels).subscribe(data => {
      this.taskboardService.saveTaskboardLabel(taskboardLabelVO).subscribe(data => {
        if (data.response === 'Invalid taskboard Id') {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: data.response
          })
        } else {
          newLabels.id = data.uuid;
          labels.taskboardLabelId = data.uuid;
          this.labelsVO.push(newLabels);
          this.taskboardlabels.labels.push(labels);
        }
      });
    }
  }

}
