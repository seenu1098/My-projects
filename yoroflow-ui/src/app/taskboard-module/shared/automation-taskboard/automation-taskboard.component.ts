import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioChange } from '@angular/material/radio';
import { PageFieldVo, PageFieldVO } from 'src/app/designer-module/task-property/page-field-vo';
import { Page } from 'src/app/rendering-module/shared/vo/page-vo';
import { TaskboardVO } from '../../taskboard-configuration/taskboard.model';
import { AutomationServiceService } from '../service/automation-service.service';

@Component({
  selector: 'app-automation-taskboard',
  templateUrl: './automation-taskboard.component.html',
  styleUrls: ['./automation-taskboard.component.scss']
})
export class AutomationTaskboardComponent implements OnInit {

  @Input() taskboardList: TaskboardVO[] = [];
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

  fieldsList: PageFieldVO[];
  arrayFields: PageFieldVO[];
  mappingForm: FormGroup;
  fieldsListForMapping: PageFieldVO[];
  repeatableName: any[] = [];
  repeatableFieldsListsForMapping: any[] = [];
  repeatableFieldsListFormName: any[] = [];
  tableFields: any[] = [];
  initialFieldList: PageFieldVo[] = [];
  fieldList: PageFieldVo[] = [];
  showList = true;
  showSpinner = false;
  boardName: string;
  arrayMappingDetails: any[] = [];
  selectedField: any;
  selectedFormControl: any;
  boardId: string;
  startColumn: string;

  iconList = [
    { type: 'long', icon: 'pin' },
    { type: 'string', icon: 'text_fields' },
    { type: 'float', icon: 'pin' },
    { type: 'date', icon: 'date_range' },
    { type: 'array', icon: 'list_alt' },
    { type: 'time', icon: 'query_builder' }
  ];

  constructor(private automationService: AutomationServiceService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.mappingForm = this.fb.group({
      constantValue: []
    });
    if (this.type === 'create task') {
      this.getTaskboardName(this.taskboardVO);
      this.automationService.getSystemVariables(this.page.pageId, this.page.version).subscribe(fields => {
        const systemVariables = new PageFieldVo();
        systemVariables.fieldVO = fields['System Variables:'];
        systemVariables.fieldVO.forEach(field => field.color = this.getRandomColor());
        systemVariables.fieldType = 'System Variables';
        this.initialFieldList = [];
        this.initialFieldList.push(systemVariables);
      });
    } else {
      this.automationService.getPageFields(this.page.pageId, this.page.version).subscribe(fields => {
        const mainSection = new PageFieldVo();
        const subSection = new PageFieldVo();
        if (fields.mainSection !== undefined && fields.mainSection.length > 0) {
          mainSection.fieldType = 'Main Section Fields';
          fields.mainSection.forEach(field => {
            field.color = this.getRandomColor();
            mainSection.fieldVO.push(field);
          });
        }
        if (fields.subSection !== undefined && fields.subSection.length > 0) {
          subSection.fieldType = fields.subSection[0].repeatableFieldName;
          fields.subSection.forEach(field => {
            field.color = this.getRandomColor();
            subSection.fieldVO.push(field);
          });
          const pageFieldVO = new PageFieldVO();
          pageFieldVO.repeatableFieldId = fields.subSection[0].repeatableFieldId;
          pageFieldVO.repeatableFieldName = fields.subSection[0].repeatableFieldName;
          pageFieldVO.datatype = 'array';
          pageFieldVO.fieldName = fields.subSection[0].repeatableFieldName;
          pageFieldVO.fieldId = fields.subSection[0].repeatableFieldId;
          pageFieldVO.color = this.getRandomColor();
          mainSection.fieldVO.push(pageFieldVO);
        }
        this.initialFieldList.push(mainSection);
        this.initialFieldList.push(subSection);
      });
    }
  }

