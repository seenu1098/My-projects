import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AssignGroupTaskVO, AssignTaskVO, AssignUserTaskVO, GroupVO, TaskboardTaskVO, UserVO } from '../taskboard-form-details/taskboard-task-vo';


@Component({
  selector: 'app-assigntask-dialog',
  templateUrl: './assigntask-dialog.component.html',
  styleUrls: ['./assigntask-dialog.component.scss']
})
export class AssigntaskDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<AssigntaskDialogComponent>,
    private dialog: MatDialog, private fb: FormBuilder) { }
  removable = true;
  selectable = true;
  usersList: UserVO[] = [];
  groupList: GroupVO[] = [];
  taskboardTaskVO = new TaskboardTaskVO();
  form: FormGroup;
  isDisable: boolean = false;
  userName: string;
  public config: PerfectScrollbarConfigInterface = {};

  ngOnInit(): void {
    this.form = this.fb.group({
      searchUser: [],
    });
    this.formValueChanges();
    this.groupList = this.data.groupList;
    this.usersList = this.data.usersList;
    this.taskboardTaskVO = this.data.taskVO;
    for (let i = 0; i < this.usersList.length; i++) {
      this.usersList[i].filter = true;
    }
    if (this.data.type === 'parentTask') {
      if (this.taskboardTaskVO.assignTaskVO !== undefined && this.taskboardTaskVO.assignTaskVO !== null && this.taskboardTaskVO.assignTaskVO.taskId) {
        if (this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList.length > 0) {
          for (let i = 0; i < this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList.length; i++) {
            for (let j = 0; j < this.usersList.length; j++) {
              if (this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList[i].assigneeUser === this.usersList[j].userId) {
                this.usersList[j].isSelected = true;
              }
            }
          }
        } else {
          for (let j = 0; j < this.usersList.length; j++) {
            this.usersList[j].isSelected = false;
          }
        }
        if (this.taskboardTaskVO.assignTaskVO.assigneeGroupTaskList) {
          for (let i = 0; i < this.taskboardTaskVO.assignTaskVO.assigneeGroupTaskList.length; i++) {
            for (let j = 0; j < this.groupList.length; j++) {
              if (this.taskboardTaskVO.assignTaskVO.assigneeGroupTaskList[i].assigneeGroup === this.groupList[j].groupId) {
                this.groupList[j].isSelected = true;
              }
            }
          }
        } else {
          for (let j = 0; j < this.groupList.length; j++) {
            this.groupList[j].isSelected = false;
          }
        }
      } else {
        for (let j = 0; j < this.usersList.length; j++) {
          this.usersList[j].isSelected = false;
        }
        for (let j = 0; j < this.groupList.length; j++) {
          this.groupList[j].isSelected = false;
        }
      }
    } else {
      if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO !== undefined && this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO !== null) {
        if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList.length > 0) {
          for (let i = 0; i < this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList.length; i++) {
            for (let j = 0; j < this.usersList.length; j++) {
              if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList[i].assigneeUser === this.usersList[j].userId) {
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
        for (let j = 0; j < this.groupList.length; j++) {
          this.groupList[j].isSelected = false;
        }
      }
    }
  }

  formValueChanges() {
    this.form.get('searchUser').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.usersList.length; i++) {
          const searchData = data.toLowerCase();
          const firstName = this.usersList[i].firstName.toLowerCase();
          const lastName = this.usersList[i].lastName.toLowerCase();
          if (firstName.includes(searchData) || lastName.includes(searchData)) {
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

  setUserProfilename(user: UserVO): string {
    return user.firstName.charAt(0).toUpperCase();
  }


  selectAssigneeUser(user: UserVO, i: number): void {
    if (user.isSelected === undefined) {
      user.isSelected = false;
    }
    if (this.data.type === 'parentTask') {
      if (user.isSelected === false) {
        user.isSelected = true;
        if (this.taskboardTaskVO.assignTaskVO !== undefined && this.taskboardTaskVO.assignTaskVO !== undefined && this.taskboardTaskVO.assignTaskVO !== null && this.taskboardTaskVO.assignTaskVO.taskId) {
          if (this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList.length > 0) {
            if (!this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList.some(users => users.assigneeUser === user.userId)) {
              let array = {
                'id': null,
                'assigneeUser': user.userId,
              }
              this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList.push(array);
            }
          } else {
            let array = {
              'id': null,
              'assigneeUser': user.userId,
            }
            this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList.push(array);
          }
        }
      } else {
        user.isSelected = false;
      }
    } else {
      if (user.isSelected === false) {
        user.isSelected = true;
        if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO !== undefined && this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO !== null && this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.taskId) {
          if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList.length > 0) {
            if (!this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList.some(users => users.assigneeUser === user.userId)) {
              let array = {
                'id': null,
                'assigneeUser': user.userId,
              }
              this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList.push(array);
            }
          } else {
            let array = {
              'id': null,
              'assigneeUser': user.userId,
            }
            this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList.push(array);
          }
        }
      } else {
        user.isSelected = false;
      }
    }
    this.form.get('searchUser').setValue('');
  }

  dialogClose() {
    for (let j = 0; j < this.usersList.length; j++) {
      this.usersList[j].isSelected = false;
    }
    for (let j = 0; j < this.groupList.length; j++) {
      this.groupList[j].isSelected = false;
    }
    this.dialogRef.close();
  }

  close() {
    this.isDisable = true;
    if (this.data.type === 'parentTask') {
      if (this.taskboardTaskVO.assignTaskVO !== undefined && this.taskboardTaskVO.assignTaskVO !== null && this.taskboardTaskVO.assignTaskVO.taskId) {
        if (this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList) {
          const userList = JSON.parse(JSON.stringify(this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList));
          for (let i = 0; i < userList.length; i++) {
            if (userList[i] && userList[i].assigneeUser !== undefined) {
              for (let j = 0; j < this.usersList.length; j++) {
                if (userList[i] && userList[i].assigneeUser === this.usersList[j].userId) {
                  if (this.usersList[j].isSelected === false) {
                    if (userList[i].id) {
                      if (this.taskboardTaskVO.assignTaskVO.removedAssigneeList === undefined || this.taskboardTaskVO.assignTaskVO.removedAssigneeList === null) {
                        this.taskboardTaskVO.assignTaskVO.removedAssigneeList = [];
                      }
                      this.taskboardTaskVO.assignTaskVO.removedAssigneeList.push(userList[i].id);
                      const index = this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList.findIndex(t => t.assigneeUser === userList[i].assigneeUser);
                      this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList.splice(index, 1);
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        if (this.taskboardTaskVO.assignTaskVO === undefined || this.taskboardTaskVO.assignTaskVO === null) {
          const assignTaskVO = {
            taskId: '',
            assigneeUserTaskList: [],
            assigneeGroupTaskList: [],
            removedAssigneeList: [],
            taskboardId: null,
            isUnAssignedUser: null,
            assignedUserIdList: null,
            taskboardLabelIdList: null,
            isNoLabel: null,
            searchByTaskId: null,
            taskboardPriorityList: null,
            isNoPriority: null,
            // groupBy: null,
            // id: null,
            // index: 0,
            // columnName: null,
            // assigneeIndex: 0,
            filterType:null,
            startDate:null,
            endDate:null,
            filterBy:null,
          };
          assignTaskVO.taskId = this.taskboardTaskVO.id;
          this.taskboardTaskVO.assignTaskVO = assignTaskVO;
        }
        this.usersList.forEach(user => {
          if (user.isSelected === true) {
            let array = {
              'id': null,
              'assigneeUser': user.userId,
            }
            this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList.push(array);
          } else {
            const userList = this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList;
            for (let i = 0; i < userList.length; i++) {
              if (userList[i] && user.userId === userList[i].assigneeUser) {
                if (userList[i].id) {
                  if (this.taskboardTaskVO.assignTaskVO.removedAssigneeList === undefined || this.taskboardTaskVO.assignTaskVO.removedAssigneeList === null) {
                    this.taskboardTaskVO.assignTaskVO.removedAssigneeList = [];
                  }
                  this.taskboardTaskVO.assignTaskVO.removedAssigneeList.push(userList[i].id);
                }
                this.taskboardTaskVO.assignTaskVO.assigneeUserTaskList.splice(i, 1);
              }
            }
          }
        });
      }
      if (this.data.taskIndex !== -1) {
        this.data.taskList[this.data.taskIndex].assignTaskVO = this.taskboardTaskVO.assignTaskVO;
      }
    } else {
      if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO !== undefined && this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO !== null && this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.taskId) {
        if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList) {
          const userList = JSON.parse(JSON.stringify(this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList));
          for (let i = 0; i < userList.length; i++) {
            if (userList[i] && userList[i].assigneeUser !== undefined) {
              for (let j = 0; j < this.usersList.length; j++) {
                if (userList[i] && userList[i].assigneeUser === this.usersList[j].userId) {
                  if (this.usersList[j].isSelected === false) {
                    if (userList[i].id) {
                      if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.removedAssigneeList === null ||
                        this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.removedAssigneeList === null) {
                        this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.removedAssigneeList = [];
                      }
                      this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.removedAssigneeList.push(userList[i].id);
                      const index = this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList.findIndex(t => t.assigneeUser === userList[i].assigneeUser);
                      this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList.splice(index, 1);
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO === undefined || this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO === null) {
          const assignTaskVO = {
            taskId: '',
            assigneeUserTaskList: [],
            assigneeGroupTaskList: [],
            removedAssigneeList: [],
            taskboardId: null,
            isUnAssignedUser: null,
            assignedUserIdList: null,
            taskboardLabelIdList: null,
            isNoLabel: null,
            searchByTaskId: null,
            taskboardPriorityList: null,
            isNoPriority: null,
            // groupBy: null,
            // id: null,
            // index: 0,
            // columnName: null,
            // assigneeIndex: 0,
            filterType:null,
            startDate:null,
            endDate:null,
            filterBy:null,
          };
          assignTaskVO.taskId = this.taskboardTaskVO.id;
          this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO = assignTaskVO;
        }
        this.usersList.forEach(user => {
          if (user.isSelected === true) {
            let array = {
              'id': null,
              'assigneeUser': user.userId,
            }
            this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList.push(array);
          } else {
            if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO !== undefined && this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO !== null) {
              const userList = this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList;
              for (let i = 0; i < userList.length; i++) {
                if (userList[i] && user.userId === userList[i].assigneeUser) {
                  if (userList[i].id) {
                    if (this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.removedAssigneeList === undefined ||
                      this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.removedAssigneeList === null) {
                      this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.removedAssigneeList = [];
                    }
                    this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.removedAssigneeList.push(userList[i].id);
                  }
                  this.taskboardTaskVO.subTasks[this.data.i].assignTaskVO.assigneeUserTaskList.splice(i, 1);
                }
              }
            }
          }
        });
      }
    }
    this.dialogRef.close({ taskVO: this.taskboardTaskVO, type: this.data.type });
  }
}
