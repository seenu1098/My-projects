import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { NotificationVO, UserVO } from '../vo/user-vo';
import { ResponseString } from '../vo/response-vo';
import { UserDetailsVO } from 'src/app/message-module/notifications-dialog-box/user-details-vo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  notificationListUrl = environment.messagingBaseUrl + '/notification/v1/get-list';
  private getLoggedUserDetailsUrl = environment.messagingBaseUrl + '/user-service/v1/get/logged-in/user-details';
  notificationCountUrl = environment.messagingBaseUrl + '/notification/v1/get/count';
  private updateNotificationReadTimeUrl = environment.messagingBaseUrl + '/notification/v1/updated-read-time/';
  private updateAllNotificationReadTimeUrl = environment.messagingBaseUrl + '/notification/v1/all/updated-read-time';
  private getProfilePictureUrl = environment.messagingBaseUrl + '/notification/v1/get-profile-picture';

  getProfilePictures(userIdList) {
    return this.http.post<UserDetailsVO[]>(this.getProfilePictureUrl, userIdList);
  }
  updateReadTime(notificationId) {
    return this.http.get<ResponseString>(this.updateNotificationReadTimeUrl + notificationId);
  }

  updateAllReadTime() {
    return this.http.get<ResponseString>(this.updateAllNotificationReadTimeUrl);
  }

  getNotificationList(paginationVO) {
    return this.http.post<any>(this.notificationListUrl, paginationVO);
  }

  getNotificationCount() {
    return this.http.get<any>(this.notificationCountUrl);
  }


  getLoggedInUserDetails() {
    return this.http.get<UserVO>(this.getLoggedUserDetailsUrl);
  }

}
