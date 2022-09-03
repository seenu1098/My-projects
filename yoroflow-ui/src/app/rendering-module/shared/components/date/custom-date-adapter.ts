import { Injectable, Optional, Inject } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateFormatService } from './date-format-service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Moment } from 'moment';

@Injectable()
export class CustomDateAdapter extends MomentDateAdapter {
    constructor(private _dateTimeService: DateFormatService, @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string) {
        super(_dateTimeService.format);
    }

    createDate(year: number, month: number, date: number): Moment {
        // Moment.js will create an invalid date if any of the components are out of bounds, but we
        // explicitly check each case so we can throw more descriptive errors.
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }

        if (date < 1) {
            throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
        }

        const result = moment.utc({ year, month, date }).locale(this.locale);

        // If the result isn't valid, the date must have been out of bounds for this month.
        if (!result.isValid()) {
            throw Error(`Invalid date "${date}" for month with index "${month}".`);
        }

        return result;
    }

    public format(date: moment.Moment, displayFormat: string): string {
        // const locale = this._dateTimeService.locale;
        const format = this._dateTimeService.format;
        const result = date.format(format);
        return result;
    }
}
