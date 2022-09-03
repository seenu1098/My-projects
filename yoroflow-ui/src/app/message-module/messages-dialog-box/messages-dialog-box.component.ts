import { Component, OnInit, Inject, ChangeDetectorRef, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MessagePassingService } from '../message-passing/message-passing.service';
import { MessageComponent } from '../message/message.component';
import { DomSanitizer } from '@angular/platform-browser';
import { Message, MessageHistory } from '../message-passing/message-passing-vo';
import { UserVO } from '../message-passing/user-vo';
import { MessageGroup } from './message-group-vo';
import { StompClientService } from '../stomp-client.service';
import { UserIdListVO } from '../notifications-dialog-box/user-id-list-vo';
import { UserDetailsVO } from '../notifications-dialog-box/user-details-vo';
import { NotificationServices } from '../notification/notification.service';
@Component({
  selector: 'app-messages-dialog-box',
  templateUrl: './messages-dialog-box.component.html',
  styleUrls: ['./messages-dialog-box.component.scss']
})
export class MessagesDialogBoxComponent implements OnInit {

  constructor(private messageService: MessagePassingService, @Inject(MAT_DIALOG_DATA) public data: any, private cd: ChangeDetectorRef,
    private fb: FormBuilder, private matDialog: MatDialog, private dialogRef: MatDialogRef<MessagesDialogBoxComponent>,
    private sanitizer: DomSanitizer, private stompClientService: StompClientService, private notificationService: NotificationServices) { }

  private serverUrl = '/messaging-service/socket';
  isLoaded = false;
  isCustomSocketOpened = false;
  show = false;
  private stompClient;
  messagePassingForm: FormGroup;
  messages: Message[] = [];
  sessionId: any;
  transactionId: any;
  userVO = new UserVO();
  userVOList: UserVO[] = [];
  messageHistoryVO = new MessageHistory();
  showUserChatHistory = false;
  chatHistoryUserId: any;
  messageGroupVO = new MessageGroup();
  messageGroupVOList: MessageGroup[] = [];
  showGroupChatHistory = false;
  showMessageLoader = false;
  today = new Date();
  @Output() updateReadTimeEmiiter: EventEmitter<any> = new EventEmitter<any>();
  @Output() openedMessageHistoryId: EventEmitter<any> = new EventEmitter<any>();

  pageIndex = 1;

  allowToLoad = true;
  @ViewChild('scrollMe', { static: false }) scrollbar: ElementRef;
  showChatLoader: boolean;
  scrollToEnd = true;
  scrollBarUpdated = false;
  messageSubscription: any;
  messageHistoryUserIds = new Set();
  userIdVOList = new UserIdListVO();
  userDetailsVOList: UserDetailsVO[];
  userProfilePictures: UserDetailsVO[] = [];
  showSpinner = true;
  showNoUserMessage = false;

  ngOnInit(): void {
    // this.connectSocketClient();
    if (this.stompClientService.stompClient && this.stompClientService.stompClient.connected === false) {
      this.stompClientService.initializeWebSocketConnection();
    }
    this.initializeMessagePassingForm();
    this.getLoggedUserDetails();
    this.addUserNamesAutocompleteList();
  }

  // connectSocketClient(){
  //   if (this.stompClientService.stompClient && this.stompClientService.stompClient.connected === false
  //     && !this.stompClientService.isLoaded) {
  //     this.stompClientService.initializeWebSocketConnection();
  //   }
  // }

  // ngAfterViewChecked() {
  //   this.cd.detectChanges();
  // }


