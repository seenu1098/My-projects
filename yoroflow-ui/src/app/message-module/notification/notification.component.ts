import { Component, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter, Input, HostListener } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { NotificationServices } from './notification.service';
import { MarkAsReadNotificationVo, NotificationVO, PaginationVO } from './notification-vo';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsDialogBoxComponent } from '../notifications-dialog-box/notifications-dialog-box.component';
import { UserVO } from '../message-passing/user-vo';
import { StompClientService } from '../stomp-client.service';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserIdListVO } from 'src/app/rendering-module/shared/vo/user-vo';
import { Paginator } from 'src/app/shared-module/paginator/paginatorVO';
import { DynamicSideNavBarComponent } from 'src/app/rendering-module/dynamic-side-nav-bar/dynamic-side-nav-bar.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {

  constructor(public notficationService: NotificationServices, private dialog: MatDialog, private workspaceService: WorkspaceService,
              private stompClientService: StompClientService, private sanitizer: DomSanitizer, 
              public themeService: ThemeService,
              private route: Router) { }

  notficationList: any;
  notficationsVO: NotificationVO[] = [];
  show = false;
  userVO = new UserVO();
  private serverUrl = '/messaging-service/socket';
  isLoaded = false;
  isCustomSocketOpened = false;
  private stompClient;
  enable = false;
  isNotificationAllowed = false;
  @ViewChild(MatMenuTrigger, { static: false })
  contextMenu: MatMenuTrigger;
  notificationUserId = new Set();
  userIdList = new UserIdListVO();
  totalCount: any;
  selectedLength: number;

  contextMenuPosition = { x: '0px', y: '0px' };
  @Output() notificationEmiiter: EventEmitter<any> = new EventEmitter<any>();
  @Output() checkNotificationOpenEmiiter: EventEmitter<any> = new EventEmitter<any>();
  @Output() notificationObject: EventEmitter<any> = new EventEmitter<any>();
  @Output() notificationOpen: EventEmitter<any> = new EventEmitter<any>();
  @Input() object: DynamicSideNavBarComponent;

  notificationId: any;
  isMobile: boolean;
  licenseVO = new LicenseVO();
  index = 0;
  screenHeight: any;
  filterButtonArray: any[] = [
    { name: 'All', value: 'all', isSelected: true },
    { name: 'Assigned', value: 'assigned', isSelected: false },
    { name: 'Mentioned', value: 'mentioned', isSelected: false }
  ];
  views: any[] = [
    { name: 'All', value: 'all', isSelected: true },
    { name: 'Read', value: 'read', isSelected: false },
    { name: 'Unread', value: 'unread', isSelected: false }
  ];
  previousBtnDisable = false;
  nextBtnDisable = false;
  isPrevious = false;
  isNext = false;
  paginator = new Paginator();
  dynamicSideNavObject: DynamicSideNavBarComponent;
  selectAllNotification = false;

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 600) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.screenHeight = (window.innerHeight - 1);
  }


  ngOnInit(): void {
    this.dynamicSideNavObject = this.object;
    if (window.innerWidth <= 600) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.screenHeight = (window.innerHeight - 1);
    if (this.stompClientService.stompClient && this.stompClientService.stompClient.connect === false) {
      this.stompClientService.initializeWebSocketConnection();
    }
    this.getLoggedUserDetails();
    this.getNotificationList(this.index);
    this.getNotificationsCount();
    this.checkNotificationOpenEmiiter.emit(false);
    this.notificationObject.emit(this);
    this.checkNotificationLicense();
    this.notficationService.countEmitter.subscribe(data => {
    this.getNotificationsCount();
    });
    this.workspaceService.setHideSubMenu(true);
  }


  updateReadTime() {
    this.notficationService.updateReadTime(this.notificationId).subscribe(data => {
      this.getNotificationsCount();
    });
  }

  openNotification() {
    this.licenseVO.category = 'notifications';
    this.licenseVO.featureName = 'custom_notification';
    this.notficationService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'N') {
        const dialog = this.dialog.open(AlertmessageComponent, {
          width: '450px',
          data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
        });
      } else {
        // this.notificationOpen.emit(true);
        this.route.navigate([this.workspaceService.getWorkSpaceKey() + '/notification']);
      }
    });
  }

  openNotifications() {
    const notificationDialogBox = this.dialog.open(NotificationsDialogBoxComponent, {
      disableClose: true,
      width: '547px',
      height: '547px',
      autoFocus: false,
      panelClass: 'custom-dialog-container'
    });
    notificationDialogBox.afterOpened().subscribe(data => {
      this.checkNotificationOpenEmiiter.emit(true);
    });
    notificationDialogBox.afterClosed().subscribe(data => {
      this.checkNotificationOpenEmiiter.emit(false);
    });
    notificationDialogBox.updatePosition({ right: '10px', top: '5px' });
    notificationDialogBox.componentInstance.notificationEmiiter.subscribe(data => {
      this.notificationEmiiter.emit(data.taskId);
    });

    notificationDialogBox.componentInstance.updateReadTimeEmiiter.subscribe(data => {
      if (data === true) {
        this.getNotificationsCount();
      }
    });
  }

  getNotificationsCount() {
    this.notficationService.getNotificationCount().subscribe(data => {
      this.notficationList = data;
      this.notficationService.setNotificationCount(this.notficationList);
      this.show = true;
    });
  }

  getLoggedUserDetails() {
    // this.connectSocketClient();
    this.notficationService.getLoggedInUserDetails().subscribe(data => {
      // this.connectSocketClient();
      this.userVO = data;
      this.show = this.stompClientService.show;
      setTimeout(() => {
        this.openSocket(this.userVO.userId);
      }, 3000);
    });
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

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    this.stompClient.debug = null;
    this.stompClient.connect(this.getHeader(), (frame) => {
      this.isLoaded = true;
      // this.openGlobalSocket();
      this.openSocket(this.userVO.userId);
      this.show = true;
    });
  }

  openSocket(userId) {
    if (this.stompClientService.isLoaded) {
      this.isCustomSocketOpened = true;
      this.stompClientService.stompClient.subscribe('/socket-publisher/notification-' + userId, (message) => {
        this.handleResult(message);
      }, this.getHeader());
    }
  }

  handleResult(message) {
    this.notificationId = JSON.parse(message.body).id;
    this.notficationList = this.notficationList + 1;
    this.notficationService.setNotificationCount(this.notficationList);
  }

  userProfile(str) {
    const assignee = str.split(' ');
    for (let i = 0; i < assignee.length; i++) {
      assignee[i] = assignee[i].charAt(0).toUpperCase();
    }
    return assignee.join('');
  }

  checkNotificationLicense() {
    this.licenseVO.category = 'notifications';
    this.licenseVO.featureName = 'custom_notification';
    this.notficationService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'Y') {
        this.isNotificationAllowed = true;
      }
    });
  }


  transformImage(profilePicture): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
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

  anyAction(notfication: NotificationVO): void {
    this.markAsRead(notfication);
    this.openTaskDetails(notfication);
  }

  openTaskDetails(notfication: NotificationVO): void {
    this.notficationService.invokeNotificationComponentEmitter(notfication);
  }

  markAsRead(notfication: NotificationVO): void {
    notfication.readTime = new Date();
    this.notficationService.updateReadTime(notfication.id).subscribe(data => {
      if (data.response === 'Read time updated') {
      }
      this.getNotificationsCount();
    });
  }

  markAllAsRead() {
    this.notficationsVO.forEach((notfication) => {
      notfication.readTime = new Date();
    });
    this.notficationService.updateAllReadTime().subscribe(data => {
      this.getNotificationsCount();
    });
  }

  getNotificationList(i) {
    const paginationVO = new PaginationVO();
    paginationVO.index = i;
    paginationVO.size = this.paginator.pageSize ? this.paginator.pageSize : 25;
    paginationVO.filterValueType = this.filterButtonArray.find(filter => filter.isSelected === true).value;
    paginationVO.filterType = this.views.find(filter => filter.isSelected === true).value;
    this.notficationService.getNotificationList(paginationVO).subscribe(data => {
      if (data !== null) {
        let notificationList: NotificationVO[] = [];
        notificationList = data.notificationsVOList;
        this.totalCount = data.totalNotifications;
        notificationList.forEach(notification => {
          notification.link = '';
          notification.isSelected = this.selectAllNotification;
        });
        this.notficationsVO = notificationList;
        // this.loadMentionNotifications();
        // this.totalNotificationsCount = data.totalNotifications;
        // this.totalNotifications = this.notficationList.length;
        // this.hideClose = true;
        // this.hideExpand = true;
        // this.allowNotify = true;
        // if (this.notficationList.length === 0) {
        //   this.showNoNotificationMessage = true;
        // }
        // this.show = true;
        // this.isNotifications = true;
        this.getProfilePictures(this.notficationsVO);
      }
    });
  }

  getProfilePictures(notficationList: NotificationVO[]) {
    if (notficationList.length > 0) {
      this.notficationsVO.forEach(notification => {
        this.notificationUserId.add(notification.fromId);
      });
      this.notificationUserId.forEach(id => this.userIdList.userIdList.push(id));
      if (this.userIdList !== null && this.userIdList.userIdList.length > 0) {
        this.notficationService.getProfilePictures(this.userIdList).subscribe(data => {
          if (data !== null && data.length > 0) {
            data.forEach(user => {
              this.notficationsVO.filter(a => a.fromId === user.userId).forEach(notification => {
                notification.fromUserProfilePicture = user.userProfilePicture;
              });
            });
          }
        });
      }
    }
  }

  loadMentionNotifications(): void {
    this.notficationsVO.forEach(notification => {
      if (notification.message.startsWith('You are mentioned in')) {
        if (notification.type === 'taskboard') {
          const prefix = /You are mentioned in task comments of /gi;
          const suffix = / on the taskboard/gi;
          notification.link = notification.message.replace(prefix, '');
          notification.link = notification.link.replace(suffix, ' of');
        } else {
          const prefix = /You are mentioned in workflow comments of /gi;
          const suffix = / on the workflow/gi;
          notification.link = notification.message.replace(prefix, '');
          notification.link = notification.link.replace(suffix, ' of');
        }
      }
    });
  }

  loadNotifications(type: string): void {
    const totalIndex = Math.ceil(this.notficationList / 20);
    if (type === 'next') {
      this.index += 1;
      this.getNotificationList(this.index);
      if (this.index === totalIndex) {
        this.nextBtnDisable = true;
      }
      if (this.index > 0) {
        this.previousBtnDisable = false;
      }
    } else {
      this.index -= 1;
      this.getNotificationList(this.index);
      if (this.index === 0) {
        this.previousBtnDisable = true;
      }
      if (this.index < totalIndex) {
        this.nextBtnDisable = false;
      }
    }
  }

  viewChange(view: any): void {
    this.views.forEach(v => v.isSelected = false);
    view.isSelected = true;
    this.getNotificationList(this.index);
  }

  filterSelect(filter: any): void {
    this.filterButtonArray.forEach(v => v.isSelected = false);
    filter.isSelected = true;
    this.getNotificationList(this.index);
  }

  pageEvent(paginator: Paginator): void {
    this.paginator = paginator;
    this.index = this.paginator.index;
    this.getNotificationList(this.index);
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
    } else {
      return '0 day ago';
    }
  }

  selectNotification(notification: NotificationVO, event: MatCheckboxChange): void {
    notification.isSelected = event.checked;
    const list = this.notficationsVO?.filter(notification => notification.isSelected === true);
    if (list.length === this.notficationsVO.length) {
      this.selectAllNotification = true;
    } else {
      this.selectAllNotification = false;
    }
  }

  interMediate(): boolean {
    const list = this.notficationsVO?.filter(notification => notification.isSelected === true);
    if (list.length > 0 && list.length !== this.notficationsVO.length) {
      return true;
    } else {
      return false;
    }
  }

  selectAll(event: MatCheckboxChange): void {
    this.selectAllNotification = event.checked;
    this.notficationsVO.forEach(n => n.isSelected = event.checked);
  }

  getNotificationSelect(): boolean {
    const list = this.notficationsVO?.filter(notification => notification.isSelected === true);
    if (list.length > 0) {
      this.selectedLength = list.length;
      return true;
    } else {
      return false;
    }
  }

  markAsReadSelected(): void {
    const idList: String[] = [];
    if (this.selectAllNotification) {
      this.notficationsVO.forEach(notification => {
        idList.push(notification.id);
      });
    } else {
      const list = this.notficationsVO?.filter(notification => notification.isSelected === true);
      list.forEach(notification => {
        idList.push(notification.id);
      });
    }
    const markAsReadNotificationVo = new MarkAsReadNotificationVo();
    markAsReadNotificationVo.markAsReadIdList = idList;
    this.notficationService.markAsReadSelected(markAsReadNotificationVo).subscribe( d => {
      this.getNotificationsCount();
    }
    );
  }

}
