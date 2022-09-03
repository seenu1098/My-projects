import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Group } from './group-vo';
import { GroupService } from './group-service';
import { Router, RouterEvent } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { YorogridComponent } from "../../shared-module/yorogrid/yorogrid.component";
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { TaskBoardService } from '../../taskboard-module/taskboard-configuration/taskboard.service';
import { YoroGroupsUserVO } from '../../engine-module/yoro-security/security-vo';
import { UserGroupAssociationComponent } from '../../creation-module/user-group-association/user-group-association.component';
import { AddTeamComponent } from '../../engine-module/add-team/add-team.component';
import { NotificationService } from '../../rendering-module/shared/service/notification.service.service';
import { TaskboardOwnerDialogComponent } from "../../taskboard-module/taskboard-owner-dialog/taskboard-owner-dialog.component";

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {

  form: FormGroup;
  group = new Group();
  canDeactivateForm: boolean;
  urlData: any;
  screenHeight: string;
  screenHeight1: string;
  isAllowed = true;
  licenseVo = new LicenseVO();
  @ViewChild('YoroGroups', { static: true }) yoroGroups: YorogridComponent;
  groupList: YoroGroupsUserVO[] = [];
  usersList: any;
  teamList: any;
  selectedUsers: any = [];
  userId: any[] = [];
  selectable = true;
  removable = true;
  myArray: any;
  show: boolean = false;
  enableCondition: boolean = false;
  yoroGroupsUsers = new YoroGroupsUserVO();
  currentUserDetails: any;
  edit: any[] = [false];
  assigneeOwnerColorArray = ['#df340e', '#5244ab', '#0151cc', '#cedada', '#A52A2A', '#c8ead3', '#cfffe5'];
  assigneeMemberColorArray = ['#172b4d', '#A52A2A', '#0151cc', '#c8ead3', '#df340e', '#5244ab'];

  ownersList: any[] = [];
  constructor(private fb: FormBuilder, private service: GroupService, private snackBar: MatSnackBar,
    private dialog: MatDialog, private router: Router, private taskboardService: TaskBoardService,
    private notficationService: NotificationService,
  ) {
    this.getRouterLink();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = (window.innerHeight - 72) + 'px';
    this.screenHeight1 = (window.innerHeight - 63) + 'px';
  }

  ngOnInit() {
    this.form = this.fb.group({
      searchTeam: [''],
      searchUser: [''],
      id: [''],
      groupId: ['', [Validators.required]],
      description: ['', [Validators.required]]

    });
    this.formValueChange();
    if (this.form.touched === false) {
      this.canDeactivateForm = false;
    }
    this.screenHeight = (window.innerHeight - 72) + 'px';
    this.screenHeight1 = (window.innerHeight - 63) + 'px';
    this.getTeamsList();
    this.searchTeamValueChanges();
    this.getLoggedUserDetails();
  }

  replicateArray(array, n) {
    var arrays = Array.apply(null, new Array(n));
    arrays = arrays.map(function () { return array });
    return [].concat.apply([], arrays);
  }

  getLoggedUserDetails() {
    this.notficationService.getLoggedInUserDetails().subscribe(data => {
      this.currentUserDetails = data;
    });
  }

  formValueChange() {
    this.form.valueChanges.subscribe(data => {
      this.canDeactivateForm = true;
    });
  }

  searchTeamValueChanges() {
    this.form.get('searchTeam').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        let filterList: any[] = [];
        for (let i = 0; i < this.groupList.length; i++) {
          const name = this.groupList[i].name.toLowerCase();
          if (name.includes(filterData)) {
            filterList.push(this.groupList[i])
          }
        }
        this.groupList = filterList;
      } else {
        this.groupList = this.teamList;
      }

    });
  }

  submit(userForm) {
    if (userForm.valid) {
      this.group = this.form.getRawValue();
      this.service.saveGroup(this.group).subscribe(data => {
        if (data.response.includes('exceeded your limit')) {
          const dialog = this.dialog.open(AlertmessageComponent, {
            width: '450px',
            data: { licenseVO: data.licenseVO, pageName: 'Security Group' }
          });
        } else {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });

          if (data.response !== 'Group Name Already Exist') {
            userForm.resetForm();
            this.form.get('name').enable();
            this.canDeactivateForm = false;
            this.getTeamsList();
          }
        }
      });
    }
  }

  receiveMessage($event) {
    this.service.getGroupInfo($event.col1).subscribe(data => {
      this.group = data;
      this.ngOnInit();
      this.form.get('name').disable();
    });
  }

  canDeactivate(): Observable<boolean> | boolean {


    if (this.canDeactivateForm) {
      this.canDeactivateForm = false;
      const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '250px',
        data: this.urlData
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data === false) {
          this.canDeactivateForm = true;
        }
      });
      return false;
    }
    return true;
  }

  getRouterLink(): any {
    this.router.events.subscribe((data: RouterEvent) => {
      this.urlData = {
        'type': 'navigation', 'target': data.url
      };
    });
    return this.urlData;
  }

  getTeamsList() {
    this.service.getTeamList().subscribe(groups => {
      this.groupList = groups;
      this.teamList = groups;
      for (let i = 0; i < this.groupList.length; i++) {
        this.groupList[i].isSelected = false;
        this.groupList[i].filter = true;
      }
      this.taskboardService.getUsersList().subscribe((data) => {
        this.usersList = data;
        for (let i = 0; i < this.groupList.length; i++) {
          this.groupList[i].ownersList = [];

          for (let k = 0; k < this.groupList[i].owners.length; k++) {
            for (let j = 0; j < this.usersList.length; j++) {
              if (this.groupList[i].owners[k] === this.usersList[j].userId) {
                this.groupList[i].ownersList.push(this.usersList[j]);
              }
            }
          }
        }
        for (let i = 0; i < this.groupList.length; i++) {
          this.groupList[i].membersList = [];
          for (let m = 0; m < this.groupList[i].members.length; m++) {
            for (let j = 0; j < this.usersList.length; j++) {
              if (this.groupList[i].members[m] === this.usersList[j].userId) {
                this.groupList[i].membersList.push(this.usersList[j]);
              }
            }
          }
        }
      });
      this.edit = this.replicateArray([false], this.groupList.length)
    })

  }

  getRandomColor() {
    return (
      "#" +
      ("000000" + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
    );
  }
  setUserProfilename(user): string {
    return user.name.charAt(0).toUpperCase();
  }

  getUser(id) {
    if (id !== null || id !== undefined || id !== '') {
      this.form.get('groupId').setValue(id)
    }
    this.enableCondition = false;
    this.show = true;
    this.taskboardService.getUsersList().subscribe((data) => {


      this.usersList = data;
      this.selectedUsers = [];

      if (this.usersList.length !== 0) {
        this.service.getUserIdList(id).subscribe(dataa => {
          this.userId = dataa;
          if (this.userId.length !== 0) {
            for (let i = 0; i < this.usersList.length; i++) {
              for (let j = 0; j < this.userId.length; j++) {
                if (this.usersList[i].userId === this.userId[j]) {
                  // this.sample = true;
                  this.selectedUsers.push(this.usersList[i]);
                }
              }
            }
          }
          else {
            this.enableCondition = true;
          }
          for (let i = 0; i < this.selectedUsers.length; i++) {
            this.selectedUsers[i].filter = true;
          }
          this.myArray = this.usersList.filter((item) => !this.selectedUsers.includes(item));
          for (let i = 0; i < this.myArray.length; i++) {
            this.myArray[i].filter = true;
          }
        });
      }
    });
  }
  setUserProfileName(user) {
    const firstName = user.firstName.charAt(0).toUpperCase();
    const lastName = user.lastName.charAt(0).toUpperCase();
    return firstName + lastName;
  }
  add(val, index) {
    this.show = true;
    for (let j = 0; j < this.usersList.length; j++) {
      if (this.usersList[j].userId === val.userId) {
        this.selectedUsers.unshift(this.usersList[j]);
      }
    }
    for (let i = 0; i < this.selectedUsers.length; i++) {
      this.selectedUsers[i].filter = true;
    }
    this.myArray.forEach((element, index) => {
      if (element.userId == val.userId) this.myArray.splice(index, 1);
    });
    this.form.get('searchUser').setValue('');
  }
  remove(val, index) {
    this.show = true;
    this.selectedUsers.forEach((element, index) => {
      if (element.userId == val.userId) this.selectedUsers.splice(index, 1);
    });
    this.myArray.unshift(val);
    for (let i = 0; i < this.myArray.length; i++) {
      this.myArray[i].filter = true;
    }
  }
  save(userForm) {
    this.userId = [];
    if (this.enableCondition === true && this.selectedUsers.length === 0) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Select atleast one user'
      });
    }
    else {
      for (let i = 0; i < this.selectedUsers.length; i++) {
        this.selectedUsers[i].filter = true;
        this.userId.push(this.selectedUsers[i].userId);
      }
      this.yoroGroupsUsers.id = this.form.get('id').value;
      this.yoroGroupsUsers.groupId = this.form.get('groupId').value;
      this.yoroGroupsUsers.userId = this.userId;
      this.service.saveYoroGroupsUsers(this.yoroGroupsUsers).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
      });
      this.enableCondition = false;
    }
  }
  reset(userForm) {
    this.selectedUsers = [];
    this.service.getUserIdList(this.form.get('groupId').value).subscribe(dataa => {
      this.userId = dataa;
      for (let i = 0; i < this.usersList.length; i++) {
        for (let j = 0; j < this.userId.length; j++) {
          if (this.usersList[i].userId === this.userId[j]) {
            this.selectedUsers.push(this.usersList[i]);
          }
        }
      }
      for (let i = 0; i < this.selectedUsers.length; i++) {
        this.selectedUsers[i].filter = true;
      }
      this.myArray = this.usersList.filter((item) => !this.selectedUsers.includes(item));
      for (let i = 0; i < this.myArray.length; i++) {
        this.myArray[i].filter = true;
      }
    });
  }

  addSecurity(group) {
    let owners = group.owners;
    let ownerAccess = false;

    if (owners.some(owner => owner === this.currentUserDetails.userId)) {
      ownerAccess = true;
    } else {
      ownerAccess = false;
    }
    const dialog = this.dialog.open(UserGroupAssociationComponent, {
      disableClose: true,
      width: '65%',
      maxWidth: '65%',
      data: {
        groupId: group?.id,
        ownerList: group?.owners,
        access: ownerAccess
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data === true) {
        this.getTeamsList();
      }
    })
    // } 
    // else {
    //   this.snackBar.openFromComponent(SnackbarComponent, {
    //     data: 'Only Owners can add users to this team'
    //   });
    // }
  }
  addTeams() {
    const dialog = this.dialog.open(AddTeamComponent, {
      disableClose: true,
      width: '40%',
      data: {
        data: null
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data === true) {
        this.getTeamsList();
      }
    })
  }

  getSecurityColor(group): string {
    var returnValue: string = 'lightgrey';
    if (group.owners && group.owners.length > 0) {
      let owners = group.owners;
      owners.forEach(owner => {
        if (owner === this.currentUserDetails.userId) {
          returnValue = '#32be53';
        }
      })
    }
    return returnValue;
  }

  editTeam(group) {
    const dialog = this.dialog.open(AddTeamComponent, {
      disableClose: true,
      width: '40%',
      data: {
        data: group
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data === true) {
        this.getTeamsList();
      }
    })
  }

  editTitle(group, index) {
    let owners = group.owners;

    if (owners.some(owner => owner === this.currentUserDetails.userId)) {
      if (this.groupList.some(groups => groups.id === group.id)) {
        this.form.get('description').setValue(group.description)
        this.edit[index] = true;
      }
    } else {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Only Owners can edit description for this team'
      });
    }

  }
  cancel(i): void {
    this.edit[i] = false;
  }

  openAvatarDialog(group:Group):void{
    const dialog = this.dialog.open(AddTeamComponent, {
      disableClose: true,
      width: '40%',
      data: {
        data: group
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data === true) {
        this.getTeamsList();
      }
    });
  }

  editDescription(group, index) {
    const description = this.form.get('description').value;
    let data = { 'id': group.id, 'name': group?.name, 'description': description, 'color': group.color };
    const isWhitespace = (description || '').trim().length === 0;

    if (isWhitespace !== true && description !== '' && description !== null && description !== undefined) {
      this.service.saveGroup(data).subscribe(data => {
        if (data.response.includes('exceeded your limit')) {
          const dialog = this.dialog.open(AlertmessageComponent, {
            width: '450px',
            data: { licenseVO: data.licenseVO, pageName: 'Security Group' }
          });
        }
        else if (data.response.includes('Updated Successfully')) {
          this.edit[index] = false;
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.getTeamsList();
        }
      });
    } else {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Description cannot be empty'
      });
    }
  }

  openTaskOwnerDialog(group, owner) {
    let usersList = [];
    usersList = group.membersList;
    for (let i = 0; i < group.ownersList.length; i++) {
      if (!usersList.some(list => list.userId === group.ownersList[i].userId)) {
        usersList.push(group.ownersList[i]);
      }
    }
    const dialog = this.dialog.open(TaskboardOwnerDialogComponent, {
      disableClose: true,
      width: '50%',
      data: {
        taskboardOwnerList: group.owners,
        usersList: usersList,
        taskboardId: group.id,
        type: 'teams-owner'
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data === true) {
        this.getTeamsList();
      }
    })
  }
  getRemainingAssigneeUserCount(teams: string[]) {
    return teams.length - 3;
  }

}
