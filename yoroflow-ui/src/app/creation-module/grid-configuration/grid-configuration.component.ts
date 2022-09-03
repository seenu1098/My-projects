import { Component, OnInit, ViewChild, Output, EventEmitter, Input, InjectionToken } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, NgModel, NgForm, Form } from '@angular/forms';
import { Grid, GridColumnNames } from './grid-vo';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { GridConfigurationService } from './grid-configuration.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { debounceTime } from 'rxjs/operators';
// import { FilterComponent } from '../filter/filter.component';
import { Router, RouterEvent } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { Observable } from 'rxjs';
import { Page, PageField } from '../shared/vo/page-vo';
import { PageService } from '../page/page-service';

export class CheckBox {
  index: number;
  name: string;
}
export class FieldName {
  index: number;
  value: string;
}

export declare const MAT_INPUT_VALUE_ACCESSOR: InjectionToken<{ value: any; }>;

@Component({
  selector: 'app-grid-configuration',
  templateUrl: './grid-configuration.component.html',
  styleUrls: ['./grid-configuration.component.css']
})
export class GridConfigurationComponent implements OnInit {

  constructor(private fb: FormBuilder, private dialog: MatDialog, private service: GridConfigurationService,
    private router: Router, private snackBar: MatSnackBar, private pageService: PageService) {
    this.getRouterLink();
  }
  @Output() getId = new EventEmitter<object>();
  @Input() id: any;
  @Input() pageName: any;

  @ViewChild('gridConfig', { static: true }) gridConfig: YorogridComponent;
  // @ViewChild('permanentFilters', { static: true }) permanentFilters: FilterComponent;
  // @ViewChild('globalFilters', { static: true }) globalFilters: FilterComponent;
  gridConfigurationForm: FormGroup;
  gridVO = new Grid();
  gridNameReadOnlyValue = false;
  tableNameReadOnlyValue = false;
  deletedIDList: string[] = [];
  deletedPermanentFilterList: string[] = [];
  deletedGlobalFilterList: string[] = [];
  hideFilterableOption = true;
  hideUserSpecificGridData = true;
  defaultColumnOptions = [];
  columnList: string[] = [];
  showCheckBoxBoolean = false;
  referesh: false;
  gridId: string;
  toggleIndex: number;
  deletedToggleIndex: number;
  canDeactivateForm: boolean;
  urlData: any;
  passParamsList: string[] = [];
  sortDirectionBoolean = false;
  sortDirectionIndex: number;
  validFilterCheck: any;
  validDefaultColumnCheck: any;
  validPassParamsCheck: any;
  pageNameOptions: Page[];
  pageFields: PageField[];
  pageId: any;
  version: any;
  fieldName: boolean;
  showFieldValues = false;
  fieldsListForMapping: any[] = [];
  fieldListWithDataType: any[] = [];
  gridColumnNames: GridColumnNames[] = [{ label: 'Created By', name: 'created_by', dataType: 'string' },
  { label: 'Tenant Id', name: 'tenant_id', dataType: 'string' },
  { label: 'Created On', name: 'created_on', dataType: 'date' },
  { label: 'Modified By', name: 'modified_by', dataType: 'string' },
  { label: 'Modified On', name: 'modified_on', dataType: 'date' }];


  ngOnInit() {
    this.initialize();
    this.loadPageName();
    // this.loadFieldName(0);
    this.getBuiltInFields();
    if (this.id !== null && this.id !== undefined) {
      this.receiveMessage(this.id);
    }
    this.gridConfigurationForm.get('defaultNoOfRows').setValue('10');
    this.gridConfigurationForm.get('widthPercentage').setValue(100);
    this.gridConfigurationForm.get('filterable').setValue(true);

    this.formValueChange();
    if (this.gridConfigurationForm.touched === false) {
      this.canDeactivateForm = false;
    }
  }

  getBuiltInFields() {
    this.service.getBuiltInFields().subscribe(data => {
      this.fieldsListForMapping = data;
      if (this.gridVO.userSpecificGridData === true) {
        this.showFieldValues = true;
        this.fieldsListForMapping.forEach(params => {
          if (params.fieldId === this.gridVO.fieldValues) {
            this.gridConfigurationForm.get('dataType').setValue(params.dataType);
          }
        });
        this.gridConfigurationForm.get('fieldValues').setValue(this.gridVO.fieldValues);
      }
    });
  }

