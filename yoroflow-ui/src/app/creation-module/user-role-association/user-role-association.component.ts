import { Component, OnInit } from '@angular/core';
import { RoleListVO } from './role-vo';
import { RolesService } from './roles.service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TaskBoardService } from '../../taskboard-module/taskboard-configuration/taskboard.service';
import { UserVO } from '../../taskboard-module/taskboard-form-details/taskboard-task-vo';
import { YoroGroupsUserVO } from './role-vo';
import { GroupService } from '../../engine-module/group/group-service';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-user-role-association',
  templateUrl: './user-role-association.component.html',
  styleUrls: ['./user-role-association.component.scss']
})
export class UserRoleAssociationComponent implements OnInit {
  terms: "";
  terms1: "";
  selectable = true;
  show: boolean = false;
  enableCondition: boolean = false;
  removable = true;
  selectedUsers: any = [];
  groupList: any[];
  isSelect: boolean = false;
  selected_array: any = [];
  usersList: UserVO[] = [];
  form: FormGroup;
  userId: any = [];
  screenHeight: string;
  screenHeight1: string;
  show_selected: boolean = false;
  yoroGroupsUsers = new YoroGroupsUserVO();
  ismatch: boolean = false;
  show_done: boolean = false;
  checked: boolean;
  indeterminate: boolean;
  screenWidth: any;
  screenHeight2: any;
  user_id: any = [];
  sample: boolean;
  myArray: any;
  rolesList: any;
  groupName: any;
  constructor(private service: RolesService, private groupservice: GroupService, private snackBar: MatSnackBar, private fb: FormBuilder, private taskboardservice: TaskBoardService) { }
  ngOnInit(): void {
    this.service.getRolesList().subscribe(res => {
      this.rolesList = res;
    })
    this.taskboardservice.getUsersList().subscribe((data) => {
      this.usersList = data;
      for (let i = 0; i < this.usersList.length; i++) {
        this.usersList[i].filter = true;
      }
    });
    this.form = this.fb.group({
      id: [''],
      roleId: ['', [Validators.required]],
      searchUser: [],
      searchselected: []
    });
    this.formValueChanges();
    this.formValueChanges1();
    this.screenHeight = (window.innerHeight - 95) + 'px';
    this.screenHeight1 = (window.innerHeight - 63) + 'px';
  }
  formValueChanges() {
    this.form.get('searchUser').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.myArray.length; i++) {
          const searchData = data.toLowerCase();
          const firstName = this.myArray[i].firstName.toLowerCase();
          const lastName = this.myArray[i].lastName.toLowerCase();
          if (firstName.includes(searchData) || lastName.includes(searchData) || firstName.startsWith(searchData) || lastName.startsWith(searchData)) {
            this.myArray[i].filter = true;
          } else {
            this.myArray[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.myArray.length; i++) {
          this.myArray[i].filter = true;
        }
      }
    });
  }
  formValueChanges1() {
    this.form.get('searchselected').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.selectedUsers.length; i++) {
          const searchData = data.toLowerCase();
          const firstName = this.selectedUsers[i].firstName.toLowerCase();
          const lastName = this.selectedUsers[i].lastName.toLowerCase();
          if (firstName.includes(searchData) || lastName.includes(searchData)) {
            this.selectedUsers[i].filter = true;
          } else {
            this.selectedUsers[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.selectedUsers.length; i++) {
          this.selectedUsers[i].filter = true;
        }
      }
    });
  }
  getRoleId(event) {
    this.show_selected = true;
    this.show = false;
    this.enableCondition = false;
    this.groupName = event.source.value;
    this.taskboardservice.getUsersList().subscribe((data) => {
      this.usersList = data;
    });
    this.selectedUsers = [];
    this.service.getUserRoleList(this.groupName).subscribe(dataa => {
      this.userId = dataa.userId;
      for (let i = 0; i < this.usersList.length; i++) {
        for (let j = 0; j < this.userId.length; j++) {
          if (this.usersList[i].userId === this.userId[j]) {
            this.sample = true;
            this.selectedUsers.push(this.usersList[i]);
          }
        }
      }
      for (let i = 0; i < this.selectedUsers.length; i++) {
        this.selectedUsers[i].filter = true;
      }
      this.myArray = this.usersList.filter((item) => !this.selectedUsers.includes(item));
      for (let i = 0; i < this.myArray.length; i++) {
        this.myArray[i].filter = true;
      }
    });
  }
  setUserProfilename(user: UserVO): string {
    return user.firstName.charAt(0).toUpperCase();
  }
  add(val, index) {
    this.show = true;
    for (let j = 0; j < this.usersList.length; j++) {
      if (this.usersList[j].userId === val.userId) {
        this.selectedUsers.unshift(this.usersList[j]);
      }
    }
    for (let i = 0; i < this.selectedUsers.length; i++) {
      this.selectedUsers[i].filter = true;
    }
    this.myArray.forEach((element, index) => {
      if (element.userId == val.userId) this.myArray.splice(index, 1);
    });
    this.form.get('searchUser').setValue('');

  }
  remove(val, index) {
    this.show = true;
    this.selectedUsers.forEach((element, index) => {
      if (element.userId == val.userId) this.selectedUsers.splice(index, 1);
    });
    this.myArray.unshift(val);
    for (let i = 0; i < this.myArray.length; i++) {
      this.myArray[i].filter = true;
    }
  }
  save(userForm) {
    this.userId = [];
    if (this.enableCondition === true && this.selectedUsers.length === 0) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Select atleast one user'
      });
    }
    else {
      for (let i = 0; i < this.selectedUsers.length; i++) {
        this.selectedUsers[i].filter = true;
        this.userId.push(this.selectedUsers[i].userId);
      }
      this.yoroGroupsUsers.id = this.form.get('id').value;
      this.yoroGroupsUsers.roleId = this.form.get('roleId').value;
      this.yoroGroupsUsers.userId = this.userId;
      this.service.saveRoles(this.yoroGroupsUsers).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
      });
      this.enableCondition = false;
      this.show = false;
    }
  }
  reset(userForm) {
    this.show = false;
    this.selectedUsers = [];
    this.service.getUserRoleList(this.groupName).subscribe(dataa => {
      this.userId = dataa.userId;
      for (let i = 0; i < this.usersList.length; i++) {
        for (let j = 0; j < this.userId.length; j++) {
          if (this.usersList[i].userId === this.userId[j]) {
            this.sample = true;
            this.selectedUsers.push(this.usersList[i]);
          }
        }
      }
      for (let i = 0; i < this.selectedUsers.length; i++) {
        this.selectedUsers[i].filter = true;
      }


      this.myArray = this.usersList.filter((item) => !this.selectedUsers.includes(item));
      for (let i = 0; i < this.myArray.length; i++) {
        this.myArray[i].filter = true;
      }
    });
  }

}
