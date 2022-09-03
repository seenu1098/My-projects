import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Input() filterType: string;
  @Input() group: FormGroup;
  @Output() getDeletedFiltersIds: EventEmitter<any> = new EventEmitter<any>();

  show = false;
  name: string;
  deletedFilterIdList: number[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.setFormArrayName(this.filterType);
    this.initializeFormArray();
  }

  setFormArrayName(filterType: string) {
    if (filterType === 'P') {
      this.name = 'permanentFilterColumns';
    } else if (filterType === 'G') {
      this.name = 'globalFilterColumns';
    } else if (filterType === 'S') {
      this.name = 'filters';
    }
  }

  getFilterFormArray() {
    return (this.group.get(this.name) as FormArray);
  }

  initializeFormArray() {
    this.group.addControl(this.name, this.fb.array([]));
    this.getFilterFormArray().push(this.addFilter());
    this.getFilterFormArray().push(this.addFilter());
    this.show = true;
  }


  addFilter(): FormGroup {
    return this.fb.group({
      filterId: [''],
      filterName: [''],
      operator: [''],
      filterType: [this.filterType],
      filterValue: ['']
    });

  }

  addAnotherFilter(event): void {
    let j = 0;
    if (event) {
      j = 2;
    } else {
      j = 1;
    }
    for (let i = 0; i < j; i++) {
      this.getFilterFormArray().push(this.addFilter());
    }
  }
  removeThisService(i: number) {
    const formArray = this.getFilterFormArray();
    const index = '' + i;
    const deletedId = formArray.get(index).get('filterId').value;
    if (deletedId !== null && deletedId !== '') {
      this.deletedFilterIdList.push(deletedId);
      this.group.markAsDirty();
    }
    this.getFilterFormArray().removeAt(i);
  }

  checkValidation(index) {
    const i = '' + index;
    const form = (this.group.get(this.name) as FormArray).get(i);
    const filterValue = form.get('filterValue');
    const operators = form.get('operator');
    const filterName = form.get('filterName');

    if (filterValue.value) {
      operators.setValidators([Validators.required]);
      filterName.setValidators([Validators.required]);
    } else if (operators.value) {
      filterValue.setValidators([Validators.required]);
      filterName.setValidators([Validators.required]);
    } else if (filterName.value) {
      operators.setValidators([Validators.required]);
      filterValue.setValidators([Validators.required]);
    }
    operators.updateValueAndValidity();
    filterValue.updateValueAndValidity();
    filterName.updateValueAndValidity();
  }

  selectionChange(event, index) {
    const i = '' + index;
    if (event.fieldType === 'date') {
      this.show[index] = true;
      (this.group.get(this.name) as FormArray).get(i).get('filterValue').setValue('');
    } else {
      this.show[index] = false;
      (this.group.get(this.name) as FormArray).get(i).get('filterValue').setValue('');
    }
    this.checkValidation(index);
  }

}
