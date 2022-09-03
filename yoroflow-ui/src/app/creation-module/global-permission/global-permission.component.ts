import { ChangeDetectionStrategy } from '@angular/compiler';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs/operators';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { Permission, Security, YoroGroups } from './security-vo';
import { SecurityService } from './security.service';

@Component({
  selector: 'app-global-permission',
  templateUrl: './global-permission.component.html',
  styleUrls: ['./global-permission.component.scss']
})
export class GlobalPermissionComponent implements OnInit {

  constructor(private fb: FormBuilder, private pageSecurityService: SecurityService, private snackBar: MatSnackBar,private cdr:ChangeDetectorRef) { }

  pagePermissionsForm: FormGroup;
  pagePermissionsVOList: Permission[];
  pageSecurityVO = new Security();
  yoroGroups: YoroGroups[];
  allCheckBoxControl = {};
  spinner = true;
  selectedGroupNames: string[] = [];
  onAdd = new EventEmitter();
  isDisable = false;
  @Input() data: any;

  @Output() public globalPermissionData = new EventEmitter<any>();

  ngOnInit() {
    this.createForm();
    this.getGroupNamesAutoCompleteList('0');
    this.addValidatorGroupNames(0);
    this.allCheckBoxControl[0] = false;
    this.getSecurityPermissions();
    this.setPage();
  }

  setPage() {
    this.pagePermissionsForm.get('formId').setValue(this.data.pageName);
    this.pagePermissionsForm.get('formVersion').setValue(this.data.pageVersion);
  }

  createForm() {
    this.pagePermissionsForm = this.fb.group({
      securityId: [this.data.id],
      formId: [],
      formVersion: [],
      pagePermissions: this.fb.array([this.addPagePermissionFormGroup()])
    });
  }

  getSecurityPermissions() {
    if (this.data.securityType === 'page') {
      if (this.data.securityType === 'page') {
        this.pageSecurityService.getPagePermissions(this.data.id).subscribe(data => {
          if (data && data[0].id) {
            this.pagePermissionsVOList = data;
          } else {
            this.pagePermissionsVOList = this.data;
          }
          this.loadFormData(this.pagePermissionsVOList);
          // this.setPage(this.pagePermissionsVOList);
        });
      } else if (this.data.securityType === 'custom-page') {
        this.pageSecurityService.getCustomPagePermissions(this.data.id).subscribe(data => {
          this.pagePermissionsVOList = data;
          this.loadFormData(this.pagePermissionsVOList);
        });
      } else {
        this.pageSecurityService.getApplicationPermissions(this.data.id).subscribe(data => {
          this.pagePermissionsVOList = data;
          this.loadFormData(this.pagePermissionsVOList);
        });
      }
    }
  }

  focusOutForGroupName($event, i) {
    const name = $event.target.value;
    if (name && name !== '') {
      this.pageSecurityService.checkGroupExistOrNot($event.target.value).subscribe(data => {
        if (data && data.response === 'Team does not exist') {
          const form = (this.getPermissionsFormArray().get(i + '') as FormGroup);
          form.get('groupId').setErrors({ groupExist: true });
        }
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
        list[i].deleteAllowed === true && list[i].createAllowed === true) {
        this.allCheckBoxControl[i] = true;
      }
      if (list[i].editAllowed === true && list[i].launchAllowed === true
        && list[i].deleteAllowed === true) {
        this.allCheckBoxControl[i] = true;
      }
    }
  }

  getGroupNamesAutoCompleteList(index) {
    const groupName = this.getPermissionsFormArray().get('' + index).get('groupId');
    groupName.valueChanges.pipe(debounceTime(300)).subscribe(name => {
      if (name !== null && name !== '') {
        this.pageSecurityService.getGroupNames(name).subscribe(data => {
          if (data.length === 0) {
            groupName.setErrors({ groupExist: true });
          } else {
            this.yoroGroups = data;
          }
        });
      }
    });
  }

  checkUniqueGroupName(name) {

  }

  addPagePermissionFormGroup() {
    return this.fb.group({
      id: [],
      tenantId: [],
      securityId: [this.data.id],
      groupId: ['', Validators.required],
      createAllowed: [false],
      readAllowed: [false],
      updateAllowed: [false],
      deleteAllowed: [false],
      editAllowed: [false],
      launchAllowed: [false],
      showAllowed: [false],
      pageName: [],
      version: []
    });
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
      group.get('editAllowed').setValue(true);
      group.get('launchAllowed').setValue(true);
    } else {
      group.get('readAllowed').setValue(false);
      group.get('updateAllowed').setValue(false);
      group.get('deleteAllowed').setValue(false);
      group.get('createAllowed').setValue(false);
      group.get('editAllowed').setValue(false);
      group.get('launchAllowed').setValue(false);
    }
  }

