import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateOrganizationService } from 'src/app/creation-module/create-organization/create-organization.service';
import { SubscriptionVO } from 'src/app/creation-module/create-organization/customer-vo';
import { UserService } from 'src/app/creation-module/user-management/user-service';
import { UserVO } from 'src/app/engine-module/shared/vo/user-vo';
import { WorkflowDashboardService } from 'src/app/engine-module/work-flow-dashboard/workflow-dashboard.service';
import { WorkspaceDashboardService } from 'src/app/engine-module/workspace-dashboard/workspace-dashboard.service';

import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { CommonService } from './common.service';
import { SubscriptionExpireVO } from './subscription-expire-vo';

@Component({
  selector: 'app-subscription-expire',
  templateUrl: './subscription-expire.component.html',
  styleUrls: ['./subscription-expire.component.scss']
})
export class SubscriptionExpireComponent implements OnInit {
  usersList: any[] = [];
  customerId: any;
  username: any;
  paymentSubscriptionDetails: any;
  package = ['STARTER', 'BUSINESS PACK', 'STANDARD', 'PRO'];
  cardType = 'user';
  selectedUsers: any[] = [];
  myUserArray: any;
  myUserArrayCount: any;
  form: FormGroup;
  removable = true;
  selectable = true;
  isDowngrade = false;
  disableButton = false;
  disableGroupButton = false;
  groupList: any[] = [];
  myGroupArray: any[] = [];
  myGroupArrayCount: any;
  selectedTeams: any[] = [];

  disableWorkflowButton = false;
  workflowList: any[] = [];
  myWorkflowArray: any[] = [];
  myWorkflowArrayCount: any;
  selectedWorkflow: any[] = [];

  disableTaskboardButton = false;
  taskboardList: any[] = [];
  myTaskboardArray: any[] = [];
  myTaskboardArrayCount: any;
  selectedTaskboard: any[] = [];

  disableDocumentsButton = false;
  documentsList: any[] = [];
  myDocumentsArray: any[] = [];
  myDocumentsArrayCount: any;
  selectedDocuments: any[] = [];

  disableWorkspaceButton = false;
  workspaceList: any[] = [];
  myWorkspaceArray: any[] = [];
  myWorkspaceArrayCount: any;
  selectedWorkspace: any[] = [];
  subscriptionExpireVO = new SubscriptionExpireVO()
  constructor(
    private router: Router,
    private service: UserService,
    private createOrganizationService: CreateOrganizationService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private activeRoute: ActivatedRoute,
    private dialog: MatDialog,
    private workspaceDashboardService: WorkspaceDashboardService,
    private workflowDashboardService: WorkflowDashboardService,
    private commonService: CommonService,
    private fb: FormBuilder) { }


  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      roleId: ['', [Validators.required]],
      searchselected: [],

      userOption: [],
      searchUser: [],

      teamOption: [],
      searchGroup: [],

      workflowOption: [],
      searchWorkflow: [],

      taskboardOption: [],
      searchTaskboard: [],

      documentOption: [],
      searchDocument: [],

