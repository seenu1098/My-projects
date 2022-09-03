import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field, OptionsValue, Select } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { ActivatedRoute } from '@angular/router';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { LoadFormService } from '../../service/form-service/load-form.service';
import { MatDialog } from '@angular/material/dialog';
import { MatRightSheet } from 'mat-right-sheet';
import { DynamicDialogComponent } from '../../../dynamic-dialog/dynamic-dialog.component';
import { DynamicRightSheetComponent } from '../../../dynamic-right-sheet/dynamic-right-sheet.component';
import { empty } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { FormValidationService } from '../../service/form-service/form-validation.service';

@Component({
  selector: 'app-select',
  template: `
  <ng-container *ngIf="showControl">
  <div [style]="field.style" style="width:100%">
<mat-form-field style="width: 100%" [style.background-color]="field.rowBackground" [formGroup]="group" [floatLabel]="field.label.labelOption"
appearance="outline">
<mat-label>{{field.label.labelName}}{{required}}</mat-label>
<mat-select [id]="field.label.labelName" [formControlName]="field.name" [placeholder]="field.label.labelName + required" >
<ng-container *ngIf="field.control.optionType ==='s'">
<mat-option *ngFor="let item of field.control.optionsValues" [matTooltip]="item.description"
[value]="item.code" [id]="item.description">
{{item.description}}</mat-option>
</ng-container>
<ng-container *ngIf="field.control.optionType ==='d'">
<ng-container *ngIf="field.control.defaultValues !== undefined ">
<ng-container *ngIf="field.control.defaultValues.defaultValue === true">
<mat-option [value]="'-1'">{{field.control.defaultValues.descValue}}</mat-option></ng-container>
</ng-container>
<mat-option *ngFor="let item of dynamicOptions" [value]="item.code" 
(onSelectionChange)="loadForm($event)" [id]="item.description">
{{item.description}}</mat-option>
</ng-container>
</mat-select>
<ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
<mat-error *ngIf="group.get(field.name) && group.get(field.name).hasError(validation.type)">
{{formService.getValidationErrorMessage(validation,field.label.labelName)}}</mat-error>
</ng-container>
</mat-form-field>
</div>
</ng-container >
`,
  styles: []
})
export class SelectComponent implements OnInit {
  field: Field;
  group: FormGroup;
  pageIdentifier: string;
  dynamicOptions: OptionsValue[];
  showControl = true;
  targetPageId;
  isEdit: boolean;
  filterVO: Select;
  values: string[] = [];
  duplicateValues = false;
  isRequired = false;
  publicPage = false;
  pageId: any;
  version: any;
  required = '';
  constructor(public el: ElementRef, public formService: CreateFormService, public activateRoute: ActivatedRoute,
    public dynamicService: DynamicQueryBuilderService, public loadFormService: LoadFormService,
    public dialog: MatDialog, public validationService: FormValidationService, public rightSheet: MatRightSheet) {

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
    this.activateRoute.paramMap.subscribe(params => {
      if (params.get('id') !== null) {
        this.pageIdentifier = params.get('id');
      } else {
        if (this.group.get('pageIdentifier')) {
          this.pageIdentifier = this.group.get('pageIdentifier').value;
        }

      }
    });
    // this.formService.disableFormFields(this.field, this.group);
    if (this.group.get(this.field.name) && this.group.get(this.field.name).hasError('required')) {
      this.required = ' *';
    }
    if (this.group.get('update')) {
      this.isEdit = this.group.get('update').value;
    }
    if (this.field.defaultCode && this.field.control.optionType === 's' && (this.group.get(this.field.name).value === null
      || this.group.get(this.field.name).value === undefined || this.group.get(this.field.name).value === '')) {
      this.group.get(this.field.name).setValue(this.field.defaultCode);
    }


    this.isRequired = this.formService.getIsRequiredValue(this.field.validations);
    this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
    this.formService.checkConditionallyEnableValidation(this.field, this);
    this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
    this.formService.checkConditionallyShowValidation(this.field, this);
    this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
    this.checkPublicPage();
    this.loadConstantOptions();
    this.loadInitialOptions();
    this.loadDynamicOptionValues();
  }

