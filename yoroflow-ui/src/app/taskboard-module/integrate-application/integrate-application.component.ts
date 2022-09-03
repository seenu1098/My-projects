import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { ApplicationConfigurationComponent } from '../application-configuration/application-configuration.component';
import { ConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { IntegrateApplicationService } from './integrate-application.service';
import { AppIntegrationVO, OrganizationIntegratedAppsVO } from './integrate-application.vo';

@Component({
  selector: 'app-integrate-application',
  templateUrl: './integrate-application.component.html',
  styleUrls: ['./integrate-application.component.scss'],
})
export class IntegrateApplicationComponent implements OnInit {
  constructor(
    public integrateService: IntegrateApplicationService,
    private dialog: MatDialog,
  ) { }

  integrateApplications: AppIntegrationVO[] = [];
  integratedApps$: Observable<OrganizationIntegratedAppsVO[]>;
  organizationApps: OrganizationIntegratedAppsVO[] = [];
  hoverCard: any;
  selectedCategory = 'Explore By App';
  spinner: any;
  categoriesArray: any[] = [
    {
      name: 'Explore By App',
      icon: 'explore',
      isSelected: true,
      color: 'blue',
    },
    { name: 'My Apps', icon: 'apps', isSelected: false, color: 'green' },
  ];
  appsArray: any[] = [
    { name: 'gmail', img: '../assets/integration_app_images/gmail.png' },
    {
      name: 'Slack',
      img: '../assets/integration_app_images/slack-new-logo.svg',
    },
    {
      name: 'Microsoft Teams',
      img: '../assets/integration_app_images/microsoft-teams-1.svg',
    },
    {
      name: 'Twitter',
      img: '../assets/integration_app_images/twitter-logo.svg',
    },
    {
      name: 'LinkedIn',
      img: '../assets/integration_app_images/linkedIn-logo.svg',
    },
    {
      name: 'Outlook',
      img: '../assets/integration_app_images/outlook-logo.svg',
    },
  ];

  ngOnInit(): void {
    this.integrateService.getOrganizationApplicationsAsync();
    this.integratedApps$ = this.integrateService.orgIntegratedApps$;
  }

  getImage(appName: string): string {
    let image: '';
    this.appsArray.forEach((app) => {
      if (app.name === appName) {
        image = app.img;
      }
    });
    return image;
  }

  removeApplication(app: AppIntegrationVO): void {
    this.spinnerDialog();
    this.integrateService
      .getTaskboardApps(app.applicationName)
      .subscribe((res) => {
        this.spinner.close();
        if (res.response === 'application already used') {
          const confirmationDialog = this.dialog.open(
            ConfirmationDialogComponent,
            {
              width: '450px',
              data: {
                type: 'taskboardApp',
                applicationName: app.applicationName,
                taskboardNames: res.responseId,
              },
            }
          );
        } else {
          const dialog = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: { type: 'appRemove', applicationName: app.applicationName },
          });
          dialog.afterClosed().subscribe((data) => {
            if (data && data === true) {
              let selectedApp: any;
              let orgApps: any;
              this.integratedApps$.subscribe(data => {
                orgApps = data;
              });
              if (orgApps.length > 0) {
                selectedApp = orgApps.find(
                  (orgApp) => orgApp.applicationName === app.applicationName
                );
              }
              this.spinnerDialog();
              selectedApp.isRemoved = 'N';
              // this.integrateService
              //   .saveOrganizationApplications(selectedApp)
              //   .subscribe((saveData) => {
              //     if (saveData) {
              //       this.organizationApps = saveData;
              //       this.spinner.close();
              //     }
              //   });
              this.integrateService.removeApplication(selectedApp.id).subscribe(data => {
                if (data.response === 'Application removed successfully') {
                  selectedApp.isRemoved = 'Y';
                } else {
                  selectedApp.isRemoved = 'N';
                }
                this.spinner.close();
              });
            }
          });
        }
      });
  }

  addApplication(app: OrganizationIntegratedAppsVO): void {
    this.startIntegration(app.id);
  }

  private startIntegration(appId: string): void {
    this.integrateService.integrateWithApp(appId, null);
  }

  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }

  mouseEnter(index: number): void {
    this.hoverCard = index;
  }

  onCategorySelected(category: any): void {
    this.selectedCategory = category.name;
    this.categoriesArray.forEach((categoryItem) => (categoryItem.isSelected = false));
    category.isSelected = true;
  }
}
