import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, AbstractControl, Validators } from '@angular/forms';
import { UserService } from '../shared/service/user-service';
import { PageService } from '../page/page-service';
import { Page } from '../shared/vo/page-vo';
import { WorkFlowList } from '../shared/vo/workflow-list-vo';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiKeyService } from './api-key.service';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

@Component({
  selector: 'lib-api-key-dialog-box',
  templateUrl: './api-key-dialog-box.component.html',
  styleUrls: ['./api-key-dialog-box.component.css']
})
export class ApiKeyDialogBoxComponent implements OnInit {
  public config: PerfectScrollbarConfigInterface = {};

  @ViewChild('apiKey', { static: false }) apiKey: YorogridComponent;
 // public dialogRef: MatDialogRef<ApiKeyDialogBoxComponent>,
  constructor( private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any,
    private service: UserService, private snackBar: MatSnackBar, private dialogRef: MatDialogRef<ApiKeyDialogBoxComponent>,
    private pageService: PageService, private dialog: MatDialog, private apiService: ApiKeyService) { }
  apiForm: FormGroup;
  apiKeyList: any;
  pageNameOptions: Page[];
  workFlowList: WorkFlowList[];
  workflowVersionList: WorkFlowList[];
  showSecretKey = false;
  allowSubmit = true;
  apiId: any;
  show = true;
  disableButton = false;
  minDate = null;
  showCreateButton = true;
  showtabbedMenu = false;
  showForm = false;
  pageRendered = false;
  refreshGrid = false;
  showWorkflow = true;
  showPage = true;
  ngOnInit(): void {
    this.initiateApiFormGroup();
    this.minDate = new Date(new Date().setDate(new Date().getDate()));
    if (this.data.apiId !== '') {
    this.receiveMessage(this.data.apiId);
    } else {
      this.showCreateButton = false;
      this.showForm = true;
     // this.loadWorkFlowList();
      this.getAllPageNames();
      this.pageRendered = true;
    }
  }

  record($event) {
    if ($event.index === 1 && this.getWorkflowPermissionFormarray().length === 0) {
      this.loadWorkFlowList();
    } else if ($event.index === 0 && this.getPagePermissionFormarray().length === 0) {
      this.getAllPageNames();
    }
  }

  loadapiValues(apiKeyLists) {
    this.apiKeyList = apiKeyLists;
    this.apiForm.patchValue(apiKeyLists);
    const json = apiKeyLists;
    this.disableButton = true;
    this.showCreateButton = true;
    if (json.pagePermissions) {
      const pageList: any[] = json.pagePermissions;
      for (let i = 0; i < pageList.length; i++) {
        // if (i >= pageLength) {
        this.getPagePermissionFormarray().push(this.selectPagePermission());
        // }
        const index = '' + i;
        const fieldValue = (this.getPagePermissionFormarray().get(index) as FormGroup);
        fieldValue.patchValue(pageList[i]);
        fieldValue.disable();
      }
    }
    if (json.workflowPermissions) {
      const workflowList: any[] = json.workflowPermissions;
      for (let i = 0; i < workflowList.length; i++) {
        this.getWorkflowPermissionFormarray().push(this.selectWorkflowPermission());
        const index = '' + i;
        const fieldValue = (this.getWorkflowPermissionFormarray().get(index) as FormGroup);
        fieldValue.patchValue(workflowList[i]);
        fieldValue.disable();
      }
    }
    this.apiForm.disable();
  }

  // apiFormInitiate() {
  //   this.apiForm = this.fb.group({
  //     apiformArray: this.fb.array([this.selectApiFormGroup()]),
  //   });
  // }

  // getApiFormarray() {
  //   return (this.apiForm.get('apiformArray') as FormArray);
  // }

  // addApiFormGroup() {
  //   this.getApiFormarray().push(this.selectApiFormGroup());
  // }

  // removeApiFormGroup(i) {
  //   this.getApiFormarray().removeAt(i);
  //   if (this.getApiFormarray().length === 0) {
  //     this.getApiFormarray().push(this.selectApiFormGroup());
  //   }
  // }

  initiateApiFormGroup() {
    this.apiForm = this.fb.group({
      id: [''],
      apiName: ['', Validators.required],
      expiresOn: [{ value: '', disabled: false }, Validators.required],
      apiKey: [{ value: '', disabled: true }],
      secretKey: [{ value: '', disabled: true }],
      pagePermissions: this.fb.array([]),
      workflowPermissions: this.fb.array([]),
    });
  }