  loadInitialOptions() {
    if (this.field.control.optionType === 'd') {
      if (this.field.control.filters && this.field.control.filters.length > 0) {
        this.field.control.filters.forEach(element => {
          if (element.valueType === 'fieldName') {
            const value = this.group.get(element.fieldName).value;
            if (value !== null && value !== '') {
              element.value = value;
              this.filterVO = this.field.control;
              if (this.publicPage) {
                this.dynamicService.getPublicDynamicListByFilterValue(this.filterVO).subscribe(data => {
                  if (data !== [] && data !== null && data.length > 0) {
                    this.dynamicOptions = data;
                    if (this.field.control.optionType === 'd' && this.field.control.filter
                      && this.field.control.filter.loadFirstOption && this.dynamicOptions.length === 1) {
                      this.group.get(this.field.name).setValue(this.dynamicOptions[0].code);
                    }
                  }
                });
              } else {
                this.dynamicService.getDynamicListByFilterValue(this.filterVO).subscribe(data => {
                  if (data !== [] && data !== null && data.length > 0) {
                    this.dynamicOptions = data;
                    if (this.field.control.optionType === 'd' && this.field.control.filter
                      && this.field.control.filter.loadFirstOption && this.dynamicOptions.length === 1) {
                      this.group.get(this.field.name).setValue(this.dynamicOptions[0].code);
                    }
                  }

                });
              }
            }
          }
        });
      }
    }

  }


  loadConstantOptions() {
    if (this.publicPage) {
      this.dynamicService.getPublicListValues(this.pageId, this.field.name,
        this.version).subscribe(data => {
          if (data !== [] && data !== null && data.length > 0) {
            this.dynamicOptions = data;
            if (this.field.control.optionType === 'd' && this.field.control.filter
              && this.field.control.filter.loadFirstOption && this.dynamicOptions.length === 1) {
              this.group.get(this.field.name).setValue(this.dynamicOptions[0].code);
            }
          }
        });
    } else {
      this.dynamicService.getListValues(this.pageId, this.field.name,
        this.version).subscribe(data => {
          if (data !== [] && data !== null && data.length > 0) {
            this.dynamicOptions = data;
            if (this.field.control.optionType === 'd' && this.field.control.filter
              && this.field.control.filter.loadFirstOption && this.dynamicOptions.length === 1) {
              this.group.get(this.field.name).setValue(this.dynamicOptions[0].code);
            }
          }
        });
    }
  }

  checkPublicPage() {
    if (this.group.get('pageIdentifier') && this.group.get('version')) {
      this.pageId = this.group.get('pageIdentifier').value;
      this.version = this.group.get('version').value;
    } else if (this.group.parent && this.group.parent.get('pageIdentifier')) {
      this.pageId = this.group.parent.get('pageIdentifier').value;
      this.version = this.group.parent.get('version').value;
    } else if (this.group.parent && this.group.parent.parent && this.group.parent.parent.get('pageIdentifier')) {
      this.pageId = this.group.parent.parent.get('pageIdentifier').value;
      this.version = this.group.parent.parent.get('version').value;
    }

    if (this.group.get('publicpage')) {
      this.publicPage = true;
    } else if (this.group.parent && this.group.parent.get('publicpage')) {
      this.publicPage = true;
    } else if (this.group.parent && this.group.parent.parent && this.group.parent.parent.get('publicpage')) {
      this.publicPage = true;
    } else {
      this.publicPage = false;
    }
  }

