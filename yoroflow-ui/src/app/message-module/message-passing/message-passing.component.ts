import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MessagePassingService } from './message-passing.service';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Message, MessageHistory } from './message-passing-vo';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MessageGroup } from './message-group-vo';
import { UserVO } from './user-vo';
import { delay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { StompClientService } from '../stomp-client.service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { InjectorInstance } from '../message-notification.module';
import { UserService } from 'src/app/rendering-module/shared/service/user-service';
import { UserIdListVO } from 'src/app/rendering-module/shared/vo/user-vo';
import { NotificationServices } from '../notification/notification.service';
import { DomSanitizer } from '@angular/platform-browser';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-message-passing',
  templateUrl: './message-passing.component.html',
  styleUrls: ['./message-passing.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(180deg)' })),
      state('expanded', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ],
})

export class MessagePassingComponent implements OnInit {

  constructor(private messageService: MessagePassingService, private notificationService: NotificationServices,
    private fb: FormBuilder, private matDialog: MatDialog, private stompClientService: StompClientService,
    private service: UserService, private sanitizer: DomSanitizer) { }

  @Output() collapsed: EventEmitter<any> = new EventEmitter<any>();
  @Output() unreadCount: EventEmitter<any> = new EventEmitter<any>();

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
  userVOList: UserVO[];
  messageHistoryVO = new MessageHistory();
  showUserChatHistory = false;
  chatHistoryUserId: any;
  messageGroupVO = new MessageGroup();
  messageGroupVOList: MessageGroup[];
  showGroupChatHistory = false;
  today = new Date();
  userId: string;
  open = false;
  url = ""
  mockedParticipants: any;
  historyEnabled = false;
  filterUserList: UserVO[] = [];
  filterGroupList: MessageGroup[] = [];
  selectedChatUsers: MessageHistory[] = [];
  form: FormGroup;
  collapseUserListWindow = false;
  selectedMessageHistory = new MessageHistory();
  unreadMessageCount = 0;
  messageGroupForm: FormGroup;
  allUsers: UserVO[] = [];
  filterUsersForGroup: UserVO[] = [];;
  removable = true;
  selectable = true;
  groupCreation: boolean;
  collapseMessageGroupWindow = false;
  maximizeMessageGroupWindow = false;
  messageGroupWindowClass = 'message-group-overlay-list';

  @HostListener('scroll', ['$event'])
  onScroll(event: any, messageHistory) {
    if (event.target.scrollTop === 0) {
      if (this.selectedMessageHistory.messageVOList[0].groupId) {
        const group = new MessageGroup();
        group.id = this.selectedMessageHistory.messageVOList[0].groupId;
        this.loadGroupFromScroll(group, this.selectedMessageHistory.count + 1, 'scroll');
      } else if (this.selectedMessageHistory.messageVOList[0]?.toId) {
        this.loadChatFromScroll(this.selectedMessageHistory, this.selectedMessageHistory.count + 1, 'scroll');
      }
    }
  }

  ngOnInit(): void {
    this.initializeMessagePassingForm();
    this.getLoggedUserDetails();
    if (!this.stompClientService.stompClient || this.stompClientService.stompClient.connected === false) {
      this.stompClientService.initializeWebSocketConnection();
    }
    this.getUsersList();
    this.getMessageGroupList();
    // this.addUserNamesAutocompleteList();
    this.formValueChanges();
  }

  initializeMessagePassingForm() {
    this.messagePassingForm = this.fb.group({
      // fromId: ['', Validators.required],
      // toId: [''],
      // message: ['', Validators.required],
      // groupId: [''],
      // userName: [],
      messageDetailsArray: this.fb.array([
        // this.messageDetailsFormGroup()
      ])
    });
    this.form = this.fb.group({
      search: [],
    });
    this.messageGroupForm = this.fb.group({
      user: [''],
      groupName: ['', [Validators.required]]
    });
  }

  messageDetailsFormGroup(): FormGroup {
    return this.fb.group({
      fromId: [this.userVO.userId, Validators.required],
      toId: [''],
      message: ['', Validators.required],
      groupId: [''],
      userName: [],
    });
  }

  getMessageDetailsFormArray(): FormArray {
    return (this.messagePassingForm.get('messageDetailsArray') as FormArray);
  }

