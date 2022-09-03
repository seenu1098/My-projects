import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatMenu } from '@angular/material/menu';

import { DynamicMenuService } from './dynamic-menu.service';
import { UserService } from '../shared/service/user-service';
import { UserVO } from '../shared/vo/user-vo';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationProvisionService } from '../application-provision/application-provision-service';
import { MenuDetailsVO } from '../shared/vo/menu-vo';
import { Application } from '../application-provision/appication-vo';
import { DomSanitizer } from '@angular/platform-browser';
import { StompClientService } from 'src/app/message-module/stomp-client.service';
import { WorkflowDashboardService } from 'src/app/engine-module/work-flow-dashboard/workflow-dashboard.service';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { MatDialog } from '@angular/material/dialog';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
@Component({
  selector: 'app-dynamic-menu',
  templateUrl: './dynamic-menu.component.html',
  styleUrls: ['./dynamic-menu.component.css']
})
export class DynamicMenuComponent implements OnInit {
  @Input() id: any;
  @Input() application: Application;
  @Input() hideLogo: boolean;

  menuOptions: MenuDetailsVO[] = [];
  userVo = new UserVO();
  routerUrl: string;
  nestMenu: string;
  selected: string;
  logoUrl: any;
  showLogo = true;
  base64Image: string;
  isLoad = false;
  isTablet: boolean;
  @Output() menuEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() isNotificationOpened: EventEmitter<any> = new EventEmitter<any>();
  @Output() isMessageOpened: EventEmitter<any> = new EventEmitter<any>();
  @Output() messageObject: EventEmitter<any> = new EventEmitter<any>();
  @Output() notificationObject: EventEmitter<any> = new EventEmitter<any>();
  @Output() pinEmitter: EventEmitter<any> = new EventEmitter<any>();
  isMobile: boolean;
  isAllowed = true;
  isMessageAllowed = false;
  isNotificationAllowed = false;
  licenseVO = new LicenseVO();
  constructor(private dialog: MatDialog, private workflowDashboardService: WorkflowDashboardService, private dynamicMenuService: DynamicMenuService, private stomClientService: StompClientService,
    private service: UserService, private router: Router, private appService: ApplicationProvisionService,
    private sanitizer: DomSanitizer, private workspaceService: WorkspaceService) {
    this.selected = 'en';
    if (window.matchMedia('only screen and (max-width: 600px)').matches ||
      window.matchMedia('only screen and (max-width: 768px)').matches ||
      window.matchMedia('only screen and (max-width: 1024px)').matches) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  options = [
    {
      name: 'English',
      value: 'en'
    },
    {
      name: 'French',
      value: 'fr'
    }
  ];

  test = [];

  ngOnInit() {

    this.loadApplicationLogo();
    this.checkMessageLicense();
    this.checkNotificationLicense();
    if (!this.isMobile) {
      this.dynamicMenuService.getAllMenusDetails(this.id).subscribe(data => {
        this.menuOptions = data;
        this.loadDefaultRoute();
      });
    } else {
      this.menuOptions = MOBILE_MENU_OPTION;
    }

    this.service.getLoggedInUserDetails().subscribe(data => {
      if (data) {
        this.userVo = data;
        this.base64Image = this.userVo.profilePicture;
        this.isLoad = true;
        this.service.getUserProfilePicture().subscribe(profile => {
          this.userVo.profilePicture = profile.profilePicture;
          this.base64Image = this.userVo.profilePicture;
        });
      }
    });
  }

  checkMessageLicense() {
    this.licenseVO.category = 'notifications';
    this.licenseVO.featureName = 'sms';
    this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'Y') {
        this.isMessageAllowed = true;
      }
    });
  }

  checkNotificationLicense() {
    this.licenseVO.category = 'notifications';
    this.licenseVO.featureName = 'custom_notification';
    this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'Y') {
        this.isNotificationAllowed = true;
      }
    });
  }

  routerLink(path) {
    if (path && path.includes('/yoroflow-design/create')) {
      this.licenseVO.category = 'general';
      this.licenseVO.featureName = 'workflows';
      this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
        if (data.response.includes('exceeded')) {
          const dialog = this.dialog.open(AlertmessageComponent, {
            width: '450px',
            data: data
          });
        } else {
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/yoroflow-design/create']);
        }
      });
    } else {
      this.router.navigate([path]);
    }
  }

  transformImage(profilePicture) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
  }

  loadDefaultRoute() {
    const routeUrl = this.router.url;
    if (routeUrl.includes('/app') && !routeUrl.includes('app/edit') && !routeUrl.includes('app/create')) {
      this.menuOptions.forEach(parentMenu => {
        if (parentMenu.version !== null && parentMenu.pageId !== null && !routeUrl.includes('/page')) {
          this.router.navigateByUrl(routeUrl + '/page/' + parentMenu.pageId + '/' + parentMenu.version);
        } else if (routeUrl.includes('/app') && parentMenu.dynamicMenus !== null && !routeUrl.includes('page')) {
          parentMenu.dynamicMenus.forEach(childMenu => {
            if (childMenu.version !== null && childMenu.pageId !== null) {
              this.router.navigateByUrl(routeUrl + '/page/' + childMenu.pageId + '/' + childMenu.version);
            }
          });
        }
      });
    } else {

    }
  }

  getMessageObject($event) {
    this.messageObject.emit($event);
  }

  getNotificationObject($event) {
    this.notificationObject.emit($event);
  }

  getNotification($event) {
    this.menuEmitter.emit($event);
  }

  pinClicked() {
    this.pinEmitter.emit(true);
  }

  marketPlaceClicked() {
    this.router.navigate(['/market-place']);
  }

  getNotificationOpened($event) {
    this.isNotificationOpened.emit($event);
  }

  getMessageOpened($event) {
    this.isMessageOpened.emit($event);
  }

  loadApplicationLogo() {
    if (this.application.logo === null) {
      this.showLogo = false;
    } else {
      this.logoUrl = this.application.logo;
    }

  }

  logout() {
    this.service.logout();
    try {
      if (this.stomClientService.stompClient) {
        this.stomClientService.stompClient.disconnect();
      }
    } catch (e) {
    }
    this.router.navigate(['/login']);
  }

  openPage(pageId) {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/pa', pageId]);
  }

  changePassword() {
    this.router.navigate(['/change-password']);
  }

  userProfile() {
    this.router.navigate(['/user-profile']);
  }

  userProfileValue(str) {
    if (str) {
      const assignee = str.split(' ');
      for (let i = 0; i < assignee.length; i++) {
        assignee[i] = assignee[i].charAt(0).toUpperCase();
      }
      return assignee.join('');
    }
  }

}

