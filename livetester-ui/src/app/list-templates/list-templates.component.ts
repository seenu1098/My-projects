import { Component, OnInit, ViewChild } from '@angular/core';
import { CreateTemplateComponent } from '../create-template/create-template.component';
import { TemplateVO } from '../../shared/vo/claim-vo';
import { LivetestService } from '../../shared/service/livetest.service';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';
import { Router } from '@angular/router';



@Component({
  selector: 'app-list-templates',
  templateUrl: './list-templates.component.html',
  styleUrls: ['./list-templates.component.css']
})
export class ListTemplatesComponent implements OnInit {
  response: TemplateVO[];
  selected = '';

  @ViewChild('templateInput', { static: false })
  templateInput: CreateTemplateComponent;
  templateId: any;
  isDuplicateTemplate = false;
  deleteButtonVisible = false;
  constructor(private service: LivetestService, private dialog: MatDialog, private router: Router) {

  }

  ngOnInit(): void {
    this.getTemplateNames();
  }

  getTemplateNames() {
    this.service.getTemplateNames().subscribe(data => {
      this.response = data;
    });
  }

  loadTemplateInfo(event) {
    if (event.isUserInput) {
      this.templateId = event.source.value;
      this.deleteButtonVisible = true;
      this.isDuplicateTemplate = false;
      this.templateInput.resetForm();
      this.templateInput.userAccess = true;
    }
  }
  editTemplate(event) {
    this.templateInput.loadUsingTemplateId(this.templateId, null, 0);
    this.service.getAccessForTemplateInfo(this.templateId).subscribe(data => {
      this.deleteButtonVisible = data;
      if (this.deleteButtonVisible === false) {
        this.templateInput.userAccess = false;
      }
    });
    this.ngOnInit();
  }

  duplicateTemplate() {
    this.isDuplicateTemplate = true;
    this.deleteButtonVisible = false;
    this.templateInput.duplicateTemplate(this.templateId);
  }
  deleteTemplate(value) {
    this.dialog.open(ConfirmationDialogBoxComponent, {
      width: '250px',
      data: {
        id: value,
        serviceName: 'templateName',
        displayText: 'Template'
      }
    });
    this.router.navigate(['/list-template']);
  }

}