  addMessageDetailsArray(): void {
    (this.messagePassingForm.get('messageDetailsArray') as FormArray).push(this.messageDetailsFormGroup());
  }

  removeMessageDetailsArray(i: number): void {
    (this.messagePassingForm.get('messageDetailsArray') as FormArray).removeAt(i);
  }

  formValueChanges(): void {
    this.form.get('search').valueChanges.subscribe(data => {
      if (data) {
        if (this.userVOList) {
          this.filterUserList = [];
          const searchValue = data.toLowerCase();
          this.userVOList.forEach(user => {
            if (user.firstName.toLowerCase().includes(searchValue) || user.lastName.toLowerCase().includes(searchValue)) {
              this.filterUserList.push(user);
            }
          });
        }
        if (this.messageGroupVOList) {
          this.filterGroupList = [];
          const searchValue = data.toLowerCase();
          this.messageGroupVOList.forEach(group => {
            if (group.groupName.toLowerCase().includes(searchValue)) {
              this.filterGroupList.push(group);
            }
          });
        }
      } else {
        this.filterUserList = this.userVOList;
        this.filterGroupList = this.messageGroupVOList;
      }
    });
    this.messageGroupForm.get('user').valueChanges.subscribe(data => {
      if (data && this.allUsers) {
        this.filterUsersForGroup = [];
        const searchValue = data.toLowerCase();
        this.allUsers.forEach(user => {
          if (user.firstName.toLowerCase().includes(searchValue) || user.lastName.toLowerCase().includes(searchValue)) {
            this.filterUsersForGroup.push(user);
          }
        });
      } else {
        this.filterUsersForGroup = this.allUsers;
      }
    });
  }

  getMessageGroupList() {
    this.messageService.getMessageGroupList().subscribe(data => {
      this.messageGroupVOList = data;
      this.filterGroupList = this.messageGroupVOList;
      this.setUnreadTotalCountForGroup();
      this.setGroupBasedOnPriority(this.filterGroupList);
    });
  }

  setUnreadTotalCountForGroup(): void {
    this.messageGroupVOList.forEach(group => {
      if (group.groupUnreadMessageCount > 0) {
        this.unreadMessageCount += group.groupUnreadMessageCount;
        this.unreadCount.emit(this.unreadMessageCount);
      }
    })
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
    this.messageService.getLoggedInUserDetails().subscribe(data => {
      this.userVO = data;
      this.userVO.color = this.service.userVO.color;
      this.userVO.profilePicture = this.service.userVO.profilePicture;
      // this.messagePassingForm.get('messageDetailsArray').get('' + 0).get('fromId').setValue(this.userVO.userId);
      // this.addMessageDetailsArray();
      if (this.stompClientService.isLoaded) {
        this.openSocket(this.userVO.userId);
      } else {
        setTimeout(() => {
          this.openSocket(this.userVO.userId);
        }, 3000);
      }
    });
  }

  getUsersList() {
    this.messageService.getListOfUsers().subscribe(data => {
      this.userVOList = data;
      this.filterUserList = data;
      this.userId = this.service.userVO.userId;
      this.loadProfilePictures();
      this.open = true;
      this.allUsers = JSON.parse(JSON.stringify(this.userVOList));
      this.allUsers.push(this.userVO);
      this.setSelectedFalse();
      this.setUnreadTotalCount();
      this.setUsersBasedOnPriority(this.filterUserList);
    });
  }

  setUnreadTotalCount(): void {
    this.userVOList.forEach(user => {
      if (user.unReadMessageCount > 0) {
        this.unreadMessageCount += user.unReadMessageCount;
        this.unreadCount.emit(this.unreadMessageCount);
      }
    })
  }

  setSelectedFalse(): void {
    this.allUsers.forEach(user => {
      user.isSelected = false;
    });
    this.filterUsersForGroup = this.allUsers;
  }

  setGroupUsers(user: UserVO): void {
    if (user.isSelected === false) {
      user.isSelected = true;
    } else {
      user.isSelected = false;
    }
  }

  collapseMessageGroup(): void {
    if (this.collapseMessageGroupWindow === false) {
      this.collapseMessageGroupWindow = true;
    } else {
      this.collapseMessageGroupWindow = false;
    }
  }

