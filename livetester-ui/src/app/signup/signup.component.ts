import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm, FormControl } from '@angular/forms';
import { UserService } from 'src/shared/service/user-service';
import { User } from './signup-vo';
import { MatSnackBar } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { RolesNamesListVO } from 'src/shared/vo/roles-vo';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  signupVO = new User();
  hide = true;
  roleList: RolesNamesListVO[];

  constructor(private fb: FormBuilder, private service: UserService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.signupForm = this.fb.group({
      password: [this.signupVO.password, [Validators.required]],
      firstName: [this.signupVO.firstName, [Validators.required]],
      lastName: [this.signupVO.lastName, [Validators.required]],
      emailId: [this.signupVO.emailId, [Validators.required, Validators.email]],
      userRole: [[], [Validators.required]],
      globalSpecification: [this.signupVO.globalSpecification, [Validators.required]],
    });
    this.getRolesNames();
  }

  getRolesNames() {
    this.service.getRolesNames().subscribe(data => {
      this.roleList = data;
    });
  }


  createUser(userForm: NgForm) {
    this.signupVO = this.signupForm.value;
    this.signupVO.roleId = this.signupForm.get('userRole').value;
    this.signupVO.userRole = null;
    if (userForm.valid) {
      this.service.signup(this.signupVO).subscribe(data => {
        userForm.resetForm();
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: data.response,
        });
      });
    }

  }

}


