import { Component, OnInit, Inject, ViewChild, EventEmitter } from '@angular/core';
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA } from 'mat-right-sheet';
import { NgForm, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Grid, GridColumnNames } from '../grid-configuration/grid-vo';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridConfigurationService } from '../grid-configuration/grid-configuration.service';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { PageService } from '../page/page-service';
import { PageField, FieldConfig, Page } from '../shared/vo/page-vo';
import { InjectionToken } from '@angular/core';




@Component({
  selector: 'app-page-grid-configuration',
  templateUrl: './page-grid-configuration.component.html',
  styleUrls: ['./page-grid-configuration.component.css']
})



export class PageGridConfigurationComponent implements OnInit {

  constructor(private rightSheetRef: MatRightSheetRef<PageGridConfigurationComponent>,
    @Inject(MAT_RIGHT_SHEET_DATA) public data: any, private fb: FormBuilder, private service: GridConfigurationService,
    private snackBar: MatSnackBar, private dialog: MatDialog, private pageService: PageService) { }
  onAdd = new EventEmitter();
  gridConfigurationForm: FormGroup;
  gridVO = new Grid();
  gridNameReadOnlyValue = false;
  deletedIDList: string[] = [];
  deletedPermanentFilterList: string[] = [];
  deletedGlobalFilterList: string[] = [];
  hideFilterableOption = true;
  defaultColumnOptions = [];
  columnList: string[] = [];
  showCheckBoxBoolean = false;
  referesh: false;
  gridId: string;
  toggleIndex: number;
  deletedToggleIndex: number;
  passParamsList: string[] = [];
  sortDirectionBoolean = false;
  sortDirectionIndex: number;
  pageFields: PageField[] = [];
  validFilterCheck: any;
  validDefaultColumnCheck: any;
  validPassParamsCheck: any;
  gridName: any;
  pageNameOptions: Page[];
  showFieldValues = false;
  fieldsListForMapping: any[] = [];
  gridColumnNames: GridColumnNames[] = [];

  ngOnInit() {
    this.initialize();
    this.getBuiltInFields();
    this.getPageNameList(this.data.appId);
    this.gridConfigurationForm.get('defaultNoOfRows').setValue('10');
    this.gridConfigurationForm.get('widthPercentage').setValue(100);
    this.gridConfigurationForm.get('filterable').setValue(true);
    this.pageService.getTargetPageColumns(this.data.pageId, this.data.version).subscribe(data => {
      this.pageFields = data;
      this.loadGridColumn(this.pageFields);
      for (let i = 0; i < this.pageFields.length; i++) {
        if (this.pageFields[i].controlType !== 'extractaspdf' &&
          this.pageFields[i].controlType !== 'fileupload' &&
          this.pageFields[i].controlType !== 'hyperlink' &&
          this.pageFields[i].controlType !== 'signaturecontrol' &&
          this.pageFields[i].controlType !== 'hiddencontrol') {
          if (i > 0) {
            this.addAnotherGridColumn(i);
          }
          const index = '' + i;
          const form = (this.gridConfigurationForm.get('gridColumns') as FormArray).get(index);
          form.get('displayName').setValue(this.pageFields[i].fieldName);
          form.get('columnName').setValue(this.pageFields[i].fieldId);
          form.get('fieldType').setValue(this.pageFields[i].datatype);
          form.get('columnSequenceNo').setValue(i + 1);
          form.get('widthPercentage').setValue(Math.round(100 / (this.pageFields.length)));
        }
      }
    });


  }
  getBuiltInFields() {
    this.service.getBuiltInFields().subscribe(data => {
      this.fieldsListForMapping = data;
    });
  }

  checkGridNameExists() {
    if (this.gridConfigurationForm.get('gridName').value !== '' && this.gridConfigurationForm.get('gridName').value !== null) {
      this.service.checkGridName(this.gridConfigurationForm.get('gridName').value).subscribe(data => {
        if (data.response !== 'New Name') {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.gridConfigurationForm.get('gridName').setErrors({ alreadyExist: true });
        }
      });
      this.gridConfigurationForm.get('gridName').setValue(this.gridConfigurationForm.get('gridName').value);
    }
  }