  getTaskboardName(taskboard: TaskboardVO): void {
    this.boardName = taskboard.name;
    this.boardId = taskboard.id;
    this.startColumn = taskboard.startColumn;
    this.showList = false;
    this.showSpinner = true;
    this.automationService.getPageFieldsByTaskboard(taskboard.id).subscribe(fields => {
      this.showSpinner = false;
      this.fieldsList = fields.mainSection;
      this.arrayFields = fields.subSection;
      const fieldsListsForMapping: PageFieldVO[] = [];
      const repeatableName: any[] = [];
      const repeatableTableName: any[] = [];
      const repaeatableFieldId: any[] = [];
      const repeatableFieldsListsForMapping: any[] = [];
      if (this.fieldsList !== undefined && this.fieldsList.length > 0) {
        this.fieldsList.forEach(field => {
          field.color = this.getRandomColor();
          fieldsListsForMapping.push(field);
          this.mappingForm.addControl(field.fieldId, this.fb.group({
            variableType: ['pagefield'],
            value: []
          }));
        });
      }
      if (this.arrayFields !== undefined && this.arrayFields.length > 0) {
        this.arrayFields.forEach(fieldName => {
          fieldName.color = this.getRandomColor();
          if (!repeatableName.some(filterColumn => filterColumn.repeatableFieldId === fieldName.repeatableFieldId)) {
            repeatableName.push(fieldName);
            fieldsListsForMapping.push(fieldName);
            this.mappingForm.addControl(fieldName.repeatableFieldId, this.fb.control(null));
            repaeatableFieldId.push(fieldName);
            this.mappingForm.addControl(fieldName.repeatableFieldId + 'ya', this.fb.group({}));
          }
          repeatableFieldsListsForMapping.push(fieldName);
          (this.mappingForm.get(fieldName.repeatableFieldId + 'ya') as FormGroup)
            .addControl(fieldName.fieldId, this.fb.group({
              variableType: ['pagefield'],
              value: []
            }));
        });
        this.arrayFields.forEach(field => {
          if (this.mappingForm.get(field.repeatableFieldId) !== null) {
            this.arrayMappingDetails.push({
              fieldName: field.repeatableFieldId,
              value: this.mappingForm.get(field.repeatableFieldId).value
            });
          }
        });
      }
      this.tableFields = fields.tableControl;
      if (this.tableFields !== undefined && this.tableFields.length > 0) {
        this.tableFields.forEach(fieldName => {
          if (!repeatableTableName.some(filterColumn => filterColumn.repeatableFieldId === fieldName.repeatableFieldId)) {
            repeatableTableName.push(fieldName);
            fieldName.color = this.getRandomColor();
            fieldsListsForMapping.push(fieldName);
            this.mappingForm.addControl(fieldName.repeatableFieldId, this.fb.control(null));
          }
        });
      }
      this.fieldsListForMapping = fieldsListsForMapping;
      this.repeatableFieldsListsForMapping = repeatableFieldsListsForMapping;
      this.repeatableFieldsListFormName = repaeatableFieldId;
      if (this.selectedScript.keyValuePair.value && this.selectedScript.keyValuePair.value === this.boardName) {
        this.mappingForm.patchValue(this.selectedScript.keyValuePair.mappingValues);
      }
    });
  }

  getformGroupName(repeatableFieldId): string {
    return repeatableFieldId + 'ya';
  }

  getFieldlabel(field: any): string {
    return field.repeatableFieldName + ' (' + field.fieldName + ')';
  }

  getMainSectionFieldGroup(field: any): string {
    return field.fieldId;
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


  apply(): void {
    this.mappingForm.removeControl('constantValue');
    if (this.type !== 'create task') {
      const boardName = this.boardName;
      const taskDetails = this.mappingForm.getRawValue();
      const emitValue = { taskboardName: boardName, taskDetails, id: this.boardId, startColumn: this.startColumn };
      this.boardDetails.emit(emitValue);
    } else {
      const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.value);
      this.selectedScript.words[index] = this.taskboardName;
      this.selectedScript.keyValuePair.value = this.taskboardName;
      this.selectedScript.keyValuePair.mappingValues = this.mappingForm.getRawValue();
      this.selectedScript.keyValuePair.yorosisPageId = this.page.yorosisPageId;
      this.selectedScript.keyValuePair.boardId = this.taskboardVO.id;
      const column = this.taskboardVO.taskboardColumns.find(c => c.columnOrder === 0);
      this.selectedScript.keyValuePair.startColumn = column.columnName;
      this.boardDetailsEmit.emit(true);
    }
  }

