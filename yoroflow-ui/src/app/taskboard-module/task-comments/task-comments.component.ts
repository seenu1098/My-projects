import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';
import { NestedCommentsVO, TaskboardTaskVO, TaskCommentsVO, UserVO } from '../taskboard-form-details/taskboard-task-vo';

@Component({
  selector: 'app-task-comments',
  templateUrl: './task-comments.component.html',
  styleUrls: ['./task-comments.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(-90deg)' })),
      state('expanded', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class TaskCommentsComponent implements OnInit {

  @Input() comments: any;
  @Input() taskBoardTaskVO: TaskboardTaskVO;
  @Input() usersList: UserVO[] = [];
  @Input() index: number;
  @Input() loggedInUser: UserVO;
  @Input() taskList: TaskboardTaskVO[] = [];
  @Input() users: UserVO[] = [];
  @Input() isArchived: boolean;

  constructor(private taskboardService: TaskBoardService, private dialog: MatDialog) {
    if (this.index === undefined) {
      this.index = 0;
    }
  }

  left: string;
  contentLeft: string;
  spinner: any;

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
    this.getRandomColor();
  }

  userHighlight(): void {
    const name = this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName;
    const stringValue = 'data-id="' + this.loggedInUser.userId + '" data-value="' + name + '">﻿<span contenteditable="false"';
    var comment: string;
    if (this.comments.comments) {
      comment = this.comments.comments;
    } else {
      comment = this.comments.nestedComment;
    }
    if (comment.includes(stringValue)) {
      var re = new RegExp(stringValue);
      var message = comment.replace(re, 'data-id="' + this.loggedInUser.userId + '" data-value="' + name + '">﻿<span class="mention1"');
      if (this.comments.comments) {
        this.comments.comments = message;
      } else {
        this.comments.nestedComment = message;
      }
    }
  }

  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }

  replyComment(comment: any): void {
    this.handleEditAndReply(this.taskBoardTaskVO.taskComments);
    comment.isReply = true;
  }

  setUpdateMessage(event: any, comment: any): void {
    if (event.message !== undefined && event.message !== null && event.message !== '') {
      comment.isEdit = false;
      const commentClone = JSON.parse(JSON.stringify(comment));
      if (comment.comments) {
        comment.comments = event.message;
      } else {
        comment.nestedComment = event.message;
      }
      comment.modifiedOn = new Date();
      const taskcomments = new TaskCommentsVO();
      taskcomments.id = comment.id;
      taskcomments.parentCommentId = comment.parentCommentId;
      taskcomments.taskId = this.taskBoardTaskVO.id;
      taskcomments.comments = event.message;
      taskcomments.createdOn = comment.createdOn;
      taskcomments.modifiedOn = new Date();
      taskcomments.createdBy = this.taskBoardTaskVO.loggedInUserName;
      taskcomments.mentionedUsersEmail = event.contactMails;
      taskcomments.mentionedUsersId = event.usersId;
      this.userHighlight();
      this.taskboardService.saveComments(taskcomments).subscribe(data => {
        if (data) {
        }
      }, error => {
        comment = commentClone;
      });
    }
  }

  setReplyMessage(event: any, comment: any): void {
    if (event.message !== undefined && event.message !== null && event.message !== '') {
      comment.isReply = false;
      const nestedComments = new NestedCommentsVO();
      nestedComments.parentCommentId = comment.id;
      nestedComments.nestedComment = event.message;
      nestedComments.createdBy = this.taskBoardTaskVO.loggedInUserName;
      nestedComments.id = null;
      nestedComments.createdOn = new Date();
      nestedComments.modifiedOn = new Date();
      nestedComments.openComment = false;
      comment.openComment = false;
      if (comment.nestedComments === undefined || comment.nestedComments === null) {
        comment.nestedComments = [];
      }
      comment.nestedComments.push(nestedComments);
      const taskcomments = new TaskCommentsVO();
      taskcomments.id = null;
      taskcomments.parentCommentId = comment.id;
      taskcomments.taskId = this.taskBoardTaskVO.id;
      taskcomments.comments = event.message;
      taskcomments.createdOn = new Date();
      taskcomments.modifiedOn = new Date();
      taskcomments.createdBy = this.taskBoardTaskVO.loggedInUserName;
      taskcomments.isReply = false;
      taskcomments.mentionedUsersEmail = event.contactMails;
      taskcomments.mentionedUsersId = event.usersId;
      this.userHighlight();
      if (this.taskBoardTaskVO.id) {
        this.taskBoardTaskVO.commentsLength = this.taskBoardTaskVO.commentsLength + 1;
        this.taskboardService.saveComments(taskcomments).subscribe(data => {
          if (data) {
            comment.nestedComments[comment.nestedComments.length - 1].id = data.uuid;
            const index = this.taskList.findIndex(task => task.id === this.taskBoardTaskVO.id);
            this.taskList[index] = this.taskBoardTaskVO;
          }
        }, error => {
          comment.nestedComments.splice(comment.nestedComments.length - 1, 1);
        });
      }
    }
  }

  getRandomColor(): void {
    var letters = 'BCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    this.comments.color = color;
  }

  checkLoggedInUser(commments: any): boolean {
    let value: boolean;
    if (commments && commments.createdBy === this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName) {
      value = true;
    } else {
      value = false;
    }
    return value;
  }

  editMessage(comments: any): void {
    this.handleEditAndReply(this.taskBoardTaskVO.taskComments);
    comments.isEdit = true;
  }

  handleEditAndReply(comments: any): void {
    comments.forEach(comment => {
      if (comment.nestedComments) {
        this.handleEditAndReply(comment.nestedComments);
      }
      comment.isEdit = false;
      comment.isReply = false;
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
