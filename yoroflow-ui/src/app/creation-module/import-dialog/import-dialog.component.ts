import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridConfigurationService } from '../grid-configuration/grid-configuration.service';
import { PageService } from '../page/page-service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { TableListVO, TableObjectsVO } from '../table-objects/table-object-vo';
import { ImportFormVO } from './import-form-vo';

@Component({
  selector: 'lib-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.css']
})
export class ImportDialogComponent implements OnInit {
  form: FormGroup;
  tableList: any[] = [];
  tableListVO = new TableListVO();
  tableObjectListVO: TableObjectsVO[] = [];
  importFormVO = new ImportFormVO();
  gridExist = false;
  importAs: string;
  loadImportAs: string;
  gridInfoList: any[] = [];
  appName: string;
  appPrefix: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ImportDialogComponent>, private pageService: PageService, private fb: FormBuilder,
    private snackBar: MatSnackBar, private service: GridConfigurationService) { }

  ngOnInit(): void {

    if (this.data.importAs === 'copy') {
      this.loadImportAs = 'copy';
    } else {
      this.loadImportAs = 'useAsItIs';
    }
    if (this.data.applicationList !== undefined && this.data.applicationList !== null && this.data.applicationList.length !== 0) {
      if (this.data.applicationList.some(f => f.applicationName === this.data.page.applicationName)) {
        this.appName = this.data.page.applicationName;
        this.data.applicationList.filter(f => f.applicationName === this.appName).forEach(element => {
          this.appPrefix = element.appPrefix;
        });
      } else {
        this.appName = '';
      }
    }
    this.form = this.fb.group({
      applicationName: [this.appName, Validators.required],
      pageName: [{ value: this.data.page.pageName, disabled: true }, Validators.required],
      importAs: [this.loadImportAs, Validators.required],
      newPageName: ['', Validators.required],
      gridName: ['', Validators.required],
      importGridAs: [this.loadImportAs, Validators.required],
      newGridName: ['', Validators.required],
      addUserPermission: [false],
    });
    this.checkGridExist(this.data.page);
  }

  setApplicationId($event, app) {
    if ($event.isUserInput === true) {
      this.data.page.applicationId = app.id;
      this.data.page.applicationName = app.applicationName;
      this.appPrefix = app.appPrefix;
    }
  }

  copy(userForm) {
    if (this.form.get('importAs').value === 'useAsItIs') {
      this.form.get('newPageName').setValidators(null);
      this.form.get('newPageName').updateValueAndValidity();
    }
    if (this.form.get('importGridAs').value === 'useAsItIs') {
      this.form.get('newGridName').setValidators(null);
      this.form.get('newGridName').updateValueAndValidity();
    }

    if (this.gridExist === false) {
      this.form.get('gridName').setValidators(null);
      this.form.get('gridName').updateValueAndValidity();
      this.form.get('newGridName').setValidators(null);
      this.form.get('newGridName').updateValueAndValidity();
    }

    if (this.data.type === 'workflow-import') {
      this.form.get('applicationName').setValidators(null);
      this.form.get('applicationName').updateValueAndValidity();
    }
    if (this.form.valid) {
      this.importFormVO = this.form.getRawValue();
      this.importAs = this.importFormVO.importAs;
      if (this.importFormVO.newPageName === this.importFormVO.pageName) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'old page name and new page name cannot be the same',
        });
      } else if (this.gridExist && this.importFormVO.newGridName === this.importFormVO.gridName) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'old grid name and new grid name cannot be the same',
        });
      } else {
        if (this.importFormVO.importAs === 'copy') {
          this.data.page.pageName = this.importFormVO.newPageName;
          this.data.page.pageId = (this.importFormVO.newPageName).trim().toLowerCase().replace(/ +/g, '');
          this.updateTableName(userForm);
        } else {
          this.updateTableName(userForm);
        }
      }
    }
  }

  checkGridExist(page) {
    page.sections.forEach(mainSection => {
      mainSection.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'grid') {
            this.gridExist = true;
            this.form.get('gridName').setValue(column.field.control.gridId);
            this.form.get('gridName').disable();
          }
        });
      });
    });
  }

  focusOutForPageName($event) {
    const pageName = this.form.get('newPageName').value;
    if (pageName !== '') {
      this.pageService.checkPageName(pageName).subscribe(data => {
        if (data.response.includes('already exist')) {
          this.form.get('newPageName').setErrors({ alreadyExist: true });
        } else {
          this.form.get('newPageName').setErrors(null);
        }
      });
    }
  }

  focusOutForGridName($event) {
    const pageName = this.form.get('newGridName').value;
    if (pageName !== '') {
      this.service.checkGridName(pageName).subscribe(data => {
        if (data.response !== 'New Name') {
          this.form.get('newGridName').setErrors({ alreadyGridExist: true });
        } else {
          this.form.get('newGridName').setErrors(null);
        }
      });
    }
  }

  updateTableName(userForm) {
    this.data.page.sections.forEach(mainSection => {
      mainSection.tableName = this.data.page.pageId;
      if (mainSection.parentTable) {
        mainSection.parentTable = this.data.page.pageId;
      }
      mainSection.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'grid' && this.gridExist) {
            if (this.importFormVO.gridName === column.field.control.gridId) {
              column.field.control.targetPageId = this.data.page.pageId;
              if (this.importFormVO.importGridAs === 'copy') {
                column.field.control.gridId = this.importFormVO.newGridName;
              } else {
                column.field.control.gridId = this.importFormVO.gridName;
              }
              this.gridInfoList.push({
                oldGridName: this.importFormVO.gridName, newGridName: this.importFormVO.newGridName
                , moduleName: this.appPrefix + '_' + this.data.page.pageId
              });
            }
          }
        });
      });
    });
    if (this.gridInfoList !== undefined && this.gridInfoList.length > 0) {
      this.dialogRef.close({
        page: this.data.page, data: true, importAs: this.importAs, gridInfo: this.gridInfoList
        , userPermission: this.importFormVO.addUserPermission
      });
    } else {
      this.dialogRef.close({
        page: this.data.page, data: true, importAs: this.importAs, gridInfo: undefined
        , userPermission: this.importFormVO.addUserPermission
      });
    }
    userForm.resetForm();
  }

  close() {
    this.dialogRef.close({ data: false });
  }

}
