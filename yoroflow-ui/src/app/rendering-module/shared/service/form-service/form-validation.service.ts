import { Injectable } from '@angular/core';
import { Row, Validator, ConditonFields, Field, Section, FieldConfig } from '../../vo/page-vo';
import { AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ɵAnimationGroupPlayer } from '@angular/animations';


@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor() { }
  validations: any;
  getValidations(rows: Row[]) {
    const validators = {};
    rows.forEach(row => {
      row.columns.filter(column => column.controlType !== 'button' && column.controlType !== 'grid'
        && column.controlType !== 'divider' && column.controlType !== 'label' && column.field.validations.length > 0)
        .forEach(column => {
          validators[column.field.name] = column.field.validations;
        });
    });
    return validators;
  }

  bindValidations(validations: any) {
    if (validations && validations.length > 0) {
      const validList = [];
      validations.filter(validator => validator.type === 'required' || validator.type === 'email'
        || validator.value).forEach((validator) => {
          const valid = validator as Validator;
          if (valid.type === 'required') {
            validList.push(Validators.required);
          } else if (valid.type === 'email') {
            validList.push(Validators.email);
          } else if (valid.type === 'maxlength') {
            validList.push(Validators.maxLength(+ valid.value));
          } else if (valid.type === 'minlength') {
            validList.push(Validators.minLength(+ valid.value));
          } else if (valid.type === 'min') {
            validList.push(Validators.min(+ valid.value));
          } else if (valid.type === 'max') {
            validList.push(Validators.max(+ valid.value));
          } else if (valid.type === 'pattern') {
            validList.push(Validators.pattern(valid.value));
          }
        });
      return Validators.compose(validList);
    }
    return null;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if ((control instanceof FormArray)) {
        this.validateFormArrayFields(control);
      }
      control.markAsTouched({ onlySelf: true });
    });
  }

  addConditionalRequiredValidations(value, form: FormGroup, fields: ConditonFields[], field: Field) {
    this.validations = field.validations as Validator[];
    if (value && value !== '' && value !== null) {
      fields.forEach(fieldValue => {
        form.get(fieldValue.fieldName).setValidators(Validators.required);
        form.get(fieldValue.fieldName).updateValueAndValidity();
        if (this.validations.length > 0) {
          for (let i = 0; i < this.validations.length; i++) {
            if (this.validations[i].type === 'required') {
              this.validations.splice(i, 1);
            }
          }
        }
        this.validations.push({ type: 'required', value: null });
      });
    } else if (value === '' && value === null) {
      fields.forEach(fieldValue => {
        form.get(fieldValue.fieldName).clearValidators();
        form.get(fieldValue.fieldName).updateValueAndValidity();
      });
    }
  }


  validateFormArrayFields(formArray: FormArray) {
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.get(i + '') as FormGroup;
      Object.keys(group.controls).forEach(arrayField => {
        const formArrayControl = group.get(arrayField);
        formArrayControl.markAsTouched({ onlySelf: true });
        if ((formArrayControl instanceof FormArray)) {
          this.validateFormArrayFields(formArrayControl);
        }
      });
    }
  }


  disableAllFormFields(formGroup: FormGroup, isDisable: boolean) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if ((control instanceof FormArray)) {
        this.disableAndEnableFormArrayFields(control, isDisable);
      }
      // if (control.status !== 'DISABLED') {
      if (isDisable === true) {
        control.disable();
      } else {
        control.enable();
      }
      // } else {
      //   control.disable();
      // }
    });
  }

  disableSectionFormFields(formGroup: FormGroup, section: Section, isDisable: boolean) {
    section.rows.forEach(row => {
      row.columns.forEach(column => {
        const name = column.field.name;
        const control = formGroup.get(column.field.name);
        if (name && control) {
          if (column.controlType !== 'grid' && column.controlType !== 'button' && column.controlType !== 'table') {
            if (isDisable === true) {
              formGroup.get(column.field.name).disable();
            } else {
              formGroup.get(column.field.name).enable();
            }
          }
        }
      });
    });
  }

  disableAndEnableFormArrayFields(formArray: FormArray, isDisable: boolean) {
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.get(i + '') as FormGroup;
      Object.keys(group.controls).forEach(arrayField => {
        const formArrayControl = group.get(arrayField);
        if (isDisable === true) {
          formArrayControl.disable();
        } else {
          formArrayControl.enable();
        }

        if ((formArrayControl instanceof FormArray)) {
          this.disableAndEnableFormArrayFields(formArrayControl, isDisable);
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

  setCustomErrors(formArray: FormArray, columns: FieldConfig[]) {
    for (let i = 0; i < formArray.length; i++) {
      const formGroup = formArray.get(i + '') as FormGroup;
      columns.forEach(column => {
        this.setConditionalRequiredValidation(formGroup, column.field);
        this.setMinAndMaxValidations(formGroup, column.field);
      });
    }
  }

  setConditionalRequiredValidation(formGroup: FormGroup, field: Field) {
    if (field.conditionalChecks.required && field.conditionalChecks.required.option === true) {
      const conditionalFields = field.conditionalChecks.required.fields;
      const formControl = formGroup.get(field.name);
      let count = 0;
      conditionalFields.forEach(requiredField => {
        const control = formGroup.get(requiredField.fieldName) as AbstractControl;
        control.valueChanges.subscribe(data => {
          const value = requiredField.value;
          if (data === requiredField.value.toString()) {
            formControl.setValidators([Validators.required]);
          } else {
            if ((field.minLength !== null && field.minLength > 0) || (field.maxLength !== null && field.maxLength > 0))  {
              this.setMinAndMaxValidations(formGroup, field);
            }else{
              formControl.clearValidators();
            }
          }
          formControl.updateValueAndValidity();
        });
      });
    }
  }

  setMinAndMaxValidations(formGroup: FormGroup, field: Field) {
    const control = formGroup.get(field.name);
    const minLength = field.minLength;
    const maxLength = field.maxLength;
    if (field.dataType === 'string') {
      if (minLength !== null && minLength > 0) {
        if (control.errors && control.errors.required) {
          control.setValidators([Validators.minLength(minLength), Validators.required]);
        } else {
          control.setValidators([Validators.minLength(minLength)]);
        }
      }
      if (maxLength !== null && maxLength > 0) {
        if (control.errors && control.errors.required) {
          control.setValidators([Validators.maxLength(maxLength), Validators.required]);
        } else {
          control.setValidators([Validators.maxLength(maxLength)]);
        }
      }
      if ((minLength !== null && minLength > 0) && (maxLength !== null && maxLength > 0)) {
        if (control.errors && control.errors.required) {
          control.setValidators([Validators.maxLength(maxLength), Validators.minLength(minLength), Validators.required]);
        } else {
          control.setValidators([Validators.maxLength(maxLength), Validators.minLength(minLength)]);
        }
      }
    }

    if (field.dataType === 'float' || field.dataType === 'long') {
      if (minLength !== null && minLength > 0) {
        if (control.errors && control.errors.required) {
          control.setValidators([Validators.min(minLength), Validators.required]);
        } else {
          control.setValidators([Validators.min(minLength)]);
        }
      }
      if (maxLength !== null && maxLength > 0) {
        if (control.errors && control.errors.required) {
          control.setValidators([Validators.max(maxLength), Validators.required]);
        } else {
          control.setValidators([Validators.max(maxLength)]);
        }
      }
      if ((minLength !== null && minLength > 0) && (maxLength !== null && maxLength > 0)) {
        if (control.errors && control.errors.required) {
          control.setValidators([Validators.max(maxLength), Validators.min(minLength), Validators.required]);
        } else {
          control.setValidators([Validators.max(maxLength), Validators.min(minLength)]);
        }
      }
    }

    if ((minLength === null || minLength === 0) && (maxLength === null || maxLength === 0) && control.errors && control.errors.required) {
      control.setValidators([Validators.required]);
    }
    control.updateValueAndValidity();
  }

}
