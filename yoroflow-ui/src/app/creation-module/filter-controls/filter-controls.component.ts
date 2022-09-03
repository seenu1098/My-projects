import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { PageService } from '../page/page-service';
import { PageField } from '../shared/vo/page-vo';
import { FormfieldComponent } from '../formfield/formfield.component';



@Component({
  selector: 'app-filter-controls',
  templateUrl: './filter-controls.component.html',
  styleUrls: ['./filter-controls.component.css']
})
export class FilterControlsComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() filterData: any;
  selected = '';
  @Input() pageName: any;
  @Input() autoComplete: any;
  @Input() controlType: any;
  @Input() samePageFields: any;

  @Output() isFilterChange: EventEmitter<any> = new EventEmitter<any>();
  pageFields: PageField[];
  dynamicFields: PageField[];
  showDateFormat = false;
  valueType: any;
  showControls = false;
  allowValidation = false;

  constructor(private fb: FormBuilder, private pageService: PageService,
    private changeDetectorRef: ChangeDetectorRef, private formFieldComponent: FormfieldComponent) { }

  ngOnInit() {
    this.formFieldComponent.isFilterFieldName.subscribe(data => {
      if (data !== null) {
        this.pageName = data;
        this.loadPageFields(0);
      }
    });

    this.formFieldComponent.isEnableFilterValidation.subscribe(data => {
      if (data === true) {
        const FormGroup = this.formGroup.get('field').get('control') as FormGroup;
        FormGroup.markAllAsTouched();
        this.allowValidation = true;
      } else {
        this.allowValidation = false;
      }
    });

    const FormGroup = this.formGroup.get('field').get('control') as FormGroup;

    // if (this.controlType === 'autocomplete') {
    //   FormGroup.addControl('filters', this.fb.array([this.filterFormArrayForAutcomplete()]));
    // } else {
    FormGroup.addControl('filters', this.fb.array([this.filterFormArray()]));
    // }
    if (this.filterData) {
      this.loadFilterData();
    }
    if (this.pageName !== undefined) {
      this.loadPageFields(0);
    }
  }

  loadPageFields(i) {
    const index = '' + i;
    const form = (this.formGroup.get('field').get('control').get('filters') as FormArray).get(index);
    if (this.controlType === 'autocomplete') {
      if (this.autoComplete === 'dynamicPage') {
        this.pageService.getTargetPageColumns(this.pageName, 1).subscribe(data => {
          if (data && data.some(field => field.fieldName !== 'Primary Key')) {
            this.pageFields = data;
          }
          this.showControls = true;
          if (this.filterData !== undefined) {
            form.get('columnName').setValue(this.filterData.filters[i].columnName);
          }
        });
      } else if (this.autoComplete === 'customPage') {
        this.pageService.getPageFieldList(this.pageName).subscribe(data => {
          this.pageFields = data;
          this.showControls = true;
        });
      }
    } else {
      this.pageService.getTargetPageColumns(this.pageName, 1).subscribe(data => {
        this.pageFields = data;
        this.showControls = true;
        if (this.filterData && this.filterData.filters !== undefined) {
          // tslint:disable-next-line: no-shadowed-variable
          const form = (this.formGroup.get('field').get('control').get('filters') as FormArray).get(index);
          if (form !== null) {
            form.get('columnName').setValue(this.filterData.filters[i].columnName);
            this.valueType = this.filterData.filters[i].valueType;
            form.get('fieldName').setValue(this.filterData.filters[i].fieldName);
          }
        }
      });
    }

  }

  loadFilterData() {
    if (this.filterData.filters) {
      for (let i = 0; i < this.filterData.filters.length; i++) {
        const index = '' + i;
        if (i > 0) {
          this.addFilters();
        }
        const form = (this.formGroup.get('field').get('control').get('filters') as FormArray).get(index);
        this.loadPageFields(i);
        form.get('columnName').setValue(this.filterData.filters[i].columnName);
        form.get('dataType').setValue(this.filterData.filters[i].dataType);
        form.get('operator').setValue(this.filterData.filters[i].operator);
        form.get('valueType').setValue(this.filterData.filters[i].valueType);
        this.valueType = this.filterData.filters[i].valueType;
        if (this.valueType === 'constant') {
          form.get('value').setValue(this.filterData.filters[i].value);
          form.get('fieldName').clearValidators();
          form.get('fieldName').updateValueAndValidity();
        } else if (this.valueType === 'fieldName') {
          form.get('fieldName').setValue(this.filterData.filters[i].fieldName);
          form.get('value').clearValidators();
          form.get('value').updateValueAndValidity();
        }
        form.get('allowWhenMatched').setValue(this.filterData.filters[i].allowWhenMatched);
        if (this.filterData.filters[i].dataType === 'date') {
          this.showDateFormat = true;
          form.get('dateFormat').setValue(this.filterData.filters[i].dateFormat);
        }

      }

    }
  }
  filterFormArray(): FormGroup {
    return this.fb.group({
      columnName: ['', [Validators.required]],
      value: ['', [Validators.required]],
      dataType: ['', [Validators.required]],
      operator: ['', [Validators.required]],
      valueType: ['', [Validators.required]],
      fieldName: ['', [Validators.required]],
      allowWhenMatched: [],
      dateFormat: [],
    });
  }

  filterFormArrayForAutcomplete(): FormGroup {
    return this.fb.group({
      columnName: ['', [Validators.required]],
    });
  }
  getFiltersArray() {
    return this.formGroup.get('field').get('control').get('filters') as FormArray;
  }
  addFilters() {
    this.getFiltersArray().push(this.filterFormArray());
    this.isFilterChange.emit(true);
  }
  removeFilters(i: number) {
    this.getFiltersArray().removeAt(i);
    this.isFilterChange.emit(true);
  }

  datatypeChange(event: any) {
    if (event.value === 'date') {
      this.showDateFormat = true;
    } else {
      this.showDateFormat = false;
    }
  }
  loadColumnNames(field, i) {
    const index = '' + i;
  }

  optionTypeChange(event: MatSelectChange, i) {
    this.valueType = event.value;
    const index = '' + i;
    if (this.valueType === 'constant') {
      this.getFiltersArray().get(index).get('value').setValidators([Validators.required]);
      this.getFiltersArray().get(index).get('fieldName').setValidators(null);
      this.getFiltersArray().get(index).get('fieldName').clearValidators();
      this.getFiltersArray().get(index).get('value').updateValueAndValidity();
      this.getFiltersArray().get(index).get('fieldName').updateValueAndValidity();
    } else {
      this.getFiltersArray().get(index).get('fieldName').setValidators([Validators.required]);
      this.getFiltersArray().get(index).get('value').setValidators(null);
      this.getFiltersArray().get(index).get('value').clearValidators();
      this.getFiltersArray().get(index).get('value').updateValueAndValidity();
      this.getFiltersArray().get(index).get('fieldName').updateValueAndValidity();
    }

  }

}
