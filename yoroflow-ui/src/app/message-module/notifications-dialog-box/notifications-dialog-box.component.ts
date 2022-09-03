import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationServices } from '../notification/notification.service';
import { NotificationVO } from '../notification/notification-vo';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { UserVO } from '../message-passing/user-vo';
import { NotificationComponent } from '../notification/notification.component';
import { DomSanitizer } from '@angular/platform-browser';
import { UserDetailsVO } from './user-details-vo';
import { StompClientService } from '../stomp-client.service';
import { UserIdListVO } from './user-id-list-vo';



@Component({
  selector: 'app-notifications-dialog-box',
  templateUrl: './notifications-dialog-box.component.html',
  styleUrls: ['./notifications-dialog-box.component.scss']
})
export class NotificationsDialogBoxComponent implements OnInit {
  notificationSubscription: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private sanitizer: DomSanitizer, private stompClientService: StompClientService,
              private notficationService: NotificationServices, private dialogRef: MatDialogRef<NotificationsDialogBoxComponent>) { }

  notficationList: NotificationVO[] = [];
  show = false;
  userVO = new UserVO();
  private serverUrl = '/messaging-service/socket';
  isLoaded = false;
  isCustomSocketOpened = false;
  private stompClient;
  enable = false;
  @Output() notificationEmiiter: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateReadTimeEmiiter: EventEmitter<any> = new EventEmitter<any>();
  notificationObject: NotificationComponent;
  notificationUserId = new Set();
  userIdList = new UserIdListVO();
  userDetailsVOList: UserDetailsVO[];
  showNoNotificationMessage = false;

  ngOnInit(): void {
    this.getLoggedUserDetails();
    this.getNotificationList();
    if (this.data && this.data.notification) {
      this.notificationObject = this.data.notification;
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }


  getHeader() {
    const httpOptions = {
      Authorization: this.getToken()
    };
    return httpOptions;
  }

  onNoClick() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    this.dialogRef.close();
  }

  anyAction(notfication) {
    this.notificationEmiiter.emit(notfication);
    this.markAsRead(notfication);
  }

  transformImage(profilePicture) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
  }


  getNotificationList() {
    // this.notficationService.getNotificationList().subscribe(data => {
    //   this.notficationList = data;
    //   if (this.notficationList.length === 0) {
    //     this.showNoNotificationMessage = true;
    //   }
    //   this.show = true;
    //   this.getProfilePictures(this.notficationList);
    // });
  }
  getProfilePictures(notficationList: NotificationVO[]) {
    if (notficationList.length > 0) {
      this.notficationList.forEach(notification => {
        this.notificationUserId.add(notification.fromId);
      });
      this.notificationUserId.forEach(id => this.userIdList.userIdList.push(id));
      if (this.userIdList !== null && this.userIdList.userIdList.length > 0) {
        this.notficationService.getProfilePictures(this.userIdList).subscribe(data => {
          if (data !== null && data.length > 0) {
            data.forEach(user => {
              this.notficationList.filter(a => a.fromId === user.userId).forEach(notification => {
                notification.fromUserProfilePicture = user.userProfilePicture;
              });
            });
          }
        });
      }
    }
  }

  markAsRead(notfication: NotificationVO) {
    notfication.readTime = new Date();
    this.notficationService.updateReadTime(notfication.id).subscribe(data => {
      if (data.response === 'Read time updated') {
        this.updateReadTimeEmiiter.emit(true);
      }
      if (this.data && this.data.notification) {
        this.notificationObject.getNotificationsCount();
      }
    });
  }

  getLoggedUserDetails() {
    this.notficationService.getLoggedInUserDetails().subscribe(data => {
      this.userVO = data;
      this.show = this.stompClientService.show;
      setTimeout(() => {
        this.openSocket(this.userVO.userId);
      }, 1000);
    });
  }

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    this.stompClient.debug = null;
    this.stompClient.connect(this.getHeader(), (frame) => {
      this.isLoaded = true;
      // this.openGlobalSocket();
      this.openSocket(this.userVO.userId);
    });
  }

  openSocket(userId) {
    if (this.stompClientService.isLoaded) {
      this.isCustomSocketOpened = true;
      this.notificationSubscription =
        this.stompClientService.stompClient.subscribe('/socket-publisher/notification-' + userId, (message) => {
          this.handleResult(message);
          this.show = true;
        }, this.getHeader());
    }
  }

  handleResult(message) {
    this.notficationList.unshift(JSON.parse(message.body));
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
