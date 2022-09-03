import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MarkAsReadNotificationVo, NotificationVO } from './notification-vo';
import { UserVO } from '../message-passing/user-vo';
import { ResponseString } from '../message-passing/reponse-vo';
import { UserDetailsVO } from '../notifications-dialog-box/user-details-vo';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationServices {

  notificationCount = 0;
  public notificationComponentEmitter = new EventEmitter();
  public countEmitter = new EventEmitter();

  constructor(private http: HttpClient) { }

  notificationListUrl = environment.messagingBaseUrl + '/notification/v1/get-list';
  private getLoggedUserDetailsUrl = environment.messagingBaseUrl + '/user-service/v1/get/logged-in/user-details';
  notificationCountUrl = environment.messagingBaseUrl + '/notification/v1/get/count';
  private updateNotificationReadTimeUrl = environment.messagingBaseUrl + '/notification/v1/updated-read-time/';
  private getProfilePictureUrl = environment.messagingBaseUrl + '/notification/v1/get-profile-picture';
  private isAllowedUrl = environment.baseurl + '/flow/v1/license/is-allowed';
  private markAsReadSelectedUrl = environment.messagingBaseUrl + '/notification/v1/selected/updated-read-time';
  private markAsUnReadSelectedUrl = environment.messagingBaseUrl + '/notification/v1/selected/updated-unread';
  private updateAllNotificationReadTimeUrl = environment.messagingBaseUrl + '/notification/v1/all/updated-read-time';
  private deleteAsSelectedUrl = environment.messagingBaseUrl + '/notification/v1/delete';

  getProfilePictures(userIdList) {
    return this.http.post<UserDetailsVO[]>(this.getProfilePictureUrl, userIdList);
  }
  updateReadTime(notificationId) {
    return this.http.get<ResponseString>(this.updateNotificationReadTimeUrl + notificationId);
  }

  // getNotificationList() {
  //   return this.http.get<NotificationVO[]>(this.notificationListUrl);
  // }

  getNotificationList(paginationVO) {
    return this.http.post<any>(this.notificationListUrl, paginationVO);
  }

  getNotificationCount() {
    return this.http.get<any>(this.notificationCountUrl);
  }

  setNotificationCount(count: any) {
    this.notificationCount = count;
  }

  getNotificationCounts() {
    return this.notificationCount;
  }


  getLoggedInUserDetails() {
    return this.http.get<UserVO>(this.getLoggedUserDetailsUrl);
  }

  isAllowed(licenseVO) {
    return this.http.post<any>(this.isAllowedUrl, licenseVO);
  }

  markAsReadSelected(markAsReadNotificationVo: MarkAsReadNotificationVo): Observable<any> {
    return this.http.post<any>(this.markAsReadSelectedUrl, markAsReadNotificationVo)
  }
  markAsUnReadSelected(markAsReadNotificationVo: MarkAsReadNotificationVo): Observable<any> {
    return this.http.post<any>(this.markAsUnReadSelectedUrl, markAsReadNotificationVo)
  }

  updateAllReadTime() {
    return this.http.get<ResponseString>(this.updateAllNotificationReadTimeUrl);
  }

  deleteAsSelected(markAsReadNotificationVo: MarkAsReadNotificationVo): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.deleteAsSelectedUrl, markAsReadNotificationVo);
  }

  invokeNotificationComponentEmitter(notfication: NotificationVO): void {
    this.notificationComponentEmitter.emit(notfication);
  }

  invokeCountEmitter(): void {
    this.countEmitter.emit(true);
  }
}
