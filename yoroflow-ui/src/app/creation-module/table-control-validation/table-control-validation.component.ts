import { Component, Inject, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { PageService } from '../page/page-service'
import { FieldConfig, Page, PageField, FieldName, HyperLink, Row, OptionsValue, Select } from '../shared/vo/page-vo';
import { MatSelectChange } from '@angular/material/select';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

@Component({
  selector: 'lib-table-control-validation',
  templateUrl: './table-control-validation.component.html',
  styleUrls: ['./table-control-validation.component.scss']
})
export class TableControlValidationComponent implements OnInit {
  pageIdentifier: any;
  pageVersion: any;

  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<TableControlValidationComponent>,
    private pageService: PageService) { }

  // @Output() public isFilterFieldName = new EventEmitter<any>();
  // @Output() public isEnableFilterValidation = new EventEmitter<any>();
  validationForm: FormGroup;
  columnHeadersCondtionalFields = [];
  tableControlInputType = {};
  originalFieldId: any;
  optionsFormGroup: FormGroup;
  show = false;
  pageNameOptions: Page[];
  pageFields: PageField[];
  sortOptionBoolean = false;
  filterOptionBoolean = false;
  showDateFormat = false;
  valueType: any;
  dynamicpageName: any;
  defaultValue = false;

  public config: PerfectScrollbarConfigInterface = {};

  screenHeight: any;
  formBuilderHeight: any;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = (window.innerHeight - 66) + 'px';
    this.formBuilderHeight = (window.innerHeight - 150) + 'px';
  }

  ngOnInit(): void {
    this.screenHeight = (window.innerHeight - 67) + 'px';
    this.formBuilderHeight = (window.innerHeight - 150) + 'px';

    if (this.data.type === 'validation') {
      this.validationsFormGroup();
      this.columnHeadersCondtionalFields = this.data.columnHeadersCondtionalFields;
      this.loadvalidationGroup();
    }
    if (this.data.type === 'option') {
      this.optionsFormGroup = this.data.formGroup;
      if (this.optionsFormGroup.get('optionType').value === '' || this.optionsFormGroup.get('optionType').value === 's') {
        
      this.optionsFormGroup.get('optionType').setValue('s')
        if ((this.optionsFormGroup.get('optionsValues') as FormArray).length == 0) {
          this.addOptions();
        }
        this.show = true;
        this.loadOptionValues();
      } else {
          this.show = true;
          this.addDynamicFormControls()
          // this.loadDynamicFormControls()
      }
    }
  }

  lengthValidation() {
    const minLength = this.validationForm.get('minLength');
    const maxLength = this.validationForm.get('maxLength');
    if (minLength.value !== null && maxLength.value !== null && minLength.value > maxLength.value) {
      maxLength.setErrors({ maxLogicalError: true });
    } else {
      maxLength.setErrors(null);
    }
  }

  optionTypeChange(event) {
    if (event.value === 'd') {
      this.removeStaticOptionTypeFormControls();
      this.addDynamicFormControls();
    } else {
      this.removeDynamicOptionTypeValues();
      this.addStaticFormControls();
    }

  }

  removeStaticOptionTypeFormControls() {
    this.optionsFormGroup.removeControl('optionsValues');
  }

  removeDynamicOptionTypeValues() {
    this.optionsFormGroup.removeControl('defaultValue');
    this.optionsFormGroup.removeControl('keyValue');
    this.optionsFormGroup.removeControl('descValue');
    this.optionsFormGroup.removeControl('loadFirstOption');
    this.optionsFormGroup.removeControl('pageName');
    this.optionsFormGroup.removeControl('keyColumnName');
    this.optionsFormGroup.removeControl('descriptionColumnName');
    this.optionsFormGroup.removeControl('sortOption');
    this.optionsFormGroup.removeControl('sortBy');
    this.optionsFormGroup.removeControl('filterOptions');
    this.optionsFormGroup.removeControl('filters');

  }

  addDynamicFormControls() {

    this.optionsFormGroup.addControl('defaultValue', this.fb.control(false));
    this.optionsFormGroup.addControl('keyValue', this.fb.control(''));
    this.optionsFormGroup.addControl('descValue', this.fb.control(''));
    this.optionsFormGroup.addControl('loadFirstOption', this.fb.control(false));
    this.optionsFormGroup.addControl('pageName', this.fb.control('', [Validators.required]));
    this.optionsFormGroup.addControl('keyColumnName', this.fb.control('', [Validators.required]));
    this.optionsFormGroup.addControl('descriptionColumnName', this.fb.control('', [Validators.required]));
    this.optionsFormGroup.addControl('sortOption', this.fb.control(false));
    this.optionsFormGroup.addControl('sortBy', this.fb.array([this.sortOptionFormArray()]));
    this.optionsFormGroup.addControl('filterOptions', this.fb.control(false));
    this.optionsFormGroup.addControl('filters', this.fb.array([this.filterOptionFormArray()]));
  }

  addStaticFormControls() {
    this.optionsFormGroup.addControl('optionsValues', this.fb.array([
      this.fb.group({
        code: [, [Validators.required]],
        description: [, [Validators.required]],
      })
    ]));
  }

  changeDefaultValue(event: MatSlideToggle) {
    if (event.checked === true) {
      this.defaultValue = true;
      this.optionsFormGroup.get('keyValue').setValidators([Validators.required]);
      this.optionsFormGroup.get('descValue').setValidators([Validators.required]);
      this.optionsFormGroup.get('keyValue').updateValueAndValidity();
      this.optionsFormGroup.get('descValue').updateValueAndValidity();
    } else {
      this.defaultValue = false;
      this.optionsFormGroup.get('keyValue').setValue('');
      this.optionsFormGroup.get('descValue').setValue('');
      this.optionsFormGroup.get('keyValue').clearValidators();
      this.optionsFormGroup.get('descValue').clearValidators()
      this.optionsFormGroup.get('keyValue').updateValueAndValidity();
      this.optionsFormGroup.get('descValue').updateValueAndValidity();
    }

  }

  loadOptionValues() {
    if (this.data.optionsValues) {
      for (let i = 0; i < this.data.optionsValues.length; i++) {
        const index = '' + i;
        if (i > 0 && !(this.optionsFormGroup.get('optionsValues') as FormArray).get(index)) {
          this.addOptions();
        }
        const form = (this.optionsFormGroup.get('optionsValues') as FormArray).get(index);
        form.get('code').setValue(this.data.optionsValues[i].code);
        form.get('description').setValue(this.data.optionsValues[i].description);
      }
    }
  }

  // loadDynamicFormControls(){
  //   if(this.data.formGroup.value.defaultValue === true){
  //     this.defaultValue = true;
  //   }
  //   if(this.data.formGroup.value.sortOption === true){
  //     this.sortOptionBoolean = true
  //   }
  //   if(this.data.formGroup.value.filterOptions === true){
  //     this.filterOptionBoolean = true
  //   }
  //   if(this.data.formGroup.value.defaultValue !== null){
  //     this.optionsFormGroup.get('defaultValue').setValue(this.data.formGroup.value.defaultValue);
  //   }
  //   if(this.data.formGroup.value.keyValue !== null){
  //     this.optionsFormGroup.get('keyValue').setValue(this.data.formGroup.value.keyValue);
  //   }
  //   if(this.data.formGroup.value.descValue !== null){
  //     this.optionsFormGroup.get('descValue').setValue(this.data.formGroup.value.descValue);
  //   }
  //   if(this.data.formGroup.value.loadFirstOption === true){
  //     this.optionsFormGroup.get('loadFirstOption').setValue(true);
  //   }else{
  //   this.optionsFormGroup.get('loadFirstOption').setValue(false);
  //   }
  //   if(this.data.formGroup.value.sortOption === true){
  //   this.optionsFormGroup.get('sortOption').setValue(true);
  //     this.sortOptionBoolean = true;
  //   }else{
  //     this.sortOptionBoolean = false;
  //     this.optionsFormGroup.get('sortOption').setValue(false);
  //   }
  //   if(this.data.formGroup.value.filterOptions === true){
  //     this.optionsFormGroup.get('filterOptions').setValue(true)
  //     this.filterOptionBoolean = true;
  //   }else{
  //     this.optionsFormGroup.get('filterOptions').setValue(false)
  //     this.filterOptionBoolean = false;
  //   }
  //   if(this.data.formGroup.value.keyColumnName !== null){
  //     this.optionsFormGroup.get('keyColumnName').setValue(this.data.formGroup.value.keyColumnName);
  //   }
  //   if(this.data.formGroup.value.descriptionColumnName !== null){
  //     this.optionsFormGroup.get('descriptionColumnName').setValue(this.data.formGroup.value.descriptionColumnName);
  //   }

  //     // this.pageService.getPageNames().subscribe(data => {
  //     //   this.pageNameOptions = data;
  //       // for(let i=0; i<=  this.pageNameOptions.length; i++){
  //       //   if(this.pageNameOptions[i].pageName == this.data.formGroup.value.pageName){
  //       //     this.pageIdentifier = this.pageNameOptions[i].pageId;
  //       //     this.pageVersion = this.pageNameOptions[i].version;
  //       //   }
  //       // }
  //       // if(this.data.formGroup.value.pageName){
  //       //   this.optionsFormGroup.get('pageName').setValue(this.data.formGroup.value.pageName)
  //       // }
  //       // this.pageService.getTargetPageColumns(this.pageIdentifier, this.pageVersion).subscribe(data => {
  //       //   this.pageFields = data;
  //       //     if (this.data.formGroup.value.keyColumnName) {
  //       //       this.optionsFormGroup.get('keyColumnName').setValue(this.data.formGroup.value.keyColumnName);
  //       //     }
  //       //     if(this.data.formGroup.value.descriptionColumnName){
  //       //       this.optionsFormGroup.get('descriptionColumnName').setValue(this.data.formGroup.value.descriptionColumnName);
  //       //     }
  //       // });
  //     // });
  //       if(this.data.formGroup.value.sortBy){
  //         for (let i = 0; i < this.data.formGroup.value.sortBy.length; i++) {
  //           const index = '' + i;
  //           if (i > 0 && !(this.optionsFormGroup.get('sortBy') as FormArray).get(index)) {
  //             this.addSortOptions();
  //           }
  //           const form = (this.optionsFormGroup.get('sortBy') as FormArray).get(index);
  //           form.get('sortColumnName').setValue(this.data.formGroup.value.sortBy[i].sortColumnName);
  //           form.get('sortType').setValue(this.data.formGroup.value.sortBy[i].sortType);
  //         }
  //       }
     
  //       if(this.data.formGroup.value.filters){
  //         for (let i = 0; i < this.data.formGroup.value.filters.length; i++) {
  //           const index = '' + i;
  //           if (i > 0 && !(this.optionsFormGroup.get('filters') as FormArray).get(index)) {
  //             this.addFilterOption();
  //           }
  //           const form = (this.optionsFormGroup.get('filters') as FormArray).get(index);
  //           form.get('columnName').setValue(this.data.formGroup.value.filters[i].columnName);
  //           form.get('operator').setValue(this.data.formGroup.value.filters[i].operator);
  //           form.get('dataType').setValue(this.data.formGroup.value.filters[i].dataType);
  //           if(this.data.formGroup.value.filters[i].dataType === 'date'){
  //             this.showDateFormat = true;
  //             form.get('dateFormat').setValue(this.data.formGroup.value.filters[i].dateFormat);
  //           }else{
  //             this.showDateFormat = false;
  //             form.get('dateFormat').setValue('');
  //           }
  //           form.get('valueType').setValue(this.data.formGroup.value.filters[i].valueType);
  //           if(this.data.formGroup.value.filters[i].valueType === 'constant'){
  //             this.valueType === 'constant'
  //             form.get('value').setValue(this.data.formGroup.value.filters[i].value);
  //           }else{
  //             this.valueType === 'fieldName'
  //             form.get('fieldName').setValue(this.data.formGroup.value.filters[i].fieldName);
  //           }
  //         }
  //       }
  // }


  getOptionValuesFormArray() {
    return (this.optionsFormGroup.get('optionsValues') as FormArray).controls;
  }

  optionValueFormArray(): FormGroup {
    return this.fb.group({
      code: [, [Validators.required]],
      description: [, [Validators.required]],
    });
  }


  addOptions() {
    (this.optionsFormGroup.get('optionsValues') as FormArray).push(this.optionValueFormArray());
    this.optionsFormGroup.markAsDirty();
  }

  removeOptions(i: number) {
    (this.optionsFormGroup.get('optionsValues') as FormArray).removeAt(i);
    this.optionsFormGroup.markAsDirty();
  }


  ConditionalChecksFormarray(): FormGroup {
    return this.fb.group({
      fieldLabel: [],
      fieldName: ['', Validators.required],
      value: ['', Validators.required],
    });
  }

  loadvalidationGroup() {
    this.originalFieldId = this.data.fieldId;
    this.validationForm.get('required').setValue(this.data.required);
    this.validationForm.get('editable').setValue(this.data.editable);
    this.validationForm.get('conditionalChecks').get('required').get('option').setValue(this.data.requiredWhen.option);
    if (this.data.requiredWhen.option !== null && this.data.requiredWhen.option) {
      const requiredFieldValueArray: any[] = this.data.requiredWhen.fields;
      for (let j = 0; j < requiredFieldValueArray.length; j++) {
        this.addRequiredConditionalChecksArrayInTableColumns();
        const requiredForm = (this.getTableControlRequiredValidationFormArray().get(j + '')) as FormGroup;
        requiredForm.setValue(requiredFieldValueArray[j]);
      }
    }
    if (this.data.allowMinMaxVal === false) {
      this.validationForm.get('minLength').setValue(null);
      this.validationForm.get('maxLength').setValue(null);
      this.validationForm.get('allowPastDate').setValue(this.data.allowPastDate);
      this.validationForm.get('allowFutureDate').setValue(this.data.allowFutureDate);
    } else {
      this.validationForm.get('minLength').setValue(this.data.minLength);
      this.validationForm.get('maxLength').setValue(this.data.maxLength);
    }
  }

  validationsFormGroup() {
    this.validationForm = this.fb.group({
      required: [false],
      editable: [true],
      minLength: [],
      maxLength: [],
      allowPastDate: [false],
      allowFutureDate: [false],
      conditionalChecks: this.fb.group({
        enable: this.fb.group({
          option: [],
          fields: this.fb.array([]),
        }),
        show: this.fb.group({
          option: [],
          fields: this.fb.array([]),
        }),
        required: this.fb.group({
          option: [],
          fields: this.fb.array([]),
        }),
      }),
    });
  }

  changeConditionallyRequiredTableColumns(event: MatSlideToggle) {
    if (event.checked) {
      this.addRequiredConditionalChecksArrayInTableColumns();
    } else {
      this.clearFormArray(this.getTableControlRequiredValidationFormArray());
    }
  }

  addRequiredConditionalChecksArrayInTableColumns() {
    this.getTableControlRequiredValidationFormArray().push(this.ConditionalChecksFormarray());
  }

  getTableControlRequiredValidationFormArray() {
    return (this.validationForm.get('conditionalChecks').get('required').get('fields') as FormArray);
  }

  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  getTableConditionalLevelFormArrayControl() {
    return (this.validationForm.get('conditionalChecks').get('required').get('fields') as FormArray).controls;
  }

  getInputType(type) {
    if (type === 'number') {
      return 'number';
    } else if (type === 'text') {
      return 'text';
    } else if ('date') {
      return 'date';
    }
  }

  setInputTypeForTableColumns(event, type, j) {
    if (event.isUserInput === true) {
      this.tableControlInputType[j] = this.getInputType(type);
    }
  }

  removeRequiredConditionalChecksInTableColumns(j) {
    this.getTableControlRequiredValidationFormArray().removeAt(j);
  }

  getAllPageNames() {
    const pageName = this.optionsFormGroup.get('pageName');
    if (pageName.value === null || pageName.value === '') {
      this.pageService.getPageNames().subscribe(data => {
        this.pageNameOptions = data;
        // this.pageIdentifier = data.pageId;
        // this.pageVersion = data.version;
        // if(this.data.formGroup.value.pageName){
        //   this.optionsFormGroup.get('pageName').setValue(this.data.formGroup.value.pageName)
        // }
      });
    }
  }

  setAutocompleteValidation() {
    const name = this.optionsFormGroup.get('pageName');
    if (this.pageNameOptions !== undefined && this.pageNameOptions.length > 0 &&
      !this.pageNameOptions.some(pageName => pageName.pageName === name.value)) {
      name.setErrors({ invalidPageName: true });
      this.pageFields = [];
    }
  }

  loadPageFieldsAndTableName(event, pageIdentifier, version) {
    if (event.isUserInput === true) {
      this.loadTargetPageColumns(pageIdentifier, version);
      // const dynamic = this.optionsFormGroup.get('field').get('control').get('filter') as FormGroup;
      // dynamic.get('tableName').setValue(pageIdentifier);
      // dynamic.get('version').setValue(version);
    }
  }

  loadTargetPageColumns(pageIdentifierControl, version) {
    this.dynamicpageName = pageIdentifierControl;
    // this.isFilterFieldName.emit(this.dynamicpageName);
    this.pageService.getTargetPageColumns(pageIdentifierControl, version).subscribe(data => {
      this.pageFields = data;
      // if (this.data[0].controlType === 'autocomplete') {
      //   if (this.data.formGroup.value.keyColumnName) {
      //     this.optionsFormGroup.get('keyColumnName').setValue(this.data.formGroup.value.keyColumnName);
      //   }
      //   if(this.data.formGroup.value.descriptionColumnName){
      //     this.optionsFormGroup.get('descriptionColumnName').setValue(this.data.formGroup.value.descriptionColumnName);
      //   }
      // } 
    });
  }

  sortOption(event) {
    if (event.checked === true) {
      this.sortOptionBoolean = true;
      const formArray = this.optionsFormGroup.get('sortBy') as FormArray;
      if (formArray.length <= 0) {
        (this.optionsFormGroup.get('sortBy') as FormArray).push(this.sortOptionFormArray());
      }
    } else {
      this.sortOptionBoolean = false;
      this.setFormArrayFieldsAsNotRequired(this.optionsFormGroup.get('sortBy') as FormArray)
    }
  }

  getSortByFormArray() {
    return (this.optionsFormGroup.get('sortBy') as FormArray).controls;
  }

  sortOptionFormArray(): FormGroup {
    return this.fb.group({
      sortColumnName: ['', [Validators.required]],
      sortType: [false],
    });
  }

  setFormArrayFieldsAsNotRequired(formArray: FormArray) {
    formArray.clear();
  }

  addSortOptions() {
    (this.optionsFormGroup.get('sortBy') as FormArray).push(this.sortOptionFormArray());
    this.optionsFormGroup.markAsDirty();
  }

  removeSortOptions(i: number) {
    (this.optionsFormGroup.get('sortBy') as FormArray).removeAt(i);
    this.optionsFormGroup.markAsDirty();
  }

  filterOption(event) {
    if (event.checked === true) {
      this.filterOptionBoolean = true;
      const formArray = this.optionsFormGroup.get('filters') as FormArray;
      if (formArray.length <= 0) {
        (this.optionsFormGroup.get('filters') as FormArray).push(this.filterOptionFormArray());
      }

    } else {
      this.filterOptionBoolean = false;
      this.setFormArrayFieldsAsNotRequired(this.optionsFormGroup.get('filters') as FormArray)
    }
  }
  getFiltersArray() {
    return (this.optionsFormGroup.get('filters') as FormArray).controls;
  }

  addFilterOption() {
    (this.optionsFormGroup.get('filters') as FormArray).push(this.filterOptionFormArray());
    this.optionsFormGroup.markAsDirty();
    // this.isFilterChange.emit(true);
  }
  removeFilterOption(i: number) {
    (this.optionsFormGroup.get('filters') as FormArray).removeAt(i);
    this.optionsFormGroup.markAsDirty();
    // this.isFilterChange.emit(true);
  }

  filterOptionFormArray(): FormGroup {
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

  datatypeChange(event: any) {
    if (event.value === 'date') {
      this.showDateFormat = true;
    } else {
      this.showDateFormat = false;
    }
  }

  valueOptionTypeChange(event: MatSelectChange, i) {
    this.valueType = event.value;
    const index = '' + i;
    // if (this.valueType === 'constant') {
    //   this.getFiltersArray().get(index).get('value').setValidators([Validators.required]);
    //   this.getFiltersArray().get(index).get('fieldName').setValidators(null);
    //   this.getFiltersArray().get(index).get('fieldName').clearValidators();
    //   this.getFiltersArray().get(index).get('value').updateValueAndValidity();
    //   this.getFiltersArray().get(index).get('fieldName').updateValueAndValidity();
    // } else {
    //   this.getFiltersArray().get(index).get('fieldName').setValidators([Validators.required]);
    //   this.getFiltersArray().get(index).get('value').setValidators(null);
    //   this.getFiltersArray().get(index).get('value').clearValidators();
    //   this.getFiltersArray().get(index).get('value').updateValueAndValidity();
    //   this.getFiltersArray().get(index).get('fieldName').updateValueAndValidity();
    // }

  }



  validateFormArrayFields(formArray: FormArray) {
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.get(i + '') as FormGroup;
      group.get('columnName').markAsTouched({ onlySelf: true });
      group.get('columnName').updateValueAndValidity();
      group.get('operator').markAsTouched({ onlySelf: true });
      group.get('operator').updateValueAndValidity();
      group.get('dataType').markAsTouched({ onlySelf: true });
      group.get('dataType').updateValueAndValidity();
      group.get('valueType').markAsTouched({ onlySelf: true });
      group.get('valueType').updateValueAndValidity();
    }
  }



  submit(userform) {
    if (userform.valid) {
      this.dialogRef.close(this.validationForm.value);
    }
  }

  submitOptions(userform) {
    if (userform.value.optionType === 's') {
      if ((this.optionsFormGroup.get('optionsValues') as FormArray).valid) {
        this.dialogRef.close(this.optionsFormGroup.value);
      }
    } else {
      if(this.optionsFormGroup.get('pageName').valid){
        if(this.optionsFormGroup.get('sortOption').value === false){
          const formArray = this.optionsFormGroup.get('sortBy') as FormArray
          formArray.clear()
        }
        if(this.optionsFormGroup.get('filterOptions').value === false){
          const formArray = this.optionsFormGroup.get('filters') as FormArray
          formArray.clear()
        }
          this.dialogRef.close(this.optionsFormGroup.value);
      }
    }
  }

  cancel(userForm) {
    this.dialogRef.close(false);
  }

}
