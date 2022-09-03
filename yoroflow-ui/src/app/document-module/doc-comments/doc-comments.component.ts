import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NestedCommentsVO, TaskboardTaskVO, TaskCommentsVO, UserVO } from '../../taskboard-module/taskboard-form-details/taskboard-task-vo';
import { DocumentCommentComponent } from '../document-comment/document-comment.component';
import { commentsVO } from '../documents-vo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { DocumentsService } from '../documents.service';
import { DocumentEditorComponent } from '../document-editor/document-editor.component';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-doc-comments',
  templateUrl: './doc-comments.component.html',
  styleUrls: ['./doc-comments.component.scss']
})
export class DocCommentsComponent implements OnInit {
  @Input() comments: any;
  @Input() fromComment: any;
  @Input() commentArray: any;

  @Input() usersList: UserVO[] = [];
  @Input() index: number;
  @Input() docData: any;
  @Output() highlightValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  public config: PerfectScrollbarConfigInterface = {};
  screenHeight: any
  contentLeft: string;
  left: string;
  isContentEditable = false;
  templateComponent: DocumentEditorComponent;
  selectedLang: any;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = Math.round((window.innerHeight / 100) * 86) + 'px';
  }
  constructor(private dialog: MatDialog, private snackBar: MatSnackBar,
    public translate: TranslateService, private document: DocumentsService) {
    if (this.index === undefined) {
      this.index = 0;
    }
  }

  ngOnInit(): void {
    this.selectedLang = localStorage.getItem('translate_lang');
    if (this.selectedLang === undefined || this.selectedLang === null || this.selectedLang === 'null' || this.selectedLang === '') {
      this.selectedLang = 'en';
    }
    this.screenHeight = Math.round((window.innerHeight / 100) * 86) + 'px';
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
  editMessage(comments: any): void {
    comments.isEdit = true;
    this.highlightValue.emit(comments);
    const dialog = this.dialog.open(
      DocumentCommentComponent,
      {
        disableClose: true,
        width: '450px',
        panelClass: 'config-dialog',
        data: {
          data: comments,
          type: 'edit',
        },
      });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        const commentVo = new commentsVO;
        commentVo.comment = data.value;
        commentVo.docId = comments.docId;
        commentVo.id = comments.id;
        commentVo.parentCommentId = comments.parentCommentId;
        commentVo.commentSection = comments.commentSection;
        commentVo.length = comments.length;
        commentVo.index = comments.index;
        this.document.saveComments(commentVo).subscribe(res => {
          if (res.response.includes('successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: res.response,
            });
          }
          this.refresh.emit(true);
        });
      }
      this.refresh.emit(true);
    });
  }

  getUserColor(createdBy): string {
    const index = this.usersList.findIndex(
      (users) => users.emailId === createdBy
    );
    // return 'red';
    return this.usersList[index].color;
  }
  getCommentsUserPrefix(createdBy: string): string {
    const user = this.usersList.find(u => u.emailId === createdBy);
    if (user) {
      const firstName = user.firstName.charAt(0).toUpperCase();
      const lastName = user.lastName.charAt(0).toUpperCase();
      return firstName + lastName;
    } else {
      return '';
    }
  }
  getDataDiff(date: string) {
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date();
      var diff = endDate.getTime() - startDate.getTime();
      var days = Math.floor(diff / (60 * 60 * 24 * 1000));
      var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
      var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
      var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
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
      } else {
        return this.translate.translations[this.selectedLang][' 0 day ago'];
      }
    } else {
      return this.translate.translations[this.selectedLang][' 0 day ago'];
    }
  }

  reply(comment) {
    this.highlightValue.emit(comment);
    const dialog = this.dialog.open(
      DocumentCommentComponent,
      {
        disableClose: true,
        width: '450px',
        panelClass: 'config-dialog',
        data: {
          data: comment,
          type: 'reply',
        },
      });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        const commentVo = new commentsVO;
        commentVo.comment = data.value;
        commentVo.docId = comment.docId;
        commentVo.parentCommentId = comment.id;
        commentVo.commentSection = comment.commentSection;
        commentVo.index = comment.index;
        commentVo.length = comment.length;
        this.document.saveComments(commentVo).subscribe(res => {
          if (res.response.includes('successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: res.response,
            });
          }
          this.refresh.emit(true);
        });
      } else {
        this.refresh.emit(true);
      }
    });
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
  highlight(value) {
    this.editMessage(value);
  }

  getValue(event) {
    this.editMessage(event);
  }
}
