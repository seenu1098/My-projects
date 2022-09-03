import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CreateDialogComponent } from '../create-dialog/create-dialog.component'
import { CreateDialogService } from '../create-dialog/create-dialog.service';
import { WorkspaceVO, WorkspaceListVO, WorkflowVO, TaskboardVO, AssignTeamVO } from '../create-dialog/create-dialog-vo';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { GroupVO, UserVO } from "../../taskboard-module/taskboard-form-details/taskboard-task-vo";
import { TaskBoardService } from '../../taskboard-module/taskboard-configuration/taskboard.service';
import { GroupService } from '../../engine-module/group/group-service';
import { NotificationService } from '../../rendering-module/shared/service/notification.service.service';
import { TaskboardOwnerDialogComponent } from "../../taskboard-module/taskboard-owner-dialog/taskboard-owner-dialog.component";
// import { NotificationVO, UserIdListVO, UserVO } from '../../rendering-module/shared/vo/user-vo';
import { TeamListComponent } from '../team-list/team-list.component';
import { WorkspaceService } from '../create-dialog/workspace.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { element } from 'protractor';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { EditTeamsComponent } from '../edit-teams/edit-teams.component';
import { EditAvatarComponent } from '../edit-avatar/edit-avatar.component';
@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  WorkspaceForm: FormGroup;
  workspaceListVO: WorkspaceListVO[];
  usersList: any[] = [];
  assignTeamVO: AssignTeamVO[] = [];
  teamList: any[] = [];
  ownerList: any[] = [];
  taskboardOwnerList: string[] = [];
  workspaceList: any[] = [];
  userDetails: any;
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc', '#cedada', '#A52A2A', '#c8ead3', '#cfffe5', '#A52A2A'];
  currentWorkspace: any;
  edit: boolean[] = [];
  workspaceVO = new WorkspaceVO();
  licenseVO: any;
  constructor(
    private dialog: MatDialog,
    private createDialogService: CreateDialogService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private taskboardService: TaskBoardService,
    private groupService: GroupService,
    private notficationService: NotificationService,
    private workspaceService: WorkspaceService,
    private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadAllWorkspaceList();
    this.isLicenseAllowed();
    this.currentWorkspace = this.workspaceService.workspaceID;
    this.workspaceService.setHideSubMenu(true);
    this.workspaceService.setHideHover(true);
    this.workspaceService.setNotificationSelected(false);
  }

  isLicenseAllowed() {
    this.createDialogService.isAllowed().subscribe(data => {
      this.licenseVO = data;
    });
  }


  getLoggedUserDetails() {
    this.notficationService.getLoggedInUserDetails().subscribe(data => {
      this.userDetails = data;
      const details = this.userDetails.firstName + ' ' + this.userDetails.lastName;
      this.taskboardOwnerList.push(details);
      this.handleUpdatePermission();
    });
  }

  initializeForm() {
    this.WorkspaceForm = this.fb.group({
      workspaceName: [],
      // defaultWorkspace: [false]
    });
  }

  loadAllWorkspaceList() {
    this.createDialogService.listAllWorkspaceList().subscribe(res => {
      this.workspaceListVO = res;
      this.workspaceList = res;
      this.addEditOption();
      this.showSelectedWorkspace();
      this.getUsers();
      this.getOwners();
      this.getLoggedUserDetails();
    });
  }

  addEditOption() {
    this.workspaceListVO.forEach(e => {
      this.edit.push(false);
    });
  }

  handleUpdatePermission(): void {
    this.workspaceListVO.forEach(element => {
      element.isShow = false;
      element.update = element.workspaceSecurityVO?.assignOwnerList?.some(owner => owner.id === this.userDetails.userId);
    });
  }

  showSelectedWorkspace() {
    this.workspaceListVO.forEach(list => {
      if (list.workspaceId === this.currentWorkspace) {
        list.selectedWorkspace = true;
      } else {
        list.selectedWorkspace = false;

      }
    })
  }

  getUsers() {
    this.groupService.getGroupList().subscribe(res => {
      this.usersList = res;
      // this.getTeamList();
    })

  }

  getTeamList() {
    this.teamList = [];
    for (let j = 0; j < this.workspaceListVO.length; j++) {
      for (let k = 0; k < this.workspaceListVO[j].workspaceSecurityVO.assignTeamList.length; k++) {
        const name = this.usersList.find(name => name.id === this.workspaceListVO[j].workspaceSecurityVO.assignTeamList[k])
        this.teamList.push(name)
        this.workspaceListVO[j].teams = this.teamList;
      }
    }
  }

  getOwners() {
    this.taskboardOwnerList = [];
    this.taskboardService.getUsersList().subscribe((data) => {
      this.ownerList = data;
    });
  }
  editTitle(event, workspaceVOList: WorkspaceListVO, index) {
    workspaceVOList.isShow = false;
    if (event && this.workspaceListVO.some(list => list.workspaceId === workspaceVOList.workspaceId)) {
      this.edit[index] = true;
      this.WorkspaceForm.get('workspaceName').setValue(workspaceVOList.workspaceName)
    }
  }

  cancel(i): void {
    this.edit[i] = false;
  }

  inputChange(event: any, workspace: WorkspaceListVO): void {
    if (event.data !== undefined && event.data !== null && event.data !== '') {
      if (event !== workspace.workspaceName) {
        workspace.isShow = true;
      } else {
        workspace.isShow = false;
      }
    } else {
      workspace.isShow = false;
    }
  }

  changeTitle(workspaceVOList: WorkspaceListVO, event, index, inputVaue: string) {
    // let workspaceName = this.WorkspaceForm.get('workspaceName').value
    // if (workspaceName !== '' && workspaceName !== null && workspaceName !== undefined && workspaceName.length > 0) {
    if (inputVaue !== undefined && inputVaue !== null && inputVaue !== '' && inputVaue !== workspaceVOList.workspaceName) {
      this.workspaceVO.workspaceId = workspaceVOList.workspaceId;
      this.workspaceVO.workspaceName = inputVaue;
      this.workspaceVO.workspaceKey = this.camelize(inputVaue);
      this.createDialogService.checkWorkspaceName(inputVaue).subscribe(res => {
        if (res.response.includes('already exist')) {
          this.edit[index] = true;
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: res.response
          });
        } else {
          this.createDialogService.createWorkspace(this.workspaceVO).subscribe(res => {
            if (res.response.includes('successfully')) {
              this.edit[index] = false;
              this.loadAllWorkspaceList();
            }
          })
        }
      })
    } else {
      // this.snackBar.openFromComponent(SnackbarComponent, {
      //   data: 'Invalid Workspace Name'
      // });
      this.edit[index] = false;
    }
  }

  camelize(str) {
    str = (str).replace(/[^\w\s]/gi, '');
    str = (str).trim().toLowerCase().replace(/ +/g, '-');
    return str;
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

  addWorkspace() {
    if (this.licenseVO.response.includes("You have exceeded your limit")) {
      this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { licenseVO: this.licenseVO, pageName: 'Workspace' }
      });
    } else {
      const dialog = this.dialog.open(
        CreateDialogComponent,
        {
          disableClose: true,
          width: '50%',
          maxWidth: '50%',
          height: '45%',
          panelClass: 'config-dialog',
          data: {
            pageName: "Taskboard Configuration",
            showNewConfig: true,
            fromScratch: true
          },
        });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          this.loadAllWorkspaceList();
        }
      });
    }
  }

  openTaskOwnerDialog(workspaceID, index, ownerList, workspaceVOList) {
    if (workspaceVOList.managedWorkspace === false && workspaceVOList.update === true) {
      if (ownerList && ownerList.length > 0) {
        if (ownerList.some(owner => owner.id === this.userDetails.userId)) {
          const dialog = this.dialog.open(TaskboardOwnerDialogComponent, {
            disableClose: true,
            width: '50%',
            height: '70%',
            data: {
              taskboardOwnerList: ownerList,
              usersList: this.ownerList,
              taskboardId: workspaceID,
              type: 'workspace-owner'
            }
          });
          dialog.afterClosed().subscribe(data => {
            if (data) {
              this.loadAllWorkspaceList();
            }
          })
        } else {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Only Owners can make changes to this workspace.'
          });
        }
      }
    }
  }
  editTeams(list) {
    const dialog = this.dialog.open(EditTeamsComponent, {
      disableClose: true,
      width: '50%',
      height: '30%',
      data: list

    })
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.loadAllWorkspaceList();
      }
    });

  }
  editAvatar(list) {
    const dialog = this.dialog.open(EditAvatarComponent, {
      disableClose: true,
      width: '50%',
      height: '40%',
      data: list
    })
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.loadAllWorkspaceList();
      }
    });

  }
  openTeamsDialog(index, workspaceId, assignTeamList, ownerList, defaultWorkspace, workspaceVOList) {
    if (workspaceVOList.managedWorkspace === false && workspaceVOList.update === true) {
      if (defaultWorkspace === false) {
        if (ownerList && ownerList.length > 0) {
          if (ownerList.some(owner => owner.id === this.userDetails.userId)) {
            const dialog = this.dialog.open(
              TeamListComponent,
              {
                disableClose: true,
                width: '50%',
                height: '70%',
                panelClass: 'config-dialog',
                data: {
                  type: 'team-list',
                  data: assignTeamList,
                  workspaceId: workspaceId,
                  pageName: "Taskboard Configuration",
                  showNewConfig: true,
                  fromScratch: true
                },
              });
            dialog.afterClosed().subscribe(assignTeamVO => {
              if (assignTeamVO) {

                this.loadAllWorkspaceList();
              }
            });
          } else {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Only Owners can make changes to this workspace.'
            });
          }
        }
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Cannot add teams since its a default workspace'
        });
      }
    }
  }

  setUserProfilename(name) {
    const val = name.replace(/ /g, '');
    return val.charAt(0).toUpperCase();
  }

  setDefaultWorkspace(event: MatSlideToggleChange, workspaceVO: WorkspaceListVO): void {
    this.workspaceListVO.forEach(workspace => {
      workspace.defaultWorkspace = false;
    });
    workspaceVO.defaultWorkspace = true;
    if (event.checked === true) {
      this.createDialogService.setDefault(workspaceVO.workspaceId).subscribe(res => {
        if (res.response.includes('added as default')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: res.response
          });
        }
      })
    }
  }

  switchThisWorkspace(event, workspaceVO: WorkspaceListVO, workspaceID): void {
    if (workspaceVO.selectedWorkspace !== true) {
      const dialog = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: { type: 'switchWorkspace', name: workspaceVO.workspaceName }
      });
      dialog.afterClosed().subscribe(data => {
        if (event && data && data === true) {
          this.workspaceListVO.forEach(element => {
            if (element.workspaceId === workspaceVO.workspaceId) {
              element.selectedWorkspace = true;
            }
            if (element.workspaceId !== workspaceVO.workspaceId) {
              element.selectedWorkspace = false;
            }
          });
          this.workspaceService.setWorkspaceID(workspaceID);
          this.workspaceService.setWorkspaceVO(workspaceVO);
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/mytask/my-pending-task']);
        }
      });
    }
  }


  setArchive(workspaceID, workspaceVOList) {
    if (workspaceVOList.managedWorkspace === false) {
      if (workspaceID !== null || workspaceID !== undefined) {
        const dialog = this.dialog.open(ConfirmationDialogComponent, {
          width: '400px',
          data: { type: 'archieveWorkspace', name: workspaceVOList.workspaceName }
        });
        dialog.afterClosed().subscribe(data => {
          if (data && data === true) {
            this.createDialogService.setWorkspaceArchive(workspaceID).subscribe(res => {
              if (res.response.includes('Archived successfully')) {
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: res.response
                });
                this.loadAllWorkspaceList();
              }
            });
          }
        });
      }
    } else {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'This Workspace cannot be archived.'
      });
    }

  }

  deleteWorkspace(workspaceID, workspaceVOList) {
    if (workspaceVOList.managedWorkspace === false) {
      if (workspaceID !== null || workspaceID !== undefined) {
        const dialog = this.dialog.open(ConfirmationDialogComponent, {
          width: '400px',
          data: { type: 'deleteWorkspace', name: workspaceVOList.workspaceName }
        });
        dialog.afterClosed().subscribe(data => {
          if (data && data === true) {
            this.createDialogService.deleteWorkspace(workspaceID).subscribe(res => {
              if (res.response.includes('deleted successfully')) {
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: res.response
                });
                this.loadAllWorkspaceList();
              }
            });
          }
        });
      }
    } else {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'This Workspace cannot be deleted.'
      });
    }

  }

}
