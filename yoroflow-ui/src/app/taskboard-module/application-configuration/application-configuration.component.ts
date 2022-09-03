import { F } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { IntegrateApplicationService } from '../integrate-application/integrate-application.service';
import { OrganizationIntegratedAppsVO } from '../integrate-application/integrate-application.vo';
import { ApplicationConfigurationService } from './application-configuration.service';
import { AppConfigurationVO } from './application-configuration.vo';

@Component({
  selector: 'app-application-configuration',
  templateUrl: './application-configuration.component.html',
  styleUrls: ['./application-configuration.component.scss']
})
export class ApplicationConfigurationComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ApplicationConfigurationComponent>, private fb: FormBuilder,
    private appConfigService: ApplicationConfigurationService, private snackbar: MatSnackBar,
    private dialog: MatDialog, private integrateService: IntegrateApplicationService) { }

  form: FormGroup;
  isApi: boolean = false;
  isClient: boolean = false;
  isToken: boolean = false;
  authType: string = '';

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.data.orgApp.id],
      authType: [this.data.orgApp.authType],
      authToken: [this.data.orgApp.authToken],
      clientId: [this.data.orgApp.clientId],
      clientSecret: [this.data.orgApp.clientSecret],
      apiKey: [this.data.orgApp.apiKey],
      apiSecret: [this.data.orgApp.apiSecret],
      taskboardId: [this.data.taskboardId],
      appName: [this.data.appName]
    });
    if (this.data.orgApp.authType === undefined
      || this.data.orgApp.authType == null
      || this.data.orgApp.authType === '') {
      this.authType = 'api';
      this.form.get('authType').setValue('api');
    } else {
      this.authType = this.data.orgApp.authType;
    }
    if (this.authType === 'api') {
      this.isApi = true;
      this.isClient = false;
      this.isToken = false;
      this.form.get('apiKey').setValidators([Validators.required]);
      this.form.get('apiSecret').setValidators([Validators.required]);
    } else if (this.authType === 'client') {
      this.isApi = false;
      this.isClient = true;
      this.isToken = false;
      this.form.get('clientId').setValidators([Validators.required]);
      this.form.get('clientSecret').setValidators([Validators.required]);
    } else if (this.authType === 'token') {
      this.isApi = false;
      this.isClient = false;
      this.isToken = true;
      this.form.get('authToken').setValidators([Validators.required]);
    }
  }

  authtypeChange(authType: string): void {
    this.form.get('authType').setValue(authType);
    this.authType = authType;
    if (authType === 'api') {
      this.isApi = true;
      this.isClient = false;
      this.isToken = false;
      this.form.get('apiKey').setValidators([Validators.required]);
      this.form.get('apiSecret').setValidators([Validators.required]);
      this.form.get('clientId').setErrors(null);
      this.form.get('clientSecret').setErrors(null);
      this.form.get('authToken').setErrors(null);
    } else if (authType === 'client') {
      this.isApi = false;
      this.isClient = true;
      this.isToken = false;
      this.form.get('apiKey').setErrors(null);
      this.form.get('apiSecret').setErrors(null);
      this.form.get('clientId').setValidators([Validators.required]);
      this.form.get('clientSecret').setValidators([Validators.required]);
      this.form.get('authToken').setErrors(null);
    } else {
      this.isApi = false;
      this.isClient = false;
      this.isToken = true;
      this.form.get('apiKey').setErrors(null);
      this.form.get('apiSecret').setErrors(null);
      this.form.get('clientId').setErrors(null);
      this.form.get('clientSecret').setErrors(null);
      this.form.get('authToken').setValidators([Validators.required]);
    }
  }

  saveConfiguration(userForm: NgForm): void {
    var orgApp = new OrganizationIntegratedAppsVO();
    orgApp = this.data.orgApp;
    if (this.form.get('authType').value === 'api' && this.form.get('apiSecret').value) {
      if (this.form.get('apiSecret').value.includes('xxx')) {
        this.form.get('apiSecret').setErrors({ invalidApi: true });
      } else {
        this.form.get('apiSecret').setErrors(null);
      }
    } else if (this.form.get('authType').value === 'token' && this.form.get('authToken').value) {
      if (this.form.get('authToken').value.includes('xxx')) {
        this.form.get('authToken').setErrors({ invalidToken: true });
      } else {
        this.form.get('authToken').setErrors(null);
      }
    } else if (this.form.get('authType').value === 'client' && this.form.get('clientSecret').value) {
      if (this.form.get('clientSecret').value.includes('xxx')) {
        this.form.get('clientSecret').setErrors({ invalidToken: true });
      } else {
        this.form.get('clientSecret').setErrors(null);
      }
    }
    if (userForm.valid) {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        disableClose: true,
        width: '100px',
        data: { type: 'spinner' }
      });
      if (this.data.type === 'org') {
        orgApp.id = this.form.get('id').value;
        orgApp.isRemoved = 'Y';
        orgApp.applicationName = this.form.get('appName').value;
        orgApp.authType = this.form.get('authType').value;
        if (this.form.get('authType').value === 'api') {
          orgApp.apiKey = this.form.get('apiKey').value;
          orgApp.apiSecret = this.form.get('apiSecret').value;
        } else if (this.form.get('authType').value === 'token') {
          orgApp.authToken = this.form.get('authToken').value;
        } else {
          orgApp.clientId = this.form.get('clientId').value;
          orgApp.clientSecret = this.form.get('clientSecret').value;
        }
        this.integrateService.saveOrganizationApplications(orgApp).subscribe(orgAppConfig => {
          dialog.close();
          this.dialogRef.close(orgAppConfig);
        }, error => {
          dialog.close();
        });
      } else {
        const appConfig = new AppConfigurationVO();
        appConfig.id = null;
        appConfig.applicationName = orgApp.applicationName;
        appConfig.taskboardId = this.data.taskboardId;
        appConfig.authType = this.form.get('authType').value;
        if (this.form.get('authType').value === 'api') {
          appConfig.apiKey = this.form.get('apiKey').value;
          appConfig.apiSecret = this.form.get('apiSecret').value;
        } else if (this.form.get('authType').value === 'token') {
          appConfig.authToken = this.form.get('authToken').value;
        } else {
          appConfig.clientId = this.form.get('clientId').value;
          appConfig.clientSecret = this.form.get('clientSecret').value;
        }
        this.appConfigService.saveAppConfig(appConfig).subscribe(appConfigRes => {
          dialog.close();
          appConfig.id = appConfigRes.responseId;
          this.dialogRef.close(appConfig);
        }, error => {
          dialog.close();
        });
      }
    }
  }

  saveWithoutToken(): void {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' }
    });
    var orgApp = new OrganizationIntegratedAppsVO();
    orgApp = this.data.orgApp;
    orgApp.id = this.form.get('id').value;
    orgApp.isRemoved = 'Y';
    orgApp.applicationName = this.form.get('appName').value;
    orgApp.authType = null;
    orgApp.apiKey = '';
    orgApp.apiSecret = '';
    orgApp.authToken = '';
    orgApp.clientId = '';
    orgApp.clientSecret = '';
    this.integrateService.saveOrganizationApplications(orgApp).subscribe(orgAppConfig => {
      dialog.close();
      this.dialogRef.close(orgAppConfig);
    }, error => {
      dialog.close();
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}
