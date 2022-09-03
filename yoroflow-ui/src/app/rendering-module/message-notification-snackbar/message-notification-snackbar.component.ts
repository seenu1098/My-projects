import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { DynamicSideNavBarComponent } from '../dynamic-side-nav-bar/dynamic-side-nav-bar.component';
import { NotificationComponent } from 'src/app/message-module/notification/notification.component';
import { MessageComponent } from 'src/app/message-module/message/message.component';
import { NotificationsDialogBoxComponent } from 'src/app/message-module/notifications-dialog-box/notifications-dialog-box.component';
import { MessagesDialogBoxComponent } from 'src/app/message-module/messages-dialog-box/messages-dialog-box.component';

@Component({
  selector: 'lib-message-notification-snackbar',
  templateUrl: './message-notification-snackbar.component.html',
  styleUrls: ['./message-notification-snackbar.component.css']
})
export class MessageNotificationSnackbarComponent implements OnInit {

  constructor(public snackBarRef: MatSnackBarRef<MessageNotificationSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any, private dialog: MatDialog, private sanitizer: DomSanitizer) { }

  @Output() taskIdEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() notificationEmiiter: EventEmitter<any> = new EventEmitter<any>();
  @Output() checkNotificationOpenEmiiter: EventEmitter<any> = new EventEmitter<any>();
  @Output() checkMessageOpenEmiiter: EventEmitter<any> = new EventEmitter<any>();

  notificationObject: NotificationComponent;
  messasgeObject: MessageComponent;
  isNotificationOpen = false;
  ngOnInit(): void {
    if (this.data.message) {
      this.messasgeObject = this.data.message;
    }

    if (this.data.notification) {
      this.notificationObject = this.data.notification;
    }
  }

  dismiss() {
    this.snackBarRef.dismiss();
  }

  transformImage(profilePicture) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
  }

  anyAction() {
    this.dismiss();
    this.taskIdEmitter.emit(this.data.snackBarData.taskId);
  }

  openNotifications() {
    this.isNotificationOpen = true;
  }

  openNotification() {
    this.dismiss();
    const notificationDialogBox = this.dialog.open(NotificationsDialogBoxComponent, {
      disableClose: true,
      width: '547px',
      height: '560px',
      autoFocus: false,
      data: { notification: this.notificationObject },
      panelClass: 'custom-dialog-container'
    });
    notificationDialogBox.afterOpened().subscribe(data => {
      this.checkNotificationOpenEmiiter.emit(true);
    });
    notificationDialogBox.afterClosed().subscribe(data => {
      this.checkNotificationOpenEmiiter.emit(false);
    });
    notificationDialogBox.updatePosition({ right: '10px', top: '60px' });
    notificationDialogBox.componentInstance.notificationEmiiter.subscribe(data => {
      this.notificationEmiiter.emit(data.taskId);
    });

  }

  openMessage() {
    this.dismiss();
    let messageType = null;
    if (this.data.snackBarData.toId === null) {
      messageType = 'group';
    } else {
      messageType = 'user';
    }
    const messagingDialogBox = this.dialog.open(MessagesDialogBoxComponent, {
      disableClose: true,
      width: '1000px',
      height: '568px',
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      data: { from: 'snackbar', type: messageType, userId: this.data.snackBarData, message: this.messasgeObject }
    });
    messagingDialogBox.updatePosition({ right: '10px', top: '5px' });
    messagingDialogBox.afterOpened().subscribe(data => {
      this.checkMessageOpenEmiiter.emit(true);
    });
    messagingDialogBox.afterClosed().subscribe(data => {
      this.checkMessageOpenEmiiter.emit(false);
    });
  }

  userProfile(str) {
    if (str) {
      const assignee = str.split(' ');
      for (let i = 0; i < assignee.length; i++) {
        assignee[i] = assignee[i].charAt(0).toUpperCase();
      }
      return assignee.join('');
    }
  }

}