  initialize() {
    this.gridConfigurationForm = this.fb.group({
      gridId: [this.gridVO.gridId],
      pageName: ['', [Validators.required]],
      gridName: [this.gridVO.gridName, [Validators.required]],
      moduleName: [this.gridVO.moduleName],
      widthPercentage: [this.gridVO.widthPercentage, [Validators.required, Validators.min(10), Validators.max(100)]],
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
      // permanentFilterColumns: this.fb.array([

      // ]),
      // globalFilterColumns: this.fb.array([
      //   this.addGlobalFilterFormGroup()
      // ])
    });
    // if (this.gridVO) {
    //   this.gridConfigurationForm.get('gridName').disable();
    //   this.gridConfigurationForm.get('moduleName').disable();
    // } else {
    //   this.gridConfigurationForm.get('gridName').enable();
    //   this.gridConfigurationForm.get('morreduleName').enable();
    // }
  }

  formValueChange() {
    this.gridConfigurationForm.valueChanges.subscribe(data => {
      this.canDeactivateForm = true;
    });
  }

  loadPageName() {
    const pageName = this.gridConfigurationForm.get('pageName');
    pageName.valueChanges.pipe(debounceTime(500)).subscribe(
      () => {
        if (pageName.value !== '' && pageName.value !== null) {
          this.pageService.getAutoCompletePageName(pageName.value, 'N').subscribe(result => {
            this.pageNameOptions = result;
          });
        }
      });
  }

