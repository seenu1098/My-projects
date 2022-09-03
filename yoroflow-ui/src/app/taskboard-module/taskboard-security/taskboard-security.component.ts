import { Component, OnInit, Inject, EventEmitter, ViewChild } from "@angular/core";
import {
  FormBuilder,
  Validators,
  FormGroup,
  NgForm,
  FormArray,
} from "@angular/forms";
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA } from "mat-right-sheet";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackbarComponent } from "src/app/shared-module/snackbar/snackbar.component";
import { debounceTime } from "rxjs/operators";
import { Permission, SecurityListVO, TaskboardSecurityVO, YoroGroups, TaskboardColumnSecurityVO } from "./security.vo";
import { SecurityService } from "./security.service";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { TaskBoardService } from "../taskboard-configuration/taskboard.service";
import { TaskboardOwnerDialogComponent } from "../taskboard-owner-dialog/taskboard-owner-dialog.component";
import { GroupVO, UserVO } from "../taskboard-form-details/taskboard-task-vo";
import { MatStepper } from "@angular/material/stepper";
import { BoardGroups } from "../event-automation/event-automation.model";
import { LaunchTaskboardDialogComponent } from "../launch-taskboard-dialog/launch-taskboard-dialog.component";
import { LaunchTaskboardService } from "../launch-taskboard-dialog/launch-taskboard.service";
import { LaunchPermissionVo } from "../launch-taskboard-dialog/launch-taskboard";
import { concatArray } from "ngx-tethys/util";


