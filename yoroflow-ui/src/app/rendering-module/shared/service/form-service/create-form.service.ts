import { Injectable } from '@angular/core';
import { OptionsValue, Select, Section, Field, Row, Validator } from '../../vo/page-vo';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { DynamicQueryBuilderService } from '../dynamic-query-builder.service';
import { ChipComponent } from '../../components/chip/chip.component';
import { FormValidationService } from './form-validation.service';
import { Observable } from 'rxjs';
import { InputComponent } from '../../components/input/input.component';

@Injectable({
  providedIn: 'root'
})
export class CreateFormService {

  labelList: any[];
  sections: Section[];

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private validationService: FormValidationService
    , private dynamicService: DynamicQueryBuilderService) { }

  list: string[] = [];
  optionsList: OptionsValue[];
  /* optionsList = [{
     'code': 'dynamic 1',
     'description': 'DynamicOne'
   },
   {
     'code': 'dynamic 2',
     'description': 'DynamicTwo'
   }];*/


  createForm(sections: Section[]) {
    const group = this.fb.group({});
    if (!group.get('yorosisPageId') && !group.get('id')) {
      group.addControl('yorosisPageId', this.fb.control(null));
      group.addControl(sections[0].primaryKey, this.fb.control(null));
    }

    sections.forEach(section => {
      this.createSectionFormControls(section, group);
    });
    // this.createRowFormControl(section.rows, group);

    // if (section.sections) {
    //   section.sections.forEach(nestedSection => {
    //     if (nestedSection.repeatable === true && nestedSection.repeatableName !== null) {
    //       this.createFormArray(nestedSection, group);
    //     } else if (nestedSection.repeatable === false) {
    //       this.createSectionFormControls(nestedSection, group);
    //     }
    //   });
    // }
    return group;
  }

  getIsRequiredValue(validators: Validator[]): boolean {
    if (validators.some(validation => validation.type === 'required')) {
      return true;
    }
  }

  createSectionFormControls(section: Section, form: FormGroup) {
    if (section.repeatable === true && section.repeatableName !== null) {
      this.createFormArray(section, form);
    } else {
      this.createRowFormControl(section.rows, form);
    }

    if (section.sections) {
      section.sections.forEach(nestedSection => {
        if (nestedSection.repeatable === false) {
          this.createSectionFormControls(nestedSection, form);
        } else if (nestedSection.repeatable === true && nestedSection.repeatableName !== null) {
          this.createFormArray(nestedSection, form);
        }
      });
    }
  }

  createFormArray(section: Section, group: FormGroup) {
    const arrayName = section.repeatableName;
    group.addControl(arrayName, this.fb.array([]));
    const formArray = (group.get(arrayName) as FormArray);
    formArray.push(this.fb.group({}));
    const formGroup = (formArray.get('0') as FormGroup);
    formGroup.addControl('id', this.fb.control('-1'));
    this.createRowFormControl(section.rows, formGroup);
    if (section.sections) {
      section.sections.forEach(arrayOfSection => {
        if (arrayOfSection.repeatable === true && arrayOfSection.repeatableName !== null) {
          this.createFormArray(arrayOfSection, formGroup);
        } else if (arrayOfSection.repeatable === false && !arrayOfSection.repeatableName) {
          this.createRowFormControl(arrayOfSection.rows, formGroup);
        }
      });
    }
  }

  createRowFormControl(rows: Row[], group: FormGroup) {
    rows.forEach(row => {
      row.columns.forEach(fieldConfig => {
        const field = fieldConfig.field;
        if (fieldConfig.controlType === 'button') { return; }
        const control = this.fb.control(
          field.defaultValue,
          this.validationService.bindValidations(field.validations || [])
        );
        if (field.name) {
          group.addControl(field.name, control);
        }
      });
    });
  }

  checkConditionallyShowValidation(field: Field, object: any) {
    if (field.conditionalChecks && field.conditionalChecks.show && field.conditionalChecks.show.option === true) {
      const fields = field.conditionalChecks.show.fields;
      if (fields) {
        let count = 0;
        fields.forEach(fieldObj => {
          if (this.checkValueForDataType(fieldObj, object)) {
            count++;
          }
          if (count === fields.length) {
            object.showControl = true;
            this.validations(field, object, false);
            object.el.nativeElement.style.width = field.fieldWidth + '%';
          } else {
            object.showControl = false;
            object.el.nativeElement.style.width = 0 + '%';
            object.group.get(field.name).setErrors(null);
            object.group.get(field.name).setValidators(null);
            object.group.get(field.name).updateValueAndValidity();
          }
        });
      }
    }
  }

  addContionallyShowValidationValueChanges(field: Field, object: any, group: FormGroup) {
    if (field.conditionalChecks && field.conditionalChecks.show && field.conditionalChecks.show.option === true) {
      const fields = field.conditionalChecks.show.fields;
      if (fields) {
        let count = 0;
        fields.forEach(fieldObj => {
          object.group.get(fieldObj.fieldName).valueChanges.subscribe(data => {
            if (data === fieldObj.value) {
              count++;
            }
            this.checkConditionallyShowValidation(field, object);
          });
        });
      }
    }
  }

  validations(field: Field, object: any, required: any) {
    if (field.validations) {
      if (field.validations.some(validation => validation.type === 'required')) {
        object.group.get(field.name).setValidators([Validators.required]);
      }
      if (field.validations.some(validation => validation.type === 'pattern')) {
        object.group.get(field.name).setValidators([Validators.pattern(field.validations.find
          (a => a.type === 'pattern').value)]);
      }
      if (field.validations.some(validation => validation.type === 'email')) {
        object.group.get(field.name).setValidators([Validators.email]);
      }

      if (field.validations.some(validation => validation.type === 'required') &&
        field.validations.some(validation => validation.type === 'pattern')) {
        object.group.get(field.name).setValidators([Validators.required, Validators.pattern(field.validations.find
          (a => a.type === 'pattern').value)]);
      }

      if (field.validations.some(validation => validation.type === 'required') &&
        field.validations.some(validation => validation.type === 'email')) {
        object.group.get(field.name).setValidators([Validators.required, Validators.email]);
      }

      if (field.validations.some(validation => validation.type === 'required') &&
        field.validations.some(validation => validation.type === 'email') &&
        field.validations.some(validation => validation.type === 'pattern')) {
        object.group.get(field.name).setValidators([Validators.required, Validators.email,
        Validators.pattern(field.validations.find
          (a => a.type === 'pattern').value)]);
      }

      if (field.validations.some(validation => validation.type === 'pattern') &&
        field.validations.some(validation => validation.type === 'email')) {
        object.group.get(field.name).setValidators([Validators.email, Validators.pattern(field.validations.find
          (a => a.type === 'pattern').value)]);
      }

      if (field.validations.some(validation => validation.type === 'pattern') &&
        field.validations.some(validation => validation.type === 'required')) {
        object.group.get(field.name).setValidators([Validators.required, Validators.pattern(field.validations.find
          (a => a.type === 'pattern').value)]);
      }
      object.group.get(field.name).updateValueAndValidity();
    }

  }

  checkValueForDataType(fieldObj: any, object: any) {
    var isEnabled = false;
    var dateString = '';
    if (fieldObj.dataType === 'date') {
      const date1 = new Date(object.group.get(fieldObj.fieldName).value);
      date1.setDate(date1.getDate() - 1);
      dateString = date1.toISOString();
      if (dateString.substring(0, 10) === fieldObj.value.substring(0, 10)) {
        isEnabled = true;
      }
    } else if (fieldObj.dataType === 'checkBox') {
      if (object.group.get(fieldObj.fieldName).value !== null 
      && object.group.get(fieldObj.fieldName).value.toString() === fieldObj.value) {
      isEnabled = true;
      } else if (fieldObj.value === 'false' && object.group.get(fieldObj.fieldName).value === null){
        isEnabled = true;
      }
    } else if (object.group.get(fieldObj.fieldName).value === fieldObj.value) {
      isEnabled = true;
    }
    return isEnabled;
  }

  addConditonallyRequiredValidation(field: Field, object: any, isRequired: boolean) {
    if (field.conditionalChecks && field.conditionalChecks.required && field.conditionalChecks.required.option === true) {
      const fields = field.conditionalChecks.required.fields;
      if (fields) {
        fields.forEach(requiredField => {
          object.group.get(requiredField.fieldName).valueChanges.subscribe(value => {
            // const validations = field.validations;
            // if (!validations.some(validation => validation.type === 'required')) {
            //   validations.push({ type: 'required', value: null });
            // }
            this.checkRequiredValidation(field, object, isRequired, value);
          });
        });
      }
    }
  }

  checkRequiredValidation(field: Field, object: any, isRequired: boolean, value: any) {
    if(value && value.number && value.dialCode){
      value = value.number;
    }
    let fields;
    if (field.conditionalChecks) {
      fields = field.conditionalChecks.required.fields;
    }
    if (fields) {
      let count = 0;
      fields.forEach(fieldObj => {
        if (this.checkValueForDataType(fieldObj, object)) {
          count++;
        }
        if (count === fields.length) {
          // object.group.get(field.name).setValidators([Validators.required]);
          // this.validations(field, object, true);
          const validations = field.validations;
          if (!validations.some(validation => validation.type === 'required')) {
            validations.push({ type: 'required', value: null });
          }
          if (object?.fieldConfig?.controlType === 'email') {
            object.setEmailvalidation();
          }
          object.group.get(field.name).setValidators(this.validationService.bindValidations(validations || []));
          object.group.get(field.name).updateValueAndValidity();
        } else {
          object.group.get(field.name).setErrors(null);
          object.group.get(field.name).setValidators(null);
          if ( field.required !== true) {
          let removeIndexDate = field.validations.findIndex(x => x.type === 'required');
          if (removeIndexDate !== -1) {
              field.validations.splice(removeIndexDate, 1);
            }
          }
          object.group.get(field.name).setValidators(this.validationService.bindValidations(field.validations || []));
          object.group.get(field.name).updateValueAndValidity();
          if ((field.minLength !== null && field.minLength > 0) || (field.maxLength !== null && field.maxLength > 0))  {
            this.validationService.setMinAndMaxValidations(object.group, field);
          }
        }
      });
    }
  }

  checkConditionallyEnableValidation(field: Field, object: any) {
    if (field.conditionalChecks && field.conditionalChecks.enable && field.conditionalChecks.enable.option === true) {
      const fields = field.conditionalChecks.enable.fields;
      if (fields) {
        let count = 0;
        fields.forEach(fieldObj => {
          if (this.checkValueForDataType(fieldObj, object)) {
            count++;
          }
          if (count === fields.length) {
            object.group.get(field.name).enable();
            this.validations(field, object, false);
          } else {
            object.group.get(field.name).disable();
            object.group.get(field.name).setErrors(null);
            object.group.get(field.name).setValidators(null);
            object.group.get(field.name).updateValueAndValidity();
          }
        });
      }
    }
  }

  addCondtionallyEnabledFormValueChanges(field: Field, object: any) {
    if (field.conditionalChecks && field.conditionalChecks.enable && field.conditionalChecks.enable.option === true) {
      const fields = field.conditionalChecks.enable.fields;
      if (fields) {
        fields.forEach(fieldObj => {
          object.group.get(fieldObj.fieldName).valueChanges.subscribe(data => {
            this.checkConditionallyEnableValidation(field, object);
          });
        });
      }
    }
  }

  checkSectionsForCondtionalValidations(group: FormGroup, section: Section, object: any) {
    if (section.conditionallyApplicable === true) {
      group.get(section.fieldName).valueChanges.subscribe(data => {
        if (group.get(section.fieldName).value === section.value && data !== null && data !== '') {
          object.showSection = false;
        } else {
          object.showSection = true;
        }
      });
    }
  }

  getValidationErrorMessage(validation: Validator, label: string): string {
    if (validation.type === 'required') {
      return label + ' is required';
    } else if (validation.type === 'maxlength') {
      return label + ' should be maximum ' + validation.value + ' characters.';
    } else if (validation.type === 'minlength') {
      return label + ' should be minimum ' + validation.value + ' characters.';
    } else if (validation.type === 'min') {
      return label + ' value should be minimum ' + validation.value + '.';
    } else if (validation.type === 'max') {
      return label + ' value should be maximum ' + validation.value + '.';
    } else if (validation.type === 'pattern') {
      return label + ' is invalid.';
    } else if (validation.type === 'email') {
      return label + ' is invalid email.';
    }

  }

  getReadOnlyValue(value) {
    if (value === true) {
      return false;
    } else { return true; }
  }

  disableFormFields(field: Field, form: FormGroup) {
    if (field.editable === false && form.get('id').value > -1) {
      form.get(field.name).disable();
    } else {
      form.get(field.name).enable();
    }
  }

  checkContolsForConditionalValidations(field: Field, form: FormGroup) {
    const enable = field.conditionalChecks.enable;
    const show = field.conditionalChecks.enable;
    if (enable.option === true) {
      this.checkControlForCondtionalValidation(enable.fields, field.name, form);
    }
  }

  checkControlForCondtionalValidation(fields, name, form: FormGroup) {
    fields.forEach(condtionalObject => {
      const control = form.get(condtionalObject.fieldName);
      control.valueChanges.subscribe(data => {
        if (data === condtionalObject.value) {
          form.get(name).enable();
        } else {
          form.get(name).disable();
        }
      });
    });
  }

  setDateFormat(sections: Section[], form: FormGroup, json: any) {
    sections.forEach(section => {
      if (section.repeatable === true && section.repeatableName !== null) {
        this.setFormArrayDateFormats(section, form, json);
      } else {
        this.setSectionDateFormat(section, form, json);
      }
    });
  }


  setSectionDateFormat(section: Section, form: FormGroup, json: any) {
    section.rows.forEach(row => {
      row.columns.forEach(column => {
        if (column.controlType === 'date') {
          const dateControl = form.get(column.field.name);
          json[column.field.name] = (this.datePipe.transform(dateControl.value, column.field.dateFormat));
        }
      });
    });
    // if (section.sections) {
    //   section.sections.forEach(nestedSection => {
    //     if (nestedSection.repeatable === true && nestedSection.repeatableName !== null) {
    //       this.setFormArrayDateFormats(nestedSection, form);
    //     } else {
    //       this.setSectionDateFormat(nestedSection, form);
    //     }
    //   });
    // }
  }

  setFormArrayDateFormats(section: Section, form: FormGroup, json: any) {
    const formArray = (form.get(section.repeatableName) as FormArray);
    for (let i = 0; i < formArray.length; i++) {
      const index = i + '';
      const formGroup = (formArray.get(index) as FormGroup);
      this.setSectionDateFormat(section, formGroup, json);

      if (section.sections) {
        section.sections.forEach(nestedSection => {
          if (nestedSection.repeatable === true && nestedSection.repeatableName !== null) {
            this.setFormArrayDateFormats(nestedSection, formGroup, json);
          } else {
            this.setSectionDateFormat(nestedSection, formGroup, json);
          }
        });
      }
    }
  }

  getDynamicOptionValues(pageIdentifier: string, controlName: string, version: number): any {
    this.dynamicService.getListValues(pageIdentifier, controlName, version).subscribe(data => {
      this.optionsList = data;
      return this.optionsList;
    });

  }
}
