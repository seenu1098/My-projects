import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, NgForm, Validators, FormArray, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterEvent } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserVO, RolesListVO, EmailRequestVO, Paginator, EnableTwoFactorVO } from './vo/user-vo';
import { UserService } from './user-service';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { PageService } from '../page/page-service';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { RolesService } from '../user-role-association/roles.service';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { Sort } from '@angular/material/sort';
import { InviteUserComponent } from '../invite-user/invite-user.component';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { debounceTime } from 'rxjs/operators';
import { OrgPrefrenceService } from 'src/app/shared-module/services/org-prefrence.service';
import { Group } from 'src/app/engine-module/group/group-vo';


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  form: FormGroup;
  userVO = new UserVO();
  hide = true;
  readonly = true;
  roleList: RolesListVO[];
  canDeactivateForm: boolean;
  deleteBoolean = true;
  urlData: any;
  hideNew = true;
  hideConfirm = true;
  disabled = false;
  emailVO = new EmailRequestVO();
  isInvite = false;
  isInviteUser = true;
  isInactivateUser = false;
  isPasswordReset = false;
  isReactivateUser = false;
  resendInvite = false;
  url: any[] = [];
  domain: any[] = [];
  isDisable = false;
  groupList: any[];
  isLoadUser = false;
  flexLayout = 'row';
  isMobile: boolean;
  rolesList: any;
  paginationVO = new PaginationVO();
  sort: Sort;
  paginator = new Paginator();
  defaultPageSize = 10;
  defaultColumn = 'createdOn';
  defaultSortDirection = 'desc';
  userVOlist: UserVO[] = [];
  totalRecords: number;
  displayedColumns: string[] = ['checkbox', 'userName', 'firstName', 'lastName', 'authType', 'roles', 'groups', 'isTwoFactor', 'activeFlag', 'contactEmailId', 'lastLogin'];
  selectedIndex: any;
  userId: any;
  user: any;
  rolesPlaceholder: any[] = [];
  isSelected = [];
  isTwoFactor = false;
  userIdList: any[] = [];
  isAllSelected = false;
  inActivateUser = false;
  enableTwoFactorVO = new EnableTwoFactorVO();
  @ViewChild('menuTrigger') input;
  filterCount = 0;
  isClearFilter = false;
  filterRolesList: any
  filterGroupList: any;
  selectedItem = [];
  isLength = false;
  isPaginator = false;
  constructor(private fb: FormBuilder, private service: UserService, private pageService: PageService, private snackBar: MatSnackBar
    , private dialog: MatDialog, private router: Router, private roleservice: RolesService, private orgPrfrenceService: OrgPrefrenceService) {
    if (window.matchMedia('only screen and (max-width: 768px)').matches ||
      window.matchMedia('only screen and (max-width: 1024px)').matches || window.matchMedia('only screen and (max-width: 600px)').matches) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }
  public config: PerfectScrollbarConfigInterface = {};
  @ViewChild('gridConfig', { static: true }) gridConfig: YorogridComponent;
  @ViewChild('gridConfigure', { static: true }) gridConfigure: YorogridComponent;
  @ViewChild('grid', { static: true }) grid: YorogridComponent;

  @Output() public refreshGrid = new EventEmitter<any>();

  dataType = {
    date: [{ value: 'eq', description: 'equals' },
    { value: 'gt', description: 'greater than' },
    { value: 'ge', description: 'greater than or equal to' },
    { value: 'lt', description: 'less than' },
    { value: 'le', description: 'less than or equal to' },
    ],
    string: [
      { value: 'eq', description: 'equals' },
      { value: 'bw', description: 'begins with' },
      { value: 'ew', description: 'ends with' },
      { value: 'cn', description: 'contains' },
    ]
  };
  filterOperator: string;
  isDateField = false;
  columnId: any = 'activeFlag';
  filterDatatype: any = 'string';
  type = 'text';
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  isRoleEditable = false;
  ngOnInit() {
    if (this.isInviteUser === true) {
      this.service.getGroupList().subscribe(data => {
        this.groupList = data;
        this.filterGroupList = data;
        for (let i = 0; i < this.groupList.length; i++) {
          this.groupList[i].isSelected = false;
          this.filterGroupList[i].isSelected = false;
        }
      });
    }

    this.form = this.fb.group({
      isNoRoles: [false],
      searchRoles: [''],
      searchGroup: [''],
      isUnAssigned: [false],
      filterValue: ['Y'],
      operator: ['eq'],
      google: [false],
      microsoft: [false],
      yoroflow: [false],
      isTwoFactorTrue: [false],
      isTwoFactorFalse: [false],
      isActiveTrue: [true],
      isActiveFalse: [false],
      filters: this.fb.array([
        this.addFilter()
      ])
    });
    this.roleservice.getRolesList().subscribe(res => {
      this.rolesList = res;
      this.filterRolesList = res;
      for (let i = 0; i < this.rolesList.length; i++) {
        this.rolesList[i].isSelected = false;
        this.filterRolesList[i].isSelected = false;
      }
      this.filterApply();
    });
    this.searchGroups();
    this.searchRoles();

    this.service.getLoggedInUserDetails().subscribe(data => {
      if (data) {
        if (data.isRoleEditable) {
          this.isRoleEditable = data.isRoleEditable;
        }
      }
    });
  }
  searchRoles(): void {
    this.form.get('searchRoles').valueChanges.pipe(debounceTime(300)).subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        let filterList: any[] = [];
        for (let i = 0; i < this.rolesList.length; i++) {
          const rolesNames = this.rolesList[i].rolesNames.toLowerCase();
          if (rolesNames.includes(filterData)) {
            filterList.push(this.rolesList[i]);
          }
        }
        this.filterRolesList = filterList;
      } else {
        this.filterRolesList = this.rolesList;
      }
    });
  }

  searchGroups(): void {
    this.form.get('searchGroup').valueChanges.pipe(debounceTime(300)).subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        let filterList: any[] = [];
        for (let i = 0; i < this.groupList.length; i++) {
          const name = this.groupList[i].name.toLowerCase();
          if (name.includes(filterData)) {
            filterList.push(this.groupList[i]);
          }
        }
        this.filterGroupList = filterList;
      } else {
        this.filterGroupList = this.groupList;
      }
    });
  }

  addFilter(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      dataType: ['string'],
    });
  }

  getRandomColor() {
    return (
      "#" +
      ("000000" + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
    );
  }

  getUserColor(group: any): string {
    const team = this.groupList.find(g => g.id === group.groupId);
    return team?.color;
  }

  getGroupFirstAndLastNamePrefix(groupName) {
    let name = "";
    let array = groupName.split(' ');
    if (array[0] && array[1]) {
      name = array[0].charAt(0).toUpperCase() + array[1].charAt(0).toUpperCase();
    } else if (array[0]) {
      name = array[0].charAt(0).toUpperCase();
    }
    return name;
  }

  getGroupNames(group) {
    let names = ''
    group.forEach(name => {
      if (names.length > 0) {
        names = ', ' + names + name.groupName;
      } else {
        names = names + name.groupName;
      }
    })
    return names;
  }

  getRemainingAssignedGroupCount(group) {
    return group.length - 4
  }

  sortData(sort: Sort) {
    this.sort = sort;
    this.getAllUsersWithPagination();
  }
  getPagination() {
    if (this.sort === undefined || this.sort.active === undefined || this.sort.active === '') {
      this.paginationVO.columnName = this.defaultColumn;
    } else {
      this.paginationVO.columnName = this.sort.active;
    }
    if (this.sort === undefined || this.sort.direction === '' || this.sort.direction === undefined
      || this.sort.direction === null) {
      this.paginationVO.direction = this.defaultSortDirection;
    } else {
      this.paginationVO.direction = this.sort.direction;
    }
    if (this.paginator.index > 0) {
      this.paginationVO.index = this.paginator.index;
    } else {
      this.paginationVO.index = 0;
    }
    if (this.paginator.pageSize > 0) {
      this.paginationVO.size = this.paginator.pageSize;
    } else {
      this.paginationVO.size = this.defaultPageSize;
    }
    return this.paginationVO;
  }

  pageEvent(event) {
    this.paginator = event;
    this.selectedIndex = null;
    this.getAllUsersWithPagination();
  }

  getAllUsersWithPagination() {
    this.paginationVO = this.getPagination();
    this.paginationVO.isNoRoles = this.form.get('isNoRoles').value;
    this.paginationVO.isUnAssigned = this.form.get('isUnAssigned').value;
    this.service.getAllUsersListWithPagination(this.paginationVO).subscribe(data => {
      this.userVOlist = data.userVoList;
      this.totalRecords = data.totalRecords;
      if (this.totalRecords !== 0) {
        this.isPaginator = true;
        this.isLength = true;
      }
      else {
        this.isPaginator = false;
        this.isLength = false;
      }
    });
  }

  getAllUsersWithNoRolesOrUnAssigned(event) {
    if (event.checked === true) {
      this.isClearFilter = true;
      const index = this.selectedItem.findIndex(t => t === this.columnId);
      if (index === -1) {
        this.selectedItem.push(this.columnId);
      }
    } else {
      this.isClearFilter = false;
    }
    this.getAllUsersWithPagination();
  }

  // getGroupNames

  // setGroupColor(userVOlist) {
  //   for (let i = 0; i < userVOlist.length; i++) {
  //     if (userVOlist[i].groupVOList && userVOlist[i].groupVOList.length > 0) {
  //       for (let j = 0; j < userVOlist[i].groupVOList; j++) {
  //         userVOlist[i].groupVOList
  //       }

  //     }
  //   }
  // }

  inviteUser() {
    this.isInvite = false;
    this.isInviteUser = true;
    const openUserDialog = this.dialog.open(InviteUserComponent, {
      disableClose: true,
      width: '1200px',
      data: {
        user: this.user,
        userId: this.userId,
        isInviteUser: this.isInviteUser,
        isLoadUser: false,
        isInactivateUser: false,
        isPasswordReset: false,
        isReactivateUser: false,
        isFromGrid: false
      },
      panelClass: 'task-property-dialogBox'
    });
    openUserDialog.afterClosed().subscribe(data => {
      if (data) {
        this.getAllUsersWithPagination();
      }
    });
  }
  openUserConfig($event, user, i) {
    this.userVO = user;
    const index = this.userIdList.findIndex(t => t === user.userId);
    if ($event.checked === true) {
      this.isTwoFactor = true;
      this.inActivateUser = true;
      this.isSelected[i] = true;
      this.selectedIndex = i;
      this.user = user;
      this.userId = user.userId;
      if (index === -1) {
        this.userIdList.push(user.userId);
      }
    } else {
      if (index !== -1) {
        this.userIdList.splice(index, 1);
      }
      this.isSelected[i] = false;
      this.selectedIndex = null;
      this.isPasswordReset = false;
      this.isReactivateUser = false;
      let reset = true;
      for (let i = 0; i < this.userVOlist.length; i++) {
        if (this.isSelected[i] === false) {
          reset = false;
        }
      }
      if (reset === false) {
        this.isAllSelected = false;
      }

      let resetTwoFactor = false;
      for (let i = 0; i < this.userVOlist.length; i++) {
        if (this.isSelected[i] === true) {
          resetTwoFactor = true;
        }
      }
      if (resetTwoFactor === false) {
        this.isTwoFactor = false;
        this.inActivateUser = false;
      }
    }
  }
  inActivateUserFromGrid() {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      data: { type: 'user-management', userType: 'inactivateUser' }
    });
    dialog.afterClosed().subscribe(data => {
      if (data === 'yes') {
        this.enableTwoFactorVO.userIdList = this.userIdList;
        this.service.inActivateAllUsers(this.enableTwoFactorVO).subscribe(data => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response
          });
          this.getAllUsersWithPagination();
          this.isTwoFactor = false;
          this.isAllSelected = false;
          this.inActivateUser = false;
          for (let i = 0; i < this.isSelected.length; i++) {
            this.isSelected[i] = false;
          }
        });
      }
    });
  }
  enableTwoFactorAuth() {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      data: { type: 'enable-two-factor' }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.enableTwoFactorVO.isEnableAll = this.isAllSelected;
        if (this.enableTwoFactorVO.isEnableAll === false) {
          this.enableTwoFactorVO.userIdList = this.userIdList;
        } else {
          this.enableTwoFactorVO.userIdList = [];
        }
        this.service.enableTwoFactorAuth(this.enableTwoFactorVO).subscribe(data => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response
          });
          this.isTwoFactor = false;
          this.isAllSelected = false;
          this.inActivateUser = false;
          this.getAllUsersWithPagination();
          for (let i = 0; i < this.isSelected.length; i++) {
            this.isSelected[i] = false;
          }
        });
      }
    });
  }
  selectAllUsers($event) {
    if ($event.checked === true) {
      this.isAllSelected = true;
      this.isTwoFactor = true;
      this.inActivateUser = true;
      for (let i = 0; i < this.userVOlist.length; i++) {
        this.isSelected[i] = true;
      }
    } else {
      this.isAllSelected = false;
      this.isTwoFactor = false;
      this.inActivateUser = false;
      for (let i = 0; i < this.userVOlist.length; i++) {
        this.isSelected[i] = false;
      }
    }
  }
  inactivateUser() {
    this.isInvite = false;
    this.resendInvite = false;
    this.form.get('emailId').disable();
    this.form.get('userName').disable();
    this.form.get('firstName').disable();
    this.form.get('lastName').disable();
    this.form.get('contactEmailId').disable();
    this.form.get('mobileNumber').disable();
    this.form.get('groupId').disable();
    this.isInviteUser = false;
    this.isInactivateUser = true;
    this.isPasswordReset = false;
    this.isReactivateUser = false;
    this.form.get('emailId').setValue('');
    this.form.get('userName').setValue('');
    this.form.get('firstName').setValue('');
    this.form.get('lastName').setValue('');
    this.form.get('contactEmailId').setValue('');
    this.form.get('mobileNumber').setValue('');
    this.form.get('groupId').setValue('');
  }

  passwordReset() {
    this.isInvite = false;
    this.isPasswordReset = true;
    const openUserDialog = this.dialog.open(InviteUserComponent, {
      disableClose: true,
      width: '1200px',
      data: {
        user: this.user,
        userId: this.userId,
        isInviteUser: this.isInviteUser,
        isLoadUser: this.isLoadUser,
        isInactivateUser: this.isInactivateUser,
        isPasswordReset: this.isPasswordReset,
        isReactivateUser: this.isReactivateUser,
        isFromGrid: false
      },
      panelClass: 'task-property-dialogBox'
    });
    openUserDialog.afterClosed().subscribe(data => {
      if (data) {
        this.getAllUsersWithPagination();
        this.selectedIndex = null;
        this.isInactivateUser = false;
        this.isPasswordReset = false;
        this.isReactivateUser = false;
      }
    });
  }

  reactivateUser() {
    this.isInvite = false;
    this.resendInvite = false;
    this.form.get('emailId').disable();
    this.form.get('userName').disable();
    this.form.get('firstName').disable();
    this.form.get('lastName').disable();
    this.form.get('contactEmailId').disable();
    this.form.get('mobileNumber').disable();
    this.form.get('groupId').disable();
    this.isInviteUser = false;
    this.isInactivateUser = false;
    this.isPasswordReset = false;
    this.isReactivateUser = true;
    this.form.get('emailId').setValue('');
    this.form.get('userName').setValue('');
    this.form.get('firstName').setValue('');
    this.form.get('lastName').setValue('');
    this.form.get('contactEmailId').setValue('');
    this.form.get('mobileNumber').setValue('');
    this.form.get('groupId').setValue('');
  }

  resetGrid() {
    for (let i = 0; i < this.isSelected.length; i++) {
      this.isSelected[i] = false;
    }
    this.isTwoFactor = false;
    this.userIdList = [];
  }

  deactivateUser(userForm) {
    let user: string;
    let response: string;
    if (this.isInactivateUser) {
      user = 'inactivateUser';
      this.isInviteUser = false;
      this.isReactivateUser = false;
      this.isPasswordReset = false;
      this.isInactivateUser = true;
    } else {
      user = 'reactivateUser';
      this.isInviteUser = false;
      this.isReactivateUser = true;
      this.isPasswordReset = false;
      this.isInactivateUser = false;
    }

    const openUserDialog = this.dialog.open(InviteUserComponent, {
      disableClose: true,
      width: '1200px',
      data: {
        user: this.user,
        userId: this.userId,
        isInviteUser: this.isInviteUser,
        isLoadUser: this.isLoadUser,
        isInactivateUser: this.isInactivateUser,
        isPasswordReset: this.isPasswordReset,
        isReactivateUser: this.isReactivateUser,
        isFromGrid: true
      },
      panelClass: 'task-property-dialogBox'
    });
    openUserDialog.afterClosed().subscribe(data => {
      if (data) {
        this.getAllUsersWithPagination();
        this.selectedIndex = null;
        this.isInactivateUser = false;
        this.isPasswordReset = false;
        this.isReactivateUser = false;
      }
    });
    // const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
    //   width: '400px',
    //   data: { type: 'user-management', userType: user }
    // });
    // dialog.afterClosed().subscribe(data => {
    //   if (data === 'yes') {
    //     this.isInvite = false;
    //     this.userVO.recipientEmails = this.form.get('contactEmailId').value;
    //     this.url = window.location.href.split("//", 2);
    //     this.domain = this.url[1].split("/", 2);
    //     if (user === 'inactivateUser') {
    //       this.userVO.subject = ' has deactivated your account at ' + this.domain[0];
    //       response = 'Deactivated mail send successfully';
    //     } else {
    //       this.userVO.subject = ' has reactivated your account at ' + this.domain[0];
    //       response = 'Reactivated mail send successfully';
    //     }
    //     this.userVO.messageBody = 'Your account is deactivated';
    //     this.userVO.inviteUser = 'deactivate';
    //     this.service.sendMail(this.userVO).subscribe(emaildata => {
    //       if (emaildata.response) {
    //         if (emaildata.response.includes('Does not deactive the first user')) {
    //           const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
    //             width: '400px',
    //             data: 'deactive the first user'
    //           });
    //         } else {
    //           this.snackBar.openFromComponent(SnackbarComponent, {
    //             data: response
    //           });
    //         }
    //         userForm.resetForm();
    //       }
    //       this.refreshGrid.emit(true);
    //     });
    //   }
    // });
  }

  submit(userForm) {
    this.userVO = this.form.getRawValue();
    this.updateValidatorsForsubmit('user');
    if (userForm.valid) {
      this.isDisable = true;
      this.userVO = this.form.getRawValue();
      this.userVO.recipientEmails = this.form.get('contactEmailId').value;
      this.userVO.subject = ' has invited you to join Yoroflow ';
      this.userVO.userName = this.form.get('emailId').value;
      this.userVO.messageBody = this.form.get('emailId').value;
      this.userVO.userName = this.form.get('emailId').value;
      this.userVO.inviteUser = 'invite';
      // this.userVO.groupId = this.form.get('groupId').value;
      this.service.createUser(this.userVO).subscribe(data => {
        if (data.response.includes('created')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.userVO.userId = data.responseId;
          if (data.responseId !== null && data.responseId !== undefined && data.responseId !== '') {
            // this.service.associateGroup(this.userVO).subscribe(dataa => {
            // });
          }
          userForm.resetForm();
          this.refreshGrid.emit(true);
        } else if (data.response.includes('already exists')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
        } else if (data.response.includes('Resend invite user')) {
          this.userVO.recipientEmails = this.form.get('contactEmailId').value;
          this.userVO.subject = ' has invited you to join Yoroflow';
          this.userVO.messageBody = this.form.get('emailId').value;
          this.userVO.inviteUser = 'resend';
          this.service.sendMail(this.userVO).subscribe(emaildata => {
            if (emaildata.response) {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'Resend invite email',
              });
            }
            userForm.resetForm();
            this.refreshGrid.emit(true);
          });
        } else {
          const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
            width: '450px',
            data: { type: 'lastlogin', data: data.response }
          });
        }
        this.readonly = true;
        this.isDisable = false;
      });
    }
  }

  receiveMessage(user): void {
    this.userVO = user;
    if ((user.lastLogin !== null || user.lastLogin === null) && user.activeFlag === 'Y') {
      this.isInactivateUser = true;
      this.isReactivateUser = false;
      this.isPasswordReset = true;
    } else if (user.activeFlag === 'N') {
      this.isReactivateUser = true;
      this.isInactivateUser = false;
      this.isPasswordReset = false;
    } else {
      this.isPasswordReset = true;
    }

    const openUserDialog = this.dialog.open(InviteUserComponent, {
      disableClose: true,
      width: '1200px',
      data: {
        user: user,
        userId: user.userId,
        isInviteUser: false,
        isLoadUser: this.isLoadUser,
        isInactivateUser: this.isInactivateUser,
        isPasswordReset: this.isPasswordReset,
        isReactivateUser: this.isReactivateUser,
        isFromGrid: true,
        isRoleEditable: this.isRoleEditable
      },
      panelClass: 'task-property-dialogBox'
    });

    openUserDialog.afterClosed().subscribe(data => {
      if (data) {
        this.getAllUsersWithPagination();
      }
    });
  }

  changePassword(userForm) {
    this.isInvite = false;
    this.userVO.recipientEmails = this.form.get('contactEmailId').value;
    this.userVO.subject = ' has changed your password';
    this.userVO.messageBody = 'Your password is changed';
    this.userVO.inviteUser = 'changePassword';
    this.service.sendMail(this.userVO).subscribe(emaildata => {
      if (emaildata.response) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Password changed email send successfully',
        });
      }
      userForm.resetForm();
    });
    this.refreshGrid.emit(true);
  }

  reset() {
    this.isInvite = false;
    this.resendInvite = false;
    this.form.get('firstName').reset();
    this.form.get('lastName').reset();
    this.form.get('emailId').reset();
    this.form.get('contactEmailId').reset();
    this.form.get('userName').reset();
    this.form.get('mobileNumber').reset();
    this.form.get('userId').reset();
    this.form.get('groupId').reset();
    this.canDeactivateForm = false;
    this.deleteBoolean = true;
    this.readonly = true;
    this.isDisable = false;
    if (this.isInviteUser) {
      this.form.get('emailId').enable();
      this.form.get('firstName').enable();
      this.form.get('lastName').enable();
      this.form.get('contactEmailId').enable();
      this.form.get('mobileNumber').enable();
      this.form.get('groupId').enable();
      this.form.get('emailId').setErrors(null);
      this.form.get('firstName').setErrors(null);
      this.form.get('lastName').setErrors(null);
      this.form.get('contactEmailId').setErrors(null);
      this.form.get('mobileNumber').setErrors(null);
      this.form.get('groupId').setErrors(null);
      this.isLoadUser = false;
    }
  }


  getRouterLink(): any {
    this.router.events.subscribe((data: RouterEvent) => {
      this.urlData = {
        type: 'navigation', target: data.url
      };
    });
    return this.urlData;
  }

  updateValidatorsForsubmit(value: string) {
    const password = this.form.get('password');
    const confirmPassword = this.form.get('confirmPassword');
    const firstName = this.form.get('firstName');
    const lastName = this.form.get('lastName');
    const emailId = this.form.get('emailId');
    const contactEmailId = this.form.get('contactEmailId');
    const userName = this.form.get('userName');
    if (value === 'user') {
      firstName.setValidators([Validators.required]);
      lastName.setValidators([Validators.required]);
      emailId.setValidators([Validators.required, Validators.email]);
      contactEmailId.setValidators([Validators.required, Validators.email]);
      password.setValidators(null);
      confirmPassword.setValidators(null);
      userName.setValidators(null);
    } else {
      firstName.setValidators(null);
      lastName.setValidators(null);
      emailId.setValidators(null);
      contactEmailId.setValidators(null);
      password.setValidators([Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#^])(?=.*[0-9])[A-Za-z@$!%*?&#^0-9]{6,50}$')]);
      confirmPassword.setValidators([Validators.required]);
      userName.setValidators([Validators.required]);
    }
    confirmPassword.updateValueAndValidity();
    password.updateValueAndValidity();
    firstName.updateValueAndValidity();
    lastName.updateValueAndValidity();
    emailId.updateValueAndValidity();
    contactEmailId.updateValueAndValidity();
    userName.updateValueAndValidity();
  }

  passwordValidation() {
    const lower = /[a-z]/g;
    const upper = /[A-Z]/g;
    const numbers = /[0-9]/g;
    const splChar = /[!@#$%^&*?.,]/g;
    this.form.get('password').valueChanges.subscribe(data => {
      if (data !== null && data !== '' && data !== undefined) {
        if (data.length < 6) {
          return this.form.get('password').setErrors({ min: true });
        } else if (data.length > 50) {
          return this.form.get('password').setErrors({ max: true });
        } else {
          if (!data.match(lower)) {
            return this.form.get('password').setErrors({ lower: true });
          } else if (!data.match(upper)) {
            return this.form.get('password').setErrors({ upper: true });
          } else if (!data.match(numbers)) {
            return this.form.get('password').setErrors({ number: true });
          } else if (!data.match(splChar)) {
            return this.form.get('password').setErrors({ splChar: true });
          } else {
            return this.form.get('password').setErrors(null);
          }
        }
      }
    });
  }

  addValidations() {
    this.form.get('filterValue').setValidators([Validators.required]);
    this.form.get('operator').setValidators([Validators.required]);
    this.form.get('filterValue').updateValueAndValidity();
    this.form.get('operator').updateValueAndValidity();
  }

  removeValidations() {
    this.form.get('filterValue').setValidators(null);
    this.form.get('operator').setValidators(null);
    this.form.get('filterValue').updateValueAndValidity();
    this.form.get('operator').updateValueAndValidity();
  }

  setDataType(headerDetails, datatype) {
    if (headerDetails === 'lastLogin') {
      this.filterOperator = 'date';
      this.isDateField = true;
      this.type = null;
    } else {
      this.filterOperator = 'string';
      this.isDateField = false;
      this.type = 'text';
    }
    this.filterDatatype = datatype;
    this.columnId = headerDetails;
    let form = (this.form.get('filters') as FormArray);
    this.form.get('filterValue').setValue(null);
    this.form.get('operator').setValue(null);
    for (let i = 0; i < form.length; i++) {
      if (form.get('' + i).get('filterIdColumn').value && form.get('' + i).get('filterIdColumn').value === this.columnId) {
        this.form.get('filterValue').setValue(form.get('' + i).get('filterIdColumnValue').value);
        this.form.get('operator').setValue(form.get('' + i).get('operators').value);
        this.form.get('filterValue').setValidators(null);
        this.form.get('filterValue').setErrors(null);
        this.form.get('operator').setErrors(null);
      }
    }
  }

  filterApply() {
    let setFilter = false;
    this.isClearFilter = true;
    this.addValidations();
    const length = (this.form.get('filters') as FormArray).length
    if (length === 0) {
      (this.form.get('filters') as FormArray).push(this.addFilter());
    }
    for (let i = 0; i < (this.form.get('filters') as FormArray).length; i++) {
      if (this.form.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        this.form.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        this.form.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.form.get('filterValue').value);
        this.form.get('filters').get('' + i).get('operators').setValue(this.form.get('operator').value);
        this.form.get('filters').get('' + i).get('dataType').setValue(this.filterDatatype);
      } else {
        let array = [];
        array.push((this.form.get('filters') as FormArray).value);
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCount++;
          if (this.filterCount > 1) {
            (this.form.get('filters') as FormArray).push(this.addFilter());
          }
          let length = (this.form.get('filters') as FormArray).length - 1;
          this.form.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          this.form.get('filters').get('' + length).get('filterIdColumnValue').setValue(this.form.get('filterValue').value);
          this.form.get('filters').get('' + length).get('operators').setValue(this.form.get('operator').value);
          this.form.get('filters').get('' + length).get('dataType').setValue(this.filterDatatype);
        }
      }
    }
    this.paginationVO.index = 0;
    if (this.form.valid) {
      const index = this.selectedItem.findIndex(t => t === this.columnId);
      if (index === -1) {
        this.selectedItem.push(this.columnId);
      }
      this.input.closeMenu();
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.paginator.index = 0;
      this.paginator.pageSize = 10;
      this.getAllUsersWithPagination();
      this.removeValidations();
      this.emptyPaginator();

    }
  }
  emptyPaginator() {
    this.isPaginator = false;
    this.isLength = false;
  }

  addFilterForRolesOrGroups(event, columnName, filterValue) {
    if (event.checked === true) {
      const index = this.selectedItem.findIndex(t => t === this.columnId);
      if (index === -1) {
        this.selectedItem.push(this.columnId);
      }
      if (columnName === 'roles') {
        const index = this.filterRolesList.findIndex(t => t.id === filterValue);
        if (index !== -1) {
          this.filterRolesList[index].isSelected = true;
        }
      }

      if (columnName === 'groups') {
        const index = this.filterGroupList.findIndex(t => t.id === filterValue);
        if (index !== -1) {
          this.filterGroupList[index].isSelected = true;
        }
      }

      this.isClearFilter = true;
      (this.form.get('filters') as FormArray).push(this.addFilter());
      const newLength = (this.form.get('filters') as FormArray).length;
      this.form.get('filters').get('' + (newLength - 1)).get('filterIdColumn').setValue(columnName);
      this.form.get('filters').get('' + (newLength - 1)).get('filterIdColumnValue').setValue(filterValue);
      this.form.get('filters').get('' + (newLength - 1)).get('operators').setValue('eq');
      this.paginationVO.index = 0;
      this.input.closeMenu();
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.paginator.index = 0;
      this.paginator.pageSize = 10;
      this.getAllUsersWithPagination();
      this.removeValidations();
      this.emptyPaginator();
    } else {
      const index = this.selectedItem.findIndex(t => t === this.columnId);
      if (index !== -1) {
        this.selectedItem.splice(index, 1);
      }
      if (columnName === 'roles') {
        const index = this.filterRolesList.findIndex(t => t.id === filterValue);
        if (index !== -1) {
          this.filterRolesList[index].isSelected = false;
        }
      }

      if (columnName === 'groups') {
        const index = this.filterGroupList.findIndex(t => t.id === filterValue);
        if (index !== -1) {
          this.filterGroupList[index].isSelected = false;
        }
      }

      const formArray = (this.form.get('filters') as FormArray);
      const length = formArray.length;
      for (let i = 0; i < length; i++) {
        const form = this.form.get('filters');
        if (form.get('' + i).get('filterIdColumnValue').value === filterValue) {
          formArray.removeAt(i);
        }
      }

      this.paginationVO.index = 0;
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.paginator.index = 0;
      if (form.length === 1 && form.get(0 + '').get('filterIdColumnValue').value === '') {
        this.isClearFilter = false;
      }
      this.paginationVO.filterValue = form.value;
      this.paginator.index = 0;
      this.paginator.pageSize = 10;
      this.getAllUsersWithPagination();
      this.removeValidations();
      this.emptyPaginator();
    }

  }


  clearFilter() {
    const index = this.selectedItem.findIndex(t => t === this.columnId);
    if (index !== -1) {
      this.selectedItem.splice(index, 1);
    }
    this.isClearFilter = false;
    this.form.get('isNoRoles').setValue(false);
    this.form.get('isUnAssigned').setValue(false);
    this.form.get('isTwoFactorTrue').setValue(false);
    this.form.get('isTwoFactorFalse').setValue(false);
    this.form.get('isActiveTrue').setValue(false);
    this.form.get('isActiveFalse').setValue(false);
    if ((this.form.get('filterValue').value !== null || this.form.get('filterValue').value !== undefined || this.form.get('filterValue').value !== '')
      && (this.form.get('operator').value !== null || this.form.get('operator').value !== undefined || this.form.get('operator').value !== '')) {
      this.form.get('filterValue').setValue(null);
      this.form.get('operator').setValue(null);
      this.filterCount--;
      for (let i = 0; i < (this.form.get('filters') as FormArray).length; i++) {
        if (this.form.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.form.get('filters') as FormArray).removeAt(i);
          this.input.closeMenu();
          this.paginationVO.index = 0;
          this.paginator.pageSize = 10;
          const form = (this.form.get('filters') as FormArray);
          this.paginationVO.filterValue = form.value;
          this.getAllUsersWithPagination();
        }
      }
    }
  }

  isSelectedColumn(columnName) {
    const index = this.selectedItem.findIndex(t => t === columnName);
    if (index !== -1) {
      return true;
    } else {
      return false;
    }
  }

  clearFilterFromGrid() {
    for (let i = 0; i < this.groupList.length; i++) {
      this.groupList[i].isSelected = false;
    }
    for (let i = 0; i < this.rolesList.length; i++) {
      this.rolesList[i].isSelected = false;
    }

    this.isClearFilter = false;
    this.form.get('isNoRoles').setValue(false);
    this.form.get('isUnAssigned').setValue(false);
    this.form.get('google').setValue(false);
    this.form.get('microsoft').setValue(false);
    this.form.get('yoroflow').setValue(false);
    this.form.get('isTwoFactorTrue').setValue(false);
    this.form.get('isTwoFactorFalse').setValue(false);
    this.form.get('isActiveTrue').setValue(false);
    this.form.get('isActiveFalse').setValue(false);
    this.paginationVO.filterValue = [];
    const form = (this.form.get('filters') as FormArray);
    form.clear();
    this.paginator.pageSize = 10;
    this.paginator.index = 0;
    this.columnId = '';
    this.selectedItem = [];
    this.getAllUsersWithPagination();
    this.emptyPaginator();
  }

}