  change(action: string): void {
    if (action === 'next') {
      this.showList = false;
    } else {
      this.showList = true;
    }
  }

  setConstantValue(field: any): void {
    this.mappingForm.get(this.selectedField.fieldId).get('variableType').setValue('constant');
    this.mappingForm.get(this.selectedField.fieldId).get('value').setValue(this.mappingForm.get('constantValue').value);
    this.mappingForm.get('constantValue').setValue('');
    this.mainSectionFieldMenu.closeMenu();
  }

  setPageFieldValue(value: any): void {
    this.mappingForm.get(this.selectedField.fieldId).get('variableType').setValue('pagefield');
    this.mappingForm.get(this.selectedField.fieldId).get('value').setValue(value);
    this.mainSectionFieldMenu.closeMenu();
    this.mappingForm.get('constantValue').setValue('');
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
    this.mappingForm.get(this.selectedField.repeatableFieldId + 'ya').get(this.selectedField.fieldId).get('variableType').setValue('constant');
    this.mappingForm.get(this.selectedField.repeatableFieldId + 'ya')
    .get(this.selectedField.fieldId).get('value').setValue(this.mappingForm.get('constantValue').value);
    this.mappingForm.get('constantValue').setValue('');
    this.subSectionFieldsMenu.closeMenu();
  }

  getValue(controlValue: any): string {
    let value = '';
    if (controlValue.variableType) {
      if (controlValue.variableType === 'pagefield') {
        this.initialFieldList.forEach(type => {
          type.fieldVO.forEach(field => {
            if (field.fieldId === controlValue.value) {
              value = field.fieldName;
            }
          });
        });
      } else {
        value = controlValue.value;
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
      type.fieldVO.forEach(f => {
        if (this.selectedField.datatype === 'string') {
          if (f.datatype !== 'date' && f.datatype !== 'array') {
            fieldList.fieldVO.push(f);
          }
        } else if (this.selectedField.datatype === f.datatype) {
          fieldList.fieldVO.push(f);
        }
      });
    });
  }

  getConstantValue(field: any): void {
    if (this.mappingForm.get(field.fieldId).get('variableType').value === 'constant') {
      this.mappingForm.get('constantValue').setValue(this.mappingForm.get(field.fieldId).get('value').value);
    } else {
      this.mappingForm.get('constantValue').setValue('');
    }
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
    if (this.mappingForm.get(field.fieldId).get('variableType').value === 'constant') {
      this.mappingForm.get('constantValue').setValue(this.mappingForm.get(field.fieldId).get('value').value);
    }
    this.fieldList = this.initialFieldList;
    this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
    this.initialFieldList.forEach(type => {
      const fieldList = this.fieldList.find(f => f.fieldType === type.fieldType);
      fieldList.fieldVO = [];
      type.fieldVO.forEach(f => {
        if (this.selectedField.datatype === 'string') {
          if (f.datatype !== 'date' && f.datatype !== 'array') {
            fieldList.fieldVO.push(f);
          }
        } else if (this.selectedField.datatype === f.datatype) {
          fieldList.fieldVO.push(f);
        }
      });
    });
  }

  getIcon(field: any): string {
    let icon = '';
    this.iconList.forEach(data => {
      if (data.type === field.datatype) {
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
    if (this.selectedField.datatype === 'string') {
      fieldType = 'text';
    } else if (this.selectedField.datatype === 'long' || this.selectedField.datatype === 'float') {
      fieldType = 'number';
    } else if (this.selectedField.datatype === 'date') {
      fieldType = 'date';
    }
    return fieldType;
  }
}
