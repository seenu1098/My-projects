import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { Field } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';

@Component({
    selector: 'app-chip',
    template: `<ng-container *ngIf="showControl">
    <div [style]="field.style" style="width:100%">
                <mat-form-field  style="width: 100%" [formGroup]="group" [floatLabel]="field.label.labelOption"
                 [style.background-color]="field.rowBackground" appearance="outline">
                 <mat-label>{{field.label.labelName}}{{required}}</mat-label>
                    <mat-chip-list #chiplist>
                        <mat-chip *ngFor="let holder of placeholder" [selectable]="selectable"
                            [removable]="removable || this.group.get(this.field.name).status !== 'DISABLED'" (removed)="removeItemsFromChipList(holder)">
                            {{holder.name}}
                            <mat-icon matChipRemove *ngIf="removable">close
                            </mat-icon>
                        </mat-chip>
                        <input [disabled]="this.group.get(this.field.name).status === 'DISABLED'" type="text" id="chip" [placeholder]="field.label.labelName + required" [id]="field.name"
                            [matChipInputFor]="chiplist" [formControlName]="field.name"
                            [matChipInputSeparatorKeyCodes]="separatorKeysCodes" [matChipInputAddOnBlur]="addOnBlur"
                            (matChipInputTokenEnd)="addItemsToChipList($event)" [maxlength]="maxlength" [minlength]="minlength">
                    </mat-chip-list>
                   </mat-form-field>
                   <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error" >
                        <mat-error style="margin-top:-1%" *ngIf="group.get(field.name) && group.get(field.name).hasError(validation.type) &&
                         group.get(field.name).touched">{{formService.getValidationErrorMessage(validation,field.label.labelName)}}
                         </mat-error>
                    </ng-container>
                    </div>
               </ng-container>
`,
    styles: []
})
export class ChipComponent implements OnInit {
    field: Field;
    group: FormGroup;
    showControl = true;

    selectable = true;
    removable = true;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    placeholder: Placeholder[] = [];
    placeholderList = [];
    showError = true;
    maxlength = null;
    minlength = null;
    required = '';
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
    }

    constructor(public el: ElementRef, public formService: CreateFormService) { }
    ngOnInit() {
        // this.formService.disableFormFields(this.field, this.group);
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
        if (this.group.get(this.field.name).hasError('required')) {
            this.required = ' *';
        }
        this.checkRequiredValidation(this.field, this.group);
        this.addConditonallyRequiredValidation(this.field, this.group);
        this.formService.checkConditionallyEnableValidation(this.field, this);
        this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
        this.formService.checkConditionallyShowValidation(this.field, this);
        this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);

        if (this.field.validations.length > 0) {
            this.field.validations.forEach(params => {
                if (params.type === 'minlength') {
                    this.minlength = params.value;
                } else if (params.type === 'maxlength') {
                    this.maxlength = params.value;
                }
            });
        }
    }

    addItemsToChipList(event) {
        if (this.placeholder.length <= this.field.chipSize) {
            this.addData(event, this.placeholder);
        }
    }

    removeItemsFromChipList(holder: Placeholder) {
        this.removeData(holder, this.placeholder);
    }

    addData(event: MatChipInputEvent, list: Placeholder[]) {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            list.push({ name: value.trim() });
        }

        if (list.length > 0) {
            this.group.get(this.field.name).setValidators(null);
            this.group.get(this.field.name).updateValueAndValidity();
        } else {
            this.group.get(this.field.name).setValidators([Validators.required]);
            this.group.get(this.field.name).updateValueAndValidity();
        }
        // Reset the input value
        if (input) {
            input.value = '';
            this.group.get(this.field.name).setValue('');
        }
    }

    removeData(placeholder: Placeholder, list: Placeholder[]): void {
        const index = list.indexOf(placeholder);

        if (index >= 0) {
            list.splice(index, 1);
        }

        if (list.length === 0) {
            this.group.get(this.field.name).setValidators([Validators.required]);
            this.group.get(this.field.name).updateValueAndValidity();
        } else {
            this.group.get(this.field.name).setValidators(null);
            this.group.get(this.field.name).updateValueAndValidity();
        }
    }

    getListFromPlaceHolder(list: Placeholder[]): string[] {
        const values = [];
        list.forEach(placeholder => values.push(placeholder.name));
        if (list.length === 0) {
            this.group.get(this.field.name).setValidators([Validators.required]);
            this.group.get(this.field.name).updateValueAndValidity();
        } else {
            this.group.get(this.field.name).setValidators(null);
            this.group.get(this.field.name).updateValueAndValidity();
        }
        // this.placeholder = values;
        return values;
    }

    getPlaceholderFromStringArrayForExpectedElements(values: string[]): Placeholder[] {
        const output = [];
        if (values && values.length > 0) {
            values.forEach(token => output.push({ name: token }));
        }
        return output;
    }

    checkRequiredValidation(field: Field, group: FormGroup) {

    }

    addConditonallyRequiredValidation(field: Field, group: FormGroup) {
        if (field.conditionalChecks && field.conditionalChecks.required) {
            if (field.conditionalChecks.required.option && field.conditionalChecks.required.option === true
                && field.conditionalChecks.required.fields) {
                field.conditionalChecks.required.fields.forEach(requiredField => {
                    group.get(requiredField.fieldName).valueChanges.subscribe(value => {
                        if (value !== null && value !== '' && value === requiredField.value && this.placeholder.length === 0) {
                            group.get(field.name).setValidators([Validators.required]);
                            group.get(field.name).updateValueAndValidity();
                            const validations = field.validations;
                            if (!validations.some(validation => validation.type === 'required')) {
                                validations.push({ type: 'required', value: null });
                            }
                        } else {
                            group.get(field.name).clearValidators();
                            group.get(field.name).updateValueAndValidity();
                        }
                    });
                });
            }
        }
    }
}

export interface Placeholder {
    name: string;
}