  removeUser(user: UserVO): void {
    user.isSelected = false;
  }

  checkUsersSelected(): boolean {
    const users = this.allUsers.filter(user => user.isSelected === true);
    if (users?.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  openGroupCreation(): void {
    this.groupCreation = true;
  }

  closeGroupWindow(): void {
    this.messageGroupForm.reset();
    this.groupCreation = false;
  }

  addUserToExistGroup(messageHistory: MessageHistory): void {
    const messageGroup = new MessageGroup();
    const users = this.allUsers.filter(user => user.isSelected === true);
    users?.forEach(user => {
      messageGroup.messageGroupUsersVOList.push({ id: null, userId: user.userId });
    });
    messageGroup.groupName = this.messageGroupForm.get('groupName').value;
    this.messageService.saveMessageGroup(messageGroup).subscribe((response: any) => {
      if (!this.messageGroupVO.id) {
        this.messageGroupVO.id = response.uuid;
        this.getMessageGroupList();
      }
    });
  }

  saveMessageGroup(): void {
    const messageGroup = new MessageGroup();
    const users = this.allUsers.filter(user => user.isSelected === true);
    users?.forEach(user => {
      messageGroup.messageGroupUsersVOList.push({ id: null, userId: user.userId });
    });
    messageGroup.groupName = this.messageGroupForm.get('groupName').value;
    this.messageService.saveMessageGroup(messageGroup).subscribe((response: any) => {
      if (!this.messageGroupVO.id) {
        this.messageGroupVO.id = response.uuid;
        this.getMessageGroupList();
      }
    });
  }

  maximizeWindow(): void {
    if (this.maximizeMessageGroupWindow === false) {
      this.maximizeMessageGroupWindow = true;
      this.messageGroupWindowClass = 'message-overlay-list-maximize';
    } else {
      this.maximizeMessageGroupWindow = false;
      this.messageGroupWindowClass = 'message-group-overlay-list';
    }
  }

  loadProfilePictures(): void {
    const userIdVOList = new UserIdListVO();
    this.userVOList.forEach(user => userIdVOList.userIdList.push(user.userId));
    if (userIdVOList !== null && userIdVOList.userIdList.length > 0) {
      this.notificationService.getProfilePictures(userIdVOList).subscribe(data => {
        if (data !== null && data.length > 0) {
          data.forEach(user => {
            this.userVOList.find(u => u.userId === user.userId)['profilePicture'] = user.userProfilePicture;
          })
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
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    this.stompClient.connect({}, (frame) => {
      this.isLoaded = true;
      // this.openGlobalSocket();
      this.openSocket(this.userVO.userId);
      this.show = true;
    });
  }

  keydown(event: any, i: number) {
    this.sendMessageUsingSocket(i);
  }

  userProfile(str) {
    // const assignee = str.split(' ');
    // for (let i = 0; i < assignee.length; i++) {
    //   assignee[i] = assignee[i].charAt(0).toUpperCase();
    // }
    // return assignee.join('');
    if (str) {
      return str.charAt(0).toUpperCase();
    } else {
      return '';
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

  sendMessageUsingSocket(i: number): void {
    if (!this.stompClientService.stompClient || this.stompClientService.stompClient.connected === false) {
      this.stompClientService.initializeWebSocketConnection();
    }
    setTimeout(data => {
      if (this.getMessageDetailsFormArray().get('' + i).valid) {
        const message = this.buildMessageVO(i);
        this.stompClientService.stompClient.send('/socket-subscriber/send/message', this.getHeader(), JSON.stringify(message));
        this.getMessageDetailsFormArray().get('' + i).get('message').setValue('');
        message.createdOn = new Date();
        this.selectedChatUsers.find(u => u.userId === message.toId)?.messageVOList.push(message);
        setTimeout(data => {
          var messageBody = document.querySelector('#messageBody');
          messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
        });
      }
    }, 100);
  }

  setUsersBasedOnPriority(usersList: UserVO[]): void {
    let priorityUsers: UserVO[] = [];
    usersList.forEach((user, i) => {
      if (user.unReadMessageCount > 0) {
        usersList.splice(i, 1);
        priorityUsers.push(user);
      }
    });
    if (priorityUsers.length > 0) {
      usersList.unshift(...priorityUsers);
    }
  }

  setGroupBasedOnPriority(messageGroupVOList: MessageGroup[]): void {
    let priorityGroups: MessageGroup[] = [];
    messageGroupVOList.forEach((group, i) => {
      if (group.groupUnreadMessageCount > 0) {
        messageGroupVOList.splice(i, 1);
        priorityGroups.push(group);
      }
    });
    if (priorityGroups.length > 0) {
      messageGroupVOList.unshift(...priorityGroups);
    }
  }

  loadChatFromScroll(selectedUser: any, pageIndex, type: string): void {
    this.showGroupChatHistory = false;
    this.showUserChatHistory = false;
    // this.messagePassingForm.get('groupId').setValue(null);
    // this.messagePassingForm.get('toId').setValue(selectedUser.userId);
    this.messageHistoryVO = new MessageHistory();
    this.messageGroupVO.id = null;
    this.messageService.getMessageHistory(selectedUser.userId, pageIndex).subscribe(user => {
      this.messageHistoryVO = user;
      this.messageHistoryVO.color = selectedUser.color;
      this.messageHistoryVO.profilePicture = selectedUser.profilePicture;
      this.messageHistoryVO.isSelected = false;
      this.messageHistoryVO.count = pageIndex;
      this.chatHistoryUserId = this.messageHistoryVO.userId;
      this.showUserChatHistory = true;
      selectedUser.unReadMessageCount = 0;
      this.selectedChatUsers.find(u => u.userId === selectedUser.userId).messageVOList.unshift(...this.messageHistoryVO.messageVOList);
      this.selectedChatUsers.find(u => u.userId === selectedUser.userId)['count'] = pageIndex;
      if (this.selectedChatUsers.length > 3) {
        this.selectedChatUsers.splice(0, 1);
      }
    });
  }

  loadChatDetails(selectedUser: any, pageIndex) {
    this.showGroupChatHistory = false;
    this.showUserChatHistory = false;
    // this.messagePassingForm.get('groupId').setValue(null);
    // this.messagePassingForm.get('toId').setValue(selectedUser.userId);
    this.messageHistoryVO = new MessageHistory();
    this.messageGroupVO.id = null;
    if (!this.selectedChatUsers.some(u => u.userId === selectedUser.userId)) {
      this.messageService.getMessageHistory(selectedUser.userId, pageIndex).subscribe(user => {
        this.messageHistoryVO = user;
        this.messageHistoryVO.color = selectedUser.color;
        this.messageHistoryVO.profilePicture = selectedUser.profilePicture;
        this.messageHistoryVO.isSelected = false;
        this.messageHistoryVO.count = pageIndex;
        this.chatHistoryUserId = this.messageHistoryVO.userId;
        if (this.unreadMessageCount > 0) {
          this.unreadMessageCount -= selectedUser.unReadMessageCount;
        }
        this.unreadCount.emit(this.unreadMessageCount);
        selectedUser.unReadMessageCount = 0;
        this.showUserChatHistory = true;
        if (this.messageHistoryVO.userId !== this.userVO.userId) {
          this.selectedChatUsers.push(this.messageHistoryVO);
          this.addMessageDetailsArray();
          const length = this.getMessageDetailsFormArray().length - 1;
          this.getMessageDetailsFormArray().get('' + length).get('toId').setValue(selectedUser.userId);
        }
        if (this.selectedChatUsers.length > 3) {
          this.selectedChatUsers.splice(0, 1);
          this.removeMessageDetailsArray(0);
        }
        setTimeout(data => {
          var messageBody = document.querySelector('#messageBody');
          messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
        }, 100);
        // let messageVO: Message[] = [];
        // this.messageHistoryVO.messageVOList.forEach(messageHistory => {
        //   messageVO.push({
        //     fromId: messageHistory.fromId,
        //     toId: messageHistory.toId,
        //     message: messageHistory.message,
        //     dateSent: new Date(messageHistory.createdOn)
        //   });
        // });
        // MessagingAdapters.mockedHistory = messageVO;
      });
    } else if (this.selectedChatUsers.some(u => u.userId === selectedUser.userId) && selectedUser.unReadMessageCount > 0) {
      this.unreadMessageCount -= selectedUser.unReadMessageCount;
      selectedUser.unReadMessageCount = 0;
      this.unreadCount.emit(this.unreadMessageCount);
    }
  }

  loadGroupFromScroll(messageGroup, pageIndex, type) {
    this.showUserChatHistory = false;
    this.showGroupChatHistory = false;
    // this.messagePassingForm.get('groupId').setValue(messageGroup.id);
    // this.messagePassingForm.get('toId').setValue(null);
    this.messageHistoryVO = new MessageHistory();
    this.messageService.getGroupMessageHistory(messageGroup.id, pageIndex).subscribe(data => {
      this.messageHistoryVO = data;
      this.messageHistoryVO.isSelected = false;
      this.messageHistoryVO.color = 'grey';
      this.messageHistoryVO.count = pageIndex;
      messageGroup.unReadMessageCount = 0;
      this.showGroupChatHistory = true;
      this.selectedChatUsers.find(u => u.userId === messageGroup.id).messageVOList.unshift(...this.messageHistoryVO.messageVOList);
      this.selectedChatUsers.find(u => u.userId === messageGroup.id)['count'] = pageIndex;
      if (this.selectedChatUsers.length > 3) {
        this.selectedChatUsers.splice(0, 1);
      }
    });
  }

  loadGroupChatDetails(messageGroup, pageIndex) {
    this.showUserChatHistory = false;
    this.showGroupChatHistory = false;
    // this.messagePassingForm.get('groupId').setValue(messageGroup.id);
    // this.messagePassingForm.get('toId').setValue(null);
    this.messageHistoryVO = new MessageHistory();
    if (!this.selectedChatUsers.some(u => u.userId === messageGroup.id)) {
      this.messageService.getGroupMessageHistory(messageGroup.id, pageIndex).subscribe(data => {
        this.messageHistoryVO = data;
        this.messageHistoryVO.isSelected = false;
        this.messageHistoryVO.color = 'grey';
        this.messageHistoryVO.count = pageIndex;
        if (this.unreadMessageCount > 0) {
          this.unreadMessageCount -= messageGroup.groupUnreadMessageCount;
        }
        this.unreadCount.emit(this.unreadMessageCount);
        messageGroup.groupUnreadMessageCount = 0;
        this.showGroupChatHistory = true;
        if (this.messageHistoryVO.userId !== this.userVO.userId) {
          this.selectedChatUsers.push(this.messageHistoryVO);
          this.addMessageDetailsArray();
          const length = this.getMessageDetailsFormArray().length - 1;
          this.getMessageDetailsFormArray().get('' + length).get('groupId').setValue(messageGroup.id);
        }
        if (this.selectedChatUsers.length > 3) {
          this.selectedChatUsers.splice(0, 1);
          this.removeMessageDetailsArray(0);
        }
        setTimeout(data => {
          var messageBody = document.querySelector('#messageBody');
          if (messageBody) {
            messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
          }
        }, 1000);
      });
    } else if (this.selectedChatUsers.some(u => u.userId === messageGroup.id) && messageGroup.groupUnreadMessageCount > 0) {
      this.unreadMessageCount -= messageGroup.groupUnreadMessageCount;
      messageGroup.groupUnreadMessageCount = 0;
      this.unreadCount.emit(this.unreadMessageCount);
    }
  }

  buildMessageVO(i: number): any {
    return {
      message: this.messagePassingForm.get('messageDetailsArray').get('' + i).get('message').value,
      id: null, readTime: null, createdOn: null,
      groupId: this.messagePassingForm.get('messageDetailsArray').get('' + i).get('groupId').value,
      fromId: this.messagePassingForm.get('messageDetailsArray').get('' + i).get('fromId').value,
      toId: this.messagePassingForm.get('messageDetailsArray').get('' + i).get('toId').value
    };
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

  openGlobalSocket() {
    this.stompClient.subscribe('/socket-publisher/group', (message) => {
      this.handleResult(message);
    });
  }

  handleResult(message) {
    if (message.body) {
      const messageResult = JSON.parse(message.body);
      this.messages.push(messageResult);
      if (messageResult.groupId === null || messageResult.groupId === '') {
        if (this.chatHistoryUserId === messageResult.toId || this.chatHistoryUserId === messageResult.fromId) {
          messageResult.createdOn = this.today;
          // this.messageHistoryVO.messageVOList.push(messageResult);
        }
        // this.updateUnReadMessagesCount(messageResult.fromId);
        // let messageVO = new Message();
        let user = this.userVOList.find(u => u.userId === messageResult.fromId);
        if (user && user.userId) {
          if (this.selectedChatUsers?.some(u => u.userId === user.userId)) {
            this.userVOList.find(u => u.userId === user.userId)['unReadMessageCount'] += 1;
            const messageHistory = this.selectedChatUsers.find(u => u.userId === user.userId);
            messageHistory.messageVOList.push(messageResult);
            setTimeout(data => {
              var messageBody = document.querySelector('#messageBody');
              if (messageBody) {
                messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
              }
            });
            this.unreadMessageCount += 1;
            this.unreadCount.emit(this.unreadMessageCount);
            this.setUsersBasedOnPriority(this.filterUserList);
          } else {
            this.loadChatDetails(user, 0);
          }
        }
        // this.showGroupChatHistory = false;
        // this.showUserChatHistory = true;
      } else if (messageResult.groupId) {
        // if (this.messageHistoryVO.userId === messageResult.groupId) {
        //   this.messageHistoryVO.messageVOList.push(messageResult);
        // }
        // this.updateGroupMessagesCount(messageResult.groupId);
        let group = this.messageGroupVOList.find(g => g.id === messageResult.groupId);
        if (group && group.id) {
          if (this.selectedChatUsers?.some(u => u.userId === group.id)) {
            this.messageGroupVOList.find(g => g.id === group.id)['groupUnreadMessageCount'] += 1;
            const messageHistory = this.selectedChatUsers.find(u => u.userId === group.id);
            messageHistory.messageVOList.push(messageResult);
            setTimeout(data => {
              var messageBody = document.querySelector('#messageBody');
              if (messageBody) {
                messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
              }
            }, 100);
            if (group.id !== this.userVO.userId) {
              this.unreadMessageCount += 1;
              this.unreadCount.emit(this.unreadMessageCount);
              this.setGroupBasedOnPriority(this.filterGroupList);
            }
          } else {
            this.loadGroupChatDetails(group, 0);
          }
        }
        // this.showUserChatHistory = false;
        // this.showGroupChatHistory = true;
      }
      // this.messagePassingForm.get('message').setValue(null);
    }
  }

  updateGroupMessagesCount(groupId) {
    if (this.messageHistoryVO.userId !== groupId) {
      this.messageGroupVOList.filter(messageGroup => messageGroup.id === groupId).forEach(toGroup => {
        if (!toGroup.groupUnreadMessageCount) {
          toGroup.groupUnreadMessageCount = 0;
        }
        toGroup.groupUnreadMessageCount = toGroup.groupUnreadMessageCount + 1;
      });
    }
  }

  updateUnReadMessagesCount(fromId) {
    if (fromId) {
      this.messageService.updateReadTimeOfMessage(fromId, this.userVO.userId).subscribe(data => {
      });
    } else {
      this.userVOList.filter(user => user.userId === fromId).forEach(user => {
        user.unReadMessageCount = user.unReadMessageCount + 1;
      });
    }
  }

  collapseMessage(): void {
    if (this.collapseUserListWindow === false) {
      this.collapseUserListWindow = true;
      this.collapsed.emit(true);
    } else {
      this.collapseUserListWindow = false;
      this.collapsed.emit(false);
    }
  }

  transformImage(profilePicture) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
  }

  closeChatWindow(messageHistory: MessageHistory): void {
    this.selectedChatUsers.splice(this.selectedChatUsers.findIndex(m => m.userId === messageHistory.userId), 1);
  }

  chatWindowCollapse(messageHistory: MessageHistory): void {
    if (messageHistory.isSelected === true) {
      messageHistory.isSelected = false;
      setTimeout(data => {
        var messageBody = document.querySelector('#messageBody');
        if (messageBody) {
          messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
        }
      }, 100);
    } else {
      messageHistory.isSelected = true;
    }
  }

  setMessageHistory(messageHistory: MessageHistory): void {
    this.selectedMessageHistory = messageHistory;
  }

}



