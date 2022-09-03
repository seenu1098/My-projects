import { Component, HostListener, OnInit, ViewChild, Inject} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { YorogridComponent } from "../../shared-module/yorogrid/yorogrid.component";
import { YoroGroupsUserVO } from '../../engine-module/yoro-security/security-vo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupService } from '../../engine-module/group/group-service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { TaskBoardService } from '../../taskboard-module/taskboard-configuration/taskboard.service';
import { UserVO } from '../../taskboard-module/taskboard-form-details/taskboard-task-vo';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskboardOwnerDialogComponent } from "../../taskboard-module/taskboard-owner-dialog/taskboard-owner-dialog.component";

@Component({
  selector: 'app-user-group-association',
  templateUrl: './user-group-association.component.html',
  styleUrls: ['./user-group-association.component.scss']
})
export class UserGroupAssociationComponent implements OnInit {

  constructor(private taskboardservice: TaskBoardService, private fb: FormBuilder, private service: GroupService, private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UserGroupAssociationComponent>,
    private dialog: MatDialog) { }
  selectable = true;
  removable = true;
  terms: "";
  groupName: any;
  terms1: "";
  selectedUsers: any = [];
  groupList: any[];
  isSelect: boolean = false;
  selected_array: any = [];
  usersList: UserVO[] = [];
  show: boolean = false;
  form: FormGroup;
  userId: any[] = [];
  screenHeight: string;
  screenHeight1: string;
  show_selected: boolean = false;
  yoroGroupsUsers = new YoroGroupsUserVO();
  ismatch: boolean = false;
  show_done: boolean = false;
  checked: boolean;
  indeterminate: boolean;
  screenWidth: any;
  screenHeight2: any;
  user_id: any = [];
  OwnerList: any = [];
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc', '#cedada', '#A52A2A', '#c8ead3', '#cfffe5',];
  sample: boolean;
  enableCondition: boolean = false;
  myArray: any;
  @ViewChild('yoro_group_users', { static: true }) yoroGroupUsersGrid: YorogridComponent;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = (window.innerHeight - 95) + 'px';
    this.screenHeight1 = (window.innerHeight - 63) + 'px';
    this.screenWidth = (window.innerWidth - 264) + "px";
    this.screenHeight2 = (window.innerHeight - 375) + "px";
  }
  ngOnInit(): void {
    this.screenHeight2 = (window.innerHeight - 375) + "px";
    this.form = this.fb.group({
      id: [''],
      groupId: ['', [Validators.required]],
      searchUser: [],
      searchselected: []
    });
    this.formValueChanges();
    this.formValueChanges1();
    this.OwnerList = [];
    this.taskboardservice.getUsersList().subscribe((data) => {
      this.usersList = data;
      for (let i = 0; i < this.usersList.length; i++) {
        this.usersList[i].filter = true;
          for(let j=0; j < this.data.ownerList.length; j++){
            if(this.data.ownerList[j] === this.usersList[i].userId){
              this.OwnerList.push({
                firstName: this.usersList[i].firstName,
                lastName: this.usersList[i].lastName,
                id: this.usersList[i].userId
              })
            }
          }
      
      }
      
    });
    this.screenHeight = (window.innerHeight - 95) + 'px';
    this.screenHeight1 = (window.innerHeight - 63) + 'px';
    if(this.data.groupId){
      this.form.get('groupId').setValue(this.data.groupId);
      this.getGroupId(this.data.groupId);
    }
  }
  
  formValueChanges() {
    this.form.get('searchUser').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.myArray.length; i++) {
          const searchData = data.toLowerCase();
          const firstName = this.myArray[i].firstName.toLowerCase();
          const lastName = this.myArray[i].lastName.toLowerCase();
          if (firstName.includes(searchData) || lastName.includes(searchData)) {
            this.myArray[i].filter = true;
          } else {
            this.myArray[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.myArray.length; i++) {
          this.myArray[i].filter = true;
        }
      }
    });
  }
  formValueChanges1() {
    this.form.get('searchselected').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.selectedUsers.length; i++) {
          const searchData = data.toLowerCase();
          const firstName = this.selectedUsers[i].firstName.toLowerCase();
          const lastName = this.selectedUsers[i].lastName.toLowerCase();
          if (firstName.includes(searchData) || lastName.includes(searchData)) {
            this.selectedUsers[i].filter = true;
          } else {
            this.selectedUsers[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.selectedUsers.length; i++) {
          this.selectedUsers[i].filter = true;
        }
      }
    });
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
      let ownerId = []
      this.OwnerList.forEach(owner => {
        ownerId.push(owner.id);
      });
      this.yoroGroupsUsers.ownerId = ownerId;
      this.service.saveYoroGroupsUsers(this.yoroGroupsUsers).subscribe(data => {
        if(data.response.includes('successfully')){
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.dialogRef.close(true);
        }
        
      });
      this.enableCondition = false;
      this.show=false;
    }
  }

  setUserProfilename(user: UserVO): string {
    const firstName = user.firstName.charAt(0).toUpperCase();
    const lastName = user.lastName.charAt(0).toUpperCase();
    return firstName + lastName;
  }

  getGroupId(event) {
    this.show = false;
    this.enableCondition = false;
    this.groupName = event;
    this.show_selected = true;
    this.taskboardservice.getUsersList().subscribe((data) => {
      this.usersList = data;
    
    this.selectedUsers = [];
    this.service.getUserIdList(this.groupName).subscribe(dataa => {
      this.userId = dataa;
      if (this.userId.length !== 0) {
        for (let i = 0; i < this.usersList.length; i++) {
          for (let j = 0; j < this.userId.length; j++) {
            if (this.usersList[i].userId === this.userId[j]) {
              this.sample = true;
              this.selectedUsers.push(this.usersList[i]);
            }
          }
        }
      if(this.data.ownerList.length === 0){
        this.OwnerList = this.selectedUsers;
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
  });
  }
  reset(userForm) {
    this.show = false;
    this.selectedUsers = [];
    this.service.getUserIdList(this.groupName).subscribe(dataa => {
      this.userId = dataa;
      for (let i = 0; i < this.usersList.length; i++) {
        for (let j = 0; j < this.userId.length; j++) {
          if (this.usersList[i].userId === this.userId[j]) {
            this.sample = true;
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
      this.dialogRef.close(false);
    });
  }
  add(val, index) {
    if(this.data.access === true || this.data.access === undefined || this.data.access === null){
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
    }else{
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Only Owners can add or remove Users'
      });
    }
    
  }
  remove(val, index) {
    if(this.data.access === true || this.data.access === undefined || this.data.access === null){
    this.show = true;
    this.selectedUsers.forEach((element, index) => {
      if (element.userId == val.userId) this.selectedUsers.splice(index, 1);
    });
    this.myArray.unshift(val);
    for (let i = 0; i < this.myArray.length; i++) {
      this.myArray[i].filter = true;
    }
  }else{
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: 'Only Owners can add or remove Users'
    });
  }
  }
  openTaskOwnerDialog() {
          const dialog = this.dialog.open(TaskboardOwnerDialogComponent, {
            disableClose: true,
            width: '50%',
            data: {
              taskboardOwnerList: this.data.ownerList,
              usersList: this.selectedUsers,
              taskboardId: this.data.groupId,
              type: 'teams-owner'
            }
          });
          dialog.afterClosed().subscribe(data => {
            if (data) {
              this.OwnerList = [];
              for (let i = 0; i < this.usersList.length; i++) {
                this.usersList[i].filter = true;
                for(let j=0; j < data.ownerId.length; j++){
                  if(this.usersList[i].userId === data.ownerId[j]){
                    this.OwnerList.push({
                      firstName: this.usersList[i].firstName,
                      lastName: this.usersList[i].lastName,
                      id: this.usersList[i].userId
                    })
                  }
                }
              }
            }
          })
  }
  getUserFirstAndLastNamePrefix(task) {
    let name = "";
    let array = task.split(' ')
    if (array[0]) {
      name = array[0].charAt(0).toUpperCase()
    }
    return name;
  }
  setUserProfileName(user): string {
    return user.name.charAt(0).toUpperCase();
  }

  getRemainingAssigneeUserCount(teams: string[]) {
    return teams.length
  }
}
