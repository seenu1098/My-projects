import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { UserManagementComponent } from '../user-management/user-management.component';
import { UserService } from '../user-management/user-service';
import { EmailRequestVO, RolesListVO, UserVO } from '../user-management/vo/user-vo';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { Router, RouterEvent } from '@angular/router';
import { PaginationVO } from 'src/app/mytasks-module/mytasks/pagination-vo';
import { PageService } from 'src/app/rendering-module/shared/service/page-service';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { RolesService } from '../user-role-association/roles.service';
import { id } from '@swimlane/ngx-charts';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { CreateOrganizationService } from '../create-organization/create-organization.service';


@Component({
  selector: 'lib-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.css']
})

export class InviteUserComponent implements OnInit {
  form: FormGroup;
  userVO = new UserVO();
  hide = true;
  readonly = true;
  roleList: RolesListVO[];
  canDeactivateForm: boolean;
  deleteBoolean = true;
  urlData: any;
  hideNew = true;
  hideConfirm = true;
  disabled = false;
  emailVO = new EmailRequestVO();
  isInvite = false;
  isInviteUser = true;
  isInactivateUser = false;
  isPasswordReset = false;
  isReactivateUser = false;
  resendInvite = false;
  url: any[] = [];
  domain: any[] = [];
  isDisable = false;
  groupList: any[];
  isLoadUser = false;
  flexLayout = 'row';
  isMobile: boolean;
  rolesList: any;
  paginationVO = new PaginationVO();
  isTwoFactor = false;
  savedChanges = false;
  selectedColor: string;
  removedGroupIdList: any[] = [];
  removedRolesIdList: any[] = [];
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  subscriptionDetails: any;
  avatarColors = ['#FFB6C1', '#2c3e50', '#95a5a6', '#f39c12', '#1abc9c', '#0F2347', '#1C3F6E', '#2E67A0', '#5AACCF', '#80C271', '#28a745',
    '#695958', '#b6c8a9', '#A52A2A', '#F4C2C2', '#2E5894', '#967117', '#BD33A4', '#702963', '#CC5500', '#E97451', '#5F9EA0', '#2F847C',
    '#E4D00A', '#F88379', '#666699', '#26428B', '#1b5e20'];
  constructor(private fb: FormBuilder, private service: UserService, private pageService: PageService, private snackBar: MatSnackBar
    ,         private dialog: MatDialog, private router: Router, private roleservice: RolesService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<InviteUserComponent>, private createOrganizationService: CreateOrganizationService) {
    if (window.matchMedia('only screen and (max-width: 768px)').matches ||
      window.matchMedia('only screen and (max-width: 1024px)').matches || window.matchMedia('only screen and (max-width: 600px)').matches) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  getOrgsubscriptionDetails() {
    this.createOrganizationService.getOrgSubscription().subscribe(data => {
      if (data && data !== null && data.customerId !== null) {
        this.subscriptionDetails = data;
      }
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.getOrgsubscriptionDetails();
    this.passwordValidation();
    this.roleservice.getRolesList().subscribe(res => {
      this.rolesList = res;
    });
    this.service.getGroupList().subscribe(data => {
      this.groupList = data;
    });

    if (this.data.user && this.data.user.isTwoFactor && this.data.user.activeFlag === 'Y') {
      this.isTwoFactor = true;
    }

    this.isInviteUser = this.data.isInviteUser;
    this.isReactivateUser = this.data.isReactivateUser;
    this.isInactivateUser = this.data.isInactivateUser;
    this.isPasswordReset = this.data.isPasswordReset;
    this.isLoadUser = this.data.isLoadUser;
    if (this.isReactivateUser === false && this.data.user.lastLogin === null && this.data.user.activeFlag === 'Y') {
      this.resendInvite = true;
    }

    if (this.isInviteUser === undefined || this.isInviteUser === false) {
      this.form.get('emailId').disable();
      this.form.get('userName').disable();
      this.form.get('firstName').disable();
      this.form.get('lastName').disable();
      this.form.get('mobileNumber').disable();
      if (this.data.isRoleEditable === false) {
        this.form.get('roleId').disable();
      }
      this.receiveMessage({ col1: this.data.userId });
    }

    // if (this.data.isInactivateUser) {
    //   this.isInactivateUser = this.data.isInactivateUser;
    //   this.isLoadUser = false;
    //   this.inactivateUser();
    //   this.receiveMessage({ col1: this.data.userId })
    // } if (this.data.isPasswordReset) {
    //   this.isPasswordReset = this.data.isPasswordReset;
    //   this.isLoadUser = false;
    //   this.passwordReset();
    //   this.receiveMessage({ col1: this.data.userId })
    // } if (this.data.isReactivateUser) {
    //   this.isReactivateUser = this.data.isReactivateUser;
    //   this.isLoadUser = false;
    //   this.reactivateUser();
    //   this.receiveMessage({ col1: this.data.userId })
    // } if (this.data.isLoadUser) {
    //   this.isLoadUser = this.data.isLoadUser;
    //   this.resendInvite = true;
    //   this.receiveMessage({ col1: this.data.userId })
    // }
  }

  resetTwoFactor() {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      data: { type: 'reset-two-factor' }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.userVO = this.form.getRawValue();
        this.service.resetTwoFactorAuth(this.userVO.userId).subscribe(data => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response
          });
        });
      }
    });
  }

  initializeForm() {
    this.form = this.fb.group({
      userId: [this.userVO.userId],
      firstName: [{ value: this.userVO.firstName, disabled: false }, [Validators.required]],
      lastName: [{ value: this.userVO.lastName, disabled: false }, [Validators.required]],
      emailId: [{ value: this.userVO.emailId, disabled: false }, [Validators.required, Validators.email]],
      contactEmailId: [{ value: this.userVO.contactEmailId, disabled: false }, [Validators.required, Validators.email]],
      password: [{ value: '', disabled: false }, [Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#^])(?=.*[0-9])[A-Za-z@$!%*?&#^0-9]{6,50}$')]],
      confirmPassword: [{ value: '', disabled: false }, [Validators.required]],
      userName: [{ value: this.userVO.userName, disabled: false }, [Validators.required]],
      mobileNumber: [{ value: this.userVO.mobileNumber, disabled: false }, [Validators.pattern('[0-9]{10}')]],
      groupId: [{ value: this.userVO.groupId, disabled: false }],
      roleId: [{ value: this.userVO.roleId, disabled: false }],
      color: [this.avatarColors[Math.floor(Math.random() * (25 - 0) + 0)]],
      removedGroupIdList: [],
      removedRolesIdList: [],
    });
  }

  inviteUser() {
    this.isInvite = false;
    this.form.get('emailId').enable();
    this.form.get('userName').enable();
    this.form.get('firstName').enable();
    this.form.get('lastName').enable();
    this.form.get('mobileNumber').enable();
    this.form.get('contactEmailId').enable();
    this.form.get('groupId').enable();
    this.form.get('roleId').enable();
    this.form.get('emailId').setErrors(null);
    this.form.get('firstName').setErrors(null);
    this.form.get('lastName').setErrors(null);
    this.form.get('contactEmailId').setErrors(null);
    this.form.get('mobileNumber').setErrors(null);
    this.form.get('groupId').setErrors(null);
    this.form.get('roleId').setErrors(null);
    this.isInviteUser = true;
    this.isLoadUser = false;
    this.isInactivateUser = false;
    this.isPasswordReset = false;
    this.isReactivateUser = false;
    this.form.get('emailId').setValue('');
    this.form.get('userName').setValue('');
    this.form.get('firstName').setValue('');
    this.form.get('lastName').setValue('');
    this.form.get('contactEmailId').setValue('');
    this.form.get('mobileNumber').setValue('');
    this.form.get('groupId').setValue('');
    this.form.get('roleId').setValue('');
  }

  inactivateUser() {
    this.isInvite = false;
    this.resendInvite = false;
    this.form.get('emailId').disable();
    this.form.get('userName').disable();
    this.form.get('firstName').disable();
    this.form.get('lastName').disable();
    this.form.get('contactEmailId').disable();
    this.form.get('mobileNumber').disable();
    this.form.get('groupId').disable();
    this.form.get('roleId').disable();
    this.isInviteUser = false;
    this.isInactivateUser = true;
    this.isPasswordReset = false;
    this.isReactivateUser = false;
    this.form.get('emailId').setValue('');
    this.form.get('userName').setValue('');
    this.form.get('firstName').setValue('');
    this.form.get('lastName').setValue('');
    this.form.get('contactEmailId').setValue('');
    this.form.get('mobileNumber').setValue('');
    this.form.get('groupId').setValue('');
    this.form.get('roleId').setValue('');
  }

  passwordReset() {
    this.isInvite = false;
    this.resendInvite = false;
    this.form.get('emailId').disable();
    this.form.get('userName').disable();
    this.form.get('firstName').disable();
    this.form.get('lastName').disable();
    this.form.get('contactEmailId').disable();
    this.form.get('mobileNumber').disable();
    this.form.get('groupId').disable();
    this.form.get('roleId').disable();
    this.isInviteUser = false;
    this.isInactivateUser = false;
    this.isPasswordReset = true;
    this.isReactivateUser = false;
    this.form.get('emailId').setValue('');
    this.form.get('userName').setValue('');
    this.form.get('firstName').setValue('');
    this.form.get('lastName').setValue('');
    this.form.get('contactEmailId').setValue('');
    this.form.get('mobileNumber').setValue('');
    this.form.get('groupId').setValue('');
    this.form.get('roleId').setValue('');
  }

  reactivateUser() {
    this.isInvite = false;
    this.resendInvite = false;
    this.form.get('emailId').disable();
    this.form.get('userName').disable();
    this.form.get('firstName').disable();
    this.form.get('lastName').disable();
    this.form.get('contactEmailId').disable();
    this.form.get('mobileNumber').disable();
    this.form.get('groupId').disable();
    this.form.get('roleId').disable();
    this.isInviteUser = false;
    this.isInactivateUser = false;
    this.isPasswordReset = false;
    this.isReactivateUser = true;
    this.form.get('emailId').setValue('');
    this.form.get('userName').setValue('');
    this.form.get('firstName').setValue('');
    this.form.get('lastName').setValue('');
    this.form.get('contactEmailId').setValue('');
    this.form.get('mobileNumber').setValue('');
    this.form.get('groupId').setValue('');
    this.form.get('roleId').setValue('');
  }


  changeAvatarColor(color: string): void {
    this.selectedColor = color;
    this.form.get('color').setValue(color);
  }



  userProfileValue(str) {
    if (str) {
      const assignee = str.split(' ');
      for (let i = 0; i < assignee.length; i++) {
        assignee[i] = assignee[i].charAt(0).toUpperCase();
      }
      return assignee.join('');
    }
  }

  deactivateUser(userForm) {
    let user: string;
    let response: string;
    if (this.isInactivateUser) {
      user = 'inactivateUser';
    } else {
      user = 'reactivateUser';
    }
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      data: { type: 'user-management', userType: user }
    });
    dialog.afterClosed().subscribe(data => {
      if (data === 'yes') {
        this.isInvite = false;
        this.userVO.recipientEmails = this.form.get('contactEmailId').value;
        this.url = window.location.href.split('//', 2);
        this.domain = this.url[1].split('/', 2);
        if (user === 'inactivateUser') {
          this.userVO.subject = ' has deactivated your account at ' + this.domain[0];
          response = 'Deactivated mail send successfully';
        } else {
          this.userVO.subject = ' has reactivated your account at ' + this.domain[0];
          response = 'Reactivated mail send successfully';
        }
        this.userVO.messageBody = 'Your account is deactivated';
        this.userVO.inviteUser = 'deactivate';
        this.service.sendMail(this.userVO).subscribe(emaildata => {
          if (emaildata.response) {
            if (emaildata.response.includes('Does not deactive the first user')) {
              const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
                width: '400px',
                data: 'deactive the first user'
              });
            } else {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: response
              });
            }
            userForm.resetForm();
            this.dialogRef.close(true);
          }
        });
      }
    });
  }

  saveChanges() {
    this.userVO = this.form.getRawValue();
    this.userVO.removedGroupIdList = this.removedGroupIdList;
    this.userVO.removedRolesIdList = this.removedRolesIdList;
    this.service.saveUserChanges(this.userVO).subscribe(data => {
      if (data.response.includes('Successfully')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        this.savedChanges = false;
        this.form.markAsPristine();
      }
    });
  }

  changeGroup(event) {
    if (event.isUserInput === true) {
      if (event.source._selected === false) {
        this.removedGroupIdList.push(event.source.value);
      }
    }
  }

  changeRoles(event) {
    if (event.isUserInput === true) {
      if (event.source._selected === false) {
        this.removedRolesIdList.push(event.source.value);
      }
    }
  }

  submit(userForm) {
    this.service.isAllowed().subscribe(license => {
      if (license.response.includes('exceeded')) {
        if (license.planName === 'STARTER') {
          license.allowedLimit = 2;
        } else {
          license.allowedLimit = this.subscriptionDetails.quantity;
        }
        const dialog = this.dialog.open(AlertmessageComponent, {
          width: '450px',
          data: { licenseVO: license, pageName: 'User' }
        });
        dialog.afterClosed().subscribe(data => {
          if (data) {
            this.dialogRef.close(true);
          }
        });
      } else {
        this.userVO = this.form.getRawValue();
        this.updateValidatorsForsubmit('user');
        if (userForm.valid) {
          this.isDisable = true;
          this.userVO = this.form.getRawValue();
          this.userVO.recipientEmails = this.form.get('contactEmailId').value;
          this.userVO.subject = ' has invited you to join Yoroflow ';
          this.userVO.userName = this.form.get('emailId').value;
          this.userVO.messageBody = this.form.get('emailId').value;
          this.userVO.userName = this.form.get('emailId').value;
          this.userVO.inviteUser = 'invite';
          this.userVO.color = this.selectedColor;
          if (this.form.get('groupId').value === '') {
            this.userVO.groupId = [];
          }

          if (this.form.get('roleId').value === '') {
            this.userVO.roleId = [];
          }

          this.service.createUser(this.userVO).subscribe(data => {
            if (data.response.includes('created')) {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: data.response,
              });
              this.userVO.userId = data.responseId;
              if (data.responseId !== null && data.responseId !== undefined && data.responseId !== '') {
                // this.service.associateGroup(this.userVO).subscribe(dataa => {
                // });
              }
              userForm.resetForm();
              this.dialogRef.close(true);
            } else if (data.response.includes('already exists')) {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: data.response,
              });
            } else if (data.response.includes('Resend invite user')) {
              this.userVO.recipientEmails = this.form.get('contactEmailId').value;
              this.userVO.subject = ' has invited you to join Yoroflow';
              this.userVO.messageBody = this.form.get('emailId').value;
              this.userVO.inviteUser = 'resend';
              this.service.sendMail(this.userVO).subscribe(emaildata => {
                if (emaildata.response) {
                  this.snackBar.openFromComponent(SnackbarComponent, {
                    data: 'Resend invite email',
                  });
                }
                userForm.resetForm();
                this.dialogRef.close(true);
              });
            } else {
              const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
                width: '450px',
                data: { type: 'lastlogin', data: data.response }
              });
            }
            this.readonly = true;
            this.isDisable = false;
          });
        }
      }
    });
  }

  receiveMessage($event): void {

    this.readonly = false;
    this.deleteBoolean = false;
    this.isInvite = true;

    this.service.getUserInfo($event.col1).subscribe(data => {
      this.userVO = data;
      this.roleList = this.userVO.userRole;
      const roleList = [];

      this.initializeForm();
      this.form.get('emailId').disable();
      this.form.get('userName').disable();
      this.form.get('firstName').disable();
      this.form.get('lastName').disable();
      this.form.get('mobileNumber').disable();
      this.form.controls.password.clearValidators();
    });
  }

  cancel() {
    this.dialogRef.close(true);
  }

  changePassword(userForm) {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      data: { type: 'reset-password' }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.isInvite = false;
        this.userVO.recipientEmails = this.form.get('contactEmailId').value;
        this.userVO.subject = ' has changed your password';
        this.userVO.messageBody = 'Your password is changed';
        this.userVO.inviteUser = 'changePassword';
        this.service.sendMail(this.userVO).subscribe(emaildata => {
          if (emaildata.response) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Password changed email send successfully',
            });
          }
          userForm.resetForm();
          this.dialogRef.close(true);
        });
      }
    });
  }

  reset() {
    this.isInvite = false;
    this.resendInvite = false;
    this.form.get('firstName').reset();
    this.form.get('lastName').reset();
    this.form.get('emailId').reset();
    this.form.get('contactEmailId').reset();
    this.form.get('userName').reset();
    this.form.get('mobileNumber').reset();
    this.form.get('userId').reset();
    this.form.get('groupId').reset();
    this.canDeactivateForm = false;
    this.deleteBoolean = true;
    this.readonly = true;
    this.isDisable = false;
    if (this.isInviteUser) {
      this.form.get('emailId').enable();
      this.form.get('firstName').enable();
      this.form.get('lastName').enable();
      this.form.get('contactEmailId').enable();
      this.form.get('mobileNumber').enable();
      this.form.get('groupId').enable();
      this.form.get('emailId').setErrors(null);
      this.form.get('firstName').setErrors(null);
      this.form.get('lastName').setErrors(null);
      this.form.get('contactEmailId').setErrors(null);
      this.form.get('mobileNumber').setErrors(null);
      this.form.get('groupId').setErrors(null);
      this.isLoadUser = false;
    }
  }


  getRouterLink(): any {
    this.router.events.subscribe((data: RouterEvent) => {
      this.urlData = {
        type: 'navigation', target: data.url
      };
    });
    return this.urlData;
  }

  updateValidatorsForsubmit(value: string) {
    const password = this.form.get('password');
    const confirmPassword = this.form.get('confirmPassword');
    const firstName = this.form.get('firstName');
    const lastName = this.form.get('lastName');
    const emailId = this.form.get('emailId');
    const contactEmailId = this.form.get('contactEmailId');
    const userName = this.form.get('userName');
    if (value === 'user') {
      firstName.setValidators([Validators.required]);
      lastName.setValidators([Validators.required]);
      emailId.setValidators([Validators.required, Validators.email]);
      contactEmailId.setValidators([Validators.required, Validators.email]);
      password.setValidators(null);
      confirmPassword.setValidators(null);
      userName.setValidators(null);
    } else {
      firstName.setValidators(null);
      lastName.setValidators(null);
      emailId.setValidators(null);
      contactEmailId.setValidators(null);
      password.setValidators([Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#^])(?=.*[0-9])[A-Za-z@$!%*?&#^0-9]{6,50}$')]);
      confirmPassword.setValidators([Validators.required]);
      userName.setValidators([Validators.required]);
    }
    confirmPassword.updateValueAndValidity();
    password.updateValueAndValidity();
    firstName.updateValueAndValidity();
    lastName.updateValueAndValidity();
    emailId.updateValueAndValidity();
    contactEmailId.updateValueAndValidity();
    userName.updateValueAndValidity();
  }

  passwordValidation() {
    const lower = /[a-z]/g;
    const upper = /[A-Z]/g;
    const numbers = /[0-9]/g;
    const splChar = /[!@#$%^&*?.,]/g;
    this.form.get('password').valueChanges.subscribe(data => {
      if (data !== null && data !== '' && data !== undefined) {
        if (data.length < 6) {
          return this.form.get('password').setErrors({ min: true });
        } else if (data.length > 50) {
          return this.form.get('password').setErrors({ max: true });
        } else {
          if (!data.match(lower)) {
            return this.form.get('password').setErrors({ lower: true });
          } else if (!data.match(upper)) {
            return this.form.get('password').setErrors({ upper: true });
          } else if (!data.match(numbers)) {
            return this.form.get('password').setErrors({ number: true });
          } else if (!data.match(splChar)) {
            return this.form.get('password').setErrors({ splChar: true });
          } else {
            return this.form.get('password').setErrors(null);
          }
        }
      }
    });
  }
}
