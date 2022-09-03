import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { YoroGroups } from '../yoro-security/security-vo';
import { SecurityService } from '../yoro-security/security.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs/operators';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { Page, Section, Security, Permission } from '../shared/vo/page-vo';
import { PageService } from '../page/page-service';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-section-security',
  templateUrl: './section-security.component.html',
  styleUrls: ['./section-security.component.css']
})
export class SectionSecurityComponent implements OnInit {
  pagePermission: any;

  // tslint:disable-next-line: max-line-length
  constructor(private fb: FormBuilder, private workspaceService: WorkspaceService,
    private router: Router, private pageService: PageService, private pageSecurityService: SecurityService, private snackBar: MatSnackBar) { }

  // @Input() data: any;
  @Input() pageSecurity: Security;
  // @Input() index: number;
  // @Input() length: number;
  @Input() page: Page;
  @Input() publish: boolean;

  @Output() public finalData = new EventEmitter<any>();

  pagePermissionsForm: FormGroup;
  form: FormGroup;
  pagePermissionsVOList: Permission[];
  pageSecurityVO = new Security();
  yoroGroups: YoroGroups[];
  allCheckBoxControl = {};
  spinner = true;
  selectedGroupNames: string[] = [];
  ngOnInit(): void {
    this.form = this.fb.group({
      pagePermissionArray: this.fb.array([
        this.createForm()
      ]),
    });
    this.loadPermissionFormArray();
    this.getGroupNamesAutoCompleteList('0', '0');
    this.addValidatorGroupNames(0, 0);
    this.allCheckBoxControl[0] = false;
  }

  createForm(): FormGroup {
    return this.fb.group({
      securityId: [],
      formId: [],
      formVersion: [],
      pagePermissions: this.fb.array([this.addPagePermissionFormGroup()]),
    });
  }

  getSecurityPermissions(section, j) {
    if (this.pageSecurity && (section.security === null || !section.security.permissionsVOList)) {
      this.loadFormData(this.pageSecurity.permissionsVOList, j);
    }
    if (section.security && section.security.permissionsVOList) {
      this.pagePermissionsVOList = section.security.permissionsVOList;
      this.loadFormData(this.pagePermissionsVOList, j);
    }
  }

  focusOutForGroupName($event, i, j) {
    const name = $event.target.value;
    if (name && name !== '') {
      this.pageSecurityService.checkGroupExistOrNot($event.target.value).subscribe(data => {
        if (data && data.response === 'Group does not exist') {
          const form = (this.getPermissionsFormArray(j).get(i + '') as FormGroup);
          form.get('groupId').setErrors({ groupExist: true });
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
        }
      });
    }
  }

