import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { F } from 'ngx-tethys/util';
import { PageFieldVo, PageFieldVO } from 'src/app/designer-module/task-property/page-field-vo';
import { Page } from 'src/app/rendering-module/shared/vo/page-vo';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { TaskboardVO } from '../../taskboard-configuration/taskboard.model';
import { ConfirmationDialogComponent } from '../../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { AutomationServiceService } from '../service/automation-service.service';
import { DataTableColumnsVO, DataTableVO } from './data-table-model';

export class FieldName {
  index: number;
  value: string;
}

@Component({
  selector: 'app-automation-data-table',
  templateUrl: './automation-data-table.component.html',
  styleUrls: ['./automation-data-table.component.scss']
})
export class AutomationDataTableComponent implements OnInit {
  @Input() page = new Page();
  @Input() taskboardName: string;
  @Input() type: string;
  @Input() selectedScript: any;
  @Input() taskboardVO = new TaskboardVO();
  @Output() boardDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() boardDetailsEmit: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('menuTrigger1') mainSectionFieldMenu;
  @ViewChild('menuTrigger2') repeatableNameMenu;
  @ViewChild('menuTrigger3') subSectionFieldsMenu;
  @ViewChild('fieldMenuTrigger') filterMenu;

  fieldsList: DataTableColumnsVO[];
  arrayFields: PageFieldVO[];
  mappingForm: FormGroup;
  fieldsListForMapping: DataTableColumnsVO[];
  repeatableName: any[] = [];
  repeatableFieldsListsForMapping: any[] = [];
  repeatableFieldsListFormName: any[] = [];
  tableFields: any[] = [];
  initialFieldList: any[] = [];
  fieldList: PageFieldVo[] = [];
  showList = true;
  showSpinner = false;
  dataTableName: string;
  arrayMappingDetails: any[] = [];
  selectedField: any;
  selectedFormControl: any;
  boardId: string;
  startColumn: string;
  dataTables: DataTableVO[] = [];
  taskPropertyForm: FormGroup;
  fieldNames: FieldName[] = [];
  enableFilterSortLimit = false;
  orderFilterNames: string[] = [];
  whereFilterCondition: any;
  tableAndFilterName: any;
  orderFieldNames: string[] = [];
  filterOperatorValue: any;
  whereFilterValue: any;
  duplicateFilters: boolean;
  enablePageFieldForFilter = false;
  enableConstantForFilter = false;
  enableFiltersButton = true;
  selectedChildIndex: any;
  selectedParentIndex: any;
  changedDataType: any;

  iconList = [
    { type: 'long', icon: 'pin' },
    { type: 'string', icon: 'text_fields' },
    { type: 'float', icon: 'pin' },
    { type: 'date', icon: 'date_range' },
    { type: 'array', icon: 'list_alt' },
    { type: 'time', icon: 'query_builder' },
    { type: 'timestamp', icon: 'schedule' }
  ];

  filterOperator =
    [{ value: '=', description: '=' },
    { value: '!=', description: '!=' },
    { value: 'IN', description: 'IN' },
    { value: 'NOT IN', description: 'NOT IN' },
    { value: 'IS NULL', description: 'IS NULL' },
    { value: 'IS NOT NULL', description: 'IS NOT NULL' },
    ];

  constructor(private automationService: AutomationServiceService, private datePipe: DatePipe,
    private fb: FormBuilder, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.automationService.getDataTables().subscribe(data => {
      this.dataTables = data;
      if (this.selectedScript?.keyValuePair?.value && this.selectedScript?.keyValuePair?.value !== 'something') {
        this.getDataTableName(this.dataTables.find(d => d.tableName === this.selectedScript?.keyValuePair?.value));
      }
    });
    this.mappingForm = this.fb.group({
      constantValue: []
    });
    this.taskPropertyForm = this.fb.group({
      actionType: [this.selectedScript.keyValuePair.automationSubType, [Validators.required]],
      // tableName: ['', [Validators.required]],
      whereClause: this.fb.array([this.whereClauseFormGroup()]),
      constantValue: []
    });
    this.automationService.getDataTablePageFields(this.page.pageId, this.page.version).subscribe(fields => {
      this.initialFieldList = fields;
      this.initialFieldList.forEach(field => {
        field.fieldVO.forEach(fieldVO => {
          fieldVO.color = this.getRandomColor();
        });
      });
    });
  }

