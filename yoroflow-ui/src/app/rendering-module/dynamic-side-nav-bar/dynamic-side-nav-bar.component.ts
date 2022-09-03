import { NotificationServices } from './../../message-module/notification/notification.service';
import { Component, OnInit, Input, EventEmitter, Output, ViewChild, HostListener, isDevMode, OnDestroy, AfterViewChecked, AfterViewInit, ElementRef } from '@angular/core';
import { DynamicMenuService } from '../dynamic-menu/dynamic-menu.service';
import { UserService } from '../shared/service/user-service';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { ApplicationProvisionService } from '../application-provision/application-provision-service';
import { MenuDetailsVO } from '../shared/vo/menu-vo';
import { Application } from '../application-provision/appication-vo';
import { DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from '../shared/service/form-service/loader-service';
import { ChangeDetectorRef } from '@angular/core';
import { interval } from 'rxjs/internal/observable/interval';
import { DynamicStylingService } from '../shared/service/dynamic-styling.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotificationVO, UserIdListVO, UserVO } from '../shared/vo/user-vo';
import { NotificationService } from '../shared/service/notification.service.service';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NavService } from '../shared/service/nav.service';
import { MenuService } from '../shared/service/menu.service';
import { TaskBoardService } from '../../taskboard-module/taskboard-configuration/taskboard.service';

