import { Component, Input, OnInit } from '@angular/core';
import { MyTaskService } from 'src/app/mytasks-module/mytasks/my-task.service';
import { TaskNotes } from '../open-form-dialog-box/task-notes-vo';
import { UserVO } from '../shared/vo/user-vo';

@Component({
  selector: 'app-workflow-comments',
  templateUrl: './workflow-comments.component.html',
  styleUrls: ['./workflow-comments.component.scss']
})
export class WorkflowCommentsComponent implements OnInit {

  @Input() loggedInUser: UserVO;
  @Input() usersList: UserVO[] = [];
  @Input() index: number;
  @Input() users: UserVO[] = [];
  @Input() comments: any;
  @Input() taskId: string;
  @Input() status: string;
  @Input() taskNotesVOList: TaskNotes[] = [];

  constructor(private taskService: MyTaskService) {
    if (this.index === undefined) {
      this.index = 0;
    }
  }

  left: string;
  contentLeft: string;

  ngOnInit(): void {
    this.userHighlight();
    if (this.index === 0) {
      this.contentLeft = '50px';
    }
    if (this.index === 1) {
      this.left = '30px';
      this.contentLeft = (30 * 2 + 22) + 'px';
    } else if (this.index > 1) {
      this.left = 30 * this.index + 'px';
      this.contentLeft = (30 * (this.index + 1) + 22) + 'px';
    }
  }

  userHighlight(): void {
    const name = this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName;
    const stringValue = 'data-id="' + this.loggedInUser.userId + '" data-value="' + name + '">﻿<span contenteditable="false"';
    if (this.comments.notes.includes(stringValue)) {
      var re = new RegExp(stringValue);
      var comment = this.comments.notes;
      var message = comment.replace(re, 'data-id="' + this.loggedInUser.userId + '" data-value="' + name + '">﻿<span class="mention1"');
      this.comments.notes = message;
    }
  }

  replyComment(comment: TaskNotes): void {
    this.handleEditAndReply(this.taskNotesVOList);
    comment.isReply = true;
  }

  setUpdateMessage(event: any, comment: TaskNotes): void {
    if (event.message !== undefined && event.message !== null && event.message !== '') {
      comment.isEdit = false;
      const commentClone = JSON.parse(JSON.stringify(comment));
      if (comment.notes) {
        comment.notes = event.message;
      }
      const workflowComments = new TaskNotes();
      workflowComments.taskNotesAttId = comment.taskNotesAttId;
      workflowComments.parentNotesId = comment.parentNotesId;
      workflowComments.notes = event.message;
      workflowComments.creationTime = comment.creationTime;
      workflowComments.modifiedOn = new Date();
      workflowComments.userName = this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName;
      workflowComments.processInstanceTaskId = this.taskId;
      workflowComments.addedBy = this.loggedInUser.userId;
      workflowComments.mentionedUsersEmail = event.contactMails;
      workflowComments.mentionedUsersId = event.usersId;
      this.userHighlight();
      comment.modifiedOn = new Date();
      this.taskService.saveComments(workflowComments).subscribe(data => { }, error => {
        comment = commentClone;
      });
    }
  }

  setReplyMessage(event: any, comment: TaskNotes): void {
    if (event.message !== undefined && event.message !== null && event.message !== '') {
      comment.isReply = false;
      comment.isEdit = false;
      const workflowComments = new TaskNotes();
      workflowComments.taskNotesAttId = null;
      workflowComments.parentNotesId = comment.taskNotesAttId;
      workflowComments.notes = event.message;
      workflowComments.creationTime = new Date();
      workflowComments.modifiedOn = new Date();
      workflowComments.userName = this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName;
      workflowComments.processInstanceTaskId = this.taskId;
      workflowComments.addedBy = this.loggedInUser.userId;
      workflowComments.mentionedUsersEmail = event.contactMails;
      workflowComments.mentionedUsersId = event.usersId;
      if (comment.taskNotes === undefined || comment.taskNotes === null) {
        comment.taskNotes = [];
      }
      this.userHighlight();
      comment.taskNotes.push(workflowComments);
      this.taskService.saveComments(workflowComments).subscribe(data => {
        this.taskNotesVOList[0].taskNotesLength++;
        comment.taskNotes[comment.taskNotes.length - 1].taskNotesAttId = data.uuid;
      }, error => {
        comment.taskNotes.splice(comment.taskNotes.length - 1, 1);
      });
    }
  }

  checkLoggedInUser(commments: any): boolean {
    let value: boolean;
    if (commments && commments.userName === this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName) {
      value = true;
    } else {
      value = false;
    }
    return value;
  }

  editMessage(comments: any): void {
    this.handleEditAndReply(this.taskNotesVOList);
    comments.isEdit = true;
  }

  handleEditAndReply(taskNotesVOList: TaskNotes[]): void {
    taskNotesVOList.forEach(taskNotes => {
      if (taskNotes.taskNotes) {
        this.handleEditAndReply(taskNotes.taskNotes);
      }
      taskNotes.isEdit = false;
      taskNotes.isReply = false;
    });
  }

  getCommentsUserPrefix(createdBy: string): string {
    const user = this.usersList.find(user => user.firstName + ' ' + user.lastName === createdBy);
    if (user) {
      const firstName = user.firstName.charAt(0).toUpperCase();
      const lastName = user.lastName.charAt(0).toUpperCase();
      return firstName + lastName;
    } else {
      return '';
    }
  }

  closeQuill(comment: any): void {
    comment.isReply = false;
    comment.isEdit = false;
  }

  getDataDiff(date: string) {
    const startDate = new Date(date);
    const endDate = new Date();
    var diff = endDate.getTime() - startDate.getTime();
    var days = Math.floor(diff / (60 * 60 * 24 * 1000));
    var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
    var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
    var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
    if (days !== 0) {
      if (days === 1) {
        return days + ' day ago';
      } else {
        return days + ' days ago';
      }
    } else if (hours !== 0) {
      if (hours === 1) {
        return hours + ' hour ago';
      } else {
        return hours + ' hours ago';
      }
    } else if (minutes !== 0) {
      if (minutes === 1) {
        return minutes + ' minute ago';
      } else {
        return minutes + ' minutes ago';
      }
    } else if (seconds !== 0) {
      if (seconds === 1) {
        return seconds + ' second ago';
      } else {
        return seconds + ' seconds ago';
      }
    }
  }

  close(comments: any): void {
    if (comments.openComment === undefined || comments.openComment === null || comments.openComment === '') {
      comments.openComment = false;
    }
    if (comments.openComment && comments.openComment === true) {
      comments.openComment = false;
    } else {
      comments.openComment = true;
    }
  }


}
