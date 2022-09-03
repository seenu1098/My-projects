import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { UserVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { AssignTeamVO, TeamNamesVO, WorkspaceVO } from '../create-dialog/create-dialog-vo';
import { CreateDialogService } from '../create-dialog/create-dialog.service';
import { TeamListComponent } from '../team-list/team-list.component';

@Component({
  selector: 'app-edit-teams',
  templateUrl: './edit-teams.component.html',
  styleUrls: ['./edit-teams.component.scss']
})
export class EditTeamsComponent implements OnInit {
  workspaceVO = new WorkspaceVO();
  teamList: any[] = [];
form:FormGroup;
  editTeams: any;
  usersList: UserVO[] = [];
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];

  constructor(
    private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditTeamsComponent>,
    private dialog: MatDialog,
    private taskboardService: TaskBoardService,
    private createDialogService: CreateDialogService,
    private snackBar: MatSnackBar,

  ) { 
    this.editTeams=data
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      allowAll: [false]
    });
if(this.editTeams !== ''){
  if(this.editTeams.securedWorkspaceFlag == false){
    this.form.patchValue({
      allowAll:true
    })
    
  }else{
    this.form.patchValue({
      allowAll:false
    })
    
  }

}
  }
  getUsers() {
    this.taskboardService.getUsersList().subscribe(res => {
      this.usersList = res;
    });
  }
  getUserName(user) {
    const index = this.teamList.findIndex((users) => users.id === user.id);
    // return ("Assigned To " + this.teamList[index].id);
  }



  getUserFirstAndLastNamePrefix(task) {
    let name = "";
    let array = task.split(' ')
    if (array[0]) {
      name = array[0].charAt(0).toUpperCase()
    }
    return name;
  }

  getRemainingAssigneeUserCount(teams: string[]) {
    return teams.length
  }

  allowAllTeamChange(event) {
    this.workspaceVO.securedWorkspaceFlag = this.form.get('allowAll').value;
    this.teamList = [];
  }
  dialogClose() {
    this.dialogRef.close();
  }

  openTeamsDialog() {
    const dialog = this.dialog.open(
      TeamListComponent,
      {
        disableClose: true,
        width: '50%',
        // maxWidth: '50%',
        height: '70%',
        panelClass: 'config-dialog',
        data: {
          type: 'team-list',
          pageName: "Taskboard Configuration",
          showNewConfig: true,
          fromScratch: true
        },
      });
    dialog.afterClosed().subscribe(assignTeamVO => {
      if (assignTeamVO) {
        this.workspaceVO.securedWorkspaceFlag = false;
        this.workspaceVO.workspaceSecurityVO = assignTeamVO.data;
        this.teamList = assignTeamVO.selectedTeam;
      }
    });
  }
create(){
  if(this.teamList !== [] && this.teamList.length !== 0){
    let teamsVO = new AssignTeamVO()
    teamsVO.assignTeamList=this.teamList;
    teamsVO.removedTeamList=[];
    teamsVO.workspaceId=this.editTeams.workspaceId;
    teamsVO.securedWorkspaceFlag=this.editTeams.securedWorkspaceFlag===true?false:true;
    this.createDialogService.saveWorkspaceSecurity(teamsVO).subscribe(res => {
      if(res.response === 'Security updated successfully'){
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: res.response
        });
        this.dialogRef.close(res);

      }
    })

  }
}
}