  transformImage(profilePicture) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
  }
  // scrollToTheEnd() {
  //   const messageBody = document.querySelector('#chat-container');
  //   messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
  // }

  getAndLoadChatHistoryFromNotification() {
    if (this.data && this.data.from && this.data.from === 'snackbar') {
      if (this.data.type === 'user') {
        const id = this.data.userId.fromId;
        this.loadChatDetails(this.userVOList.find(user => user.userId === id), 0);
      } else if (this.data.type === 'group') {
        const id = this.data.userId.groupId;
        this.loadGroupChatDetails(this.messageGroupVOList.find(group => group.id === id), 0);
      }
    }
  }

  updateMessagesCountAfterRecieveing() {
    if (this.data && this.data.type !== null && this.data.type !== undefined) {
      (this.data.message as MessageComponent).getUnReadMessageCount();
    }
  }

  initializeMessagePassingForm() {
    this.messagePassingForm = this.fb.group({
      fromId: ['', Validators.required],
      toId: [''],
      message: ['', Validators.required],
      groupId: [''],
      userName: [],
    });
  }

  onNoClick() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    // this.stompClient.disconnect();
    this.dialogRef.close();
  }

  getUsersList() {
    this.messageService.getListOfUsers().subscribe(data => {
      this.userVOList = data;
      this.showSpinner = false;
      this.getMessageGroupList();
      if (this.userVOList.length === 0) {
        this.showNoUserMessage = true;
      }
      if (this.userVOList.length > 0 && !this.data) {
        this.loadChatDetails(this.userVOList[0], 0);
        this.loadUserProfilePictures();
      } else {
        this.getAndLoadChatHistoryFromNotification();
      }
    });
  }

  getMessageGroupList() {
    this.messageService.getMessageGroupList().subscribe(data => {
      this.messageGroupVOList = data;
      if (this.messageGroupVOList.length > 0 && this.userVOList.length === 0 && !this.data) {
        this.loadGroupChatDetails(this.messageGroupVOList[0], 0);
      } else {
        this.getAndLoadChatHistoryFromNotification();
      }
    });
  }

  addUserNamesAutocompleteList() {
    this.messagePassingForm.get('userName').valueChanges.subscribe(data => {
      if (data != null && data !== '') {
        this.messageService.getUsersAutocompleteList(data).subscribe(usersList => {
          this.userVOList = usersList;
        });
      } else {
        this.getUsersList();
      }
    });
  }

  getLoggedUserDetails() {
    // this.connectSocketClient();
    this.messageService.getLoggedInUserDetails().subscribe(data => {
      this.userVO = data;
      this.messagePassingForm.get('fromId').setValue(this.userVO.userId);
      if (this.stompClientService.isLoaded) {
        this.openSocket(this.userVO.userId);
      } else {
        setTimeout(() => {
          this.openSocket(this.userVO.userId);
        }, 3000);
      }
      this.show = this.stompClientService.show;
      this.getUsersList();
      // this.initializeWebSocketConnection();
    });
  }

  loadUserProfilePictures() {
    this.messageHistoryUserIds.clear();
    this.messageHistoryUserIds.add(this.userVO.userId);
    this.userVOList.forEach(user => {
      this.messageHistoryUserIds.add(user.userId);
    });
    this.messageHistoryUserIds.forEach(id => this.userIdVOList.userIdList.push(id));
    if (this.userIdVOList !== null && this.userIdVOList.userIdList.length > 0) {
      this.notificationService.getProfilePictures(this.userIdVOList).subscribe(data => {
        if (data !== null && data.length > 0) {
          this.userProfilePictures = data;
          this.updateUserProfilePictures();
        }
      });
    }
  }

  updateUserProfilePictures() {
    if (this.userProfilePictures !== null && this.userProfilePictures.length > 0) {
      this.userProfilePictures.forEach(user => {
        this.userVOList.filter(a => a.userId === user.userId && a.profilePicture === null).forEach(message => {
          message.profilePicture = user.userProfilePicture;
        });
        if (user.userId === this.userVO.userId) {
          this.userVO.profilePicture = user.userProfilePicture;
        }
      });
    }
  }

  addUserToGroup() {
    const addUsersDialog = this.matDialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: { type: 'users-autocomplete', chatId: this.chatHistoryUserId },
      width: '350px'
    });
    addUsersDialog.afterClosed().subscribe(data => {
      if (data !== false) {
        this.messageGroupVO.messageGroupUsersVOList = [];
        if (!this.messageGroupVO.id) {
          this.messageGroupVO.messageGroupUsersVOList.push({ id: null, userId: data });
          this.messageGroupVO.messageGroupUsersVOList.push({ id: null, userId: this.chatHistoryUserId });
          if (data !== this.userVO.userId) {
            this.messageGroupVO.messageGroupUsersVOList.push({ id: null, userId: this.userVO.userId });
          }
          this.createUpdateMessageGroups();
        } else {
          this.messageGroupVO.messageGroupUsersVOList.push({ id: null, userId: data });
          this.createUpdateMessageGroups();
        }
      }
    });
  }

  addUserToExistingGroup() {
    this.messageGroupVO.id = this.messageHistoryVO.userId;
    this.addUserToGroup();
  }

  createUpdateMessageGroups() {
    this.messageService.saveMessageGroup(this.messageGroupVO).subscribe((response: any) => {
      if (!this.messageGroupVO.id) {
        this.messageGroupVO.id = response.uuid;
        this.getMessageGroupList();
      }
    });
  }

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl, this.getHeader());
    this.stompClient = Stomp.over(ws);
    this.stompClient.debug = null;
    this.stompClient.connect(this.getHeader(), (frame) => {
      this.isLoaded = true;
      // this.openGlobalSocket();
      this.getUsersList();
      this.openSocket(this.userVO.userId);
    });
  }

  keydown(event) {
    this.sendMessageUsingSocket();
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

  sendMessageUsingSocket() {
    if (this.messagePassingForm.valid) {
      this.showMessageLoader = true;
      const message: Message = this.buildMessageVO();
      this.messageHistoryVO.messageVOList.push(message);
      this.messagePassingForm.get('message').setValue(null);
      setTimeout(() => {
        this.scrollbar.nativeElement.scrollTop = this.scrollbar.nativeElement.scrollTop + this.scrollbar.nativeElement.scrollHeight;
      }, 50);
      this.stompClientService.stompClient.send('/socket-subscriber/send/message', this.getHeader(), JSON.stringify(message));
    }
  }

  loadPreviousUserMessages($event) {
    if ($event.sourceCapabilities !== null) {
      this.scrollToEnd = false;
      this.showChatLoader = true;
      this.allowToLoad = false;
      this.scrollBarUpdated = false;
      this.messageService.getMessageHistory(this.messageHistoryVO.userId, this.pageIndex).subscribe(user => {
        if (user.messageVOList.length > 0) {
          this.messageHistoryVO.messageVOList.unshift(...(user.messageVOList));
          this.loadGroupMessageProfilePictures(user);
          this.showChatLoader = false;
          this.allowToLoad = true;
          this.scrollbar.nativeElement.scrollTop = 0;
          this.pageIndex = this.pageIndex + 1;
        } else {
          this.allowToLoad = false;
          this.showChatLoader = false;
        }
      });
    }
  }

  loadPreviousGroupMessages($event) {
    if ($event.sourceCapabilities !== null) {
      this.scrollToEnd = false;
      this.showChatLoader = true;
      this.allowToLoad = false;
      this.scrollBarUpdated = false;
      this.messageService.getGroupMessageHistory(this.messageHistoryVO.userId, this.pageIndex).subscribe(data => {
        if (data.messageVOList.length > 0) {
          this.loadGroupMessageProfilePictures(data);
          this.messageHistoryVO.messageVOList.unshift(...(data.messageVOList));
          this.scrollbar.nativeElement.scrollTop = 0;
          this.showChatLoader = false;
          this.allowToLoad = true;
          this.pageIndex = this.pageIndex + 1;
        } else {
          this.allowToLoad = false;
          this.showChatLoader = false;
        }
      });
    }
  }

  loadGroupMessageProfilePictures(messageHistory: MessageHistory) {
    if (this.userProfilePictures !== null && this.userProfilePictures.length > 0) {
      this.userProfilePictures.forEach(user => {
        messageHistory.messageVOList.filter(a => a.fromId === user.userId && a.profilePicture === null).forEach(message => {
          message.profilePicture = user.userProfilePicture;
        });
      });
    }
  }

  loadChatDetails(selectedUser: any, pageIndex) {
    if (selectedUser) {
      this.scrollToEnd = true;
      this.scrollBarUpdated = false;
      this.messageHistoryVO = new MessageHistory();
      this.messageHistoryVO.firstName = selectedUser.firstName;
      this.messageHistoryVO.lastName = selectedUser.lastName;
      this.messageHistoryVO.userId = selectedUser.userId;
      this.messageHistoryVO.profilePicture = selectedUser.profilePicture;
      this.showChatLoader = true;
      this.showGroupChatHistory = false;
      this.showUserChatHistory = true;
      this.messagePassingForm.get('groupId').setValue(null);
      this.messagePassingForm.get('toId').setValue(selectedUser.userId);
      this.messageGroupVO.id = null;
      this.allowToLoad = true;
      this.pageIndex = 1;
      this.messageService.getMessageHistory(selectedUser.userId, pageIndex).subscribe(user => {
        this.messageHistoryVO = user;
        this.loadGroupMessageProfilePictures(user);
        this.showUserChatHistory = true;
        this.showChatLoader = false;
        this.chatHistoryUserId = this.messageHistoryVO.userId;
        selectedUser.unReadMessageCount = 0;
        this.messagePassingForm.get('message').setValue(null);
        this.showGroupChatHistory = false;
        this.updateReadTimeEmiiter.emit(true);
        this.updateMessagesCountAfterRecieveing();
        this.cd.markForCheck();
        setTimeout(() => {
          if (this.scrollbar) {
            this.scrollbar.nativeElement.scrollTop = this.scrollbar.nativeElement.scrollTop + this.scrollbar.nativeElement.scrollHeight;
          }
        }, 100);
      });
    }
  }

  loadGroupChatDetails(messageGroup, pageIndex) {
    if (messageGroup) {
      this.scrollToEnd = true;
      this.scrollBarUpdated = false;
      this.messageHistoryVO = new MessageHistory();
      this.messageHistoryVO.firstName = messageGroup.groupName;
      this.messageHistoryVO.userId = messageGroup.id;
      this.showChatLoader = true;
      this.showGroupChatHistory = true;
      this.showUserChatHistory = false;
      this.messagePassingForm.get('groupId').setValue(messageGroup.id);
      this.messagePassingForm.get('toId').setValue(null);
      this.allowToLoad = true;
      this.pageIndex = 1;
      this.messageService.getGroupMessageHistory(messageGroup.id, pageIndex).subscribe(data => {
        this.messageHistoryVO = data;
        this.loadGroupMessageProfilePictures(data);
        this.showChatLoader = false;
        this.showGroupChatHistory = true;
        setTimeout(() => {
          this.scrollbar.nativeElement.scrollTop = this.scrollbar.nativeElement.scrollTop + this.scrollbar.nativeElement.scrollHeight;
        }, 90);
        this.chatHistoryUserId = this.messageHistoryVO.userId;
        messageGroup.groupUnreadMessageCount = 0;
        this.messagePassingForm.get('message').setValue(null);
        this.showUserChatHistory = false;
        this.updateReadTimeEmiiter.emit(true);
        this.openedMessageHistoryId.emit(messageGroup.id);
        this.updateMessagesCountAfterRecieveing();
      });
    }
  }

  buildMessageVO() {
    return {
      message: this.messagePassingForm.get('message').value, id: null, readTime: null, createdOn: new Date(),
      groupId: this.messagePassingForm.get('groupId').value,
      fromId: this.messagePassingForm.get('fromId').value, toId: this.messagePassingForm.get('toId').value
    };
  }


  openSocket(userId) {
    if (this.stompClientService.isLoaded) {
      this.isCustomSocketOpened = true;
      this.show = true;
      this.messageSubscription = this.stompClientService.stompClient.subscribe('/socket-publisher/message-' + userId, (message) => {
        this.handleResult(message);
      }, this.getHeader());
    }
  }

  openGlobalSocket() {
    this.stompClient.subscribe('/socket-publisher/group', (message) => {
      this.handleResult(message);
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

  handleResult(message) {
    if (message.body) {
      const messageResult: Message = JSON.parse(message.body);
      const messageList = this.messageHistoryVO.messageVOList;
      this.showMessageLoader = false;
      if (messageResult.groupId === null || messageResult.groupId === '') {
        if (this.chatHistoryUserId === messageResult.toId || this.chatHistoryUserId === messageResult.fromId) {
         
          if (messageList.some(updateMessage => updateMessage.id === null)) {
            let updateMessage: Message = messageList.find(msg => msg.id === messageResult.id);
            updateMessage = messageResult;
          } else {
            messageList.push(messageResult);
          }
        }
        if (this.chatHistoryUserId === messageResult.toId) {
          // this.messagePassingForm.get('message').setValue(null);
        }
        this.updateUnReadMessagesCount(messageResult.fromId, messageResult.toId);
        // this.showGroupChatHistory = false;
        // this.showUserChatHistory = true;
      } else if (messageResult.groupId) {
        if (this.messageHistoryVO.userId === messageResult.groupId) {
          // this.messageHistoryVO.messageVOList.push(messageResult);
          // messageList[messageList.length - 1] = messageResult;
          if (messageList.some(updateMessage => updateMessage.id === null)) {
            let updateMessage: Message = messageList.find(msg => msg.id === messageResult.id);
            updateMessage = messageResult;
          } else {
            messageList.push(messageResult);
          }
        }
        this.updateGroupMessagesCount(messageResult.groupId, messageResult);
        if (messageResult.fromId === this.userVO.userId) {
          // this.messagePassingForm.get('message').setValue(null);
        }
        // this.showUserChatHistory = false;
        // this.showGroupChatHistory = true;
      }
      setTimeout(() => {
        this.scrollbar.nativeElement.scrollTop = this.scrollbar.nativeElement.scrollTop + this.scrollbar.nativeElement.scrollHeight;
      }, 50);
    }
  }

  updateGroupMessagesCount(groupId, message: Message) {
    if (this.messageHistoryVO.userId !== groupId) {
      this.messageGroupVOList.filter(messageGroup => messageGroup.id === groupId).forEach(toGroup => {
        if (!toGroup.groupUnreadMessageCount) {
          toGroup.groupUnreadMessageCount = 0;
        }
        toGroup.groupUnreadMessageCount = toGroup.groupUnreadMessageCount + 1;
        this.updateReadTimeEmiiter.emit(true);
        this.messageService.getUnReadGroupMessageCount(toGroup.id).subscribe(data => {
          toGroup.groupUnreadMessageCount = data;
        });
      });
    } else if (this.messageHistoryVO.userId === groupId && message.fromId !== this.userVO.userId) {
      this.messageService.updateGroupMessageReadTime(groupId, message.id).subscribe(data => {
        this.updateReadTimeEmiiter.emit(true);
      });
    }
  }

  updateUnReadMessagesCount(fromId, toId) {
    if (this.messageHistoryVO.userId === fromId) {
      this.messageService.updateReadTimeOfMessage(fromId, this.userVO.userId).subscribe(data => {
        this.updateReadTimeEmiiter.emit(true);
      });
    } else {
      this.userVOList.filter(user => user.userId === fromId).forEach(user => {
        user.unReadMessageCount = user.unReadMessageCount + 1;
      });
      this.updateReadTimeEmiiter.emit(true);
    }
  }


}