  generateSecretKey(i) {
    this.apiForm.get('secretKey').setValue('123 key');
    const apiKey = this.apiForm.get('apiKey');
    this.apiService.generateSecretKey(apiKey.value).subscribe(secretKey => {
    });
  }

  // showPageSecurity(i) {
  //   this.apiForm.get('apiformArray').get(i + '').get('showPage').setValue(true);
  //   this.addPagePermissionFormGroup(i);
  // }

  // showWorkflowSecurity(i) {
  //   this.apiForm.get('apiformArray').get(i + '').get('showWorkflow').setValue(true);
  //   this.addWorkflowPermissionFormGroup(i);
  // }

  selectPagePermission() {
    return this.fb.group({
      pageName: [''],
      pageId: [],
      version: [],
      createAllowed: [false],
      readAllowed: [false],
      updateAllowed: [false],
      deleteAllowed: [false],
    });
  }

  getPagePermissionFormarray() {
    return (this.apiForm.get('pagePermissions') as FormArray);
  }

  addPagePermissionFormGroup() {
    this.getPagePermissionFormarray().push(this.selectPagePermission());
  }

  removePagePermissionFormGroup(i) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      height: '130px',
      data: 'confirm-page-workflow-delete'
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === true) {
        this.removePagePermission(i);
      }
    });
  }

  removePagePermission(i) {
    this.getPagePermissionFormarray().removeAt(i);
  }

  selectWorkflowPermission() {
    return this.fb.group({
      workflowId: [],
      workflowName: [''],
      workflowKey: [],
      version: [],
      updateAllowed: [false],
      readAllowed: [false],
      launchAllowed: [false],
      publishAllowed: [false],
    });
  }
  getWorkflowPermissionFormarray() {
    return (this.apiForm.get('workflowPermissions') as FormArray);
  }

  addWorkflowPermissionFormGroup() {
    this.getWorkflowPermissionFormarray().push(this.selectWorkflowPermission());
  }

  removeWorkflowPermissionFormGroup(i) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      height: '130px',
      data: 'confirm-page-workflow-delete'
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === true) {
        this.removeWorkflowPermission(i);
      }
    });
  }

  removeWorkflowPermission(i) {
    this.getWorkflowPermissionFormarray().removeAt(i);
  }

  loadWorkFlowList() {
    this.show = false;
    this.showWorkflow = false;
    this.apiService.getWorkFlowList().subscribe(data => {
      this.workFlowList = data;
      this.show = true;
      this.showWorkflow = true;
      this.showtabbedMenu = true;
      if (data) {
        this.disableButton = false;
        for (let i = 0; i < this.workFlowList.length; i++) {
          this.getWorkflowPermissionFormarray().push(this.selectWorkflowPermission());
          this.getWorkflowPermissionFormarray().get('' + i).get('workflowId').setValue(this.workFlowList[i].processDefinitionId);
          this.getWorkflowPermissionFormarray().get('' + i).get('workflowKey').setValue(this.workFlowList[i].key);
          this.getWorkflowPermissionFormarray().get('' + i).get('workflowName').setValue(this.workFlowList[i].processDefinitionName);
          this.getWorkflowPermissionFormarray().get('' + i).get('version').setValue(this.workFlowList[i].workflowVersion);
          this.getWorkflowPermissionFormarray().get('' + i).get('updateAllowed').setValue(this.workFlowList[i].canEdit);
          this.getWorkflowPermissionFormarray().get('' + i).get('launchAllowed').setValue(this.workFlowList[i].canLaunch);
          this.getWorkflowPermissionFormarray().get('' + i).get('publishAllowed').setValue(this.workFlowList[i].canPublish);
          if (this.workFlowList[i].canEdit === false) {
            this.getWorkflowPermissionFormarray().get('' + i).get('updateAllowed').disable();
          }
          if (this.workFlowList[i].canLaunch === false) {
            this.getWorkflowPermissionFormarray().get('' + i).get('launchAllowed').disable();
          }
          if (this.workFlowList[i].canPublish === false) {
            this.getWorkflowPermissionFormarray().get('' + i).get('publishAllowed').disable();
          }
          this.getWorkflowPermissionFormarray().get('' + i).get('workflowName').disable();
          this.getWorkflowPermissionFormarray().get('' + i).get('version').disable();
          this.getWorkflowPermissionFormarray().get('' + i).get('readAllowed').disable();
        }
      }
      // this.selectVersion(form.get('workflowKey').value, { isUserInput: false });
    });
  }

  selectVersion(key, event, iw, i) {
    const workflow = this.apiForm.get('apiformArray').get(iw + '').get('workflowPermissions');
    if (key && event.isUserInput) {
      workflow.get(i + '').get('workflowKey').setValue(key);
      this.pageService.getWorkflowVersionList(key).subscribe(data => {
        this.workflowVersionList = data;
      });
    }
  }

  getAllPageNames() {
    this.show = false;
    this.showPage = false;
    this.apiService.getAutoCompletePageNameForLoggedInUser().subscribe(result => {
      this.show = true;
      this.showPage = true;
      this.showtabbedMenu = true;
      this.pageNameOptions = result;
      if (result) {
        this.disableButton = false;
        for (let i = 0; i < this.pageNameOptions.length; i++) {
          this.getPagePermissionFormarray().push(this.selectPagePermission());
          this.getPagePermissionFormarray().get('' + i).get('pageName').setValue(this.pageNameOptions[i].pageName);
          this.getPagePermissionFormarray().get('' + i).get('pageId').setValue(this.pageNameOptions[i].pageId);
          this.getPagePermissionFormarray().get('' + i).get('version').setValue(this.pageNameOptions[i].version);
          this.getPagePermissionFormarray().get('' + i).get('updateAllowed').setValue(this.pageNameOptions[i].security.update);
          this.getPagePermissionFormarray().get('' + i).get('readAllowed').setValue(this.pageNameOptions[i].security.read);
          this.getPagePermissionFormarray().get('' + i).get('createAllowed').setValue(this.pageNameOptions[i].security.create);
          this.getPagePermissionFormarray().get('' + i).get('deleteAllowed').setValue(this.pageNameOptions[i].security.delete);
          if (this.pageNameOptions[i].security.update === false) {
            this.getPagePermissionFormarray().get('' + i).get('updateAllowed').disable();
          }
          if (this.pageNameOptions[i].security.read === false) {
            this.getPagePermissionFormarray().get('' + i).get('readAllowed').disable();
          }
          if (this.pageNameOptions[i].security.create === false) {
            this.getPagePermissionFormarray().get('' + i).get('createAllowed').disable();
          }
          if (this.pageNameOptions[i].security.delete === false) {
            this.getPagePermissionFormarray().get('' + i).get('deleteAllowed').disable();
          }
          this.getPagePermissionFormarray().get('' + i).get('pageName').disable();
          this.getPagePermissionFormarray().get('' + i).get('version').disable();
        }
      }
    });
  }

  loadPageIdAndVersion(pageId, version, rule: AbstractControl) {
    rule.get('pageId').setValue(pageId);
    rule.get('version').setValue(version);
  }

  setAutocompleteValidation(name) {
    if (this.pageNameOptions !== undefined && this.pageNameOptions.length > 0 &&
      !this.pageNameOptions.some(pageName => pageName.pageName === name.value)) {
      name.setErrors({ invalidPageName: true });
    }
  }

  submitApi(userform) {
    if ((this.getPagePermissionFormarray().length === 0) || (this.getWorkflowPermissionFormarray().length === 0)) {
      this.allowSubmit = false;
    } else {
      this.allowSubmit = true;
    }
    if (userform.valid && this.allowSubmit) {
      const apiKeyValue = this.apiForm.getRawValue();
      this.apiService.saveApiKeyList(apiKeyValue).subscribe(response => {
        // this.apiKey.refreshGrid();
        this.refreshGrid = true;
        if (response) {
          this.resetApi();
          this.ngOnInit();
          this.showSecretKey = true;
          this.loadapiValues(response);
        }
      });
    }
  }

  receiveMessage(apiId) {
    if (apiId !== undefined) {
      this.show = false;
      this.apiService.getApiKeyList(apiId).subscribe(apiKeyLists => {
        if (apiKeyLists) {
          this.showSecretKey = false;
          this.showForm = true;
          this.showtabbedMenu = true;
         // this.resetApi();
          // this.ngOnInit();
          this.show = true;
          this.loadapiValues(apiKeyLists);
          this.pageRendered = true;
        }
      });
    }
  }

  deleteApi(id) {
    this.apiService.deleteApiKey(id).subscribe(response => {
      if (response.response.includes('Api key deleted successfully')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: response.response,
        });
        this.resetApi();
        this.ngOnInit();
        this.showtabbedMenu = false;
        this.apiKey.refreshGrid();
      }
    });
  }

  resetApi() {
    this.apiForm.reset();
    // this.ngOnInit();
  }

  newFirstApi() {
    this.showForm = true;
    this.newApi();
  }

  newApi() {
    this.showCreateButton = false;
    this.apiForm.reset();
    this.ngOnInit();
    this.loadWorkFlowList();
    this.getAllPageNames();
  }

  close() {
      this.dialogRef.close(this.refreshGrid);
  }
}
