import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field, OptionsValue, Select } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { ActivatedRoute } from '@angular/router';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';

@Component({
  selector: 'app-radiobutton',
  template: `
  <ng-container *ngIf="showControl">
  <div [style]="field.style" style="width:100%">
  <div [formGroup]="group" style="margin-bottom:1%" [style.background-color]="field.rowBackground">
  <label>{{field.label.labelName}}:</label>
  <ng-container *ngIf="field.control.orientation==='horizontal'">
     <mat-radio-group id="radio" [formControlName]=" field.name">
      <ng-container *ngIf="field.control.optionType ==='s' ">
          <mat-radio-button *ngFor="let item of field.control.optionsValues" [value]="item.code"
              style="margin-left:7px;margin-top:7px;">
              <span style="margin-left: -5px">{{item.description}}</span></mat-radio-button>
      </ng-container>
      <ng-container *ngIf="field.control.optionType ==='d'">
          <ng-container *ngFor="let item of dynamicOptions">
              <mat-radio-button [value]="item.code" style="margin-left:7px;margin-top:7px;">
                  <span style="margin-left: -5px">{{item.description}}</span></mat-radio-button>
          </ng-container>
      </ng-container>
      </mat-radio-group>
  </ng-container>
  <ng-container *ngIf="field.control.orientation==='vertical'">
      <mat-radio-group id="radio" [formControlName]="field.name">
          <ng-container *ngIf="field.control.optionType ==='s' ">
              <ng-container *ngFor="let item of field.control.optionsValues">
                  <div fxLayout="row">
                      <mat-radio-button [value]="item.code" style="margin-left:7px;margin-top:7px;">
                          <span style="margin-left: -5px">{{item.description}}</span></mat-radio-button>
                  </div>
              </ng-container>
          </ng-container>
          <ng-container *ngIf="field.control.optionType ==='d'">
              <ng-container *ngFor="let item of dynamicOptions">
                  <div fxLayout="row">
                      <mat-radio-button [value]="item.code" style="margin-left:7px;margin-top:7px;">
                          <span style="margin-left: -5px">{{item.description}}</span></mat-radio-button>
                  </div>
              </ng-container>
          </ng-container>
      </mat-radio-group>
  </ng-container>
  <div fxLayout="row">
  <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
          <mat-error *ngIf="group.get(field.name) && group.get(field.name).hasError(validation.type) && group.get(field.name).touched">
              {{formService.getValidationErrorMessage(validation,field.label.labelName)}}</mat-error>
      </ng-container>
      </div>
</div>
</div>
</ng-container>
`,
  styles: []
})
export class RadiobuttonComponent implements OnInit {
  field: Field;
  group: FormGroup;
  pageIdentifier: string;
  showControl = true;
  dynamicOptions: OptionsValue[];
  filterVO: Select;
  isRequired = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
  }

  constructor(public formService: CreateFormService, public el: ElementRef, public activateRoute: ActivatedRoute,
    public dynamicService: DynamicQueryBuilderService) { }
  ngOnInit() {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    this.activateRoute.paramMap.subscribe(params => {
      if (params.get('id') !== null) {
        this.pageIdentifier = params.get('id');
      }
    });
    // this.formService.disableFormFields(this.field, this.group);
    this.isRequired = this.formService.getIsRequiredValue(this.field.validations);
    this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
    // if (this.field.control.optionType === 'd') {
    this.loadDynamicOptionValues();
    // this.dynamicOptions = this.formService.getDynamicOptionValues(this.field.control);
    // this.dynamicOptions = this.formService.getDynamicOptionValues(this.pageIdentifier, this.field.name, this.group.get('version').value);
    // }
    this.formService.checkConditionallyEnableValidation(this.field, this);
    this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
    this.formService.checkConditionallyShowValidation(this.field, this);
    this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
  }

  loadDynamicOptionValues() {
    if (this.field.control.optionType === 'd') {
      if (this.group.get('publicpage')) {
        this.dynamicService.getPublicListValues(this.group.get('pageIdentifier').value, this.field.name,
          this.group.get('version').value).subscribe(data => {
            this.dynamicOptions = data;
          });
      } else {
        this.dynamicService.getListValues(this.group.get('pageIdentifier').value, this.field.name,
          this.group.get('version').value).subscribe(data => {
            this.dynamicOptions = data;
          });
      }

    }
  }
}
