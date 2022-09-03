import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/rendering-module/shared/service/user-service';
import { UserVO } from 'src/app/rendering-module/shared/vo/user-vo';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { environment } from 'src/environments/environment';
import { StatusList } from '../taskboard-configuration/taskboard.model';
import { TaskboardActivityLogVo, TaskboardLabelsVO } from './taskboard-task-vo';

@Injectable({
  providedIn: 'root'
})
export class TaskboardFormDetailsService {
  private getActivityLog = environment.baseurl + '/activity-log/v1/get-taskboard-task/';
  activityLogMap = [{ name: 'assigned to', value: 'assigned' }]
  check: any;
  constructor(private http: HttpClient, private userservice: UserService, private translate: TranslateService,) { }
  usersList: UserVO[] = [];
  users = [];
  status = [];
  labels = [];
  priority = [];
  assignee = [];
  selectedLang: any;

  getActivitylog(paginationVO: PaginationVO, taskId: String, taskboardId: string): Observable<TaskboardActivityLogVo> {
    return this.http.post<TaskboardActivityLogVo>(this.getActivityLog + taskId + '/' + taskboardId, paginationVO);
  }

  getdata(data) {
    if (data.activityType === 'tb_label_add') {
      return "added label";
    } else if (data.activityType === 'tb_label_remove') {
      return "removed label";
    } else if (data.activityType === 'tb_create_task') {
      return "created task";
    } else if (data.activityType === 'tb_comment') {
      return "added comments";
    } else if (data.activityType === 'tb_added_due_date') {
      return "added DueDate";
    } else if (data.activityType === 'tb_added_start_date') {
      return "added startDate";
    }
    else if (data.activityType === 'tb_added_assignee') {
      return "added assignee";
    } else if (data.activityType === 'tb_removed_assignee') {
      return "removed assignee";
    } else if (data.activityType === 'tb_updated_task') {
      return "updated task";
    } else if (data.activityType === 'tb_added_priority') {
      return "added priority";
    } else if (data.activityType === 'tb_changed_status') {
      return "changed Status";
    } else if (data.activityType === 'tb_changed_sub_status') {
      return "changed substatus";
    }
    else if (data.activityType === 'tb_added_description') {
      return "added description";
    }
    else if (data.activityType === 'tb_added_sub_task') {
      return "added subtask";
    } else if (data.activityType === 'tb_removed_sub_task') {
      return "removed subtasks";
    } else if (data.activityType === 'tb_changed_sub_task_status') {
      return "changed subtask status";
    } else if (data.activityType === 'tb_added_attachment') {
      return "added attachment";
    } else if (data.activityType === 'tb_added_waiting_on') {
      return "added tasks on waiting";
    } else if (data.activityType === 'tb_added_blocking') {
      return "added tasks on blocking";
    }
    else if (data.activityType === 'tb_added_related_task') {
      return "added related task";
    }
  }
  getStatus(data) {
    let statusColor: String;
    this.status.forEach(status => {
      if (status.name === data) {
        statusColor = status.color;
      }
    });
    return statusColor;
  }
  getLabels(data) {
    let labelsColor: String;
    this.labels.forEach(label => {
      if (label.labelName === data.trim()) {
        labelsColor = label.labelcolor;
      }
    });
    return labelsColor;
  }

  getAssigneeName(data) {
    const dataArr = data.split(',')
    return dataArr;
  }

  getAssignee(data) {
    let assignColor: String;
    this.labels.forEach(label => {
      if (label.labelName === data.trim()) {
        assignColor = label.labelcolor;
      }
    });
    return assignColor;
  }

  getLabelsName(data) {
    const dataArray = data.split(',');
    return dataArray;
  }

  getPriorty(data) {
    const priority = this.priority.find(x => x.name === data)
    return priority.color
  }
  getUser(userId) {
    if (userId === this.userservice.userVO.userId) {
      return this.userservice.userVO;
    } else {
      const user = this.usersList.find(x => x.userId === userId)
      return user;
    }
  }

  getUsername(userId) {
    if (userId === this.userservice.userVO.userId) {
      return this.userservice.userVO.firstName + ' ' + this.userservice.userVO.lastName;
    } else {
      const user = this.usersList.find(x => x.userId === userId)
      if (user && user.firstName && user.lastName) {
        return user.firstName + ' ' + user.lastName;
      } else {
        return '';
      }
    }
  }
  getUserColoras(user) {
    const index = this.usersList.findIndex(
      (users) => users.userId === user.userId
    );
    if (index !== -1) {
      return this.usersList[index].color;
    } else {
      return '#039777';
    }

  }
  getUserAssignee(assignee) {
    let userNames: string;
    const assigneeUsers = assignee.split(",")
    userNames = null;
    for (let i = 0; i < assigneeUsers.length; i++) {
      if (i > 3) {
        const index = this.usersList.findIndex(users => users.userId === assigneeUsers[i]);
        if (userNames === null) {
          userNames = 'Assigned To ' + this.usersList[index].firstName + ' ' + this.usersList[index].lastName + ', ';
        } else {
          userNames = userNames + this.usersList[index].firstName + ' ' + this.usersList[index].lastName + ', ';
        }
      }
    }
    return userNames;
  }

  getReminingUsersList(assignee) {
    const assigner = assignee.split(',')
    const array = [];
    for (let i = 0; i < assigner.length; i++) {
      const index = this.usersList.findIndex(users => users.userId === assigner[i]);
      array.push(this.usersList[index]);
    }
    return array;
  }

  getRemainingAssigneeUserCountas(assignee) {
    const assigner = assignee.split(',')
    const array = [];
    for (let i = 0; i < assigner.length; i++) {
      const index = this.usersList.findIndex(users => users.userId === assigner[i]);
      array.push(this.usersList[index]);
    }
    if (assigner.length > 4) {
      return assigner.length - 4;
    }
  }
  getAssigner(user) {
    const index = this.usersList.findIndex(users => users.userId === user.userId);
    if (index !== -1) {
      const firstName = this.usersList[index].firstName.charAt(0).toUpperCase();
      const lastName = this.usersList[index].lastName.charAt(0).toUpperCase();
      return firstName + lastName;
    } else {
      return '';
    }

  }

}
