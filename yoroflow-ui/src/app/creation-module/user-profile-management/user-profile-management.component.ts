import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../shared/service/user-service';
import { UserVO } from '../shared/vo/user-vo';
import { EnableTwoFactorVO } from '../user-management/vo/user-vo';

import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { MatDialog } from '@angular/material/dialog';
import { ProfilePictureDialogBoxComponent } from '../profile-picture-dialog-box/profile-picture-dialog-box.component';
import { ChangePasswordVO } from '../change-password/change-password-vo';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { ApiKeyDialogBoxComponent } from '../api-key-dialog-box/api-key-dialog-box.component';
import { DomSanitizer } from '@angular/platform-browser';
import { SignaturedialogComponent } from '../signaturedialog/signaturedialog.component';
import { SignatureService } from '../signaturedialog/signature.service';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { ignoreElements, throttleTime } from 'rxjs/operators';
import { ConfirmdialogComponent } from 'src/app/shared-module/confirmdialog/confirmdialog.component';
import { QrSetupComponent } from '../../engine-module/qr-setup/qr-setup.component';
import { GoogleAuthVo, LoginVO, QrDetailsVo } from '../../login-module/login-vo';
import { OrganizationService } from '../user-update-organization/organization.service';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { WorkflowDashboardService } from 'src/app/engine-module/work-flow-dashboard/workflow-dashboard.service';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { ThemeService } from 'src/app/services/theme.service';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';


