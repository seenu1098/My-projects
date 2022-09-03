import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs/operators';
import { teamVO } from 'src/app/document-module/documents-vo';
import { DocumentsService } from 'src/app/document-module/documents.service';
import { GroupService } from 'src/app/engine-module/group/group-service';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { TaskboardOwnerDialogComponent } from 'src/app/taskboard-module/taskboard-owner-dialog/taskboard-owner-dialog.component';
import { SecurityService } from 'src/app/taskboard-module/taskboard-security/security.service';
import { DataTableDialogComponent } from '../data-table-dialog/data-table-dialog.component';
import { TableSecurityVO, TableSecurityVOList } from '../data-table/data-table-vo';
import { TableObjectService } from '../table-objects/table-objects.service';
import { YoroGroups } from '../yoro-security/security-vo';

@Component({
  selector: 'app-data-tableteam',
  templateUrl: './data-tableteam.component.html',
  styleUrls: ['./data-tableteam.component.scss']
})
export class DataTableteamComponent implements OnInit {
  form: FormGroup;
  groupList: any;
  selectedTeam: any[] = [];
  deletedTeam: any[] = [];
  selectedTeamID: any[] = [];
  selectedTeamID1: any[] = [];
  deletedTeamID: any[] = [];
  removable = true;
  selectable = true;
  TableSecurityVO = new teamVO();
  taskboardOwnerList: string[] = [];

  readPermission = false;
  updatePermission = false;
  readArray: any = [];
  updateArray: any = [];
  documentOwnerList: any;
  type: any;
  list: any;
  usersList: any;
  permissionsForm: FormGroup;
  team: any;
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc', '#cedada', '#A52A2A', '#c8ead3', '#cfffe5', ];
  teamList: any = [];
  ownerData: any;
  selectedGroupNames: string[] = [];
  allCheckBoxControl = {};
  userGroupExist = false;
  documentSecurityList: any[] = [];
  deletedSecurityIdList: string[] = [];
  jsondata: any;
  items: any;
  securityVO = new TableSecurityVOList();
  yoroGroups: YoroGroups[];
  isLoadColumn = false;
  taskboardSecurityList: any[] = [];
  taskboardSecurityColumnsList: any[] = [];
  taskboardColumns: any = [];

  showGroups = false;
  constructor(private snackBar: MatSnackBar, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private dialogRef: MatDialogRef<DataTableteamComponent>, public service: TableObjectService,
              private groupService: GroupService, private pageSecurityService: SecurityService


  ) {
  }

