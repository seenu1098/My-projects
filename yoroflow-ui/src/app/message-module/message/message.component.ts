import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessagesDialogBoxComponent } from '../messages-dialog-box/messages-dialog-box.component';
import { MessagePassingService } from '../message-passing/message-passing.service';
import { UserVO } from '../message-passing/user-vo';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { StompClientService } from '../stomp-client.service';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  isMobile: boolean;
  isOpen: boolean;

  constructor(private dialog: MatDialog, private messageService: MessagePassingService,
    private stompClientService: StompClientService) { }

  @Output() checkMessageOpenEmiiter: EventEmitter<any> = new EventEmitter<any>();
  @Output() messageObject: EventEmitter<any> = new EventEmitter<any>();
  @Output() opened: EventEmitter<any> = new EventEmitter<any>();
  @Output() collapsed: EventEmitter<any> = new EventEmitter<any>();
  unReadMessageCount = 0;
  private serverUrl = '/messaging-service/socket';
  isLoaded = false;
  isCustomSocketOpened = false;
  show = false;
  private stompClient;
  userVO = new UserVO();
  openChatHistoryId: any;
  isMessageOpend = false;
  isMessageAllowed = false;
  licenseVO = new LicenseVO();


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 600) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }


  ngOnInit(): void {
    if (window.innerWidth <= 600) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }

    if (!this.stompClientService.stompClient || this.stompClientService.stompClient.connect === false) {
      this.stompClientService.initializeWebSocketConnection();
    }
    this.checkMessageOpenEmiiter.emit(false);
    this.messageObject.emit(this);
    this.getLoggedUserDetails();
    this.getUnReadMessageCount();
    this.checkMessageLicense();
  }



  getLoggedUserDetails() {
    this.messageService.getLoggedInUserDetails().subscribe(data => {
      this.userVO = data;
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
    // this.stompClient.reconnect_delay = 5000;
    this.stompClient.connect(this.getHeader(), (frame) => {
      this.isLoaded = true;
      // this.openGlobalSocket();
      this.openSocket(this.userVO.userId);
      this.show = true;
    }, (error) => {
    });
  }

  openSocket(userId) {
    if (!this.stompClientService.stompClient || this.stompClientService.stompClient.connect === false) {
      this.stompClientService.initializeWebSocketConnection();
    }
    setTimeout(data => {
      if (this.stompClientService.isLoaded) {
        this.isCustomSocketOpened = true;
        this.stompClientService.stompClient.subscribe('/socket-publisher/message-' + userId, (message) => {
          this.handleResult(message);
        }, this.getHeader());
      }
    }, 100);
  }

  handleResult(message) {
    if (message.body && JSON.parse(message.body).fromId !== this.userVO.userId) {
      this.unReadMessageCount = this.unReadMessageCount + 1;
      this.isOpen = true;
      this.opened.emit(true);
    }
  }


  getUnReadMessageCount() {
    this.messageService.getTotalUserMessageCount().subscribe(data => {
      this.unReadMessageCount = data;
    });
  }

  checkMessageLicense() {
    this.licenseVO.category = 'notifications';
    this.licenseVO.featureName = 'sms';
    this.messageService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'Y') {
        this.isMessageAllowed = true;
      }
    });
  }

  openMessages() {

    this.licenseVO.category = 'notifications';
    this.licenseVO.featureName = 'sms';
    this.messageService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'N') {
        const dialog = this.dialog.open(AlertmessageComponent, {
          width: '450px',
          data: { message: "Your current plan doesn't support to enable this option, Please upgrade your plan" }
        });
      } else {
        this.isOpen = true
        this.opened.emit(true);
        // const messagingDialogBox = this.dialog.open(MessagesDialogBoxComponent, {
        //   disableClose: true,
        //   width: '1000px',
        //   maxWidth: '100vw',
        //   height: '565px',
        //   autoFocus: false,
        //   panelClass: 'custom-dialog-container'
        // });
        // messagingDialogBox.updatePosition({ right: '10px', top: '5px' });
        // messagingDialogBox.afterOpened().subscribe(data => {
        //   this.checkMessageOpenEmiiter.emit(true);
        //   this.isMessageOpend = true;
        // });
        // messagingDialogBox.afterClosed().subscribe(data => {
        //   this.checkMessageOpenEmiiter.emit(false);
        //   this.isMessageOpend = false;
        // });

        // messagingDialogBox.componentInstance.updateReadTimeEmiiter.subscribe(data => {
        //   if (data === true && this.isMessageOpend === true) {
        //     this.getUnReadMessageCount();
        //   }
        // });

        // messagingDialogBox.componentInstance.openedMessageHistoryId.subscribe(data => {
        //   this.openChatHistoryId = data;
        // });
      }
    });
  }

  closeMessage(): void {
    this.isOpen = false;
    this.opened.emit(false);
  }

  getCollapsed(event: any): void {
    this.collapsed.emit(event);
  }

  getCount(event: any): void {
    this.unReadMessageCount = +event;
  }

}
