import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { YorogridComponent } from 'yoroapps-creation';
import { YorogridComponent } from "../../shared-module/yorogrid/yorogrid.component";
import { YoroGroupsUserVO } from '../../engine-module/yoro-security/security-vo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupService } from '../../engine-module/group/group-service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { TaskBoardService } from '../../taskboard-module/taskboard-configuration/taskboard.service';
@Component({
  selector: 'app-user-group-association',
  templateUrl: './user-group-association.component.html',
  styleUrls: ['./user-group-association.component.scss']
})
export class UserGroupAssociationComponent implements OnInit {

  constructor(private fb: FormBuilder, private service: GroupService, private snackBar: MatSnackBar,private taskboardService:TaskBoardService) { }

  groupList: any[];
  usersList: any[];
  form: FormGroup;
  userId: any[] = [];
  screenHeight: string;
  screenHeight1: string;
  yoroGroupsUsers = new YoroGroupsUserVO();
  @ViewChild('yoro_group_users', { static: true }) yoroGroupUsersGrid: YorogridComponent;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = (window.innerHeight - 72) + 'px';
    this.screenHeight1 = (window.innerHeight - 63) + 'px';
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      groupId: ['', [Validators.required]]
    });
    this.service.getGroupList().subscribe(data => {
      this.groupList = data;
    });
    this.taskboardService.getUsersList().subscribe((data) => {
      this.usersList = data;
    });
    this.screenHeight = (window.innerHeight - 72) + 'px';
    this.screenHeight1 = (window.innerHeight - 63) + 'px';
  }

  save(userForm) {
    this.yoroGroupsUsers.id = this.form.get('id').value;
    this.yoroGroupsUsers.groupId = this.form.get('groupId').value;
    this.yoroGroupsUsers.userId = this.userId;
    if (this.userId.length > 0) {
      this.service.saveYoroGroupsUsers(this.yoroGroupsUsers).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        userForm.resetForm();
        this.yoroGroupUsersGrid.refreshGrid();
        this.userId = [];
      });
    } else {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Select atleast one user'
      });
    }

  }

  getGroupId(event, data) {
    if (event.isUserInput) {
      this.yoroGroupUsersGrid.isSelectAll = false;
      this.userId = [];
      this.service.getUserIdList(data).subscribe(dataa => {
        this.userId = dataa;
        this.yoroGroupUsersGrid.isSelctedIndividual(dataa, null);
      });
    }

  }

  reset(userForm) {
    userForm.resetForm();
    this.ngOnInit();
    this.userId = [];
    this.yoroGroupUsersGrid.refreshGrid();
  }

  individualSelectCheckbox(event) {
    if (event.checked) {
      this.userId.push(event.data.col1);
    } else if (event.checked === false) {
      for (let i = 0; i < this.userId.length; i++) {
        if (this.userId[i] === event.data.col1) {
          this.userId.splice(i, 1);
        }
      }
    }
  }

  isSelectAll(event) {
    if (event.checked) {
      this.service.getAllUserIdList().subscribe(data => {
        this.userId = data;
      });
    } else if (event.checked === false) {
      this.userId = [];
    }

  }

}