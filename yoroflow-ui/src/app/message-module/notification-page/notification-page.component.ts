import { Component, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter, Input, HostListener } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
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
import { NotificationServices } from '../notification/notification.service';
import { MarkAsReadNotificationVo, NotificationVO, PaginationVO } from '../notification/notification-vo';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { ResponseString } from 'src/app/engine-module/shared/vo/reponse-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss']
})
export class NotificationPageComponent implements OnInit {

  constructor(private notficationService: NotificationServices, private dialog: MatDialog,
              private stompClientService: StompClientService, 
              private workspaceService: WorkspaceService, 
              private sanitizer: DomSanitizer, public themeService: ThemeService, public translate: TranslateService) { }

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
  selectedLang: any;

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadDynamicLayout();
  }


  ngOnInit(): void {
    this.selectedLang = localStorage.getItem('translate_lang');
    if (this.selectedLang === undefined || this.selectedLang === null || this.selectedLang === 'null' || this.selectedLang === '') {
      this.selectedLang = 'en';
    }
    this.dynamicSideNavObject = this.object;
    if (window.innerWidth <= 600) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    if (this.stompClientService.stompClient && this.stompClientService.stompClient.connect === false) {
      this.stompClientService.initializeWebSocketConnection();
    }
    this.getLoggedUserDetails();
    this.getNotificationList(this.index);
    this.getNotificationsCount();
    this.checkNotificationOpenEmiiter.emit(false);
    this.notificationObject.emit(this);
    this.checkNotificationLicense();
    this.workspaceService.setHideSubMenu(true);
    this.workspaceService.setHideHover(true);
    this.workspaceService.setNotificationSelected(true);
  }

  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1);
    } else {
      this.screenHeight = (window.innerHeight - 63);
    }
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
        this.notificationOpen.emit(true);
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
    this.notficationService.invokeCountEmitter();
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
    this.selectAll({checked:false});
  }

  filterSelect(filter: any): void {
    this.filterButtonArray.forEach(v => v.isSelected = false);
    filter.isSelected = true;
    this.views.forEach(v => v.isSelected = false);
    this.views.find(v => v.name === 'All').isSelected = true;
    this.getNotificationList(this.index);
    this.selectAll({checked:false});
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

  selectAll(event: any): void {
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
    this.notficationService.markAsReadSelected(markAsReadNotificationVo).subscribe(data => {
      this.getNotificationsCount();
      if (this.selectAllNotification) {
        this.notficationsVO.forEach(notification => {
          if (notification.readTime === undefined || notification.readTime === null) {
            notification.readTime = new Date();
          }
        });
      } else {
        const list = this.notficationsVO?.filter(notification => notification.isSelected === true);
        list.forEach(notification => {
          if (notification.readTime === undefined || notification.readTime === null) {
            notification.readTime = new Date();
          }
        });
      }
    });
  }
  markAsUnReadSelected(): void {
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
    this.notficationService.markAsUnReadSelected(markAsReadNotificationVo).subscribe(data => {
      this.getNotificationsCount();
      if (this.selectAllNotification) {
        this.notficationsVO.forEach(notification => {
            notification.readTime = null;
        });
      } else {
        const list = this.notficationsVO?.filter(notification => notification.isSelected === true);
        list.forEach(notification => {
            notification.readTime = null;
        });
      }
    });
  }

markasReadBtn():boolean{
  const markAsRead = this.notficationsVO.filter(b => b.readTime === null && b.isSelected === true) 
  if(markAsRead?.length > 0){
    return true;
  }else{
    return false;
  }
}
markasUnReadBtn():boolean{
  const markAsRead = this.notficationsVO.filter(b => b.readTime !== null && b.isSelected === true) 
  if(markAsRead?.length > 0){
    return true;
  }else{
    return false;
  }
}

  deleteAsSelected(): void {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: 'deleteNotify'
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === true) {
        const idList: String[] = [];
        if (this.selectAllNotification) {
          this.notficationsVO.forEach(notification => {
            idList.push(notification.id);
            if (notification.readTime === undefined || notification.readTime === null) {
              notification.readTime = new Date();
            }
          });
        } else {
          const list = this.notficationsVO?.filter(notification => notification.isSelected === true);
          list.forEach(notification => {
            idList.push(notification.id);
            if (notification.readTime === undefined || notification.readTime === null) {
              notification.readTime = new Date();
            }
          });
        }
        const markAsReadNotificationVo = new MarkAsReadNotificationVo();
        markAsReadNotificationVo.markAsReadIdList = idList;
        this.notficationService.deleteAsSelected(markAsReadNotificationVo).subscribe(data => {
          this.getNotificationList(this.index);
          this.getNotificationsCount();
        });
      }
    });
  }

}
