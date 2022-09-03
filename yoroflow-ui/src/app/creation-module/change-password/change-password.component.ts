import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { UserService } from '../shared/service/user-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangePasswordVO } from './change-password-vo';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  form: FormGroup;
  passwordVO = new ChangePasswordVO();
  hideOld = true;
  hideNew = true;
  hideConfirm = true;


  constructor(private fb: FormBuilder, private service: UserService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.form = this.fb.group({
      oldPasssword: [this.passwordVO.oldPasssword, [Validators.required]],
      newPassword: [this.passwordVO.newPassword, [Validators.required]],
      confirmNewPassword: [this.passwordVO.confirmNewPassword, [Validators.required]],
    });
  }

  updateValidatorsForsubmit(value: string) {
    const oldPasssword = this.form.get('oldPasssword');
    const confirmNewPassword = this.form.get('confirmNewPassword');
    const newPassword = this.form.get('newPassword');
    if (value === 'password') {
      oldPasssword.setValidators([Validators.required]);
      confirmNewPassword.setValidators([Validators.required]);
      newPassword.setValidators([Validators.required]);
    } else {
      oldPasssword.setValidators(null);
      confirmNewPassword.setValidators(null);
      newPassword.setValidators(null);
    }
    oldPasssword.updateValueAndValidity();
    confirmNewPassword.updateValueAndValidity();
    newPassword.updateValueAndValidity();
  }

  save(userForm) {
    this.updateValidatorsForsubmit('password');
    this.passwordVO = this.form.value;
    const newpassword = this.form.get('newPassword').value;
    const confirmNewPassword = this.form.get('confirmNewPassword').value;
    if (newpassword !== confirmNewPassword) {
      this.form.get('confirmNewPassword').setErrors({ notEqual: true });
    }
    if (this.form.valid) {
      this.service.changePassword(this.passwordVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        userForm.resetForm();
      });
    }
  }

  clearSearch() {
    this.form.reset();
  }


}
