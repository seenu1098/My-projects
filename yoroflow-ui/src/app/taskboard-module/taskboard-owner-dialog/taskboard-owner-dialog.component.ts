import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { colorSets } from '@swimlane/ngx-charts';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { CreateDialogService } from 'src/app/workspace-module/create-dialog/create-dialog.service';
import { ReplaceColumnVO, TaskboardColumns } from '../taskboard-configuration/taskboard.model';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';
import { UserVO } from '../taskboard-form-details/taskboard-task-vo';

import { SecurityService } from '../taskboard-security/security.service';
import { TaskboardSecurityVO } from '../taskboard-security/security.vo';
import { TeamNamesVO, AssignTeamVO } from '../../workspace-module/create-dialog/create-dialog-vo';
import { securityAssignVO } from 'src/app/document-module/documents-vo';
import { DocumentsService } from 'src/app/document-module/documents.service';
import { GroupService } from 'src/app/engine-module/group/group-service';
import { YoroGroupsUserVO } from 'src/app/engine-module/yoro-security/security-vo';
import { TableSecurityVOList } from 'src/app/creation-module/data-table/data-table-vo';
import { TableObjectService } from 'src/app/creation-module/table-objects/table-objects.service';
@Component({
  selector: 'app-taskboard-owner-dialog',
  templateUrl: './taskboard-owner-dialog.component.html',
  styleUrls: ['./taskboard-owner-dialog.component.scss']
})
export class TaskboardOwnerDialogComponent implements OnInit {

  constructor(private documentService: DocumentsService, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<TaskboardOwnerDialogComponent>, public service: TableObjectService,
    private securityService: SecurityService, private taskboardService: TaskBoardService, private snackbar: MatSnackBar,
    private createDialogService: CreateDialogService,
    private groupService: GroupService) { }
  form: FormGroup;
  usersList: UserVO[] = [];
  newTaskboardOwnerList: any[] = [];
  oldTaskboardOwnerList: JSON;
  taskboardSecurityVO = new TaskboardSecurityVO();
  deletedOwnerIdList: string[] = [];
  isEmptyList = false;
  replaceColumnVO = new ReplaceColumnVO;
  updateColumns = new TaskboardColumns();
  updatedWorkspaceOwnerList: any[] = [];
  updatedTeamsOwnerList: any[] = [];
  assignTeamVO = new AssignTeamVO();
  securityTeamVO = new securityAssignVO();
  securityDataTableVO = new TableSecurityVOList();
  updatedDocumentOwnerList: any = [];
  removable = true;
  selectable = true;
  yoroGroupsVO = new YoroGroupsUserVO();
  show = false;
  noOwner = false;
  saveClicked = false;
  ngOnInit(): void {
    if (this.data && (this.data.type === 'taskboard-owner' || this.data.type === 'workspace-owner'
      || this.data.type === 'document-owner' || this.data.type === 'workflow-users' ||
      this.data.type === 'teams-owner' || this.data.type === 'datatable-owner')) {
      this.createOwnerForm();
      this.formValueChanges();
      this.usersList = this.data.usersList;
      this.newTaskboardOwnerList = this.data.taskboardOwnerList;
      if (this.data.type === 'workspace-owner' || this.data.type === 'teams-owner') {
        const ownerID = [];
        if (this.data.taskboardOwnerList.length > 0) {
          this.data.taskboardOwnerList.forEach(owner => {
            ownerID.push(owner.id);
          });
          this.newTaskboardOwnerList = ownerID;
        }
        if (this.data.type === 'teams-owner') {
          this.newTaskboardOwnerList = this.data.taskboardOwnerList;
        }
      }
      if (this.data.type === 'document-owner') {
        const ownerID = [];
        this.data.taskboardOwnerList.yoroDocsOwner.forEach(owner => {
          ownerID.push(owner);
        });
        this.newTaskboardOwnerList = ownerID;
      }
      if (this.data.type === 'datatable-owner') {
        const ownerID = [];
        this.data.taskboardOwnerList.tableOwnersId.forEach(owner => {
          ownerID.push(owner);
        });
        this.newTaskboardOwnerList = ownerID;
      }

      if (this.data.type !== 'workflow-users') {
        this.oldTaskboardOwnerList = JSON.parse(JSON.stringify(this.data.taskboardOwnerList));
      }
      for (let i = 0; i < this.usersList.length; i++) {
        this.usersList[i].randomColor = this.getRandomColor();
        this.usersList[i].isSelected = false;
        this.usersList[i].filter = true;
      }
      if (this.newTaskboardOwnerList !== undefined && this.newTaskboardOwnerList !== null) {
        if (this.newTaskboardOwnerList.length > 0) {
          for (let i = 0; i < this.newTaskboardOwnerList.length; i++) {
            for (let j = 0; j < this.usersList.length; j++) {
              if (this.usersList[j].userId === this.newTaskboardOwnerList[i]) {
                this.usersList[j].isSelected = true;
                this.usersList[j].filter = true;
              }
            }
          }
        } else {
          for (let j = 0; j < this.usersList.length; j++) {
            this.usersList[j].isSelected = false;
          }
        }
      } else {
        for (let j = 0; j < this.usersList.length; j++) {
          this.usersList[j].isSelected = false;
        }
      }
    } else if (this.data.type === 'rename-column') {
      this.createRenameForm();
      this.form.get('oldColumnName').setValue(this.data.taskboardColumns.columnName);
      this.form.get('oldColumnName').disable();
    } else if (this.data.type === 'change-background') {
      this.changeColorForm();
    }
  }


