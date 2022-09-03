import { Injectable, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { FieldConfig, Row, Section, Table } from '../../vo/page-vo';
import { PageService } from '../page-service';
import { FormValidationService } from './form-validation.service';
import { ChipControlsService } from './chip-controls.service';
import { ChipComponent } from '../../components/chip/chip.component';
import { DateFormatService } from '../../components/date/date-format-service';
import * as moment from 'moment';
import { MAT_DATE_LOCALE } from '@angular/material/core';
@Injectable({

  providedIn: 'root'
})
export class LoadFormService {

  constructor(private pageService: PageService, private fb: FormBuilder, private df: DateFormatService,
    private formValidationService: FormValidationService, private chipService: ChipControlsService) { }
  @Output() signatureValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() tableEmitter: EventEmitter<any> = new EventEmitter<any>();
  sections: Section[];
  public uuid: string;
  chipComponents = [];
  public urlList: any[] = [];
  @Output() updateList: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetEmitter: EventEmitter<any> = new EventEmitter<any>();
  getUUID(): any {
    return this.uuid;
  }

  testsetFormValues(form: FormGroup, object: any, pageIdentifier, allowEdit: boolean, section: Section[], version) {
    if (section) {
      this.loadFormValues(form, object, section, allowEdit);
    } else {
      this.pageService.getPageByPageIdentifier(pageIdentifier, version).subscribe(data => {
        this.sections = data.sections;
        this.loadFormValues(form, object, this.sections, allowEdit);
      });
    }
  }



  loadFormValues(form: FormGroup, jsonObject: any, sections: Section[], allowEdit: boolean) {
    form.get(sections[0].primaryKey).setValue(jsonObject[sections[0].primaryKey]);
    this.disableAndEnableFormFields(allowEdit, form);
    this.disableAndEnableSectionFormFields(allowEdit, form, sections);
    this.chipComponents = this.chipService.chipComponents;
    this.setSectionValues(form, jsonObject, sections, allowEdit);
    // sections.forEach(section => {
    //   if (section.repeatable === null || section.repeatable === false) {
    //     section.rows.forEach(row => {
    //       row.columns.forEach(column => {
    //         const field = column.field;
    //         this.setValueForFormField(form, jsonObject, column);
    //       });
    //     });
    //   } else if (section.repeatable === true && section.repeatableName !== null) {
    //     this.loadFormArrayValues(form, section.repeatableName, jsonObject, section.rows);
    //   }
    //   if (section.sections && section.sections.length > 0) {
    //     this.loadFormValues(form, jsonObject, section.sections, allowEdit);
    //   }
    // });
  }

  setSectionValues(form: FormGroup, jsonObject: any, sections: Section[], allowEdit: boolean) {
    sections.forEach(section => {
      if (section.repeatable === null || section.repeatable === false) {
        section.rows.forEach(row => {
          row.columns.forEach(column => {
            const field = column.field;
            this.setValueForFormField(form, jsonObject, column);
          });
        });
      } else if (section.repeatable === true && section.repeatableName !== null) {
        this.loadFormArrayValues(form, section.repeatableName, jsonObject, section.rows);
      }
      if (section.sections && section.sections.length > 0) {
        this.setSectionValues(form, jsonObject, section.sections, allowEdit);
      }
    });
  }

  setValueForFormField(form: FormGroup, jsonObject: any, column: FieldConfig) {
    const field = column.field;
    if (Object.keys(jsonObject).length === 0) {
      if (field.name !== null && form.get(field.name) &&
        (field.onSelection === null || field.onSelection.onSelectionChange === false)) {
        form.get(field.name).setValue(null);
      }
    } else {
      if (jsonObject[field.name] && form.get(field.name)) {
        if (column.controlType === 'date' && jsonObject[field.name] !== 'null') {
          this.df.format = field.dateFormat;

          let dateString = jsonObject[field.name];
          const date1 = new Date(jsonObject[field.name]);
          dateString = date1.toISOString();
          var fields = dateString.split('T');
          // 00:00:00.000Z
          const date = new Date(jsonObject[field.name]);
          if (fields[1] === '00:00:00.000Z' && date.getTimezoneOffset() < 0) {
            date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
          } else if ((fields[1] === '00:00:00.000Z' && date.getTimezoneOffset() > 0)) {
            date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
          }
          form.get(field.name).setValue(date);
        } else {
          if (column.controlType === 'checkbox') {
            if (jsonObject[field.name] === true || jsonObject[field.name] === 'true') {
              form.get(field.name).setValue(true);
            } else if (jsonObject[field.name] === false || jsonObject[field.name] === 'false') {
              form.get(field.name).setValue(false);
            }
          } else if (column.controlType === 'table' && column.field.control) {
            this.loadTableControlValues(form, jsonObject, column);
          } else if (column.controlType === 'chip' && jsonObject[field.name] !== null &&
            this.chipComponents[column.field.name]) {
            const component = this.chipComponents[column.field.name] as ChipComponent;
            component.placeholder = component.getPlaceholderFromStringArrayForExpectedElements(jsonObject[field.name]);
          } else if (column.controlType !== 'checkbox' && jsonObject[field.name] !== 'null'
            && column.controlType !== 'chip') {
            if (column.controlType === 'select' && jsonObject[field.name] !== 'null') {
              if (column.field.defaultCode && column.field.control.optionType === 's') {
                if (column.field.defaultCode === jsonObject[field.name]) {
                  form.get(field.name).setValue(column.field.defaultCode);
                } else {
                  form.get(field.name).setValue(jsonObject[field.name]);
                }
              } else {
                form.get(field.name).setValue(jsonObject[field.name]);
              }
            } else {
              form.get(field.name).setValue(jsonObject[field.name]);
            }
          }
        }
      } else if (column.controlType === 'table' && column.field.control) {
        this.loadTableControlValues(form, jsonObject, column);
      }
    }
    if (field.editable === false) {
      if (form.get(field.name)) {
        form.get(field.name).disable();
      }

    }
  }

  getUrlList() {
    return this.urlList;
  }

  loadTableControlValues(form: FormGroup, jsonObject, column: FieldConfig) {
    const table = column.field.control as Table;
    const fields = table.columns;
   var formArray = (form.get(table.tableId) as FormArray);
    if (formArray) {
      formArray.reset();
    } else {
      formArray = this.addTableFormArrayFields(form, column);
    }
    const arrayObject = jsonObject[table.tableId] as any[];
    const computation = table.enableRowLevelComputation;
    if (arrayObject && arrayObject.length > 0) {
      for (let i = 0; i < arrayObject.length; i++) {
        const index = '' + i;
        if (i > 0 && formArray.get(index) === null) {
          const newFormGroup = this.fb.group({});
          newFormGroup.addControl('id', this.fb.control('-1'));
          if (computation && computation.option === true) {
            newFormGroup.addControl(computation.computationFieldName, this.fb.control(null));
            newFormGroup.get(computation.computationFieldName).disable();
          }
          table.columns.forEach(tableColumn => {
            newFormGroup.addControl(tableColumn.field.name, this.fb.control(null));
          });
          newFormGroup.updateValueAndValidity();
          formArray.push(newFormGroup);
        }
        const group = formArray.get(index) as FormGroup;
        fields.forEach(formFields => {
          group.get('id').setValue(arrayObject[i].id);
          this.setValueForFormField(group, arrayObject[i], formFields);
        });
      }
    }
    this.tableEmitter.emit(true);
  }

  addTableFormArrayFields(group: FormGroup, column: FieldConfig): FormArray {
    const table = column.field.control as Table;
    const arrayName = table.tableId;
    group.addControl(arrayName, this.fb.array([]));
    const formArray = (group.get(arrayName) as FormArray);
    if (formArray.length === 0) {
      for (let i = 0; i < table.noOfRows; i++) {
        formArray.push(this.getFormGroup(table));
      }
    }
    if (table.enableColumnLevelComputation.option === true) {
      group.addControl('columnComputationArray', this.fb.array([]));
      const computationFormArray = (group.get('columnComputationArray') as FormArray);
      if (computationFormArray.length === 0) {
        computationFormArray.push(this.getColumnFormGroup(table));
      }
    }
    return (group.get(table.tableId) as FormArray);
  }

  getFormGroup(table: Table): FormGroup {
    const formGroup = this.fb.group({});
    formGroup.addControl('id', this.fb.control('-1'));
    const computation = table.enableRowLevelComputation;
    if (computation && computation.option === true) {
      formGroup.addControl(computation.computationFieldName, this.fb.control(null));
      formGroup.get(computation.computationFieldName).disable();
    }
    table.columns.forEach(column => {
      formGroup.addControl(column.field.name, this.fb.control(''));
    });
    formGroup.updateValueAndValidity();
    return formGroup;
  }

  getColumnFormGroup(table: Table): FormGroup {
    const formGroup = this.fb.group({});
    formGroup.addControl('id', this.fb.control('-1'));
    const computation = table.enableRowLevelComputation;
    if (computation && computation.option === true) {
      formGroup.addControl(computation.computationFieldName, this.fb.control(null));
      formGroup.get(computation.computationFieldName).disable();
    }
    table.columns.forEach(column => {
      formGroup.addControl(column.field.name, this.fb.control(''));
    });
    formGroup.addControl('option', this.fb.control(table.enableColumnLevelComputation.option));
    formGroup.addControl('computationLabelName', this.fb.control(table.enableColumnLevelComputation.computationLabelName));
    formGroup.addControl('totalCompute', this.fb.control(null));
    formGroup.updateValueAndValidity();
    return formGroup;
  }

  disableAndEnableFormFields(allowEdit: boolean, form: FormGroup) {
    if (allowEdit === true) {
      this.formValidationService.disableAllFormFields(form, false);
    } else {
      this.formValidationService.disableAllFormFields(form, true);
    }
  }

  disableAndEnableSectionFormFields(allowEdit: boolean, form: FormGroup, sections: Section[]) {
    sections.forEach(section => {
      if (allowEdit === true) {
        this.formValidationService.disableSectionFormFields(form, section, false);
      } else {
        this.formValidationService.disableSectionFormFields(form, section, true);
      }
    });
  }


  enableFormFieds(group: any) {
    Object.keys(group.controls).forEach(control => {
      if (group.get(control).disabled === true) {
        group.get(control).enable();
      }
    });
  }

  loadFormArrayValues(form: FormGroup, key: any, jsonObject: any, rows: Row[]) {
    if ((form.get(key) instanceof FormArray)) {
      const arrayObject = jsonObject[key] as any[];
      const formArray = (form.get(key) as FormArray);
      const formGroup = (formArray.get('0') as FormGroup);
      const validators = this.formValidationService.getValidations(rows);
      if (arrayObject !== undefined && arrayObject !== null) {
        for (let i = 0; i < arrayObject.length; i++) {
          const index = '' + i;
          if (i > 0 && formArray.get(index) === null) {
            const newGroup = this.fb.group({});
            Object.keys(formGroup.controls).forEach(control => {
              const formControl = this.fb.control(null, this.formValidationService.bindValidations(validators[control]));
              newGroup.addControl(control, formControl);
            });
            formArray.push(newGroup);
          }
          rows.forEach(row => {
            row.columns.forEach(column => {
              const group = formArray.get(index) as FormGroup;
              group.get('id').setValue(arrayObject[i].id);
              this.setValueForFormField(group, arrayObject[i], column);
            });
          });
          // formArray.get(index).setValue(arrayObject[i]);
        }
      }
    }
  }
}