import { LoadMenuDetails } from './load-menu-details';
import { NotificationComponent } from 'src/app/message-module/notification/notification.component';
import { StompClientService } from 'src/app/message-module/stomp-client.service';
import { MenuComponent } from 'src/app/engine-module/menu/menu.component';
import { TaskboardConfigurationComponent } from '../../taskboard-module/taskboard-configuration/taskboard-configuration.component';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { TranslateConfigService } from '../../services/core/translate/translate-config.service';
import { WorkflowDashboardService } from 'src/app/engine-module/work-flow-dashboard/workflow-dashboard.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { StringValueToken } from 'html2canvas/dist/types/css/syntax/tokenizer';
import { filter, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { UserRoleService } from 'src/app/shared-module/services/user-role.service';
import { ThemeService } from 'src/app/services/theme.service';
import { UserDetailsDialogComponent } from '../user-details-dialog/user-details-dialog.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ThemeDialogComponent } from '../theme-dialog/theme-dialog.component';
import { GuidedTour, GuidedTourService, Orientation } from 'ngx-guided-tour';
import { DynamicSideNavBarService } from './dynamic-side-nav-bar.service';
import { YoroflowEngineService } from 'src/app/engine-module/engine.service';

@Component({
  selector: 'app-dynamic-side-nav-bar',
  templateUrl: './dynamic-side-nav-bar.component.html',
  styleUrls: ['./dynamic-side-nav-bar.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class DynamicSideNavBarComponent implements OnInit, AfterViewChecked, OnDestroy, AfterViewInit {
  mobileQuery: MediaQueryList;
  notificationSubscription: any;
  public config: PerfectScrollbarConfigInterface = {};
  systemQuery: MediaQueryList;
  ipadResolution: MediaQueryList;
  mobileResolution: MediaQueryList;
  isTrue = false;
  menuWidth = '20.5%';
  notificationId: any;
  mode = 'over';
  isMobile: boolean;
  childMenu: any = [];
  checkValue = true;
  activeElement2: any;
  defaultPath: any;
  authType: string;

  siteLanguage = 'English';
  siteLocale: string;
  languages: any[];
  currentLanguage: string;
  selectedLang: any;
  workspaceLoad = false;
  theme2 = true;
  theme = 'default-theme';
  darkThemeEmitter: boolean = false;
  messageWindowCss = 'message-icon-outer-css';
  mobileQueryListener: () => void;
  public dashboardTour: GuidedTour;
  constructor(private dynamicMenuService: DynamicMenuService,
    private taskboardservice: TaskBoardService, private guidedTourService: GuidedTourService,
    private sanitizer: DomSanitizer,
    private notficationService: NotificationService,
    private notifyService: NotificationServices,
    private stompClientService: StompClientService,
    private service: UserService,
    private router: Router,
    private appService: ApplicationProvisionService,
    public loaderService: LoaderService,
    private cd: ChangeDetectorRef,
    public dynamicService: DynamicStylingService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private fb: FormBuilder,
    public navService: NavService,
    private menuService: MenuService,
    private translateService: TranslateConfigService,
    private dialog: MatDialog,
    private workflowDashboardService: WorkflowDashboardService,
    public themeService: ThemeService, private elementRef: ElementRef,
    private activatedRoute: ActivatedRoute, public workspaceService: WorkspaceService, private role: UserRoleService,
    private tour: DynamicSideNavBarService,
    private overlayContainer: OverlayContainer, private engineService: YoroflowEngineService) {
    this.selected = 'en';
    this.mobileQuery = media.matchMedia('(max-width: 850px)');
    this.ipadResolution = media.matchMedia('(max-width:1024px)');
    this.mobileResolution = media.matchMedia('(max-width:600px)');
    this.mobileQueryListener = () => {
      changeDetectorRef.detectChanges();
      if (this.ipadResolution.matches && this.isTrue === false) {
        this.open = false;
        this.isTrue = true;
      }
    };
    this.mobileQuery.addListener(this.mobileQueryListener);
    this.ipadResolution.addListener(this.mobileQueryListener);
    this.mobileResolution.addListener(this.mobileQueryListener);
    if (this.ipadResolution.matches) {
      this.open = false;
    }
    this.authType = localStorage.getItem('authType');
    activatedRoute.queryParams.subscribe();
    this.workspaceService.getDefaultWorksapce('fromMenu');
  }

  @Input() id: string;
  @Input() orientation: string;
  @Input() application: Application;
  @Input() hideLogo: boolean;
  @Input() url: string;
  @Input() isNotificationOpen: boolean;
  @Output() notificationEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateReadTimeEmitter: EventEmitter<any> = new EventEmitter<any>();

  @Output() menuEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() isNotificationOpened: EventEmitter<any> = new EventEmitter<any>();
  @Output() isMessageOpened: EventEmitter<any> = new EventEmitter<any>();
  @Output() messageObject: EventEmitter<any> = new EventEmitter<any>();
  @Output() pinEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() widthEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() notificationObjectEmitter: EventEmitter<any> = new EventEmitter<any>();

  notificationObject: NotificationComponent;
  taskboardObject: TaskboardConfigurationComponent;
  selectedIndex: any;
  base64Image: string;
  isLoad = false;
  menuOptions: MenuDetailsVO[] = [];
  selected: string;
  userVo = new UserVO();
  logoUrl: any;
  showLogo = true;
  allLanguages = [
    {
      name: 'English',
      lang: 'en',
      href: '/en'
    },
    {
      name: 'Français',
      lang: 'fr',
      href: '/fr'
    },
    {
      name: 'Español',
      lang: 'es',
      href: '/es'
    }
  ];
  array: any;
  open = false;
  width: any;
  background = 'rgb(65, 70, 81)';
  show: any;
  screenWidth: any;
  menuNameWidth: any;
  screenHeight: any;
  screenHeight1: any;
  sub: any;
  buttonWidth: any;
  menuButtonWidth: any;
  menuName: any;
  form: FormGroup;
  notficationList: any[] = [];
  notificationsCount: any;
  userVO = new UserVO();
  showNoNotificationMessage = false;
  notificationUserId = new Set();
  userIdList = new UserIdListVO();
  isCustomSocketOpened = false;
  sidenavOpen = false;
  dynamicoptions: any;
  menuName2: any;
  showHead: boolean;
  activeElement: any;
  activeElement1: any;
  previousMenuName: any;
  isExpanded = true;
  showSubmenu = false;
  isShowing = false;
  showSubSubMenu = false;
  taskboardList: any;
  clickedMenu: any;
  // tslint:disable-next-line:member-ordering
  dataSource: LoadMenuDetails;
  hide = false;
  dynamicoptions1: any = [];
  index = 0;
  hideExpand = false;
  hideClose = false;
  theme_old = false;
  totalNotificationsCount = 0;
  totalNotifications = 0;
  allowNotify = false;
  isNotifications = false;
  isAllowed = true;
  isMessageAllowed = false;
  isNotificationAllowed = false;
  isApplicationAllowed = false;
  licenseVO = new LicenseVO();
  contextUrl: string;
  workspaceCharacter: string;
  workspaceAvatar: string;
  workspaceName: string;
  userRoles: any;
  iconDisable: boolean = false;
  notificationOpen: boolean = false;
  notificationClicked = false;
  isWorkflowReportsOpened = false;
  private readonly unsubscribe$: Subject<void> = new Subject();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = (window.innerHeight - 1) + 'px';
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight1 = (window.innerHeight - 1) + 'px';
    } else {
      this.screenHeight1 = (window.innerHeight - 63) + 'px';
    }
    if (window.innerWidth <= 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  myOptions = {
    'theme': 'dark',
    'placement': 'right',
    'hideDelay': 50
  }
  ngOnInit() {
    this.workspaceService.myRequestEmitter.subscribe(data => {
      if (data) {
        this.activeElement = data;
      }
    });
    this.loadThemeSettings();
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    this
    this.getUsers();
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (event: RouterEvent) => {
          this.contextUrl = event.url;
        }
      );
    this.contextUrl = this.router.url;
    this.siteLocale = window.location.pathname;
    this.licenseVO.category = 'general';
    this.licenseVO.featureName = 'workflows';
    this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.response.includes('exceeded')) {
        this.isAllowed = false;
      }
    });
    this.checkMessageLicense();
    this.checkNotificationLicense();
    this.checkApplicationLicense();
    this.checkValue = false;
    if (window.innerWidth <= 1024) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.router.events.subscribe(data => {
      if (data && (this.mode === 'over' || this.isMobile === true)) {
        this.open = false;
      }
    });
    if (this.isNotificationOpen) {
      this.sidenavOpen = true;
    }
    this.loadApplicationLogo();
    this.dataSource = new LoadMenuDetails(this.dynamicMenuService);
    this.dataSource.loadMenuDetail(this.id);
    this.dataSource.getMenuDetails().subscribe(data => {
      this.menuOptions = data;
      this.loadDefaultRoute();
    });
    this.getLoggedUserDetails();
    this.getNotificationList(this.index);
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
    this.show = this.loaderService.showLoader;
    const sub = Observable.interval(500).subscribe(val => {
      if (this.workspaceService.workspaceID) {
        this.workspaceLoad = true;
        sub.unsubscribe();
      }
    });
  }
  restartTour() {
    this.userRoles = this.role.getUserRoles();
    this.tour.getTours(this.userRoles);

  }

  notificationClick() {
    this.activeElement = '';
    this.activeElement1 = '';
    this.notificationClicked = true;
    this.workspaceService.setHideHover(false);
    this.workspaceService.setNotificationSelected(true);
    this.licenseVO.category = 'notifications';
    this.licenseVO.featureName = 'custom_notification';
    this.notifyService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'N') {
        const dialog = this.dialog.open(AlertmessageComponent, {
          width: '450px',
          data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
        });
      } else {
        // this.notificationOpen.emit(true);
        this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/notification']);
      }
    });
  }

  loadThemeSettings(): void {
    if (this.service.userVO.theme) {
      localStorage.setItem('theme', this.service.userVO.theme);
      this.themeService.setTheme(this.service.userVO.theme);
    } else {
      localStorage.setItem('theme', 'default-theme');
      this.themeService.setTheme('default-theme');
    }
    if (this.service.userVO.layout) {
      localStorage.setItem('layout', this.service.userVO.layout);
      this.themeService.setLayout(this.service.userVO.layout);
    } else {
      localStorage.setItem('layout', 'modern');
      this.themeService.setLayout('modern');
    }
    if (!localStorage.getItem('font')) {
      if (this.service.userVO.additionalSettings?.fontSize) {
        const font = this.themeService.fonts.find(f => f.fontSize === +this.service.userVO.additionalSettings.fontSize)['name'];
        localStorage.setItem('font', font);
        this.themeService.setFontSize(font);
      } else {
        localStorage.setItem('font', 'font-model-1');
        this.themeService.setFontSize('font-model-1');
      }
    } else {
      if (this.service.userVO.additionalSettings?.fontSize) {
        const font = this.themeService.fonts.find(f => f.fontSize === +this.service.userVO.additionalSettings.fontSize)['name'];
        this.themeService.setFontSize(font);
      } else {
        localStorage.setItem('font', 'font-model-1');
        this.themeService.setFontSize('font-model-1');
      }
    }
    if (localStorage.getItem('translate_lang')) {
      if (localStorage.getItem('translate_lang') === undefined || localStorage.getItem('translate_lang') === null
        || localStorage.getItem('translate_lang') === 'null') {
        localStorage.setItem('translate_lang', 'en');
      }
      this.translateService.changeLanguage(localStorage.getItem('translate_lang'));
      this.selectedLang = localStorage.getItem('translate_lang');
      if (!window.location.href.includes('localhost') && !window.location.href.includes(window.location.origin + '/' + localStorage.getItem('translate_lang'))) {
        window.location.href = window.location.origin + '/' + localStorage.getItem('translate_lang') + this.router.url;
      }
    } else {
      this.translateService.changeLanguage(this.service.userVO.defaultLanguage);
      if (!window.location.href.includes('localhost') &&
        !window.location.href.includes(window.location.origin + '/' + this.service.userVO.defaultLanguage)) {
        window.location.href = window.location.origin + '/' + this.service.userVO.defaultLanguage + this.router.url;
      }
    }
    this.themeService.setMatMiniFabButtonCssForDialog();
  }

  loadDynamicLayout(): void {
    this.screenHeight = (window.innerHeight - 1) + 'px';
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight1 = (window.innerHeight - 1) + 'px';
    } else {
      this.screenHeight1 = (window.innerHeight - 63) + 'px';
    }
  }

  openUserDetailsDialog(): void {
    const dialog = this.dialog.open(UserDetailsDialogComponent, {
      width: '410px',
      height: '400px',
      data: { userVo: this.userVo }
    });
    dialog.componentInstance.themeEmitter.subscribe(data => {
      if (data) {
        this.theme = data;
      }
    });
    dialog.componentInstance.darkThemeEmitter.subscribe(data => {
      this.darkThemeEmitter = data;
    })
  }

  getUsers() {
    this.userRoles = this.role.getUserRoles();
    if (this.userRoles && this.userRoles.length === 1 && this.userRoles[0] === 'Billing Administrator') {
      this.iconDisable = true;
    }
    else if (this.userRoles && this.userRoles.length === 1 && this.userRoles[0] === 'Application Administrator') {
      this.iconDisable = true;

    }
    else if (this.userRoles && this.userRoles.length === 1 && this.userRoles[0] === 'User Administrator') {
      this.iconDisable = true;
    }
    else if (this.userRoles.length === 2 && this.userRoles.includes('Billing Administrator') && this.userRoles.includes('Application Administrator')) {
      this.iconDisable = true;
    }
    else if (this.userRoles.length === 2 && this.userRoles.includes('Billing Administrator') && this.userRoles.includes('User Administrator')) {
      this.iconDisable = true;
    }
    else if (this.userRoles.length === 2 && this.userRoles.includes('Application Administrator') && this.userRoles.includes('User Administrator')) {
      this.iconDisable = true;
    }
    else if (this.userRoles.length === 3 && this.userRoles.includes('Billing Administrator') && this.userRoles.includes('Application Administrator') && this.userRoles.includes('User Administrator')) {
      this.iconDisable = true;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getCurrentRoute() {
    return this.router.url;
  }

  changeLanguage(language: string) {
    this.selectedLang = language;
    this.translateService.changeLanguage(language);

  }

  checkApplicationLicense() {
    this.licenseVO.category = 'form_page_builder';
    this.licenseVO.featureName = 'application_pages';
    this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'Y') {
        this.isApplicationAllowed = true;
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

  mytask() {
    this.dynamicoptions = [];
    this.hide = true;
    this.checkValue = false;
    this.workspaceService.setHideSubMenu(true);
    this.workspaceService.setHideHover(true);
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + 'mytask/my-pending-task']);
  }
  mydashboard() {
    this.dynamicoptions = [];
    this.hide = true;
    this.checkValue = false;
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/mytask/my-pending-task']);
  }

  landingPageRoute() {
    this.workspaceService.setHideSubMenu(true);
    this.workspaceService.setHideHover(true);
    this.workspaceService.setNotificationSelected(false);
    this.activeElement = 'My Requests';
    this.workspaceService.setHideHover(false);
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/mytask/my-pending-task']);
  }

  createWorkspace() {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + 'workspace/create']);
  }


  setStyle(event) {
    if (event.menuName) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.menuOptions.length; i++) {
        if (this.menuOptions[i].style !== null) {
          this.menuOptions[i].style = null;
        }
        if (this.menuOptions[i].dynamicMenus !== null) {
          // tslint:disable-next-line:prefer-for-of
          for (let j = 0; j < this.menuOptions[i].dynamicMenus.length; j++) {
            if (this.menuOptions[i].dynamicMenus[j].dynamicMenus !== null) {
              // tslint:disable-next-line:prefer-for-of
              for (let l = 0; l < this.menuOptions[i].dynamicMenus[j].dynamicMenus.length; l++) {
                if (this.menuOptions[i].dynamicMenus[j].dynamicMenus[l].style !== null) {
                  this.menuOptions[i].dynamicMenus[j].dynamicMenus[l].style = null;
                }
              }
            }
          }
        }
        if (this.menuOptions[i].dynamicMenus !== null) {
          // tslint:disable-next-line:prefer-for-of
          for (let l = 0; l < this.menuOptions[i].dynamicMenus.length; l++) {
            if (this.menuOptions[i].dynamicMenus[l].style !== null) {
              this.menuOptions[i].dynamicMenus[l].style = null;
            }
          }
        }
      }
      this.menuOptions.forEach(menu => {
        if (event.menuName === menu.menuName && event.menuPath === menu.menuPath) {
          menu.style = 'background-color:#039be5;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%';
          return true;
        }
        menu.dynamicMenus.forEach(subMenu => {
          if (event.menuName === subMenu.menuName && event.menuPath === subMenu.menuPath) {
            subMenu.style = 'background-color:#039be5;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%';
            return true;
          }
          subMenu.dynamicMenus.forEach(child => {
            if (event.menuName === child.menuName && event.menuPath === child.menuPath) {
              child.style = 'background-color:#039be5;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%';
              return true;
            }
          });
        });
      });
    }
  }

  loadMentionNotifications(): void {
    this.notficationList.forEach(notification => {
      if (notification.message.startsWith('You are mentioned in')) {
        if (notification.type === 'taskboard') {
          const prefix = /You are mentioned in task comments of /gi;
          const suffix = / on the taskboard/gi;
          notification.link = notification.message.replace(prefix, '');
          notification.link = notification.link.replace(suffix, ' of');
        } else {
          const prefix = /You are mentioned in workflow comments of /gi;
          const suffix = / on the workflow/gi;
          notification.link = notification.message.replace(prefix, '');
          notification.link = notification.link.replace(suffix, ' of');
        }
      }
    });
  }

  getNotificationList(i) {
    const paginationVO = new PaginationVO();
    paginationVO.index = i;
    paginationVO.size = 10;
    this.notficationService.getNotificationList(paginationVO).subscribe(data => {
      if (data !== null) {
        let notificationList: NotificationVO[] = [];
        notificationList = data.notificationsVOList;
        notificationList.forEach(notification => notification.link = '');
        this.notficationList = notificationList;
        this.loadMentionNotifications();
        this.totalNotificationsCount = data.totalNotifications;
        this.totalNotifications = this.notficationList.length;
        this.hideClose = true;
        this.hideExpand = true;
        this.allowNotify = true;
        if (this.notficationList.length === 0) {
          this.showNoNotificationMessage = true;
        }
        this.show = true;
        this.isNotifications = true;
        this.getProfilePictures(this.notficationList);
      }
    });
  }

  getLoggedUserDetails() {
    this.notficationService.getLoggedInUserDetails().subscribe(data => {
      this.userVO = data;
      this.show = this.stompClientService.show;
      setTimeout(() => {
        this.openSocket(this.userVO.userId);
      }, 1000);
    });
  }

  getProfilePictures(notficationList: NotificationVO[]) {
    if (notficationList.length > 0) {
      this.notficationList.forEach(notification => {
        this.notificationUserId.add(notification.fromId);
      });
      this.notificationUserId.forEach(id => this.userIdList.userIdList.push(id));
      if (this.userIdList !== null && this.userIdList.userIdList.length > 0) {
        this.notficationService.getProfilePictures(this.userIdList).subscribe(data => {
          if (data !== null && data.length > 0) {
            data.forEach(user => {
              this.notficationList.filter(a => a.fromId === user.userId).forEach(notification => {
                notification.fromUserProfilePicture = user.userProfilePicture;
              });
            });
          }
        });
      }
    }
  }

  openSocket(userId) {
    if (this.stompClientService.isLoaded) {
      this.isCustomSocketOpened = true;
      this.notificationSubscription =
        this.stompClientService.stompClient.subscribe('/socket-publisher/notification-' + userId, (message) => {
          this.handleResult(message);
          this.show = true;
        }, this.getHeader());
    }
  }

  getHeader() {
    const httpOptions = {
      Authorization: this.getToken()
    };
    return httpOptions;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  handleResult(message) {
    this.notificationId = JSON.parse(message.body).id;
    this.notificationsCount = this.notificationsCount + 1;
    this.notficationList.unshift(JSON.parse(message.body));
  }

  anyAction(notfication) {
    this.notificationEmitter.emit(notfication);
    this.markAsRead(notfication);
    this.notificationObjectEmitter.emit(notfication);
    this.sidenavOpen = false;
  }

  markAllAsRead() {
    this.notficationList.forEach((notfication) => {
      notfication.readTime = new Date();
    });
    this.notficationService.updateAllReadTime().subscribe(data => {
      if (data.response === 'Read time updated') {
        this.updateReadTimeEmitter.emit(true);
      }
      this.notificationObject.getNotificationsCount();
    });
  }

  markAsRead(notfication: NotificationVO) {
    notfication.readTime = new Date();
    this.notficationService.updateReadTime(notfication.id).subscribe(data => {
      if (data.response === 'Read time updated') {
        this.updateReadTimeEmitter.emit(true);
      }
      this.notificationObject.getNotificationsCount();
    });
  }

  openNotifiction() {
    this.sidenavOpen = true;
  }

  closeNotification() {
    this.sidenavOpen = false;
  }

  closeMenu() {
    this.open = false;
  }

  openMenu() {
    this.open = true;
  }

  getSidenavObject(event) {
    if (event === true) {
      this.sidenavOpen = true;
      this.index = 0;
      this.getNotificationList(this.index);
    } else {
      this.sidenavOpen = false;
    }
  }

  getShowList() {
    let value = '';
    if (this.index === 0 && this.totalNotifications !== 0) {
      value = '[1-' + this.totalNotifications.toString() + ' of ' + this.totalNotificationsCount.toString() + ']';
    }
    if (this.index !== 0) {
      value = '[' + this.index.toString() + '1-' + this.getCountValue()
        + ' of ' + this.totalNotificationsCount.toString() + ']';
    }
    return value;
  }

  getCountValue() {
    let value = '';
    if (this.totalNotifications === 10) {
      value = (this.index + 1).toString() + '0';
    } else {
      value = this.index.toString() + this.totalNotifications.toString();
    }
    return value;
  }

  getNotificationByIndex() {
    this.index++;
    this.hideExpand = false;
    this.getNotificationList(this.index);
  }

  getNotificationByExpandLess() {
    this.index--;
    this.hideClose = false;
    this.allowNotify = false;
    this.getNotificationList(this.index);
  }

  pinClickedIcon() {
    this.pinEmitter.emit(true);
  }

  closeNav() {
    if (this.mode === 'over') {
      this.open = false;
    }
  }

  openNav() {
    this.mode = 'over';
    this.open = true;
  }

  close() {
    if (this.mode === 'side') {
      this.open = false;
    } else {
      this.mode = 'side';
    }
  }
  isActive(item) {
    return this.menuName2 === item;
  }
  openNavBar(menuName, i: number, val: boolean) {
    this.notificationOpen = false;
    this.notificationClicked = false;
    this.isWorkflowReportsOpened=false;
    this.activeElement2='';
    this.workspaceService.setNotificationSelected(false);
    this.workspaceService.setHideSubMenu(false);
    this.workspaceService.setHideHover(false);
    if (menuName.menuName === 'Application') {
      this.activeElement = menuName.menuName;
      this.licenseVO.category = 'form_page_builder';
      this.licenseVO.featureName = 'application_pages';
      this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
        if (data.isAllowed === 'N') {
          this.hide = true;
          this.router.navigate(['/expire-dialog']);
        } else {
          this.menuNavigation(menuName, i, val);
        }
      });
    } else {
      this.menuNavigation(menuName, i, val);
    }
  }

  menuNavigation(menuName, i: number, val: boolean) {
    this.defaultPath = menuName.dynamicMenus;
    this.checkValue = val;
    this.selectedIndex = i;
    this.activeElement = menuName.menuName;
    this.childMenu = [];
    this.hide = false;
    this.menuName2 = menuName.menuName;
    this.width = 'open';
    this.background = 'rgb(65, 70, 81)';

    if (this.menuOptions[i].menuName === menuName.menuName) {
      this.dynamicoptions = this.menuOptions[i].dynamicMenus;
      if (this.dynamicoptions != null) {

        this.checkValue = false;
        if (menuName.menuName === 'Workflow' || this.defaultPath[0].menuName === 'Page List' || this.defaultPath[0].menuName === 'Create Page'
          || this.defaultPath[0].menuName === 'Pages' || this.defaultPath[0].menuName === 'My Apps') {
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + this.defaultPath[0].menuPath]);
        } else {
          this.router.navigate([this.defaultPath[0].menuPath]);
        }
        this.activeElement1 = this.defaultPath[0].menuName;
        if (menuName.menuName === ('Workflow Reports')) {
          this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() +
            '/yoroflow-engine/get-report/' + this.defaultPath[0].reportId);

        }



        for (let j = 0; j < this.dynamicoptions.length; j++) {
          if (this.dynamicoptions[j].dynamicMenus != null) {
            this.childMenu.push(this.dynamicoptions[j].dynamicMenus);
          }
        }
      }

      else {
        this.checkValue = false;
      }
    }
    for (let i = 0; i < this.menuOptions.length; i++) {
      this.menuOptions[i].style = null;
    }
    if (menuName !== 'collapseIcon') {
      if (this.menuOptions[i].dynamicMenus !== null
        && this.menuOptions[i].dynamicMenus !== undefined
        && this.menuOptions[i].dynamicMenus !== []) {
        for (let i = 0; i < this.menuOptions.length; i++) {
          this.menuOptions[i].openPanel = false;
        }
        this.menuOptions[i].openPanel = true;
      } else {
        if (menuName.menuName === 'Taskboard') {
          this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() + '/task/' + menuName.menuPath);
        }
        else if (menuName.menuName === 'My Requests') {
          this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() + '/mytask/' + menuName.menuPath);
        } else if (menuName.menuName === 'Documents') {
          this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() + '/yorodocs/' + menuName.menuPath);
        }
        else if (menuName.menuName === 'Documents') {
          this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() + '/yorodocs/' + menuName.menuPath);
        }
        else if (menuName.menuPath === 'my-apps') {
          this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() + '/yoroapps/' + menuName.menuPath);
        }
        else {
          const URL = window.location.pathname.split('/', 2);
          this.setDefaultStyle(URL[1]);
          if (menuName.menuName === 'Pages' || menuName.menuName === 'Page List' || menuName.menuName === 'Create Page'
            || menuName.menuName === 'My Apps') {
            this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + this.menuOptions[i].menuPath]);
          } else {
            this.router.navigate([this.menuOptions[i].menuPath]);
          }
          for (let i = 0; i < this.menuOptions.length; i++) {
            this.menuOptions[i].openPanel = false;
          }
        }
      }
    }
    else {
    }
  }

  setDefaultStyle(menuPath) {
    for (let i = 0; i < this.menuOptions.length; i++) {
      if (this.menuOptions[i].style !== null) {
        this.menuOptions[i].style = null;
      }
      if (this.menuOptions[i].dynamicMenus !== null) {
        for (let j = 0; j < this.menuOptions[i].dynamicMenus.length; j++) {
          if (this.menuOptions[i].dynamicMenus[j].dynamicMenus !== null) {
            for (let l = 0; l < this.menuOptions[i].dynamicMenus[j].dynamicMenus.length; l++) {
              if (this.menuOptions[i].dynamicMenus[j].dynamicMenus[l].style !== null) {
                this.menuOptions[i].dynamicMenus[j].dynamicMenus[l].style = null;
              }
            }
          }
        }
      }
      if (this.menuOptions[i].dynamicMenus !== null) {
        for (let l = 0; l < this.menuOptions[i].dynamicMenus.length; l++) {
          if (this.menuOptions[i].dynamicMenus[l].style !== null) {
            this.menuOptions[i].dynamicMenus[l].style = null;
          }
        }
      }
    }
    this.menuOptions.forEach(menuItem => {
      if (menuItem.menuPath !== null && menuItem.menuPath !== '' && menuItem.menuPath !== undefined && menuItem.menuPath === menuPath) {
        menuItem.style = 'background-color:#039be5;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%';
        return true;
      }
      if (menuItem.dynamicMenus !== null) {
        menuItem.dynamicMenus.forEach(subMenu => {
          if (subMenu.menuPath !== '' && subMenu.menuPath !== null && subMenu.menuPath !== undefined && menuPath === subMenu.menuPath) {
            subMenu.style = 'background-color:#039be5;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%';
            return true;
          }
          if (subMenu.dynamicMenus !== null) {
            subMenu.dynamicMenus.forEach(child => {
              if (child.menuPath !== '' && child.menuPath !== null && child.menuPath !== undefined && menuPath === child.menuPath) {
                child.style = 'background-color:#039be5;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%';
                return true;
              }
            });
          }
        });
      }
    });
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

  loadApplicationLogo() {
    if (this.application.logo === null) {
      this.showLogo = false;
    } else {
      this.logoUrl = 'data:image/png;base64,' + this.application.logo;
    }
  }


  getMessageObject($event) {
    this.messageObject.emit($event);
  }

  getNotificationObject($event) {
    this.notificationObject = $event;
  }

  getNotification($event) {
    this.menuEmitter.emit($event);
  }

  getNotificationOpened($event) {
    this.isNotificationOpened.emit($event);
  }

  getMessageOpened($event) {
    this.isMessageOpened.emit($event);
  }

  pinClicked() {
    this.pinEmitter.emit(true);
  }

  marketPlaceClicked() {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/market-place']);
  }


  getSidenavePosition() {
    if (this.orientation === 'Right') {
      return 'end';
    } else {
      return 'start';
    }
  }

  logout() {
    this.service.removeToken().subscribe(token => {
      this.service.logout();
      this.selectedLang = localStorage.getItem('translate_lang');
      localStorage.clear();
      localStorage.setItem('translate_lang', this.selectedLang);
      this.router.navigateByUrl('login');
    });
  }

  userProfile() {
    this.router.navigate(['/user-profile']);
    this.hide = true;
  }

  userprofile(str) {
    if (str) {
      const assignee = str.split(' ');
      for (let i = 0; i < assignee.length; i++) {
        assignee[i] = assignee[i].charAt(0).toUpperCase();
      }
      return assignee.join('');
    }
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

  transformImage(profilePicture) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
  }
  ngAfterViewInit(): void {
    const interval = setInterval(() => {
      if (localStorage.getItem("InitialTour") && this.menuOptions.length > 0 && this.workspaceLoad === true) {
        this.restartTour();
        localStorage.removeItem("InitialTour");
        clearInterval(interval);
      }
    })


  }
  userManual() {
    window.open('https://www.yoroflow.com/docs/')
  }
  ngAfterViewChecked() {
    const show = this.loaderService.showLoader;
    if (show !== this.show) {
      this.show = show;
      this.cd.detectChanges();
    }
  }

  openReports() {
    this.isWorkflowReportsOpened = this.isWorkflowReportsOpened ? false : true;
  }

  on_itemclicked(menu) {
    this.previousMenuName = this.activeElement1;
    this.activeElement1 = menu.menuName;
    this.activeElement2 = menu.menuName;

    this.checkValue = false;
    this.clickedMenu = menu;

    if (!menu.dynamicMenus || !menu.dynamicMenus.length) {
      const routeUrl = this.router.url;
      if (routeUrl.includes('/app') && !routeUrl.includes('/app-layout') && !routeUrl.includes('/application-dashboard')
        && !routeUrl.includes('app/edit') && !routeUrl.includes('/app/create') && !routeUrl.includes('/create/page')) {
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
          else {
            if (menu.menuPath === 'workflow') {
              this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/yoroflow-design/' + menu.menuPath]);

            }
            else {
              this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + menu.menuPath]);

            }
          }

        });
      } else if (menu.menuPath === ('get-report')) {
        if (routeUrl.includes('/get-report/')) {
          this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() + '/get-report/' + menu.reportId);
        } else {
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + menu.menuPath + '/' + menu.reportId]);
        }
      }
      else if (menu.menuPath === 'workflow') {
        this.licenseVO.category = 'general';
        this.licenseVO.featureName = 'workflows';
        this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
          if (data.response.includes('exceeded')) {
            const dialog = this.dialog.open(AlertmessageComponent, {
              width: '450px',
              data: { licenseVO: data, pageName: 'Workflow' }
            });
            this.activeElement1 = this.previousMenuName;
          } else {
            this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/yoroflow-design/' + menu.menuPath]);
          }
        });
      } else if (menu.menuName === 'Menu Configuration') {
        this.licenseVO.category = 'general';
        this.licenseVO.featureName = 'menu_configuration';
        this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
          if (data.isAllowed === 'N') {
            this.router.navigate(['expire-dialog']);
          } else if (data.isAllowed === 'Y') {
            this.router.navigate([menu.menuPath]);
          }
        });
      }
      else if (menu.menuPath === 'report-config') {
        this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/yoroflow-design/' + menu.menuPath]);

      }
      else if (menu.menuPath === 'my-apps') {
        this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() + '/yoroapps/' + menu.menuPath);
      }
      else {
        if (menu.menuName === 'Pages' || menu.menuName === 'Page List' || menu.menuName === 'Create Page'
          || menu.menuName === 'My Apps' || menu.menuName === 'Cart Configuration' || menu.menuName === 'Application Layout Page List'
          || menu.menuName === 'Application  Layout Page Configuration' || menu.parentMenu === 'Workflow') {
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + menu.menuPath]);
        } else {
          this.router.navigate([menu.menuPath]);
        }
      }
    }
  }
  show_hide(value) {
    this.hide = value;
    this.engineService.invokeMenuCloseEmit();
  }

  changeTheme(themeName: string): void {
    this.theme = themeName;
    this.themeService.setTheme(themeName);
    this.overlayContainer.getContainerElement().classList.add(themeName);
  }

  openThemeDialog(): void {
    const dialog = this.dialog.open(ThemeDialogComponent, {
      width: '620px',
      disableClose: true
    });
  }

  getMessageWindowOpened(event: any): void {
    if (event === true) {
      this.messageWindowCss = 'message-window-css-expand';
    } else {
      this.messageWindowCss = 'message-icon-outer-css';
    }
  }

  isCollapsed(event: any): void {
    if (event === true) {
      this.messageWindowCss = 'message-window-css-collapse';
    } else {
      this.messageWindowCss = 'message-window-css-expand';
    }
  }

}
