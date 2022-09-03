import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ApplicationProvisionService } from './application-provision-service';
import { Application } from './appication-vo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterEvent } from '@angular/router';
import { MatRightSheet } from 'mat-right-sheet';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemesVO } from '../shared/vo/themes-vo';
import { MenuVO } from '../shared/vo/menu-vo';
import { DynamicMenuService } from '../dynamic-menu/dynamic-menu.service';
import { LoadLogoService } from '../shared/service/load-logo.service';
import { ThemesService } from '../shared/service/themes.service';
import { YoroSecurityComponent } from '../yoro-security/yoro-security.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { RenderingConfirmDialogBoxComponent } from '../rendering-confirm-dialog-box-component/rendering-confirm-dialog-box-component.component';


@Component({
  selector: 'app-application-provision',
  templateUrl: './application-provision.component.html',
  styleUrls: ['./application-provision.component.css']
})
export class ApplicationProvisionComponent implements OnInit {

  form: FormGroup;
  applicationVO = new Application();
  menuList: MenuVO[];
  submitVisible = false;
  appIdentifierReadOnlyValue = false;
  securityOptionEnable = true;
  oldApplicationName: string;
  canDeactivateForm: boolean;
  urlData: any;
  themesList: ThemesVO[];
  selectedFile: any;
  base64Image: any;
  uploadAction = 'upload';
  screenHeight: string;
  screenHeight1: string;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = (window.innerHeight - 72) + 'px';
    this.screenHeight1 = (window.innerHeight - 63) + 'px';
  }

  constructor(private fb: FormBuilder, private applicationProvisionService: ApplicationProvisionService,
    private snackBar: MatSnackBar, private activateRoute: ActivatedRoute, private menuService: DynamicMenuService,
    private rightSheet: MatRightSheet, private dialog: MatDialog, private router: Router, public loadLogo: LoadLogoService
    , private themesService: ThemesService, private sanitizer: DomSanitizer) {
    this.getRouterLink();
  }

  ngOnInit() {
    this.form = this.fb.group({
      id: [this.applicationVO.id],
      applicationName: [this.applicationVO.applicationName, Validators.required],
      description: [this.applicationVO.description, Validators.required],
      applicationId: [this.applicationVO.applicationId, Validators.required],
      timezone: [this.applicationVO.timezone, Validators.required],
      defaultLanguage: [this.applicationVO.defaultLanguage, Validators.required],
      themeName: [this.applicationVO.themeName, Validators.required],
      themeId: [this.applicationVO.themeId],
      leftMenuId: [],
      rightMenuId: [],
      topMenuId: [],
      bottomMenuId: [],
      logo: []
    });

    if (window.location.href.includes('app/create')) {
      this.loadLogo.previewUrl = null;
    }

    this.formValueChange();
    if (this.form.touched === false) {
      this.canDeactivateForm = false;
    }
    this.activateRoute.paramMap.subscribe(params => {
      if (params.get('id') !== null) {
        this.uploadAction = 'replace';
        const value = params.get('id');
        this.applicationProvisionService.getApplication(value).subscribe(data => {
          this.applicationVO = data;
          this.form.patchValue(this.applicationVO);
          this.oldApplicationName = this.applicationVO.applicationName;
          this.form.updateValueAndValidity();
          this.form.get('applicationId').disable();
          this.submitVisible = true;
          this.appIdentifierReadOnlyValue = true;
          this.securityOptionEnable = false;
          if (data.image) {
            this.loadLogo.previewUrl = data.image;
          }
          this.formValueChange();
          if (this.form.touched === false) {
            this.canDeactivateForm = false;
          }
        });

      }
    });
    this.loadThemesList();
    // this.loadLogo.previewUrl = null;
    this.screenHeight = (window.innerHeight - 72) + 'px';
    this.screenHeight1 = (window.innerHeight - 63) + 'px';
  }

  loadThemesList() {
    this.themesService.getThemesList().subscribe(data => {
      this.themesList = data;
    });
  }

  setThemeId(themeId, event) {
    if (event.isUserInput === true) {
      this.form.get('themeId').setValue(themeId);
    }
  }

  formValueChange() {
    this.form.valueChanges.subscribe(data => {
      this.canDeactivateForm = true;
    });
  }

  openApplicationPermissions() {
    const pagePermissionsSheet = this.rightSheet.open(YoroSecurityComponent, {
      disableClose: true,
      data: { 'id': this.applicationVO.id, 'securityType': 'application' },
      panelClass: 'dynamic-right-sheet-container',
    });
  }

  loadMenuList() {
    this.menuService.getMenuList().subscribe(data => {
      this.menuList = data;
    });
  }

  createAppIdByAppName() {
    const value = this.form.get('applicationName').value;
    if (value !== null && value !== '') {
      if (this.oldApplicationName !== value) {
        this.checkWithApplicationName();
      }
      // const name = value.replace(/[^\w\s]/gi, '');
      // this.form.get('applicationName').setValue(name);
      if (!this.form.get('id').value) {
        this.form.get('applicationId').setValue(this.generateApplicationIdentifier(value));
      }
      this.oldApplicationName = value;
    }
  }

  createApplicationIdentifier(name: string, type: string) {
    const value = this.form.get(name).value;

    if (value !== null && value !== '') {
      this.checkWithSubdomainName();
      if (type === 'create') {
        this.form.get('applicationId').setValue(this.generateApplicationIdentifier(value));
      } else if (type === 'update') {
        this.form.get('applicationId').setValue(this.generateApplicationIdentifier(value));
      }
    }

  }

  generateApplicationIdentifier(name: string) {
    name = (name).replace(/[^\w\s]/gi, '');
    name = (name).trim().toLowerCase().replace(/ +/g, '-');
    return name;
  }

  loadApplicationInfo() {
    this.activateRoute.params.subscribe(params => {
      if (params.id !== null) {
        this.applicationProvisionService.getApplication(params.id).subscribe(data => {
          this.applicationVO = data;
        });
      }
    });
  }

  addSubDomainValidator() {
    const formControl = this.form.get('applicationId');
    formControl.valueChanges.subscribe(id => {
      if (id !== null && id !== '') {
        this.applicationVO.applicationId = formControl.value;
        this.applicationProvisionService.checkWithSubdomainName(this.applicationVO).subscribe(data => {
          if (data.response.includes('already exists')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            formControl.setErrors({ 'alreadyExist': true });
          }
        });
      }
    });
  }

  addNameValidator() {
    const formControl = this.form.get('applicationName');
    formControl.valueChanges.subscribe(id => {
      if (id !== null && id !== '') {
        this.applicationVO.applicationName = formControl.value;
        this.applicationProvisionService.checkWithApplicationName(this.applicationVO).subscribe(data => {
          if (data.response.includes('already exists')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            formControl.setErrors({ 'alreadyExist': true });
          }
        });
      }
    });
  }

  checkWithSubdomainName() {
    const formControl = this.form.get('applicationId');
    this.applicationVO.applicationId = formControl.value;
    this.applicationProvisionService.checkWithSubdomainName(this.applicationVO).subscribe(data => {
      if (data.response.includes('already exists')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        formControl.setErrors({ 'alreadyExist': true });
      }
    });
  }

  checkWithApplicationName() {
    const formControl = this.form.get('applicationName');
    this.applicationVO.applicationName = formControl.value;
    this.applicationProvisionService.checkWithApplicationName(formControl.value).subscribe(data => {
      if (data.response.includes('already exists')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        formControl.setErrors({ 'alreadyExist': true });
      }
    });
  }

  getUploaded($event) {
    if ($event === true) {
      this.form.markAsDirty();
    }
  }

  submit(userForm) {
    if (userForm.valid && userForm.dirty) {
      this.applicationVO = this.form.getRawValue();
      this.applicationVO.logo = null;
      const jsonData = JSON.stringify(this.applicationVO);
      this.applicationVO.logo = new FormData();
      this.applicationVO.logo.append('data', jsonData);
      this.applicationVO.logo.append('file', this.loadLogo.fileData);
      this.applicationProvisionService.saveApplication(this.applicationVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        userForm.resetForm();
        this.loadLogo.previewUrl = null;
        this.canDeactivateForm = false;
        this.uploadAction = 'upload';
        this.form.get('applicationId').enable();
        if (data.response.includes('successfully')) {
          this.router.navigate(['/application-dashboard']);
        }
      });
    }
  }

  reset(userForm) {
    this.canDeactivateForm = false;
    this.loadLogo.previewUrl = null;
    this.appIdentifierReadOnlyValue = false;
    this.uploadAction = 'upload';
    if (this.applicationVO) {
      this.ngOnInit();
      this.form.patchValue(this.applicationVO);
    } else {
      this.form.get('applicationId').enable();
    }
  }

  canDeactivate(): Observable<boolean> | boolean {


    if (this.canDeactivateForm) {
      this.canDeactivateForm = false;
      const dialogRef = this.dialog.open(RenderingConfirmDialogBoxComponent, {
        width: '250px',
        data: this.urlData
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data === false) {
          this.canDeactivateForm = true;
        }
      });
      return false;
    }
    return true;
  }

  getRouterLink(): any {
    this.router.events.subscribe((data: RouterEvent) => {
      this.urlData = {
        'type': 'navigation', 'target': data.url
      };
    });
    return this.urlData;
  }


}

