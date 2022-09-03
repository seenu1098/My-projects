import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Field, DBData, OptionsValue, Select, Filter } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-autocomplete',
    template: `
    <ng-container *ngIf="showControl">
    <div [style]="field.style" style="width:100%">
    <mat-form-field style="width: 100%" [style.background-color]="field.rowBackground" [formGroup]="group" [floatLabel]="field.label.labelOption" appearance="outline">
    <mat-label>{{field.label.labelName}}{{required}}</mat-label>
    <input type="text" [id]="field.label.labelName" [formControlName]="field.name" [placeholder]="field.label.labelName + required"
      matInput [matAutocomplete]="auto" [readonly]="field.editable">
     <mat-autocomplete #auto="matAutocomplete">
     <mat-option *ngFor="let value of dynamicOptions" (onSelectionChange)="setValue($event, value, field.name)"
      [value]="value.code" [id]="value.description">{{value.description}}</mat-option>
     </mat-autocomplete>
 <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
 <mat-error *ngIf="group.get(field.name) && group.get(field.name).hasError(validation.type)">
 {{formService.getValidationErrorMessage(validation,field.label.labelName)}}</mat-error>
 </ng-container>
 </mat-form-field>
 </div>
 </ng-container>
`,
    styles: []
})
export class AutoCompleteComponent implements OnInit {
    field: Field;
    group: FormGroup;
    filterVO: DBData;
    autoCompleteFilter: DBData;
    dynamicOptions: OptionsValue[];
    autoCompleteValue: any;
    allowToGetList = true;
    showControl = true;
    isRequired = false;
    code: any;
    filterArray: any[] = [];
    required = '';
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
    }

    constructor(public el: ElementRef, public formService: CreateFormService,
        public dynamicService: DynamicQueryBuilderService, private fb: FormBuilder) { }
    ngOnInit() {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
        if (!this.group.get('autoCompleteValue')) {
            this.group.addControl('autoCompleteValue', this.fb.control(''));
        }
        if (this.group.get(this.field.name) && this.group.get(this.field.name).hasError('required')) {
            this.required = ' *';
        }
        this.field.editable = this.formService.getReadOnlyValue(this.field.editable);
        this.loadAutocompleteList();
        this.isRequired = this.formService.getIsRequiredValue(this.field.validations);
        this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
        this.formService.checkConditionallyEnableValidation(this.field, this);
        this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
        this.formService.checkConditionallyShowValidation(this.field, this);
        this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
    }

    loadAutocompleteList() {
        this.group.get(this.field.name).valueChanges.subscribe(data => {
            if (data !== null && data !== '') {
                if (this.autoCompleteValue !== data || this.autoCompleteValue === undefined) {

                    const autoComplete = this.field.control as DBData;
                    if (autoComplete.filters && this.group.get('autoCompleteValue')) {
                        autoComplete.filters.forEach(params => {
                            const form = this.group.get('autoCompleteValue').value;
                            // tslint:disable-next-line: prefer-for-of
                            for (let i = 0; i < form.length; i++) {
                                if (form[i].name === params.fieldName) {
                                    params.value = form[i].value;
                                }
                            }
                        });
                        this.filterVO = autoComplete;
                        this.filterVO.filterValue = data;
                    } else {
                        this.filterVO = autoComplete;
                        this.filterVO.filterValue = data;
                    }


                    if (this.group.get('publicpage')) {
                        this.dynamicService.getPublicDynamicListForAutoComplete(this.filterVO).subscribe(param => {
                            this.dynamicOptions = param;
                        });
                    } else {
                        this.dynamicService.getDynamicListForAutoComplete(this.filterVO).subscribe(param => {
                            this.dynamicOptions = param;
                        });
                    }

                    this.autoCompleteValue = data;
                }
            }
        });
    }
    setValue($event, value, formControlName) {
        if ($event.isUserInput) {
            this.code = value.code;
            let index = -1;
            if (this.group.get('autoCompleteArray')) {

                const form = this.group.get('autoCompleteArray').value;
                form.forEach(element => {
                    if (formControlName === element.name) {
                        index = element.index;
                    }
                });
                // tslint:disable-next-line: prefer-for-of
                for (let i = 0; i < form.length; i++) {
                    if (formControlName !== form[i].name && (i > index || index === -1)) {
                        this.group.get(form[i].name).setValue(null);
                    }
                }

            }
            this.filterArray.push({ name: formControlName, value: value.code });
            this.group.get('autoCompleteValue').patchValue(this.filterArray);
            if (this.field.control.fieldNameToBeLoaded) {
                this.group.get(formControlName).setValue(value.description);
                this.group.get(this.field.control.fieldNameToBeLoaded).setValue(value.code);
            } else {
                this.group.get(formControlName).setValue(value.description);
            }
        }
    }

}
