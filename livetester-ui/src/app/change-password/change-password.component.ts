import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ChangePasswordVO } from './change-password-vo';
import { UserService } from 'src/shared/service/user-service';
import { MatSnackBar } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
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

  save(userForm: NgForm) {
    this.passwordVO = this.form.value;
    if (this.form.valid) {
      this.service.changePassword(this.passwordVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackBarComponent, {
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