const MOBILE_MENU_OPTION: MenuDetailsVO[] = [
  {
    id: 'f99f201b-350b-4eff-9898-1b2b4b896360',
    menuName: 'Workflow',
    pageName: null,
    pageId: null,
    parentMenuId: null,
    displayOrder: 2,
    parentMenu: null,
    pageType: null,
    menuPath: '',
    customPageId: null,
    version: null,
    dynamicMenus: [
      {
        id: '8863d442-22db-4d18-97b8-903492c078ff',
        menuName: 'Dashboard',
        pageName: null,
        pageId: null,
        parentMenuId: 'f99f201b-350b-4eff-9898-1b2b4b896360',
        displayOrder: 1,
        parentMenu: 'Workflow',
        pageType: null,
        menuPath: 'dashboard',
        customPageId: '7644318d-afff-4a4f-8cd8-db88a7872b51',
        version: 1,
        dynamicMenus: null,
        style: null,
        icon: null,
        openPanel: false
      },
      {
        id: '8b87672a-3726-4a72-be97-b06091091aef',
        menuName: 'Workflow Applications',
        pageName: null,
        pageId: null,
        parentMenuId: 'f99f201b-350b-4eff-9898-1b2b4b896360',
        displayOrder: 3,
        parentMenu: 'Workflow',
        pageType: null,
        menuPath: 'workflow-application',
        customPageId: '6d94cc3d-9f2e-4784-9512-12cf30c808e0',
        version: 1,
        dynamicMenus: null,
        style: null,
        icon: null,
        openPanel: false
      }
    ],
    style: null,
    icon: null,
    openPanel: false
  },
  {
    id: '0085bcba-5e36-4e5b-b680-f23a5c6f2ba1',
    menuName: 'My Tasks',
    pageName: null,
    pageId: null,
    parentMenuId: null,
    displayOrder: 3,
    parentMenu: null,
    pageType: null,
    menuPath: 'my-pending-task',
    customPageId: '21b8264a-a55b-4672-b8c1-68b03bbbfb75',
    version: 1,
    dynamicMenus: null,
    style: null,
    icon: null,
    openPanel: false
  },
  {
    id: '6936fb8d-0291-4068-9f2f-1de17425757a',
    menuName: 'Tasks',
    pageName: null,
    pageId: null,
    parentMenuId: null,
    displayOrder: 4,
    parentMenu: null,
    pageType: null,
    menuPath: '',
    customPageId: null,
    version: null,
    dynamicMenus: [
      {
        id: '50c2ceab-d797-46bf-b12f-d10a24399771',
        menuName: 'My Launches',
        pageName: null,
        pageId: null,
        parentMenuId: '6936fb8d-0291-4068-9f2f-1de17425757a',
        displayOrder: 2,
        parentMenu: 'Tasks',
        pageType: null,
        menuPath: 'my-launched-task',
        customPageId: 'b9de72ee-c965-4455-9311-ab8900e1ad7e',
        version: 1,
        dynamicMenus: null,
        style: null,
        icon: null,
        openPanel: false
      },
      {
        id: 'ddcaad42-374a-474d-8323-4b8f3d68a317',
        menuName: 'Completed Tasks',
        pageName: null,
        pageId: null,
        parentMenuId: '6936fb8d-0291-4068-9f2f-1de17425757a',
        displayOrder: 3,
        parentMenu: 'Tasks',
        pageType: null,
        menuPath: 'my-done-task',
        customPageId: '1757435a-426a-4034-8252-ea91d5a7c6f1',
        version: 1,
        dynamicMenus: null,
        style: null,
        icon: null,
        openPanel: false
      }
    ],
    style: null,
    icon: null,
    openPanel: false
  },
  {
    id: 'dc829215-2276-488c-a9a2-4d1b67436ad3',
    menuName: 'Application',
    pageName: null,
    pageId: null,
    parentMenuId: null,
    displayOrder: 5,
    parentMenu: null,
    pageType: null,
    menuPath: '',
    customPageId: null,
    version: null,
    dynamicMenus: [
      {
        id: '36fc6b9f-1f89-46ae-8c17-6761072a01d0',
        menuName: 'Dashboard',
        pageName: null,
        pageId: null,
        parentMenuId: 'dc829215-2276-488c-a9a2-4d1b67436ad3',
        displayOrder: 1,
        parentMenu: 'Application',
        pageType: null,
        menuPath: 'application-dashboard',
        customPageId: 'be25720b-6dbf-4016-9635-b7a947866601',
        version: 1,
        dynamicMenus: null,
        style: null,
        icon: null,
        openPanel: false
      }
    ],
    style: null,
    icon: null,
    openPanel: false
  },
  {
    id: '2e463d60-466a-4574-a005-996c048eb6ea',
    menuName: 'Processes',
    pageName: null,
    pageId: null,
    parentMenuId: null,
    displayOrder: 6,
    parentMenu: null,
    pageType: null,
    menuPath: '',
    customPageId: null,
    version: null,
    dynamicMenus: [
      {
        id: 'a620c1a4-4ccc-4156-9e40-7f86c1303300',
        menuName: 'Running Process',
        pageName: null,
        pageId: null,
        parentMenuId: '2e463d60-466a-4574-a005-996c048eb6ea',
        displayOrder: 1,
        parentMenu: 'Processes',
        pageType: null,
        menuPath: 'process-instance-running-list',
        customPageId: 'f38e5da3-d869-49a8-921b-532b15428c97',
        version: 1,
        dynamicMenus: null,
        style: null,
        icon: null,
        openPanel: false
      },
      {
        id: '325dfb21-4118-4296-bb65-94b74e14d6f2',
        menuName: 'Completed Process',
        pageName: null,
        pageId: null,
        parentMenuId: '2e463d60-466a-4574-a005-996c048eb6ea',
        displayOrder: 2,
        parentMenu: 'Processes',
        pageType: null,
        menuPath: 'process-instance-completed-list',
        customPageId: '6d6b8e46-ddd1-431d-bc55-f7821292df0e',
        version: 1,
        dynamicMenus: null,
        style: null,
        icon: null,
        openPanel: false
      },
      {
        id: '4ec68a6b-f006-4ade-93ed-31d69184648e',
        menuName: 'Failed Process',
        pageName: null,
        pageId: null,
        parentMenuId: '2e463d60-466a-4574-a005-996c048eb6ea',
        displayOrder: 3,
        parentMenu: 'Processes',
        pageType: null,
        menuPath: 'process-instance-failed-list',
        customPageId: '746f37ec-bd35-49d0-8a17-3f24346d7ecc',
        version: 1,
        dynamicMenus: null,
        style: null,
        icon: null,
        openPanel: false
      }
    ],
    style: null,
    icon: null,
    openPanel: false
  },
  {
    id: '80c04e8a-9aa2-4220-a3e3-56683563ffad',
    menuName: 'Administration',
    pageName: null,
    pageId: null,
    parentMenuId: null,
    displayOrder: 7,
    parentMenu: null,
    pageType: null,
    menuPath: '',
    customPageId: null,
    version: null,
    dynamicMenus: [
      {
        id: '4d6485f9-6b2e-4fde-97b6-55bc68935bfe',
        menuName: 'User Management',
        pageName: null,
        pageId: null,
        parentMenuId: '80c04e8a-9aa2-4220-a3e3-56683563ffad',
        displayOrder: 1,
        parentMenu: 'Administration',
        pageType: null,
        menuPath: 'user-management',
        customPageId: 'c1495a3c-1db7-4a62-9bf9-52fe7dc24183',
        version: 1,
        dynamicMenus: null,
        style: null,
        icon: null,
        openPanel: false
      }
    ],
    style: null,
    icon: null,
    openPanel: false
  }
];