      workspaceOption: [],
      searchWorkspace: []

    });

    this.activeRoute.paramMap.subscribe(params => {
      if (params.get('id')) {
        this.customerId = params.get('id');
        this.username = params.get('username');
      }
    });
    this.getOrgsubscriptionDetails();
    this.formValueChanges();
    this.groupFormValueChanges();
    this.workflowFormValueChanges();
    this.taskboardFormValueChanges();
    this.documentFormValueChanges();
    this.workspaceFormValueChanges();
    this.service.getLoggedInUserDetails().subscribe(data => {
      if (data) {
        this.selectedUsers.push({ userId: data.userId, firstName: data.firstName, lastName: data.lastName, isLoggedInUser: true })
      }
    })
  }



  upgrade() {
    this.router.navigate(['subscription-update', this.username, this.customerId]);
  }

  getOrgsubscriptionDetails() {
    this.createOrganizationService.getPackageDetails().subscribe(data => {
      this.paymentSubscriptionDetails = [];
      if (data) {
        this.package.forEach(pack => {
          this.paymentSubscriptionDetails.push(data.find(t => t.planName === pack));
        });
      }
    });
  }

  formValueChanges() {
    this.form.get('searchUser').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.myUserArray.length; i++) {
          const searchData = data.toLowerCase();
          const firstName = this.myUserArray[i].firstName.toLowerCase();
          const lastName = this.myUserArray[i].lastName.toLowerCase();
          if (firstName.includes(searchData) || lastName.includes(searchData) || firstName.startsWith(searchData) || lastName.startsWith(searchData)) {
            this.myUserArray[i].filter = true;
          } else {
            this.myUserArray[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.myUserArray.length; i++) {
          this.myUserArray[i].filter = true;
        }
      }
    });
  }

  groupFormValueChanges() {
    this.form.get('searchGroup').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.myGroupArray.length; i++) {
          const searchData = data.toLowerCase();
          const name = this.myGroupArray[i].name.toLowerCase();
          if (name.includes(searchData) || name.startsWith(searchData)) {
            this.myGroupArray[i].filter = true;
          } else {
            this.myGroupArray[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.myGroupArray.length; i++) {
          this.myGroupArray[i].filter = true;
        }
      }
    });
  }

  workflowFormValueChanges() {
    this.form.get('searchWorkflow').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.myWorkflowArray.length; i++) {
          const searchData = data.toLowerCase();
          const name = this.myWorkflowArray[i].processDefinitionName.toLowerCase();
          if (name.includes(searchData) || name.startsWith(searchData)) {
            this.myWorkflowArray[i].filter = true;
          } else {
            this.myWorkflowArray[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.myWorkflowArray.length; i++) {
          this.myWorkflowArray[i].filter = true;
        }
      }
    });
  }

  taskboardFormValueChanges() {
    this.form.get('searchTaskboard').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.myTaskboardArray.length; i++) {
          const searchData = data.toLowerCase();
          const name = this.myTaskboardArray[i].processDefinitionName.toLowerCase();
          if (name.includes(searchData) || name.startsWith(searchData)) {
            this.myTaskboardArray[i].filter = true;
          } else {
            this.myTaskboardArray[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.myTaskboardArray.length; i++) {
          this.myTaskboardArray[i].filter = true;
        }
      }
    });
  }

  documentFormValueChanges() {
    this.form.get('searchDocument').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.myDocumentsArray.length; i++) {
          const searchData = data.toLowerCase();
          const name = this.myDocumentsArray[i].documentName.toLowerCase();
          if (name.includes(searchData) || name.startsWith(searchData)) {
            this.myDocumentsArray[i].filter = true;
          } else {
            this.myDocumentsArray[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.myDocumentsArray.length; i++) {
          this.myDocumentsArray[i].filter = true;
        }
      }
    });
  }

  workspaceFormValueChanges() {
    this.form.get('searchWorkspace').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.myWorkspaceArray.length; i++) {
          const searchData = data.toLowerCase();
          const name = this.myWorkspaceArray[i].workspaceName.toLowerCase();
          if (name.includes(searchData) || name.startsWith(searchData)) {
            this.myWorkspaceArray[i].filter = true;
          } else {
            this.myWorkspaceArray[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.myWorkspaceArray.length; i++) {
          this.myWorkspaceArray[i].filter = true;
        }
      }
    });
  }

  radioChange($event) {
    if ($event.value === '1') {
      this.cardType = 'user';
      if (this.selectedUsers && this.selectedUsers.length > 0) {
        this.disableButton = true;
      } else {
        this.disableButton = false;
      }
    } else if ($event.value === '2') {
      this.disableButton = true;
    }
  }

  groupRadioChange($event) {
    if ($event.value === '1') {
      this.cardType = 'teams';
      if (this.selectedTeams && this.selectedTeams.length > 0) {
        this.disableGroupButton = true;
      } else {
        this.disableGroupButton = false;
      }
    } else if ($event.value === '2') {
      this.disableGroupButton = true;
    }
  }

  workflowRadioChange($event) {
    if ($event.value === '1') {
      this.cardType = 'workflow';
      if (this.selectedWorkflow && this.selectedWorkflow.length > 0) {
        this.disableWorkflowButton = true;
      } else {
        this.disableWorkflowButton = false;
      }
    } else if ($event.value === '2') {
      this.disableWorkflowButton = true;
    }
  }

  taskboardRadioChange($event) {
    if ($event.value === '1') {
      this.cardType = 'taskboard';
      if (this.selectedTaskboard && this.selectedTaskboard.length > 0) {
        this.disableTaskboardButton = true;
      } else {
        this.disableTaskboardButton = false;
      }
    } else if ($event.value === '2') {
      this.disableTaskboardButton = true;
    }
  }

  documentRadioChange($event) {
    if ($event.value === '1') {
      this.cardType = 'document';
      if (this.selectedDocuments && this.selectedDocuments.length > 0) {
        this.disableDocumentsButton = true;
      } else {
        this.disableDocumentsButton = false;
      }
    } else if ($event.value === '2') {
      this.disableDocumentsButton = true;
    }
  }

  workspaceRadioChange($event) {
    if ($event.value === '1') {
      this.cardType = 'workspace';
      if (this.selectedWorkspace && this.selectedWorkspace.length > 0) {
        this.disableWorkspaceButton = true;
      } else {
        this.disableWorkspaceButton = false;
      }
    } else if ($event.value === '2') {
      this.disableWorkspaceButton = true;
    }
  }

  formValueChanges1() {
    this.form.get('searchselected').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.selectedUsers.length; i++) {
          const searchData = data.toLowerCase();
          const firstName = this.selectedUsers[i].firstName.toLowerCase();
          const lastName = this.selectedUsers[i].lastName.toLowerCase();
          if (firstName.includes(searchData) || lastName.includes(searchData)) {
            this.selectedUsers[i].filter = true;
          } else {
            this.selectedUsers[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.selectedUsers.length; i++) {
          this.selectedUsers[i].filter = true;
        }
      }
    });
  }

  remove(val) {
    this.selectedUsers.forEach((element, index) => {
      if (element.userId == val.userId) this.selectedUsers.splice(index, 1);
    });
    this.myUserArray.unshift(val);
    for (let i = 0; i < this.myUserArray.length; i++) {
      this.myUserArray[i].filter = true;
    }

    if (this.selectedUsers && this.selectedUsers.length < 3) {
      this.disableButton = false;
    } else {
      this.disableButton = true;
    }
  }

  removeGroup(val) {
    this.selectedTeams.forEach((element, index) => {
      if (element.id == val.id) this.selectedTeams.splice(index, 1);
    });
    this.myGroupArray.unshift(val);
    for (let i = 0; i < this.myGroupArray.length; i++) {
      this.myGroupArray[i].filter = true;
    }

    if (this.selectedTeams && this.selectedTeams.length < 6) {
      this.disableGroupButton = false;
    } else {
      this.disableGroupButton = true;
    }
  }

  removeWorkflow(val) {
    this.selectedWorkflow.forEach((element, index) => {
      if (element.processDefinitionId == val.processDefinitionId) this.selectedWorkflow.splice(index, 1);
    });
    this.myWorkflowArray.unshift(val);
    for (let i = 0; i < this.myWorkflowArray.length; i++) {
      this.myWorkflowArray[i].filter = true;
    }

    if (this.selectedWorkflow && this.selectedWorkflow.length < 4) {
      this.disableWorkflowButton = false;
    } else {
      this.disableWorkflowButton = true;
    }
  }

  removeTaskboard(val) {
    this.selectedTaskboard.forEach((element, index) => {
      if (element.taskBoardId == val.taskBoardId) this.selectedTaskboard.splice(index, 1);
    });
    this.myTaskboardArray.unshift(val);
    for (let i = 0; i < this.myTaskboardArray.length; i++) {
      this.myTaskboardArray[i].filter = true;
    }

    if (this.selectedTaskboard && this.selectedTaskboard.length < 5) {
      this.disableTaskboardButton = false;
    } else {
      this.disableTaskboardButton = true;
    }
  }

  removeDocument(val) {
    this.selectedDocuments.forEach((element, index) => {
      if (element.documentId == val.documentId) this.selectedDocuments.splice(index, 1);
    });
    this.myDocumentsArray.unshift(val);
    for (let i = 0; i < this.myDocumentsArray.length; i++) {
      this.myDocumentsArray[i].filter = true;
    }

    if (this.selectedDocuments && this.selectedDocuments.length < 5) {
      this.disableDocumentsButton = false;
    } else {
      this.disableDocumentsButton = true;
    }
  }

  removeWorkspace(val) {
    this.selectedWorkspace.forEach((element, index) => {
      if (element.workspaceId == val.workspaceId) this.selectedWorkspace.splice(index, 1);
    });
    this.myWorkspaceArray.unshift(val);
    for (let i = 0; i < this.myWorkspaceArray.length; i++) {
      this.myWorkspaceArray[i].filter = true;
    }

    if (this.selectedWorkspace && this.selectedWorkspace.length < 5) {
      this.disableWorkspaceButton = false;
    } else {
      this.disableWorkspaceButton = true;
    }
  }


  add(val) {
    if (this.selectedUsers && this.selectedUsers.length < 2) {
      for (let j = 0; j < this.usersList.length; j++) {
        if (this.usersList[j].userId === val.userId) {
          this.selectedUsers.unshift(this.usersList[j]);
        }
      }
      for (let i = 0; i < this.selectedUsers.length; i++) {
        this.selectedUsers[i].filter = true;
      }
      this.myUserArray.forEach((element, index) => {
        if (element.userId == val.userId) this.myUserArray.splice(index, 1);
      });


      this.form.get('searchUser').setValue('');
    }

    if (this.selectedUsers && this.selectedUsers.length < 2) {
      this.disableButton = false;
    } else {
      this.disableButton = true;
    }

  }

  addGroup(val) {
    if (this.selectedTeams && this.selectedTeams.length < 3) {
      for (let j = 0; j < this.groupList.length; j++) {
        if (this.groupList[j].id === val.id) {
          this.selectedTeams.unshift(this.groupList[j]);
        }
      }
      for (let i = 0; i < this.selectedTeams.length; i++) {
        this.selectedTeams[i].filter = true;
      }
      this.myGroupArray.forEach((element, index) => {
        if (element.id == val.id) this.myGroupArray.splice(index, 1);
      });


      this.form.get('searchGroup').setValue('');
    }

    if (this.selectedTeams && this.selectedTeams.length < 3) {
      this.disableGroupButton = false;
    } else {
      this.disableGroupButton = true;
    }

  }

  addWorkflow(val) {
    if (this.selectedWorkflow && this.selectedWorkflow.length < 2) {
      for (let j = 0; j < this.workflowList.length; j++) {
        if (this.workflowList[j].processDefinitionId === val.processDefinitionId) {
          this.selectedWorkflow.unshift(this.workflowList[j]);
        }
      }
      for (let i = 0; i < this.selectedWorkflow.length; i++) {
        this.selectedWorkflow[i].filter = true;
      }
      this.myWorkflowArray.forEach((element, index) => {
        if (element.processDefinitionId == val.processDefinitionId) this.myWorkflowArray.splice(index, 1);
      });


      this.form.get('searchWorkflow').setValue('');
    }

    if (this.selectedWorkflow && this.selectedWorkflow.length < 2) {
      this.disableWorkflowButton = false;
    } else {
      this.disableWorkflowButton = true;
    }

  }

  addTaskboard(val) {
    if (this.selectedTaskboard && this.selectedTaskboard.length < 2) {
      for (let j = 0; j < this.taskboardList.length; j++) {
        if (this.taskboardList[j].taskBoardId === val.taskBoardId) {
          this.selectedTaskboard.unshift(this.taskboardList[j]);
        }
      }
      for (let i = 0; i < this.selectedTaskboard.length; i++) {
        this.selectedTaskboard[i].filter = true;
      }
      this.myTaskboardArray.forEach((element, index) => {
        if (element.taskBoardId == val.taskBoardId) this.myTaskboardArray.splice(index, 1);
      });


      this.form.get('searchTaskboard').setValue('');
    }

    if (this.selectedTaskboard && this.selectedTaskboard.length < 2) {
      this.disableTaskboardButton = false;
    } else {
      this.disableTaskboardButton = true;
    }

  }

  addDocument(val) {
    if (this.selectedDocuments && this.selectedDocuments.length < 5) {
      for (let j = 0; j < this.documentsList.length; j++) {
        if (this.documentsList[j].documentId === val.documentId) {
          this.selectedDocuments.unshift(this.documentsList[j]);
        }
      }
      for (let i = 0; i < this.selectedDocuments.length; i++) {
        this.selectedDocuments[i].filter = true;
      }
      this.myDocumentsArray.forEach((element, index) => {
        if (element.documentId == val.documentId) this.myDocumentsArray.splice(index, 1);
      });


      this.form.get('searchDocument').setValue('');
    }

    if (this.selectedDocuments && this.selectedDocuments.length < 5) {
      this.disableDocumentsButton = false;
    } else {
      this.disableDocumentsButton = true;
    }

  }

  addWorkspace(val) {
    if (this.selectedWorkspace && this.selectedWorkspace.length < 2) {
      for (let j = 0; j < this.workspaceList.length; j++) {
        if (this.workspaceList[j].workspaceId === val.workspaceId) {
          this.selectedWorkspace.unshift(this.workspaceList[j]);
        }
      }
      for (let i = 0; i < this.selectedWorkspace.length; i++) {
        this.selectedWorkspace[i].filter = true;
      }
      this.myWorkspaceArray.forEach((element, index) => {
        if (element.workspaceId == val.workspaceId)
          this.myWorkspaceArray.splice(index, 1);
      });


      this.form.get('searchWorkspace').setValue('');
    }

    if (this.selectedWorkspace && this.selectedWorkspace.length < 2) {
      this.disableWorkspaceButton = false;
    } else {
      this.disableWorkspaceButton = true;
    }

  }


  setUserProfilename(user: UserVO): string {
    return user.firstName.charAt(0).toUpperCase();
  }

  setGroupProfilename(group): string {
    return group.name.charAt(0).toUpperCase();
  }

  setWorkflowProfilename(workflow): string {
    return workflow.processDefinitionName.charAt(0).toUpperCase();
  }

  setTaskboardProfilename(taskboard): string {
    return taskboard.name.charAt(0).toUpperCase();
  }

  setDocumentProfilename(document): string {
    return document.documentName.charAt(0).toUpperCase();
  }

  setWorkspaceProfilename(workspace): string {
    return workspace.workspaceName.charAt(0).toUpperCase();
  }

  nextTeam() {
    this.cardType = 'teams';
    this.form.get('teamOption').setValue('1');
  }

  nextWorkflow() {
    this.cardType = 'workflow';
    this.form.get('workflowOption').setValue('1');
    this.updateWorkflowTaskboardAndDocuments()
  }

  updateWorkflowTaskboardAndDocuments() {
    const workflowList = this.myWorkflowArray.filter(t =>
      t.processDefinitionName.includes(this.selectedWorkspace[0].workspaceName) ||
      t.processDefinitionName.includes(this.selectedWorkspace[1].workspaceName)
    );
    this.myWorkflowArray = workflowList;
    const taskboardList = this.myTaskboardArray.filter(t =>
      t.name.includes(this.selectedWorkspace[0].workspaceName) ||
      t.name.includes(this.selectedWorkspace[1].workspaceName)
    );
    this.myTaskboardArray = taskboardList;

    const documentList = this.myDocumentsArray.filter(t =>
      t.documentName.includes(this.selectedWorkspace[0].workspaceName) ||
      t.documentName.includes(this.selectedWorkspace[1].workspaceName)
    );
    this.myDocumentsArray = documentList;

  }

  nextTaskboard() {
    this.cardType = 'taskboard';
    this.form.get('taskboardOption').setValue('1');
  }

  nextDocument() {
    this.cardType = 'document';
    this.form.get('documentOption').setValue('1');
  }

  nextWorkspace() {
    this.cardType = 'workspace';
    this.form.get('workspaceOption').setValue('1');
  }

  userPrevious() {
    this.isDowngrade = false;
  }

  teamsPrevious() {
    this.cardType = 'user';
  }

  workspacePrevious() {
    this.cardType = 'teams';
  }
  workflowPrevious() {
    this.cardType = 'workspace';
  }

  taskboardPrevious() {
    this.cardType = 'workflow';
  }

  documentPrevious() {
    this.cardType = 'taskboard';
  }

  downgradeToFreePlan() {

    const subscriptionVO = new SubscriptionExpireVO();
    subscriptionVO.billingType = 'monthly'
    subscriptionVO.planType = 'STARTER';
    subscriptionVO.customerId = this.customerId;
    subscriptionVO.isUpgrade = true;
    subscriptionVO.subscriptionAmount = 0;
    subscriptionVO.username = this.username;
    const index = this.paymentSubscriptionDetails.findIndex(t => t.planName === 'STARTER');
    subscriptionVO.planId = this.paymentSubscriptionDetails[index].planId;

    if (this.form.get('userOption').value === '1') {
      subscriptionVO.isRandomUser = false;
      this.selectedUsers.forEach(t => {
        subscriptionVO.usersIdList.push(t.userId);
      });
    } else if (this.form.get('userOption').value === '2') {
      subscriptionVO.isRandomUser = true;
      subscriptionVO.usersIdList = [];
    }

    if (this.form.get('teamOption').value === '1') {
      subscriptionVO.isRandomTeam = false;
      this.selectedTeams.forEach(t => {
        subscriptionVO.teamsIdList.push(t.id);
      });
    } else {
      subscriptionVO.isRandomTeam = true;
      subscriptionVO.teamsIdList = [];
    }

    if (this.form.get('workflowOption').value === '1') {
      subscriptionVO.isRandomWorkflow = false;
      this.selectedWorkflow.forEach(t => {
        subscriptionVO.workflowsIdList.push(t.processDefinitionId);
      });
    } else {
      subscriptionVO.isRandomWorkflow = true;
      subscriptionVO.workflowsIdList = [];
    }

    if (this.form.get('taskboardOption').value === '1') {
      subscriptionVO.isRandomTaskboard = false;
      this.selectedTaskboard.forEach(t => {
        subscriptionVO.taskboardsIdList.push(t.taskBoardId);
      });
    } else {
      subscriptionVO.isRandomTaskboard = true;
      subscriptionVO.taskboardsIdList = [];
    }

    if (this.form.get('documentOption').value === '1') {
      subscriptionVO.isRandomDocument = false;
      this.selectedDocuments.forEach(t => {
        subscriptionVO.documentsIdList.push(t.documentId);
      });
    } else {
      subscriptionVO.isRandomDocument = true;
      subscriptionVO.documentsIdList = [];
    }

    if (this.form.get('workspaceOption').value === '1') {
      subscriptionVO.isRandomWorkspace = false;
      this.selectedWorkspace.forEach(t => {
        subscriptionVO.workspaceIdList.push(t.workspaceId);
      });
    } else {
      subscriptionVO.isRandomWorkspace = true;
      subscriptionVO.workspaceIdList = [];
    }
    // this.createOrganizationService.setFreePlan(subscriptionVO).subscribe(updateSub => {
    //   if (updateSub && updateSub.response && updateSub.response.includes('Successfully') && updateSub.startDate) {
    //     this.snackBar.openFromComponent(SnackbarComponent, {
    //       data: 'Your plan will updated from this date(' + this.datePipe.transform(updateSub.startDate, 'MMMM d, y') + ')',
    //     });
    //     this.router.navigate(['/login']);
    //   }
    // });

    const dialog = this.dialog.open(MessageDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { subscriptionVO: subscriptionVO }
    });

  }

  downgrade() {
    this.isDowngrade = true;

    this.service.getAllUsersWithoutWorkspace().subscribe(data => {
      this.usersList = data;
      this.myUserArray = data;
      this.myUserArrayCount = data.length;
      this.form.get('userOption').setValue('1');
      for (let i = 0; i < this.myUserArray.length; i++) {
        this.myUserArray[i].filter = true;
      }
    });

    this.workspaceDashboardService.getActiveTaskboardNameList().subscribe(data => {
      this.taskboardList = data;
      this.myTaskboardArray = data;
      this.myTaskboardArrayCount = data.length;
      for (let i = 0; i < this.myTaskboardArray.length; i++) {
        this.myTaskboardArray[i].filter = true;
      }
    });

    this.workflowDashboardService.getWorkflowDashboardsWithoutWorkspace().subscribe(data => {
      this.workflowList = data;
      this.myWorkflowArray = data;
      this.myWorkflowArrayCount = data.length;
      for (let i = 0; i < this.myWorkflowArray.length; i++) {
        this.myWorkflowArray[i].filter = true;
      }
    });

    this.commonService.getTeamList().subscribe(data => {
      this.groupList = data;
      this.myGroupArray = data;
      this.myGroupArrayCount = data.length;
      for (let i = 0; i < this.myGroupArray.length; i++) {
        this.myGroupArray[i].filter = true;
      }
    });

    this.commonService.getYoroDocsList().subscribe(data => {
      this.documentsList = data;
      this.myDocumentsArray = data;
      this.myDocumentsArrayCount = data.length;
      for (let i = 0; i < this.myDocumentsArray.length; i++) {
        this.myDocumentsArray[i].filter = true;
      }
    });

    this.commonService.getWorkspaceNamesList().subscribe(data => {
      this.workspaceList = data;
      this.myWorkspaceArray = data;

      for (let i = 0; i < this.myWorkspaceArray.length; i++) {
        this.myWorkspaceArray[i].filter = true;
      }
      const workspaceIndex = this.myWorkspaceArray.findIndex(t => t.workspaceName === 'Default Workspace');
      if (workspaceIndex !== -1) {
        this.selectedWorkspace.unshift(this.myWorkspaceArray[workspaceIndex]);
        this.myWorkspaceArray.splice(workspaceIndex, 1);
      }
      this.myWorkspaceArrayCount = this.myWorkspaceArray.length;
    });
  }

  logMeOff() {
    this.service.logout();
    this.router.navigate(['/login']);
  }

}
