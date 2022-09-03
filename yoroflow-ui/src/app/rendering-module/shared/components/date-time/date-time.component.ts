import { NgxMatDateAdapter, NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { FormValidationService } from '../../service/form-service/form-validation.service';
import { Field } from '../../vo/page-vo';
import { CustomDateAdapter } from '../date/custom-date-adapter';
import { DateFormatService } from '../date/date-format-service';
import { DatePickerFormatService } from '../date/date-picker-format.service';
import { CustomDatetimeAdapter } from './custom-date-time-adapter';

const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'l, LTS'
  },
  display: {
    dateInput: 'YYYY-MM-DD, HH:MM:ss',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss'],
  providers: [
    {
      provide: NgxMatDateAdapter,
      useClass: CustomDatetimeAdapter
      // deps: [MAT_DATE_LOCALE, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    // { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ],
})
export class DateTimeComponent implements OnInit {

  field: Field;
  group: FormGroup;
  showControl = true;
  required = '';
  isRequired = false;

  constructor(public el: ElementRef, public formService: CreateFormService, private df: DateFormatService, public dateFormat: DatePickerFormatService, public validationService: FormValidationService) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
  }

  ngOnInit(): void {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    if (this.group.get(this.field.name).hasError('required')) {
      this.required = ' *';
    }
    this.isRequired = this.formService.getIsRequiredValue(this.field.validations);
    this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
    this.formService.checkConditionallyEnableValidation(this.field, this);
    this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
    this.formService.checkConditionallyShowValidation(this.field, this);
    this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
    // this.setFormat();
  }

  setFormat() {
    return this.field.dateFormat;
  }

}
