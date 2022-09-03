import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';


@Component({
  selector: 'app-checkbox',
  template: `
<ng-container  [formGroup]="group" *ngIf="showControl">
<div [style]="field.style" style="width:100%">
<div style="width: 100%;" fxLayout="column" [style.background-color]="field.rowBackground">
<ng-container *ngIf="field.control.orientation==='horizontal'">
<mat-checkbox [id]=idName [formControlName]="field.name" style="margin:2%">{{field.label.labelName}}</mat-checkbox>
</ng-container>
<ng-container *ngIf="field.control.orientation==='vertical'">
<mat-checkbox [id]=idName [formControlName]="field.name" style="margin:2%"></mat-checkbox>
<div fxLayout="row" style="padding-left:10px">
{{field.label.labelName}}
</div>
</ng-container>
<div style="padding-left:10px" [style.background-color]="field.rowBackground">
<ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
<mat-error *ngIf="group.get(field.name).hasError(validation.type) && group.get(field.name).touched">
{{formService.getValidationErrorMessage(validation,field.label.labelName)}}</mat-error>
</ng-container>
</div>
</div>
</div>
</ng-container>
`,
  styles: []
})
export class CheckboxComponent implements OnInit {
  field: Field;
  group: FormGroup;
  showControl = true;
  isRequired = false;
  idName : string;

  constructor(public el: ElementRef, public formService: CreateFormService) { }
  ngOnInit() {

    // this.formService.disableFormFields(this.field, this.group);
    if (window.matchMedia('only screen and (max-width: 600px)').matches) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    this.isRequired = this.formService.getIsRequiredValue(this.field.validations);
    this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
    this.formService.checkConditionallyEnableValidation(this.field, this);
    this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
    this.formService.checkConditionallyShowValidation(this.field, this);
    this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
    this.idName = this.field.name+" "+ Math.random().toString(36).substring(2, 15);
  }
}
