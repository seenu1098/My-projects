import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GroupService } from '../../engine-module/group/group-service';
import { securityAssignVO, SecurityVO, teamVO } from '../documents-vo';
import { DocumentsService } from '../documents.service';
import { SnackbarComponent } from "src/app/shared-module/snackbar/snackbar.component";
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamListComponent } from 'src/app/workspace-module/team-list/team-list.component';
import { DocumentTeamDialogListComponent } from '../document-team-dialog-list/document-team-dialog-list.component';
import { TaskboardOwnerDialogComponent } from 'src/app/taskboard-module/taskboard-owner-dialog/taskboard-owner-dialog.component';

@Component({
  selector: 'app-document-team',
  templateUrl: './document-team.component.html',
  styleUrls: ['./document-team.component.scss']
})
export class DocumentTeamComponent implements OnInit {
  form: FormGroup;
  groupList: any;
  selectedTeam: any[] = [];
  deletedTeam: any[] = [];
  selectedTeamID: any[] = [];
  selectedTeamID1: any[] = [];
  deletedTeamID: any[] = [];
  removable = true;
  selectable = true;
  securityVO = new teamVO();
  readPermission: boolean = false;
  updatePermission: boolean = false;
  readArray: any = [];
  updateArray: any = [];
  documentOwnerList: any;
  type: any;
  list: any;
  usersList: any;
  permissionsForm: FormGroup;
  team: any;
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc', '#cedada', '#A52A2A', '#c8ead3', '#cfffe5',];
  teamList: any = [];
  ownerData: any;
  selectedGroupNames: string[] = [];
  allCheckBoxControl = {};
  userGroupExist = false;
  documentSecurityList: any[] = [];
  deletedSecurityIdList: string[] = [];
  jsondata: any;
  items: any;
  showGroups: boolean = false;
  constructor(private snackBar: MatSnackBar, private dialog: MatDialog, private documentservice: DocumentsService, @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private dialogRef: MatDialogRef<DocumentTeamComponent>,
    private groupService: GroupService

  ) { }

  ngOnInit(): void {
    this.usersList = this.data.usersList;
    this.groupList = this.data.groupList;
    for (let i = 0; i < this.data.owner.yoroDocsOwner.length; i++) {
      const name = this.usersList.find(name => name.userId === this.data.owner.yoroDocsOwner[i])
      this.teamList.push(name)
    }
    this.form = this.fb.group({
      searchTeam: [],
      searchOwner: []
    });
    this.getSecurity(this.data);
  }


