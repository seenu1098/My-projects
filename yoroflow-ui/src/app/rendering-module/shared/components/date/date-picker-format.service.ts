import { Injectable } from '@angular/core';
import { NativeDateAdapter, MatDateFormats } from '@angular/material/core';
import { DateComponent } from './date.component';


@Injectable({
  providedIn: 'root'
})
export class DatePickerFormatService extends NativeDateAdapter {
  dateFormat = 'DD-MMM-YYYY';
  /*format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return moment(date).format(this.dateFormat);
    } else {
      return date.toISOString();
    }
  }*/
}

export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long", day: "numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};
