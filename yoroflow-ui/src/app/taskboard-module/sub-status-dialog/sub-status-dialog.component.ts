import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { SubStatusVO } from '../taskboard-configuration/taskboard.model';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';
import { TaskboardTaskVO } from '../taskboard-form-details/taskboard-task-vo';

@Component({
  selector: 'app-sub-status-dialog',
  templateUrl: './sub-status-dialog.component.html',
  styleUrls: ['./sub-status-dialog.component.scss']
})
export class SubStatusDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SubStatusDialogComponent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private taskService: TaskBoardService) { }

  subStatusForm: FormGroup;
  deleteIdList: string[] = [];
  selectedSubStatusIndex: any;

  subStatusColorArray1: string[] = ['#ff0000', '#008000', '#ffff00', '#F7D6D0', '#EC9EC0'];
  subStatusColorArray2: string[] = ['#0000ff', '#ee82ee', '#ffa500', '#FCB5AC', '#B99095'];
  subStatusColorArray3: string[] = ['#ffffff', '#65463E', '#E1C340', '#4CD7D0', '#A4E8E0'];

  ngOnInit(): void {
    this.subStatusForm = this.formBuilder.group({
      subStatus: this.formBuilder.array([
        this.subStatusFormGroup()
      ]),
    });
    if (this.data.data && this.data.data.length > 0) {
      this.loadSubStatus(this.data.data);
    } else {
      this.taskService.getSubStatus(this.data.columnId).subscribe(subStatusVOList => {
        this.loadSubStatus(subStatusVOList);
      });
    }
  }

  loadSubStatus(subStatus: SubStatusVO[]): void {
    if (subStatus && subStatus.length > 0) {
      for (let i = 0; i < subStatus.length; i++) {
        if (i > 0) {
          this.addSubStatusArray();
        }
        const group = ((this.subStatusForm.get('subStatus') as FormArray).get('' + i)) as FormGroup;
        group.get('id').setValue(subStatus[i].id);
        group.get('name').setValue(subStatus[i].name);
        group.get('color').setValue(subStatus[i].color);
        group.get('columnOrder').setValue(i);
        group.get('previousName').setValue(subStatus[i].previousName);
      }
    }
  }

  subStatusFormGroup(): FormGroup {
    return this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
      color: [this.subStatusColorArray1[0]],
      columnOrder: [0],
      previousName: ['']
    });
  }

  getSubStatusFormArray(): FormArray {
    return this.subStatusForm.get('subStatus') as FormArray;
  }

  addSubStatusArray(): void {
    (this.subStatusForm.get('subStatus') as FormArray).push(this.subStatusFormGroup());
    const index = (this.subStatusForm.get('subStatus') as FormArray).length - 1;
    this.subStatusForm.get('subStatus').get('' + index).get('color').setValue(index > 4 ? '#ff0000' : this.subStatusColorArray1[index])
    this.subStatusForm.get('subStatus').get('' + index).get('columnOrder').setValue(index);
  }

  removeSubStatusArray(i: number): void {
    if (this.isSubStatus(i) === true) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'This sub status has tasks, move the tasks from this sub status'
      });
    } else {
      this.deleteIdList.push(this.subStatusForm.get('subStatus').get('' + i).get('id').value);
      (this.subStatusForm.get('subStatus') as FormArray).removeAt(i);
      this.setSubStatusColumnOrder();
    }
  }

  isSubStatus(index: number): boolean {
    var taskList: TaskboardTaskVO[] = [];
    taskList = this.data.taskList;
    if (taskList && taskList.length > 0) {
      for (let i = 0; i < taskList.length; i++) {
        if (taskList[i].subStatus === this.subStatusForm.get('subStatus').get('' + index).get('name').value) {
          return true
        }
      }
    }
    return false;
  }

  subStatusClose(): void {
    this.dialogRef.close(false);
  }

  createSubStatus(): void {
    if (this.subStatusForm.valid && (this.subStatusForm.dirty || this.deleteIdList)) {
      this.dialogRef.close({ formValue: this.subStatusForm.getRawValue(), deleteIdList: this.deleteIdList });
    } else if (this.subStatusForm.valid && !this.subStatusForm.dirty) {
      this.dialogRef.close(false);
    }
  }

  mousedown(i: number): void {
    this.selectedSubStatusIndex = i;
  }

  setSubStatusColor(color: string): void {
    this.subStatusForm.get('subStatus').get('' + this.selectedSubStatusIndex).get('color').setValue(color);
  }

  getSubStatusNames(): any[] {
    const formArray = this.subStatusForm.get('subStatus') as FormArray;
    const subStatusList: any[] = [];
    for (let i = 0; i < formArray.length; i++) {
      var subStatus = {
        name: formArray.get('' + i).get('name').value,
        index: i
      }
      subStatusList.push(subStatus);
    }
    return subStatusList;
  }

  checkSubStatusNameExist(index: number): void {
    const formArray = this.subStatusForm.get('subStatus') as FormArray;
    const group = formArray.get('' + index);
    const value = group.get('name').value;
    const subStatusList = this.getSubStatusNames();
    for (let i = 0; i < formArray.length; i++) {
      if (subStatusList.some(field => (field.name === value && field.index !== index))) {
        group.get('name').setErrors({ alreadyExist: true });
      }
      const name = formArray.get('' + i).get('name');
      if (name.errors && name.errors.alreadyExist === true) {
        if (!subStatusList.some(field => (field.index !== i && field.name === name.value))) {
          name.setErrors(null);
        }
      }
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    const from = event.previousIndex;
    const to = event.currentIndex;
    this.moveItemInFormArray(from, to);
  }

  moveItemInFormArray(fromIndex: number, toIndex: number): void {
    const formArray = this.subStatusForm.get('subStatus') as FormArray;
    if (fromIndex === toIndex) {
      return;
    }
    const array = formArray.value;
    const currentIndexColumn = array[fromIndex];
    const columns = JSON.parse(JSON.stringify(formArray.value));
    if (fromIndex > toIndex) {
      formArray.insert(toIndex, formArray.get('' + fromIndex));
      formArray.removeAt(fromIndex + 1);
      this.setSubStatusColumnOrder();
    } else {
      for (let i = toIndex; i >= fromIndex; i--) {
        if (i < toIndex) {
          formArray.get('' + i).setValue(columns[i + 1]);
        } else if (i === toIndex) {
          formArray.get('' + i).setValue(currentIndexColumn);
        }
      }
      for (let i = 0; i < formArray.length; i++) {
        formArray.get('' + i).get('columnOrder').setValue(i);
      }
    }
  }

  setSubStatusColumnOrder(): void {
    const formArray = this.subStatusForm.get('subStatus') as FormArray;
    for (let i = 0; i < formArray.length; i++) {
      formArray.get('' + i).get('columnOrder').setValue(i);
    }
  }
}