  loadDynamicOptionValues() {
    if (this.field.control.optionType === 'd') {
      if (this.field.control.filters && this.field.control.filters.length > 0) {
        this.field.control.filters.forEach(element => {
          if (element.valueType === 'fieldName') {
            this.group.get(element.fieldName).valueChanges.subscribe(value => {
              if (value != null && value !== '') {
                this.dynamicOptions = [];
                element.value = value;
                this.filterVO = this.field.control;
                if (this.publicPage) {
                  this.dynamicService.getPublicDynamicListByFilterValue(this.filterVO).subscribe(data => {
                    if (data !== [] && data !== null && data.length > 0) {
                      this.dynamicOptions = data;
                      if (this.field.control.optionType === 'd' && this.field.control.filter
                        && this.field.control.filter.loadFirstOption && this.dynamicOptions.length === 1) {
                        this.group.get(this.field.name).setValue(this.dynamicOptions[0].code);
                      }
                    }
                  });
                } else {
                  this.dynamicService.getDynamicListByFilterValue(this.filterVO).subscribe(data => {
                    if (data !== [] && data !== null && data.length > 0) {
                      this.dynamicOptions = data;
                      if (this.field.control.optionType === 'd' && this.field.control.filter
                        && this.field.control.filter.loadFirstOption && this.dynamicOptions.length === 1) {
                        this.group.get(this.field.name).setValue(this.dynamicOptions[0].code);
                      }
                    }
                  });
                }
              }
            });
          }
        });
      }
    }
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
          if (this.duplicateValues) {
            this.validationService.addConditionalRequiredValidations(value, this.group, conditionalDetails.fields,
              this.field);
          }
        });
      }
    }
  }

  isEmpty(obj) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    return JSON.stringify(obj) === JSON.stringify({});
  }


  loadForm(event) {
    const onSelectionVO = this.field.onSelection;
    if (onSelectionVO !== null && event.isUserInput === true) {
      if (onSelectionVO !== null && event.isUserInput === true) {
        if (onSelectionVO.onSelectionChange === true) {
          if (onSelectionVO.fieldType === 'loadData') {
            this.dynamicService.getPageDataByFieldNameAndValue
              (this.pageIdentifier, onSelectionVO.loadDataLabel, event.source.value, this.group.get('version').value).subscribe(data => {
                this.loadFormService.testsetFormValues(this.group, data.data, this.pageIdentifier, this.isEdit,
                  null, this.group.get('version').value);
              });
          } else {
            // tslint:disable-next-line: max-line-length
            const newPage = {
              id: onSelectionVO.passParameter, pageName: onSelectionVO.targetPageId, pId: event.source.value,
              version: onSelectionVO.version, targetPageId: onSelectionVO.targetPageId, pageType: 'action',
            };
            if (onSelectionVO.pageType === 'dialogBox') {
              this.dialog.open(DynamicDialogComponent, {
                width: '1500px',
                data: newPage
              });
            } else if (onSelectionVO.pageType === 'rightSheet') {
              const bottomSheetRef = this.rightSheet.open(DynamicRightSheetComponent, {
                disableClose: false,
                data: newPage,
                panelClass: 'right-sheet-container'
              });
            } else if (onSelectionVO.pageType === 'samePage') {
              this.dynamicService.getPageDataByFieldNameAndValue
                (onSelectionVO.targetPageId, onSelectionVO.passParameter, event.source.value,
                  this.group.get('version').value).subscribe(data => {
                    this.loadFormService.testsetFormValues(this.group, data.data, this.pageIdentifier, this.isEdit,
                      null, this.group.get('version').value);
                  });
            }
            this.dynamicService.getPageDataByFieldNameAndValue
              (onSelectionVO.targetPageId, onSelectionVO.passParameter, event.source.value,
                this.group.get('version').value).subscribe(data => {
                  this.loadFormService.testsetFormValues(this.group, data.data, this.pageIdentifier, this.isEdit
                    , null, this.group.get('version').value);
                });
          }

        }
      }

    }

  }

}