  addGridColumns(i: number) {
    const columnName = this.getGridColumnsArray().get('' + i).get('columnName').value;
    const displayName = this.getGridColumnsArray().get('' + i).get('displayName').value;
    const dataType = this.getGridColumnsArray().get('' + i).get('fieldType').value;
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

  // loadFieldName(i) {
  //   const formArray = (this.gridConfigurationForm.get('gridColumns') as FormArray);
  //   const index = '' + i;
  //   const fieldName = formArray.get(index);
  //   fieldName.get('columnName').valueChanges.pipe(debounceTime(1300)).subscribe(
  //     data => {
  //       if (fieldName.get('columnName').value !== '') {
  //         if (this.pageId !== undefined && this.version !== null && this.version !== '' && this.version !== undefined
  //           && this.pageId !== '' && this.pageId !== null) {
  //           this.pageService.getTargetPageColumns(this.pageId, this.version).subscribe(fieldData => {
  //             this.pageFields = fieldData;
  //             this.loadGridColumnsFromPageOrTable(this.pageFields);
  //           });
  //         } else if (this.pageId !== undefined && (this.version === null || this.version === '')) {
  //           this.pageService.getPageFieldsForGrid(this.pageId).subscribe(fieldData => {
  //             this.pageFields = fieldData;
  //             this.loadGridColumnsFromPageOrTable(this.pageFields);
  //           });
  //         }
  //       }
  //     });
  // }

  loadGridColumnsFromPageOrTable(pageFields) {
    for (let i = 0; i < pageFields.length; i++) {
      if (i > 0) {
        this.addAnotherGridColumn(i);
      }
      const index = '' + i;
      const form = (this.gridConfigurationForm.get('gridColumns') as FormArray).get(index);
      form.get('displayName').setValue(pageFields[i].fieldName);
      form.get('columnName').setValue(pageFields[i].fieldId);
      form.get('columnName').disable();
      if (pageFields[i].datatype === 'string') {
        form.get('fieldType').setValue('text');
      } else {
        form.get('fieldType').setValue(pageFields[i].datatype);
      }
      form.get('columnSequenceNo').setValue(i + 1);
      form.get('widthPercentage').setValue(Math.round(100 / (pageFields.length)));

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
    if (this.gridColumnNames.length === 0) {
      this.gridColumnNames.push({ label: 'Created By', name: 'created_by', dataType: 'string' },
        { label: 'Tenant Id', name: 'tenant_id', dataType: 'string' },
        { label: 'Created On', name: 'created_on', dataType: 'date' },
        { label: 'Modified By', name: 'modified_by', dataType: 'string' },
        { label: 'Modified On', name: 'modified_on', dataType: 'date' });
    } else if (this.gridColumnNames.some(e => e.label !== 'Created By')) {
      this.gridColumnNames.push({ label: 'Created By', name: 'created_by', dataType: 'string' },
        { label: 'Tenant Id', name: 'tenant_id', dataType: 'string' },
        { label: 'Created On', name: 'created_on', dataType: 'date' },
        { label: 'Modified By', name: 'modified_by', dataType: 'string' },
        { label: 'Modified On', name: 'modified_on', dataType: 'date' });
    }
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

  setPageId(option, $event) {
    if ($event.isUserInput === true) {
      this.gridColumnNames = [];
      this.pageFields = [];
      this.gridVO = new Grid();
      this.ngOnInit();
      this.gridConfigurationForm.get('pageName').setValue(option.pageName);
      this.gridConfigurationForm.get('moduleName').setValue(option.pageIdWithPrefix);
      this.gridConfigurationForm.get('pageName').setValidators(null);
      this.gridConfigurationForm.get('pageName').setErrors(null);
      this.gridConfigurationForm.get('pageName').updateValueAndValidity();
      this.pageId = option.pageId;
      this.version = option.version;
      if (this.pageId !== undefined) {
        this.pageService.getPageFieldsForGrid(this.pageId).subscribe(fieldData => {
          this.pageFields = fieldData;
          this.loadGridColumnsFromPageOrTable(this.pageFields);
        });
      }
    }

  }

  getFieldNames(): FieldName[] {
    const formArray = this.gridConfigurationForm.get('gridColumns') as FormArray;
    // tslint:disable-next-line: prefer-const
    let fieldNames: FieldName[] = [];
    for (let i = 0; i < formArray.length; i++) {
      const name = formArray.get('' + i).get('columnName').value;
      if (name !== null && name !== undefined && name !== '') {
        fieldNames.push({ index: i, value: name });
      }
    }
    return fieldNames;
  }

  setGridColumnName(columnIndex) {
    this.addGridColumns(columnIndex);
  }

  setColumnName(columnIndex) {
    const formArray = this.gridConfigurationForm.get('gridColumns') as FormArray;
    const group = this.gridConfigurationForm.get('gridColumns').get('' + columnIndex);
    const value = group.get('columnName').value;
    const fieldNames: FieldName[] = this.getFieldNames();
    for (let i = 0; i < formArray.length; i++) {
      const field = formArray.get('' + i).get('columnName');
      if (fieldNames.some(name => (name.index !== columnIndex && name.value === value))) {
        group.get('columnName').setErrors({ unique: true });
      }
      if (field.errors && field.errors.unique === true) {
        if (!fieldNames.some(name => (name.value === field.value && name.index !== i))) {
          field.setErrors(null);
        }
      }
    }
    if (this.pageFields !== undefined && this.pageFields.length > 0 && this.pageFields !== null) {
      if (!this.pageFields.some(pageField => pageField.fieldId === value)) {
        group.get('columnName').setErrors({ columnNameRequired: true });
      }
    }
  }

  setFieldName($event, fieldName, fieldId, i) {
    if ($event.isUserInput) {
      const formArray = (this.gridConfigurationForm.get('gridColumns') as FormArray);
      const index = '' + i;
      const gridColumnForm = formArray.get(index);
      gridColumnForm.get('columnName').setValue(fieldName);
    }
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

  getGridColumnsArray() {
    return (this.gridConfigurationForm.get('gridColumns') as FormArray);
  }

  addGridColumnFormGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      columnName: ['', Validators.required],
      displayName: ['', Validators.required],
      sortable: [true],
      widthPercentage: ['', [Validators.required, Validators.min(10), Validators.max(100)]],
      filterable: [''],
      fieldType: ['', Validators.required],
      columnSequenceNo: ['', Validators.required],
      hiddenValue: [''],
      defaultSortableColumn: [''],
      passParams: [''],
      asc: [''],
      desc: [''],
      dateTimeFormat: [''],
    });
  }

  getDataType(event, dataType) {
    if (event.isUserInput) {
      this.showFieldValues = false;
      this.gridConfigurationForm.get('fieldValues').setValue(null);
      if (dataType === 'text') {
        dataType = 'string';
      }
      this.gridConfigurationForm.get('dataType').setValue(dataType);
      this.showFieldValues = true;
    }
  }

  addPermanentFilterFormGroup(): FormGroup {
    return this.fb.group({
      filterId: [''],
      filterName: ['', Validators.required],
      operator: ['', Validators.required],
      filterType: ['P'],
      filterValue: ['', Validators.required]
    });
  }

  addGlobalFilterFormGroup(): FormGroup {
    return this.fb.group({
      filterId: [''],
      filterName: ['', Validators.required],
      operator: ['', Validators.required],
      filterType: ['G'],
      filterValue: ['', Validators.required]
    });
  }


  addAnotherPermanentFilterFormGroup() {
    const formArray = (this.gridConfigurationForm.get('permanentFilterColumns') as FormArray);
    formArray.push(this.addPermanentFilterFormGroup());
  }

  removePermanentFilterGroup(i: number) {
    const form = (this.gridConfigurationForm.get('permanentFilterColumns') as FormArray);
    const index = '' + i;
    const deletedID = form.get(index).get('filterId').value;
    if (deletedID !== null && deletedID !== '') {
      this.deletedPermanentFilterList.push(deletedID);
      this.gridConfigurationForm.markAsDirty();
    }
    form.removeAt(i);
  }

  addAnotherGlobalFilterFormGroup() {
    const formArray = (this.gridConfigurationForm.get('globalFilterColumns') as FormArray);
    formArray.push(this.addGlobalFilterFormGroup());
  }

  removeGlobalFilterGroup(i: number) {
    const form = (this.gridConfigurationForm.get('globalFilterColumns') as FormArray);
    const index = '' + i;
    const deletedID = form.get(index).get('filterId').value;
    if (deletedID !== null && deletedID === '') {
      this.deletedGlobalFilterList.push(deletedID);
      this.gridConfigurationForm.markAsDirty();
    }
    form.removeAt(i);
  }


  addAnotherGridColumn(columnIndex) {
    const formArray = (this.gridConfigurationForm.get('gridColumns') as FormArray);
    formArray.push(this.addGridColumnFormGroup());
    // this.loadFieldName(columnIndex);
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
    const columnName = form.get(index).get('columnName').value;
    const displayName = form.get(index).get('displayName').value;
    if (columnName !== null && columnName !== ''
      && displayName !== null && displayName !== '') {
      const removeIndex = this.gridColumnNames.findIndex(x => x.name === columnName);
      if (removeIndex !== -1) {
        this.gridColumnNames.splice(removeIndex, 1);
        if (this.gridVO && this.gridVO.gridId !== null && this.gridVO.gridId !== '' && this.gridVO.gridId !== undefined) {
          this.gridConfigurationForm.get('fieldValues').setValue(null);
        }
      }
    }

    form.removeAt(i);
    this.getColumnValue(event, i);
  }

  omit_number(event) {
    let k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k === 32 || (k >= 48 && k <= 57));
  }

