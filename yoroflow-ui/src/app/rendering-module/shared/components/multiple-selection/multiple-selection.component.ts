import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field, OptionsValue } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { ActivatedRoute } from '@angular/router';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { DynamicDialogComponent } from '../../../dynamic-dialog/dynamic-dialog.component';
import { DynamicRightSheetComponent } from '../../../dynamic-right-sheet/dynamic-right-sheet.component';

@Component({
  selector: 'app-multipleselect',
  template: `
  <ng-container *ngIf="showControl">
  <div [style]="field.style" style="width:100%">
  <mat-form-field  [formGroup]="group" style="width: 100%" [floatLabel]="field.label.labelOption"
   [style.background-color]="field.rowBackground" appearance="outline">
  <mat-label>{{field.label.labelName}}</mat-label>
  <mat-select [id]="field.label.labelName" [formControlName]="field.name" multiple>
  <ng-container *ngIf="field.control.optionType ==='s' ">
  <mat-option *ngFor="let item of field.control.optionsValues" [value]="item.code"
  [id]="item.description">{{item.description}}</mat-option>
  </ng-container>
  <ng-container *ngIf="field.control.optionType ==='d'">
  <ng-container *ngIf="field.control.defaultValues !== undefined ">
<ng-container *ngIf="field.control.defaultValues.defaultValue === true">
<mat-option [value]="-1">{{field.control.defaultValues.descValue}}</mat-option></ng-container>
</ng-container>
  <mat-option *ngFor="let item of dynamicOptions" [value]="item.code" [id]="item.description">{{item.description}}</mat-option>
  </ng-container>
  </mat-select>
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
export class MultipleSelectionComponent implements OnInit {
  field: Field;
  group: FormGroup;
  pageIdentifier: string;
  showControl = true;
  dynamicOptions: OptionsValue[];
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

  // tslint:disable-next-line: max-line-length
  constructor(public el: ElementRef, public formService: CreateFormService, public activateRoute: ActivatedRoute
    , public dynamicService: DynamicQueryBuilderService) { }
  ngOnInit() {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    this.activateRoute.paramMap.subscribe(params => {
      if (params.get('id') !== null && params.get('id') !== undefined) {
        this.pageIdentifier = params.get('id');
      } else {
        this.pageIdentifier = this.group.get('pageIdentifier').value;
      }
    });
    // this.formService.disableFormFields(this.field, this.group);
    if (this.group.get(this.field.name) && this.group.get(this.field.name).hasError('required')) {
      this.required = ' *';
    }
    if (this.field.control.optionType === 'd') {
      // this.dynamicOptions = this.formService.getDynamicOptionValues(this.field.control);
      // this.dynamicOptions =   this.formService.getDynamicOptionValues(this.pageIdentifier ,this.field.name );
      if (this.group.get('publicpage')) {
        this.dynamicService.getPublicListValues(this.pageIdentifier, this.field.name, this.group.get('version').value).subscribe(data => {
          this.dynamicOptions = data;
        });
      } else {
        this.dynamicService.getListValues(this.pageIdentifier, this.field.name, this.group.get('version').value).subscribe(data => {
          this.dynamicOptions = data;

        });
      }

    }
    this.isRequired = this.formService.getIsRequiredValue(this.field.validations);
    this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
    this.formService.checkConditionallyEnableValidation(this.field, this);
    this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
    this.formService.checkConditionallyShowValidation(this.field, this);
    this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
  }
}
