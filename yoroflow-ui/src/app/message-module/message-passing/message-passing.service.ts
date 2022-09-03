import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageHistory } from './message-passing-vo';
import { MessageGroup } from './message-group-vo';
import { UserVO } from './user-vo';
import { ResponseString } from './reponse-vo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessagePassingService {

  constructor(private http: HttpClient) { }

  private getLoggedUserDetailsUrl = environment.messagingBaseUrl + '/user-service/v1/get/logged-in/user-details';
  private getListOfUsersUrl = environment.messagingBaseUrl + '/user-service/v1/get/list';
  private getUsersAutocompleteListUrl = environment.renderingBaseUrl + '/user-service/v1/get/users/auto-complete/';
  private getMessageHistoryUrl = environment.messagingBaseUrl + '/message-history/v1/get-message-history/';
  private getUpdateReadTimeUrl = environment.messagingBaseUrl + '/message-history/v1/update/read-time/';
  private createMessageGroupUrl = environment.messagingBaseUrl + '/message-group/v1/save';
  private getMessageGroupListUrl = environment.messagingBaseUrl + '/message-group/v1/get-list';
  private getGroupMessageHistoryUrl = environment.messagingBaseUrl + '/message-history/v1/get-group-message-history/';
  private getTotalUserMessageCountUrl = environment.messagingBaseUrl + '/message-history/v1/get/count';
  private updateGroupMessageReadTimeUrl = environment.messagingBaseUrl + '/message-history/v1/update/group-message/read-time/';
  private getGroupMessageReadCountUrl = environment.messagingBaseUrl + '/message-group/v1/get/group-unread-message/count/';
  private isAllowedUrl = environment.baseurl + '/flow/v1/license/is-allowed';

  getUnReadGroupMessageCount(groupId) {
    return this.http.get<any>(this.getGroupMessageReadCountUrl + groupId);
  }

  updateGroupMessageReadTime(groupId, messageId) {
    return this.http.get<any>(this.updateGroupMessageReadTimeUrl + groupId + '/' + messageId);
  }

  getTotalUserMessageCount() {
    return this.http.get<any>(this.getTotalUserMessageCountUrl);
  }

  getGroupMessageHistory(groupId, pageIndex) {
    return this.http.get<MessageHistory>(this.getGroupMessageHistoryUrl + groupId + '/' + pageIndex);
  }

  getMessageGroupList() {
    return this.http.get<MessageGroup[]>(this.getMessageGroupListUrl);
  }

  saveMessageGroup(messageGroupVO) {
    return this.http.post(this.createMessageGroupUrl, messageGroupVO);
  }

  getLoggedInUserDetails(): Observable<UserVO> {
    return this.http.get<UserVO>(this.getLoggedUserDetailsUrl);
  }

  getListOfUsers() {
    return this.http.get<UserVO[]>(this.getListOfUsersUrl);
  }

  getUsersAutocompleteList(userName) {
    return this.http.get<UserVO[]>(this.getUsersAutocompleteListUrl + userName);
  }

  getMessageHistory(toId, pageIndex) {
    return this.http.get<MessageHistory>(this.getMessageHistoryUrl + toId + '/' + pageIndex);
  }

  updateReadTimeOfMessage(formId, toId) {
    return this.http.get<ResponseString>(this.getUpdateReadTimeUrl + formId + '/' + toId);

  }

  isAllowed(licenseVO) {
    return this.http.post<any>(this.isAllowedUrl, licenseVO);
  }
}