  onSubmit(userForm) {
    this.gridVO = this.gridConfigurationForm.getRawValue();
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
      if (this.gridVO.moduleName === null
        || this.gridVO.moduleName === '' || this.gridVO.moduleName === undefined) {
        this.gridVO.moduleName = this.gridConfigurationForm.get('pageName').value;
      }


      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.gridVO.gridColumns.length; i++) {
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
        if (this.gridVO.gridColumns[i].passParams === true) {
          this.passParamsList.push(this.gridVO.gridColumns[i].columnName);
        }
        this.gridVO.passParams = this.passParamsList.join(',');
      }
      this.service.saveAndUpdateGridData(this.gridVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        if (data.response !== 'Grid Name already exist') {
          // this.gridNameReadOnlyValue = false;
          // this.tableNameReadOnlyValue = false;
          this.gridConfigurationForm.get('gridName').enable();
          this.gridConfigurationForm.get('pageName').enable();
          this.gridConfig.refreshGrid();
          this.canDeactivateForm = false;
          this.reset(userForm);
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
    // this.gridNameReadOnlyValue = false;
    // this.tableNameReadOnlyValue = false;
    this.pageId = '';
    this.pageFields = [];
    this.gridConfigurationForm.get('gridName').enable();
    this.gridConfigurationForm.get('pageName').enable();
    this.hideFilterableOption = true;
    this.gridVO = new Grid();
    this.ngOnInit();
    this.showCheckBoxBoolean = false;
    this.columnList = [];
    this.passParamsList = [];
    this.toggleIndex = undefined;
    this.deletedToggleIndex = null;
    this.gridColumnNames = [];
    userForm.resetForm();
    this.canDeactivateForm = false;
    this.sortDirectionBoolean = false;
  }

  // tslint:disable-next-line: use-lifecycle-interface
  // ngAfterViewInit() {
  //   this.filter.ngOnInit();
  // }

  receiveMessage($event) {
    this.pageFields = [];
    this.pageId = '';
    if ($event.col13 !== undefined) {
      this.gridId = $event.col13;
    } else {
      this.gridId = $event;
    }
    this.service.getRowInfo(this.gridId).subscribe(data => {
      this.gridVO = data;
      this.loadGridColumn(this.gridVO);
      this.getBuiltInFields();
      this.initialize();
      this.gridConfigurationForm.get('pageName').setValue(this.gridVO.moduleName);
      this.loadPageName();
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
        if (this.gridVO.gridColumns[i].fieldType === 'string') {
          this.gridVO.gridColumns[i].fieldType = 'text';
        }
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

        // this.gridNameReadOnlyValue = true;
        // this.tableNameReadOnlyValue = true;
        this.gridConfigurationForm.get('gridName').disable();
        this.gridConfigurationForm.get('pageName').disable();
      }
    });

  }

