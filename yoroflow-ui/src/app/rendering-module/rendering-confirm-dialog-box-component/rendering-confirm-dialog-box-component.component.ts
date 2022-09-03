import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatRightSheet } from 'mat-right-sheet';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { CanDeactivateGuardService } from '../shared/service/can-deactivate-guard.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApplicationProvisionService } from '../application-provision/application-provision-service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserVO } from '../shared/vo/user-vo';
import { GroupVO } from '../shared/vo/group-vo';
import { UserService } from '../shared/service/user-service';
import { debounceTime } from 'rxjs/operators';
import { DynamicPageComponent } from '../shared/components/dynamic-page/dynamic-page.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FormValidationService } from '../shared/service/form-service/form-validation.service';
import { Page, PagePermissionVO, Section, Table } from '../shared/vo/page-vo';
import { PageService } from '../shared/service/page-service';
import { YoroSecurityComponent } from '../yoro-security/yoro-security.component';
import * as html2pdf from 'html2pdf.js';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';


@Component({
  selector: 'app-rendering-confirm-dialog-box-component',
  templateUrl: './rendering-confirm-dialog-box-component.component.html',
  styleUrls: ['./rendering-confirm-dialog-box-component.component.css']
})
export class RenderingConfirmDialogBoxComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RenderingConfirmDialogBoxComponent>
    , private rightSheet: MatRightSheet, private dialog: MatDialog, private snackBar: MatSnackBar
    , private router: Router, private fb: FormBuilder, private applicationProvisionService: ApplicationProvisionService
    , private canDeactivateService: CanDeactivateGuardService, private userService: UserService, private workspaceService: WorkspaceService,
    private dynamicPage: DynamicPageComponent, public formValidationService: FormValidationService, private pageService: PageService) { }

  appicationForm: FormGroup;
  isValid: boolean;
  userVOList: UserVO[];
  groupVOList: any;
  id: any;
  isChange = false;
  isExclude: any;
  htmlConvert: any;
  spinnerShow: boolean = false;
  // permission = new PagePermissionVO();
  ngOnInit() {
    if (this.data.type === 'delete-application') {
      this.appicationForm = this.fb.group({
        applicationName: ['', Validators.required]
      });
    }
    if (this.data.type === 'assignee-user') {
      this.appicationForm = this.fb.group({
        assignee: [null, [Validators.required]],
        userName: [null],
        groupName: [null],
        userId: [null],
        groupId: [null],
        comments: ['', [Validators.required]]
      });
      this.addUsersAutocompleteList();
      this.addGroupsAutocompleteList();
    }
    if (this.data.type === 'send-back') {
      this.appicationForm = this.fb.group({
        comments: ['', [Validators.required]]
      });
    }
  }

  menuRoute() {
    this.dialogRef.close();
    this.router.navigate(['/menu-config']);
  }

  generatePdf() {
    if (this.data.type === 'includeButton') {
      this.htmlConvert = document.getElementById('include');
    }
    if (this.data.type === 'excludeButton') {
      this.htmlConvert = document.getElementById('exclude');
    }
    // html2canvas(this.htmlConvert).then(canvas => {
    //   const imgWidth = 208;
    //   const imgHeight = canvas.height * imgWidth / canvas.width;

    //   const contentDataURL = canvas.toDataURL('image/jpeg');
    //   const pdf = new jsPDF('p', 'mm', 'a4');
    //   const position = 0;
    //   pdf.addImage(contentDataURL, 'JPEG', 0, position, imgWidth, imgHeight);
    //   pdf.save('new-file.pdf');
    // });
    var options = { filename: this.data.data.pageId+'.pdf'};
    new html2pdf(this.htmlConvert, options);
    this.dialogRef.close('yes');
  }

  setUserId($event, user: UserVO) {
    if ($event.isUserInput === true) {
      this.id = user.userId;
      this.appicationForm.get('userId').setValue(user.userId);
    }
  }

  setGroupId($event, group: GroupVO) {
    if ($event.isUserInput === true) {
      this.id = group.groupId;
      this.appicationForm.get('groupId').setValue(group.groupId);
    }
  }

  addUsersAutocompleteList() {
    this.appicationForm.get('userName').valueChanges.pipe(debounceTime(500)).subscribe(data => {
      if (data !== null && data !== '') {
        if (this.userVOList === undefined
          || !this.userVOList.some(fields => fields.userName === this.appicationForm.get('userName').value)) {
          this.userService.getUsers(data).subscribe(users => {
            this.userVOList = users;
          });
        }
      }
    });
  }

  saveAssignee(userForm) {
    const userName = this.appicationForm.get('userName');
    const groupName = this.appicationForm.get('groupName');
    const groupId = this.appicationForm.get('groupId');
    const userId = this.appicationForm.get('userId');
    if (userName.value !== null) {
      if (!this.userVOList.some(fields => fields.userName === userName.value)) {
        this.isChange = true;
        userName.setErrors({ unique: true });
      }
    }
    if (groupName.value !== null) {
      if (!this.groupVOList.some(fields => fields.groupName === groupName.value)) {
        this.isChange = true;
        groupName.setErrors({ unique: true });
      }
    }
    if (this.appicationForm.valid) {
      const permission = new PagePermissionVO();
      if (groupId.value !== null) {
        const groupIdList: any[] = [];
        groupIdList.push(groupId.value);
        permission.groupId = groupIdList;
      }
      permission.userId = userId.value;
      permission.pageId = this.data.pageIdentifier;
      permission.version = this.data.version;
      this.pageService.getPagePermission(permission).subscribe(response => {
        if (response) {
          if (response.response.includes('have no permission')) {
            const dialogRef = this.dialog.open(RenderingConfirmDialogBoxComponent, {
              data: { data: 'permission', response: response.response },
            });
            dialogRef.afterClosed().subscribe(data => {
              if (data === true) {
                const pagePermissionsSheet = this.rightSheet.open(YoroSecurityComponent, {
                  disableClose: true,
                  data: {
                    id: response.responseId, securityType: 'page',
                    formId: response.pageName, version: permission.version
                  },
                  panelClass: 'dynamic-right-sheet-container',
                });
                pagePermissionsSheet.instance.onAdd.subscribe((savedPermission) => {
                  if (savedPermission === true) {
                    this.dialogRef.close({ type: true, json: this.appicationForm.getRawValue() });
                  } else {
                    groupId.setValue(null);
                    groupName.setValue(null);
                    userId.setValue(null);
                    userName.setValue(null);
                    this.snackBar.openFromComponent(SnackbarComponent, {
                      data: response.response
                    });
                  }
                });
              } else if (data === false) {
                groupId.setValue(null);
                groupName.setValue(null);
                userId.setValue(null);
                userName.setValue(null);
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: response.response
                });
              }
            });
          } else {
            this.dialogRef.close({ type: true, json: this.appicationForm.getRawValue() });
          }
        }
      });
    }
  }

  addGroupsAutocompleteList() {
    this.appicationForm.get('groupName').valueChanges.pipe(debounceTime(500)).subscribe(data => {
      if (data !== null && data !== '') {
        if (this.groupVOList === undefined
          || !this.groupVOList.some(fields => fields.groupName === this.appicationForm.get('groupName').value)) {
          this.userService.getGroups(data).subscribe(groups => {
            this.groupVOList = groups;
          });
        }
      }
    });
  }

  getAssignedValue($event) {
    const value = $event.value;
    const userName = this.appicationForm.get('userName');
    const groupName = this.appicationForm.get('groupName');
    if (value === 'user') {
      userName.setValidators([Validators.required]);
      this.appicationForm.get('groupId').setValue(null);
      this.appicationForm.get('groupName').setValue(null);
      groupName.setErrors(null);
      groupName.clearValidators();
    } else if (value === 'group') {
      groupName.setValidators([Validators.required]);
      this.appicationForm.get('userId').setValue(null);
      this.appicationForm.get('userName').setValue(null);
      userName.setErrors(null);
      userName.clearValidators();
    }
    groupName.updateValueAndValidity();
    userName.updateValueAndValidity();
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  cancel() {
    this.dialogRef.close('yes');
  }

  cancalTask() {
    this.dialogRef.close(true);
  }

  submitTask() {
    this.dialogRef.close(true);
  }

  openPage() {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/test-page', this.data]);
    this.dialogRef.close(false);
  }

  includeButton() {
    this.dialogRef.close('yes');
  }

  excludeButton() {
    this.dialogRef.close('no');
  }

  deleteSection() {
    this.dialogRef.close(true);
  }
  resetControl() {
    this.dialogRef.close(true);
  }

  resetPage() {
    this.dialogRef.close(true);
  }

  navigation() {
    this.router.navigate([this.data.target]);
    this.dialogRef.close(true);
  }

  checkWithApplicationName(): boolean {

    const formControl = this.appicationForm.get('applicationName');
    if (formControl.value !== '' && formControl.value !== null) {
      this.applicationProvisionService.checkWithApplicationName(formControl.value).subscribe(data => {
        if (data.response.includes('not exists')) {
          formControl.setErrors({ 'notExists': true });
          this.isValid = false;
        }
        //  else {
        //   formControl.clearValidators();
        //   formControl.updateValueAndValidity();
        // }
      });
    }
    return this.isValid;
  }

  deleteApplication() {
    this.checkWithApplicationName();
    const control = this.appicationForm.get('applicationName');

    if (this.appicationForm.valid) {
      if (this.data.name === control.value) {
        this.dialogRef.close({ 'submit': true, 'applicationName': this.appicationForm.get('applicationName').value });
      } else {
        control.setErrors({ notMatch: true });
      }
    }

  }

  onCloseClick() {
    this.dialogRef.close({ 'submit': false, 'applicationName': null });
  }

  openGridConfiguration() {
    this.dialogRef.close(true);
  }
  deletedata() {
    this.dialogRef.close(true);
  }

  sendBack() {
    if (this.appicationForm.valid) {
      this.dialogRef.close({ type: true, json: this.appicationForm.getRawValue() });
    }
  }

  getPermission() {
    this.dialogRef.close(true);
  }

  closeDialog() {
    this.dialogRef.close(true);
  }

  onNoclick() {
    this.dialogRef.close(false);
  }

  deleteFile() {
    this.dialogRef.close(this.data.uploadedFiles.splice(this.data.index, 1));
  }
}


