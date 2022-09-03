import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BoardGroups } from '../event-automation/event-automation.model';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';
import { UserVO } from '../taskboard-form-details/taskboard-task-vo';
import { SecurityService } from '../taskboard-security/security.service';

@Component({
  selector: 'app-completed-tasks',
  templateUrl: './completed-tasks.component.html',
  styleUrls: ['./completed-tasks.component.scss']
})
export class CompletedTasksComponent implements OnInit {

  constructor(public activateRoute: ActivatedRoute, private taskboardService: TaskBoardService, private securityService: SecurityService) { }
  columnName: string;
  taskboardId: string;
  taskboardKey: string;
  boardGroupsList: BoardGroups[] = [];
  boardUsersList: any[] = [];
  usersList: UserVO[] = [];
  isFromTaskboard = false;
  ngOnInit(): void {
    this.loadUserAndGroupList();
    this.activateRoute.paramMap.subscribe(params => {
      if (params.get('taskboard-id') !== undefined && params.get('taskboard-id') !== null &&
        params.get('column-name') !== undefined && params.get('column-name') !== null &&
        params.get('taskboard-key') !== undefined && params.get('taskboard-key') !== null) {
        this.taskboardId = params.get('taskboard-id');
        this.columnName = params.get('column-name');
        this.taskboardKey = params.get('taskboard-key');
      }
    });
  }
  loadUserAndGroupList() {
    this.taskboardService.getUsersList().subscribe((data) => {
      this.usersList = data;
      if (this.usersList.length > 0) {
        for (let i = 0; i < this.usersList.length; i++) {
          this.usersList[i].randomColor = this.getRandomColor();
          this.usersList[i].isSelected = false;
        }
      }
      this.loadBoardUsers();
    });
  }
  getRandomColor() {
    return (
      "#" +
      ("000000" + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
    );
  }
  loadBoardUsers() {
    this.securityService.getTaskboardSecurity(this.taskboardId).subscribe(data => {
      this.boardGroupsList = data.securityList;
      for (let i = 0; i < this.boardGroupsList.length; i++) {
        this.usersList.forEach(element => {
          element.groupVOList.forEach(group => {
            if (group.groupName === this.boardGroupsList[i].groupId) {
              this.boardUsersList.push(element);
            }
          });
        });
      }
      for (let i = 0; i < data.columnSecurityList.length; i++) {
        for (let j = 0; j < data.columnSecurityList[i].columnPermissions.length; j++) {
          this.usersList.forEach(element => {
            element.groupVOList.forEach(group => {
              if (group.groupName === data.columnSecurityList[i].columnPermissions[j].groupId) {
                this.boardUsersList.push(element);
              }
            });
          });
        }
      }
      for (let i = 0; i < data.taskboardOwner.length; i++) {
        let user = this.usersList.find(user => user.userId === data.taskboardOwner[i]);
        this.boardUsersList.push(user);
      }
      this.boardUsersList = this.boardUsersList.filter((v, i) => this.boardUsersList.findIndex(item => item.userId == v.userId) === i);
      this.boardUsersList.forEach(param => param.isSelected = false);
      this.isFromTaskboard = true;
    });

  }

}
