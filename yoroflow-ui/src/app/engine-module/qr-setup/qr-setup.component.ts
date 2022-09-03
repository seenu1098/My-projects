import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
// import { QrDetailsVo } from '../login/login-vo';
import { UserService } from '../shared/service/user-service';
import { QrDetailsVo } from '../../login-module/login-vo';

import { ClipboardModule, ClipboardService } from 'ngx-clipboard';
import { YoroFlowConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';

@Component({
  selector: 'lib-qr-setup',
  templateUrl: './qr-setup.component.html',
  styleUrls: ['./qr-setup.component.css']
})
export class QrSetupComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<QrSetupComponent>,
    private sanitizer: DomSanitizer, private formBuilder: FormBuilder, public service: UserService,
    private _clipboardService: ClipboardService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  otpForm: FormGroup;
  qrForm: FormGroup;
  qrImageUrl = null;
  codes: any;
  qrSecret: any;
  invalidotp = false;
  userName: any;
  twoFactorMethod: any;
  twoFactorMethods: string[];
  resentOtp = false;
  otpSentTime: any;
  otpInvalid = false;
  contactEmail = '';
  ngOnInit(): void {
    if (this.data.data === 'otp-check' || this.data.data === 'qr-setup' || this.data.data === 'email-qr') {
      this.otpForm = this.formBuilder.group({
        enterOtp: ['', [Validators.required]],
      });
    }
    if (this.data.data === 'email-qr') {
      this.otpSentTime = new Date().getTime() + 5 * 60000;
      this.contactEmail = this.data.contactEmail;
      this.userName = this.data.userName;
    }
    if (this.data.data === 'qr-method') {
      this.twoFactorMethods = this.data.twoFactorMethods;
      this.otpForm = this.formBuilder.group({
        otpMethod: ['', [Validators.required]],
      });
    }
    if (this.data.data === 'qr-setup' || this.data.data === 'otp-check') {
      this.twoFactorMethod = this.data.twoFactorMethod;
      this.userName = this.data.userName;
      this.getQr();
    }
  }

  getQr() {
    // if (this.qrForm.valid && this.qrForm.get('selectService').value === 'qr') {
    this.service.getQr(this.data.userName).subscribe(qr => {
      if (qr) {
        this.qrImageUrl = (qr.qrImageUrl);
        this.qrSecret = qr;
      }
    },
      error => {
        // this.isDisable = false;
        // this.valid = true;
      });
    // }
  }

  setUpQr(qr) {
    const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
      disableClose: true,
      data: { data: 'scan-qr', qr },
      width: '300px',
    });
    dialogRef.afterClosed().subscribe(otp => {
      if (otp === true) {
        this.dialogRef.close(true);
      } else {
        this.dialogRef.close(false);
      }
    });
  }

  enterRecovery() {
    this.dialogRef.close();
  }

  transformImageQr() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.qrImageUrl);
  }

  enteredOtp() {
    if (this.data.from && this.data.from === 'login') {
      if (this.otpForm.valid) {
        this.dialogRef.close({ form: this.otpForm.value, codes: null });
      }
    } else {
      const otpVo = new QrDetailsVo();
      otpVo.otp = this.otpForm.get('enterOtp').value;
      otpVo.userName = this.userName;
      otpVo.secret = this.qrSecret.secret;
      otpVo.isCheck = 'verify';
      this.service.checkOtp(otpVo).subscribe(data => {
        if (data.userName === 'valid') {
          this.dialogRef.close({ form: this.otpForm.value, codes: null });
        } else {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Invalid OTP'
          });
        }
      });
    }
  }

  enter() {
    if (this.otpForm.valid) {
      const otpVo = new QrDetailsVo();
      otpVo.otp = this.otpForm.get('enterOtp').value;
      otpVo.userName = this.userName;
      otpVo.secret = this.qrSecret.secret;
      otpVo.otpProvider = this.twoFactorMethod;
      otpVo.isCheck = 'save';
      this.service.checkOtp(otpVo).subscribe(qr => {
        if (qr && qr.userName === 'valid') {
          this.dialogRef.close({ login: true, codes: qr.codes });
        } else {
          this.invalidotp = true;
          // this.otpForm.get('enterOtp').setValue('');
        }
      },
        error => {
          this.invalidotp = true;
          // this.otpForm.get('enterOtp').setValue('');
        });
    }
  }

  copyToClipboard() {
    this._clipboardService.copy(this.data.codes);
    // this.toastr.info('Copied to Clipboard');
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: 'Copied to Clipboard',
    });
  }

  enterOtp() {
    this.dialogRef.close(true);
  }

  enterMethod() {
    if (this.otpForm.valid) {
      this.dialogRef.close(this.otpForm.get('otpMethod').value);
    }
  }

  twoFactor(value: string) {
    this.otpForm.get('otpMethod').setValue(value);
    this.otpForm.markAsDirty();
  }

  emailQrCheck() {
    if (this.otpForm.valid) {
      const otpVo = new QrDetailsVo();
      otpVo.otp = this.otpForm.get('enterOtp').value;
      otpVo.userName = this.userName;
      otpVo.secret = this.data.otpKey;
      this.service.validateEmailQr(otpVo).subscribe(qr => {
        if (qr.response === 'valid') {
          this.dialogRef.close(true);
        } else {
          this.otpForm.get('enterOtp').setValue('');
        }
      });
    }
  }

  resendOtp() {
    const otpVo = new QrDetailsVo();
    otpVo.userName = this.data.userName;
    otpVo.otpProvider = 'Email Authenticator';
    this.service.checkEmailQr(otpVo).subscribe(emailQr => {
      if (emailQr.otp !== null) {
        this.data.otpKey = emailQr.otp;
        this.resentOtp = true;
        this.otpInvalid = false;
        this.otpSentTime = new Date().getTime() + 5 * 60000;
        this.contactEmail = emailQr.qrImageUrl;
      }
    });
  }

  emailCheck() {
    this.dialogRef.close('emailCheck');
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  getDataDiff() {
    // const startDates = new Date(date);
    const startDate = new Date();
    var diff = this.otpSentTime - startDate.getTime();
    if (diff <= 0) {
      this.otpInvalid = true;
      return '';
    } else {
      var days = Math.floor(diff / (60 * 60 * 24 * 1000));
      var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
      var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60));
      if (seconds !== 0) {
        if (seconds === 1) {
          return seconds + ' second';
        } else {
          return seconds + ' seconds';
        }
      }
    }
  }

}
