import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuillEditorComponent } from 'ngx-quill';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { EmailTemplateVO } from './email-template-vo';
import { EmailTemplateService } from './email-template.service';
import { MatChipInputEvent } from '@angular/material/chips';
import * as Quill from 'quill';
import { CreateOrganizationService } from '../create-organization/create-organization.service';

@Component({
  selector: 'lib-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.css']
})
export class EmailTemplateComponent implements OnInit {
  editorElementRef: ElementRef;
  @ViewChild('emailTemplateGrid', { static: false }) emailTemplateGrid: YorogridComponent;

  @Output() gridData: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeData: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private templateService: EmailTemplateService,
    private createOrganizationService: CreateOrganizationService) { }
  emailTemplate: FormGroup;
  emailTemplateVo = new EmailTemplateVO();
  duplicateId = false;
  emailTemplateId: any;
  templateData: any;
  isFreePlan: boolean;
  ngOnInit(): void {
    this.initializeEmailTemplateForm();
    this.isFreePlan = JSON.parse(localStorage.getItem('isFreePlan'));
  }

  initializeEmailTemplateForm() {
    this.emailTemplate = this.formBuilder.group({
      id: [this.emailTemplateVo.id],
      emailTemplateId: [this.emailTemplateVo.emailTemplateId, [Validators.required]],
      emailTemplateName: [this.emailTemplateVo.emailTemplateName, [Validators.required]],
      emailTemplateData: [this.emailTemplateVo.emailTemplateData, [Validators.required]],
      emailTemplateSubject: [this.emailTemplateVo.emailTemplateSubject]
    });
  }

  submit(userForm) {
    if (userForm.valid && !this.duplicateId) {
      this.emailTemplateVo = this.emailTemplate.getRawValue();
      this.templateService.save(this.emailTemplateVo).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response
        });
        this.emailTemplateGrid.refreshGrid();
        userForm.resetForm();
      });
    } else if (this.duplicateId) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Duplicate Template Name',
      });
    }
  }

  omit_number(event) {
    let k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k === 32 || (k >= 48 && k <= 57));
  }
  inputChange() {
    this.changeData.emit(true);
  }
  textChange() {
    this.changeData.emit(true);
  }

  generateId() {

    this.emailTemplate.get('emailTemplateId').setValue(this.camelize(this.emailTemplate.get('emailTemplateName').value));
    const templateId = this.emailTemplate.get('emailTemplateId').value;
    if (templateId !== null && templateId !== this.emailTemplateId) {
      this.templateService.checkTempalteId(templateId).subscribe(data => {
        if (data.response.includes('already exist')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.duplicateId = true;
        } else {
          this.duplicateId = false;
        }
      });
    }
  }

  camelize(str) {
    if (str) {
      // tslint:disable-next-line: only-arrow-functions
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '').replace(/[^\w]/g, '');
    }
  }

  reset(userForm) {
    userForm.resetForm();
  }

  receiveMessage($event): void {
    this.templateService.getEmailTemplate($event.col1).subscribe(data => {
      this.emailTemplateVo = data;
      this.emailTemplateId = data.emailTemplateId;
      this.templateData = data.emailTemplateData;
      this.gridData.emit(data.emailTemplateData);
      this.ngOnInit();
    });
  }

  getData(event: any, userForm): void {
    this.emailTemplate.get('emailTemplateData').setValue(event);
    if (userForm.valid && !this.duplicateId) {
      this.emailTemplateVo = this.emailTemplate.getRawValue();
      this.templateService.save(this.emailTemplateVo).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response
        });
        this.emailTemplateGrid.refreshGrid();
        userForm.resetForm();
      });
    } else if (this.duplicateId) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Duplicate Template Name',
      });
    }
  }
}

