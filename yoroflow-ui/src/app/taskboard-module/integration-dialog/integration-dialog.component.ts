import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { OrganizationIntegratedAppsVO } from 'src/app/taskboard-module/integrate-application/integrate-application.vo';
import { ApplicationConfigurationComponent } from '../application-configuration/application-configuration.component';
import { ApplicationConfigurationService } from '../application-configuration/application-configuration.service';
import { AppConfigurationVO } from '../application-configuration/application-configuration.vo';
import { ConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { IntegrationService } from './integration.service';

@Component({
  selector: 'app-integration-dialog',
  templateUrl: './integration-dialog.component.html',
  styleUrls: ['./integration-dialog.component.scss']
})
export class IntegrationDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<IntegrationDialogComponent>, private dialog: MatDialog,
    private integrationService: IntegrationService,
    private appConfigService: ApplicationConfigurationService) { }

  show: boolean = false;
  tabType: string = 'customAutomation';
  organizationApps: OrganizationIntegratedAppsVO[] = [];
  appConfigVOList: AppConfigurationVO[] = [];
  showIntegrations: boolean = false;

  appsArray: any[] = [
    { name: 'gmail', img: '../assets/integration_app_images/gmail.png' },
    { name: 'Slack', img: '../assets/integration_app_images/slack_logo.png' },
    { name: 'Microsoft Teams', img: '../assets/integration_app_images/Microsoft-Teams-Didattica-a-distanza-1.png' }
  ];
  disabled: boolean = false;

  ngOnInit(): void {
    this.integrationService.getOrganizationApplications().subscribe(data => {
      this.organizationApps = data;
      this.appConfigService.getConfiguredAppsByTaskboardId(this.data.taskboardId).subscribe(data => {
        this.appConfigVOList = data;
        if (this.appConfigVOList.length == 0) {
          this.organizationApps.forEach(orgApps => orgApps.remove = false);
        } else {
          this.organizationApps.forEach(orgApps => orgApps.remove = false);
          this.appConfigVOList.forEach(appConfig => {
            this.organizationApps.forEach(orgApps => {
              if (appConfig.applicationName === orgApps.applicationName) {
                orgApps.remove = true;
              } 
            });
          });
        }
        this.showIntegrations = true;
      });
    });
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

  close(): void {
    this.dialogRef.close();
  }

  removeApplication(orgApp: OrganizationIntegratedAppsVO): void {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: 'removeApp'
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === true) {
        const appConfigVO = this.appConfigVOList.find(appConfig => appConfig.applicationName === orgApp.applicationName);
        this.disabled = true;
        orgApp.remove = false;
        this.appConfigService.saveAppConfig(appConfigVO).subscribe(data => {
          if (data) {
            this.disabled = false;
          }
        });
      }
    });
  }

  addApplication(orgApp: OrganizationIntegratedAppsVO): void {
    if (orgApp.authType !== undefined && orgApp.authType !== null && orgApp.authType !== '') {
      const dialog = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: 'addApp'
      });
      dialog.afterClosed().subscribe(data => {
        if (data && data === true) {
          const appConfigVO = new AppConfigurationVO();
          appConfigVO.id = null;
          appConfigVO.taskboardId = this.data.taskboardId;
          appConfigVO.applicationName = orgApp.applicationName;
          this.disabled = true;
          orgApp.remove = true;
          this.appConfigService.saveAppConfig(appConfigVO).subscribe(data => {
            if (data) {
              this.disabled = false;
            }
          });
        }
      });
    } else {
      const dialog = this.dialog.open(ApplicationConfigurationComponent, {
        width: '600px',
        data: {
          appName: orgApp.applicationName, orgApp: orgApp, edit: true,
          type: 'taskboard', taskboardId: this.data.taskboardId
        },
      });
      // dialog.afterClosed().subscribe(data => {
      //   if (data) {
      //     this.organizationApps = data;
      //   }
      // });
    }
  }

}