@Component({
  selector: 'app-user-profile-management',
  templateUrl: './user-profile-management.component.html',
  styleUrls: ['./user-profile-management.component.scss']
})
export class UserProfileManagementComponent implements OnInit {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  loadProfilePicture: any = '';
  form: FormGroup;
  userVO = new UserVO();
  passwordVO = new ChangePasswordVO();
  userProfilePicture: any;
  enableRemove = false;
  show = false;
  hideConfirm = true;
  hideNew = true;
  hideOld = true;
  enableProfilePictureSave = false;
  enableUserDetails = true;
  enablePasswordChange = false;
  enableChangeProfilePicture = false;
  enableApiKey = false;
  enableCustomAttribute = false;
  isMobile: boolean;
  screenHeight: any;
  isShow = false;
  profile = false;
  authType: string;
  userGroupList: any;
  userRoleList: any;
  userDetails: any;
  signature: any;
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  signatureList: any;
  signname: any;
  showDefault = false;
  default = false;
  showClose = false;
  recallTimeZone = false;
  @ViewChild('apiKey', { static: false }) apiKey: YorogridComponent;
  @ViewChild('signature', { static: false }) signaturePad: SignaturePad;
  @ViewChild('signature1', { static: false }) signaturePad1: SignaturePad;
  @ViewChild('signature2', { static: false }) signaturePad2: SignaturePad;
  enableTwoFactorVO = new EnableTwoFactorVO();
  userIdList: any[] = [];
  isAllowed = true;
  isSignatureAllowed = true;
  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    minWidth: 1,
    canvasHeight: 50,
    backgroundColor: 'rgb(222, 224, 226)',
    penColor: 'black'
  };

  twoFactorMethod: string;
  twoFactorMethods: string[];
  codes: any;
  otpVerified = false;
  loginVO = new LoginVO();
  licenseVO = new LicenseVO();
  selectedAvatarColor: string;
  groupList: any[] = [];
  loadButtonName: string;
  defaultColor: string;
  timeZone: string;
  isFreePlan: boolean;
  avatarColors = ['#FFB6C1', '#2c3e50', '#95a5a6', '#f39c12', '#1abc9c', '#0F2347', '#1C3F6E', '#2E67A0', '#5AACCF', '#80C271', '#28a745',
    '#695958', '#b6c8a9', '#A52A2A', '#F4C2C2', '#2E5894', '#967117', '#BD33A4', '#702963', '#CC5500', '#E97451', '#5F9EA0', '#2F847C',
    '#E4D00A', '#F88379', '#666699', '#26428B', '#1b5e20'];
  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer, private signatureservice: SignatureService,
    private dialog: MatDialog, private service: UserService, private snackBar: MatSnackBar, private orgService: OrganizationService,
    private workflowDashboardService: WorkflowDashboardService,
    private workspaceService: WorkspaceService,
    public themeService: ThemeService, private router: Router) {
    if (window.matchMedia('only screen and (max-width: 600px)').matches
      || window.matchMedia('only screen and (max-width: 768px)').matches
      || window.matchMedia('only screen and (max-width: 1024px)').matches) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = (window.innerHeight - 63) + 'px';
  }

  ngOnInit(): void {
    this.isFreePlan = JSON.parse(localStorage.getItem('isFreePlan'));
    this.screenHeight = (window.innerHeight - 63) + 'px';
    this.getLoggedinUserInfo();
    this.authType = localStorage.getItem('authType');
    this.orgService.isAllowed().subscribe(data => {
      if (data.response.includes('You don\'t have sufficient')) {
        this.isAllowed = false;
      } else {
        this.isAllowed = true;
      }
    });
    this.licenseVO.category = 'form_page_builder';
    this.licenseVO.featureName = 'signature_control';
    this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'N') {
        this.isSignatureAllowed = false;
      }
    });
    this.workspaceService.setHideSubMenu(true);
    this.workspaceService.setHideHover(true);
    this.workspaceService.setNotificationSelected(false);
  }

  getData1(event: any, userForm) {
    this.form.get('color').markAsDirty();
    if (event && event != null) {
      this.timeZone = event;
    }
  }

  loadGroups(): void {
    if (this.loadButtonName.includes('more')) {
      this.loadButtonName = 'Show less';
      this.groupList = this.userGroupList;
    } else {
      this.loadButtonName = '+' + (this.userGroupList.length - 4) + ' more';
      this.groupList = [];
      this.userGroupList.forEach((group, i) => {
        if (i < 4) {
          this.groupList.push(group);
        }
      });
    }
  }

  setTeamsBackgroundColor(index) {
    let color = '#172b4d';
    if (index !== undefined || index !== null) {
      const i = index % 4;
      color = this.assigneeUserColorArray[i];
    }
    return color;
  }

  userDetailsTab() {
    this.enableUserDetails = true;
    this.enablePasswordChange = false;
    this.enableChangeProfilePicture = false;
    this.enableApiKey = false;
    this.enableCustomAttribute = false;
  }

  passwordTab() {
    this.enableUserDetails = false;
    this.enablePasswordChange = true;
    this.enableChangeProfilePicture = false;
    this.enableApiKey = false;
    this.enableCustomAttribute = false;
  }

  profilePictureTab() {
    this.enableUserDetails = false;
    this.enablePasswordChange = false;
    this.enableChangeProfilePicture = true;
    this.enableApiKey = false;
    this.enableCustomAttribute = false;
  }

  apiKeyTab() {
    this.enableUserDetails = false;
    this.enablePasswordChange = false;
    this.enableChangeProfilePicture = false;
    this.enableApiKey = true;
    this.enableCustomAttribute = false;
  }

  customAttributeTab() {
    this.enableUserDetails = false;
    this.enablePasswordChange = false;
    this.enableChangeProfilePicture = false;
    this.enableApiKey = false;
    this.enableCustomAttribute = true;
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

  transformImage(profilePicture) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
  }

  setCofirmPasswordError() {
    const newpassword = this.form.get('password');
    const confirmNewPassword = this.form.get('confirmPassword');
    confirmNewPassword.valueChanges.subscribe(data => {
      if (newpassword.value !== data) {
        this.form.get('confirmPassword').setErrors({ notEqual: true });
      }
    });
  }

  getLoggedinUserInfo() {
    this.service.getLoggedInUserDetails().subscribe(data => {
      this.userDetails = data;
      this.userRoleList = this.userDetails.userRoleList;
      if (this.userDetails.groupVOList?.length < 5) {
        this.groupList = this.userDetails.groupVOList;
        this.userGroupList = this.userDetails.groupVOList;
      } else {
        this.userGroupList = this.userDetails.groupVOList;
        this.userGroupList.forEach((group, i) => {
          if (i < 4) {
            this.groupList.push(group);
          }
        });
        this.loadButtonName = '+' + (this.userGroupList.length - 4) + ' more';
      }
      if (this.userDetails && this.userDetails.userSignatureListVO && this.userDetails.userSignatureListVO.userSignatureVoList) {
        this.signatureList = this.userDetails.userSignatureListVO.userSignatureVoList;
      } else {
        this.signatureList = [];
      }
      this.userVO.emailId = data.emailId;
      this.userVO.contactEmailId = data.contactEmailId;
      this.userVO.mobileNumber = data.mobileNumber;
      this.userVO.firstName = data.firstName;
      this.userVO.lastName = data.lastName;
      this.userVO.password = data.password;
      this.userVO.profilePicture = data.profilePicture;
      this.userVO.roleId = data.roleId;
      this.userVO.userId = data.userId;
      this.userVO.userName = data.userName;
      this.userVO.userRole = data.userRole;
      this.userVO.globalSpecification = data.globalSpecification;
      this.userVO.color = this.userDetails.color;
      this.userVO.defaultLanguage = this.userDetails.defaultLanguage;
      this.defaultColor = this.userDetails.color;
      this.timeZone = this.userDetails.timezone;
      this.recallTimeZone = true;
      this.isShow = true;
      this.checkEnforce();
      this.loadForm();
      if (this.signatureList[0]) {
        this.getSignature();
      }
      if (this.signatureList[1]) {
        this.getSignature1();
      }
      if (this.signatureList[2]) {
        this.getSignature2();
      }

      this.service.getUserProfilePicture().subscribe(profile => {
        this.profile = true;
        this.enableProfilePictureSave = true;
        this.croppedImage = profile.profilePicture;
        this.loadProfilePicture = profile.profilePicture;
        if (profile.profilePicture !== null) {
          this.enableRemove = true;
        }
      });
    });
  }

  changeAvatarColor(color: string): void {
    this.userVO.color = color;
    this.form.get('color').setValue(color);
    this.form.get('color').markAsDirty();
  }

  checkEnforce() {
    if (this.userDetails.twoFactorEnforced === true) {
      this.userDetails.isTwoFactor = 'Y';
    }
  }


  getQrByMethod() {
    const otpVo = new QrDetailsVo();
    otpVo.userName = this.userDetails.userName;
    this.service.checkQr(otpVo).subscribe(data => {
      if (data !== undefined && data.response === 'valid' && data.twoFactorMethods !== null && data.disable === false) {
        this.twoFactorMethods = data.twoFactorMethods;
        // this.service.userLoginForQr(this.loginVO).subscribe(login => {
        // if (login && login.response === 'valid') {
        if (this.twoFactorMethods.length === 1) {
          this.twoFactorMethod = this.twoFactorMethods[0];
          this.setUpQr();
        } else {
          this.selectQr();
        }

      }
    });
  }

  getOtpValue(type: string) {
    if (this.twoFactorMethod === 'Email Authenticator') {
      this.emailAuthenticator(type, 'verify');
    } else {
      const dialogRef = this.dialog.open(QrSetupComponent, {
        disableClose: true,
        data: { data: 'otp-check', userSetting: true, twoFactorMethod: this.twoFactorMethod, userName: this.userVO.userName },
        width: '350px',
      });
      dialogRef.afterClosed().subscribe(otp => {
        if (otp && otp === 'emailCheck') {
          this.emailAuthenticator(type, 'verify');
        } else {
          if (otp && otp.form.enterOtp !== '' && otp.form.enterOtp !== null) {
            this.userVO = this.form.getRawValue();
            if (type === 'reset') {
              this.resetTwoFactor();
            } else if (type === 'remove') {
              this.removeTwoFactor();
            }
          }
        }
      });
    }
  }

  resetTwoFactor() {
    this.service.resetTwoFactorAuth(this.userVO.userId).subscribe(data => {
      if (data.response === 'Two Factor has been reset successfully') {
        this.getLoggedinUserInfo();
      }
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: data.response
      });
    });
  }

  emailAuthenticator(type: string, verify: string) {
    const otpVo = new QrDetailsVo();
    otpVo.userName = this.userDetails.userName;
    otpVo.otpProvider = this.twoFactorMethod;
    otpVo.secret = verify;
    this.service.checkEmailQr(otpVo).subscribe(emailQr => {
      if (emailQr.otp !== null) {
        const dialogRef = this.dialog.open(QrSetupComponent, {
          disableClose: true,
          data: { data: 'email-qr', userName: this.userDetails.userName, otpKey: emailQr.otp, contactEmail: emailQr.qrImageUrl },
          width: '400px',
        });
        dialogRef.afterClosed().subscribe(otp => {
          if (otp === true) {
            this.userVO = this.form.getRawValue();
            if (type === 'reset') {
              this.resetTwoFactor();
            } else if (type === 'remove') {
              this.removeTwoFactor();
            } else {
              this.getLoggedinUserInfo();
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'Two Factor is set successfully'
              });
            }
          }
        });
      }
    });
  }

  selectQr() {
    const dialogRef = this.dialog.open(QrSetupComponent, {
      disableClose: true,
      data: { data: 'qr-method', userName: this.userDetails.userName, twoFactorMethods: this.twoFactorMethods },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(otp => {
      if (otp !== null && otp !== false) {
        this.twoFactorMethod = otp;
        this.setUpQr();
      } else {
        // this.isDisable = false;
      }
    });
  }

  loadForm() {
    this.form = this.fb.group({
      userId: [this.userVO.userId],
      firstName: [{ value: this.userVO.firstName, disabled: (this.authType === 'Microsoft' || this.authType === 'Google') ? true : false },
      [Validators.required]],
      lastName: [{ value: this.userVO.lastName, disabled: (this.authType === 'Microsoft' || this.authType === 'Google') ? true : false },
      [Validators.required]],
      emailId: [{ value: this.userVO.emailId, disabled: true }, [Validators.required, Validators.email]],
      contactEmailId: [{ value: this.userVO.contactEmailId, disabled: false }, [Validators.required, Validators.email]],
      password: [{ value: '', disabled: false },
      [Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#^])(?=.*[0-9])[A-Za-z\d@$!%*?&#^0-9]{6,50}$')]],
      confirmPassword: [{ value: '', disabled: false }],
      oldPassword: [{ value: '', disabled: false }],
      userName: [{ value: this.userVO.userName, disabled: true }],
      mobileNumber: [{ value: this.userVO.mobileNumber, disabled: (this.authType === 'Microsoft' || this.authType === 'Google') ? true : false }],
      signarray: this.fb.array([
        this.signFormGroup()
      ]),
      defaultLanguage: [this.userVO.defaultLanguage],
      color: [this.userVO.color],
    });
    this.show = true;
    this.setCofirmPasswordError();
    this.passwordValidation();
  }
  signFormGroup(): FormGroup {
    return this.fb.group({
      name: [''],
      sign: [''],

    });
  }
  getSubStatusFormArray(): FormArray {
    return this.form.get('signarray') as FormArray;
  }
  addSubStatusArray(): void {
    (this.form.get('signarray') as FormArray).push(this.signFormGroup());
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

  setValidatorForSubmit(value) {
    const password = this.form.get('password');
    const confirmPassword = this.form.get('confirmPassword');
    const firstName = this.form.get('firstName');
    const lastName = this.form.get('lastName');
    const emailId = this.form.get('emailId');
    const contactEmailId = this.form.get('contactEmailId');
    const userName = this.form.get('userName');
    const oldPassword = this.form.get('oldPassword');
    if (value === 'user') {
      firstName.setValidators([Validators.required]);
      lastName.setValidators([Validators.required]);
      emailId.setValidators([Validators.required]);
      contactEmailId.setValidators([Validators.required]);
      password.setValue(null);
      confirmPassword.setValue(null);
      oldPassword.setValue(null);
      confirmPassword.setErrors({ notEqual: false });
      confirmPassword.setErrors(null);
      password.setValidators(null);
      confirmPassword.setValidators(null);
      userName.setValidators(null);
      oldPassword.setValidators(null);
    } else {
      firstName.setValidators(null);
      lastName.setValidators(null);
      emailId.setValidators(null);
      contactEmailId.setValidators(null);
      password.setValidators([Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#^])(?=.*[0-9])[A-Za-z@$!%*?&#^0-9]{6,50}$')]);
      confirmPassword.setValidators([Validators.required]);
      userName.setValidators([Validators.required]);
      oldPassword.setValidators([Validators.required]);
    }
    confirmPassword.updateValueAndValidity();
    password.updateValueAndValidity();
    firstName.updateValueAndValidity();
    lastName.updateValueAndValidity();
    emailId.updateValueAndValidity();
    contactEmailId.updateValueAndValidity();
    userName.updateValueAndValidity();
    oldPassword.updateValueAndValidity();
  }

  submitUserDetails(userForm) {
    this.setValidatorForSubmit('user');
    if (userForm.valid) {
      const language = this.userVO.defaultLanguage;
      this.userVO = this.form.getRawValue();
      this.userVO.timezone = this.timeZone;
      this.service.createUser(this.userVO).subscribe(data => {
        if (data.response) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          if (language !== this.userVO.defaultLanguage) {
            localStorage.removeItem('translate_lang');
            localStorage.setItem('translate_lang', this.userVO.defaultLanguage);
            window.location.href = window.location.origin + '/' + this.userVO.defaultLanguage + this.router.url;
          }
        }
        this.getLoggedinUserInfo();
      });
    }
  }

  changeUserProfilePicture() {
    this.userVO = this.form.getRawValue();
    this.userVO.profilePicture = null;
    const jsonData = JSON.stringify(this.userVO);
    this.userVO.profilePicture = new FormData();
    this.userVO.profilePicture.append('userDetails', jsonData);
    this.userVO.profilePicture.append('file', this.userProfilePicture);
    this.service.saveUserProfile(this.userVO).subscribe(data => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: data.response,
      });
      if (data.response.includes('Profile Picture Updated successfully') || (data.response.includes('Profile Picture Saved Successfully')) || data.response.includes('Profile Picture Removed Successfully')) {
        this.getLoggedinUserInfo();
        this.userProfilePicture = '';
      }
    });
  }

  changePassword(userForm) {
    this.setValidatorForSubmit('password');
    const newpassword = this.form.get('password').value;
    const confirmNewPassword = this.form.get('confirmPassword').value;
    if (newpassword !== confirmNewPassword) {
      this.form.get('confirmPassword').setErrors({ notEqual: true });
    }
    if (userForm.valid) {
      this.passwordVO.oldPasssword = this.form.get('oldPassword').value;
      this.passwordVO.confirmNewPassword = this.form.get('confirmPassword').value;
      this.passwordVO.newPassword = this.form.get('password').value;
      this.service.changePassword(this.passwordVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        // userForm.resetForm();
        this.getLoggedinUserInfo();
      });
    }
  }

  removeProfilePicture() {
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.userProfilePicture = '';
    this.changeUserProfilePicture();
  }

  resetProfilePicture() {
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.userProfilePicture = '';
    this.getLoggedinUserInfo();
  }

  resetUserDetails() {
    // this.form.get('firstName').setValue('');
    // this.form.get('lastName').setValue('');
    // this.form.get('firstName').clearValidators();
    // this.form.get('firstName').updateValueAndValidity();
    // this.form.get('lastName').clearValidators();
    // this.form.get('lastName').updateValueAndValidity();
    this.recallTimeZone = false;
    this.userVO.color = this.defaultColor;
    this.form.get('emailId').disable();
    this.loadForm();
    this.timeZone = this.userDetails.timezone;
    setTimeout(() => {
      this.recallTimeZone = true;
    }, 500);
  }

  resetPassword(userForm) {
    this.form.get('password').setValue('');
    this.form.get('confirmPassword').setValue('');
    this.form.get('oldPassword').setValue('');
    this.form.get('password').clearValidators();
    this.form.get('password').updateValueAndValidity();
    this.form.get('confirmPassword').clearValidators();
    this.form.get('confirmPassword').updateValueAndValidity();
    this.form.get('oldPassword').clearValidators();
    this.form.get('oldPassword').updateValueAndValidity();
  }

  changeProfilePicture(usage) {
    const profilePicture = this.dialog.open(ProfilePictureDialogBoxComponent, {
      width: '40%',
      data: { type: 'profile-picture', usage, croppedImage: this.croppedImage },
      panelClass: 'task-property-dialogBox'
    });
    profilePicture.afterClosed().subscribe(image => {
      if (image === 'remove') {
        this.removeProfilePicture();
      } else if (image) {
        this.profile = true;
        this.croppedImage = image.cropImage;
        const blob = this.dataURLToBlob(this.croppedImage, image.fileImage.type);
        this.userProfilePicture = new File([blob], image.fileImage.name);
        this.changeUserProfilePicture();
      }
    });
  }

  dataURLToBlob(dataURL, fileType) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: fileType });
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  resetTwoFactorAuth() {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      data: { type: 'reset-two-factor' }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.getOtpValue('reset');

      }
    });
  }

  twoFactorsetUp() {
    this.getQrByMethod();

  }

  removeTwoFactor() {
    this.service.removeTwoFactorAuth(this.userVO.userId).subscribe(data => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: data.response
      });
      if (data.response === 'Two Factor has been removed successfully') {
        this.getLoggedinUserInfo();
      }
    });
  }

  disableTwoFactorAuth() {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      data: { type: 'remove-two-factor' }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        if (this.userDetails.twoFactorSetUp === true) {
          this.getOtpValue('remove');
        } else {
          this.removeTwoFactor();
        }
      }
    });
  }

  enableTwoFactorAuth() {
    if (this.isAllowed) {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '400px',
        data: { type: 'enable-two-factor' }
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          this.userIdList.push(this.userVO.userId);
          this.enableTwoFactorVO.userIdList = this.userIdList;
          this.enableTwoFactorVO.isEnableAll = false;
          this.service.enableTwoFactorAuth(this.enableTwoFactorVO).subscribe(data1 => {
            if (data1.response === 'Two factor enabled') {
              this.getLoggedinUserInfo();
              this.twoFactorsetUp();
            }
          });
        }
      });
    } else {
      const dialog = this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
      });
    }
  }

  setUpQr() {
    if (this.twoFactorMethod === 'Email Authenticator') {
      this.emailAuthenticator('', '');
    } else {
      const dialogRef = this.dialog.open(QrSetupComponent, {
        disableClose: true,
        data: { data: 'qr-setup', userName: this.userDetails.userName, twoFactorMethod: this.twoFactorMethod },
        width: '600px',
      });
      dialogRef.afterClosed().subscribe(otp => {
        if (otp && otp.login === true) {
          this.otpVerified = true;
          this.codes = otp.codes;
          this.recoveryCodes();
        }
      });
    }
  }

  recoveryCodes() {
    this.loginVO.hasTwofactor = this.userDetails.isTwofactor;
    if (this.otpVerified === true) {
      this.userDetails.isTwofactor = 'N';
    }
    if (this.codes && this.codes !== null) {
      const dialogRef = this.dialog.open(QrSetupComponent, {
        disableClose: true,
        data: { data: 'recovery-code', codes: this.codes },
        width: '450px',
      });
      dialogRef.afterClosed().subscribe(otp => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Two factor is set successfully'
        });
        this.getLoggedinUserInfo();
      });
    }
  }

  openApiKey(apiId) {
    const apiKeyDialog = this.dialog.open(ApiKeyDialogBoxComponent, {
      disableClose: true,
      width: '1500px',
      height: '100%',
      data: { type: 'api-key', apiId },
      panelClass: 'task-property-dialogBox'
    });
    apiKeyDialog.afterClosed().subscribe(taskData => {
      if (taskData === true) {
        this.apiKey.refreshGrid();
      }
    });
  }

  receiveMessage($event) {
    if ($event.col1 !== undefined) {
      this.openApiKey($event.col1);
    }
  }

  openSignature() {
    if (this.isSignatureAllowed) {
      if (this.signatureList) {
        this.signature = this.signatureList;
      }
      else {
        this.signature = '';
      }
      const dialog = this.dialog.open(SignaturedialogComponent, {
        disableClose: true,
        width: '500px',
        data: { show: this.default, value: this.signature, type: 'new' }
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          this.signatureList.push(data.data);
          if (this.signatureList.length === 1) {
            this.signatureservice.showSign(this.signatureList[0].signatureKey).subscribe(image => {
              const file = new Blob([data], { type: data.type });
              const blob = new Blob([image], { type: 'image/jpeg' });
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onload = (event) => {
                this.signaturePad.fromDataURL(event.target.result.toString());
                this.signaturePad.set('canvasWidth', document.getElementById('signature').offsetWidth);
                this.signaturePad.clear();
                this.showClose = true;

              };
            });
          }
          if (this.signatureList.length === 2) {
            this.signatureservice.showSign(this.signatureList[1].signatureKey).subscribe(image => {
              const file = new Blob([data], { type: data.type });
              const blob = new Blob([image], { type: 'image/jpeg' });
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onload = (event) => {
                this.signaturePad1.fromDataURL(event.target.result.toString());
                this.signaturePad1.set('canvasWidth', document.getElementById('signature1').offsetWidth);
                this.signaturePad1.clear();
                this.showClose = true;

              };
            });
          }
          if (this.signatureList.length === 3) {
            this.signatureservice.showSign(this.signatureList[2].signatureKey).subscribe(image => {
              const file = new Blob([data], { type: data.type });
              const blob = new Blob([image], { type: 'image/jpeg' });
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onload = (event) => {
                this.signaturePad2.fromDataURL(event.target.result.toString());
                this.signaturePad2.set('canvasWidth', document.getElementById('signature2').offsetWidth);
                this.signaturePad2.clear();
                this.showClose = true;


              };
            });
          }
        }
      });
    } else {
      const dialog = this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
      });
    }
  }
  resizeSignaturePad() {
    this.signaturePad.set('canvasWidth', document.getElementById('signature').offsetWidth);
    this.signaturePad.clear();
    this.getSignature();
  }
  resizeSignature() {
    this.signaturePad1.set('canvasWidth', document.getElementById('signature1').offsetWidth);
    this.signaturePad1.clear();
    this.getSignature1();
  }
  resize() {
    this.signaturePad2.set('canvasWidth', document.getElementById('signature2').offsetWidth);
    this.signaturePad2.clear();
    this.getSignature2();

  }

  getSignature() {
    this.signatureservice.showSign(this.signatureList[0].signatureKey).subscribe(image => {
      const blob = new Blob([image], { type: 'image/jpeg' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = (event) => {
        this.signaturePad.set('canvasWidth', document.getElementById('signature').offsetWidth);
        this.signaturePad.clear();
        this.signaturePad.fromDataURL(event.target.result.toString());
        this.showClose = true;



      };
    });
  }
  getSignature1() {
    this.signatureservice.showSign(this.signatureList[1].signatureKey).subscribe(image => {
      const blob = new Blob([image], { type: 'image/jpeg' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = (event) => {
        this.signaturePad1.set('canvasWidth', document.getElementById('signature1').offsetWidth);
        this.signaturePad1.clear();
        this.signaturePad1.fromDataURL(event.target.result.toString());
        this.showClose = true;


      };
    });
  }
  getSignature2() {
    this.signatureservice.showSign(this.signatureList[2].signatureKey).subscribe(image => {
      const blob = new Blob([image], { type: 'image/jpeg' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = (event) => {
        this.signaturePad2.set('canvasWidth', document.getElementById('signature2').offsetWidth);
        this.signaturePad2.clear();
        this.signaturePad2.fromDataURL(event.target.result.toString());
        this.showClose = true;

      };
    });
  }
  delete(index: number) {
    if (index === 0) {
      this.signname = this.signatureList[0].signatureName;
    }
    if (index === 1) {
      this.signname = this.signatureList[1].signatureName;

    }
    if (index === 2) {
      this.signname = this.signatureList[2].signatureName;

    }
    const dialog = this.dialog.open(ConfirmdialogComponent, {
      disableClose: true,
      width: '500px',
      data: { name: this.signname, type: 'signature' }

    });
    dialog.afterClosed().subscribe(data => {
      if (data === 'yes') {
        if (index === 0) {
          this.signatureservice.deleteSignature(this.signatureList[0].signatureId).subscribe(res => {
            if (res.response === 'deleted') {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'Signature Deleted Successfully',
              });
              this.ngOnInit();
            }
          });
        }
        if (index === 1) {
          this.signatureservice.deleteSignature(this.signatureList[1].signatureId).subscribe(res => {
            if (res.response === 'deleted') {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'Signature Deleted Successfully',
              });
              this.ngOnInit();
            }
          });
        }
        if (index === 2) {
          this.signatureservice.deleteSignature(this.signatureList[2].signatureId).subscribe(res => {
            if (res.response === 'deleted') {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'Signature Deleted Successfully',
              });
              this.ngOnInit();
            }
          });
        }
      }
      else {
        return;
      }
    });
  }
}
