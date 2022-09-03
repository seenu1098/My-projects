import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePickerFormatService, APP_DATE_FORMATS } from './date-picker-format.service';
import { Field } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { FormValidationService } from '../../service/form-service/form-validation.service';
import { CustomDateAdapter } from './custom-date-adapter';
import { DateFormatService } from './date-format-service';

@Component({
  selector: 'app-date',
  template: `
  <ng-container *ngIf="showControl">
  <div [style]="field.style" style="width:100%">
<mat-form-field  [formGroup]="group" style="width: 100%" [floatLabel]="field.label.labelOption"
[style.background-color]="field.rowBackground" appearance="outline">
<mat-label>{{field.label.labelName}}{{required}}</mat-label>
 <div *ngIf='maxDate!==null'>
 <input matInput id="datePicker" [matDatepicker]="picker" [min]="minDate" [max]="maxDate" [formControlName]="field.name" 
 [placeholder]="field.label.labelName + required">
</div>
<div *ngIf='maxDate===null'>
<input matInput id="datePicker" [matDatepicker]="picker" [min]="minDate"  [formControlName]="field.name" 
[placeholder]="field.label.labelName + required">
</div>
<mat-datepicker-toggle matSuffix [for]="picker" >
<mat-icon matDatepickerToggleIcon  (click)="setFormat()">date_range</mat-icon>
</mat-datepicker-toggle>
<mat-datepicker #picker></mat-datepicker>
<mat-hint></mat-hint>
<ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
<mat-error *ngIf="group.get(field.name) && group.get(field.name).hasError(validation.type)">
{{formService.getValidationErrorMessage(validation,field.label.labelName)}}</mat-error>
</ng-container>
<mat-error *ngIf="maxDate!==null && group.get(field.name) && group.get(field.name).value > maxDate">
{{field.label.labelName}} should less than Current Date</mat-error>
<mat-error *ngIf="group.get(field.name) && group.get(field.name).errors?.lessValid">{{field.label.labelName}}
 should be less than {{field.dateValidation.toField}}</mat-error>
 <mat-error *ngIf="group.get(field.name) && group.get(field.name).errors?.greaterValid">{{field.label.labelName}}
 should be greater than {{field.dateValidation.toField}}</mat-error>
</mat-form-field>
</div>
</ng-container>
`,
  styles: [],
  //providers: [{ provide: DateAdapter, useClass: DatePickerFormatService },
  // { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    // { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    // { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class DateComponent implements OnInit {
  field: Field;
  group: FormGroup;
  showControl = true;
  allowDateValidation = false;
  maxDate;
  minDate;
  values: string[] = [];
  duplicateValues = false;
  isRequired = false
  required = '';

  constructor(public el: ElementRef, public formService: CreateFormService, private df: DateFormatService
    , public dateFormat: DatePickerFormatService, public validationService: FormValidationService) {
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
  }

  ngOnInit() {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    if (this.group.get(this.field.name).hasError('required')) {
      this.required = ' *';
    }
    this.allowFuturDate();
    this.addRequiredFields();
    this.isRequired = this.formService.getIsRequiredValue(this.field.validations);
    this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
    this.formService.checkConditionallyEnableValidation(this.field, this);
    this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
    this.formService.checkConditionallyShowValidation(this.field, this);
    this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
    this.dateFromField();
    this.dateToField();
    this.loadFormValues();
  }

  setFormat() {
    this.df.format = this.field.dateFormat;
  }

  loadFormValues() {
    this.group.get(this.field.name).valueChanges.subscribe(data => {
      if (data) {
        this.getDate(data);
      }
    }
    );
  }

  getDate(date) {
    const stringified = JSON.stringify(date);
    if (stringified && stringified.length > 10) {
      const dob = stringified.substring(1, 11);
      this.group.get(this.field.name).setValue(dob, { emitEvent: false });
    }
  }

  allowFuturDate() {
    // if (!(this.field.dateValidation === undefined || this.field.dateValidation === null)) {
    if (this.field.allowFutureDate === true) {
      this.maxDate = null;
    } else {
      this.maxDate = new Date(new Date().setDate(new Date().getDate()));
    }
    if (this.field.allowPastDate === false) {
      this.minDate = new Date(new Date().setDate(new Date().getDate()));
    }
    // }
  }

  addRequiredFields() {
    if (this.field.conditionalChecks) {
      const conditionalDetails = this.field.conditionalChecks.required;
      if (conditionalDetails && conditionalDetails.option === true) {
        this.group.get(this.field.name).valueChanges.subscribe(value => {
          this.values.forEach(fieldValue => {
            if (fieldValue === value) {
              this.duplicateValues = true;
            } else {
              this.values.push(value);
              this.duplicateValues = false;
            }
          });
          if (!this.duplicateValues) {
            this.validationService.addConditionalRequiredValidations(value, this.group, conditionalDetails.fields,
              this.field);
          }
        });
      }
    }
  }

  dateFromField() {
    if (!(this.field.dateValidation === undefined || this.field.dateValidation === null)) {
      if (this.field.dateValidation.dateValidation === true) {
        const operator = this.field.dateValidation.operator;
        const dateValidation = this.field.dateValidation;
        this.group.get(dateValidation.fromField).valueChanges.subscribe(data => {
          if ((this.group.get(dateValidation.toField).value !== null
            || this.group.get(dateValidation.fromField).value !== null)) {
            if (operator === 'lt') {
              if (this.group.get(dateValidation.toField).value < data) {
                return this.group.get('' + this.field.name).setErrors({ lessValid: true });
              } else {
                this.allowDateValidation = false;
                return this.group.get('' + this.field.name).setErrors(null);
              }
            }
            if (operator === 'gt') {
              if (this.group.get(dateValidation.toField).value > data) {
                return this.group.get('' + this.field.name).setErrors({ greaterValid: true });
              } else {
                this.allowDateValidation = false;
                return this.group.get('' + this.field.name).setErrors(null);
              }
            }
          }
        });
      }
    }
  }

  dateToField() {
    if (!(this.field.dateValidation === undefined || this.field.dateValidation === null)) {
      if (this.field.dateValidation.dateValidation === true) {
        const operator = this.field.dateValidation.operator;
        const dateValidation = this.field.dateValidation;
        this.group.get(dateValidation.toField).valueChanges.subscribe(data => {
          if ((this.group.get(dateValidation.toField).value !== null
            || this.group.get(dateValidation.fromField).value !== null)) {
            if (operator === 'lt') {
              if (this.group.get(dateValidation.fromField).value > data) {
                return this.group.get('' + this.field.name).setErrors({ lessValid: true });
              } else {
                this.allowDateValidation = false;
                return this.group.get('' + this.field.name).setErrors(null);
              }
            }
            if (operator === 'gt') {
              if (this.group.get(dateValidation.fromField).value < data) {
                return this.group.get('' + this.field.name).setErrors({ greaterValid: true });
              } else {
                this.allowDateValidation = false;
                return this.group.get('' + this.field.name).setErrors(null);
              }
            }
          }
        });
      }
    }
  }

  // dateValidation(value) {
  //   this.df.format = this.field.dateFormat;
  //   if (!(this.field.dateValidation === undefined || this.field.dateValidation === null)) {
  //     if (this.field.dateValidation.dateValidation === true) {
  //       const operator = this.field.dateValidation.operator;
  //       if (operator === 'lt') {
  //         if (this.group.get(this.field.dateValidation.toField).value < value) {
  //           // this.allowDateValidation = true;
  //           return this.group.get('' + this.field.name).setErrors({ lessValid: true });
  //         } else {
  //           this.allowDateValidation = false;
  //           return null;
  //         }
  //       } else if (operator === 'gt') {
  //         if (this.group.get(this.field.dateValidation.toField).value > value) {
  //           // this.allowDateValidation = true;
  //           return this.group.get('' + this.field.name).setErrors({ greaterValid: true });
  //         } else {
  //           this.allowDateValidation = false;
  //           return null;
  //         }
  //       }
  //     }
  //   }

  // }

}
