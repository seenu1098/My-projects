import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskNotes } from './task-notes-vo';
import { UserVO } from '../../engine-module/shared/vo/user-vo';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MyTaskService } from '../../mytasks-module/mytasks/my-task.service';
import { UserService } from '../../engine-module/shared/service/user-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import * as moment from 'moment';
import { MediaMatcher } from '@angular/cdk/layout';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-open-form-dialog-box',
  templateUrl: './open-form-dialog-box.component.html',
  styleUrls: ['./open-form-dialog-box.component.scss']
})
export class OpenFormDialogBoxComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private taskService: MyTaskService, private fb: FormBuilder
    , private dialogRef: MatDialogRef<OpenFormDialogBoxComponent>,
    private userService: UserService, private snackbar: MatSnackBar, media: MediaMatcher) {
      this.mobileQuery = media.matchMedia("(max-width: 600px)");
      this.ipadResolution = media.matchMedia("(max-width: 768px)");
      this.ipadProResolution = media.matchMedia("(max-width: 1024px)");

  }
  yoroflowVO: any;
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
  ngOnInit() {
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
  }

  showProgressbar(event) {
    if (event === true) {
      this.showProgessBar = true;
    }
    if (event === false) {
      this.showProgessBar = false;
    }
  }

  openComments() {
    this.sidenave.toggle();
  }

  keyEnter(event) {
    const control = this.form.get('comment');
    if (event.keyCode && event.keyCode === 13 && control.value.length !== 1) {
      this.taskNotesVOList.unshift(this.buildTaskNotesVO(control.value, this.yoroflowVO.workflowTaskId));
      this.saveTaskNotes();
    } else {
      this.form.get('comment').setValue(null);
    }
  }

  addComment() {
    const control = this.form.get('comment');
    if (control.value !== null && control.value !== '' && control.value !== '↵' && this.form.valid) {
      this.taskNotesVOList.unshift(this.buildTaskNotesVO(control.value, this.yoroflowVO.workflowTaskId));
      this.saveTaskNotes();
    }
  }

  saveTaskNotes() {
    const control = this.form.get('comment');
    this.taskService.saveTaskNotes(this.taskNotesVOList).subscribe(data => {
      this.getTaskNotesList(this.yoroflowVO.workflowTaskId);
      this.form.get('comment').setValue('');
    });
  }

  buildTaskNotesVO(value, instanceTaskId) {
    return {
      notes: value, addedBy: this.userVO.userId, userName: this.userVO.firstName + ' ' + this.userVO.lastName,
      creationTime: this.today, taskNotesAttId: null, processInstanceTaskId: instanceTaskId
    };
  }

  getLoggedInUser() {
    this.userService.getLoggedInUserDetails().subscribe(data => {
      this.userVO = data;
    });
  }
  getTaskNotesList(instanceTaskId) {
    if (instanceTaskId !== undefined) {
      this.taskService.getTaskNotesList(instanceTaskId).subscribe(data => {
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
    }
  }

  dialogClose($event) {
    if ($event === true) {
      this.dialogRef.close();
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

}