@Component({
  selector: "app-taskboard-security",
  templateUrl: "./taskboard-security.component.html",
  styleUrls: ["./taskboard-security.component.scss"],
})
export class TaskboardSecurityComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private pageSecurityService: SecurityService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<TaskboardSecurityComponent>,
    private dialog: MatDialog,
    private taskboardService: TaskBoardService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private securityService: SecurityService,
    private launchTaskboardService: LaunchTaskboardService
  ) { }
  taskboardPermissionsForm: FormGroup;
  yoroGroups: YoroGroups[];
  yoroGroupsColumns: YoroGroups[];
  allCheckBoxControl = {};
  allColumnCheckBoxControl = {};
  spinner = true;
  selectedGroupNames: string[] = [];
  onAdd = new EventEmitter();
  isDisable = false;
  taskboardSecurityVO = new TaskboardSecurityVO();
  columnsSecurityVOList: TaskboardSecurityVO[];
  taskboardColumns: any = [];
  taskboardSecurityColumnsList: any[] = [];
  deletedSecurityIdList: string[] = [];
  deletedColumnSecurityList: string[] = [];
  taskboardSecurityList: any[] = [];
  isLoadColumn = false;
  usersList: UserVO[] = [];
  taskboardOwnerList: string[] = [];

  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  @ViewChild('stepper') private myStepper: MatStepper;
  userGroupExist = false;
  boardGroupsList: BoardGroups[] = [];
  boardUsersList: any[] = [];
  submitted = false;
  launchPermissionVo = new LaunchPermissionVo();
  launchData = false;
  ngOnInit() {
    this.createForm();
    this.taskboardService.getUsersList().subscribe((data) => {
      this.usersList = data;
      this.getTaskboardSecurity(this.data.id);
    });

    this.taskboardColumns = this.data.columns.sort((a, b) =>
      a.columnOrder.toString().localeCompare(b.columnOrder.toString())
    );
    this.taskboardPermissionsForm.get('taskboardId').setValue(this.data.id);
    if (this.isLoadColumn === false) {
      this.getGroupNamesAutoCompleteList("0");
      this.getColumnGroupNamesAutoCompleteList("0", "0");
      this.addValidatorGroupNames(0);
      this.addColumnValidatorGroupNames(0, 0);
      this.getLaunchPermission();
    }
    this.allCheckBoxControl[0] = false;
    this.allColumnCheckBoxControl[0] = false;
  }
  addMissingColumns(columnSecurityList: TaskboardColumnSecurityVO[]): any[] {
    let columnIdList = [];
    for (let i = 0; i < columnSecurityList.length; i++) {
      let column = this.taskboardColumns.find(columns => columns.id === columnSecurityList[i].columnId);
      if (column) {
        columnIdList.push({ id: columnSecurityList[i].columnId, columnName: column.columnName });
      }
    }
    var props = ['id', 'columnName'];
    var result = this.taskboardColumns.filter(function (o1) {
      // filter out (!) items in result2
      return !columnIdList.some(function (o2) {
        return o1.id === o2.id;          // assumes unique id
      });
    }).map(function (o) {
      // use reduce to make objects with only the required properties
      // and map to apply this to the filtered array as a whole
      return props.reduce(function (id, columnName) {
        id[columnName] = o[columnName];
        return id;
      }, {});
    });
    return result;
  }
  closeDialog() {
    this.loadBoardUsers();
  }

  loadBoardUsers() {
    this.securityService.getTaskboardSecurity(this.data.id).subscribe(data => {
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
        let user = this.usersList.find(u => u.userId === data.taskboardOwner[i]);
        if (user) {
          this.boardUsersList.push(user);
        }
      }
      this.boardUsersList = this.boardUsersList.filter((v, i) => this.boardUsersList.findIndex(item => item.userId == v.userId) === i);
      this.boardUsersList.forEach(param => param.isSelected = false);
      this.dialogRef.close({ boardUsers: this.boardUsersList });
    });

  }

  getTaskboardSecurity(id: string) {
    this.securityService.getTaskboardSecurity(id).subscribe(data => {
      if (data) {

        let missingColumnArray = this.addMissingColumns(data.columnSecurityList);
        if (missingColumnArray !== undefined && missingColumnArray !== null && missingColumnArray.length > 0) {
          for (let j = 0; j < missingColumnArray.length; j++) {
            var columnSecurityList = {
              columnId: missingColumnArray[j].id,
              columnPermissions: data.securityList
            }
            for (let i = 0; i < columnSecurityList.columnPermissions.length; i++) {
              columnSecurityList.columnPermissions[i].id = null;
            }
            data.columnSecurityList.push(columnSecurityList);
          }
        }
        if (data.isTaskBoardOwner === false) {
          this.isDisable = true;
          this.taskboardPermissionsForm.disable();
        }
        if (data.taskboardOwner) {
          this.taskboardOwnerList = data.taskboardOwner;
          this.taskboardPermissionsForm.get('taskboardOwner').setValue(data.taskboardOwner);
        }

        if (this.data.securityType === 'task-column-security') {
          if (data.columnSecurityList != null && data.columnSecurityList != undefined
            && data.columnSecurityList.length > 0) {
            this.isLoadColumn = true;
            this.taskboardSecurityColumnsList = data.columnSecurityList.filter(security => security.columnId === this.data.columns[0].id);
            this.setLoadedColumnSecurityList(this.taskboardSecurityColumnsList);
          }
        } else {
          if (data.securityList != null && data.securityList != undefined
            && data.securityList.length > 0) {
            this.setSecurityList(data.securityList);

            if (data.columnSecurityList != null && data.columnSecurityList != undefined
              && data.columnSecurityList.length > 0) {
              this.isLoadColumn = true;
              this.taskboardSecurityColumnsList = data.columnSecurityList;
            }
          }
        }
        if (this.data.securityType === 'task-column-security') {
          data.securityList.forEach(securityList => {
            this.taskboardSecurityList.push(securityList)
          });
        }
      }
    });
  }

  getUserName(user: string) {
    const index = this.usersList.findIndex(users => users.userId === user);
    if (index !== -1) {
      return 'Assigned To ' + this.usersList[index].firstName + ' ' + this.usersList[index].lastName;
    }
    return '';
  }



  getUserFirstAndLastNamePrefix(user: string) {
    const index = this.usersList.findIndex(users => users.userId === user);
    if (index !== -1) {
      const firstName = this.usersList[index].firstName.charAt(0).toUpperCase();
      const lastName = this.usersList[index].lastName.charAt(0).toUpperCase();
      return firstName + lastName;
    }
    return '';
  }

  getUserNames(assigneeUsers: string[]) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < assigneeUsers.length; i++) {
      if (i > 4) {
        const index = this.usersList.findIndex(users => users.userId === assigneeUsers[i]);
        if (userNames === null) {
          userNames = 'Assigned To ' + this.usersList[index].firstName + ' ' + this.usersList[index].lastName + ', ';
        } else {
          userNames = userNames + this.usersList[index].firstName + ' ' + this.usersList[index].lastName + ', ';
        }
      }
    }
    return userNames;
  }

  getUserNamesForLaunch(assigneeUsers: string[]) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < assigneeUsers.length; i++) {
      if (i > 4) {
        const index = this.usersList.findIndex(users => users.userId === assigneeUsers[i]);
        if (userNames === null) {
          userNames = this.usersList[index].firstName + ' ' + this.usersList[index].lastName + ', ';
        } else {
          userNames = userNames + this.usersList[index].firstName + ' ' + this.usersList[index].lastName + ', ';
        }
      }
    }
    return userNames;
  }

  getUserNameForLaunch(user: string) {
    const index = this.usersList.findIndex(users => users.userId === user);
    if (index !== -1) {
      return this.usersList[index].firstName + ' ' + this.usersList[index].lastName;
    }
    return '';
  }

  getGroupName(team: string) {
    const index = this.data.groupList.findIndex(group => group.groupId === team);
    if (index !== -1) {
      return this.data.groupList[index].groupName;
    }
    return '';
  }



  getGroupFirstAndLastNamePrefix(team: string) {
    const index = this.data.groupList.findIndex(group => group.groupId === team);
    if (index !== -1) {
      const firstName = this.data.groupList[index].groupName.charAt(0).toUpperCase();
      const lastName = this.data.groupList[index].groupDesc.charAt(0).toUpperCase();
      return firstName + lastName;
    }
    return '';
  }

  getGroupNames(teamsList: string[]) {
    let teamNames: string;
    teamNames = null;
    for (let i = 0; i < teamsList.length; i++) {
      if (i > 4) {
        const index = this.data.groupList.findIndex(team => team.groupId === teamsList[i]);
        if (teamNames === null) {
          teamNames = this.data.groupList[index].groupName + ', ';
        } else {
          teamNames = teamNames + this.data.groupList[index].groupName  + ', ';
        }
      }
    }
    return teamNames;
  }

  getRemainingTeamsCount(teamsList: string[]) {
    let array = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < teamsList.length; i++) {
      const index = this.data.groupList.findIndex(team => team.groupId === teamsList[i]);
      array.push(this.data.groupList[index]);
    }
    if (teamsList.length > 4) {
      return teamsList.length - 4;
    }
  }

  createForm() {
    this.taskboardPermissionsForm = this.fb.group({
      taskboardId: [],
      taskboardOwner: [],
      securityList: this.fb.array([
        this.addTaskboardPermissionFormGroup(),
      ]),
      columnSecurityList: this.fb.array([this.columnForm()]),
    });
  }
  columnForm() {
    return this.fb.group({
      columnId: [],
      columnPermissions: this.fb.array([this.addColumnPermissionFormGroup()]),
    });
  }

  focusOutForGroupName($event, i) {
    const name = $event.target.value;
    if (name && name !== "") {
      this.pageSecurityService
        .checkGroupExistOrNot($event.target.value)
        .subscribe((data) => {
          const form = this.getPermissionsFormArray().get(
            i + ""
          ) as FormGroup;
          if (data && data.response === "Team does not exist") {
            form.get("groupId").setErrors({ groupExist: true });
          }
        });


    }
  }

  addValidatorGroupNames(i: number) {
    const index = "" + i;
    const formArray = this.getPermissionsFormArray();
    const form = formArray.get(index);
    form
      .get("groupId")
      .valueChanges.pipe(debounceTime(500))
      .subscribe((data) => {
        const groupNameIndex = this.selectedGroupNames.indexOf(data);
        if (this.isLoadColumn === false && groupNameIndex > -1 && data !== null && groupNameIndex !== i) {
          form.get("groupId").setErrors({ validators: true });
        }else if(this.isLoadColumn === true && groupNameIndex > -1 && data !== null && groupNameIndex !== i) {
          form.get("groupId").setErrors({ validators: true })
        } else {
          if (data !== "") {
            this.selectedGroupNames[i] = data;
          }
        }
      });
  }

  openTaskOwnerDialog() {
    const dialog = this.dialog.open(TaskboardOwnerDialogComponent, {
      disableClose: true,
      width: '450px',
      height: '600px',
      data: {
        taskboardOwnerList: this.taskboardOwnerList,
        usersList: this.usersList,
        taskboardId: this.data.id,
        type: 'taskboard-owner'
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.taskboardOwnerList = data
      }
    })
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

  addColumnValidatorGroupNames(i: number, k) {
    const index = "" + i;
    const formArray = this.getColumnPermissionsFormArray(k);
    const form = formArray.get(index);
    form
      .get("groupId")
      .valueChanges.pipe(debounceTime(500))
      .subscribe((data) => {
        const groupNameIndex = this.selectedGroupNames.indexOf(data);
        if (this.isLoadColumn === true && groupNameIndex > -1 && data !== null && groupNameIndex !== i) {
          form.get("groupId").setErrors({ validators: true });
        } else {
          if (data !== "") {
            this.selectedGroupNames[i] = data;
          }
        }
      });
  }

  getColumnGroupNamesAutoCompleteList(index, k) {
    const groupName = this.getColumnPermissionsFormArray(k)
      .get("" + index)
      .get("groupId");
    groupName.valueChanges.pipe(debounceTime(300)).subscribe((name) => {
      if (name !== null && name !== "") {
        this.pageSecurityService.getGroupNames(name).subscribe((data) => {
          if (data.length === 0) {
            groupName.setErrors({ groupExist: true });
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: "Team does not exist",
              duration: 3000,
            });
          } else {
            this.yoroGroupsColumns = data;
          }
        });
      }
    });
  }

  setAutocompleteValidation(index) {
    const groupName = this.getPermissionsFormArray().get("" + index).get("groupId");
    if (this.isLoadColumn === false && this.yoroGroups !== undefined && this.yoroGroups.length > 0 &&
      !this.yoroGroups.some(group => group.name === groupName.value)) {
      groupName.setErrors({ invalidGroupName: true });
    }
  }
  setAutocompleteValidationForColumns(k, i) {
    const groupName = this.getColumnPermissionsFormArray(k).get("" + i).get("groupId");
    let securityList = this.taskboardPermissionsForm.get('securityList').value
    if (this.isLoadColumn === false && this.yoroGroups !== undefined && this.yoroGroups.length > 0 &&
      !this.yoroGroups.some(group => group.name === groupName.value)) {
      groupName.setErrors({ invalidGroupName: true });
    }
  }

  getGroupNamesAutoCompleteList(index) {
    const groupName = this.getPermissionsFormArray()
      .get("" + index)
      .get("groupId");
    groupName.valueChanges.pipe(debounceTime(300)).subscribe((name) => {
      if (name !== null && name !== "") {
        this.pageSecurityService.getGroupNames(name).subscribe((data) => {
          if (data.length === 0) {
            groupName.setErrors({ groupExist: true });
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: "Team does not exist",
              duration: 3000,
            });
          } else {
            this.yoroGroups = data;
          }
        });
      }
    });
  }

  addTaskboardPermissionFormGroup() {
    return this.fb.group({
      id: [],
      groupId: ["", Validators.required],
      readAllowed: [false],
      updateAllowed: [false],
      deleteAllowed: [false],
      allChecked: [false]
    });
  }

  addColumnPermissionFormGroup() {
    return this.fb.group({
      id: [],
      groupId: ["", Validators.required],
      readAllowed: [false],
      updateAllowed: [false],
      deleteAllowed: [false],
      allChecked: [false]
    });
  }

  setColumnAllChecked($event, index: number, j) {
    this.taskboardPermissionsForm.markAsDirty();
    const group = this.getColumnPermissionsFormArray(j).get("" + index) as FormGroup;

    if ($event.checked === true) {
      group.get("readAllowed").setValue(true);
      group.get("updateAllowed").setValue(true);
      group.get("deleteAllowed").setValue(true);
    } else {
      group.get("readAllowed").setValue(false);
      group.get("updateAllowed").setValue(false);
      group.get("deleteAllowed").setValue(false);
    }
  }
  getPermissionsFormArray() {
    return this.taskboardPermissionsForm.get("securityList") as FormArray;
  }

  getColumnPermissionsFormArray(i) {
    return this.getColumnPermissionsArray()
      .at(i)
      .get("columnPermissions") as FormArray;
  }
  getColumnPermissionsArray() {
    return this.taskboardPermissionsForm.get(
      "columnSecurityList"
    ) as FormArray;
  }
  addColumnPermission(k) {
    const length = this.getColumnPermissionsFormArray(k).length;
    this.getColumnPermissionsFormArray(k).push(
      this.addColumnPermissionFormGroup()
    );
    this.getColumnGroupNamesAutoCompleteList(length, k);
    this.addColumnValidatorGroupNames(length, k);
    this.allColumnCheckBoxControl[length] = false;
  }

  addPermission() {
    const length = this.getPermissionsFormArray().length;
    this.getPermissionsFormArray().push(this.addTaskboardPermissionFormGroup());
    this.getGroupNamesAutoCompleteList(length);
    this.addValidatorGroupNames(length);
    this.allCheckBoxControl[length] = false;
  }
  removeColumnPermission(i, k) {
    const deletedID = (this.getColumnPermissionsFormArray(k).get("" + i) as FormGroup).get("id").value;
    const columnIndex = this.deletedColumnSecurityList.findIndex(x => x === deletedID);
    if (deletedID !== null && deletedID !== "" && columnIndex === -1) {
      this.deletedColumnSecurityList.push(deletedID);
    }
    this.getColumnPermissionsFormArray(k).removeAt(i);
    this.selectedGroupNames.splice(i);
    this.taskboardPermissionsForm.markAsDirty();
  }
  removePermission(i) {
    this.taskboardSecurityList = this.taskboardPermissionsForm.get('securityList').value;
    this.getAccessToCreatePermission();
    if (this.getPermissionsFormArray().valid && this.getAccessToCreatePermission() === true) {
      this.getColumnPermissionsArray().clear();
      this.getColumnPermissionsArray().push(this.columnForm());
      if (this.isLoadColumn == false) {
        if (this.taskboardSecurityList !== null && this.taskboardSecurityList !== undefined && this.taskboardSecurityList.length > 0) {
          this.setColumnSecurityList(this.taskboardSecurityList);
        }
      } else {
        for (let i = 0; i < this.taskboardSecurityList.length; i++) {
          for (let j = 0; j < this.taskboardSecurityColumnsList.length; j++) {
            if (this.taskboardSecurityList[i].id === null) {
              this.taskboardSecurityColumnsList[j].columnPermissions.push(this.taskboardSecurityList[i])
            }
          }
        }
        this.setLoadedColumnSecurityList(this.taskboardSecurityColumnsList);
      }
      this.getColumnGroupNamesAutoCompleteList("0", "0");
    }

    this.userGroupExist = false;
    const deletedID = (this.getPermissionsFormArray().get("" + i) as FormGroup).get("id").value;
    const securityGroupId = (this.getPermissionsFormArray().get("" + i) as FormGroup).get("groupId").value;
    if (deletedID !== null && deletedID !== "") {
      this.deletedSecurityIdList.push(deletedID);
    }

    for (let i = 0; i < this.taskboardSecurityColumnsList.length; i++) {
      for (let j = 0; j < this.taskboardSecurityColumnsList[i].columnPermissions.length; j++) {
        const columnGroupId = this.taskboardSecurityColumnsList[i].columnPermissions[j].groupId;
        if (securityGroupId === columnGroupId) {
          this.deletedColumnSecurityList.push(this.taskboardSecurityColumnsList[i].columnPermissions[j].id);
          this.taskboardSecurityColumnsList[i].columnPermissions.splice(j)
        }
      }
    }
    this.getPermissionsFormArray().removeAt(i);
    this.selectedGroupNames.splice(i);
    this.taskboardPermissionsForm.markAsDirty();

  }


  setAllChecked($event, index: number) {
    this.taskboardPermissionsForm.markAsDirty();
    const group = this.getPermissionsFormArray().get("" + index) as FormGroup;
    if ($event.checked === true) {
      group.get("readAllowed").setValue(true);
      group.get("updateAllowed").setValue(true);
      group.get("deleteAllowed").setValue(true);
    } else {
      group.get("readAllowed").setValue(false);
      group.get("updateAllowed").setValue(false);
      group.get("deleteAllowed").setValue(false);
    }
  }

  unCheckColumnValue($event, i, k) {
    this.taskboardPermissionsForm.markAsDirty();
    const group = (this.getColumnPermissionsFormArray(k).get("" + i) as FormGroup);
    if ($event.checked === false) {
      group.get('allChecked').setValue(false);
    } else if (group.get('readAllowed').value &&
      group.get('deleteAllowed').value && group.get('updateAllowed').value) {
      group.get('allChecked').setValue(true);
    }
  }

  unCheckValue($event, index) {
    const group = this.getPermissionsFormArray().get("" + index) as FormGroup;
    this.taskboardPermissionsForm.markAsDirty();
    if ($event.checked === false) {
      group.get('allChecked').setValue(false);
    } else if (group.get('readAllowed').value &&
      group.get('deleteAllowed').value && group.get('updateAllowed').value) {
      group.get('allChecked').setValue(true);
    }
  }

  previous() {
    this.taskboardSecurityColumnsList = this.getColumnPermissionsArray().value;
  }

  save() {
    this.taskboardSecurityList = this.taskboardPermissionsForm.get('securityList').value;
    this.getAccessToCreatePermission();
    if (this.getPermissionsFormArray().valid && this.getAccessToCreatePermission() === true) {
      this.getColumnPermissionsArray().clear();
      this.getColumnPermissionsArray().push(this.columnForm());
      if (this.isLoadColumn == false) {
        if (this.taskboardSecurityList !== null && this.taskboardSecurityList !== undefined && this.taskboardSecurityList.length > 0) {
          this.setColumnSecurityList(this.taskboardSecurityList);
        }
      } else {
        for (let i = 0; i < this.taskboardSecurityList.length; i++) {
          for (let j = 0; j < this.taskboardSecurityColumnsList.length; j++) {
            const list=this.taskboardSecurityColumnsList[j].columnPermissions.filter(group => group.groupId === this.taskboardSecurityList[i].groupId)
            if (this.taskboardSecurityList[i].id === null  && list !== undefined && list.length===0 ) {
              this.taskboardSecurityColumnsList[j].columnPermissions.push(this.taskboardSecurityList[i])
            }
          }
        }

        this.setLoadedColumnSecurityList(this.taskboardSecurityColumnsList);
      }
      this.getColumnGroupNamesAutoCompleteList("0", "0");
      this.myStepper.next();
    }
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


  setSecurityList(list) {
    for (let i = 0; i < list.length; i++) {
      if (i > 0) {
        this.addPermission();
      }
      const group = (this.getPermissionsFormArray().get('' + i) as FormGroup);
      group.patchValue(list[i]);
      if (list[i].readAllowed === true && list[i].updateAllowed === true &&
        list[i].deleteAllowed === true) {
        group.get('allChecked').setValue(true);
      }
    }
    this.taskboardSecurityList = this.taskboardPermissionsForm.get('securityList').value;
  }

  setColumnSecurityList(securitylist) {
    for (let j = 0; j < this.taskboardColumns.length; j++) {
      if (j > 0) {
        this.getColumnPermissionsArray().push(this.columnForm());
      }
      this.getColumnPermissionsArray().get('' + j).get('columnId').setValue(this.taskboardColumns[j].id);
      for (let i = 0; i < securitylist.length; i++) {
        if (i > 0) {
          this.addColumnPermission(j);
        }
        const group = (this.getColumnPermissionsFormArray(j).get("" + i) as FormGroup);
        group.get('groupId').setValue(securitylist[i].groupId);
        group.get('readAllowed').setValue(securitylist[i].readAllowed);
        group.get('updateAllowed').setValue(securitylist[i].updateAllowed);
        group.get('deleteAllowed').setValue(securitylist[i].deleteAllowed);
        if (securitylist[i].readAllowed === true && securitylist[i].updateAllowed === true &&
          securitylist[i].deleteAllowed === true) {
          group.get('allChecked').setValue(true);
        }
      }
    }
  }

  setLoadedColumnSecurityList(securityColumnList) {
    for (let j = 0; j < this.taskboardColumns.length; j++) {
      if (j > 0) {
        this.getColumnPermissionsArray().push(this.columnForm());
      }
      this.getColumnPermissionsArray().get('' + j).get('columnId').setValue(this.taskboardColumns[j].id);
      for (let i = 0; i < securityColumnList[j].columnPermissions.length; i++) {
        if (i > 0) {
          this.addColumnPermission(j);
        }

        const group = (this.getColumnPermissionsFormArray(j).get("" + i) as FormGroup);
        group.get('id').setValue(securityColumnList[j].columnPermissions[i].id);
        group.get('groupId').setValue(securityColumnList[j].columnPermissions[i].groupId);
        group.get('readAllowed').setValue(securityColumnList[j].columnPermissions[i].readAllowed);
        group.get('updateAllowed').setValue(securityColumnList[j].columnPermissions[i].updateAllowed);
        group.get('deleteAllowed').setValue(securityColumnList[j].columnPermissions[i].deleteAllowed);
        if (securityColumnList[j].columnPermissions[i].readAllowed === true && securityColumnList[j].columnPermissions[i].updateAllowed === true &&
          securityColumnList[j].columnPermissions[i].deleteAllowed === true) {
          group.get('allChecked').setValue(true);
        }
      }
    }
  }
  getAccessToCreateColumnPermission() {
    let returnValue;
    for (let i = 0; i < this.taskboardSecurityVO.columnSecurityList.length; i++) {
      for (let j = 0; j < this.taskboardSecurityVO.columnSecurityList[i].columnPermissions.length; j++) {
        if (this.taskboardSecurityVO.columnSecurityList[i].columnPermissions[j].updateAllowed === false && this.taskboardSecurityVO.columnSecurityList[i].columnPermissions[j].deleteAllowed === false && this.taskboardSecurityVO.columnSecurityList[i].columnPermissions[j].readAllowed === false) {
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
    }
    return returnValue;
  }


  checkUser(event, name, a: number) {
    if (event.isUserInput) {
      for (let i = 0; i < this.taskboardOwnerList.length; i++) {
        const index = this.usersList.findIndex(users => users.userId === this.taskboardOwnerList[i]);
        const groupVOList = this.usersList[index].groupVOList;
        if (this.checkUserAssociated(groupVOList, name) === false) {
          this.userGroupExist = true;
          this.getPermissionsFormArray().get("" + a).get('groupId').setErrors({ userGroupExist: true })
        } else {
          this.userGroupExist = false;
          this.getPermissionsFormArray().get("" + a).get('groupId').setErrors(null);
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
          data: "Team is already associated with taskboard owner",
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

  saveClose() {
    this.submitted = true;
    this.taskboardSecurityVO = this.taskboardPermissionsForm.getRawValue();
    this.getAccessToCreateColumnPermission()
    if (this.data.securityType === 'task-security') {
      this.taskboardSecurityVO.deletedIDList = this.deletedSecurityIdList;
      this.taskboardSecurityVO.deletedColumnsIDList = this.deletedColumnSecurityList;
      if (this.getPermissionsFormArray().valid && this.getAccessToCreateColumnPermission() === true) {
        this.securityService.saveTaskboardSecurity(this.taskboardSecurityVO).subscribe(data => {
          if (data.response.includes('Successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            this.loadBoardUsers();
          }
        });
      }
    } else {
      if (this.getColumnPermissionsArray().valid) {
        this.taskboardSecurityVO.deletedColumnsIDList = this.deletedColumnSecurityList;
        this.securityService.saveTaskboardColumnSecurity(this.taskboardSecurityVO).subscribe(data => {
          if (data.response.includes('Successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            this.dialogRef.close();
          }
        });
      }
    }
  }
  resetForm(userForm: NgForm) {
    userForm.resetForm();
    this.ngOnInit();
    this.allCheckBoxControl = {};
    this.selectedGroupNames = [];
  }

  cancel() {
    this.dialogRef.close();
  }

  getLaunchPermission() {
    this.launchData = false;
    this.launchTaskboardService.getLaunchPermission(this.data.id).subscribe(data => {
      if (data) {
        this.launchData = true;
        this.launchPermissionVo = data;
      }
    });
  }

  launchPermission() {
    const dialog = this.dialog.open(LaunchTaskboardDialogComponent, {
      disableClose: false,
      width: '400px',
      data: {
        usersList: this.usersList,
        groupList: this.data.groupList,
        taskboardId: this.data.id,
        launchPermissionVo: this.launchPermissionVo
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === true) {
        this.getLaunchPermission();
      }
    });
  }

}