  loadGridColumn(pageFields) {
    this.gridColumnNames.push({ label: 'Created By', name: 'created_by', dataType: 'string' },
      { label: 'Tenant Id', name: 'tenant_id', dataType: 'string' },
      { label: 'Created On', name: 'created_on', dataType: 'date' },
      { label: 'Modified By', name: 'modified_by', dataType: 'string' },
      { label: 'Modified On', name: 'modified_on', dataType: 'date' });
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < pageFields.length; i++) {
      const columnName = pageFields[i].fieldId;
      const displayName = pageFields[i].fieldName;
      const dataType = pageFields[i].datatype;
      if (columnName !== null && columnName !== ''
        && displayName !== null && displayName !== '') {
        const fieldNameArr = new GridColumnNames();
        fieldNameArr.label = displayName;
        fieldNameArr.name = columnName;
        fieldNameArr.dataType = dataType;
        const removeIndex = this.gridColumnNames.findIndex(x => x.name === columnName);
        if (removeIndex !== -1) {
          this.gridColumnNames.splice(removeIndex, 1, fieldNameArr);
        } else {
          this.gridColumnNames.splice(0, 0, fieldNameArr);
        }
      }
    }
  }

  getPageNameList(appId) {
    this.pageService.getPageNameByAppId(appId).subscribe(data => {
      this.pageNameOptions = data;
    });
  }

  initialize() {
    this.gridConfigurationForm = this.fb.group({
      gridId: [this.gridVO.gridId],
      gridName: [this.gridVO.gridName, [Validators.required]],
      moduleName: [this.gridVO.moduleName],
      widthPercentage: [this.gridVO.widthPercentage, [Validators.required]],
      filterable: [this.gridVO.filterable],
      gridUrl: [this.gridVO.gridUrl],
      defaultSortableColumn: [this.gridVO.defaultSortableColumn],
      showCheckBox: [this.gridVO.showCheckBox],
      passParams: [this.gridVO.passParams],
      defaultNoOfRows: ['' + this.gridVO.defaultNoOfRows],
      exportable: [this.gridVO.exportable],
      userSpecificGridData: [this.gridVO.userSpecificGridData],
      fieldValues: [this.gridVO.fieldValues],
      gridColumnNames: [this.gridVO.gridColumnNames],
      dataType: [''],
      gridColumns: this.fb.array([
        this.addGridColumnFormGroup()
      ]),
    });
  }

  addGridColumns(i: number) {
    const columnName = this.getGridColumnsArray().get('' + i).get('columnName').value;
    const displayName = this.getGridColumnsArray().get('' + i).get('displayName').value;
    if (columnName !== null && columnName !== ''
      && displayName !== null && displayName !== '') {
      const fieldNameArr = new GridColumnNames();
      fieldNameArr.label = displayName;
      fieldNameArr.name = columnName;
      const removeIndex = this.gridColumnNames.findIndex(x => x.name === columnName);
      if (removeIndex !== -1) {
        this.gridColumnNames.splice(removeIndex, 1, fieldNameArr);
      } else {
        this.gridColumnNames.splice(0, 0, fieldNameArr);
      }
    }
  }

  setGridColumnName(columnIndex) {
    this.addGridColumns(columnIndex);
  }

  getGridColumnsArray() {
    return (this.gridConfigurationForm.get('gridColumns') as FormArray);
  }

  activeColumnFilterable(event) {
    if (event.checked) {
      this.hideFilterableOption = true;
    } else {
      this.hideFilterableOption = false;
    }
  }

  getGridColumnsFormArray() {
    return (this.gridConfigurationForm.get('gridColumns') as FormArray).controls;
  }

  getDataType(event, dataType) {
    if (event.isUserInput) {
      this.showFieldValues = false;
      this.gridConfigurationForm.get('dataType').setValue(dataType);
      this.showFieldValues = true;
    }
  }

  addGridColumnFormGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      columnName: [''],
      displayName: ['', Validators.required],
      sortable: [true],
      widthPercentage: ['', Validators.required],
      filterable: [''],
      columnSequenceNo: ['', Validators.required],
      fieldType: [''],
      hiddenValue: [''],
      defaultSortableColumn: [''],
      passParams: [''],
      asc: [''],
      desc: ['']
    });
  }

  addAnotherGridColumn(columnIndex) {
    const formArray = (this.gridConfigurationForm.get('gridColumns') as FormArray);
    formArray.push(this.addGridColumnFormGroup());
    this.addGridColumns(columnIndex);
  }


  removeThisGridColumn(i: number, event) {
    const form = (this.gridConfigurationForm.get('gridColumns') as FormArray);
    const index = '' + i;
    const deletedID = form.get(index).get('id').value;

    if (deletedID !== null && deletedID !== '') {
      this.deletedIDList.push(deletedID);
      this.gridConfigurationForm.markAsDirty();
    }
    form.removeAt(i);
    this.getColumnValue(event, i);
  }

  onSubmit(userForm) {
    this.gridVO = this.gridConfigurationForm.getRawValue();
    const moduleName = this.gridConfigurationForm.get('moduleName').value;
    this.gridVO.moduleName = moduleName.join(',');
    this.gridName = this.gridVO.gridName;
    this.gridVO.deletedColumnIDList = this.deletedIDList;
    this.validFilterCheck = this.checkFilterable(this.gridVO.gridColumns);
    this.validDefaultColumnCheck = this.checkDefaultColum(this.gridVO.gridColumns);
    this.validPassParamsCheck = this.checkPassParams(this.gridVO.gridColumns);
    if (!this.hideFilterableOption) {
      this.validFilterCheck = true;
    }

    if (this.hideFilterableOption && !this.validFilterCheck) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Select Filterable for atleat one column'
      });
    } else if (!this.validDefaultColumnCheck) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Set Default Column for atleat one column'
      });
    } else if (!this.validPassParamsCheck) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Pick atleast one column for passing parameters'
      });
    } else {
      this.validFilterCheck = true;
      this.validDefaultColumnCheck = true;
      this.validPassParamsCheck = true;
    }
    if (userForm.valid && userForm.dirty && this.validFilterCheck
      && this.validDefaultColumnCheck && this.validPassParamsCheck) {
      this.gridVO.defaultNoOfRows = Number(this.gridVO.defaultNoOfRows);
      this.gridVO.exportable = this.getBooleanAsString(this.gridVO.exportable);
      this.gridVO.filterable = this.getBooleanAsString(this.gridVO.filterable);
      this.gridVO.showCheckBox = this.getBooleanAsString(this.gridVO.showCheckBox);
      this.gridVO.deletedColumnIDList = this.deletedIDList;
      this.gridVO.deletedPermanentFilterIdList = this.deletedPermanentFilterList;
      this.gridVO.deletedGlobalFilterIdList = this.deletedGlobalFilterList;


      for (let i = 0; i < this.gridVO.gridColumns.length; i++) {
        // if (!this.gridVO.gridColumns[i].defaultSortableColumn) {
        //   this.snackBar.openFromComponent(SnackbarComponent, {
        //     data: 'Set Default Column for atleat one column'
        //   });
        // }
        if (this.gridVO.gridColumns[i].defaultSortableColumn === true) {
          this.gridVO.defaultSortableColumn = this.gridVO.gridColumns[i].columnName;
          this.gridVO.sortDirection = 'asc';
          if (this.gridVO.gridColumns[i].desc === true) {
            this.gridVO.sortDirection = 'desc';
          }
        }
        if (!this.hideFilterableOption) {
          this.gridVO.gridColumns[i].filterable = this.getBooleanAsString(false);
        } else {
          this.gridVO.gridColumns[i].filterable = this.getBooleanAsString(this.gridVO.gridColumns[i].filterable);
        }
        this.gridVO.gridColumns[i].hiddenValue = this.getBooleanAsString(this.gridVO.gridColumns[i].hiddenValue);
        this.gridVO.gridColumns[i].sortable = this.getBooleanAsString(this.gridVO.gridColumns[i].sortable);
        // if (!this.gridVO.gridColumns[i].passParams) {
        //   this.snackBar.openFromComponent(SnackbarComponent, {
        //     data: 'Pick atleast one column for passing parameters'
        //   });
        // }

        if (this.gridVO.gridColumns[i].passParams === true) {
          this.passParamsList.push(this.gridVO.gridColumns[i].columnName);
        }
        this.gridVO.passParams = this.passParamsList.join(',');
      }
      this.service.saveAndUpdateGridData(this.gridVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        if (data.response !== 'Grid Name aready exist') {
          this.gridNameReadOnlyValue = false;
          this.reset(userForm);
          this.onAdd.emit(this.gridName);
          this.rightSheetRef.dismiss();
        }
      });

    }
  }

  hideFieldValues(event) {
    if (event.checked === true) {
      this.gridConfigurationForm.get('fieldValues').setValidators(Validators.required);
      this.gridConfigurationForm.get('gridColumnNames').setValidators(Validators.required);
      this.gridConfigurationForm.get('fieldValues').updateValueAndValidity();
      this.gridConfigurationForm.get('gridColumnNames').updateValueAndValidity();
    } else {
      this.gridConfigurationForm.get('fieldValues').setValidators(null);
      this.gridConfigurationForm.get('fieldValues').setValue(null);
      this.gridConfigurationForm.get('gridColumnNames').setValidators(null);
      this.gridConfigurationForm.get('gridColumnNames').setValue(null);
      this.gridConfigurationForm.get('fieldValues').updateValueAndValidity();
      this.gridConfigurationForm.get('gridColumnNames').updateValueAndValidity();
    }
  }

  getBooleanAsString(value): any {
    if (value === null || value === false || value === '') {
      return 'false';
    } else {
      return 'true';
    }
  }

  getStringAsBoolean(value): any {
    if (value === 'true') {
      return true;
    } else {
      return false;
    }
  }

  reset(userForm) {
    this.gridNameReadOnlyValue = false;
    this.hideFilterableOption = true;
    this.gridVO = new Grid();
    this.ngOnInit();
    this.showCheckBoxBoolean = false;
    this.columnList = [];
    this.passParamsList = [];
    this.toggleIndex = undefined;
    this.deletedToggleIndex = null;
    userForm.resetForm();
    this.sortDirectionBoolean = false;
  }

  // tslint:disable-next-line: use-lifecycle-interface
  // ngAfterViewInit() {
  //   this.filter.ngOnInit();
  // }

  receiveMessage($event) {
    if ($event.col13 !== undefined) {
      this.gridId = $event.col13;
    } else {
      this.gridId = $event;
    }
    this.service.getRowInfo(this.gridId).subscribe(data => {
      this.gridVO = data;
      this.initialize();
      // this.setFormControlsValue(this.gridConfigurationForm, this.gridVO);
      //  this.permanentFilters.ngOnInit();
      //  this.globalFilters.ngOnInit();
      if (this.gridVO.filterable === 'true') {
        this.hideFilterableOption = true;
        this.gridConfigurationForm.get('filterable').setValue(this.getStringAsBoolean(this.gridVO.filterable));
      } else {
        this.gridConfigurationForm.get('filterable').setValue(this.getStringAsBoolean(this.gridVO.filterable));
        this.hideFilterableOption = false;
      }

      if (this.gridVO.exportable) {
        this.gridConfigurationForm.get('exportable').setValue(this.getStringAsBoolean(this.gridVO.exportable));
      }

      if (this.gridVO.showCheckBox) {
        this.gridConfigurationForm.get('showCheckBox').setValue(this.getStringAsBoolean(this.gridVO.showCheckBox));
      }

      for (let i = 0; i < this.gridVO.gridColumns.length; i++) {
        if (i > 0) {
          this.addAnotherGridColumn(i);
        }
        const index = '' + i;
        const form = (this.gridConfigurationForm.get('gridColumns') as FormArray).get(index);
        if (this.gridVO.defaultSortableColumn) {
          if (this.gridVO.defaultSortableColumn === this.gridVO.gridColumns[i].columnName) {
            this.gridVO.gridColumns[i].defaultSortableColumn = true;
            this.sortDirectionBoolean = true;
            this.sortDirectionIndex = i;
            this.toggleIndex = i;
            if (this.gridVO.sortDirection === 'asc') {
              this.gridVO.gridColumns[i].asc = true;
            } else {
              this.gridVO.gridColumns[i].asc = false;
            }
            if (this.gridVO.sortDirection === 'desc') {
              this.gridVO.gridColumns[i].desc = true;
            } else {
              this.gridVO.gridColumns[i].desc = false;
            }
          } else {
            this.gridVO.gridColumns[i].defaultSortableColumn = false;
            this.gridVO.gridColumns[i].asc = false;
            this.gridVO.gridColumns[i].desc = false;
          }
        }
        if (this.gridVO.passParams) {
          const value = this.gridVO.passParams.split(',');
          const len = value.length;
          if (len === 1) {
            if (this.gridVO.passParams === this.gridVO.gridColumns[i].columnName) {
              this.gridVO.gridColumns[i].passParams = true;
            } else {
              this.gridVO.gridColumns[i].passParams = false;
            }
          } else {
            value.forEach(params => {
              if (params === this.gridVO.gridColumns[i].columnName) {
                this.gridVO.gridColumns[i].passParams = true;
              } else {
                if (this.gridVO.gridColumns[i].passParams) {
                  this.gridVO.gridColumns[i].passParams = true;
                } else {
                  this.gridVO.gridColumns[i].passParams = false;
                }
              }
            });

          }
        }
        form.setValue(this.gridVO.gridColumns[i]);
        form.get('sortable').setValue(this.getStringAsBoolean(this.gridVO.gridColumns[i].sortable));
        form.get('filterable').setValue(this.getStringAsBoolean(this.gridVO.gridColumns[i].filterable));
        form.get('hiddenValue').setValue(this.getStringAsBoolean(this.gridVO.gridColumns[i].hiddenValue));
        form.updateValueAndValidity();

        this.gridNameReadOnlyValue = true;
      }

    });

  }



  setSortDirection(i) {
    this.sortDirectionBoolean = true;
    this.sortDirectionIndex = i;
  }

  getColumnValue(event, i) {
    if (event.checked === true) {
      this.setSortDirection(i);
      if (this.toggleIndex === i) {
        this.toggleIndex = undefined;
      }
      if (this.toggleIndex !== undefined) {
        const index = '' + this.toggleIndex;
        this.gridConfigurationForm.get('gridColumns').get(index).get('defaultSortableColumn').setValue(false);
        // this.gridConfigurationForm.get('gridColumns').get(index).get('asc').value === true;
        this.gridConfigurationForm.get('gridColumns').get(index).get('asc').setValue(false);
        this.gridConfigurationForm.get('gridColumns').get(index).get('desc').setValue(false);
        this.toggleIndex = i;
      }
      this.toggleIndex = i;
    } else {
      this.sortDirectionBoolean = false;
      const index = '' + i;
      this.gridConfigurationForm.get('gridColumns').get(index).get('asc').setValue(false);
      this.gridConfigurationForm.get('gridColumns').get(index).get('desc').setValue(false);
    }
  }

  getSortDirectionAscValue(event, i) {
    if (event.checked === true) {
      const index = '' + i;
      if (this.gridConfigurationForm.get('gridColumns').get(index).get('asc').value === true) {
        if (this.gridConfigurationForm.get('gridColumns').get(index).get('desc').value === true) {
          this.gridConfigurationForm.get('gridColumns').get(index).get('desc').setValue(false);
        }
        this.gridConfigurationForm.get('gridColumns').get(index).get('desc').setValue(false);
      }
    }
  }

  getSortDirectionDescValue(event, i) {
    if (event.checked === true) {
      const index = '' + i;

      if (this.gridConfigurationForm.get('gridColumns').get(index).get('desc').value === true) {
        if (this.gridConfigurationForm.get('gridColumns').get(index).get('asc').value === true) {
          this.gridConfigurationForm.get('gridColumns').get(index).get('asc').setValue(false);
        }
        this.gridConfigurationForm.get('gridColumns').get(index).get('asc').setValue(false);
      }
    }
  }

  checkFilterable(gridColumns): any {
    let returnValue = false;
    gridColumns.forEach(params => {
      if (params.filterable) {
        returnValue = params.filterable;
      }
    });
    return returnValue;
  }

  checkDefaultColum(gridColumns): any {
    let returnValue = false;
    gridColumns.forEach(params => {
      if (params.defaultSortableColumn) {
        returnValue = params.defaultSortableColumn;
      }
    });
    return returnValue;

  }

  checkPassParams(gridColumns): any {
    let returnValue = false;
    gridColumns.forEach(params => {
      if (params.passParams) {
        returnValue = params.passParams;
      }
    });
    return returnValue;

  }

  cancel() {
    this.onAdd.emit(false);
    this.rightSheetRef.dismiss();
  }

}
