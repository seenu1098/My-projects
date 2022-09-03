import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/rendering-module/shared/service/user-service';
import { UserVO } from 'src/app/rendering-module/shared/vo/user-vo';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { WorkflowActivityLogVo } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpenFormDialogService {
  private getActivityLog = environment.baseurl + '/activity-log/v1/get-workflow/';
  activityLogMap = [{ name: 'assigned to', value: 'assigned' }]
  check: any;
  constructor(private http: HttpClient, private userservice: UserService, private translate: TranslateService,) { }
  usersList: UserVO[] = [];
  users=[];
  status = [];
  labels = [];
  priority=[];
  assignee=[];
  selectedLang: any;
groupList:any[];
  getActivitylog(paginationVO: PaginationVO, instanceId: String): Observable<WorkflowActivityLogVo> {
    return this.http.post<WorkflowActivityLogVo>(this.getActivityLog + instanceId, paginationVO);
  }
  getUserColoras(user){
    const index = this.usersList.findIndex(
      (users) => users.userId === user.userId
    );
    if (index !== -1) {
      return this.usersList[index].color;
    } else {
      return '#039777';
    }

  }
  getUserColor(userId){
    const index = this.usersList.findIndex(
        (users) => users.userId === userId
      );
      if (index !== -1) {
        return this.usersList[index].color;
      } else {
        return '#039777';
      }
  }
  getAssigneruser(userId){
    const index = this.usersList.findIndex(users => users.userId === userId);
    if (index !== -1) {
      const firstName = this.usersList[index].firstName.charAt(0).toUpperCase();
      const lastName = this.usersList[index].lastName.charAt(0).toUpperCase();
      return firstName + lastName;
    } else {
      return '';
    }

  }
  getAssigner(user){
    const index = this.usersList.findIndex(users => users.userId === user.userId);
    if (index !== -1) {
      const firstName = this.usersList[index].firstName.charAt(0).toUpperCase();
      const lastName = this.usersList[index].lastName.charAt(0).toUpperCase();
      return firstName + lastName;
    } else {
      return '';
    }

  }
getgroup(groupId){
    const index = this.groupList.findIndex(groups => groups.groupId === groupId);
    if (index !== -1) {
      const firstName = this.groupList[index].groupName.charAt(0).toUpperCase();
      return firstName ;
    } else {
      return '';
    }

}
getgroupColor(groupId){
    const group = this.groupList.find(groups => groups.groupId === groupId)
return  group.color
}
  getAssigneeName(data) {
    const dataArr=data.split(',')
    return dataArr;
  }

  getAssignee(data) {
    let assignColor: String;
    this.labels.forEach(label => {
      if (label.userId === data.trim()) {
        assignColor = label.color;
      }
    });
    return assignColor;
  }

  getdata(data) {
    if (data.activityType === 'wf_comment') {
      return "added comments";
    } else if (data.activityType === 'wf_assign_to_group') {
      return "assigned to groups";
    } else if (data.activityType === 'wf_assign_to_me') {
      return "assigned";
    } else if (data.activityType === 'wf_assign_to_user') {
      return "assigned to";
    } else if (data.activityType === 'wf_submitted') {
      return "submitted";
    } else if (data.activityType === 'wf_sendback') {
      return "sendback";
    } else if (data.activityType === 'wf_rejectd') {
      return "rejected";
    }
    else if (data.activityType === 'wf_approved') {
      return "approved";
    }
    else if (data.activityType === 'wf_draft') {
      return "added draft";
    } else if (data.activityType === 'wf_attachment') {
      return "added attachment";
    }
  }
  getUser(userId) {
    if (userId === this.userservice.userVO.userId) {
      return this.userservice.userVO;
    } else {
      const user = this.usersList.find(x => x.userId === userId)
      return user;
    }
  }


}
