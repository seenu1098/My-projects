import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, NgForm, FormArray } from '@angular/forms';
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA } from 'mat-right-sheet';
import { debounceTime } from 'rxjs/operators';
import { Permission, Security, YoroGroups } from './security-vo';
import { SecurityService } from './security.service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-yoro-security',
  templateUrl: './yoro-security.component.html',
  styleUrls: ['./yoro-security.component.css']
})
export class YoroSecurityComponent implements OnInit {

  constructor(private fb: FormBuilder, private securityService: SecurityService, private snackBar: MatSnackBar,
    // private rightSheetRef: MatRightSheetRef<YoroSecurityComponent>,
    //  @Inject(MAT_RIGHT_SHEET_DATA) public data: any, YoroSecurityComponent,
              public dialogRef: MatDialogRef<YoroSecurityComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
               ) { }

  pagePermissionsForm: FormGroup;
  pagePermissionsVOList: Permission[];
  pageSecurityVO = new Security();
  yoroGroups: YoroGroups[];
  allCheckBoxControl = {};
  spinner = true;
  selectedGroupNames: string[] = [];

  ngOnInit() {
    this.createForm();
    this.getGroupNamesAutoCompleteList('0');
    this.addValidatorGroupNames(0);
    this.allCheckBoxControl[0] = false;
    this.getSecurityPermissions();
  }

  createForm() {
    this.pagePermissionsForm = this.fb.group({
      securityId: [this.data.id],
      pagePermissions: this.fb.array([this.addPagePermissionFormGroup()])
    });
  }

  getSecurityPermissions() {
    if (this.data.securityType === 'workflow') {
      this.securityService.getWorkflowPermissions(this.data.id).subscribe(data => {
        this.pagePermissionsVOList = data;
        this.loadFormData(this.pagePermissionsVOList);
      });
    } else {
      this.securityService.getTaskPermissions(this.data.id).subscribe(data => {
        this.pagePermissionsVOList = data;
        this.loadFormData(this.pagePermissionsVOList);
      });
    }
  }

  addValidatorGroupNames(i: number) {
    const index = '' + i;
    const formArray = this.getPermissionsFormArray();
    const form = formArray.get(index);
    form.get('groupId').valueChanges.pipe(debounceTime(500))
      .subscribe(data => {
        const groupNameIndex = this.selectedGroupNames.indexOf(data);
        if (groupNameIndex > -1 && data !== null && groupNameIndex !== i) {
          form.get('groupId').setErrors({ validators: true });
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Team Name already selected',
          });
        } else {
          if (data !== '') {
            this.selectedGroupNames[i] = data;
          }
        }
      });
  }

  loadFormData(list: Permission[]) {
    for (let i = 0; i < list.length; i++) {
      // this.getGroupNamesAutoCompleteList('' + i);
      if (i > 0) {
        this.addPermission();
      }
      (this.getPermissionsFormArray().get('' + i) as FormGroup).patchValue(list[i]);
      if (list[i].readAllowed === true && list[i].updateAllowed === true &&
        list[i].deleteAllowed === true && list[i].createAllowed === true && list[i].launchAllowed === true) {
        this.allCheckBoxControl[i] = true;
      }
    }
  }

  getGroupNamesAutoCompleteList(index) {
    const groupName = this.getPermissionsFormArray().get('' + index).get('groupName');
    groupName.valueChanges.pipe(debounceTime(300)).subscribe(name => {
      if (name !== null && name !== '') {
        this.securityService.getGroupNames(name).subscribe(data => {
          this.yoroGroups = data;
        });
      }
    });
  }

  addPagePermissionFormGroup() {
    return this.fb.group({
      id: [],
      tenantId: [],
      securityId: [this.data.id],
      groupId: ['', Validators.required],
      groupName: [],
      createAllowed: [false],
      readAllowed: [false],
      updateAllowed: [false],
      deleteAllowed: [false],
      launchAllowed: [false],
      publishAllowed: [false]
    });
  }

  setGroupId($event, groupId, index) {
    if ($event.isUserInput === true) {
      this.getPermissionsFormArray().get('' + index).get('groupId').setValue(groupId);
    }
  }

  getPermissionsFormArray() {
    return (this.pagePermissionsForm.get('pagePermissions') as FormArray);
  }

  addPermission() {
    const length = this.getPermissionsFormArray().length;
    this.getPermissionsFormArray().push(this.addPagePermissionFormGroup());
    this.getGroupNamesAutoCompleteList(length);
    this.addValidatorGroupNames(length);
    this.allCheckBoxControl[length] = false;
  }

  removePermission(i) {
    const deletedID = (this.getPermissionsFormArray().get('' + i) as FormGroup).get('id').value;
    if (deletedID !== null && deletedID !== '') {
      this.pageSecurityVO.deletedIDList.push(deletedID);
    }
    this.getPermissionsFormArray().removeAt(i);
    this.selectedGroupNames.splice(i);
    this.pagePermissionsForm.markAsDirty();
  }

  setAllChecked($event, index: number) {
    this.pagePermissionsForm.markAsDirty();
    const group = (this.getPermissionsFormArray().get('' + index) as FormGroup);
    this.allCheckBoxControl[index] = $event.checked;
    if ($event.checked === true) {
      group.get('readAllowed').setValue(true);
      group.get('updateAllowed').setValue(true);
      group.get('deleteAllowed').setValue(true);
      group.get('createAllowed').setValue(true);
      group.get('launchAllowed').setValue(true);
      group.get('publishAllowed').setValue(true);
    } else {
      group.get('readAllowed').setValue(false);
      group.get('updateAllowed').setValue(false);
      group.get('deleteAllowed').setValue(false);
      group.get('createAllowed').setValue(false);
      group.get('launchAllowed').setValue(false);
      group.get('publishAllowed').setValue(false);
    }
  }

  unCheckValue($event, i) {
    this.pagePermissionsForm.markAsDirty();
    if ($event.checked === false) {
      this.allCheckBoxControl[i] = $event.checked;
    }
  }

  getAccessToCreatePermission() {
    let returnValue;
    this.pageSecurityVO.permissionsVOList.forEach(permission => {
      if (permission.createAllowed === false && permission.updateAllowed === false &&
        permission.deleteAllowed === false && permission.readAllowed === false && permission.publishAllowed === false) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Select one of user action',
        });
        returnValue = false;
        return false;
      } else {
        returnValue = true;
        return true;
      }
    });
    return returnValue;
  }

  save(userForm) {
    this.pageSecurityVO.permissionsVOList = this.getPermissionsFormArray().value;
    this.getAccessToCreatePermission();
    if (userForm.valid && userForm.dirty && this.getAccessToCreatePermission() === true) {
      this.pageSecurityVO.securityId = this.data.id;
      this.pageSecurityVO.permissionsVOList = this.getPermissionsFormArray().value;
      if (this.data.securityType === 'workflow') {
        this.securityService.saveWorkflowPermissions(this.pageSecurityVO).subscribe(data => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          if (!data.response.includes('Team does not exist')) {
            this.resetForm(userForm);
          }

        });
      } else {
        this.securityService.saveTaskPermissions(this.pageSecurityVO).subscribe(data => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });

          if (!data.response.includes('Team does not exist')) {
            this.resetForm(userForm);
          }
        });
      }
    }
  }

  resetForm(userForm: NgForm) {
    userForm.resetForm();
    this.ngOnInit();
    this.allCheckBoxControl = {};
    this.selectedGroupNames = [];
  }

  cancel() {
    this.dialogRef.close();
  }

}