  loadGridColumn(gridVO) {

    if (this.gridColumnNames.length === 0) {
      this.gridColumnNames.push({ label: 'Created By', name: 'created_by', dataType: 'string' },
        { label: 'Tenant Id', name: 'tenant_id', dataType: 'string' },
        { label: 'Created On', name: 'created_on', dataType: 'date' },
        { label: 'Modified By', name: 'modified_by', dataType: 'string' },
        { label: 'Modified On', name: 'modified_on', dataType: 'date' });
    } else if (this.gridColumnNames.some(e => e.label !== 'Created By')) {
      this.gridColumnNames.push({ label: 'Created By', name: 'created_by', dataType: 'string' },
        { label: 'Tenant Id', name: 'tenant_id', dataType: 'string' },
        { label: 'Created On', name: 'created_on', dataType: 'date' },
        { label: 'Modified By', name: 'modified_by', dataType: 'string' },
        { label: 'Modified On', name: 'modified_on', dataType: 'date' });
    }
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < gridVO.gridColumns.length; i++) {
      const columnName = gridVO.gridColumns[i].columnName;
      const displayName = gridVO.gridColumns[i].displayName;
      const dataType = gridVO.gridColumns[i].fieldType;
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

  setFormControlsValue(form: FormGroup, gridVO: Grid) {
    form.get('gridId').setValue(this.gridVO.gridId);
    form.get('gridName').setValue(this.gridVO.gridName);
    form.get('pageName').setValue(this.gridVO.moduleName);
    form.get('widthPercentage').setValue(this.gridVO.widthPercentage);
    form.get('filterable').setValue(this.gridVO.filterable);
    form.get('gridUrl').setValue(this.gridVO.gridUrl);
    form.get('defaultSortableColumn').setValue(this.gridVO.defaultSortableColumn);
    form.get('showCheckBox').setValue(this.gridVO.showCheckBox);
    form.get('defaultNoOfRows').setValue(this.gridVO.defaultNoOfRows);
    form.get('exportable').setValue(this.gridVO.exportable);
    form.get('gridId').setValue(this.gridVO.gridId);
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

  canDeactivate(): Observable<boolean> | boolean {


    if (this.canDeactivateForm) {
      this.canDeactivateForm = false;
      const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
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


