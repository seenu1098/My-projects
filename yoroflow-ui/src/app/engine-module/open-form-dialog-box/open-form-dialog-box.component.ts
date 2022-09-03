import { Component, OnInit, Inject, ViewChild, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { TaskNotes } from './task-notes-vo';
import { UserVO } from '../shared/vo/user-vo';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MyTaskService } from '../../mytasks-module/mytasks/my-task.service';
import { UserService } from '../shared/service/user-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import * as moment from 'moment';
import { MediaMatcher } from '@angular/cdk/layout';
import { DialogEmitterService } from 'src/app/shared-module/dialog-emitter.service';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { OpenFormDialogService } from './open-form.service';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { TranslateService } from '@ngx-translate/core';
import { Paginator } from 'src/app/shared-module/paginator/paginatorVO';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-open-form-dialog-box',
  templateUrl: './open-form-dialog-box.component.html',
  styleUrls: ['./open-form-dialog-box.component.scss']
})
export class OpenFormDialogBoxComponent implements OnInit {
  selectedCategory: string = 'Form';
  isMobile: any;
  activities:any;
  workflowId:string;
  selectedLang: any;
  length: any;
  usersList: UserVO[] = [];
  sortb: boolean =false;
  groupList: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private taskService: MyTaskService, private fb: FormBuilder, private dialog: MatDialog
    , private dialogRef: MatDialogRef<OpenFormDialogBoxComponent>,
    private userService: UserService, private snackbar: MatSnackBar, media: MediaMatcher, private dialogEmitterService: DialogEmitterService,public activity:OpenFormDialogService,public translate: TranslateService, public taskboardService: TaskBoardService, ) {
    this.mobileQuery = media.matchMedia("(max-width: 600px)");
    this.ipadResolution = media.matchMedia("(max-width: 768px)");
    this.ipadProResolution = media.matchMedia("(max-width: 1024px)");
    this.isMobile = media.matchMedia("only screen and (max-width: 600px)");
    this.workflowId=data.workflowId
  }
  yoroflowVO: any;
  paginationVO = new PaginationVO();
  show = false;
  pageRendered = false;
  showButton = false;
  taskNotesVOList: TaskNotes[] = [];
  userVO: UserVO;
  form: FormGroup;
  today = new Date();
  isDraft: string;
  @ViewChild('sidenav') sidenave: any;
  mobileQuery: MediaQueryList;
  ipadResolution: MediaQueryList;
  ipadProResolution: MediaQueryList;
  showProgessBar = false;
  categoriesArray: any[] = [
    { name: 'Form', icon: 'assignment', isSelected: true, color: 'blue' },
    { name: 'Comments', icon: 'comment', isSelected: false, color: 'red' },
    { name: 'Activity log', icon: 'timer', isSelected: false, color: 'black' },

  ];
  open: boolean = false;
  userList: UserVO[] = [];
  spinnerDialog: any;
  isUsers: boolean = false;
  @Output() buttonEmitter: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit(): void {
    const pagination = new PaginationVO();
    pagination.index = 0;
    pagination.size = 10;
    pagination.direction = 'desc';
    pagination.columnName = 'createdOn';
    this.paginationVO = pagination;
this.getActivity();
this.taskboardService.getUserGroupList().subscribe(group => {
  this.groupList = group;
  this.activity.groupList=group;
  
});

    this.dialogEmitterService.dialogEmitter.subscribe(data => {
      if (data) {
        this.dialogRef.close();
      }
    });
    this.selectedLang = localStorage.getItem('translate_lang');
    if (this.selectedLang === undefined || this.selectedLang === null || this.selectedLang === 'null' || this.selectedLang === '') {
      this.selectedLang = 'en';
      this.activity.selectedLang=this.selectedLang;
    }

    this.spinnerDialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' }
    });
    this.getLoggedInUser();
    if (this.data) {
      this.yoroflowVO = this.data;
      this.getTaskNotesList(this.yoroflowVO.workflowTaskId);
      this.getLoggedInUser();
      this.show = true;
      if (this.yoroflowVO.status === 'COMPLETED') {
        this.showButton = true;
      }
    }
    this.form = this.fb.group({
      comment: ['']
    });
    this.taskService.getUsersList().subscribe(data => {
      this.userList = data;
      this.activity.usersList=data;
      this.isUsers = true;
    });
  }
  userProfileValue(str): string {
    if (str) {
      const assignee = str.split(' ');
      for (let i = 0; i < assignee.length; i++) {
        assignee[i] = assignee[i].charAt(0).toUpperCase();
      }
      return assignee.join('');
    }
  }

  getDataDiff(date: string) {
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date();
      const diff = endDate.getTime() - startDate.getTime();
      const days = Math.floor(diff / (60 * 60 * 24 * 1000));
      const hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
      const minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
      const seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
      if (days !== 0) {
        if (days === 1) {
          return days + this.translate.translations[this.selectedLang][' day ago'];
        } else {
          return days + this.translate.translations[this.selectedLang][' days ago'];
        }
      } else if (hours !== 0) {
        if (hours === 1) {
          return hours + this.translate.translations[this.selectedLang][' hour ago'];
        } else {
          return hours + this.translate.translations[this.selectedLang][' hours ago'];
        }
      } else if (minutes !== 0) {
        if (minutes === 1) {
          return minutes + this.translate.translations[this.selectedLang][' minute ago'];
        } else {
          return minutes + this.translate.translations[this.selectedLang][' minutes ago'];
        }
      } else if (seconds !== 0) {
        if (seconds === 1) {
          return seconds + this.translate.translations[this.selectedLang][' second ago'];
        } else {
          return seconds + this.translate.translations[this.selectedLang][' seconds ago'];
        }
      }
    } else {
      return this.translate.translations[this.selectedLang][' 0 day ago'];
    }
  }

  showProgressbar(event) {
    if (event === true) {
      this.showProgessBar = true;
    }
    if (event === false) {
      this.showProgessBar = false;
    }
  }
  getActivity(){
    this.activity.getActivitylog(this.paginationVO,this.workflowId).subscribe(res=>{
      this.activities=res.workflowActivityLogVoList;
      this.length=res.totalCount
    })
   }
   pageEvent(paginator: Paginator): void {
    const pagination = new PaginationVO();
    pagination.index = paginator.index;
    pagination.size = paginator.pageSize;
    pagination.direction = this.paginationVO.direction;
    pagination.columnName = this.paginationVO.columnName;
    this.paginationVO = pagination;
    this.getActivity();
  }

  openComments() {
    this.sidenave.toggle();
  }

  keyEnter(event) {
    const control = this.form.get('comment');
    if (event.keyCode && event.keyCode === 13 && control.value.length !== 1) {
      this.taskNotesVOList.unshift(this.buildTaskNotesVO(control.value, this.yoroflowVO.workflowTaskId));
      // this.saveTaskNotes();
    } else {
      this.form.get('comment').setValue(null);
    }
  }
  sort(){
    if(this.sortb===true){
      const pagination = new PaginationVO();
      pagination.index = 0;
      pagination.size = 10;
      pagination.direction = 'asc';
      pagination.columnName = 'createdOn';
      this.paginationVO = pagination;
  this.getActivity();
this.sortb=false;
    }else{
      const pagination = new PaginationVO();
      pagination.index = 0;
      pagination.size = 10;
      pagination.direction = 'desc';
      pagination.columnName = 'createdOn';
      this.paginationVO = pagination;
  this.getActivity();
  this.sortb=true;
    }
  }
  addComment(event: any): void {
    const control = this.form.get('comment');
    // if (control.value !== null && control.value !== '' && control.value !== '↵' && this.form.valid) {
    // this.taskNotesVOList.unshift(this.buildTaskNotesVO(comment, this.yoroflowVO.workflowTaskId));
    const workflowComments = new TaskNotes();
    workflowComments.taskNotesAttId = null;
    workflowComments.parentNotesId = null;
    workflowComments.notes = event.message;
    workflowComments.creationTime = new Date();
    workflowComments.modifiedOn = new Date();
    workflowComments.userName = this.userVO.firstName + ' ' + this.userVO.lastName;
    workflowComments.processInstanceTaskId = this.yoroflowVO.workflowTaskId;
    workflowComments.addedBy = this.userVO.userId;
    workflowComments.mentionedUsersEmail = event.contactMails;
    workflowComments.mentionedUsersId = event.usersId;
    this.taskNotesVOList.push(workflowComments);
    this.saveTaskNotes(workflowComments);
    // }
  }

  saveTaskNotes(workflowComments: TaskNotes) {
    const control = this.form.get('comment');
    // this.taskService.saveTaskNotes(this.taskNotesVOList).subscribe(data => {
    this.taskService.saveComments(workflowComments).subscribe(data => {
      this.getTaskNotesList(this.yoroflowVO.workflowTaskId);
      this.form.get('comment').setValue('');
    }, error => {
      this.taskNotesVOList.splice(this.taskNotesVOList.length - 1, 1);
    });
  }

  buildTaskNotesVO(value, instanceTaskId) {
    const taskNotes = new TaskNotes();
    taskNotes.notes = value;
    taskNotes.addedBy = this.userVO.userId;
    taskNotes.userName = this.userVO.firstName + ' ' + this.userVO.lastName
    taskNotes.creationTime = this.today;
    taskNotes.taskNotesAttId = null;
    taskNotes.processInstanceTaskId = instanceTaskId;
    taskNotes.openComment = false;
    taskNotes.isEdit = false;
    taskNotes.isReply = false;
    taskNotes.taskNotes = [];
    // return {
    //   notes: value, addedBy: this.userVO.userId, userName: this.userVO.firstName + ' ' + this.userVO.lastName,
    //   creationTime: this.today, taskNotesAttId: null, processInstanceTaskId: instanceTaskId, openComment: false,
    //   isEdit: false, taskNotes: [], parentNotesId: '', isReply:
    // };
    return taskNotes;
  }

  getLoggedInUser() {
    this.userService.getLoggedInUserDetails().subscribe(data => {
      this.userVO = data;
    });
  }
  getTaskNotesList(instanceTaskId) {
    if (instanceTaskId !== undefined) {
      // this.taskService.getTaskNotesList(instanceTaskId).subscribe(data => {
      //   this.taskNotesVOList = data;
      // });
      this.taskService.getTaskNotes(instanceTaskId).subscribe(data => {
        this.taskNotesVOList = data;
      });
    }
  }

  userProfile(str) {
    const assignee = str.split(' ');
    for (let i = 0; i < assignee.length; i++) {
      assignee[i] = assignee[i].charAt(0).toUpperCase();
    }
    return assignee.join('');
  }

  isPageRendered($event) {
    if ($event === true) {
      this.pageRendered = true;
      this.spinnerDialog.close();
    }
  }

  dialogClose($event) {
    if ($event === true) {
      this.dialogRef.close();
      this.spinnerDialog.close();
    }
  }

  saveTaskNOtesFromSEndBack($event) {
    this.taskNotesVOList.unshift(this.buildTaskNotesVO($event.sendBackComments, $event.instanceTaskId));
    this.taskService.saveTaskNotes(this.taskNotesVOList).subscribe(data => {
      if (data) {
        this.dialogRef.close(true);
      }
    });
  }

  submit($event) {
    this.isDraft = $event;
    if ($event.instanceTaskId && $event.sendBackComments) {
      this.taskService.getTaskNotesListForSendBack(this.yoroflowVO.workflowTaskId, $event.instanceTaskId).subscribe(data => {
        if (data) {
          this.taskNotesVOList = data;
        }
        this.saveTaskNOtesFromSEndBack($event);
      });
    }
    if ($event.status && $event.status === 'LAUNCH' && !$event.sendBackComments) {
      this.dialogRef.close($event);
    } else if ($event !== false && $event !== 'savePageAsDraft' && !$event.sendBackComments) {
      this.dialogRef.close(true);
    }
    if ($event.value === true) {
      this.dialogRef.close('isCancelWorkflow');
    }
  }

  onNoClick() {
    if (this.isDraft === 'savePageAsDraft') {
      this.dialogRef.close(true);
    } else {
      this.dialogRef.close(false);
    }
  }

  getBrowsertime(utcTime) {
    if (utcTime !== undefined && utcTime !== null && utcTime !== '' && (new Date(utcTime).toString() !== 'Invalid Date')) {
      return moment.utc(utcTime).toDate();
    } else {
      return utcTime;
    }
  }

  expandOrCollapse(value: string): void {
    if (value === 'open') {
      this.open = true;
    } else {
      this.open = false;
    }
  }

  onCategorySelected(category: any): void {
    this.categoriesArray.forEach(category => category.isSelected = false);
    category.isSelected = true;
    this.selectedCategory = category.name;
  }

  buttonEmit(value: string): void {
    this.buttonEmitter.emit(value);
  }


}