  ngOnInit(): void {
    this.service.getUsersList().subscribe((data) => {
      this.usersList = data;
      this.getTaskboardSecurity(this.data.id);
    });

    this.usersList = this.data.usersList;
    this.groupList = this.data.groupList;
    this.getTeamsList();
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.data.owner.tableOwnersId.length; i++) {
      const name = this.usersList.find(n => n.userId === this.data.owner.tableOwnersId[i]);
      this.teamList.push(name);
    }
    this.form = this.fb.group({
      searchTeam: [],
      searchOwner: []
    });
    this.getSecurity(this.data, true);
    this.form = this.fb.group({
      securityList: this.fb.array([
        this.addTaskboardPermissionFormGroup(),
      ]),
    });
    if (this.isLoadColumn === false) {
      this.getGroupNamesAutoCompleteList('0');
      this.addValidatorGroupNames(0);
    }

  }
  getTaskboardSecurity(id: string) {
    this.pageSecurityService.getTaskboardSecurity(id).subscribe(data => {
      if (data) {
        if (data.taskboardOwner) {
          this.taskboardOwnerList = data.taskboardOwner;
        }

      }
    });
  }
  getPermissionsFormArray() {
    return this.form.get('securityList') as FormArray;
  }
  setAllChecked($event, index: number) {
    this.form.markAsDirty();
    const group = this.getPermissionsFormArray().get('' + index) as FormGroup;
    if ($event.checked === true) {
      group.get('readAllowed').setValue(true);
      group.get('updateAllowed').setValue(true);
      group.get('deleteAllowed').setValue(true);
    } else {
      group.get('readAllowed').setValue(false);
      group.get('updateAllowed').setValue(false);
      group.get('deleteAllowed').setValue(false);
    }
  }

  unCheckValue($event, index) {
    const group = this.getPermissionsFormArray().get('' + index) as FormGroup;
    this.form.markAsDirty();
    if ($event.checked === false) {
      group.get('allChecked').setValue(false);
    } else if (group.get('readAllowed').value &&
      group.get('deleteAllowed').value && group.get('updateAllowed').value) {
      group.get('allChecked').setValue(true);
    }
  }

  addTaskboardPermissionFormGroup() {
    return this.fb.group({
      id: [],
      groupName: ['', Validators.required],
      groupId: [],
      readAllowed: [false],
      updateAllowed: [false],
      deleteAllowed: [false],
      allChecked: [false]
    });
  }

  loadTeamSecurity(load) {
    for (let i = 0; i < this.documentOwnerList?.securityTeamVOList?.length; i++) {
      const index = '' + i;
      if (load && i > 0) {
        this.getPermissionsFormArray().push(this.addTaskboardPermissionFormGroup());
      }
      const team = (this.getPermissionsFormArray().get(index) as FormGroup);
      team.patchValue(this.documentOwnerList?.securityTeamVOList[i]);
    }
    this.setGroupName();
  }

  setGroupName() {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.getPermissionsFormArray().length; i++) {
      const groupName = this.getPermissionsFormArray().get('' + i).get('groupId');
      const readAllowed = this.getPermissionsFormArray().get('' + i).get('readAllowed').value;
      const updateAllowed = this.getPermissionsFormArray().get('' + i).get('updateAllowed').value;
      const deleteAllowed = this.getPermissionsFormArray().get('' + i).get('deleteAllowed').value;
      if (readAllowed && updateAllowed && deleteAllowed) {
        this.getPermissionsFormArray().get('' + i).get('allChecked').setValue(true);
      }
      if (this.groupList !== undefined && this.groupList.length > 0) {
        const index = this.groupList.findIndex(group => group.id === groupName.value);
        if (index !== -1) {
          this.getPermissionsFormArray().get('' + i).get('groupName').setValue(this.groupList[index].name);
        }
      }
    }
  }

  checkToggleSelect() {
    let allowSave = true;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.getPermissionsFormArray().length; i++) {
      const readAllowed = this.getPermissionsFormArray().get('' + i).get('readAllowed').value;
      const updateAllowed = this.getPermissionsFormArray().get('' + i).get('updateAllowed').value;
      const deleteAllowed = this.getPermissionsFormArray().get('' + i).get('deleteAllowed').value;
      if (readAllowed === false && updateAllowed === false && deleteAllowed === false) {
        allowSave = false;
      }
    }
    return allowSave;
  }

  setAutocompleteValidation(index) {
    const groupName = this.getPermissionsFormArray().get('' + index).get('groupName');
    if (this.groupList !== undefined && this.groupList.length > 0 &&
      !this.groupList.some(group => group.name === groupName.value)) {
      groupName.setErrors({ invalidGroupName: true });
    }
    // groupName.updateValueAndValidity();
  }

  checkGroupNameValidation() {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.getPermissionsFormArray().length; i++) {
      this.setAutocompleteValidation(i);
    }
  }

  setGroupId() {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.getPermissionsFormArray().length; i++) {
      const groupName = this.getPermissionsFormArray().get('' + i).get('groupName');
      if (this.groupList !== undefined && this.groupList.length > 0) {
        const index = this.groupList.findIndex(group => group.name === groupName.value);
        if (index !== -1) {
          this.getPermissionsFormArray().get('' + i).get('groupId').setValue(this.groupList[index].id);
        }
      }
    }
  }
  addPermission() {
    const length = this.getPermissionsFormArray().length;
    this.getPermissionsFormArray().push(this.addTaskboardPermissionFormGroup());
    this.getGroupNamesAutoCompleteList(length);
    this.addValidatorGroupNames(length);
    this.allCheckBoxControl[length] = false;
  }
  getAccessToCreatePermission() {
    let returnValue;
    for (let i = 0; i < this.taskboardSecurityList.length; i++) {
      if (this.taskboardSecurityList[i].updateAllowed === false &&
        this.taskboardSecurityList[i].deleteAllowed === false &&
        this.taskboardSecurityList[i].readAllowed === false) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Select one of user action',
          duration: 2000,
        });
        returnValue = false;
        return false;
      } else {
        returnValue = true;
      }
    }
    return returnValue;
  }
  removePermission(i) {
    this.taskboardSecurityList = this.form.get('securityList').value;
    this.getAccessToCreatePermission();
    if (this.getPermissionsFormArray().valid && this.getAccessToCreatePermission() === true) {
      if (this.isLoadColumn === false) {
        if (this.taskboardSecurityList !== null && this.taskboardSecurityList !== undefined && this.taskboardSecurityList.length > 0) {
        }
      } else {
        for (let i = 0; i < this.taskboardSecurityList.length; i++) {
          for (let j = 0; j < this.taskboardSecurityColumnsList.length; j++) {
            if (this.taskboardSecurityList[i].id === null) {
              this.taskboardSecurityColumnsList[j].columnPermissions.push(this.taskboardSecurityList[i]);
            }
          }
        }
      }
    }

    this.userGroupExist = false;
    const deletedID = (this.getPermissionsFormArray().get('' + i) as FormGroup).get('id').value;
    const securityGroupId = (this.getPermissionsFormArray().get('' + i) as FormGroup).get('groupName').value;
    if (deletedID !== null && deletedID !== '') {
      this.deletedSecurityIdList.push(deletedID);
    }

    this.getPermissionsFormArray().removeAt(i);
    this.selectedGroupNames.splice(i);
    this.form.markAsDirty();

  }
  checkUser(event, name, a: number) {
    if (event.isUserInput) {
      for (let i = 0; i < this.taskboardOwnerList.length; i++) {
        const index = this.usersList.findIndex(users => users.userId === this.taskboardOwnerList[i]);
        const groupVOList = this.usersList[index].groupVOList;
        if (this.checkUserAssociated(groupVOList, name) === false) {
          this.userGroupExist = true;
          this.getPermissionsFormArray().get('' + a).get('groupName').setErrors({ userGroupExist: true });
        } else {
          this.userGroupExist = false;
          this.getPermissionsFormArray().get('' + a).get('groupName').setErrors(null);
        }
      }

    }
  }
  checkUserAssociated(groupVOList, name): boolean {
    let returnValue;
    if (groupVOList && groupVOList.length > 0) {
      const index = groupVOList.findIndex(group => group.groupId === name.id);
      if (index !== -1) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Team is already associated with taskboard owner',
          duration: 3000,
        });
        returnValue = false;
        return false;
      } else {
        returnValue = true;
      }
    }
    return returnValue;
  }

  addValidatorGroupNames(i: number) {
    const index = '' + i;
    const formArray = this.getPermissionsFormArray();
    const form = formArray.get(index);
    form
      .get('groupName')
      .valueChanges.pipe(debounceTime(500))
      .subscribe((data) => {
        const groupNameIndex = this.selectedGroupNames.indexOf(data);
        if (this.isLoadColumn === false && groupNameIndex > -1 && data !== null && groupNameIndex !== i) {
          form.get('groupName').setErrors({ validators: true });
        } else if (this.isLoadColumn === true && groupNameIndex > -1 && data !== null && groupNameIndex !== i) {
          form.get('groupName').setErrors({ validators: true });
        } else {
          if (data !== '') {
            this.selectedGroupNames[i] = data;
          }
        }
      });
  }

  getGroupNamesAutoCompleteList(index) {
    const groupName = this.getPermissionsFormArray()
      .get('' + index)
      .get('groupName');
    groupName.valueChanges.pipe(debounceTime(300)).subscribe((name) => {
      if (name !== null && name !== '') {
        this.pageSecurityService.getGroupNames(name).subscribe((data) => {
          if (data.length === 0) {
            groupName.setErrors({ groupExist: true });
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Team does not exist',
              duration: 3000,
            });
          } else {
            this.yoroGroups = data;
          }
        });
      }
    });
  }


  dialogClose() {
    for (let j = 0; j < this.groupList.length; j++) {
      this.groupList[j].isSelected = false;
    }
    this.dialogRef.close();
  }
  getSecurity(data, load) {
    this.service.getSecurity(data.id).subscribe(data => {
      if (data) {
        this.documentOwnerList = data;
        this.loadTeamSecurity(load);
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
    });
  }
  getRandomColor() {
    return (
      '#' +
      ('000000' + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
    );
  }
  removedAssigneeUser(user, index, type) {
    this.deletedTeamID = [];
    if (type === 'read') {
      this.deletedTeamID.push(user.id);
      for (let i = 0; i < this.selectedTeamID1.length; i++) {
        if (this.selectedTeamID1[i].groupId === user.id) {
          this.selectedTeamID1.splice(i, 1);
          this.team = this.selectedTeamID1;
        }
      }
    }
    else if (type === 'update') {
      this.deletedTeamID.push(user.id);
      for (let i = 0; i < this.selectedTeamID.length; i++) {
        if (this.selectedTeamID[i].groupId === user.id) {
          this.selectedTeamID.splice(i, 1);
          this.team = this.selectedTeamID;
        }
      }
    }
    this.securityVO.tableId = this.data.id;
    this.securityVO.securityTeamVOList = this.team;
    this.securityVO.deletedTeamsIdList = this.deletedTeamID;
    this.service.saveSecurity(this.securityVO).subscribe(res => {
      if (res.response.includes('successfully')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: res.response,
        });
        this.getSecurity(this.data, false);
      }
    });

  }

  setUserProfilename(user): string {
    return user.name.charAt(0).toUpperCase();
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
    const array = [];
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
        tableId: this.data.id,
        usersList: this.usersList,
        taskboardOwnerList: this.data.owner,
        type: 'datatable-owner'
      }
    });
    dialog.afterClosed().subscribe(data => {
      this.ownerData = data;
      if (data) {
        this.service.getSecurity(this.data.id).subscribe(data => {
          this.documentOwnerList = data;
          this.data.owner.tableOwnersId = this.documentOwnerList.tableOwnersId;
          for (let i = 0; i < this.documentOwnerList.tableOwnersId.length; i++) {
            const name = this.usersList.find(name => name.userId === this.documentOwnerList.tableOwnersId[i]);
            this.teamList.push(name);
          }
        });
      }
    });
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
      DataTableDialogComponent,
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
        this.getSecurity(this.data, false);
      }
    });
  }
  checkSelectedTeam() {
    this.readArray = [];
    this.updateArray = [];
    this.selectedTeamID = [];
    this.selectedTeamID1 = [];
    if (this.documentOwnerList.length !== 0) {
      for (let i = 0; i < this.groupList.length; i++) {
        for (let j = 0; j < this.documentOwnerList.length; j++) {
          if (this.groupList[i].id === this.documentOwnerList[j].groupId) {
            if (this.documentOwnerList[j].readAllowed === true && this.documentOwnerList[j].updateAllowed === false) {
              this.readArray.push(this.groupList[i]);
              this.readPermission = true;
              this.updatePermission = false;
              const teamsVO = new TableSecurityVO();
              teamsVO.groupId = this.documentOwnerList[j].groupId;
              teamsVO.readAllowed = this.readPermission;
              teamsVO.updateAllowed = this.updatePermission;
              this.selectedTeamID1.push(teamsVO);
            }
            if (this.documentOwnerList[j].readAllowed === true && this.documentOwnerList[j].updateAllowed === true) {
              this.updateArray.push(this.groupList[i]);
              this.readPermission = true;
              this.updatePermission = true;
              const teamsVO = new TableSecurityVO();
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

  saveTeam() {
    this.checkGroupNameValidation();
    if (this.form.valid) {
      if (this.checkToggleSelect()) {
        this.setGroupId();
        const tableSecurityVOList = new TableSecurityVOList();
        tableSecurityVOList.tableId = this.data?.id;
        tableSecurityVOList.securityTeamVOList = this.getPermissionsFormArray().value;
        this.service.saveSecurityTeam(tableSecurityVOList).subscribe(res => {
          if (res.response.includes('Successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: res.response,
            });
            this.getSecurity(this.data, false);
          }
        });
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Select atleast one action',
        });
      }
    }
  }

  close() {
    this.dialogRef.close();
  }
}
