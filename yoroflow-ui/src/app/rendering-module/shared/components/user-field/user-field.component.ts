import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { FormValidationService } from '../../service/form-service/form-validation.service';
import { LoadFormService } from '../../service/form-service/load-form.service';
import { UserService } from '../../service/user-service';
import { Field } from '../../vo/page-vo';
import { UserVO } from '../../vo/user-vo';
import { ResponseString } from '../../vo/response-vo';

@Component({
  selector: 'app-user-field',
  templateUrl: './user-field.component.html',
  styleUrls: ['./user-field.component.scss']
})
export class UserFieldComponent implements OnInit {

  users: UserVO[] = [];
  field: Field;
  group: FormGroup;
  required = '';
  showControl = true;
  filteredUsers: UserVO[] = [];

  constructor(private userService: UserService, public el: ElementRef, public formService: CreateFormService, public activateRoute: ActivatedRoute,
    public dynamicService: DynamicQueryBuilderService, public loadFormService: LoadFormService,
    public dialog: MatDialog, public validationService: FormValidationService, private workspaceService: WorkspaceService, private fb: FormBuilder) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
  }

  ngOnInit(): void {
    this.group.addControl('search', this.fb.control(''));
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    if (this.group.get(this.field.name) && this.group.get(this.field.name).hasError('required')) {
      this.required = ' *';
    }
    if (!this.group.get('publicpage') || this.group.get('publicpage').value !== true) {
      this.loadUsers();
      this.formValueChanges();
    }
  }

  loadUsers(): void {
    if (this.field.control.allowLoggedInUser === true) {
      this.userService.getUsersList().subscribe(data => {
        if (data) {
          this.users = data;
          this.filteredUsers = JSON.parse(JSON.stringify(data));
        }
      });
    } else if (this.field.control.workspaceUser === true) {
      this.userService.getWorkspaceUsersList(this.workspaceService.getWorkspaceID()).subscribe(data => {
        if (data) {
          this.users = data;
          this.filteredUsers = JSON.parse(JSON.stringify(data));
        }
      });
    } else {
      const responseVO = new ResponseString();
      responseVO.groupNameList = this.field.control.teams;
      this.userService.getSelectedTeamUsersList(responseVO).subscribe(data => {
        if (data) {
          this.users = data;
          this.filteredUsers = JSON.parse(JSON.stringify(data));
        }
      });
    }
  }

  formValueChanges(): void {
    this.group.get('search').valueChanges.subscribe(data => {
      if (data) {
        const searchData = data.toLowerCase();
        this.filteredUsers = [];
        this.users.forEach(user => {
          if (user.firstName.toLowerCase().includes(searchData) || user.lastName.toLowerCase().includes(searchData)) {
            this.filteredUsers.push(user);
          }
        });
        if(this.filteredUsers.length===0){
          this.filteredUsers = JSON.parse(JSON.stringify(this.users));
        }
      } else {
        this.filteredUsers = JSON.parse(JSON.stringify(this.users));
      }
    });
  }
}