  createOwnerForm() {
    this.form = this.fb.group({
      searchUser: [],
    });
  }
  createRenameForm() {
    this.form = this.fb.group({
      columnId: [this.data.taskboardColumns.id],
      oldColumnName: [this.data.taskboardColumns.columnName],
      newColumnName: ['', [Validators.required]],
      taskboardId: [this.data.taskboardId],
    });
  }

  changeColorForm() {
    this.form = this.fb.group({
      columnId: [this.data.taskboardColumns.id],
      isColumnBackground: [],
      columnColor: [this.data.taskboardColumns.columnColor, [Validators.required]],
      taskboardId: [this.data.taskboardId],
    });
  }

  setColor() {
    this.updateColumns = this.data.taskboardColumns;
    this.updateColumns.columnColor = this.form.get('columnColor').value;
    this.updateColumns.isColumnBackground = this.form.get('isColumnBackground').value;
  }

  applyBackgroundColor($event) {
    this.updateColumns = this.data.taskboardColumns;
    if ($event.checked === true) {
      this.updateColumns.isColumnBackground = true;
    } else {
      this.updateColumns.isColumnBackground = false;
    }
    this.updateColumns.columnColor = this.form.get('columnColor').value;
  }

  changeColor() {
    this.updateColumns = this.data.taskboardColumns;
    this.updateColumns.columnColor = this.form.get('columnColor').value;
    this.taskboardService.updateColumnColor(this.updateColumns).subscribe(data => {
      if (data.response.includes('Successfully')) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: data.response
        });
        this.dialogRef.close(true);
      }
    });
  }

  replaceColumn() {
    if (this.form.valid) {
      this.replaceColumnVO = this.form.getRawValue();
      this.taskboardService.replaceColumn(this.replaceColumnVO).subscribe(data => {
        if (data.response.includes('Successfully')) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: data.response
          });
          this.dialogRef.close(true);
        }
      });
    }
  }


  getRemainingAssigneeUserCount(assigneeUsers: string[]) {
    const array = [];
    for (let i = 0; i < assigneeUsers.length; i++) {
      const index = this.usersList.findIndex(users => users.userId === assigneeUsers[i]);
      array.push(this.usersList[index]);
    }
    if (assigneeUsers.length > 4) {
      return assigneeUsers.length - 4;
    }
  }


  selectAssigneeUser(user: UserVO, i: number): void {
    this.show = true;

    if (user.isSelected === undefined) {
      user.isSelected = false;
    }
    if (user.isSelected === false) {
      user.isSelected = true;
      if (this.newTaskboardOwnerList.length > 0) {
        if (!this.newTaskboardOwnerList.some(users => users === user.userId)) {

          this.newTaskboardOwnerList.push(user.userId);
        }
      } else {
        this.newTaskboardOwnerList.push(user.userId);
      }
    } else {
      user.isSelected = false;
      const userList = this.newTaskboardOwnerList;
      for (let i = 0; i < userList.length; i++) {
        if (userList[i] && user.userId === userList[i]) {
          this.newTaskboardOwnerList.splice(i, 1);
          this.deletedOwnerIdList.push(user.userId);
        }
      }
    }
  }
  selectedTeam(user: UserVO) {
    this.show = true;
    if (user.isSelected === undefined) {
      user.isSelected = false;
    }
    if (user.isSelected === false) {
      user.isSelected = true;
      if (this.newTaskboardOwnerList.length > 0) {
        if (!this.newTaskboardOwnerList.some(users => users === user.userId)) {
          this.updatedDocumentOwnerList.push(user.userId);
        }
      } else {
        this.updatedDocumentOwnerList.push(user.userId);
      }
    } else {
      user.isSelected = false;
      const userList = this.newTaskboardOwnerList;
      for (let i = 0; i < userList.length; i++) {
        if (userList[i] && user.userId === userList[i]) {
          this.updatedDocumentOwnerList.splice(i, 1);
          this.deletedOwnerIdList.push(user.userId);
        }
      }
    }
    if (this.updatedDocumentOwnerList.length > 0) {
      this.noOwner = false;
    }
  }

  selectTeam(user: UserVO, i: number) {
    this.show = true;
    if (user.isSelected === undefined) {
      user.isSelected = false;
    }
    if (user.isSelected === false) {
      user.isSelected = true;
      if (this.newTaskboardOwnerList.length !== 0) {
        if (!this.newTaskboardOwnerList.some(users => users === user.userId)) {
          const teamsVO = new TeamNamesVO();
          teamsVO.id = user.userId;
          teamsVO.name = user.firstName + ' ' + user.lastName;

          this.updatedWorkspaceOwnerList.push(teamsVO);
          this.updatedTeamsOwnerList = this.newTaskboardOwnerList;
          this.updatedTeamsOwnerList.push(user.userId);
        }
      } else {
        const teamsVO = new TeamNamesVO();
        teamsVO.id = user.userId;
        teamsVO.name = user.firstName + ' ' + user.lastName;
        this.updatedWorkspaceOwnerList.push(teamsVO);
        if (this.data.type === 'teams-owner') {
          if (!this.newTaskboardOwnerList.some(users => users === user.userId)) {
            this.updatedTeamsOwnerList.push(user.userId);
          }
        }
      }
    } else {
      user.isSelected = false;
      const userList = this.newTaskboardOwnerList;
      for (let i = 0; i < userList.length; i++) {
        if (userList[i] && user.userId === userList[i]) {
          this.updatedWorkspaceOwnerList.splice(i, 1);
          this.deletedOwnerIdList.push(user.userId);
        }
      }
    }
  }
  selectUser(user: UserVO, i: number) {
    this.show = true;
    this.updatedWorkspaceOwnerList = [];
    for (let i = 0; i < this.usersList.length; i++) {
      this.usersList[i].isSelected = false;
      if (this.usersList.some(users => users.userId === user.userId)) {
        user.isSelected = true;
        // this.updatedWorkspaceOwnerList.push(user.userId)
      } else {
        user.isSelected = false;
      }
    }
    if (this.usersList.some(users => users.userId === user.userId)) {
      this.updatedWorkspaceOwnerList.push(user);
    }

  }
  removedAssigneeUser(user, index) {
    if (index) {
      user.isSelected = false;
      this.show = true;
      this.deletedOwnerIdList.push(user.userId);
      this.assignTeamVO.removedTeamList = this.deletedOwnerIdList;
      if (this.data.type === 'teams-owner' || this.data.type === 'workflow-users') {
        const index = this.newTaskboardOwnerList.findIndex(team => team === user.userId);
        this.newTaskboardOwnerList.splice(index, 1);
        this.updatedTeamsOwnerList = this.newTaskboardOwnerList;
        this.updatedWorkspaceOwnerList = this.newTaskboardOwnerList;
      }
    }
  }
  removedDocumentAssigneeUser(user, index) {
    this.show = true;
    user.isSelected = false;
    const n = this.newTaskboardOwnerList.findIndex(team => team === user.userId);
    if (n !== -1) {
      this.deletedOwnerIdList.push(user.userId);
    }
    const i = this.updatedDocumentOwnerList.findIndex(team => team === user.userId);
    if (i !== -1) {
      this.updatedDocumentOwnerList.splice(i, 1);
    }
    this.securityTeamVO.deletedOwnerIdList = this.deletedOwnerIdList;
  }

  Confirm() {
    this.taskboardSecurityVO.taskboardId = this.data.taskboardId;
    this.taskboardSecurityVO.taskboardOwner = this.newTaskboardOwnerList;
    this.taskboardSecurityVO.deletedOwnerIdList = this.deletedOwnerIdList;
    if (this.data.type === 'taskboard-owner') {
      this.securityService.saveTaskboardOwners(this.taskboardSecurityVO).subscribe(data => {
        if (data.response.includes('Successfully')) {
          this.dialogRef.close(this.newTaskboardOwnerList);
        }
      });
    }
    if (this.data.type === 'workspace-owner') {
      this.assignTeamVO.workspaceId = this.data.taskboardId;
      this.assignTeamVO.assignOwnerList = this.updatedWorkspaceOwnerList;
      this.assignTeamVO.removedOwnerList = this.deletedOwnerIdList;
      this.createDialogService.saveWorkspaceSecurity(this.assignTeamVO).subscribe(res => {
        if (res) {
          this.dialogRef.close(this.assignTeamVO);
        }
      });
    }
    if (this.data.type === 'teams-owner') {
      this.yoroGroupsVO.id = this.data.taskboardId;
      this.yoroGroupsVO.ownerId = this.updatedTeamsOwnerList;
      this.groupService.saveOwnersForTeam(this.yoroGroupsVO).subscribe(res => {
        if (res.response.includes('successfully')) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: 'Team Owners added successfully'
          });
          this.dialogRef.close(true);
        } else {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: res.response,
          });
        }

      });

    }
    if (this.data.type === 'workflow-users') {
      this.assignTeamVO.assignOwnerList = this.updatedWorkspaceOwnerList;
      this.dialogRef.close(this.assignTeamVO);
    }
    if (this.data.type === 'document-owner') {
      if (this.deletedOwnerIdList.length === this.newTaskboardOwnerList.length && this.updatedDocumentOwnerList.length === 0) {
        this.noOwner = true;
      } else {
        this.noOwner = false;
        this.securityTeamVO.documentId = this.data.documentId;
        this.securityTeamVO.yoroDocsOwner = this.updatedDocumentOwnerList;
        this.securityTeamVO.deletedOwnerIdList = this.deletedOwnerIdList;
        this.securityTeamVO.deletedTeamsIdList = [];
        this.securityTeamVO.securityVOList = [];
        this.securityTeamVO.updateAllowed = false;
        this.securityTeamVO.readAllowed = false;
        this.documentService.saveSecurity(this.securityTeamVO).subscribe(res => {
          if (res.response.includes('successfully')) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: res.response,
            });
            this.dialogRef.close(this.securityTeamVO);
          }
        });
      }
    }

    if (this.data.type === 'datatable-owner') {
      if (this.deletedOwnerIdList.length === this.newTaskboardOwnerList.length && this.updatedDocumentOwnerList.length === 0) {
        this.noOwner = true;
      } else {
        this.noOwner = false;
        this.saveClicked = true;
        this.securityDataTableVO.tableId = this.data.tableId;
        this.securityDataTableVO.tableOwnersId = this.updatedDocumentOwnerList;
        this.securityDataTableVO.deletedOwnerIdList = this.deletedOwnerIdList;
        this.securityDataTableVO.deletedTeamsIdList = [];
        this.securityDataTableVO.securityTeamVOList = [];
        this.service.saveSecurity(this.securityDataTableVO).subscribe(res => {
          this.saveClicked = false;
          if (res.response.includes('uccessfully')) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: res.response,
            });
            this.dialogRef.close(this.securityDataTableVO);
          }
        },
          error => {
            this.saveClicked = false;
          });
      }
    }

  }
  dialogClose() {
    if (this.data.type === 'taskboard-owner') {
      const oldTaskboardOwnerList = JSON.parse(JSON.stringify(this.oldTaskboardOwnerList));
      for (let j = 0; j < this.usersList.length; j++) {
        this.usersList[j].isSelected = false;
      }
      this.dialogRef.close(oldTaskboardOwnerList);
    } else if (this.data.type === 'rename-column') {
      this.dialogRef.close();
    } else if (this.data.type === 'change-background') {
      this.dialogRef.close();
    } else if (this.data.type === 'workspace-owner' || this.data.type === 'teams-owner') {
      this.dialogRef.close(true);
    }
    else if (this.data.type === 'document-owner' || this.data.type === 'workflow-users' || this.data.type === 'datatable-owner') {
      this.dialogRef.close();
    }
  }

  setUserProfilename(user: UserVO): string {
    return user.firstName.charAt(0).toUpperCase();
  }

  formValueChanges() {
    this.form.get('searchUser').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.usersList.length; i++) {
          const searchData = data.toLowerCase();
          const firstName = this.usersList[i].firstName.toLowerCase();
          const lastName = this.usersList[i].lastName.toLowerCase();
          if (firstName.includes(data) || lastName.includes(data)) {
            this.usersList[i].filter = true;
          } else {
            this.usersList[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.usersList.length; i++) {
          this.usersList[i].filter = true;
        }
      }
    });
  }
  getRandomColor() {
    return (
      '#' +
      ('000000' + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
    );
  }
  dialog() {
    this.dialogRef.close(true);
  }
}
