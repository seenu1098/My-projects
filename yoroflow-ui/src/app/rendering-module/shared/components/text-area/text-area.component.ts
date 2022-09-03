import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';

@Component({
    selector: 'app-textarea',
    template: `
    <ng-container *ngIf="showControl">
    <div [style]="field.style" style="width:100%">
<mat-form-field style="width: 100%" [style.background-color]="field.rowBackground" [formGroup]="group" [floatLabel]="field.label.labelOption" appearance="outline">
<mat-label>{{field.label.labelName}}{{required}}</mat-label>
<textarea  matInput [placeholder]="field.label.labelName + required" [id]="field.label.labelName"
    [formControlName]="field.name" [rows]="field.rows" [cols]="field.cols">
    </textarea>
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
export class TextAreaComponent implements OnInit {
    field: Field;
    group: FormGroup;
    showControl = true;
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
    constructor(public el: ElementRef, public formService: CreateFormService) { }
    ngOnInit() {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
        // this.field.editable = this.formService.getReadOnlyValue(this.field.editable);
        // this.formService.disableFormFields(this.field, this.group);
        if (this.group.get(this.field.name).hasError('required')) {
            this.required = ' *';
        }
        this.isRequired = this.formService.getIsRequiredValue(this.field.validations);
        this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
        this.formService.checkConditionallyEnableValidation(this.field, this);
        this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
        this.formService.checkConditionallyShowValidation(this.field, this);
        this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
    }
}
