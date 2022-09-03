import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { element } from 'protractor';
import { GroupsVO } from 'src/app/engine-module/landing-page/landing-page-vo';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { BoardGroups, Groups, Users } from '../../event-automation/event-automation.model';
import { EmitVO, UserVO } from '../models/assign-user-vo';

@Component({
  selector: 'automation-assigned-user',
  templateUrl: './automation-assigned-user.component.html',
  styleUrls: ['./automation-assigned-user.component.scss']
})
export class AutomationAssignedUserComponent implements OnInit {

  @Input() userList: UserVO[] = [];
  @Input() allUsers: UserVO[] = [];
  @Input() groupList: BoardGroups[] = [];
  @Input() users: Users[] = [];;
  @Input() groups: Groups[] = [];
  @Input() emails: string[] = [];
  @Input() type: string;
  @Output() user: EventEmitter<any> = new EventEmitter<any>();
  @Output() group: EventEmitter<any> = new EventEmitter<any>();

  isMultipleUsers: boolean = false;

  options: string[] = ['Single User', 'Multiple Users'];
  loadUsersList: boolean = false;
  usersList: UserVO[] = [];
  hoverIndex: any;
  removeIconMouseOver: boolean = false;
  form: FormGroup;
  customUsers: any[] = [];

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private fb: FormBuilder, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.customUsers = this.emails;
    this.form = this.fb.group({
      users: [],
      groups: [],
      customUsers: ['', [Validators.email]]
    });
    if (this.users !== undefined && this.users !== null) {
      var users: UserVO[] = [];
      for (let i = 0; i < this.users.length; i++) {
        const user = this.userList.find(user => user.userId === this.users[i].userId);
        users.push(user);
      }
      this.form.get('users').setValue(users);
    }
    if (this.groups !== undefined && this.groups !== null) {
      var groups: BoardGroups[] = [];
      for (let i = 0; i < this.groups.length; i++) {
        const group = this.groupList.find(group => group.groupId === this.groups[i].groupId);
        groups.push(group);
      }
      this.form.get('groups').setValue(groups);
    }
  }

  getUserName(): void {
    var users = this.form.get('users').value;
    var groups = this.form.get('groups').value;
    if (this.type === 'notify') {
      if (((users !== undefined && users !== null && users !== '' && users.length > 0)
        || (groups !== undefined && groups !== null && groups !== '' && groups.length > 0)
        || this.customUsers.length !== 0)) {
        this.user.emit({ users: this.form.get('users').value, customUsers: this.customUsers, groups: this.form.get('groups').value });
        this.form.reset();
      } else {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: 'Please select a user or group',
        });
      }
    } else {
      if (users !== undefined && users !== null && users !== '' && users.length > 0) {
        this.user.emit({ users: this.form.get('users').value, customUsers: [], groups: this.form.get('groups').value });
        this.form.reset();
      } else {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: 'Please select a user',
        });
      }
    }
  }

  removeUser(user: UserVO): void {
    const selectedUsers = this.form.get('users').value;
    const index = selectedUsers.indexOf(user);
    if (index !== -1) {
      selectedUsers.splice(index, 1);
    }
    this.form.get('users').setValue(selectedUsers);
  }

  removeGroup(group: BoardGroups): void {
    const selectedGroups = this.form.get('groups').value;
    const index = selectedGroups.indexOf(group);
    if (index !== -1) {
      selectedGroups.splice(index, 1);
    }
    this.form.get('groups').setValue(selectedGroups);
  }

  addCustomUsers(event: MatChipInputEvent): void {
    if ((event.value || '').trim()) {
      if (!this.form.get('customUsers').errors) {
        this.customUsers.push(event.value);
        this.form.get('customUsers').setValue('');
        event.chipInput.clear();
      }
    }
  }

  removeCustomUsers(index: number): void {
    this.customUsers.splice(index, 1);
  }
}