  unCheckValue($event, i) {
    const group = (this.getPermissionsFormArray().get('' + i) as FormGroup);
    this.pagePermissionsForm.markAsDirty();
    if ($event.checked === false) {
      this.allCheckBoxControl[i] = $event.checked;
    }else if(this.data.securityType !== 'application' && (group.get('readAllowed').value === true && group.get('createAllowed').value === true && group.get('updateAllowed').value === true && group.get('deleteAllowed').value === true)){
      this.allCheckBoxControl[i] = $event.checked;
this.cdr.detectChanges();

    }else if(this.data.securityType === 'application' && (group.get('editAllowed').value === true && group.get('launchAllowed').value === true  && group.get('deleteAllowed').value === true)){
      this.allCheckBoxControl[i] = $event.checked;
this.cdr.detectChanges();

    }
  }

  getAccessForGroupName(id) {
    this.pageSecurityService.getAccessForYoroGroups(id, this.data.id).subscribe(data => {
    });
  }

  getAccessToCreatePermission() {
    let returnValue;
    this.pageSecurityVO.permissionsVOList.forEach(permission => {
      if (permission.createAllowed === false && permission.updateAllowed === false &&
        permission.deleteAllowed === false && permission.readAllowed === false) {
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
    // && userForm.dirty 
    if (userForm.valid && this.getAccessToCreatePermission() === true) {
      this.isDisable = true;
      if (this.data.securityType !== 'template') {
        this.pageSecurityVO.securityId = +this.data.id;
      }
      this.pageSecurityVO.permissionsVOList = this.getPermissionsFormArray().value;

      if (this.data.securityType === 'page' && userForm.dirty) {
        this.pageSecurityService.savePagePermissions(this.pageSecurityVO).subscribe(data => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.isDisable = false;
          if (!data.response.includes('Group does not exist')) {
            this.resetForm(userForm);
          }
        });
      }
      this.globalPermissionData.emit(this.pageSecurityVO);
      // } else if (this.data.securityType === 'custom-page') {
      //   this.pageSecurityService.saveCustomPagePermissions(this.pageSecurityVO).subscribe(data => {
      //     this.snackBar.openFromComponent(SnackbarComponent, {
      //       data: data.response,
      //     });
      //     this.isDisable = false;
      //     if (!data.response.includes('Group does not exist')) {
      //       this.resetForm(userForm);
      //     }
      //   });
      // } else if (this.data.section.security) {
      //   this.data.section.security.permissionsVOList = this.getPermissionsFormArray().value;
      //   // this.rightSheetRef.dismiss(this.data);
      // } else {
      //   this.pageSecurityService.saveApplicationPermissions(this.pageSecurityVO).subscribe(data => {
      //     this.snackBar.openFromComponent(SnackbarComponent, {
      //       data: data.response,
      //     });
      //     this.isDisable = false;
      //     if (!data.response.includes('Group does not exist')) {
      //       this.resetForm(userForm);
      //     }
      //   });
      // }
    }
  }

  resetForm(userForm: NgForm) {
    userForm.resetForm();
    this.ngOnInit();
    this.allCheckBoxControl = {};
    this.selectedGroupNames = [];
  }

  cancel() {
    // if (this.pagePermissionsVOList.length === 0) {
    //   // this.rightSheetRef.dismiss(false);
    // } else {
    //   // this.rightSheetRef.dismiss();
    // }
    this.globalPermissionData.emit(false);
  }

}