  addValidatorGroupNames(i: number, j) {
    // for (let j = 0; j < this.page.sections.length; j++) {
    const index = '' + i;
    const formArray = this.getPermissionsFormArray(j);
    const form = formArray.get(index);
    form.get('groupId').valueChanges.pipe(debounceTime(500))
      .subscribe(data => {
        const groupNameIndex = this.selectedGroupNames.indexOf(data);
        if (groupNameIndex > -1 && data !== null && groupNameIndex !== i) {
          form.get('groupId').setErrors({ validators: true });
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Group Name already selected',
            duration: 3000
          });
        } else {
          if (data !== '') {
            this.selectedGroupNames[i] = data;
          }
        }
      });
    // }
  }

  loadFormData(list: Permission[], j) {
    for (let i = 0; i < list.length; i++) {
      // this.getGroupNamesAutoCompleteList('' + i);
      if (i > 0) {
        this.addPermission(j);
      }
      (this.getPermissionsFormArray(j).get('' + i) as FormGroup).patchValue(list[i]);
      if (list[i].readAllowed === true && list[i].updateAllowed === true &&
        list[i].deleteAllowed === true && list[i].createAllowed === true &&
        list[i].showAllowed === true) {
        this.allCheckBoxControl[i] = true;
      }
    }
  }

  getGroupNamesAutoCompleteList(index, j) {
    // for (let i = 0; i < this.page.sections.length; i++) {
    const groupName = this.getPermissionsFormArray(j).get('' + index).get('groupId');
    groupName.valueChanges.pipe(debounceTime(300)).subscribe(name => {
      if (name !== null && name !== '') {
        this.pageSecurityService.getGroupNames(name).subscribe(data => {
          if (data.length === 0) {
            groupName.setErrors({ groupExist: true });
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Group does not exist',
              duration: 3000
            });
          } else {
            this.yoroGroups = data;
          }
        });
      }
    });
    // }
  }

  checkUniqueGroupName(name) {

  }

  addPagePermissionFormGroup() {
    return this.fb.group({
      id: [],
      tenantId: [],
      securityId: [],
      groupId: ['', Validators.required],
      createAllowed: [false],
      readAllowed: [false],
      updateAllowed: [false],
      deleteAllowed: [false],
      showAllowed: [false],
      editAllowed: [false],
      launchAllowed: [false],
      allAllowed: [false],
      pageName: [],
      version: []
    });
  }

  getPagePermissionArray() {
    return (this.form.get('pagePermissionArray') as FormArray);
  }

  loadPermissionFormArray() {
    for (let i = 0; i < this.page.sections.length; i++) {
      if (i > 0) {
        this.getPagePermissionArray().push(this.createForm());
      }
      this.getSecurityPermissions(this.page.sections[i], i);
    }
  }

  getPermissionsFormArray(i) {
    return ((this.getPagePermissionArray()).at(i).get('pagePermissions') as FormArray);
  }

  addPermission(j) {
    const length = this.getPermissionsFormArray(j).length;
    this.getPermissionsFormArray(j).push(this.addPagePermissionFormGroup());
    this.getGroupNamesAutoCompleteList(length, j);
    this.addValidatorGroupNames(length, j);
    this.allCheckBoxControl[length] = false;
  }

  removePermission(i, j) {
    const deletedID = (this.getPermissionsFormArray(j).get('' + i) as FormGroup).get('id').value;
    if (deletedID !== null && deletedID !== '') {
      this.pageSecurityVO.deletedIDList.push(deletedID);
    }
    this.getPermissionsFormArray(j).removeAt(i);
    this.selectedGroupNames.splice(i);
    // this.pagePermissionsForm.markAsDirty();
    this.form.markAsDirty();
  }

  setAllChecked($event, index: number, j:number) {
    // this.pagePermissionsForm.markAsDirty();
    this.form.markAsDirty();
    const group = (this.getPermissionsFormArray(j).get('' + index) as FormGroup);
     group.get('allAllowed').value == $event.checked;
    if ($event.checked === true) {
      group.get('readAllowed').setValue(true);
      group.get('updateAllowed').setValue(true);
      group.get('deleteAllowed').setValue(true);
      group.get('createAllowed').setValue(true);
      group.get('showAllowed').setValue(true);
    } else {
      group.get('readAllowed').setValue(false);
      group.get('updateAllowed').setValue(false);
      group.get('deleteAllowed').setValue(false);
      group.get('createAllowed').setValue(false);
      group.get('showAllowed').setValue(false);
    }
  }

  unCheckValue($event, i,j) {
    // this.pagePermissionsForm.markAsDirty();
    const group = (this.getPermissionsFormArray(j).get('' + i) as FormGroup);

    this.form.markAsDirty();
    if ($event.checked === false) {
      group.get('allAllowed').setValue(false);
    }else if(group.get('createAllowed').value === true && group.get('readAllowed').value === true && group.get('updateAllowed').value === true && group.get('deleteAllowed').value === true && group.get('showAllowed').value === true){
      // this.allCheckBoxControl[i] = $event.checked;
      group.get('allAllowed').setValue(true);

    }
  }

  // getAccessForGroupName(id) {
  //   this.pageSecurityService.getAccessForYoroGroups(id, this.data.id).subscribe(data => {
  //   });
  // }

  getAccessToCreatePermission() {
    let returnValue;
    this.pageSecurityVO.permissionsVOList.forEach(permission => {
      if (permission.createAllowed === false && permission.updateAllowed === false &&
        permission.deleteAllowed === false && permission.readAllowed === false
        && permission.showAllowed === false) {
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
    let count = 0;
    for (let i = 0; i < this.page.sections.length; i++) {
      this.pageSecurityVO.permissionsVOList = this.getPermissionsFormArray(i).value;
      this.getAccessToCreatePermission();
      if (userForm.valid && userForm.dirty && this.getAccessToCreatePermission() === true) {
        // this.pageSecurityVO.securityId = +this.data.id;
        // this.data.security.permissionsVOList = this.getPermissionsFormArray().value;
        // this.dialogRef.close(this.data);
        this.pagePermission=this.page.sections[i].security.permissionsVOList === null || this.page.sections[i].security.permissionsVOList.length === 0 ;
        if (this.page.sections[i].security === null || this.pagePermission) {
          const security = new Security();
          this.page.sections[i].security = security;
          this.page.sections[i].security.permissionsVOList = this.pageSecurityVO.permissionsVOList;
        } else {
          this.page.sections[i].security.permissionsVOList = this.pageSecurityVO.permissionsVOList;
        }
        count++;
      }
    }
    if (this.publish !== true && count === this.page.sections.length) {
      this.finalData.emit(this.page);
    } else if (this.publish === true) {
      if (this.page.yorosisPageId) {
        this.pageService.publishPage(this.page.yorosisPageId).subscribe(data => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
        });
        this.pageService.updatePage(this.page, this.page.yorosisPageId).subscribe(updateResponse => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: updateResponse.response,
          });
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/page-list']);
        });
      } else {
        this.pageService.savePage(this.page).subscribe(dataResponse => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: dataResponse.response,
          });
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/page-list']);
        });
      }
    }
  }

  resetForm(userForm) {
    userForm.resetForm();
    this.ngOnInit();
    this.allCheckBoxControl = {};
    this.selectedGroupNames = [];
  }

  cancel() {
    // if (this.pagePermissionsVOList.length === 0) {
    //   this.dialogRef.close(false);
    // } else {
    //   this.dialogRef.close();
    // }
    // this.dialogRef.close(false);
    this.finalData.emit(false);
  }

}