  dialogClose() {
    for (let j = 0; j < this.groupList.length; j++) {
      this.groupList[j].isSelected = false;
    }
    this.dialogRef.close();
  }
  getSecurity(node) {
    this.documentservice.getSecurity(node.id).subscribe(data => {
      if (data) {
        this.documentOwnerList = data.securityVOList;
        this.getTeamsList();
      }
    })
  }
  getTeamsList() {
    this.groupService.getGroupList().subscribe(groups => {
      this.groupList = groups;
      for (let i = 0; i < this.groupList.length; i++) {
        this.groupList[i].randomColor = this.getRandomColor();
        this.groupList[i].isSelected = false;
        this.groupList[i].filter = true;
      }
      this.checkSelectedTeam();
    })
  }
  getRandomColor() {
    return (
      "#" +
      ("000000" + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
    );
  }
  checkSelectedTeam() {
    this.readArray = [];
    this.updateArray = [];
    this.selectedTeamID = []
    this.selectedTeamID1 = [];
    if (this.documentOwnerList.length !== 0) {
      for (let i = 0; i < this.groupList.length; i++) {
        for (let j = 0; j < this.documentOwnerList.length; j++) {
          if (this.groupList[i].id === this.documentOwnerList[j].groupId) {
            if (this.documentOwnerList[j].readAllowed === true && this.documentOwnerList[j].updateAllowed === false) {
              this.readArray.push(this.groupList[i])
              this.readPermission = true;
              this.updatePermission = false;
              let teamsVO = new SecurityVO()
              teamsVO.groupId = this.documentOwnerList[j].groupId;
              teamsVO.readAllowed = this.readPermission;
              teamsVO.updateAllowed = this.updatePermission;
              this.selectedTeamID1.push(teamsVO);
            }
            if (this.documentOwnerList[j].readAllowed === true && this.documentOwnerList[j].updateAllowed === true) {
              this.updateArray.push(this.groupList[i])
              this.readPermission = true;
              this.updatePermission = true;
              let teamsVO = new SecurityVO()
              teamsVO.groupId = this.documentOwnerList[j].groupId;
              teamsVO.readAllowed = this.readPermission;
              teamsVO.updateAllowed = this.updatePermission;
              this.selectedTeamID.push(teamsVO);

            }
          }
        }
      }
    }
  }

  setUserProfilename(user): string {
    return user.name.charAt(0).toUpperCase();
  }

  removedAssigneeUser(user, index, type) {
    this.deletedTeamID = []
    if (type === 'read') {
      this.deletedTeamID.push(user.id);
      for (let i = 0; i < this.selectedTeamID1.length; i++) {
        if (this.selectedTeamID1[i].groupId === user.id) {
          this.selectedTeamID1.splice(i, 1);
          this.team = this.selectedTeamID1
        }
      }
    }
    else if (type === 'update') {
      this.deletedTeamID.push(user.id);
      for (let i = 0; i < this.selectedTeamID.length; i++) {
        if (this.selectedTeamID[i].groupId === user.id) {
          this.selectedTeamID.splice(i, 1);
          this.team = this.selectedTeamID
        }
      }
    }
    this.securityVO.documentId = this.data.id;
    this.securityVO.type = type;
    this.securityVO.securityVOList = this.team;
    this.securityVO.deletedTeamsIdList = this.deletedTeamID;
    this.documentservice.saveTeam(this.securityVO).subscribe(res => {
      if (res.response.includes('successfully')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: res.response,
        });
        this.getSecurity(this.data);
      }
    })

  }
  addTeam(value) {
    this.type = value;
    if (this.type === 'read') {
      this.list = this.readArray;
    }
    else {
      this.list = this.updateArray;
    }
    const dialog = this.dialog.open(
      DocumentTeamDialogListComponent,
      {
        disableClose: true,
        width: '50%',
        height: '70%',
        panelClass: 'config-dialog',
        data: {
          type: this.type,
          data: this.data,
          list: this.list
        },
      });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.getSecurity(this.data);
      }
    });
  }
  getUserName(user) {
    const index = this.usersList.findIndex(users => users.userId === user.userId);
    return 'Assigned To ' + this.usersList[index].firstName + ' ' + this.usersList[index].lastName;
  }
  getUserNames(assigneeUsers) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < assigneeUsers.length; i++) {
      if (i > 4) {
        const index = this.usersList.findIndex(users => users.userId === assigneeUsers[i].userId);
        if (userNames === null) {
          userNames = 'Assigned To ' + this.usersList[index].firstName + ' ' + this.usersList[index].lastName + ', ';
        } else {
          userNames = userNames + this.usersList[index].firstName + ' ' + this.usersList[index].lastName + ', ';
        }
      }
    }
    return userNames;
  }

  getUserColor(user): string {
    const index = this.usersList.findIndex(
      (users) => users.userId === user.userId
    );
    return this.usersList[index].color;
  }

  getUserFirstAndLastNamePrefix(user) {
    const index = this.usersList.findIndex(users => users.userId === user.userId);
    const firstName = this.usersList[index].firstName.charAt(0).toUpperCase();
    const lastName = this.usersList[index].lastName.charAt(0).toUpperCase();
    return firstName + lastName;
  }
  getRemainingAssigneeUserCount(assigneeUsers: string[]) {
    let array = [];
    for (let i = 0; i < assigneeUsers.length; i++) {
      const index = this.usersList.findIndex(users => users.userId === assigneeUsers[i]);
      array.push(this.usersList[index]);
    }
    if (assigneeUsers.length > 4) {
      return assigneeUsers.length - 4;
    }
  }
  add() {
    this.teamList = [];
    const dialog = this.dialog.open(TaskboardOwnerDialogComponent, {
      disableClose: true,
      width: '50%',
      height: '75%',
      data: {
        documentId: this.data.id,
        usersList: this.usersList,
        taskboardOwnerList: this.data.owner,
        type: 'document-owner'
      }
    });
    dialog.afterClosed().subscribe(data => {
      this.ownerData = data
      if (data) {
        this.documentservice.getSecurity(this.data.id).subscribe(data => {
          this.documentOwnerList = data;
          this.data.owner.yoroDocsOwner = this.documentOwnerList.yoroDocsOwner
          for (let i = 0; i < this.documentOwnerList.yoroDocsOwner.length; i++) {
            const name = this.usersList.find(name => name.userId === this.documentOwnerList.yoroDocsOwner[i])
            this.teamList.push(name)
          }
        })
      }
    })
  }
  close() {
    this.dialogRef.close();
  }
}
