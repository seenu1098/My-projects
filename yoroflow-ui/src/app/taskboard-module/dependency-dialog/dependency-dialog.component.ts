import { I } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs/operators';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { TaskboardVO } from '../taskboard-configuration/taskboard.model';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';
import { TaskboardTaskVO } from '../taskboard-form-details/taskboard-task-vo';
import { TaskDependencies } from './dependency-model';

@Component({
  selector: 'app-dependency-dialog',
  templateUrl: './dependency-dialog.component.html',
  styleUrls: ['./dependency-dialog.component.scss']
})
export class DependencyDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<DependencyDialogComponent>,
    private dialog: MatDialog, private fb: FormBuilder, private taskboardService: TaskBoardService, private snackbar: MatSnackBar) { }

  form: FormGroup;
  taskboard = new TaskboardVO();
  taskboardTaskVO = new TaskboardTaskVO();
  taskList: TaskboardTaskVO[] = [];
  filteredTaskList: TaskboardTaskVO[] = [];
  spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent, any>;
  isDisable: boolean = true;
  doneColumnName: string;
  ngOnInit(): void {
    this.form = this.fb.group({
      search: []
    });
    this.taskboard = this.data.taskboard;
    this.taskboardTaskVO = this.data.taskVO;
    this.getTaskList();
    this.valueChanges();
    this.doneColumnName = this.taskboard.taskboardColumnMapVO[this.taskboard.taskboardColumnMapVO.length - 1].taskboardColumnsVO.columnName;
  }

  valueChanges(): void {
    this.form.get('search').valueChanges.pipe(debounceTime(500)).subscribe(data => {
      if (data) {
        this.filteredTaskList = this.taskList.filter(task => task.taskId.toLowerCase().includes(data.toLowerCase()));
        const taskList = this.taskList.filter(task => task.taskName?.toLowerCase().includes(data.toLowerCase()));
        taskList.forEach(task => {
          this.filteredTaskList.push(task);
        });
        this.filteredTaskList = this.filteredTaskList.filter((f, i) => this.filteredTaskList.findIndex(task => task.id == f.id) === i);
      } else {
        this.filteredTaskList = this.taskList;
      }
    });
  }

  getTaskList(): void {
    const waitingOnTaskList = this.taskboardTaskVO.taskDependenciesVO['waitingOn'];
    const blockingTaskList = this.taskboardTaskVO.taskDependenciesVO['blocking'];
    const doneColumnName = this.taskboard.taskboardColumnMapVO[this.taskboard.taskboardColumnMapVO.length - 1].taskboardColumnsVO.columnName;
    this.taskboard.taskboardColumnMapVO.forEach(columnMap => {
      columnMap.taskboardTaskVOList.forEach(task => {
        if (task.id !== this.taskboardTaskVO.id && (this.data.type === 'relatedTasks'
          || (!waitingOnTaskList.some(dependencyTask => dependencyTask.id === task.id)
            && !blockingTaskList.some(dependencyTask => dependencyTask.id === task.id))
          && columnMap.taskboardColumnsVO.columnName !== doneColumnName)) {
          task.isSelected = false;
          this.taskList.push(task);
          this.filteredTaskList.push(task);
        }
      });
    });
  }

  handleDependency(task: TaskboardTaskVO): void {
    if (task.isSelected === false) {
      task.isSelected = true;
    } else {
      task.isSelected = false;
    }
    this.isDisable = !this.filteredTaskList.some(task => task.isSelected === true);
  }

  saveDependencies(): void {
    const dependencyVO = new TaskDependencies();
    if (this.data.type === 'waitingOn') {
      dependencyVO.taskId = this.data.taskId;
      this.taskList.forEach(task => {
        if (task.isSelected === true) {
          const taskVO = new TaskboardTaskVO();
          taskVO.id = task.id;
          taskVO.taskId = task.taskId;
          taskVO.status = task.status;
          dependencyVO.waitingOn.push(taskVO);
        }
      });
    } else if (this.data.type === 'blocking') {
      dependencyVO.taskId = this.data.taskId;
      this.taskList.forEach(task => {
        if (task.isSelected === true) {
          const taskVO = new TaskboardTaskVO();
          taskVO.id = task.id;
          taskVO.taskId = task.taskId;
          taskVO.status = task.status;
          dependencyVO.blocking.push(taskVO);
        }
      });
    } else {
      dependencyVO.taskId = this.data.taskId;
      this.taskList.forEach(task => {
        if (task.isSelected === true) {
          const taskVO = new TaskboardTaskVO();
          taskVO.id = task.id;
          taskVO.taskId = task.taskId;
          taskVO.status = task.status;
          dependencyVO.relatedTasks.push(taskVO);
        }
      });
    }
    this.spinnerDialog();
    this.taskboardService.saveDependency(dependencyVO).subscribe(data => {
      this.spinner.close();
      if (data) {
        if (this.data.type === 'waitingOn') {
          data.waitingOn.forEach(element => {
            const taskVO = dependencyVO.waitingOn.find(task => task.id === element.id);
            element.status = taskVO.status;
            this.taskboardTaskVO.taskDependenciesVO.waitingOn.push(element);
          });
        } else if (this.data.type === 'blocking') {
          data.blocking.forEach(element => {
            const taskVO = dependencyVO.blocking.find(task => task.id === element.id);
            element.status = taskVO.status;
            this.taskboardTaskVO.taskDependenciesVO.blocking.push(element);
          });
        } else {
          data.relatedTasks.forEach(element => {
            const taskVO = dependencyVO.relatedTasks.find(task => task.id === element.id);
            element.status = taskVO.status;
            this.taskboardTaskVO.taskDependenciesVO.relatedTasks.push(element);
          });
        }
        this.dialogRef.close();
      }
    }, error => {
      this.spinner.close();
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: 'Internal server error'
      });
    });
  }

  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
