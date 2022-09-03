import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupService } from '../../engine-module/group/group-service';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AssignTeamVO, TeamNamesVO } from '../create-dialog/create-dialog-vo';
import { GroupVO, UserVO } from "../../taskboard-module/taskboard-form-details/taskboard-task-vo";
import { CreateDialogService } from '../create-dialog/create-dialog.service';
@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {

  public config: PerfectScrollbarConfigInterface = {};
  groupList: any;
  form: FormGroup;
  removable = true;
  selectable = true;
  selectedTeam: any[] = [];
  deletedTeam: any[] = [];
  selectedTeamID: any[] = [];
  deletedTeamID: any[] = [];
  assignTeamVO = new AssignTeamVO();

  usersList: UserVO[] = [];
  newTaskboardOwnerList: string[];
  oldTaskboardOwnerList: JSON;
  // taskboardSecurityVO = new TaskboardSecurityVO();
  deletedOwnerIdList: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TeamListComponent>,
    private groupService: GroupService,
    private fb: FormBuilder,
    private createDialogService: CreateDialogService) {
     }

  ngOnInit(): void {

    this.form = this.fb.group({
      searchTeam: [],
      searchOwner: []
    });
    if (this.data && this.data.type === 'taskboard-owner') {
      this.usersList = this.data.usersList;
      this.newTaskboardOwnerList = this.data.taskboardOwnerList;
      this.oldTaskboardOwnerList = JSON.parse(JSON.stringify(this.data.taskboardOwnerList));
      for (let i = 0; i < this.usersList.length; i++) {
        this.usersList[i].filter = true;
      }

      if (this.newTaskboardOwnerList !== undefined && this.newTaskboardOwnerList !== null) {
        if (this.newTaskboardOwnerList.length > 0) {
          for (let i = 0; i < this.newTaskboardOwnerList.length; i++) {
            for (let j = 0; j < this.usersList.length; j++) {
              if (this.newTaskboardOwnerList[i] === this.usersList[j].userId) {
                this.usersList[j].isSelected = true;
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
    } else {
      this.getTeamsList();
      this.formValueChanges();
    }


  }
  formValueChanges() {
    this.form.get('searchTeam').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.groupList.length; i++) {
          const searchData = data.toLowerCase();
          const name = this.groupList[i].name.toLowerCase();
          if (name.includes(searchData)) {
            this.groupList[i].filter = true;
          } else {
            this.groupList[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.groupList.length; i++) {
          this.groupList[i].filter = true;
        }
      }
    });
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

  checkSelectedTeam() {
    if (this.data.data.length !== 0) {
      for (let i = 0; i < this.groupList.length; i++) {
        for (let j = 0; j < this.data.data.length; j++) {
          if (this.groupList[i].id === this.data.data[j].id) {
            
            let teamsVO = new TeamNamesVO()
      // user.isSelected = true;
      teamsVO.id = this.data.data[j].id;
      teamsVO.name = this.data.data[j].name;
      // this.selectedTeam.push(user);
            this.groupList[i].isSelected = true;
            this.groupList[i].filter = false;
            this.selectedTeam.push(this.groupList[i]);
            this.selectedTeamID.push(teamsVO);
          }
        }
      }
    }
  }



  selectAssigneeUser(user) {
    if (user) {
      let teamsVO = new TeamNamesVO()
      user.isSelected = true;
      teamsVO.id = user.id
      teamsVO.name = user.name;
      this.selectedTeam.push(user);
      this.selectedTeamID.push(teamsVO)
      this.assignTeamVO.assignTeamList = this.selectedTeamID;
    }

    this.form.get('searchTeam').setValue('')
  }

  removedAssigneeUser(user, index) {
    if (index) {
      user.isSelected = false;
      this.deletedTeamID.push(user.id);
      this.assignTeamVO.removedTeamList = this.deletedTeamID;
    }
  }

  setUserProfilename(user): string {
    return user.name.charAt(0).toUpperCase();
  }

  getRandomColor() {
    return (
      "#" +
      ("000000" + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
    );
  }

  dialogClose() {
    for (let j = 0; j < this.groupList.length; j++) {
      this.groupList[j].isSelected = false;
    }
    this.dialogRef.close();
  }

  confirm() {
    let data = { data: this.assignTeamVO, selectedTeam: this.selectedTeam, deletedTeam: this.deletedTeam, deletedTeamID: this.deletedTeamID }
    if(this.data.pageName !== 'workflow'){
      if (this.data.workspaceId !== null) {
        this.assignTeamVO.workspaceId = this.data.workspaceId;
      } else {
        this.assignTeamVO.workspaceId = null;
      }
      this.assignTeamVO.removedTeamList = this.deletedTeamID;
      this.assignTeamVO.assignTeamList = this.selectedTeamID;
      if (this.data.workspaceId !== null && this.data.workspaceId !== undefined) {
        this.createDialogService.saveWorkspaceSecurity(this.assignTeamVO).subscribe(res => {
          if(res){
      this.dialogRef.close(data);
          }
        })
      }else{
      this.dialogRef.close(data);
  
      }
    }else {
      this.dialogRef.close(data)
    }
    
  }
}
