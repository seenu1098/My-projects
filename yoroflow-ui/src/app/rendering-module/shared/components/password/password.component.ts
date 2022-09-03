import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Field, PasswordFields } from '../../vo/page-vo';
import { FormGroup } from '@angular/forms';
import { FormValidationService } from '../../service/form-service/form-validation.service';
import { CreateFormService } from '../../service/form-service/create-form.service';

@Component({
    selector: 'app-password',
    template: `
    <ng-container *ngIf="showControl">
    <div [style]="field.style" style="width:100%">
            <mat-form-field style="width: 100%" [style.background-color]="field.rowBackground" [formGroup]="group" [floatLabel]="field.label.labelOption"
             [id]="field.name" appearance="outline">
             <mat-label>{{field.label.labelName}}{{required}}</mat-label>
              <input matInput [formControlName]="field.name" id="password"
              [placeholder]="field.label.labelName + required" [type]="hide ? 'password' : 'text'">
              <mat-icon matSuffix (click)="hide = !hide">{{hide ? 'visibility_off' : 'visibility'}}</mat-icon>
              <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
                  <mat-error *ngIf="group.get(field.name) && group.get(field.name).hasError(validation.type)">
                  {{formService.getValidationErrorMessage(validation,field.label.labelName)}}</mat-error>
                </ng-container>
                <mat-error *ngIf="group.get(field.name).errors?.confirmPassword">{{field.label.labelName}}
                does not match with {{field.control.passwordfieldLabelName}} </mat-error>
          </mat-form-field>
          </div>
    </ng-container>
            `,
    styles: []
})
export class PasswordComponent implements OnInit {
    field: Field;
    group: FormGroup;
    showControl = true;
    type: string;
    values: string[] = [];
    duplicateValues = false;
    hide = true;
    passwordField: PasswordFields;
    isRequired = false;
    required = '';

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
    }

    constructor(public validationService: FormValidationService, public formService: CreateFormService,
        public el: ElementRef) { }
    ngOnInit() {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
        this.isRequired = this.formService.getIsRequiredValue(this.field.validations);
        this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
        if (this.group.get(this.field.name) && this.group.get(this.field.name).hasError('required')) {
            this.required = ' *';
        }
        this.formService.checkConditionallyEnableValidation(this.field, this);
        this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
        this.formService.checkConditionallyShowValidation(this.field, this);
        this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
        this.checkConfirmPasswordValidation();
        this.checkPasswordValidation();
    }

    checkConfirmPasswordValidation() {
        const passwordFields = this.field.control;
        if (passwordFields.isConfirmPassword === true) {
            this.group.get(this.field.name).valueChanges.subscribe(confirmPasswordFielddata => {
                if ((this.group.get(passwordFields.passwordFieldName).value !== null
                    || this.group.get(this.field.name).value !== null)
                    && this.group.get(passwordFields.passwordFieldName).value !== confirmPasswordFielddata) {
                    this.group.get(this.field.name).setErrors({ confirmPassword: true });
                } else {
                    this.group.get(this.field.name).setErrors({ confirmPassword: false });
                    this.group.get(this.field.name).updateValueAndValidity();
                }
            });
        }
    }


    checkPasswordValidation() {
        const passwordFields = this.field.control;
        if (passwordFields.isConfirmPassword === true) {
            this.group.get(passwordFields.passwordFieldName).valueChanges.subscribe(passwordFielddata => {
                if ((this.group.get(this.field.name).value !== null
                    || this.group.get(passwordFields.passwordFieldName).value !== null)
                    && this.group.get(this.field.name).value !== passwordFielddata) {
                    this.group.get(this.field.name).setErrors({ confirmPassword: true });
                } else {
                    this.group.get(this.field.name).setErrors({ confirmPassword: false });
                    this.group.get(this.field.name).updateValueAndValidity();
                }
            });
        }
    }

    addRequiredFields() {
        if (this.field.conditionalChecks) {
            const conditionalDetails = this.field.conditionalChecks.required;
            if (conditionalDetails && conditionalDetails.option === true) {
                this.group.get(this.field.name).valueChanges.subscribe(value => {
                    if (value) {
                        this.validationService.addConditionalRequiredValidations(value, this.group, conditionalDetails.fields,
                            this.field);
                    }
                });
            }
        }
    }
}
