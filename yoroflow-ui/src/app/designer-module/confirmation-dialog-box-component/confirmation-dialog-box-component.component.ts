import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { AdhocTaskService } from '../shared/service/adhoc-task.service';
import { AdhocTask } from '../shared/vo/adhoc-task-vo';
import { TaskPropertyService } from '../task-property/task-property.service';
import { GroupVO } from '../task-property/model/group-vo';
import { UserVO } from '../task-property/model/user-vo';
import { Workflow } from '../task-flow/model/workflow.model';
import { Page, Permission } from '../task-flow/model/page-vo';
// import { TaskPropertyService } from '../task-property/task-property.service';
// import { GroupVO } from '../task-property/model/group-vo';
// import { UserVO } from '../task-property/model/user-vo';
// import { Workflow } from '../task-flow/model/workflow.model';
// import { Page, Permission } from '../task-flow/model/page-vo';
import { ignoreElements } from 'rxjs/operators';



@Component({
  selector: 'app-confirmation-dialog-box-component',
  templateUrl: './confirmation-dialog-box-component.component.html',
  styleUrls: ['./confirmation-dialog-box-component.component.css']
})
export class ConfirmationDialogBoxComponentComponent implements OnInit {
  // tslint:disable-next-line: max-line-length
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ConfirmationDialogBoxComponentComponent>, private dialog: MatDialog,
    private taskPropertyService: TaskPropertyService,
    // tslint:disable-next-line: align
    private adhocTaskService: AdhocTaskService, private snackBar: MatSnackBar, private fb: FormBuilder) { }
  adhocTask: AdhocTask;

  form: FormGroup
  permissionForm: FormGroup;
  userList: UserVO[];
  groupList: GroupVO[];
  workflow: Workflow;
  page: Page[] = [];
  permission: Permission[] = [];
  required = false;

  ngOnInit() {
    if (this.data.data && this.data.data === 'importPermission') {
      this.workflow = this.data.workflow;
      this.page = this.data.page;
      this.loadGroupsList();
      this.loadUsersList();
      this.permissionForm = this.fb.group({
        permissionFormArray: this.fb.array([
          this.permissionFormGroup()
        ])
      });
      this.loadPermissionFormGroup();
    } else {
      this.form = this.fb.group({
        export: [''],
      });
      this.form.get('export').setValue('includingForms');
    }
  }

  loadUsersList() {
    this.taskPropertyService.getUsersList().subscribe(data => {
      this.userList = data;
    });
  }

  loadGroupsList() {
    this.taskPropertyService.getGroupsList().subscribe(data => {
      this.groupList = data;
    });
  }

  permissionFormGroup(): FormGroup {
    return this.fb.group({
      taskType: [''],
      pageName: [''],
      assigneeUser: [''],
      assigneeGroup: [''],
      taskKey: ['']
    });
  }

  getPermissionFormGroup() {
    return (this.permissionForm.get('permissionFormArray') as FormArray).controls;
  }

  addPermissionFormGroup() {
    (this.permissionForm.get('permissionFormArray') as FormArray).push(this.permissionFormGroup());
  }

  loadPermissionFormGroup() {
    let j = 0;
    for (let i = 0; i < this.workflow.taskNodeList.length; i++) {
      const taskNode = this.workflow.taskNodeList[i];
      if (taskNode.taskType === 'START_TASK' || taskNode.taskType === 'USER_TASK' || taskNode.taskType === 'APPROVAL_TASK') {
        if (i > 0) {
          this.addPermissionFormGroup();
          j++;
        }
        const group = ((this.permissionForm.get('permissionFormArray') as FormArray).get('' + j) as FormGroup);
        group.get('taskType').setValue(taskNode.taskType);
        group.get('pageName').setValue(taskNode.taskProperty.propertyValue.formIdentifier);
        group.get('taskKey').setValue(taskNode.key);
        group.get('taskType').disable();
        group.get('pageName').disable();
      }
    }
  }

  submit(userForm) {
    if (userForm.valid) {
      this.required = false;
      for (let i = 0; i < this.getPermissionFormGroup().length; i++) {
        const formArray = this.permissionForm.get('permissionFormArray').get('' + i);
        const taskKey = formArray.get('taskKey').value;
        let assigneeUser = formArray.get('assigneeUser').value;
        let assigneeGroup = formArray.get('assigneeGroup').value;
        if (assigneeUser === '' && assigneeGroup.length === 0) {
          this.required = true;
        }
      }
      if (this.required === false) {
        for (let i = 0; i < this.getPermissionFormGroup().length; i++) {
          const formArray = this.permissionForm.get('permissionFormArray').get('' + i);
          const taskKey = formArray.get('taskKey').value;
          let assigneeUser = formArray.get('assigneeUser').value;
          let assigneeGroup = formArray.get('assigneeGroup').value;
          this.workflow.taskNodeList.forEach(task => {
            if (task.key === taskKey) {
              task.taskProperty.propertyValue.assigneeUser = assigneeUser;
              task.taskProperty.propertyValue.assigneeGroup = assigneeGroup;
            }
          });
        }
        for (let i = 0; i < this.getPermissionFormGroup().length; i++) {
          for (let j = 0; j < this.workflow.taskNodeList.length; j++) {
            if ((this.workflow.taskNodeList[j].taskType === 'START_TASK' || this.workflow.taskNodeList[j].taskType === 'USER_TASK'
              || this.workflow.taskNodeList[j].taskType === 'APPROVAL_TASK') && this.workflow.taskNodeList[j]?.taskProperty?.propertyValue !== null
              && this.workflow.taskNodeList[j].taskProperty.propertyValue.pageName
              && this.page[i]?.pageName === this.workflow.taskNodeList[j].taskProperty.propertyValue.pageName) {
              const permission = new Permission();
              permission.createAllowed = true;
              permission.deleteAllowed = true;
              permission.readAllowed = true;
              permission.updateAllowed = true;
              permission.pageName = this.page[i].pageName;
              if (this.workflow.taskNodeList[j].taskProperty.propertyValue.assigneeGroup.length > 0) {
                permission.assigneeGroup = this.workflow.taskNodeList[j].taskProperty.propertyValue.assigneeGroup;
              } else {
                permission.assigneeUser = this.workflow.taskNodeList[j].taskProperty.propertyValue.assigneeUser;
              }
              if (this.permission.length > 0 && this.permission.some(permissions => permissions.pageName !== permission.pageName)) {
                this.permission.push(permission);
              } else if (this.permission.length === 0) {
                this.permission.push(permission);
              }
            }
          }
        }
        this.dialogRef.close({ workflow: this.workflow, permission: this.permission });
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  deleteNotes() {
    this.adhocTaskService.deleteNotes(this.data.id).subscribe(res => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: res.response
      });
      this.dialogRef.close(true);
    });
  }

  deleteFiles() {
    this.adhocTaskService.deleteFiles(this.data.id).subscribe(res => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: res.response
      });
      this.dialogRef.close(true);
    });
  }

  openPage() {
    this.dialogRef.close(true);
  }

  exportUI() {
    if (this.form.get('export').value === 'includingForms') {
      this.dialogRef.close('exportWithForms');
    } else {
      this.dialogRef.close(true);
    }
  }

  exportWithForms() {
    this.dialogRef.close('exportWithForms');
  }

  radioChange(event) {
    if (event.value === 'includingForms') {
      this.form.get('export').setValue('includingForms');
    } else {
      this.form.get('export').setValue('excludingForms');
    }
  }

}


