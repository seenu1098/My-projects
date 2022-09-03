import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { User, RolesListVO } from '../signup/signup-vo';
import { UserService } from 'src/shared/service/user-service';
import { MatSnackBar } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { RolesNamesListVO } from 'src/shared/vo/roles-vo';
import { YorogridComponent } from '../yorogrid/yorogrid.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  form: FormGroup;
  userVO = new User();
  hide = true;
  readonly = false;
  roleList: RolesNamesListVO[];
  @ViewChild('user', { static: true }) userGrid: YorogridComponent;

  constructor(private fb: FormBuilder, private service: UserService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.form = this.fb.group({
      userId: [this.userVO.userId],
      password: [this.userVO.password],
      firstName: [{ value: this.userVO.firstName, disabled: true }, [Validators.required]],
      lastName: [{ value: this.userVO.lastName, disabled: true }, [Validators.required]],
      emailId: [{ value: this.userVO.emailId, disabled: true }, [Validators.required, Validators.email]],
      userRole: [[]],
      globalSpecification: [this.userVO.globalSpecification],
    });
    this.getRolesNames();
  }

  receiveMessage($event): void {
    this.readonly = true;
    this.service.getUserForm($event.col6).subscribe(data => {
      this.userVO = data;
      this.roleList = this.userVO.userRole;
      const roleList = [];
      for (let i = 0; i < this.userVO.userRole.length; i++) {
        roleList.push(this.userVO.userRole[i].id);
      }
      this.ngOnInit();
      this.form.controls['userRole'].setValue(roleList);
    });
  }

  updateValidatorsForsubmit(value: string) {
    const userRole = this.form.get('userRole');
    const password = this.form.get('password');
    const globalSpecification = this.form.get('globalSpecification');

    if (value === 'userRole') {
      userRole.setValidators([Validators.required]);
      globalSpecification.setValidators([Validators.required]);
      password.setValidators(null);
    } else {
      password.setValidators([Validators.required]);
      userRole.setValidators(null);
      globalSpecification.setValidators(null);
    }

    userRole.updateValueAndValidity();
    globalSpecification.updateValueAndValidity();
    password.updateValueAndValidity();

  }

  getRolesNames() {
    this.service.getRolesNames().subscribe(data => {
      this.roleList = data;
    });
  }

  changePassword(userForm: NgForm) {
    this.userVO = this.form.getRawValue();
    this.userVO.roleId = this.form.get('userRole').value;
    this.userVO.userRole = null;
    if (userForm.valid) {
      if (this.userVO.password === null) {
        this.updateValidatorsForsubmit('password');
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: 'Passsword Field is Required',
        });
      }
      this.service.updatePassword(this.userVO).subscribe(data => {
        userForm.resetForm();
        this.userGrid.refreshGrid();
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: data.response,
        });
      });
    }

  }

  rolesAndGlobalSpecificationUpdate(userForm: NgForm) {
    this.userVO = this.form.getRawValue();
    if (this.userVO.password === null) {
      this.updateValidatorsForsubmit('userRole');
    }
    this.userVO.roleId = this.form.get('userRole').value;
    this.userVO.userRole = null;
    if (userForm.dirty) {
      if (this.userVO.emailId != null && this.userVO.firstName != null && this.userVO.lastName != null) {
        this.service.updateRolesAndGlobalSpecification(this.userVO).subscribe(data => {
          userForm.resetForm();
          this.userGrid.refreshGrid();
          this.snackBar.openFromComponent(SnackBarComponent, {
            data: data.response,
          });
        });
      } else {
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: 'Global Specification/Roles  are required',
        });
      }
    }
  }

  clearSearch() {
    this.readonly = false;
    this.form.reset();
  }

}
