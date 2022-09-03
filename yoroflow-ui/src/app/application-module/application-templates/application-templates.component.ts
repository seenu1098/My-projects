import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateOrganizationService } from 'src/app/creation-module/create-organization/create-organization.service';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { CreateApplicationComponent } from '../create-application/create-application.component';
import { ApplicationTemplateVO } from './application-template-model';
import { ApplicationTemplateService } from './application-template.service';

@Component({
  selector: 'app-application-templates',
  templateUrl: './application-templates.component.html',
  styleUrls: ['./application-templates.component.scss']
})
export class ApplicationTemplatesComponent implements OnInit {

  constructor(
    private appTemplateService: ApplicationTemplateService,
    private dialog: MatDialog,
    private createOrganizationService: CreateOrganizationService
  ) { }
  isFreePlan: boolean;
  applicationTemplatesVO: ApplicationTemplateVO[] = [];

  ngOnInit(): void {
    this.getApplicationTemplates();
    this.isFreePlan = JSON.parse(localStorage.getItem('isFreePlan'));
  }

  getApplicationTemplates(): void {
    this.appTemplateService.getApplicationTemplates().subscribe(templates => {
      this.applicationTemplatesVO = templates;
    });
  }

  installApplication(template: ApplicationTemplateVO): void {
    if (this.isFreePlan) {
      const dialog = this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
      });
    } else {
      const dialog = this.dialog.open(CreateApplicationComponent, {
        disableClose: true,
        width: '650px',
        data: { template: template }
      });
    }

  }

}
