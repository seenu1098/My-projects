import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Application } from '../application-provision/appication-vo';
import { ApplicationProvisionService } from '../application-provision/application-provision-service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { UserVO } from '../shared/vo/user-vo';
import { UserService } from '../shared/service/user-service';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { MessageNotificationSnackbarComponent } from '../message-notification-snackbar/message-notification-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicSideNavBarComponent } from '../dynamic-side-nav-bar/dynamic-side-nav-bar.component';
import { StompClientService } from 'src/app/message-module/stomp-client.service';
import { NotificationComponent } from 'src/app/message-module/notification/notification.component';
import { MessageComponent } from 'src/app/message-module/message/message.component';

@Component({
  selector: 'app-application-launcher',
  templateUrl: './application-launcher.component.html',
  styleUrls: ['./application-launcher.component.css']
})
export class ApplicationLauncherComponent implements OnInit {

  constructor(private router: ActivatedRoute, private overlayContainer: OverlayContainer, private snackBar: MatSnackBar
    , private applicationProvisionService: ApplicationProvisionService, private service: UserService,
    private client: StompClientService, private route: Router) {
  }
  id: string;
  pageId: any;
  @Input() appId: string;
  applicationVO: Application;
  show = false;
  @Output() applicationEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() pinEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() notificationObjectEmitter: EventEmitter<any> = new EventEmitter<any>();

  isMessageOpened: boolean;
  isNotificationOpened: boolean;
  userVo = new UserVO();
  private serverUrl = '/messaging-service/socket';
  isLoaded = false;
  isCustomSocketOpened = false;
  private stompClient;
  notificationObject: NotificationComponent;
  messageObject: MessageComponent;
  dynamicSidenav: DynamicSideNavBarComponent;

  ngOnInit() {
    this.router.paramMap.subscribe(params => {
      if (params.get('id') !== null) {
        const value = params.get('id');
        this.id = value;
        this.loadApplication(this.id);
      }
    });

    if (this.appId) {
      this.loadApplication(this.appId);
    }
    this.loadLoggedInUserDetails();
    this.logoutEmitter();
  }

  logoutEmitter() {
    this.service.logoutEmitter.subscribe(data => {
      if (data === 'logout') {
        if (this.stompClient) {
          this.stompClient.disconnect();
        }
        if (this.client.stompClient) {
          this.client.stompClient.disconnect();
        }
      }
    });
  }

  getMessageObject($event) {
    this.messageObject = $event;
  }

  getNotificationObject($event) {
    this.notificationObject = $event;
    this.notificationObjectEmitter.emit($event);
  }

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    this.stompClient.debug = null;
    this.stompClient.connect(this.getHeader(), (frame) => {
      this.isLoaded = true;
      this.openSocketForNotification(this.userVo.userId);
      this.openSocketForMessages(this.userVo.userId);
    });
  }

  openSocketForNotification(userId) {
    if (this.isLoaded) {
      this.isCustomSocketOpened = true;
      this.stompClient.subscribe('/socket-publisher/notification-' + userId, (notification) => {
        this.handleNotifications(notification);
      }, this.getHeader());
    }
  }

  openSocketForMessages(userId) {
    if (this.isLoaded) {
      this.isCustomSocketOpened = true;
      this.stompClient.subscribe('/socket-publisher/message-' + userId, (message) => {
        this.handleMessages(message);
      }, this.getHeader());
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

  handleMessages(message) {
    const json = JSON.parse(message.body);
    if (this.service.loggedIn && this.isMessageOpened === false
      && (this.userVo.userId === json.toId && json.fromId !== this.userVo.userId ||
        (json.groupId !== null && json.fromId !== this.userVo.userId))) {
      const snackBar = this.snackBar.openFromComponent(MessageNotificationSnackbarComponent, {
        data: { type: 'message', snackBarData: json, message: this.messageObject },
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        duration: 10000,
        panelClass: ['blue-snackbar']
      });
      snackBar.instance.checkMessageOpenEmiiter.subscribe(data => {
        if (data !== null) {
          this.isMessageOpened = data;
        }
      });
    }
  }

  handleNotifications(notification) {
    const json = JSON.parse(notification.body);
    if (this.service.loggedIn && this.isNotificationOpened === false && (json.fromId !== this.userVo.userId)
      || (json.fromId === this.userVo.userId && json.groupId !== null)) {
      const snackBar = this.snackBar.openFromComponent(MessageNotificationSnackbarComponent, {
        data: { type: 'notification', snackBarData: json, notification: this.notificationObject },
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        duration: 10000,
        panelClass: ['blue-snackbar']
      });
      snackBar.instance.notificationEmiiter.subscribe(data => {
        if (data !== null) {
          this.applicationEmitter.emit(data);
        }
      });
      snackBar.instance.taskIdEmitter.subscribe(data => {
        if (data !== null) {
          this.applicationEmitter.emit({ taskId: data, notification: this.notificationObject });
        }
      });
      snackBar.instance.checkNotificationOpenEmiiter.subscribe(data => {
        if (data !== null) {
          this.isNotificationOpened = data;
        }
      });
    }

  }


  loadLoggedInUserDetails() {
    // this.connectSocketClient();
    this.service.getLoggedInUserDetails().subscribe(data => {
      this.userVo = data;
      // this.openSocketForNotification(this.userVo.userId),
      //   this.openSocketForMessages(this.userVo.userId);
      this.initializeWebSocketConnection();
    });
  }

  getNotificationOpened($event) {
    this.isNotificationOpened = $event;
  }

  getMessageOpened($event) {
    this.isMessageOpened = $event;
  }


  getEvent($event) {
    this.applicationEmitter.emit($event);
  }

  pinClicked(event) {
    this.pinEmitter.emit(event);
  }

  loadApplication(applicationIdentifier) {
    this.applicationProvisionService.getApplication(applicationIdentifier).subscribe(data => {
      this.applicationVO = data;
      this.show = true;
      // this.overlayContainer.getContainerElement().classList.add(this.applicationVO.themeId);
    });
  }

}