  getDataTableName(dataTable: DataTableVO): void {
    this.dataTableName = dataTable.tableName;
    this.showList = false;
    this.showSpinner = true;
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.value);
    this.selectedScript.words[index] = this.dataTableName;
    this.selectedScript.keyValuePair.value = this.dataTableName;
    this.selectedScript.keyValuePair.tableIdentifier = dataTable.tableIdentifier;
    this.automationService.getDataTableColumns(dataTable.tableObjectId).subscribe(fields => {
      this.showSpinner = false;
      this.fieldsList = fields;
      const fieldsListsForMapping: DataTableColumnsVO[] = [];
      const repeatableName: any[] = [];
      const repeatableTableName: any[] = [];
      const repaeatableFieldId: any[] = [];
      const repeatableFieldsListsForMapping: any[] = [];
      if (this.fieldsList !== undefined && this.fieldsList.length > 0) {
        this.fieldsList.forEach(field => {
          field.color = this.getRandomColor();
          fieldsListsForMapping.push(field);
          if (this.selectedScript.keyValuePair.automationSubType !== 'delete') {
            this.mappingForm.addControl(field.columnIdentifier, this.fb.group({
              variableType: ['pagefield'],
              value: ['', [field.isRequired === 'true'
                ? Validators.required : Validators.nullValidator]]
            }));
          }
        });
      }
      this.fieldsListForMapping = fieldsListsForMapping;
      this.repeatableFieldsListsForMapping = repeatableFieldsListsForMapping;
      this.repeatableFieldsListFormName = repaeatableFieldId;
      if (this.selectedScript.keyValuePair.value && this.selectedScript.keyValuePair.automationSubType !== 'delete'
        && this.selectedScript.keyValuePair.value === this.dataTableName) {
        this.mappingForm.patchValue(this.selectedScript.keyValuePair.mappingValues);
      }
      if (this.selectedScript.keyValuePair.filterValues && this.selectedScript.keyValuePair.filterValues.length > 0) {
        this.loadWhereClause();
      }
    });
  }

  removeInsertField(columnIdentifier, i) {
    if (this.mappingForm.get(columnIdentifier)) {
      const dialog = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        width: '400px',
        data: { type: 'data-table-automation-update' }
      });
      dialog.afterClosed().subscribe(data => {
        if (data === true) {
          this.fieldsListForMapping.splice(i, 1);
          this.mappingForm.removeControl(columnIdentifier);
        }
      });
    }
  }

  loadWhereClause(): void {
    const whereClauseArray: any[] = this.selectedScript.keyValuePair.filterValues;
    if (whereClauseArray && whereClauseArray.values) {
      for (let i = 0; i < whereClauseArray.length; i++) {
        const index = '' + i;
        if (i > 0) {
          this.addDBTaskWhereClauseFormGroup();
        }
        const whereClause = (this.getDBTaskwhereClauseFormarray().get(index) as FormGroup);
        const whereClauseFilterValuesArray: any[] = this.selectedScript.keyValuePair.filterValues[i].filtersInsideCondition;
        if (whereClauseFilterValuesArray.values) {
          for (let j = 0; j < whereClauseFilterValuesArray.length; j++) {
            const filterIndex = '' + j;
            if (j > 0) {
              this.getDBTaskfiltersInsideConditionFormarray(i).push(this.filterValuesFormGroup());
            }
            const filtersInsideCondition = (this.getDBTaskfiltersInsideConditionFormarray(i).get(filterIndex) as FormGroup);
            filtersInsideCondition.setValue(whereClauseFilterValuesArray[j]);
            filtersInsideCondition.updateValueAndValidity();
          }
        }
        whereClause.setValue(whereClauseArray[i]);
      }
    }
  }

  getformGroupName(repeatableFieldId): string {
    return repeatableFieldId + 'ya';
  }

  getFieldlabel(field: any): string {
    return field.repeatableFieldName + ' (' + field.fieldName + ')';
  }

  getMainSectionFieldGroup(field: any): string {
    return field.columnIdentifier;
  }

  getSubSectionFieldGroup(field: any): string {
    return field.fieldId;
  }

  variableTypeChange(event: MatRadioChange, field: any): void {
    if (event.value === 'constant') {
      this.mappingForm.get(field.fieldId).get('variableType').setValue('constant');
      this.mappingForm.get(field.fieldId).get('value').setValue(null);
    } else {
      this.mappingForm.get(field.fieldId).get('variableType').setValue('pagefield');
      this.mappingForm.get(field.fieldId).get('value').setValue(null);
    }
  }

  subSectionVariableTypeChange(event: MatRadioChange, repeatableFieldId: string, field: any): void {
    if (event.value === 'constant') {
      this.mappingForm.get(repeatableFieldId).get(field.fieldId).get('variableType').setValue('constant');
      this.mappingForm.get(repeatableFieldId).get(field.fieldId).get('value').setValue(null);
    } else {
      this.mappingForm.get(repeatableFieldId).get(field.fieldId).get('variableType').setValue('pagefield');
      this.mappingForm.get(repeatableFieldId).get(field.fieldId).get('value').setValue(null);
    }
  }

  setDefaultArrayFields(repeatableField: AbstractControl, repeatableId) {
    const fieldValue = repeatableField.value;
    const repeatableFieldId = repeatableId;
    this.arrayMappingDetails.forEach(fieldName => {
      this.arrayFields.forEach(deleteField => {
        this.mappingForm.get(repeatableFieldId + 'ya').get(deleteField.fieldId).get('variableType').setValue('pagefield');
      });
      if (fieldName.fieldName === repeatableFieldId && fieldName.value !== '') {
        this.arrayFields.forEach(deleteField => {
          this.mappingForm.get(repeatableFieldId + 'ya').get(deleteField.fieldId).get('variableType').setValue('pagefield');
          if (this.mappingForm.get(repeatableFieldId + 'ya').get(deleteField.fieldId) !== null) {
            this.mappingForm.get(repeatableFieldId + 'ya').get(deleteField.fieldId).get('value').setValue(null);
            const removeIndex = this.arrayMappingDetails.findIndex(x => x.fieldName === repeatableFieldId);
            if (removeIndex !== -1) {
              this.arrayMappingDetails.splice(removeIndex, 1);
            }
          }
        });
      }
    });
    this.arrayMappingDetails.push({ fieldName: repeatableFieldId, value: repeatableField.value });
    if (this.arrayFields !== undefined && this.arrayFields.length > 0) {
      if (this.mappingForm.get(repeatableFieldId).value !== null
        && this.mappingForm.get(repeatableFieldId).value !== '' && fieldValue === repeatableFieldId) {
        let isdefaultValueSet = false;
        this.arrayFields.forEach(fieldName => {
          if (fieldName.repeatableFieldId === fieldValue) {
            this.initialFieldList.forEach(initialValues => {
              if (initialValues.fieldType === fieldName.repeatableFieldName) {
                initialValues.fieldVO.forEach(initialFields => {
                  if (fieldName.fieldId === initialFields.fieldId) {
                    if (this.mappingForm.get(fieldName.repeatableFieldId + 'ya').get(fieldName.fieldId).get('value') !== null) {
                      this.mappingForm.get(fieldName.repeatableFieldId + 'ya').get(fieldName.fieldId).get('value')
                        .setValue(fieldName.fieldId);
                      const removeIndex = this.arrayMappingDetails.findIndex(x => x.fieldName === repeatableFieldId);
                      if (removeIndex !== -1) {
                        isdefaultValueSet = true;
                        this.arrayMappingDetails.splice(removeIndex, 1);
                      }
                      this.arrayMappingDetails.push({ fieldName: repeatableFieldId, value: repeatableField.value });
                    }
                  }
                });
              }
            });
          }
        });
        if (!isdefaultValueSet) {
          this.arrayMappingDetails.forEach(fieldName => {
            if (fieldName.fieldName === repeatableFieldId && fieldName.value !== '') {
              this.arrayFields.forEach(deleteField => {
                if (this.mappingForm.get(repeatableFieldId + 'ya').get(deleteField.fieldId) !== null) {
                  this.mappingForm.get(repeatableFieldId + 'ya').get(deleteField.fieldId).get('value').setValue(null);
                  const removeIndex = this.arrayMappingDetails.findIndex(x => x.fieldName === repeatableFieldId);
                  if (removeIndex !== -1) {
                    this.arrayMappingDetails.splice(removeIndex, 1);
                  }
                }
              });
            }
          });
        }
      }
    }
  }

  getToolTip(value: string, type: string): string {
    let toolTip = '';
    this.initialFieldList?.forEach(fieldVo => {
      fieldVo.fieldVO?.forEach(fieldValues => {
        if (type === 'normalField' && fieldValues.fieldId === value) {
          toolTip = fieldValues.fieldName;
        }
        if (type === 'repeatableField' && fieldValues.repeatableFieldId === value) {
          toolTip = fieldValues.repeatableFieldName;
        }
      });
    });
    return toolTip;
  }

  checkInsertField() {
    let allow = true;
    if (this.taskPropertyForm.get('actionType').value === 'update') {
      this.fieldsListForMapping.forEach(data => {
        if (this.mappingForm.get(data.columnIdentifier) && (this.mappingForm.get(data.columnIdentifier).get('value').value === null ||
          this.mappingForm.get(data.columnIdentifier).get('value').value === '')) {
          allow = false;
        }
      });
    }
    if (!allow) {
      const dialog = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        width: '400px',
        data: { type: 'data-table-automation-update-allow' }
      });
      dialog.afterClosed().subscribe(data => {
        if (data === true) {
          this.applySave();
        }
      });
    } else {
      this.applySave();
    }
  }

  apply(): void {
    if (this.mappingForm.valid && this.taskPropertyForm.valid) {
      this.checkInsertField();
    }
  }

  applySave() {
    this.mappingForm.removeControl('constantValue');
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.value);
    this.selectedScript.words[index] = this.dataTableName;
    this.selectedScript.keyValuePair.value = this.taskboardName;
    this.selectedScript.keyValuePair.mappingValues = this.mappingForm.getRawValue();
    this.selectedScript.keyValuePair.filterValues = this.taskPropertyForm.get('whereClause').value;
    this.selectedScript.keyValuePair.value = this.dataTableName;
    this.boardDetailsEmit.emit(true);
  }

  change(action: string): void {
    if (action === 'next') {
      this.showList = false;
    } else {
      this.showList = true;
    }
  }

  setConstantValue(field: any): void {
    this.mappingForm.get(this.selectedField.columnIdentifier).get('variableType').setValue('constant');
    this.mappingForm.get(this.selectedField.columnIdentifier).get('value')
      .setValue(this.changeDatatypeValue(this.mappingForm.get('constantValue').value, field.dataType));
    this.mappingForm.get('constantValue').setValue('');
    this.mainSectionFieldMenu.closeMenu();
  }

  setConstantValueForFilter(selectedField: any): void {
    this.taskPropertyForm.get('whereClause').get('' + this.selectedParentIndex)
      .get('filtersInsideCondition').get('' + this.selectedChildIndex).get('filterFieldVariableType').setValue('constant');
    this.taskPropertyForm.get('whereClause').get('' + this.selectedParentIndex)
      .get('filtersInsideCondition').get('' + this.selectedChildIndex).get('filterValue')
      .setValue(this.taskPropertyForm.get('constantValue').value);
    this.taskPropertyForm.get('constantValue').setValue('');
    this.filterMenu.closeMenu();
  }

  setPageFieldValue(value: any, fieldType: string): void {
    let type: string;
    if (fieldType === 'System Variables:') {
      type = 'systemVariables';
    } else if (fieldType === 'Custom Attributes:') {
      type = 'customAttributes';
    } else {
      type = 'pagefield';
    }
    this.mappingForm.get(this.selectedField.columnIdentifier).get('variableType').setValue(type);
    this.mappingForm.get(this.selectedField.columnIdentifier).get('value').setValue(value);
    this.mainSectionFieldMenu.closeMenu();
    this.mappingForm.get('constantValue').setValue('');
  }

  setPageFieldValueForFilter(value: any, fieldType: string): void {
    let type: string;
    if (fieldType === 'System Variables:') {
      type = 'systemVariables';
    } else if (fieldType === 'Custom Attributes:') {
      type = 'customAttributes';
    } else {
      type = 'pagefield';
    }
    this.taskPropertyForm.get('whereClause').get('' + this.selectedParentIndex)
      .get('filtersInsideCondition').get('' + this.selectedChildIndex).get('filterFieldVariableType').setValue(type);
    this.taskPropertyForm.get('whereClause').get('' + this.selectedParentIndex)
      .get('filtersInsideCondition').get('' + this.selectedChildIndex).get('filterValue').setValue(value);
    this.filterMenu.closeMenu();
    this.taskPropertyForm.get('constantValue').setValue('');
  }

  setRepeatableFieldValue(value: any): void {
    this.mappingForm.get(this.selectedField.repeatableFieldId).setValue(value);
    this.repeatableNameMenu.closeMenu();
    this.mappingForm.get('constantValue').setValue('');
    this.setDefaultArrayFields(this.mappingForm.get(this.selectedField.repeatableFieldId), this.selectedField.repeatableFieldId);
  }

  setRepeatablePageFieldValue(value: any): void {
    this.mappingForm.get(this.selectedField.repeatableFieldId + 'ya').get(this.selectedField.fieldId).get('variableType').setValue('pagefield');
    this.mappingForm.get(this.selectedField.repeatableFieldId + 'ya').get(this.selectedField.fieldId).get('value').setValue(value);
    this.subSectionFieldsMenu.closeMenu();
    this.mappingForm.get('constantValue').setValue('');
  }

  setRepetableConstantValue(field: any): void {
    this.mappingForm.get(this.selectedField.repeatableFieldId + 'ya')
      .get(this.selectedField.fieldId).get('variableType').setValue('constant');
    this.mappingForm.get(this.selectedField.repeatableFieldId + 'ya')
      .get(this.selectedField.fieldId).get('value').setValue(this.mappingForm.get('constantValue').value);
    this.mappingForm.get('constantValue').setValue('');
    this.subSectionFieldsMenu.closeMenu();
  }

  getValue(controlValue: any, dataType): string {
    let value = '';
    if (controlValue.variableType) {
      if (controlValue.variableType === 'pagefield' || controlValue.variableType === 'systemVariables'
        || controlValue.variableType === 'customAttributes') {
        this.initialFieldList.forEach(type => {
          type.fieldVO.forEach(field => {
            if (field.fieldId === controlValue.value) {
              value = field.fieldName;
            }
          });
        });
      } else {
        value = this.changeDatatypeValue(controlValue.value, dataType);
      }
    }
    return value;
  }

  getRepeatableFieldValue(control: AbstractControl): string {
    let value = '';
    if (control.value) {
      this.initialFieldList.forEach(type => {
        type.fieldVO.forEach(field => {
          if (field.fieldId === control.value) {
            value = field.fieldName;
          }
        });
      });
    }
    return value;
  }

  repeatableFieldMousedown(field: any, repeatableFieldId: string): void {
    this.selectedField = field;
    if (this.mappingForm.get(repeatableFieldId + 'ya').get(field.fieldId).get('variableType').value === 'constant') {
      this.mappingForm.get('constantValue').setValue(this.mappingForm.get(field.fieldId).get('value').value);
    }
    this.fieldList = this.initialFieldList;
    this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
    this.initialFieldList.forEach(type => {
      const fieldList = this.fieldList.find(f => f.fieldType === type.fieldType);
      fieldList.fieldVO = [];
      type.fieldVO.forEach(field => {
        if (this.selectedField.dataType === 'string') {
          if (field.datatype !== 'date' && field.datatype !== 'timestamp' && field.datatype !== 'array') {
            fieldList.fieldVO.push(field);
          }
        } else if (this.selectedField.dataType === field.datatype) {
          fieldList.fieldVO.push(field);
        }
      });
    });
  }

  getConstantValue(field: any): void {
    if (this.mappingForm.get(field.columnIdentifier).get('variableType').value === 'constant') {
      this.mappingForm.get('constantValue')
        .setValue(this.changeDatatypeValue(this.mappingForm.get(field.columnIdentifier).get('value').value, field.dataType));
    } else {
      this.mappingForm.get('constantValue').setValue('');
    }
  }

  changeDatatypeValue(value, datatype) {
    if (value !== '') {
      if (datatype === 'date') {
        const date1 = new Date(value);
        return this.datePipe.transform(new Date(value), 'yyyy-MM-dd');
        // return dateString;
      }
    }
    return value;
  }

  getRepeatableFieldConstantValue(field: any, repeatableFieldId: string): void {
    if (this.mappingForm.get(repeatableFieldId + 'ya').get(field.fieldId).get('variableType').value === 'constant') {
      this.mappingForm.get('constantValue').setValue(this.mappingForm.get(field.fieldId).get('value').value);
    } else {
      this.mappingForm.get('constantValue').setValue('');
    }
  }

  mousedown(field: any): void {
    this.selectedField = field;
    if (this.mappingForm.get(field.columnIdentifier).get('variableType').value === 'constant') {
      this.mappingForm.get('constantValue').setValue(this.mappingForm.get(field.columnIdentifier).get('value').value);
    }
    this.fieldList = this.initialFieldList;
    this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
    this.initialFieldList.forEach(type => {
      const fieldList = this.fieldList.find(f => f.fieldType === type.fieldType);
      fieldList.fieldVO = [];
      type.fieldVO.forEach(field => {
        if (this.selectedField.dataType === 'string') {
          if (field.datatype !== 'date' && field.datatype !== 'timestamp' && field.datatype !== 'array') {
            fieldList.fieldVO.push(field);
          }
        } else if (this.selectedField.dataType === field.datatype) {
          fieldList.fieldVO.push(field);
        } else if (this.selectedField.dataType === 'timestamp' && field.controlType === 'datetime') {
          fieldList.fieldVO.push(field);
        }
      });
    });
  }

  getIcon(field: any): string {
    let icon = '';
    this.iconList.forEach(data => {
      if (data.type === field.dataType || data.type === field.datatype) {
        icon = data.icon;
      }
    });
    return icon;
  }

  getRandomColor(): string {
    return '#' + ('000000' + Math.floor(Math.random() * 16777216).toString(16)).substr(-6);
  }

  getFieldType(): string {
    let fieldType = '';
    if (this.selectedField.dataType === 'string') {
      fieldType = 'text';
    } else if (this.selectedField.dataType === 'long' || this.selectedField.dataType === 'float') {
      fieldType = 'number';
    } else if (this.selectedField.dataType === 'date') {
      fieldType = 'date';
    }
    return fieldType;
  }


  getDBTaskwhereClauseFormarray() {
    return (this.taskPropertyForm.get('whereClause') as FormArray);
  }

  whereClauseFormGroup() {
    return this.fb.group({
      filterCondition: ['AND'],
      filtersInsideCondition: this.fb.array([this.filterValuesFormGroup()]),
    });
  }

  getDBTaskfiltersInsideConditionFormarray(iw) {
    return (this.taskPropertyForm.controls.whereClause as FormArray).at(iw).get('filtersInsideCondition') as FormArray;
  }

  filterValuesFormGroup() {
    return this.fb.group({
      filterName: ['', [this.selectedScript.keyValuePair.automationSubType === 'insert' ? Validators.nullValidator : Validators.required]],
      filterOperator: ['', [this.selectedScript.keyValuePair.automationSubType === 'insert' ?
        Validators.nullValidator : Validators.required]],
      filterValue: ['', [this.selectedScript.keyValuePair.automationSubType === 'insert' ? Validators.nullValidator : Validators.required]],
      filterFieldVariableType: ['pageFields']
    });
  }

  addDBTaskFiltersInsideConditionFormGroup(i, iw) {
    if (this.getDBTaskfiltersInsideConditionFormarray(iw).length === 0) {
      this.getDBTaskfiltersInsideConditionFormarray(iw).push(this.filterValuesFormGroup());
    } else {
      const filterValidation = this.taskPropertyForm.get('whereClause').get(iw + '').get('filtersInsideCondition');
      if (filterValidation.get(i + '').get('filterName').value === '') {
      }
      if (filterValidation.get(i + '').get('filterOperator').value === '') {

      }
      if (filterValidation.get(i + '').get('filterValue').value === '') {

      }
      if (filterValidation.get(i + '').get('filterName').value !== '' && filterValidation.get(i + '').get('filterOperator').value !== ''
        && filterValidation.get(i + '').get('filterValue').value !== '') {
        this.getDBTaskfiltersInsideConditionFormarray(iw).push(this.filterValuesFormGroup());
      }
    }
  }

  removeFiltersInsideCondition(i, iw) {
    this.getDBTaskfiltersInsideConditionFormarray(iw).removeAt(i);
    this.orderFilterNames.splice(i, 1);
    this.buildQuery();
    if (this.getDBTaskfiltersInsideConditionFormarray(iw).length === 0) {
      this.getDBTaskfiltersInsideConditionFormarray(iw).push(this.filterValuesFormGroup());
    }
  }

  addDBTaskWhereClauseFormGroup() {
    this.getDBTaskwhereClauseFormarray().push(this.whereClauseFormGroup());
  }

  removeWhereClause(i) {
    this.getDBTaskwhereClauseFormarray().removeAt(i);
    this.orderFilterNames.splice(i, 1);
    this.buildQuery();
    if (this.orderFilterNames.length === 0 && i === 0) {
      this.getDBTaskwhereClauseFormarray().push(this.whereClauseFormGroup());
    }
  }

  getQueryFormControl() {
    return this.taskPropertyForm.get('query') as AbstractControl;
  }

  getFieldNames(): FieldName[] {
    // tslint:disable-next-line: prefer-const
    let fieldNames: FieldName[] = [];
    for (let i = 0; i < this.fieldsList.length; i++) {
      const name = this.fieldsList[i].columnName;
      if (name !== null && name !== undefined && name !== '') {
        fieldNames.push({ index: i, value: name });
      }
    }
    return fieldNames;
  }

  addFilterByQueryInfo(i) {
    this.orderFilterNames.forEach(filter => {
      if (filter === this.tableAndFilterName + ' ' + this.filterOperatorValue + ' ' + '\'' + this.whereFilterValue + '\''
        || filter === this.tableAndFilterName + ' ' + this.filterOperatorValue + ' ' + this.whereFilterValue) {
        this.duplicateFilters = true;
      }
    }
    );
    if (this.duplicateFilters) {
      this.snackbarForDBTask('Duplicate filter');
    }
    if (!this.duplicateFilters) {
      this.duplicateFilters = false;
      if (this.enableConstantForFilter) {
        this.orderFilterNames.push(' ' + this.whereFilterCondition + ' ' + this.tableAndFilterName + ' ' +
          this.filterOperatorValue + ' ' + '\'' + this.whereFilterValue + '\'');
        this.buildQuery();
      }
      if (this.enablePageFieldForFilter) {
        this.orderFilterNames.splice(+i, 1, (' ' + this.whereFilterCondition + ' ' +
          this.tableAndFilterName + ' ' + this.filterOperatorValue + ' ' + this.whereFilterValue));
        this.buildQuery();
      }
    }
    this.enableFilterButton();
  }


  buildQuery() {
    this.getQueryFormControl().setValue('');
    if ((this.taskPropertyForm.get('actionType').value && this.fieldNames.length > 0 && this.taskPropertyForm.get('tableName').value)
      || (this.taskPropertyForm.get('actionType').value === 'delete')) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.dataTableName + '');
      this.enableFilterSortLimit = true;
    }

    if (this.enableFilterSortLimit && this.orderFilterNames.length > 0) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.dataTableName + ' WHERE ' + this.orderFilterNames.join('') + '');
    }

    if (this.enableFilterSortLimit && this.orderFieldNames.length > 0) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.dataTableName + ' ORDER BY ' + this.orderFieldNames.join(',') + '');
    }

    if (this.enableFilterSortLimit && this.orderFilterNames.length > 0 && this.orderFieldNames.length > 0) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.dataTableName + ' WHERE ' + this.orderFilterNames.join('') +
        ' ORDER BY ' + this.orderFieldNames.join(',') + '');
    }

    if (this.enableFilterSortLimit && this.orderFilterNames.length > 0 && this.taskPropertyForm.get('limit').value) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.dataTableName + ' WHERE ' + this.orderFilterNames.join('') + ' LIMIT ' + this.taskPropertyForm.get('limit').value
        + '');
    }

    if (this.enableFilterSortLimit && this.orderFilterNames.length > 0 && this.orderFieldNames.length > 0
      && this.taskPropertyForm.get('limit').value) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.dataTableName + ' WHERE ' + this.orderFilterNames.join('') + ' ORDER BY ' +
        this.orderFieldNames.join(',') + ' LIMIT ' + this.taskPropertyForm.get('limit').value + '');
    }
  }

  filterCondition(event, i) {
    const value = event.source.value;
    if (event.isUserInput === true && value) {
      this.getDBTaskwhereClauseFormarray().get('' + i).get('filterCondition').setValue(value);
      this.whereFilterCondition = value;
      // this.enableFilterButton();
    }
  }

  orderFilterName($event, dataType, tableName, i, iw, fieldType) {
    this.changedDataType = dataType;
    const value = $event.source.value;
    if ($event.isUserInput === true && value) {
      this.getDBTaskfiltersInsideConditionFormarray(iw).get('' + i).get('filterName').setValue(value);
      this.tableAndFilterName = tableName + '.' + value;
      // this.enableFilterButton();
      this.whereClauseValidation(i, iw);
    }
  }

  whereClauseValidation(i, iw) {
    // const filterName = this.getDBTaskfiltersInsideConditionFormarray(iw).get('' + i).get('filterName');
    // const filterValue = this.getDBTaskfiltersInsideConditionFormarray(iw).get('' + i).get('filterValue');
    // const filterOperator = this.getDBTaskfiltersInsideConditionFormarray(iw).get('' + i).get('filterOperator');
    // if (filterName.value === '' && (filterValue.value !== '' || filterOperator.value !== '')) {
    //   filterName.setErrors({ req: true });
    // }
    // if (filterOperator.value === '' && (filterName.value !== '' || filterValue.value !== '')) {
    //   filterOperator.setErrors({ req: true });
    // }
    // if (filterValue.value === '' && (filterName.value !== '' || filterOperator.value !== '')) {
    //   filterValue.setErrors({ req: true });
    // }
    this.taskPropertyForm.markAsDirty();
  }

  enableFilterButton() {
    if (this.tableAndFilterName && this.filterOperatorValue &&
      this.whereFilterValue) {
      this.enableFiltersButton = false;
    } else {
      this.enableFiltersButton = true;
    }
  }


  snackbarForDBTask(data) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data
    });
  }

  mousedownEventForFilter(field: any, childIndex: number, parentIndex: number, type: string): void {
    this.selectedField = field;
    this.selectedChildIndex = childIndex;
    this.selectedParentIndex = parentIndex;
    if (this.taskPropertyForm.get('whereClause').get('' + this.selectedParentIndex)
      .get('filtersInsideCondition').get('' + this.selectedChildIndex).get('filterFieldVariableType').value === 'constant') {
      this.taskPropertyForm.get('constantValue').setValue(this.taskPropertyForm.get('whereClause').get('' + this.selectedParentIndex).get('filtersInsideCondition').get('' + this.selectedChildIndex).get('filterValue').value);
    }
    this.fieldList = this.initialFieldList;
    this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
    this.initialFieldList.forEach(t => {
      const fieldList = this.fieldList.find(f => f.fieldType === t.fieldType);
      fieldList.fieldVO = [];
      t.fieldVO.forEach(field => {
        if (this.changedDataType === 'string') {
          if (field.datatype !== 'date' && field.datatype !== 'timestamp' && field.datatype !== 'array') {
            fieldList.fieldVO.push(field);
          }
        } else if (this.changedDataType === field.datatype) {
          fieldList.fieldVO.push(field);
        }
      });
    });
  }
}
