import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamListComponent } from '../team-list/team-list.component';
import { WorkspaceVO } from './create-dialog-vo';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskboardOwnerDialogComponent } from "../../taskboard-module/taskboard-owner-dialog/taskboard-owner-dialog.component";
import { TaskBoardService } from '../../taskboard-module/taskboard-configuration/taskboard.service';
import { GroupVO, UserVO } from "../../taskboard-module/taskboard-form-details/taskboard-task-vo";
import { CreateDialogService } from './create-dialog.service';

@Component({
  selector: 'app-create-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.scss']
})
export class CreateDialogComponent implements OnInit {
  workspaceVO = new WorkspaceVO();
  isLinear = false;
  form: FormGroup;
  teamCount = [
    { name: 'Just Me', value: 'one' },
    { name: '2-5', value: 'twoToFive' },
    { name: '6-10', value: 'sixToTen' },
    { name: '11-20', value: 'elevenToTwenty' },
  ];
  avatarColors = ["#FFB6C1", "#2c3e50", "#95a5a6", "#f39c12", "#1abc9c", "#0F2347", "#1C3F6E", "#2E67A0", "#5AACCF", "#EFFC93", "#80C271", "#28a745",
    "#695958", "#b6c8a9", "#c8ead3", "#cfffe5", "#cedada", "#A52A2A", "#F4C2C2", "#2E5894", "#967117", "#BD33A4", "#702963", "#CC5500", "#E97451", "#5F9EA0", "#2F847C",
    "#E4D00A", "#F88379", "#666699", "#26428B"];
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  selectedTeamCount: any;
  selectedAvatarColor: any;
  teamList: any[] = [];
  workspaceOwnerList: any[] = [];
  usersList: UserVO[] = [];
  allowNextStep = true;
  constructor(private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateDialogComponent>,
    private dialog: MatDialog,
    private createDialogService: CreateDialogService,
    private snackBar: MatSnackBar,
    private taskboardService: TaskBoardService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getUsers();
    this.generateNamekey();
  }
  getUsers() {
    this.taskboardService.getUsersList().subscribe(res => {
      this.usersList = res;
    });
  }

  generateNamekey() {
    this.form.get('workspaceUniqueId').valueChanges.subscribe(data => {
      if (data) {
        this.form.get('workspaceUniqueId').setValue(data.toLowerCase().replace(/ /g, ''), {emitEvent: false});
        this.allowNextStep = false;
        this.createDialogService.checkWorkspaceUniqueId(data.toLowerCase().replace(/ /g, '')).subscribe(res => {
          if (res.response.includes('already exist')) {
            this.allowNextStep = false;
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: res.response
            });
            this.form.get('workspaceUniqueId').setErrors({ alreadyExist: true });
          }
          this.allowNextStep = true;
        });
      }
    });
  }

  initializeForm() {
    this.form = this.fb.group({
      workspaceName: ['', Validators.required],
      workspaceUniqueId: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      inviteUsersName: ['', Validators.required],
      allowAll: [false]
    });
  }


  generateName() {
    const workspaceName = this.form.get('workspaceName').value;
    this.createDialogService.checkWorkspaceName(workspaceName).subscribe(res => {
      if (res.response.includes('already exist')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: res.response
        });
        workspaceName.setErrors({ alreadyExist: true });
      } else {
        if (this.form.get('workspaceName').value && this.form.get('workspaceName').value.length > 3) {
          this.form.get('workspaceUniqueId').setValue(this.form.get('workspaceName').value.substring(0, 3));
        } else {
          this.form.get('workspaceUniqueId').setValue(this.form.get('workspaceName').value);
        }
        this.workspaceVO.workspaceName = this.form.get('workspaceName').value;
        this.workspaceVO.workspaceKey = this.camelize(this.form.get('workspaceName').value);
      }
    })


  }

  camelize(str) {
    if (str) {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '').replace(/[^\w]/g, '').replace(/_/g, '');
    }
  }
  totalTeamCount(team) {
    this.selectedTeamCount = team.value;
  }

  changeAvatarColor(color) {
    this.selectedAvatarColor = color;
    this.workspaceVO.workspaceAvatar = this.selectedAvatarColor;
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

  openTaskOwnerDialog() {
    const dialog = this.dialog.open(TaskboardOwnerDialogComponent, {
      disableClose: true,
      width: '450px',
      height: '600px',
      data: {
        taskboardOwnerList: this.workspaceOwnerList,
        usersList: this.usersList,
        taskboardId: null,
        type: 'taskboard-owner'
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.workspaceOwnerList = data;
      }
    })
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

  cancelTask() {
    this.dialogRef.close();
  }

  create() {
    this.workspaceVO.workspaceId = null;
    this.workspaceVO.workspaceUniqueId = this.form.get('workspaceUniqueId').value;
    if (this.form.get('allowAll').value === false) {
      if (this.teamList.length > 0) {
        this.createDialogService.createWorkspace(this.workspaceVO).subscribe(response => {
          if (response.response.includes('successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: response.response
            });
            this.workspaceVO.workspaceId = response.pageId;
            this.dialogRef.close(this.workspaceVO);
          }
        })
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Allow all Teams or select Teams to your Workspace.'
        });
      }

    } else {
      this.createDialogService.createWorkspace(this.workspaceVO).subscribe(response => {
        if (response.response.includes('successfully')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: response.response
          });
          this.workspaceVO.workspaceId = response.pageId;
          this.dialogRef.close(this.workspaceVO);
        }
      })
    }
  }
}
