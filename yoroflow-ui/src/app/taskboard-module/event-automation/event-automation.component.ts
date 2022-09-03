import { stringify } from '@angular/compiler/src/util';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { MAT_CALENDAR_RANGE_STRATEGY_PROVIDER_FACTORY } from '@angular/material/datepicker/date-range-selection-strategy';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { element } from 'protractor';
import { Observable, Subject } from 'rxjs';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { Group } from 'src/app/engine-module/group/group-vo';
import { CronComponent } from 'src/app/shared-module/cron/cron.component';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { ApplicationConfigurationComponent } from '../application-configuration/application-configuration.component';
import { ApplicationConfigurationService } from '../application-configuration/application-configuration.service';
import { AppConfigurationVO } from '../application-configuration/application-configuration.vo';
import { OrganizationIntegratedAppsVO } from '../integrate-application/integrate-application.vo';
import { IntegrationService } from '../integration-dialog/integration.service';
import { DateDialogComponent } from '../shared/date-dialog/date-dialog.component';
import { EmitVO } from '../shared/models/assign-user-vo';
import { UserVO } from '../taskboard-form-details/taskboard-task-vo';
import { SecurityService } from '../taskboard-security/security.service';
import { ConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { Action } from './actions';
import { ActionsVO, AutomationByCategory, AutomationScripts, AutomationScriptVO, AutomationVO, BoardGroups, CategoryAutomations, ConditionsVO, EventAutomationConfigurationVO, EventAutomationVO, EventSpecificMap, Groups, GroupValue, SelectedField, Users, UsersValue } from './event-automation.model';
import { EventAutomationService } from './event-automation.service';

@Component({
  selector: 'app-event-automation',
  templateUrl: './event-automation.component.html',
  styleUrls: ['./event-automation.component.scss']
})
export class EventAutomationComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EventAutomationComponent>, private dialog: MatDialog, private action: Action,
    private automationService: EventAutomationService, private snackbar: MatSnackBar, private securityService: SecurityService,
    private integrationService: IntegrationService,
    private appConfigService: ApplicationConfigurationService, private fb: FormBuilder) { }

  public config: PerfectScrollbarConfigInterface = {};
  automationType: string;
  actionsList: any[] = [];
  fieldList: any[] = [];
  automationsByCategoryVO: AutomationByCategory[] = [];
  categoryAutomations: CategoryAutomations[] = [];
  filteredAutomtaions: AutomationByCategory[] = [];

  automationSciptsVO: AutomationScripts[] = [];
  timePeriodScript: AutomationScripts[] = [];
  isActions: boolean = true;
  isSecondaryAction: boolean = false;
  eventAutomationConfigurationVO: EventAutomationConfigurationVO[] = [];
  selectedScript: any;
  automationVO: AutomationVO[] = [];
  eventAutomationId: string = null;
  eventAutomationVO: EventAutomationVO[] = [];
  script: AutomationScriptVO[] = [];
  show: boolean = false;
  actions: any;
  updateAutomation: boolean = false;
  mouseOverScriptIndex: any;
  removeIconMouseOver: boolean = false;
  type: string;
  automation: string[] = [];
  date: string = 'choose Date';
  timePeriodAutomation: string;
  tabType: string = 'customAutomation';
  automationFrom: string = 'existing';
  appSelected: boolean = false;
  categoriesArray: any[] = [
    { name: 'All', icon: 'library_add_check', isSelected: true, color: 'blue', backgroundImage: '' },
    { name: 'Status Change', icon: 'published_with_changes', isSelected: false, color: 'green', backgroundImage: 'url("/assets/event_automation_icons/published_with_changes_black_24dp-01.svg")' },
    { name: 'Recurring', icon: 'update', isSelected: false, color: '#ffb100', backgroundImage: 'url("/assets/event_automation_icons/update_black_24dp.svg")' },
    { name: 'Notification', icon: 'notifications', isSelected: false, color: 'lightblue', backgroundImage: 'url("/assets/event_automation_icons/notifications_black_24dp.svg")' },
    { name: 'Label', icon: 'label', isSelected: false, color: 'blue', backgroundImage: 'url("/assets/event_automation_icons/label_black_24dp-01.svg")' },
    { name: 'Due Date', icon: 'calendar_today', isSelected: false, color: 'red', backgroundImage: 'url("/assets/event_automation_icons/calendar_today_black_24dp-01.svg")' },
    { name: 'Task Creation', icon: 'queue', isSelected: false, color: 'violet', backgroundImage: 'url("/assets/event_automation_icons/queue_black_24dp-01.svg")' },
    { name: 'Subtask Status', icon: 'account_tree', isSelected: false, color: '#ffb100', backgroundImage: 'url("/assets/event_automation_icons/account_tree_black_24dp.svg")' },
  ];
  boardUsers: any[] = [];
  boardGroups: BoardGroups[] = [];
  usersList: UserVO[] = [];
  users: UserVO[] = [];;
  groups: BoardGroups[] = [];
  customUsers: string[] = [];
  message: string;
  isDisabled: boolean = false;
  count: number = 0;
  organizationApps: OrganizationIntegratedAppsVO[] = [];
  appConfigVOList: AppConfigurationVO[] = [];
  showIntegrations: boolean = false;
  selectedApplications: string[] = [];
  taskboardApps$: Observable<AppConfigurationVO[]>;

  appsArray: any[] = [
    { name: 'gmail', img: '../assets/integration_app_images/gmail.png' },
    { name: 'Slack', img: '../assets/integration_app_images/slack_logo.png' },
    { name: 'Microsoft Teams', img: '../assets/integration_app_images/Microsoft-Teams-Didattica-a-distanza-1.png' },
    {
      name: 'Twitter',
      img: '../assets/integration_app_images/twitter-background.jpg',
    },
    {
      name: 'LinkedIn',
      img: '../assets/integration_app_images/linkedIn-background.png',
    },
    {
      name: 'Outlook',
      img: '../assets/integration_app_images/outlook-background.jpg',
    },
  ];

  logoArray: any[] = [
    // { name: 'All', img: '', isSelected: true },
    { name: 'Slack', img: '../assets/integration_app_images/slack-new-logo.svg', isSelected: false },
    { name: 'Microsoft Teams', img: '../assets/integration_app_images/microsoft-teams-1.svg', isSelected: false },
    { name: 'Twitter', img: '../assets/integration_app_images/twitter-logo.svg', isSelected: false },
    { name: 'LinkedIn', img: '../assets/integration_app_images/linkedIn-logo.svg', isSelected: false },
    { name: 'Outlook', img: '../assets/integration_app_images/outlook-logo.svg', isSelected: false }
  ];
  disabled: boolean = false;
  customMail: string[] = [];
  subject: string;
  form: FormGroup;
  applicationName: string;
  @ViewChild('menuTrigger1') menu;

  ngOnInit(): void {
    this.form = this.fb.group({
      numberOfDays: [1]
    });
    this.loadIntegrations();
    this.action.keyWords.push(this.data.boardName);
    this.loadAutomationsByCategory();
    this.loadBoardUsers();
  }

  loadIntegrations(): void {
    this.integrationService.getOrganizationApplications().subscribe(data => {
      this.organizationApps = data;
      this.appConfigVOList = [];
      this.appConfigService.getConfiguredAppsByTaskboardId(this.data.taskboardId).subscribe(data => {
        this.loadAutomationsList();
        this.appConfigVOList = data;
        if (this.appConfigVOList.length == 0) {
          this.organizationApps.forEach(orgApps => orgApps.remove = false);
        } else {
          this.organizationApps.forEach(orgApps => orgApps.remove = false);
          this.appConfigVOList.forEach(appConfig => {
            this.organizationApps.forEach(orgApps => {
              if (appConfig.applicationName === orgApps.applicationName) {
                orgApps.remove = true;
              } else if (orgApps.remove !== true) {
                orgApps.remove = false;
              }
              // } else if (orgApps.isRemoved === 'N') {
              //   orgApps.remove = true;
              // }
            });
          });
        }
        this.showIntegrations = true;
      });
    });
  }

  selectedLogo(logo: any): void {
    if (logo.isSelected === false) {
      logo.isSelected = true;
    } else {
      logo.isSelected = false;
    }
    this.selectedApplications = [];
    this.logoArray.forEach(app => {
      if (app.isSelected === true) {
        this.selectedApplications.push(app.name);
      }
    });
    this.loadCategoryAutomation();
  }

  getAppLogo(automation: string): string {
    var categoryAutomation = this.automationsByCategoryVO.find(category => category.automation === automation && category.applicationName !== undefined && category.applicationName !== null && category.applicationName !== '');
    const appLogo = this.logoArray.find(app => app.name === categoryAutomation.applicationName);
    return appLogo.img;
  }

  getAppLogoByAppName(applicationName: string): string {
    const appLogo = this.logoArray.find(app => app.name === applicationName);
    return appLogo.img;
  }

  getAppName(automation: string): string {
    var categoryAutomation = this.automationsByCategoryVO.find(category => category.automation === automation && category.applicationName !== undefined && category.applicationName !== null && category.applicationName !== '');
    return categoryAutomation.applicationName;
  }

  isApplicationLogo(automation: string): boolean {
    var value: boolean = false;
    var categoryAutomation = this.automationsByCategoryVO.find(category => category.automation === automation && category.applicationName !== undefined && category.applicationName !== null && category.applicationName !== '');
    if (categoryAutomation) {
      value = true;
    }
    return value;
  }

  getImage(orgApp: OrganizationIntegratedAppsVO): string {
    var image: string = '';
    this.appsArray.forEach(app => {
      if (orgApp.applicationName === app.name) {
        image = app.img;
      }
    });
    return image;
  }

  removeApplication(orgApp: OrganizationIntegratedAppsVO): void {
    var type = 'removeApp';
    this.eventAutomationVO.forEach(event => {
      if (event.automation.some(automationApp => automationApp.applications === orgApp.applicationName)
        && event.isRuleActive === true) {
        type = 'appAssociate';
      }
    });
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { type: type, applicationName: orgApp.applicationName }
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === true) {
        const appConfigVO = this.appConfigVOList.find(appConfig => appConfig.applicationName === orgApp.applicationName);
        this.disabled = true;
        orgApp.remove = false;
        this.appConfigService.saveAppConfig(appConfigVO).subscribe(data => {
          if (data) {
            this.disabled = false;
            var taskboardAppIndex = this.appConfigVOList.findIndex(app => app.applicationName === appConfigVO.applicationName);
            if (taskboardAppIndex) {
              this.appConfigVOList.splice(taskboardAppIndex, 1);
            }
          }
          const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
            disableClose: true,
            width: '100px',
            data: { type: 'spinner' }
          });
          this.automationService.getAutomationsByCategory(this.data.taskboardId).subscribe(categoryRes => {
            this.count++;
            this.automationService.getAutomationConfigurationList(this.data.taskboardId).subscribe(data => {
              this.count++;
              this.eventAutomationConfigurationVO = data;
              dialog.close();
              this.automationsByCategoryVO = categoryRes;
              this.loadCategoryAutomation();
            });
          });
          this.script.splice(0);
          for (let i = 0; i < this.eventAutomationVO.length; i++) {
            this.automationSciptsVO = [];
            var applications: string[] = [];
            var diabledApps: string[] = [];
            for (let j = 0; j < this.eventAutomationVO[i].automation.length; j++) {
              if (this.eventAutomationVO[i].automation[j].applications) {
                applications.push(this.eventAutomationVO[i].automation[j].applications);
              } else {
                applications = [];
              }
            }
            if (applications) {
              diabledApps = applications.filter((app, i) => this.organizationApps.findIndex(orgApp => orgApp.applicationName === app && orgApp.remove === false) === i);
            }
            const scripts = new AutomationScriptVO();
            scripts.id = this.eventAutomationVO[i].id;
            scripts.automation = this.loadAutomations(this.eventAutomationVO[i].automation, false, this.eventAutomationVO[i].automationType);
            if (applications && applications.length > 0) {
              scripts.ruleActive = false;
              this.eventAutomationVO[i].isRuleActive = false;
            } else {
              scripts.ruleActive = this.eventAutomationVO[i].isRuleActive;
            }
            scripts.automationType = this.eventAutomationVO[i].automationType;
            scripts.appNameList = applications;
            scripts.disabledApps = diabledApps;
            this.script.push(scripts);
          }
        });
      }
    });
  }

  addApplication(orgApp: OrganizationIntegratedAppsVO): void {
    // if (orgApp.isRemoved === 'N') {
    //   var type = 'addApp';
    //   this.eventAutomationVO.forEach(event => {
    //     if (event.automation.some(automationApp => automationApp.applications === orgApp.applicationName)
    //       && event.isRuleActive === false) {
    //       type = 'appAssociateAdd';
    //     }
    //   });
    //   const dialog = this.dialog.open(ConfirmationDialogComponent, {
    //     width: '400px',
    //     data: { type: type, applicationName: orgApp.applicationName }
    //   });
    //   dialog.afterClosed().subscribe(data => {
    //     if (data && data === true) {
    //       const appConfigVO = new AppConfigurationVO();
    //       appConfigVO.id = null;
    //       appConfigVO.taskboardId = this.data.taskboardId;
    //       appConfigVO.applicationName = orgApp.applicationName;
    //       this.disabled = true;
    //       orgApp.remove = true;
    //       this.appConfigService.saveAppConfig(appConfigVO).subscribe(data => {
    //         if (data) {
    //           this.disabled = false;
    //           appConfigVO.id = data.responseId;
    //           if (this.appConfigVOList.length > 0) {
    //             var taskboardApp = this.appConfigVOList.findIndex(app => app.applicationName === appConfigVO.applicationName);
    //             if (taskboardApp) {
    //               this.appConfigVOList.splice(taskboardApp, 1);
    //             }
    //           }
    //           this.appConfigVOList.push(appConfigVO);
    //         }
    //         const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
    //           disableClose: true,
    //           width: '100px',
    //           data: { type: 'spinner' }
    //         });
    //         this.automationService.getAutomationsByCategory(this.data.taskboardId).subscribe(categoryRes => {
    //           this.count++;
    //           this.automationService.getAutomationConfigurationList(this.data.taskboardId).subscribe(data => {
    //             this.count++;
    //             this.eventAutomationConfigurationVO = data;
    //             dialog.close();
    //             this.automationsByCategoryVO = categoryRes;
    //             this.loadCategoryAutomation();
    //           });
    //         });
    //         this.script.splice(0);
    //         for (let i = 0; i < this.eventAutomationVO.length; i++) {
    //           this.automationSciptsVO = [];
    //           var applications: string[] = [];
    //           var diabledApps: string[] = [];
    //           for (let j = 0; j < this.eventAutomationVO[i].automation.length; j++) {
    //             if (this.eventAutomationVO[i].automation[j].applications) {
    //               applications.push(this.eventAutomationVO[i].automation[j].applications);
    //             } else {
    //               applications = [];
    //             }
    //           }
    //           if (applications) {
    //             diabledApps = applications.filter((app, i) => this.organizationApps.findIndex(orgApp => orgApp.applicationName === app && orgApp.remove === false) === i);
    //           }
    //           const scripts = new AutomationScriptVO();
    //           scripts.id = this.eventAutomationVO[i].id;
    //           scripts.automation = this.loadAutomations(this.eventAutomationVO[i].automation, false, this.eventAutomationVO[i].automationType);
    //           if (applications && applications.length > 0) {
    //             scripts.ruleActive = true;
    //             this.eventAutomationVO[i].isRuleActive = true;
    //           } else {
    //             scripts.ruleActive = this.eventAutomationVO[i].isRuleActive;
    //           }
    //           scripts.automationType = this.eventAutomationVO[i].automationType;
    //           scripts.appNameList = applications;
    //           scripts.disabledApps = diabledApps;
    //           this.script.push(scripts);
    //         }
    //       });
    //     }
    //   });
    // } else {
    this.automationService.integrateWithApp(orgApp.id, this.data.taskboardId);
    // const dialog = this.dialog.open(ApplicationConfigurationComponent, {
    //   width: '600px',
    //   data: {
    //     appName: orgApp.applicationName, orgApp: orgApp, edit: false,
    //     type: 'taskboard', taskboardId: this.data.taskboardId
    //   },
    // });
    // dialog.afterClosed().subscribe(data => {
    this.taskboardApps$ = this.automationService.taskboardApps$;
    this.taskboardApps$.subscribe(data => {
      if (data) {
        this.appConfigVOList = [];
        this.appConfigVOList = data;
        if (this.appConfigVOList.some(a => a.applicationName === orgApp.applicationName)) {
          orgApp.remove = true;
        }
        // const spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        //   disableClose: true,
        //   width: '100px',
        //   data: { type: 'spinner' }
        // });
        this.automationService.getAutomationsByCategory(this.data.taskboardId).subscribe(categoryRes => {
          this.count++;
          this.automationService.getAutomationConfigurationList(this.data.taskboardId).subscribe(data => {
            this.count++;
            // spinner.close();
            this.eventAutomationConfigurationVO = data;
            this.automationsByCategoryVO = categoryRes;
            this.loadCategoryAutomation();
            this.script.splice(0);
            for (let i = 0; i < this.eventAutomationVO.length; i++) {
              this.automationSciptsVO = [];
              var applications: string[] = [];
              var diabledApps: string[] = [];
              for (let j = 0; j < this.eventAutomationVO[i].automation.length; j++) {
                if (this.eventAutomationVO[i].automation[j].applications) {
                  applications.push(this.eventAutomationVO[i].automation[j].applications);
                } else {
                  applications = [];
                }
              }
              if (applications) {
                diabledApps = applications.filter((app, i) => this.organizationApps.findIndex(orgApp => orgApp.applicationName === app && orgApp.remove === false) === i);
              }
              const scripts = new AutomationScriptVO();
              scripts.id = this.eventAutomationVO[i].id;
              scripts.automation = this.loadAutomations(this.eventAutomationVO[i].automation, false, this.eventAutomationVO[i].automationType);
              if (applications && applications.length > 0) {
                scripts.ruleActive = true;
                this.eventAutomationVO[i].isRuleActive = true;
              } else {
                scripts.ruleActive = this.eventAutomationVO[i].isRuleActive;
              }
              scripts.automationType = this.eventAutomationVO[i].automationType;
              scripts.appNameList = applications;
              scripts.disabledApps = diabledApps;
              this.script.push(scripts);
            }
          });
        });
      }
    });
    // }
  }

  getIcon(categoryName: string): string {
    const category = this.categoriesArray.find(category => category.name === categoryName);
    return category.icon;
  }

  getIconColor(categoryName: string): string {
    const category = this.categoriesArray.find(category => category.name === categoryName);
    return category.color;
  }

  loadAutomationsList() {
    this.automationService.getAutomationList(this.data.taskboardId).subscribe(data => {
      this.isDisabled = false;
      this.count++;
      if (data) {
        if (data.length > 0) {
          this.tabType = 'boardAutomation';
        }
        this.script = [];
        this.eventAutomationVO = data;
        for (let i = 0; i < this.eventAutomationVO.length; i++) {
          if (this.eventAutomationVO[i].isRuleActive === 'Y') {
            this.eventAutomationVO[i].isRuleActive = true;
          } else {
            this.eventAutomationVO[i].isRuleActive = false;
          }
          this.automationSciptsVO = [];
          var applications: string[] = [];
          var diabledApps: string[] = [];

          for (let j = 0; j < this.eventAutomationVO[i].automation.length; j++) {
            if (this.eventAutomationVO[i].automation[j].applications) {
              applications.push(this.eventAutomationVO[i].automation[j].applications);
            } else {
              applications = [];
            }
          }
          if (applications) {
            diabledApps = applications.filter((app, i) => this.organizationApps.findIndex(orgApp => orgApp.applicationName === app && orgApp.remove === false) === i);
          }
          const scripts = new AutomationScriptVO();
          scripts.id = this.eventAutomationVO[i].id;
          scripts.automation = this.loadAutomations(this.eventAutomationVO[i].automation, false, this.eventAutomationVO[i].automationType);
          scripts.ruleActive = this.eventAutomationVO[i].isRuleActive;
          scripts.automationType = this.eventAutomationVO[i].automationType;
          scripts.appNameList = applications;
          scripts.disabledApps = diabledApps;
          this.script.push(scripts);
        }
      }
    });
  }

  loadBoardUsers() {
    this.securityService.getTaskboardSecurity(this.data.taskboardId).subscribe(data => {
      if (data.securityList && data.securityList.length) {
        for (let i = 0; i < data.securityList.length; i++) {
          this.data.groupList.forEach(element => {
            if (element.groupName === data.securityList[i].groupId) {
              this.boardGroups.push(element);
            }
          });
        }
      }
      this.usersList = this.data.userList;
      for (let i = 0; i < this.boardGroups.length; i++) {
        this.usersList.forEach(element => {
          element.groupVOList.forEach(group => {
            if (group.groupName === this.boardGroups[i].groupName) {
              this.boardUsers.push(element);
            }
          });
        });
      }
      for (let i = 0; i < data.columnSecurityList.length; i++) {
        for (let j = 0; j < data.columnSecurityList[i].columnPermissions.length; j++) {
          this.usersList.forEach(element => {
            element.groupVOList.forEach(group => {
              if (group.groupName === data.columnSecurityList[i].columnPermissions[j].groupId) {
                this.boardUsers.push(element);
              }
            });
          });
        }
      }
      for (let i = 0; i < data.taskboardOwner.length; i++) {
        let user = this.usersList.find(user => user.userId === data.taskboardOwner[i]);
        this.boardUsers.push(user);
      }
      this.boardUsers = this.boardUsers.filter((v, i) => this.boardUsers.findIndex(item => item.userId == v.userId) === i);
    });
  }

  loadAutomationsByCategory() {
    this.automationService.getAutomationsByCategory(this.data.taskboardId).subscribe(categoryRes => {
      this.count++;
      this.automationService.getAutomationConfigurationList(this.data.taskboardId).subscribe(data => {
        this.count++;
        this.eventAutomationConfigurationVO = data;
        this.automationsByCategoryVO = categoryRes;
        this.filteredAutomtaions = categoryRes;
        this.loadCategoryAutomation();
      });
    });
  }

  loadCategoryAutomation() {
    this.categoryAutomations = [];
    const selectedCategory = this.categoriesArray.find(category => category.isSelected === true);
    for (let i = 0; i < this.categoriesArray.length; i++) {
      if (this.automationsByCategoryVO.some(category => category.categoryName === this.categoriesArray[i].name) && (selectedCategory.name === 'All' || selectedCategory.name === this.categoriesArray[i].name)) {
        const categoryAutomation = new CategoryAutomations();
        categoryAutomation.categoryName = this.categoriesArray[i].name;
        if (categoryAutomation.automation === undefined || categoryAutomation.automation === null) {
          categoryAutomation.automation = [];
        }
        this.automationsByCategoryVO.forEach(element => {
          if (element.categoryName === this.categoriesArray[i].name && (this.selectedApplications.length === 0
            || this.selectedApplications.includes(element.applicationName))) {
            categoryAutomation.automation.push(element.automation);
          }
        });
        this.categoryAutomations.push(categoryAutomation);
      }
    }
  }

  getAutomation(id: string, automationType: string): void {
    this.automationType = null;
    this.automationFrom = 'existing';
    if (automationType === 'schedule') {
      this.type = 'timePeriod';
    } else {
      this.type = 'automtion';
    }
    this.updateAutomation = true;
    let automationVO = this.eventAutomationVO.find(event => event.id === id);
    this.automationSciptsVO = [];
    this.timePeriodScript = [];
    this.eventAutomationId = id;
    this.actionsList = [];
    this.loadAutomations(automationVO.automation, true, automationVO.automationType)
  }

  back() {
    this.show = false;
  }

  createAutomation(): void {
    this.automationType = null;
    this.automationFrom = 'existing';
    this.type = 'automtion';
    this.isActions = true;
    this.updateAutomation = false;
    this.show = true;
    this.automationSciptsVO = [];
    this.timePeriodScript = [];
    this.actionsList = [];
    this.eventAutomationId = null;
    this.isSecondaryAction = false;
    this.eventAutomationConfigurationVO.forEach(element => {
      if (element.parentId === null) {
        this.actionsList.push(element);
      }
    });
  }

  deleteAutomation(id: string, i: number): void {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: 'automationDelete'
    });
    dialog.afterClosed().subscribe(data => {
      if (data === true) {
        const eventAutomationVO = new EventAutomationVO();
        eventAutomationVO.id = id;
        this.automationService.deleteAutomation(eventAutomationVO).subscribe(data => {
          this.script.splice(i, 1);
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: 'Automation deleted successfully',
          });
        });
      }
    });
  }

  change(event: MatSlideToggleChange, script: AutomationScriptVO, i: number): void {
    script.ruleActive = event.checked;
    const eventAutomationVO = new EventAutomationVO();
    eventAutomationVO.id = script.id;
    if (event.checked === true) {
      eventAutomationVO.isRuleActive = 'Y';
    } else {
      eventAutomationVO.isRuleActive = 'N';
    }
    this.automationService.setRuleActive(eventAutomationVO).subscribe(data => {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: data.response,
      });
      this.eventAutomationVO.forEach(automation => {
        if (automation.id === eventAutomationVO.id) {
          automation.isRuleActive = event.checked;
        }
      });
    });
  }

  loadAutomations(automationVO: AutomationVO[], showScript: boolean, automationType: string): AutomationScripts[] {
    this.show = showScript;
    for (let i = 0; i < automationVO.length; i++) {
      if (automationType === 'schedule') {
        this.date = automationVO[i].root.values;
        this.automation = automationVO[i].conditions[0].data.split(' ');
        this.timePeriodAutomation = automationVO[i].conditions[0].data;
        let connectedScript = {
          words: [','],
          automation: ',',
          keyValuePair: {
            keyword: '',
            automationType: '',
            color: '',
            value: '',
            automationSubType: ''
          },
          id: 'connector',
          type: 'connector',
        }
        this.timePeriodScript.push(connectedScript);
        automationVO[i].conditions[0].actions.forEach(action => {
          this.setActionsAutomation(action, 'action', 'schedule');
        });
      } else {
        let newArray: any;
        let keyword: string = '';
        if (automationVO[i].root.automationKey === 'Starting from') {
          newArray = automationVO[i].root.automationKey.concat(' date');
          keyword = 'date';
        } else {
          newArray = automationVO[i].root.automationKey;
        }
        let parentScript = {
          words: newArray.split(' '),
          automation: automationVO[i].root.automationKey,
          keyValuePair: {
            keyword: keyword,
            automationType: keyword,
            color: '',
            value: keyword,
            automationSubType: ''
          },
          id: automationVO[i].root.id,
          type: 'parentAutomation',
        }
        if (automationVO[i].root.automationKey === 'Starting from') {
          const index = parentScript.words.findIndex(word => word === parentScript.keyValuePair.value);
          if (automationVO[i].root.values && automationVO[i].root.values.length > 0) {
            parentScript.words[index] = automationVO[i].root.values;
            parentScript.keyValuePair.value = automationVO[i].root.values;
          }
        }
        this.automationSciptsVO.push(parentScript);
        for (let j = 0; j < automationVO[i].conditions.length; j++) {
          this.setAutomation(automationVO[i].conditions[j], 'condition', 'type');
          for (let k = 0; k < automationVO[i].conditions[j].actions.length; k++) {
            this.setActionsAutomation(automationVO[i].conditions[j].actions[k], 'action', 'type');
            if (k < automationVO[i].conditions[j].actions.length - 1) {
              this.setConnectors(',', 'connector');
            }
          }
          if (i < automationVO.length - 1) {
            this.setConnectors('and', 'event');
          } else {
            this.isSecondaryAction = true;
          }
        }
      }
    }
    if (automationType === 'schedule') {
      return this.timePeriodScript;
    } else {
      return this.automationSciptsVO;
    }
  }

  setConnectors(automation: any, type: string): void {
    let connectedScript = {
      words: [automation],
      automation: automation,
      keyValuePair: {
        keyword: '',
        automationType: '',
        color: '',
        value: '',
        automationSubType: ''
      },
      id: type,
      type: type,
    }
    this.automationSciptsVO.push(connectedScript);
  }

  setAutomation(automation: any, type: string, automationType: string): void {
    let keyword: string;
    let keyword2: string;
    let keyword3: string;
    let array: any;
    let newArray: any = null;
    if (automation.automationType === 'label') {
      var re = /label/gi;
      newArray = automation.automationKey.replace(re, "label ( choose )");
    }
    if (automation.automationType === 'task field') {
      var re = /field/gi;
      newArray = automation.automationKey.replace(re, "field ( choose )");
    }
    if (newArray !== null) {
      array = newArray.split(' ');
    } else {
      if (automation.automationKey === 'every time period') {
        array = ['every', 'time period'];
      } else if (automation.automationType === 'due date') {
        array = ['a', 'due date', 'arrives'];
      }
      else {
        array = automation.automationKey.split(' ');
      }
    }
    if (automation.automationKey.includes('subtask status')
      || automation.automationKey.includes('subtasks')) {
      array.push('choose subtask status');
    } else if (automation.automationType === 'task field') {
      const index = array.findIndex(element => element === 'choose');
      array[index] = 'choose status';
    } else if (automation.automationKey.includes('status')) {
      array.push('choose status');
    } else if (automation.automationKey === 'assigned to') {
      array.push('someone');
    } else if (automation.automationType === 'new task') {
      array.push('choose taskboard');
    } else if (automation.automationType === 'create task') {
      array.push(this.data.boardName);
    }

    array.forEach(element => {
      if (keyword === undefined || keyword === null || keyword === '') {
        keyword = this.action.keyWords.find(keyword => keyword === element);
      }
      if (keyword !== element && (keyword2 === undefined || keyword2 === null || keyword2 === '')) {
        keyword2 = this.action.keyWords.find(keyword => keyword === element);
      }
      if (keyword !== element && keyword2 !== element && (keyword3 === undefined || keyword3 === null || keyword3 === '')) {
        keyword3 = this.action.keyWords.find(word => word === element);
      }
    });
    let color: any;
    if (automation.automationType !== undefined && automation.automationType !== null
      && automation.automationType !== 'notify' && automation.automationType !== 'assigned'
      && automation.values && automation.values.length > 0) {
      color = this.action.getColor(automation.automationType, automation.values[0], this.data)
    } else {
      color = '';
    }
    var mappingValues: any;
    var channel: any;
    if (automation.automationType === 'new task') {
      mappingValues = automation.mappingValues;
    }
    if (automation.automationType === 'app_notification') {
      channel = automation.values[0].channel;
    }
    let scriptsVO = {
      words: array,
      automation: automation.automationKey,
      keyValuePair: {
        keyword: keyword,
        keyword2: keyword2,
        keyword3: keyword3,
        automationType: automation.automationType,
        color: color,
        value: keyword,
        message: keyword2,
        automationSubType: automation.automationSubType,
        assignee: null,
        mappingValues: mappingValues,
        channel: channel,
        fieldValue: '',
        fieldType: '',
        status: '',
        selectedField: ''
      },
      id: automation.id,
      type: type,
    }
    if (automation.automationType === 'task field') {
      scriptsVO.keyValuePair.selectedField = keyword2;
      scriptsVO.keyValuePair.fieldValue = keyword3;
      scriptsVO.keyValuePair.message = '';
      scriptsVO.keyValuePair.status = keyword;
      if (automation.eventSpecificMaps?.selectedField?.fieldName) {
        const index = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.selectedField);
        const fieldValue = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.fieldValue);
        const statusIndex = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.status);
        scriptsVO.words[index] = automation.eventSpecificMaps?.selectedField?.fieldName;
        scriptsVO.words[fieldValue] = automation.eventSpecificMaps?.selectedField?.fieldValue;
        scriptsVO.words[statusIndex] = automation.eventSpecificMaps?.selectedField?.status;
        scriptsVO.keyValuePair.fieldValue = automation.eventSpecificMaps?.selectedField?.fieldValue;
        scriptsVO.keyValuePair.selectedField = automation.eventSpecificMaps?.selectedField?.fieldName;
        scriptsVO.keyValuePair.fieldType = automation.eventSpecificMaps?.selectedField?.fieldType;
        scriptsVO.keyValuePair.value = automation.eventSpecificMaps?.selectedField?.status;
        scriptsVO.keyValuePair.status = automation.eventSpecificMaps?.selectedField?.status;
      }
    }
    const index = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.value);
    const messageIndex = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.message);
    if (automation.automationType === 'notify' || automation.automationType === 'assigned'
      || automation.automationType === 'app_notification') {
      if ((automation.automationType === 'notify' || automation.automationType === 'assigned')
        && automation.values.length > 0 && (automation.values[0].user
          || automation.values[0].group || automation.values[0].customUsers)) {
        this.setUsersValue(index, automation, scriptsVO);
      }
      if (automation.automationType === 'app_notification') {
        scriptsVO.words[index] = automation.values[0].channel.name;
        scriptsVO.keyValuePair.value = automation.values[0].channel.name;
      }
      if (automation.message) {
        scriptsVO.words[messageIndex] = automation.message;
        scriptsVO.keyValuePair.message = automation.message;
      }
    } else if (automation.automationType !== 'task field' && automation.values && automation.values.length > 0) {
      scriptsVO.words[index] = automation.values[0];
      scriptsVO.keyValuePair.value = automation.values[0];
    }
    if (automation.automationType === 'time period' && automation.data) {
      scriptsVO.words[index] = automation.data;
      scriptsVO.keyValuePair.value = automation.data;
    }
    if (automationType === 'schedule') {
      this.timePeriodScript.push(scriptsVO);
    } else {
      this.automationSciptsVO.push(scriptsVO);
    }
  }

  setActionsAutomation(automation: any, type: string, automationType: string): void {
    let keyword: string;
    let keyword2: string;
    let keyword3: string;
    let keyword4: string = null;
    let keyword5: string = null;
    let array: any;
    let newArray: any = null;
    if (automation.automationType) {
      automation.actionType = automation.automationType;
      automation.actionKey = automation.automationKey;
    }
    if (automation.actionType === 'label') {
      var re = /label/gi;
      newArray = automation.actionKey.replace(re, "label ( choose )");
    }
    if (automation.actionType === 'task field') {
      var re = /field/gi;
      newArray = automation.actionKey.replace(re, "field ( choose )");
    }
    if (newArray !== null) {
      array = newArray.split(' ');
    } else {
      if (automation.actionKey === 'every time period') {
        array = ['every', 'time period'];
      } else if (automation.actionType === 'due date') {
        array = ['a', 'due date', 'arrives'];
      }
      else {
        array = automation.actionKey.split(' ');
      }
    }
    if (automation.actionKey.includes('subtask status')
      || automation.actionKey.includes('subtasks')) {
      array.push('choose subtask status');
    } else if (automation.actionKey.includes('status')) {
      array.push('choose status');
    } else if (automation.actionKey === 'assigned to') {
      array.push('someone');
    } else if (automation.actionType === 'new task') {
      array.push('choose taskboard');
    } else if (automation.actionType === 'create task') {
      array.push(this.data.boardName);
    } else if (automation.actionType === 'email_campaign') {
      const index = array.findIndex(element => element === 'column');
      array[index] = 'column/custom email';
    }
    array.forEach(element => {
      if (automation.actionType !== 'due_date_count') {
        if (keyword === undefined || keyword === null || keyword === '') {
          keyword = this.action.keyWords.find(keyword => keyword === element);
        }
        if (keyword !== element && (keyword2 === undefined || keyword2 === null || keyword2 === '')) {
          keyword2 = this.action.keyWords.find(word => word === element);
        }
        if (keyword !== element && keyword2 !== element && (keyword3 === undefined || keyword3 === null || keyword3 === '')) {
          keyword3 = this.action.keyWords.find(word => word === element);
        }
        if (keyword !== element && keyword2 !== element && keyword3 !== element &&
          (keyword4 === undefined || keyword4 === null || keyword4 === '')) {
          keyword4 = this.action.keyWords.find(word => word === element);
        }
        if (keyword !== element && keyword2 !== element && keyword3 !== element && keyword4 !== element &&
          (keyword5 === undefined || keyword5 === null || keyword5 === '')) {
          keyword5 = this.action.keyWords.find(word => word === element);
        }
      } else {
        keyword = 'enter';
      }
    });
    let color: any;
    if (automation.actionType !== undefined && automation.actionType !== null
      && automation.actionType !== 'notify' && automation.actionType !== 'assigned'
      && automation.actionType !== 'app_notification'
      && automation.values && automation.values.length > 0) {
      if (automation.actionType === 'status') {
        color = this.action.getColor(automation.actionType, automation.values[0].status, this.data);
      } else {
        color = this.action.getColor(automation.actionType, automation.values[0], this.data);
      }
    } else {
      color = '';
    }
    var mappingValues: any;
    var channel: any;
    if (automation.actionType === 'new task') {
      mappingValues = automation.mappingValues;
    }
    if (automation.actionType === 'app_notification') {
      if ((automation.applicationName === 'Slack' || automation.applicationName === 'Microsoft Teams') && automation.values.length > 0 && automation.values[0].channel) {
        channel = automation.values[0].channel;
      }
    }
    var automationKey: any;
    var automationtype: any;
    if (type === 'action') {
      automationKey = automation.actionKey;
      automationtype = automation.actionType;
    } else {
      automationKey = automation.actionKey;
      automationtype = automation.actionType;
    }
    let scriptsVO = {
      words: array,
      automation: automationKey,
      keyValuePair: {
        keyword: keyword,
        keyword2: keyword2,
        keyword3: keyword3,
        keyword4: keyword4,
        keyword5: keyword5,
        automationType: automationtype,
        color: color,
        value: keyword,
        message: keyword2,
        assignee: null,
        mappingValues: mappingValues,
        channel: channel,
        columnName: '',
        tableId: '',
        customMails: '',
        startColumn: '',
        yorosisPageId: '',
        boardId: '',
        subject: '',
        header: '',
        startTime: '',
        endTime: '',
        location: '',
        automationSubType: automation.subType,
        filterValues: '',
        tableIdentifier: ''
      },
      id: automation.id,
      type: type,
    }
    if (automation.actionType === 'app_notification') {
      var applicationName: string;
      this.action.appNameList.forEach(app => {
        if (scriptsVO.automation.includes(app.value)) {
          applicationName = app.name;
        }
      });
      this.applicationName = applicationName;
      if (applicationName !== 'Slack' && applicationName !== 'Microsoft Teams') {
        if (!scriptsVO.keyValuePair.keyword2) {
          scriptsVO.keyValuePair.keyword2 = keyword;
          scriptsVO.keyValuePair.message = keyword;
        }
      }
      if (applicationName === 'Outlook') {
        if (scriptsVO.keyValuePair.keyword5 && automation.subType) {
          scriptsVO.keyValuePair.header = keyword5;
          scriptsVO.keyValuePair.startTime = keyword2;
          scriptsVO.keyValuePair.endTime = keyword3;
          scriptsVO.keyValuePair.location = keyword4;
        } else if (scriptsVO.keyValuePair.keyword3 && !automation.subType) {
          scriptsVO.keyValuePair.header = keyword3;
        }
      }
    } else if (automation.actionType === 'app_schedule') {
      var applicationName: string;
      this.action.appNameList.forEach(app => {
        if (scriptsVO.automation.includes(app.value)) {
          applicationName = app.name;
        }
      });
      if (applicationName === 'Outlook') {
        scriptsVO.keyValuePair.header = keyword5;
        scriptsVO.keyValuePair.startTime = keyword2;
        scriptsVO.keyValuePair.endTime = keyword3;
        scriptsVO.keyValuePair.location = keyword4;
      }
    }
    if (automation.actionType === 'email_campaign') {
      scriptsVO.keyValuePair.columnName = keyword3;
      scriptsVO.keyValuePair.subject = keyword4;
    }
    const index = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.value);
    const messageIndex = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.message);
    if (automation.actionType === 'notify' || automation.actionType === 'assigned'
      || automation.actionType === 'app_notification' || automation.actionType === 'email_campaign' || automation.actionType === 'app_schedule') {
      if ((automation.actionType === 'notify' || automation.actionType === 'assigned')
        && automation.values.length > 0 && (automation.values[0].user
          || automation.values[0].group || automation.values[0].customUsers)) {
        this.setUsersValue(index, automation, scriptsVO);
      }
      if (automation.actionType === 'app_notification') {
        // if (automation.values[0].channel && automation.values[0].channel.name) {
        //   scriptsVO.words[index] = automation.values[0].channel.name;
        //   scriptsVO.keyValuePair.value = automation.values[0].channel.name;
        // } else {
        //   scriptsVO.words[index] = automation.values[0];
        //   scriptsVO.keyValuePair.value = automation.values[0];
        // }
        if ((automation.applicationName === 'Slack' || automation.applicationName === 'Microsoft Teams') && automation.values && automation.values.length > 0 && automation.values[0].channel && automation.values[0].channel.name) {
          scriptsVO.words[index] = automation.values[0].channel.name;
          scriptsVO.keyValuePair.value = automation.values[0].channel.name;
        } else if (automation.values && automation.values.length > 0 && automation.values[0] && automation.applicationName === 'Outlook') {
          // this.setUsersValue(index, automation, scriptsVO);
          this.setOutlookToReceipientUsers(automation, scriptsVO);
          if (automation.values[0].actionSpecificMaps?.header) {
            const headerIndex = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.header);
            scriptsVO.words[headerIndex] = automation.values[0].actionSpecificMaps?.header;
            scriptsVO.keyValuePair.header = automation.values[0].actionSpecificMaps?.header;
          }
        } else {
          if (automation.message) {
            scriptsVO.words[messageIndex] = automation.message;
            scriptsVO.keyValuePair.message = automation.message;
          }
          if (automation.applicationName === 'Twitter' || automation.applicationName === 'LinkedIn') {
            scriptsVO.keyValuePair.subject = automation.subject;
          }
        }
      } else if (automation.actionType === 'app_schedule' && automation.applicationName === 'Outlook' && automation.values && automation.values.length > 0 && automation.values[0]) {
        this.setOutlookToReceipientAdress(automation, scriptsVO);
      }
      if (automation.message && automation.actionType !== 'app_schedule') {
        scriptsVO.words[messageIndex] = automation.message;
        scriptsVO.keyValuePair.message = automation.message;
      }
      if (automation.actionType === 'email_campaign' && automation.values[0]) {
        const columnName = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.columnName);
        if (automation.values[0].tableId) {
          scriptsVO.words[columnName] = automation.values[0].columnName;
          scriptsVO.keyValuePair.tableId = automation.values[0].tableId;
          scriptsVO.keyValuePair.columnName = automation.values[0].columnName;
        } else {
          var customMail: string;
          for (let i = 0; i < automation.values[0].customMails.length; i++) {
            if (i === 0) {
              customMail = automation.values[0].customMails[i];
            } else {
              customMail = customMail + ' ,' + automation.values[0].customMails[i];
            }
          }
          scriptsVO.words[columnName] = customMail;
          scriptsVO.keyValuePair.columnName = customMail;
          scriptsVO.keyValuePair.customMails = automation.values[0].customMails;
        }
        if (automation.subject) {
          const subjectIndex = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.subject);
          scriptsVO.keyValuePair.subject = automation.subject;
          scriptsVO.words[subjectIndex] = automation.subject;
        }
        scriptsVO.keyValuePair.value = automation.values[0].emailServerName;
        scriptsVO.words[index] = automation.values[0].emailServerName;
      }
    } else if (automation.values && automation.values.length > 0) {
      if (automation.actionType === 'status') {
        scriptsVO.words[index] = automation.values[0].status;
        scriptsVO.keyValuePair.value = automation.values[0].status;
      } else if ((automation.actionType === 'new task' || automation.actionType === 'create task') && automation.values[0].targetBoardName) {
        scriptsVO.words[index] = automation.values[0].targetBoardName;
        scriptsVO.keyValuePair.value = automation.values[0].targetBoardName;
        scriptsVO.keyValuePair.mappingValues = automation.mappingValues;
        scriptsVO.keyValuePair.yorosisPageId = automation.yorosisPageId;
        scriptsVO.keyValuePair.boardId = automation.values[0].targetBoardId;
        scriptsVO.keyValuePair.startColumn = automation.values[0].startColumn;
      } else if (automation.actionType === 'due_date_count') {
        scriptsVO.words[index] = automation.values[0].numberOfDays;
        scriptsVO.keyValuePair.value = automation.values[0].numberOfDays;
      } else {
        scriptsVO.words[index] = automation.values[0];
        scriptsVO.keyValuePair.value = automation.values[0];
      }
    }
    if (automation.actionType === 'time period' && automation.data) {
      scriptsVO.words[index] = automation.data;
      scriptsVO.keyValuePair.value = automation.data;
    }
    if (automation.actionType === 'data_table' && automation.actionSpecificMaps.dataTableName) {
      scriptsVO.words[index] = automation.actionSpecificMaps.dataTableName;
      scriptsVO.keyValuePair.mappingValues = automation.mappingValues;
      scriptsVO.keyValuePair.filterValues = automation.actionSpecificMaps.filterValues;
      scriptsVO.keyValuePair.value = automation.actionSpecificMaps.dataTableName;
      scriptsVO.keyValuePair.tableIdentifier = automation.actionSpecificMaps.tableIdentifier;
    }
    if (automationType === 'schedule') {
      this.timePeriodScript.push(scriptsVO);
    } else {
      this.automationSciptsVO.push(scriptsVO);
    }
  }

  setOutlookToReceipientAdress(automation: any, scriptsVO: AutomationScripts): void {
    const i = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.keyword);
    var toMail: string;
    for (let i = 0; i < automation.values[0].actionSpecificMaps.toRecepientEmailAddress.length; i++) {
      if (i === 0) {
        toMail = automation.values[0].actionSpecificMaps.toRecepientEmailAddress[i].name;
      } else {
        toMail = toMail + ' ,' + automation.values[0].actionSpecificMaps.toRecepientEmailAddress[i].name;
      }
    }
    scriptsVO.words[i] = toMail;
    scriptsVO.keyValuePair.assignee = toMail;
    scriptsVO.keyValuePair.toMail = toMail;
    scriptsVO.keyValuePair.value = toMail;
    scriptsVO.keyValuePair.actionSpecificMaps = automation.values[0].actionSpecificMaps;
    if (automation.values[0].actionSpecificMaps?.header) {
      const headerIndex = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.header);
      scriptsVO.words[headerIndex] = automation.values[0].actionSpecificMaps?.header;
      scriptsVO.keyValuePair.header = automation.values[0].actionSpecificMaps?.header;
    }
    if (automation.values[0].actionSpecificMaps?.location) {
      const locationIndex = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.location);
      scriptsVO.words[locationIndex] = automation.values[0].actionSpecificMaps?.location;
      scriptsVO.keyValuePair.location = automation.values[0].actionSpecificMaps?.location;
    }
    if (automation.values[0].actionSpecificMaps?.startTime) {
      const startTimeIndex = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.startTime);
      scriptsVO.words[startTimeIndex] = automation.values[0].actionSpecificMaps?.startTime?.dateTime;
      scriptsVO.keyValuePair.startTime = automation.values[0].actionSpecificMaps?.startTime?.dateTime;
    }
    if (automation.values[0].actionSpecificMaps?.endTime) {
      const endTimeIndex = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.endTime);
      scriptsVO.words[endTimeIndex] = automation.values[0].actionSpecificMaps?.endTime?.dateTime;
      scriptsVO.keyValuePair.endTime = automation.values[0].actionSpecificMaps?.endTime?.dateTime;
    }
  }

  setOutlookToReceipientUsers(automation: any, scriptsVO: AutomationScripts): void {
    const i = scriptsVO.words.findIndex(word => word === scriptsVO.keyValuePair.keyword);
    var toMail: string;
    for (let i = 0; i < automation.values[0].actionSpecificMaps.toRecepientEmailAddress.length; i++) {
      if (i === 0) {
        toMail = automation.values[0].actionSpecificMaps.toRecepientEmailAddress[i].name;
      } else {
        toMail = toMail + ' ,' + automation.values[0].actionSpecificMaps.toRecepientEmailAddress[i].name;
      }
    }
    scriptsVO.words[i] = toMail;
    scriptsVO.keyValuePair.assignee = toMail;
    scriptsVO.keyValuePair.toMail = toMail;
    scriptsVO.keyValuePair.value = toMail;
    scriptsVO.keyValuePair.actionSpecificMaps = automation.values[0].actionSpecificMaps;
  }

  setUsersValue(index: number, automation: any, scriptsVO: AutomationScripts): void {
    var users: any[] = [];
    var groups: any[] = [];
    var keyValue = new UsersValue();
    var groupValue: GroupValue;
    var value: string = '';
    var customUsers: string[] = [];
    if (automation.values[0].user) {
      for (let i = 0; i < automation.values[0].user.length; i++) {
        if (i === 0) {
          value = automation.values[0].user[i].userName;
        } else {
          value = value + ', ' + automation.values[0].user[i].userName;
        }
        const user = new Users();
        user.userId = automation.values[0].user[i].userId;
        user.userName = automation.values[0].user[i].userName;
        users.push(user);
      }
    }
    if (automation.values[0].group) {
      for (let i = 0; i < automation.values[0].group.length; i++) {
        if (value === '') {
          value = automation.values[0].group[i].groupName;
        } else {
          value = value + ', ' + automation.values[0].group[i].groupName;
        }
        const group = new Groups();
        group.groupId = automation.values[0].group[i].groupId;
        group.groupName = automation.values[0].group[i].groupName;
        groups.push(group);
      }
    }
    if (automation.values[0].customUsers) {
      for (let i = 0; i < automation.values[0].customUsers.length; i++) {
        customUsers.push(automation.values[0].customUsers[i]);
        if (value === '') {
          value = customUsers[i];
        } else {
          value = value + ', ' + customUsers[i];
        }
      }
    }
    keyValue.user = users;
    keyValue.group = groups;
    keyValue.customUsers = customUsers;
    scriptsVO.words[index] = value;
    scriptsVO.keyValuePair.value = value;
    scriptsVO.keyValuePair.assignee = keyValue;
  }

  getUsers(event: any): void {
    var value: string = '';
    var keyValue = new UsersValue();
    var users: any[] = [];
    var groups: any[] = [];
    var customUsers: string[] = [];
    for (let i = 0; i < event.users.length; i++) {
      if (i === 0) {
        value = event.users[i].firstName + ' ' + event.users[i].lastName;
      } else {
        value = value + ', ' + event.users[i].firstName + ' ' + event.users[i].lastName;
      }
      const user = new Users();
      user.userId = event.users[i].userId;
      user.userName = event.users[i].firstName + ' ' + event.users[i].lastName;
      users.push(user);
    }
    for (let i = 0; i < event.groups.length; i++) {
      if (value === '') {
        value = event.groups[i].groupName;
      } else {
        value = value + ', ' + event.groups[i].groupName;
      }
      const group = new Groups();
      group.groupId = event.groups[i].groupId;
      group.groupName = event.groups[i].groupName;
      groups.push(group);
    }
    if (event.customUsers) {
      for (let i = 0; i < event.customUsers.length; i++) {
        customUsers.push(event.customUsers[i]);
        if (value === '') {
          value = customUsers[i];
        } else {
          value = value + ', ' + customUsers[i];
        }
      }
    }
    keyValue.user = users;
    keyValue.group = groups;
    keyValue.customUsers = customUsers;
    this.isActions = true;
    if (!this.eventAutomationConfigurationVO.some(event => event.parentId === this.selectedScript.id)) {
      this.isSecondaryAction = true;
      this.actionsList = [];
    }
    if (this.automationFrom === 'category') {
      this.actionsList = [];
    }
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.value);
    this.selectedScript.words[index] = value;
    this.selectedScript.keyValuePair.value = value;
    this.selectedScript.keyValuePair.assignee = keyValue;
    if (this.automationType === 'notify') {
      this.automationType = 'message';
    }
  }

  loadMessage(message: string): void {
    if (message === 'message') {
      message = 'message ';
    }
    this.isActions = true;
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.message);
    this.selectedScript.words[index] = message;
    this.selectedScript.keyValuePair.message = message;
  }

  loadChannel(event: any): void {
    this.isActions = true;
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.value);
    this.selectedScript.words[index] = event.name;
    this.selectedScript.keyValuePair.value = event.name;
    this.selectedScript.keyValuePair.channel = event;
  }

  loadBoardDetails(event: any): void {
    this.isActions = true;
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.value);
    this.selectedScript.words[index] = event.taskboardName;
    this.selectedScript.keyValuePair.value = event.taskboardName;
    this.selectedScript.keyValuePair.mappingValues = event.taskDetails;
    this.selectedScript.keyValuePair.yorosisPageId = this.data.page.yorosisPageId;
    this.selectedScript.keyValuePair.boardId = event.id;
    this.selectedScript.keyValuePair.startColumn = event.startColumn;
  }

  loadDays(userForm: NgForm): void {
    if (userForm.valid) {
      this.isActions = true;
      const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.value);
      this.selectedScript.words[index] = this.form.get('numberOfDays').value;
      this.selectedScript.keyValuePair.value = this.form.get('numberOfDays').value;
      this.menu.closeMenu();
    }
  }

  isActionsLoad(): void {
    this.isActions = true;
  }

  loadFieldValues(actions: string): void {
    this.isActions = true;
    if (!this.eventAutomationConfigurationVO.some(event => event.parentId === this.selectedScript.id)) {
      this.isSecondaryAction = true;
      this.actionsList = [];
    }
    if (this.automationFrom === 'category') {
      this.actionsList = [];
    }
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.value);
    this.selectedScript.words[index] = actions;
    this.selectedScript.keyValuePair.value = actions;
    this.selectedScript.keyValuePair.color = this.action.getColor(this.selectedScript.keyValuePair.automationType, actions, this.data);
  }

  getKeywords(scripts: AutomationScripts, word: string, i: number): string {
    if (scripts.keyValuePair.color === '' && scripts.keyValuePair.automationType !== 'task field'
      && (scripts.keyValuePair.value === word || scripts.keyValuePair.message === word || scripts.keyValuePair.selectedField === word
        || scripts.keyValuePair.fieldValue === word || scripts.keyValuePair.status === word
        || scripts.keyValuePair.columnName === word || scripts.keyValuePair.subject === word
        || scripts.keyValuePair.toMail === word || scripts.keyValuePair.header === word
        || scripts.keyValuePair.startTime === word || scripts.keyValuePair.endTime === word || scripts.keyValuePair.location === word)) {
      return 'actions-class';
    } else if (scripts.keyValuePair.value === word && scripts.keyValuePair.color !== '') {
      return 'statusList-style';
    } else {
      if (scripts.keyValuePair.automationType === 'task field' && (scripts.keyValuePair.value === word ||
        scripts.keyValuePair.fieldValue === word || scripts.keyValuePair.selectedField === word)) {
        return 'actions-class';
      } else {
        return '';
      }
    }
  }

  getKeywordsForCategoryAutomation(words: string): string {
    if (this.action.keyWords.some(keyword => keyword === words)) {
      return 'actions-class';
    } else {
      return;
    }
  }

  mouseenter(i: any): void {
    this.mouseOverScriptIndex = i;
  }

  scriptMouseEnter(scripts: AutomationScripts, i: number, length: number): void {
    if (scripts.type !== 'connector' && scripts.type !== 'event') {
      this.mouseOverScriptIndex = i;
    } else if (length - 1 === i) {
      this.mouseOverScriptIndex = i;
    }
  }

  onMouseEnter(i: number): void {
    this.removeIconMouseOver = true;
  }

  onMouseLeave(i: number): void {
    this.removeIconMouseOver = false;
  }

  removeTimePeriodAutomation(scripts: AutomationScripts, i: number): void {
    if (this.timePeriodScript[i + 1] && this.timePeriodScript[i + 1].type === 'connector') {
      this.timePeriodScript.splice(i + 1, 1);
    }
    this.timePeriodScript.splice(i, 1);
    if (this.timePeriodScript[i - 1].type === 'connector') {
      this.timePeriodScript.splice(i - 1, 1);
    } else if (scripts.type === 'connector' || scripts.type === 'event') {
      this.timePeriodScript.splice(i, 1);
    }
  }

  loadScripts(): void {
    this.isSecondaryAction = false;
    if (this.automationSciptsVO.length === 0) {
      this.isActions = true;
      this.actionsList = [];
      this.eventAutomationConfigurationVO.forEach(element => {
        if (element.parentId === null) {
          this.actionsList.push(element);
        }
      });
    } else if (this.automationSciptsVO[this.automationSciptsVO.length - 1].type === 'action') {
      this.isSecondaryAction = true;
      this.isActions = true;
      this.actionsList = [];
    } else if (this.automationSciptsVO[this.automationSciptsVO.length - 1].type === 'condition') {
      this.isActions = true;
      this.actionsList = [];
      this.eventAutomationConfigurationVO.forEach(element => {
        if (element.parentId === this.automationSciptsVO[this.automationSciptsVO.length - 1].id) {
          this.actionsList.push(element);
        }
      });
    } else if (this.automationSciptsVO[this.automationSciptsVO.length - 1].type === 'event') {
      this.actionsList = [];
      this.isActions = true;
      this.eventAutomationConfigurationVO.forEach(element => {
        if (element.parentId === null) {
          this.actionsList.push(element);
        }
      });
    }
  }

  removeAutomation(scripts: AutomationScripts, i: number): void {
    if (scripts.type === 'action') {
      if (this.automationSciptsVO[i + 1] && this.automationSciptsVO[i + 1].type === 'connector') {
        this.automationSciptsVO.splice(i + 1, 1);
      }
      this.automationSciptsVO.splice(i, 1);
      if (this.automationSciptsVO[i - 1].type === 'connector') {
        this.automationSciptsVO.splice(i - 1, 1);
      }
    } else if (scripts.type === 'condition') {
      const length = this.automationSciptsVO.length;
      for (let j = 0; j < length; j++) {
        if (j >= i && this.automationSciptsVO[i].type !== 'parentAutomation') {
          this.automationSciptsVO.splice(i, 1);
        }
      }
      if (this.automationSciptsVO[i - 1].type === 'parentAutomation') {
        this.automationSciptsVO.splice(i - 1, 1);
      }
    } else if (scripts.type === 'parentAutomation') {
      const length = this.automationSciptsVO.length;
      for (let j = 0; j < length; j++) {
        if (i === j || (j >= i && this.automationSciptsVO[i].type !== 'parentAutomation')) {
          this.automationSciptsVO.splice(i, 1);
        }
      }
    } else if (scripts.type === 'connector' || scripts.type === 'event') {
      this.automationSciptsVO.splice(i, 1);
    }
    this.removeIconMouseOver = false;
    this.loadScripts();
  }

  /**** set field automation type and values ****/
  loadFields(automation: AutomationScripts, word: string): void {
    if (automation.keyValuePair.value === word || automation.keyValuePair.fieldValue === word
      || automation.keyValuePair.message === word || automation.keyValuePair.columnName === word
      || automation.keyValuePair.subject === word || automation.keyValuePair.header === word
      || automation.keyValuePair.toMail === word || automation.keyValuePair.startTime === word
      || automation.keyValuePair.endTime === word || automation.keyValuePair.location === word
      || automation.keyValuePair.status === word || automation.keyValuePair.selectedField === word) {
      if ((automation.keyValuePair.automationType === 'notify'
        || automation.keyValuePair.automationType === 'email_campaign')
        && automation.keyValuePair.message === word) {
        this.automationType = 'message';
      } else if (automation.keyValuePair.automationType === 'email_campaign'
        && automation.keyValuePair.columnName === word) {
        this.automationType = 'columnName';
      } else if (automation.keyValuePair.automationType === 'email_campaign'
        && automation.keyValuePair.subject === word) {
        this.automationType = 'subject';
      } else if (automation.keyValuePair.fieldValue === word) {
        this.automationType = 'field_value';
      } else if (automation.keyValuePair.status === word) {
        this.automationType = 'status';
      } else if (automation.keyValuePair.selectedField === word) {
        this.automationType = 'task field';
      } else {
        this.automationType = automation.keyValuePair.automationType;
      }
      if (automation.keyValuePair.automationType === 'app_notification' && !automation.automation.includes('linkedin') && !automation.automation.includes('twitter') && !automation.automation.includes('outlook')) {
        if (automation.keyValuePair.message === word) {
          this.automationType = 'message';
        } else if (automation.keyValuePair.header === word) {
          this.automationType = 'subject';
        } else if (automation.keyValuePair.keyword !== 'choose') {
          this.automationType = 'notify';
        }
      }
      if (automation.automation.includes('outlook')) {
        if (automation.keyValuePair.value === word) {
          this.automationType = 'outlook-integration';
        } else if (automation.keyValuePair.startTime === word) {
          this.automationType = 'startTime';
        } else if (automation.keyValuePair.endTime === word) {
          this.automationType = 'endTime';
        } else if (automation.keyValuePair.location === word) {
          this.automationType = 'location';
        } else if (automation.keyValuePair.header === word) {
          this.automationType = 'subject';
        } else if (automation.keyValuePair.message === word) {
          this.automationType = 'message';
        }
      }
      this.isActions = true;
      this.isActions = false;
      this.selectedScript = automation;
      if (automation.keyValuePair.assignee && automation.keyValuePair.assignee.user) {
        this.users = automation.keyValuePair.assignee.user;
      } else {
        this.users = [];
      }
      if (automation.keyValuePair.assignee && automation.keyValuePair.assignee.group) {
        this.groups = automation.keyValuePair.assignee.group;
      } else {
        this.groups = [];
      }
      if (automation.keyValuePair.assignee && automation.keyValuePair.assignee.customUsers) {
        this.customUsers = automation.keyValuePair.assignee.customUsers;
      } else {
        this.customUsers = [];
      }
      if (this.automationType === 'message') {
        if (automation.keyValuePair.message === 'something') {
          this.message = '';
        } else {
          this.message = automation.keyValuePair.message;
        }
      }
      if (this.automationType === 'columnName' && (automation.keyValuePair.tableId === undefined
        || automation.keyValuePair.tableId === null || automation.keyValuePair.tableId === '')) {
        this.customMail = automation.keyValuePair.customMails;
      } else {
        this.customMail = [];
      }
      if (this.automationType === 'subject') {
        this.subject = automation.keyValuePair.subject;
      }
      if (this.automationType === 'due_date_count') {
        this.form.get('numberOfDays').setValue(automation.keyValuePair.value);
      } else {
        this.menu.closeMenu();
      }
      if (this.automationType === 'Date') {
        this.openDateDialog();
      } else if (this.automationType === 'time period') {
        this.openTimePeriodDialog();
      }
    } else {
      this.menu.closeMenu();
    }
  }

  addAction(): void {
    this.isActions = true;
    this.isSecondaryAction = false;
    const scriptsVO = {
      words: [','],
      automation: ',',
      keyValuePair: {
        keyword: '',
        automationType: '',
        color: '',
        value: '',
        automationSubType: ''
      },
      id: 'connector',
      type: 'connector',
    }
    this.automationSciptsVO.push(scriptsVO);
    if (this.updateAutomation === true) {
      this.actionsList = [];
      this.loadAction();
    } else if (this.automationFrom === 'category') {
      let conditionId = this.automationSciptsVO[1].id;
      this.eventAutomationConfigurationVO.forEach(element => {
        if (element.parentId === conditionId) {
          if (this.actions === undefined || this.actions === null) {
            this.actions = [];
          }
          this.actions.push(element);
        }
      });
    }
    this.actionsList = this.actions;
  }

  loadAction(): void {
    let eventAutomationVO = this.eventAutomationVO.find(event => event.id === this.eventAutomationId);
    let automationVO: AutomationVO[] = [];
    automationVO = eventAutomationVO.automation;
    let conditionKey: any = null;
    for (let i = 0; i < automationVO.length; i++) {
      if (i === automationVO.length - 1) {
        for (let j = 0; j < automationVO[i].conditions.length; j++) {
          if (j === automationVO[i].conditions.length - 1) {
            conditionKey = automationVO[i].conditions[j].automationKey;
          }
        }
      }
    }
    if (conditionKey !== undefined && conditionKey !== null) {
      let condition = this.eventAutomationConfigurationVO.find(event => event.automation === conditionKey);
      this.eventAutomationConfigurationVO.forEach(element => {
        if (element.parentId === condition.id) {
          if (this.actions === undefined || this.actions === null) {
            this.actions = [];
          }
          this.actions.push(element);
        }
      });
    }
  }

  addEvent(): void {
    this.isActions = true;
    this.isSecondaryAction = false;
    const scriptsVO = {
      words: ['and'],
      automation: 'and',
      keyValuePair: {
        keyword: '',
        automationType: '',
        color: '',
        value: '',
        automationSubType: ''
      },
      id: 'event',
      type: 'event',
    }
    this.automationSciptsVO.push(scriptsVO);
    this.actionsList = [];
    this.eventAutomationConfigurationVO.forEach(element => {
      if (element.parentId === null) {
        this.actionsList.push(element);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  loadAutomation(automationConfiguration: EventAutomationConfigurationVO): void {
    let newArray: any = null;
    let array: any;
    let type: string;
    if (automationConfiguration.parentId === null) {
      type = 'parentAutomation';
      if (automationConfiguration.automation === 'Starting from') {
        newArray = automationConfiguration.automation.concat(' date');
      }
    } else if (!this.eventAutomationConfigurationVO.some(event => event.parentId === automationConfiguration.id)
      || automationConfiguration.automationType === 'notify') {
      type = 'action';
      if (automationConfiguration.automationType === 'item create') {
        this.isSecondaryAction = true;
      }
    } else {
      type = 'condition';
    }
    if (automationConfiguration.automationType === 'label') {
      var re = /label/gi;
      newArray = automationConfiguration.automation.replace(re, "label ( choose )");
    }
    if (automationConfiguration.automationType === 'task field') {
      var re = /field/gi;
      newArray = automationConfiguration.automation.replace(re, "field ( choose )");
    }
    if (newArray !== null) {
      array = newArray.split(' ');
    } else {
      if (automationConfiguration.automation === 'every time period') {
        array = ['every', 'time period'];
      } else if (automationConfiguration.automationType === 'due date') {
        array = ['a', 'due date', 'arrives'];
      } else {
        array = automationConfiguration.automation.split(' ');
      }
    }
    if (automationConfiguration.automation.includes('subtask status') || automationConfiguration.automation.includes('subtasks')) {
      array.push('choose subtask status');
    } else if (automationConfiguration.automationType === 'task field') {
      const index = array.findIndex(element => element === 'choose');
      array[index] = 'choose status';
    } else if (automationConfiguration.automation.includes('status')) {
      array.push('choose status');
    } else if (automationConfiguration.automation === 'assigned to') {
      array.push('someone');
    } else if (automationConfiguration.automationType === 'new task') {
      array.push('choose taskboard');
    } else if (automationConfiguration.automationType === 'create task') {
      array.push(this.data.boardName);
    } else if (automationConfiguration.automationType === 'email_campaign') {
      const index = array.findIndex(element => element === 'column');
      array[index] = 'column/custom email';
    }
    let keyword: string = null;
    var keyword2: string = null;
    var keyword3: string = null;
    var keyword4: string = null;
    let keyword5: string = null;
    var setKeyword: boolean = false;
    array.forEach(element => {
      if (automationConfiguration.automationType !== 'due_date_count') {
        if (keyword === undefined || keyword === null || keyword === '') {
          keyword = this.action.keyWords.find(word => word === element);
        }
        if (keyword !== element && (keyword2 === undefined || keyword2 === null || keyword2 === '')) {
          keyword2 = this.action.keyWords.find(word => word === element);
        }
        if (keyword !== element && keyword2 !== element && (keyword3 === undefined || keyword3 === null || keyword3 === '')) {
          keyword3 = this.action.keyWords.find(word => word === element);
        }
        if (keyword !== element && keyword2 !== element && keyword3 !== element
          && (keyword4 === undefined || keyword4 === null || keyword4 === '')) {
          keyword4 = this.action.keyWords.find(word => word === element);
        }
        if (keyword !== element && keyword2 !== element && keyword3 !== element && keyword4 !== element
          && (keyword5 === undefined || keyword5 === null || keyword5 === '')) {
          keyword5 = this.action.keyWords.find(word => word === element);
        }
      } else {
        keyword = 'enter';
      }
    });
    let automation = {
      words: array,
      automation: automationConfiguration.automation,
      keyValuePair: {
        keyword: keyword,
        keyword2: keyword2,
        keyword3: keyword3,
        keyword4: keyword4,
        keyword5: keyword5,
        automationType: automationConfiguration.automationType,
        color: '',
        value: keyword,
        message: keyword2,
        columnName: '',
        subject: '',
        header: '',
        startTime: '',
        endTime: '',
        location: '',
        fieldValue: '',
        status: '',
        selectedField: '',
        automationSubType: automationConfiguration.automationSubType
      },
      id: automationConfiguration.id,
      type: type,
    }

    if (automationConfiguration.automationType === 'task field') {
      automation.keyValuePair.selectedField = keyword2;
      automation.keyValuePair.fieldValue = keyword3;
      automation.keyValuePair.message = '';
      automation.keyValuePair.status = keyword;
    }
    if (automationConfiguration.automationType === 'app_notification') {
      var applicationName: string;
      this.action.appNameList.forEach(app => {
        if (automation.automation.includes(app.value)) {
          applicationName = app.name;
        }
      });
      this.applicationName = applicationName;
      if (applicationName !== 'Slack' && applicationName !== 'Microsoft Teams') {
        if (!automation.keyValuePair.keyword2) {
          automation.keyValuePair.keyword2 = keyword;
          automation.keyValuePair.message = keyword;
        }
      }
      if (applicationName === 'Outlook') {
        if (automation.keyValuePair.keyword5 && automationConfiguration.automationSubType) {
          automation.keyValuePair.header = keyword5;
          automation.keyValuePair.startTime = keyword2;
          automation.keyValuePair.endTime = keyword3;
          automation.keyValuePair.location = keyword4;
        } else if (automation.keyValuePair.keyword3 && !automationConfiguration.automationSubType) {
          automation.keyValuePair.header = keyword3;
        }
      }
    }
    if (automationConfiguration.automationType === 'email_campaign') {
      automation.keyValuePair.columnName = keyword3;
      automation.keyValuePair.subject = keyword4;
    }
    this.automationSciptsVO.push(automation);
    if (keyword !== undefined && keyword !== null && keyword !== '') {
      this.users = [];
      this.groups = [];
      this.customUsers = [];
      this.automationType = automation.keyValuePair.automationType === 'task field' ? 'status' : automation.keyValuePair.automationType;
      this.isActions = false;
      this.selectedScript = automation;
      if (this.automationType === 'Date') {
        this.openDateDialog();
      } else if (this.automationType === 'time period') {
        this.openTimePeriodDialog();
      }
    }
    this.actions = this.actionsList;
    this.actionsList = [];
    this.eventAutomationConfigurationVO.forEach(element => {
      if (element.parentId === automationConfiguration.id) {
        this.actionsList.push(element);
      }
    });
  }

  saveAutomation(): void {
    this.automationVO = [];
    let newCondition = new ConditionsVO();
    if (this.automationSciptsVO.length > 0) {
      for (let i = 0; i < this.automationSciptsVO.length; i++) {
        let parentAutomation = this.eventAutomationConfigurationVO.find(event => event.id === this.automationSciptsVO[i].id);
        if (parentAutomation && parentAutomation.parentId === null) {
          let automation = new AutomationVO();
          automation.root.automationKey = this.automationSciptsVO[i].automation;
          if (this.automationSciptsVO[i].automation.startsWith('Starting from')) {
            automation.root.automationType = this.automationSciptsVO[i].keyValuePair.automationType;
          } else {
            automation.root.automationType = this.automationSciptsVO[i].automation;
          }
          automation.root.id = this.automationSciptsVO[i].id;
          if (this.automationSciptsVO[i].keyValuePair && this.automationSciptsVO[i].keyValuePair.value) {
            automation.root.values = this.automationSciptsVO[i].keyValuePair.value;
          }
          this.automationVO.push(automation);
        } else if (this.automationSciptsVO[i].type === 'condition') {
          let condition = new ConditionsVO();
          condition.automationKey = this.automationSciptsVO[i].automation;
          condition.automationType = this.automationSciptsVO[i].keyValuePair.automationType;
          condition.automationSubType = this.automationSciptsVO[i].keyValuePair.automationSubType;
          condition.id = this.automationSciptsVO[i].id;
          if (condition.automationType === 'time period') {
            condition.data = this.automationSciptsVO[i].keyValuePair.value;
          } else if (condition.automationType === 'task field') {
            const selectedField = new SelectedField();
            selectedField.fieldName = this.automationSciptsVO[i].keyValuePair.selectedField === this.automationSciptsVO[i].keyValuePair.keyword2 ? null : this.automationSciptsVO[i].keyValuePair.selectedField;
            selectedField.fieldValue = this.automationSciptsVO[i].keyValuePair.fieldValue === this.automationSciptsVO[i].keyValuePair.keyword3 ? null : this.automationSciptsVO[i].keyValuePair.fieldValue;
            selectedField.fieldType = this.automationSciptsVO[i].keyValuePair.fieldType;
            selectedField.status = this.automationSciptsVO[i].keyValuePair.value === this.automationSciptsVO[i].keyValuePair.keyword ? null : this.automationSciptsVO[i].keyValuePair.value;
            const eventSpecificMaps = new EventSpecificMap();
            eventSpecificMaps.selectedField = selectedField;
            condition.eventSpecificMaps = eventSpecificMaps;
          } else if (condition.values === undefined || condition.values === null) {
            let array: string[] = [this.automationSciptsVO[i].keyValuePair.value];
            condition.values = array;
          }
          newCondition = condition;
          this.automationVO[this.automationVO.length - 1].conditions.push(condition);
        } else if (this.automationSciptsVO[i].type === 'action'
          && this.automationSciptsVO[i].automation !== ','
          && this.automationSciptsVO[i].automation !== 'and') {
          let action = new ActionsVO();
          action.actionKey = this.automationSciptsVO[i].automation;
          action.actionType = this.automationSciptsVO[i].keyValuePair.automationType;
          action.subType = this.automationSciptsVO[i].keyValuePair.automationSubType;
          action.id = this.automationSciptsVO[i].id;
          if (action.values === undefined || action.values === null) {
            if (this.automationSciptsVO[i].keyValuePair.automationType === 'app_notification' || this.automationSciptsVO[i].keyValuePair.automationType === 'app_schedule') {
              var applicationName: string;
              this.action.appNameList.forEach(app => {
                if (this.automationSciptsVO[i].automation.includes(app.value)) {
                  applicationName = app.name;
                }
              });
              action.applicationName = applicationName;
              if (action.applicationName === 'Slack' || action.applicationName === 'Microsoft Teams') {
                action.values = [];
                if (this.automationSciptsVO[i].keyValuePair.channel !== undefined && this.automationSciptsVO[i].keyValuePair.channel !== null) {
                  action.values[0] = { channel: this.automationSciptsVO[i].keyValuePair.channel };
                }
              } else if (action.applicationName === 'Outlook') {
                if (this.automationSciptsVO[i].keyValuePair.automationSubType) {
                  action.actionType = this.automationSciptsVO[i].keyValuePair.automationSubType;
                }
                let array: any[] = [{ 'actionSpecificMaps': this.automationSciptsVO[i].keyValuePair.actionSpecificMaps }];
                action.values = array;
              }
              action.message = this.automationSciptsVO[i].keyValuePair.message;
              if (action.applicationName === 'Twitter' || action.applicationName === 'LinkedIn') {
                action.subject = this.automationSciptsVO[i].keyValuePair.subject;
              }
              // } else if (action.applicationName === 'Outlook' && action.actionType === 'app_schedule') {
              //   if (this.automationSciptsVO[i].keyValuePair.automationSubType) {
              //     action.actionType = this.automationSciptsVO[i].keyValuePair.automationSubType;
              //   }
              //   let array: any[] = [{ 'actionSpecificMaps': this.automationSciptsVO[i].keyValuePair.actionSpecificMaps }];
              //   action.values = array;
            } else if (this.automationSciptsVO[i].keyValuePair.automationType === 'new task'
              || this.automationSciptsVO[i].keyValuePair.automationType === 'create task') {
              action.values = [];
              var boardId: string;
              var startColumn: string;
              if (this.automationSciptsVO[i].keyValuePair.boardId) {
                boardId = this.automationSciptsVO[i].keyValuePair.boardId;
              } else {
                boardId = this.data.taskboardVO.id;
              }
              if (this.automationSciptsVO[i].keyValuePair.startColumn) {
                startColumn = this.automationSciptsVO[i].keyValuePair.startColumn;
              } else {
                const column = this.data.taskboardVO.taskboardColumns.find(column => column.columnOrder === 0);
                startColumn = column.columnName;
              }
              action.values[0] = {
                targetBoardName: this.automationSciptsVO[i].keyValuePair.value,
                targetBoardId: boardId,
                startColumn: startColumn
              };
              action.mappingValues = this.automationSciptsVO[i].keyValuePair.mappingValues;
              action.yorosisPageId = this.automationSciptsVO[i].keyValuePair.yorosisPageId;
            } else if (this.automationSciptsVO[i].keyValuePair.automationType === 'notify' || this.automationSciptsVO[i].keyValuePair.automationType === 'assigned') {
              let array: string[] = [this.automationSciptsVO[i].keyValuePair.assignee];
              action.values = array;
              if (this.automationSciptsVO[i].keyValuePair.automationType === 'notify') {
                action.message = this.automationSciptsVO[i].keyValuePair.message;
              }
            } else if (this.automationSciptsVO[i].keyValuePair.automationType === 'status') {
              action.values = [];
              action.values[0] = { status: this.automationSciptsVO[i].keyValuePair.value };
            } else if (this.automationSciptsVO[i].keyValuePair.automationType === 'email_campaign') {
              action.values = [];
              var emailServerName: string;
              var tableId: string;
              var columnName: string;
              if (this.automationSciptsVO[i].keyValuePair.value) {
                emailServerName = this.automationSciptsVO[i].keyValuePair.value;
              }
              if (this.automationSciptsVO[i].keyValuePair.tableId) {
                tableId = this.automationSciptsVO[i].keyValuePair.tableId;
                if (this.automationSciptsVO[i].keyValuePair.columnName) {
                  columnName = this.automationSciptsVO[i].keyValuePair.columnName;
                  action.values[0] = {
                    emailServerName: emailServerName,
                    tableId: tableId,
                    columnName: columnName
                  };
                }
              } else if (this.automationSciptsVO[i].keyValuePair.customMails) {
                action.values[0] = {
                  emailServerName: emailServerName,
                  customMails: this.automationSciptsVO[i].keyValuePair.customMails
                };
              }
              action.message = this.automationSciptsVO[i].keyValuePair.message;
              action.subject = this.automationSciptsVO[i].keyValuePair.subject;
            } else if (this.automationSciptsVO[i].keyValuePair.automationType === 'due_date_count') {
              let array: any[] = [{ numberOfDays: this.automationSciptsVO[i].keyValuePair.value }];
              action.values = array;
            } else if (this.automationSciptsVO[i].keyValuePair.automationType === 'data_table') {
              action.mappingValues = this.automationSciptsVO[i].keyValuePair.mappingValues;
              action.actionSpecificMaps.dataTableName = this.automationSciptsVO[i].keyValuePair.value;
              action.actionSpecificMaps.filterValues = this.automationSciptsVO[i].keyValuePair.filterValues;
              action.actionSpecificMaps.subType = this.automationSciptsVO[i].keyValuePair.automationSubType;
              action.actionSpecificMaps.tableIdentifier = this.automationSciptsVO[i].keyValuePair.tableIdentifier;
            } else {
              let array: string[] = [this.automationSciptsVO[i].keyValuePair.value];
              action.values = array;
            }
          }
          this.action.appNameList.forEach(appName => {
            if (this.automationSciptsVO[i].automation.includes(appName.value)) {
              this.automationVO[this.automationVO.length - 1].applications = appName.name;
            }
          });
          newCondition.actions.push(action);
        }
      }
    } else {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: 'Please choose a condition',
      });
    }
    if (this.automationVO.length > 0 && this.action.isAutomation(this.automationVO) === true) {
      if (this.action.checkValidation(this.automationVO, this.data.boardName) === true) {
        const eventAutomation = new EventAutomationVO();
        if (this.eventAutomationId === null) {
          eventAutomation.id = null;
        } else {
          eventAutomation.id = this.eventAutomationId;
        }
        eventAutomation.taskboardId = this.data.taskboardId;
        eventAutomation.automation = this.automationVO;
        eventAutomation.isRuleActive = 'Y';
        eventAutomation.automationType = this.automationVO[0].conditions[0].automationType;
        this.isDisabled = true;
        this.automationService.saveAutomation(eventAutomation).subscribe(data => {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.loadAutomationsList();
          this.tabType = 'customAutomation';
        },
          error => {
            this.isDisabled = false;
          });
      }
    }
  }

  loadTimePeriod(): void {
    this.type = 'timePeriod';
    this.show = true;
    this.automationType = 'schedule';
    this.automation = ['time', 'period'];
    this.date = 'choose date';
    this.timePeriodScript = [];
    this.actionsList = [];
  }

  openDateDialog(): void {
    const dialog = this.dialog.open(DateDialogComponent, {
      data: 'time period date'
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.date = data;
        this.loadFieldValues(data);
      }
    });
  }

  openTimePeriodDialog(): void {
    const dialog = this.dialog.open(CronComponent, {
      width: '460px',
      minHeight: '200px'
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.timePeriodAutomation = data;
        this.automation = data.split(' ');
        this.actionsList = [];
        this.actions = [];
        let conditionId: string;
        if (this.automationFrom === 'category' && this.isSecondaryAction === false) {
          conditionId = this.automationSciptsVO[1].id;
        } else if (this.isSecondaryAction === false) {
          conditionId = this.automationSciptsVO[this.automationSciptsVO.length - 1].id;
        }
        this.eventAutomationConfigurationVO.forEach(element => {
          if (element.parentId === conditionId) {
            if (this.actions === undefined || this.actions === null) {
              this.actions = [];
            }
            this.actions.push(element);
          }
        });
        this.actionsList = this.actions;
        this.loadFieldValues(data);
      }
    });
  }

  openAutomation(value: string): void {
    this.tabType = value;
    if (value === 'customAutomation') {
      this.updateAutomation = false;
    }
  }

  onCategorySelected(category: any): void {
    if (category === 'apps') {
      this.appSelected = true;
      for (let i = 0; i < this.categoriesArray.length; i++) {
        this.categoriesArray[i].isSelected = false;
      }
    } else {
      this.appSelected = false;
      for (let i = 0; i < this.categoriesArray.length; i++) {
        this.categoriesArray[i].isSelected = false;
      }
      category.isSelected = true;
      this.categoryAutomations = [];
      const automationCategory = new CategoryAutomations();
      if (category.name !== 'All') {
        automationCategory.categoryName = category.name;
        this.automationsByCategoryVO.forEach(element => {
          if (element.categoryName === category.name && (this.selectedApplications.length === 0 || this.selectedApplications.includes(element.applicationName))) {
            if (automationCategory.automation === undefined || automationCategory.automation === null) {
              automationCategory.automation = [];
            }
            automationCategory.automation.push(element.automation);
          }
        });
        this.categoryAutomations.push(automationCategory);
      } else {
        this.loadCategoryAutomation();
      }
    }
  }

  findAutomationId(automation: string): string {
    let automationConfiguration = this.eventAutomationConfigurationVO.find(automate => automate.automation === automation);
    return automationConfiguration.id;
  }

  openAutomationFromCetegory(automation: string, categoryName: string): void {
    this.isActions = true;
    this.isSecondaryAction = true;
    this.automationType = null;
    this.automationFrom = 'category';
    this.actionsList = [];
    this.type = 'automation';
    this.automationSciptsVO = [];
    let splitAutomation: string[];
    let keyword: string = '';
    if (categoryName === 'Recurring' || automation.startsWith('Starting from')) {
      splitAutomation = ['Starting from'];
    } else {
      splitAutomation = automation.split(' ', 2);
    }
    let condition = automation.split(splitAutomation[0] + ' ');
    let parentAutomation: string[] = [];
    let automationType: string = '';
    if (categoryName === 'Recurring' || automation.startsWith('Starting from')) {
      keyword = 'date';
      automationType = 'Date';
      parentAutomation = splitAutomation[0].split(' ');
      parentAutomation.push('date');
    } else {
      parentAutomation = [splitAutomation[0]];
    }
    let parentScript = {
      words: parentAutomation,
      automation: splitAutomation[0],
      keyValuePair: {
        keyword: keyword,
        automationType: automationType,
        color: '',
        value: keyword,
        automationSubType: ''
      },
      id: this.findAutomationId(splitAutomation[0]),
      type: 'parentAutomation',
    }
    this.automationSciptsVO.push(parentScript);
    let parentId: string = null;
    let actionParentId: string = null;
    this.eventAutomationConfigurationVO.forEach(element => {
      if (condition[1].includes('field value changes') && element.automation.includes('field value changes') && element.parentId === parentScript.id) {
        parentId = element.id;
        const condition = new ConditionsVO();
        condition.id = element.id;
        condition.automationKey = element.automation;
        condition.automationType = element.automationType;
        condition.automationSubType = element.automationSubType;
        condition.values = [];
        this.setAutomation(condition, 'condition', condition.automationType);
      } else if (!condition[1].includes('field value changes') && condition[1].includes(element.automation) && element.parentId === parentScript.id) {
        parentId = element.id;
        const condition = new ConditionsVO();
        condition.id = element.id;
        condition.automationKey = element.automation;
        condition.automationType = element.automationType;
        condition.automationSubType = element.automationSubType;
        condition.values = [];
        this.setAutomation(condition, 'condition', condition.automationType);
      }
    });
    this.eventAutomationConfigurationVO.forEach(element => {
      if (condition[1].includes('microsoft outlook') && element.automation.includes('microsoft outlook') && element.parentId === parentId
        && this.automationSciptsVO[this.automationSciptsVO.length - 1].type === 'condition' && condition[1].includes(element.automation)) {
        const actions = new ActionsVO();
        actions.id = element.id;
        actions.actionKey = element.automation;
        actions.actionType = element.automationType;
        actions.values = [];
        actions.subType = element.automationSubType;
        this.setActionsAutomation(actions, 'action', actions.actionKey);
      } else if (!condition[1].includes('microsoft outlook') && condition[1].includes(element.automation) && element.parentId === parentId
        && this.automationSciptsVO[this.automationSciptsVO.length - 1].type === 'condition') {
        const actions = new ActionsVO();
        actions.id = element.id;
        actions.actionKey = element.automation;
        actions.actionType = element.automationType;
        actions.values = [];
        actions.subType = element.automationSubType;
        this.setActionsAutomation(actions, 'action', actions.actionKey);
      }
    });
    this.show = true;
  }

  getLabels(event): void {
    let labels: any[] = [];
    event.forEach(element => {

      labels.push(element);
    });
    let taskboardLabels = {
      id: '',
      labels: labels
    }
    this.data.taskboardVO.taskboardLabels = taskboardLabels;
    this.data.labelsList = labels;
  }

  getBackgroundImage(categoryName: string): string {
    var image: string = ''
    this.categoriesArray.forEach(category => {
      if (category.name === categoryName) {
        image = category.backgroundImage;
      }
    });
    return image;
  }

  setAutomationType(type: string): void {
    this.automationType = type;
  }
}
