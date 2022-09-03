import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { CreateOrganizationService } from '../create-organization/create-organization.service';
import { EmailSettingsVO, EmailSettingsVOList } from '../create-organization/customer-vo';
import { FieldName } from '../org-custom-attributes/org-custom-attribute-vo';

@Component({
  selector: 'app-email-setting-dialog',
  templateUrl: './email-setting-dialog.component.html',
  styleUrls: ['./email-setting-dialog.component.scss']
})
export class EmailSettingDialogComponent implements OnInit {

  constructor(private fb: FormBuilder, private service: CreateOrganizationService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar,
              private dialogRef: MatDialogRef<EmailSettingDialogComponent>) { }

  deletedEmailSettingIdList: any[] = [];
  emailSettingVoList: EmailSettingsVOList;
  form: FormGroup;
  subdomainName: any;
  ngOnInit(): void {
    if (this.data.type !== 'delete') {
    this.form = this.fb.group({
      orgEmailsettingsArray: this.fb.array([
        this.organizationEmailFormGroup()
      ]),
    });
  }
    if (this.data.type === 'edit') {
      this.emailSettingVoList =  this.data.emailSettingsVo;
      this.subdomainName = this.data.emailSettingsVo.subdomainName;
      this.loadSettingDataForm(this.emailSettingVoList.orgEmailsettingsArray);
    } else if (this.data.type === 'create'){
      this.subdomainName = this.data.subdomainName;
    }
  }

  organizationEmailFormGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      settingName: ['', Validators.required],
      settingData: this.fb.group({
        hostName: ['', Validators.required],
        username: ['', Validators.required],
        password: ['', Validators.required],
        port: ['', Validators.required],
        smtpAuth: [false],
        starttlsEnable: [false],
      }),
    });
  }

  getEmailSettingsFormArray() {
    return (this.form.get('orgEmailsettingsArray') as FormArray);
  }

  addEmailSetting() {
    this.getEmailSettingsFormArray().push(this.organizationEmailFormGroup());
  }

  removeEmailSetting(i) {
    const deleteId = (this.getEmailSettingsFormArray().get('' + i) as FormGroup).get('id').value;
    if (deleteId !== null && deleteId !== '') {
      this.deletedEmailSettingIdList.push(deleteId);
      this.form.markAsDirty();
    }
    this.getEmailSettingsFormArray().removeAt(i);
    if (this.getEmailSettingsFormArray().length === 0) {
      this.addEmailSetting();
    }
  }

  checkDuplicateEmailSettingName(i) {
    const attributeName = this.getEmailSettingsFormArray().get('' + i).get('settingName');
    if (this.data.type === 'create') {
      if (this.data.settingNameList.some(name => (name === attributeName.value))) {
        this.getEmailSettingsFormArray().get('' + i).get('settingName').setErrors({ unique: true });
      } 
      if (attributeName.errors && attributeName.errors.unique === true) {
        if (!this.data.settingNameList.some(name => (name === attributeName.value))) {
          attributeName.setErrors(null);
        }
      }
      attributeName.markAsTouched({ onlySelf: true });
    }
  }

  getOrganizationEmailSettings(subdomainName, isLoad) {
    this.service.getOrganizationEmailSettings(subdomainName).subscribe(data => {
      if (data) {
        this.emailSettingVoList = data;
        this.loadSettingDataForm(data.orgEmailsettingsArray);
      }
    });
  }

  loadSettingDataForm(list: EmailSettingsVO[]) {
    if (list) {
      for (let i = 0; i < list.length; i++) {
        (this.getEmailSettingsFormArray().get('' + i) as FormGroup).patchValue(list[i]);
      }
    }
  }

  save() {
    if (this.form.get('orgEmailsettingsArray').valid) {
      let emailSettingsVo = new EmailSettingsVOList();
      emailSettingsVo.orgEmailsettingsArray = this.form.get('orgEmailsettingsArray').value;
      emailSettingsVo.deletedEmailSettingIdList = this.deletedEmailSettingIdList;
      emailSettingsVo.subdomainName = this.subdomainName;
      this.service.updateOrganizationEmailSettings(emailSettingsVo).subscribe(data => {
        if (data) {
        this.deletedEmailSettingIdList = [];
        this.dialogRef.close(true);
      }
      });
    }
  }

  yes() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }

}
