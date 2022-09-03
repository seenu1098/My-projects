import { filter } from 'rxjs/operators';
import { Component, OnInit, ElementRef, ChangeDetectorRef, HostListener, Input } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatRightSheet } from 'mat-right-sheet';
import { MatDialog } from '@angular/material/dialog';
import { CreateFormService } from '../../service/form-service/create-form.service';
// tslint:disable-next-line: max-line-length
import { ApplicationRightSheetComponent } from '../../../application-right-sheet/application-right-sheet.component';

import { ApplicationDialogBoxComponent } from '../../../application-dialog-box/application-dialog-box.component';
import { Page, FieldConfig, Field } from '../../vo/page-vo';
import { FormValidationService } from '../../service/form-service/form-validation.service';
import { CurrencyPipe } from '@angular/common';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import * as moment from 'moment';
@Component({
  selector: 'app-input',
  template: `
  <ng-container *ngIf="showControl">
  <div [style]="fieldConfig.field.style" style="width:100%">
    <mat-form-field class="mat-headline" style="width: 100%" [style.background-color]="fieldConfig.field.rowBackground" [formGroup]="group" [floatLabel]="fieldConfig.field.label.labelOption"
           [id]="fieldConfig.field.name" appearance="outline" *ngIf='type!=="tel"'>
           <mat-label>{{fieldConfig.field.label.labelName}}{{required}}</mat-label>
           <span *ngIf='fieldConfig.controlType && fieldConfig.controlType === "computeFields"' matPrefix class="material-icons-outlined">
functions
</span>
           <div *ngIf='type!=="number" && type!=="tel"'>
           <input matInput [id]="fieldConfig.field.label.labelName" [formControlName]="fieldConfig.field.name" 
           [readonly]="fieldConfig.controlType && fieldConfig.controlType === 'computeFields'" [placeholder]="fieldConfig.field.label.labelName + required" [type]="type">
         </div>
         
         <div *ngIf="type === 'number'">
           <input matInput [id]="fieldConfig.field.label.labelName" [formControlName]="fieldConfig.field.name" [placeholder]="fieldConfig.field.label.labelName + required"
           (focusout)="setVariableValue()" [type]="type" [readonly]="read===true || fieldConfig.controlType && fieldConfig.controlType === 'computeFields'">
         </div>
         

            <mat-icon matSuffix id="icon"  (click)="openComponent()" *ngIf="fieldConfig.field.enableHyperlink"
            style="cursor: pointer;color:#66a3ff;">info</mat-icon>
            <ng-container *ngFor="let validation of fieldConfig.field.validations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(fieldConfig.field.name) && group.get(fieldConfig.field.name).hasError(validation.type)
                 && type!=='email'">
                 {{formService.getValidationErrorMessage(validation,fieldConfig.field.label.labelName)}}</mat-error>
                 <mat-error *ngIf="group.get(fieldConfig.field.name) && group.get(fieldConfig.field.name).hasError(validation.type)
                 && validation.type!=='pattern' && emailValid!==true && type==='email'">
                {{formService.getValidationErrorMessage(validation,fieldConfig.field.label.labelName)}}</mat-error>
                 <ng-container *ngIf="type==='email' && validation.type==='pattern' && emailValid===true">
                 <mat-error *ngIf="group.get(fieldConfig.field.name) && group.get(fieldConfig.field.name).hasError(validation.type)
                  && group.get(fieldConfig.field.name).value!==null">
                 {{formService.getValidationErrorMessage(validation,fieldConfig.field.label.labelName)}}</mat-error>
                 </ng-container>
                 <mat-error *ngIf="requiredEmail===true
                  && validation.type==='required' && type==='email'&& group.get(fieldConfig.field.name)
                  && group.get(fieldConfig.field.name).value===null  
                  && group.get(fieldConfig.field.name).hasError(validation.type) ">{{fieldConfig.field.label.labelName}} is required</mat-error>
                  <mat-error *ngIf="group.get(fieldConfig.field.name) && group.get(fieldConfig.field.name).errors?.lessValid">{{fieldConfig.field.label.labelName}}
                   should be less than {{fieldConfig.field.numberFieldValidation.toField}}</mat-error>
                   <mat-error *ngIf="group.get(fieldConfig.field.name) && group.get(fieldConfig.field.name).errors?.greaterValid">{{fieldConfig.field.label.labelName}}
                   should be greater than {{fieldConfig.field.numberFieldValidation.toField}}</mat-error>
                  </ng-container>
    </mat-form-field>
    <div *ngIf='type==="tel"' [formGroup]="group" [style]="fieldConfig.field.style" id="tel-control">
    <mat-label>{{fieldConfig.field.label.labelName}}</mat-label><br>
         <ngx-intl-tel-input [preferredCountries]="preferredCountries" [style.background-color]="fieldConfig.field.rowBackground" 
				[enableAutoCountrySelect]="true" [enablePlaceholder]="false" [searchCountryFlag]="true"
				[searchCountryField]="[SearchCountryField.Iso2, SearchCountryField.Name]" [selectFirstCountry]="false"
				[selectedCountryISO]="CountryISO.UnitedStates" 
				[phoneValidation]="true" [separateDialCode]="separateDialCode"
				[numberFormat]="PhoneNumberFormat.International" [id]="fieldConfig.field.label.labelName" [formControlName]="fieldConfig.field.name" [placeholder]="fieldConfig.field.label.labelName + required" [type]="type"
        (click)="onSelect($event,PhoneNumberFormat)" (change)="checkNumber()">
        </ngx-intl-tel-input>
        <mat-error *ngIf="validatePhoneNumber && group.get(fieldConfig.field.name).value !== null && group.get(fieldConfig.field.name).value !== '' &&
        group.get(fieldConfig.field.name).errors && group.get(fieldConfig.field.name).errors.validatePhoneNumber &&
        group.get(fieldConfig.field.name).errors.validatePhoneNumber.valid === false">
          Invalid phone number
        </mat-error>
        <ng-container *ngFor="let validation of fieldConfig.field.validations;" ngProjectAs="mat-error">
          <mat-error *ngIf=" group.get(fieldConfig.field.name) && group.get(fieldConfig.field.name).hasError(validation.type) && validation.type !== 'required'">
        {{formService.getValidationErrorMessage(validation,fieldConfig.field.label.labelName)}}</mat-error>  

      
        <div *ngIf="group.get(fieldConfig.field.name).touched">
        <mat-error *ngIf="group.get(fieldConfig.field.name) && group.get(fieldConfig.field.name).hasError(validation.type)">
        {{formService.getValidationErrorMessage(validation,fieldConfig.field.label.labelName)}}</mat-error>                 
        </div>
        </ng-container>

         </div>
    </div>
  </ng-container>
          `,
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  fieldConfig: FieldConfig;
  group: FormGroup;
  showControl = true;
  type: string;
  values: string[] = [];
  duplicateValues = false;
  emailValid = false;
  requiredEmail = false;
  isRequired = false;
  variable: any[] = [];
  sum: number;
  read = false;
  allowNumberFieldValidation = false;
  required = '';
  showError = false;
  validatePhoneNumber = false;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.fieldConfig.field.fieldWidth + '%';
    }
  }

  constructor(public el: ElementRef, public formService: CreateFormService, public rightSheet: MatRightSheet,
    // tslint:disable-next-line:align
    public dialog: MatDialog, public validationService: FormValidationService, public changeDetecter: ChangeDetectorRef,
    private cp: CurrencyPipe) { }
  ngOnInit() {
    this.setInputType();
    if (this.group.get(this.fieldConfig.field.name) &&
      this.group.get(this.fieldConfig.field.name).hasError('required')) {
      this.required = ' *';
    }

    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.fieldConfig.field.fieldWidth + '%';
    }

    if (this.fieldConfig.field.validations) {
      this.isRequired = this.formService.getIsRequiredValue(this.fieldConfig.field.validations);
    }
    this.formService.addConditonallyRequiredValidation(this.fieldConfig.field, this, this.isRequired);
    this.formService.checkConditionallyEnableValidation(this.fieldConfig.field, this);
    this.formService.addCondtionallyEnabledFormValueChanges(this.fieldConfig.field, this);
    this.formService.checkConditionallyShowValidation(this.fieldConfig.field, this);
    this.formService.addContionallyShowValidationValueChanges(this.fieldConfig.field, this, this.group);
    this.setEmailvalidation();
    this.setVariableValue();
    this.setValueChanges();
    this.numberFromField();
    this.numberToField();
    this.setComputeFieldValueChanges();
  }

  checkNumber() {
    if (this.type === 'tel') {
      const phoneNumber = this.group.get(this.fieldConfig.field.name).value;
      if (phoneNumber !== null && phoneNumber !== 'null') {
        this.group.get(this.fieldConfig.field.name).setValue(phoneNumber.number);
        if (this.group.get(this.fieldConfig.field.name).errors && this.group.get(this.fieldConfig.field.name).errors.validatePhoneNumber &&
          this.group.get(this.fieldConfig.field.name).errors.validatePhoneNumber.valid === false) {
          this.validatePhoneNumber = true;
        } else {
          this.validatePhoneNumber = false;
        }
      }
    }

  }
  setValueChanges() {
    if (this.fieldConfig.field.control && this.fieldConfig.field.control.variableArray) {
      this.fieldConfig.field.control.variableArray.forEach(variable => {
        this.group.get(variable.variableName).valueChanges.subscribe(data => {
          if (data !== null && data !== '' && data !== undefined) {
            this.setVariableValue();
          }
        });
      });
    }
  }

  getComputeValues(matches) {
    let formula = JSON.parse(JSON.stringify(this.fieldConfig.field.control.formula));
    matches.forEach(newVariable => {
      const groupData = this.group.get(newVariable).value;
      const name = newVariable;
      const replaceName = this.fieldConfig.field.control.operatorType === 'number' 
      ? formula.replaceAll(/\s/g, '') : formula.replaceAll(/\s/g, ' ');
      const re = new RegExp(name);
      if (groupData !== null && groupData !== '' && groupData !== undefined) {
        formula = replaceName.replaceAll(name, groupData);
      } else {
        formula = replaceName.replaceAll(name, this.fieldConfig.field.control.operatorType === 'number' ? 0 : '');
      }
    });

    if (formula != null && !formula.includes('${')) {
      let value;
      if (this.fieldConfig.field.control.operatorType === 'number') {
        value = this.stringMath(formula);
      } else if (this.fieldConfig.field.control.fieldType === 'string') {
        value = this.seperateConcat(formula);
      }
      this.group.get(this.fieldConfig.field.name).setValue(value);
    }
  }

  setComputeFieldValueChanges() {
    if (this.fieldConfig.controlType && this.fieldConfig.controlType === 'computeFields') {
      // if (this.fieldConfig.field.control.fieldType === 'long') {
      if (this.fieldConfig.field.control.operatorType === 'date') {
        const dateType = this.fieldConfig.field.control.computeDateBy;
        // this.calculateDateDiff(this.fieldConfig.field.control.leftDateField, this.fieldConfig.field.control.rightDateField,
        //   dateType);
        const matches = [];
        matches.push(this.fieldConfig.field.control.leftDateField);
        matches.push(this.fieldConfig.field.control.rightDateField);
        if (matches) {
          matches.forEach(variable => {
            this.group.get(variable).valueChanges.subscribe(data => {
              if (data !== null && data !== '' && data !== undefined) {
                const leftDateField = this.group.get(this.fieldConfig.field.control.leftDateField).value;
                const rightDateField = this.group.get(this.fieldConfig.field.control.rightDateField).value;
                if (rightDateField !== null && rightDateField.length > 9 && leftDateField !== null && leftDateField.length > 9) {
                  this.group.get(this.fieldConfig.field.name).setValue(this.calculateDateDiff(leftDateField, rightDateField, dateType));
                }
              }
            });
          });
        }
      }
      else {
        const matches = this.fieldConfig.field.control.formulaFields;
        this.getComputeValues(matches);
        if (matches) {
          matches.forEach(variable => {
            this.group.get(variable).valueChanges.subscribe(data => {
              if (data !== undefined && data !== null) {
                this.getComputeValues(matches);
              }
            });
          });
        }
      }
      // }

          // const formula = this.fieldConfig.field.control.formula;
          // var splitted = formula.replace("${", '');

          // var regExp = /\(([${^})]+)\)/;
          // var matches = regExp.exec(this.fieldConfig.field.control.formula);

          //     const matches = this.fieldConfig.field.control.formulaFields;
          //     if (matches) {
          //       matches.forEach(variable => {
          //         this.group.get(variable).valueChanges.subscribe(data => {
          //           if (data !== null && data !== '' && data !== undefined) {
          //             let formula = JSON.parse(JSON.stringify(this.fieldConfig.field.control.formula));
          //             matches.forEach(newVariable => {
          //               const groupData = this.group.get(newVariable).value;
          //               const name = newVariable;
          //               const replaceName = formula.replace(/\s/g, '');
          //               const re = new RegExp(name);
          //               if (groupData !== null && groupData !== '' && groupData !== undefined) {
          //                 formula = replaceName.replace(name, groupData);
          //               } else {
          //                 formula = replaceName.replace(name, 0);
          //               }
          //             });

          //             if (formula != null && !formula.includes('${')) {
          //               const value = this.stringMath(formula);
          //               this.group.get(this.fieldConfig.field.name).setValue(value);
          //             }
          //           }
          //         });
          //       });
          //     }
          //   }

          // } else if (this.fieldConfig.field.control.fieldType === 'string') {

          // }
    }
  }

  calculateDateDiff(firstDate, secondDate, computeType) {
    const firstDateValue = moment(firstDate);
    const secondDateValue = moment(secondDate);
    return Math.abs(firstDateValue.diff(secondDateValue, computeType));
  }

  seperateConcat(formula) {
    let concatString = '';
    const concatmatches = formula.split('concatenate(')
      .filter(function (v) { return v.indexOf(',') > -1; })
      .map((value) => {
        return value.split(')')[0];
      });
    if (concatmatches) {
      concatmatches.forEach(matches => {
        matches.split(',')
          .map((value: string) => {
            if (value.includes(',') && value.includes(')')) {
              concatString = concatString + value.substring(1, value.length - 1);
            } else if (value.includes(',')) {
              concatString = concatString + value.substring(1);
            } else if (value.includes(')')) {
              concatString = concatString + value.substring(0, value.length - 1);
            } else {
              concatString = concatString + value;
            }
          });
      });
    }
    return concatString;
  }

  stringMath(eq) {
    const mulDiv = /([+-]?\d*\.?\d+(?:e[+-]\d+)?)\s*([*/])\s*([+-]?\d*\.?\d+(?:e[+-]\d+)?)/;
    const plusMin = /([+-]?\d*\.?\d+(?:e[+-]\d+)?)\s*([+-])\s*([+-]?\d*\.?\d+(?:e[+-]\d+)?)/;
    const parentheses = /(\d)?\s*\(([^()]*)\)\s*/;
    let allowEq;
    while (eq.search(/^\s*([+-]?\d*\.?\d+(?:e[+-]\d+)?)\s*$/) === -1 && (allowEq !== eq || allowEq === undefined)) {
      eq = fParentheses(eq);
      allowEq = eq;
    }
    return eq;

    function fParentheses(eq) {
      while (eq.search(parentheses) !== -1) {
        eq = eq.replace(parentheses, function (a, b, c) {
          c = fMulDiv(c);
          c = fPlusMin(c);
          return typeof b === 'string' ? b + '*' + c : c;
        });
      }
      eq = fMulDiv(eq);
      eq = fPlusMin(eq);
      allowEq = eq;
      return eq;
    }

    function fMulDiv(eq) {
      while (eq.search(mulDiv) !== -1) {
        eq = eq.replace(mulDiv, function (a) {
          const sides = mulDiv.exec(a);
          const result = sides[2] === '*' ? +sides[1] * +sides[3] : +sides[1] / +sides[3];
          return result >= 0 ? '+' + result : result;
        });
      }
      allowEq = eq;
      return eq;
    }

    function fPlusMin(eq) {
      eq = eq.replace(/([+-])([+-])(\d|\.)/g, function (a, b, c, d) { return (b === c ? '+' : '-') + d; });
      while (eq.search(plusMin) !== -1) {
        eq = eq.replace(plusMin, function (a) {
          const sides = plusMin.exec(a);
          return sides[2] === '+' ? +sides[1] + +sides[3] : +sides[1] - +sides[3];
        });
      }
      allowEq = eq;
      return eq;
    }
  }

  onSelect(event, country) {
    if (event.target.value === '' || this.group.get(this.fieldConfig.field.name).value === null) {
      // this.group.get(this.fieldConfig.field.name).markAsDirty()
      this.showError = true;
    }

    this.checkNumber();
  }

  setVariableValue() {
    if (this.fieldConfig.controlType === 'input' && this.fieldConfig.field.dataType !== 'string' &&
      this.fieldConfig.field.control && this.fieldConfig.field.control.operator) {
      this.group.get(this.fieldConfig.field.name).setValue(this.computationOperations());
    }
  }

  computationOperations() {
    if (this.fieldConfig.controlType === 'input' && this.fieldConfig.field.dataType !== 'string' &&
      this.fieldConfig.field.control.operator) {
      if (this.fieldConfig.field.control.operator === 'addition') {
        return this.add(this.fieldConfig.field.control.variableArray);
      } else if (this.fieldConfig.field.control.operator === 'subtraction') {
        return this.subtract(this.fieldConfig.field.control.variableArray);
      } else if (this.fieldConfig.field.control.operator === 'multiplication') {
        return this.multiply(this.fieldConfig.field.control.variableArray);
      } else {
        return this.division(this.fieldConfig.field.control.variableArray);
      }
    }
  }

  add(variable) {
    for (let i = 0; i < variable.length; i++) {
      if (variable[i].variableType === 'constant') {
        if (i === 0) {
          this.sum = variable[i].variableName;
        } else {
          const numberValue: number = +(variable[i].variableName);
          this.sum = this.sum + numberValue;
        }
        this.read = true;
      }
      if (variable[i].variableType === 'pagefield') {
        const numberValue: number = +(this.group.get(this.fieldConfig.field.control.variableArray[i].variableName).value);
        if (i === 0) {
          this.sum = numberValue;
        } else {
          this.sum = this.sum + numberValue;
        }
        this.read = true;
      }
    }
    return this.sum;
  }

  subtract(variable) {
    for (let i = 0; i < variable.length; i++) {
      if (variable[i].variableType === 'constant') {
        if (i === 0) {
          this.sum = variable[i].variableName;
        } else {
          const numberValue: number = +(variable[i].variableName);
          this.sum = this.sum - numberValue;
        }
        this.read = true;
      }
      if (variable[i].variableType === 'pagefield') {
        const numberValue: number = +(this.group.get(this.fieldConfig.field.control.variableArray[i].variableName).value);
        if (i === 0) {
          this.sum = numberValue;
        } else {
          this.sum = this.sum - numberValue;
        }
        this.read = true;
      }
    }
    return this.sum;
  }

  multiply(variable) {
    for (let i = 0; i < variable.length; i++) {
      if (variable[i].variableType === 'constant') {
        if (i === 0) {
          this.sum = variable[i].variableName;
        } else {
          const numberValue: number = +(variable[i].variableName);
          this.sum = this.sum * numberValue;
        }
        this.read = true;
      }
      if (variable[i].variableType === 'pagefield') {
        const numberValue: number = +(this.group.get(this.fieldConfig.field.control.variableArray[i].variableName).value);
        if (i === 0) {
          this.sum = numberValue;
        } else {
          this.sum = this.sum * numberValue;
        }
        this.read = true;
      }
    }
    return this.sum;
  }

  division(variable) {
    for (let i = 0; i < variable.length; i++) {
      if (variable[i].variableType === 'constant') {
        if (i === 0) {
          this.sum = variable[i].variableName;
        } else {
          const numberValue: number = +(variable[i].variableName);
          this.sum = this.sum / numberValue;
        }
        this.read = true;
      }
      if (variable[i].variableType === 'pagefield') {
        const numberValue: number = +(this.group.get(this.fieldConfig.field.control.variableArray[i].variableName).value);
        if (i === 0) {
          this.sum = numberValue;
        } else {
          this.sum = this.sum / numberValue;
        }
        this.read = true;
      }
    }
    return this.sum;
  }

  setEmailvalidation() {
    if (this.fieldConfig.controlType === 'email' && this.fieldConfig.field.validations.length === 2
      && this.fieldConfig.field.validations.some(field => field.type === 'pattern')) {
      this.emailValid = true;
    } else if (this.fieldConfig.controlType === 'email' && this.fieldConfig.field.validations.length === 3) {
      this.emailValid = true;
      this.requiredEmail = true;
    } else if (this.fieldConfig.controlType === 'email' && this.fieldConfig.field.validations.length === 1) {
      this.emailValid = false;
    }
  }

  setInputType() {

    if (this.fieldConfig.controlType === 'input') {
      if (this.fieldConfig.field.dataType === 'string') {
        this.type = 'text';
      } else if (this.fieldConfig.field.dataType === 'float' || this.fieldConfig.field.dataType === 'long') {
        this.type = 'number';
      }
    } else if (this.fieldConfig.controlType === 'email') {
      this.type = 'email';
    } else if (this.fieldConfig.controlType === 'tel') {
      this.type = 'tel';
    }
  }


  addRequiredFields() {
    if (this.fieldConfig.field.conditionalChecks) {
      const conditionalDetails = this.fieldConfig.field.conditionalChecks.required;
      if (conditionalDetails && conditionalDetails.option === true) {
        this.group.get(this.fieldConfig.field.name).valueChanges.subscribe(value => {
          if (value) {
            this.validationService.addConditionalRequiredValidations(value, this.group, conditionalDetails.fields,
              this.fieldConfig.field);
          }
        });
      }
    }
  }

  openComponent() {
    const value = this.group.get(this.fieldConfig.field.name).value;
    if (value !== null && value !== '') {
      if (this.fieldConfig.field.control.screenType === 'rightSheet') {
        const bottomSheetRef = this.rightSheet.open(ApplicationRightSheetComponent, {
          disableClose: true,
          data: this.getLoadComponentJsonValues(),
          panelClass: 'right-sheet-container'
        });
      } else {
        const dialogRef = this.dialog.open(ApplicationDialogBoxComponent, {
          disableClose: true,
          width: '1000px',
          height: '600px',
          data: this.getLoadComponentJsonValues(),
        });
        dialogRef.afterClosed().subscribe(data => {
          if (data === true) {
          }
        });
      }
    }
  }

  getLoadComponentJsonValues() {
    const targetPageColumnName = this.fieldConfig.field.control.targetPageColumnName;
    return {
      id: targetPageColumnName, pId: this.group.get(this.fieldConfig.field.name).value
      , pageIdentifier: this.fieldConfig.field.control.targetPageId, version: this.fieldConfig.field.control.version,
      pageType: 'hyperLink', pageName: this.fieldConfig.field.control.targetPageId
    };
  }

  numberFromField() {
    if (!(this.fieldConfig.field.numberFieldValidation === undefined || this.fieldConfig.field.numberFieldValidation === null)) {
      if (this.fieldConfig.field.numberFieldValidation.numberFieldValidation === true) {
        const operator = this.fieldConfig.field.numberFieldValidation.operator;
        const numberFieldValidation = this.fieldConfig.field.numberFieldValidation;
        this.group.get(numberFieldValidation.fromField).valueChanges.subscribe(data => {
          if ((this.group.get(numberFieldValidation.toField).value !== null
            && this.group.get(numberFieldValidation.fromField).value !== null)) {
            if (operator === 'lt') {
              if (this.group.get(numberFieldValidation.toField).value < data) {
                return this.group.get('' + this.fieldConfig.field.name).setErrors({ lessValid: true });
              } else {
                this.allowNumberFieldValidation = false;
                return this.group.get('' + this.fieldConfig.field.name).setErrors(null);
              }
            }
            if (operator === 'gt') {
              if (this.group.get(numberFieldValidation.toField).value > data) {
                return this.group.get('' + this.fieldConfig.field.name).setErrors({ greaterValid: true });
              } else {
                this.allowNumberFieldValidation = false;
                return this.group.get('' + this.fieldConfig.field.name).setErrors(null);
              }
            }
          }
        });
      }
    }
  }

  numberToField() {
    if (!(this.fieldConfig.field.numberFieldValidation === undefined || this.fieldConfig.field.numberFieldValidation === null)) {
      if (this.fieldConfig.field.numberFieldValidation.numberFieldValidation === true) {
        const operator = this.fieldConfig.field.numberFieldValidation.operator;
        const numberFieldValidation = this.fieldConfig.field.numberFieldValidation;
        this.group.get(numberFieldValidation.toField).valueChanges.subscribe(data => {
          if ((this.group.get(numberFieldValidation.toField).value !== null
            && this.group.get(numberFieldValidation.fromField).value !== null)) {
            if (operator === 'lt') {
              if (this.group.get(numberFieldValidation.fromField).value > data) {
                return this.group.get('' + this.fieldConfig.field.name).setErrors({ lessValid: true });
              } else {
                this.allowNumberFieldValidation = false;
                return this.group.get('' + this.fieldConfig.field.name).setErrors(null);
              }
            }
            if (operator === 'gt') {
              if (this.group.get(numberFieldValidation.fromField).value < data) {
                return this.group.get('' + this.fieldConfig.field.name).setErrors({ greaterValid: true });
              } else {
                this.allowNumberFieldValidation = false;
                return this.group.get('' + this.fieldConfig.field.name).setErrors(null);
              }
            }
          }
        });
      }
    }
  }

}
