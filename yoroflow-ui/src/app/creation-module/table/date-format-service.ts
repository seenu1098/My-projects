import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {

  private _format: string;
  private _locale: string;

  public constructor() {
    this._format = 'MM/DD/yyyy';
    this._locale = 'en-US';
  }

  public get format(): string {
    return this._format;
  }
  public set format(value: string) {

    this._format = value;
  }

  public get locale(): string {
    return this._locale;
  }
  public set locale(value: string) {

    this._locale = value;
  }
}
