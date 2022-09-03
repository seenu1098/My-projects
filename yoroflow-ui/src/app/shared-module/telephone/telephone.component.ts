import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { debounceTime } from 'rxjs/operators';
import { CountryCode, CountryCodes } from '../country-list/country-list';

@Component({
  selector: 'app-telephone',
  templateUrl: './telephone.component.html',
  styleUrls: ['./telephone.component.scss']
})
export class TelephoneComponent implements OnInit {
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  @Input() telephoneInput: string;
  @Output() phoneEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() country: EventEmitter<any> = new EventEmitter<any>();
  @Output() countryCode: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup;
  showError: boolean = false;
  countries: Array<CountryCode> = CountryCodes;
  count: number = 0;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      phone: [this.telephoneInput]
    });
    this.formValueChanges();
  }

  formValueChanges(): void {
    this.form.get('phone').valueChanges.pipe(debounceTime(300)).subscribe(data => {
      if (data) {
        const country = this.countries.find(country => country.code === data.countryCode);
        this.phoneEmit.emit(country.dial_code + ' ' + data.number);
        if (this.count === 0) {
          this.country.emit(country.name);
          this.countryCode.emit(country.dial_code);
          this.count++;
        }
      } else {
        this.phoneEmit.emit('');
      }
    });
  }

  checkNumber(): void {
    let phoneNumber = this.form.get('phone').value;
    if (phoneNumber && phoneNumber.number) {
      this.form.get('phone').setValue(phoneNumber.number);
    }
  }

  onSelect(event: any): void {
    if (event.target.value === '') {
      this.showError = true;
    }
    this.checkNumber();
  }

}
