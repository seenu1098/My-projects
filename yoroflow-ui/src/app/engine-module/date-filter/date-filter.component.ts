import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss']
})
export class DateFilterComponent implements OnInit {
  dateFilterForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DateFilterComponent>,) { }


  ngOnInit(): void {
    this.dateFilterForm = this.fb.group({
      searchType: ['', [Validators.required]],
      startDate: [''],
      endDate: ['']
    });
    if (this.data && this.data === 'fromTaskboard') {
      this.dateFilterForm.get('searchType').setValue('betweenDates');
      this.dateSearch({ value: 'betweenDates' });
    }
  }

  apply() {
    if (this.dateFilterForm.valid) {
      if (this.dateFilterForm.get('searchType').value === 'betweenDates') {
        const filterDate = {
          searchType: this.dateFilterForm.get('searchType').value,
          startDate: this.dateFilterForm.get('startDate').value,
          endDate: this.dateFilterForm.get('endDate').value,
        };
        this.dialogRef.close(filterDate);
      } else {
        const filterDate = {
          searchType: this.dateFilterForm.get('searchType').value,
          startDate: this.dateFilterForm.get('startDate').value,
          endDate: this.dateFilterForm.get('endDate').value,
        };
        this.dialogRef.close(filterDate);
      }
    } else {
      if (this.dateFilterForm.get('searchType').value === 'betweenDates') {
        this.dateFilterForm.get('startDate').markAsTouched();
        this.dateFilterForm.get('endDate').markAsTouched();
      }
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }


  dateSearch(event) {
    const value = event.value;
    if (value === 'betweenDates') {
      this.dateFilterForm.get('startDate').setValidators([Validators.required]);
      this.dateFilterForm.get('endDate').setValidators([Validators.required]);
      this.dateFilterForm.get('startDate').updateValueAndValidity();
      this.dateFilterForm.get('endDate').updateValueAndValidity();
    } else {
      this.clearDateSearchValidation();
    }
  }

  clearDateSearchValidation() {
    this.dateFilterForm.get('startDate').setValidators(null);
    this.dateFilterForm.get('endDate').setValidators(null);
    this.dateFilterForm.get('startDate').updateValueAndValidity();
    this.dateFilterForm.get('endDate').updateValueAndValidity();
  }

}
