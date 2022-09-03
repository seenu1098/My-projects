import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { TokenHeaderService } from '../services/token-header.service';
import { CountryCode, CountryCodes } from './country-list';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss']
})
export class CountryListComponent implements OnInit {

  constructor(private httpClient: HttpClient, private fb: FormBuilder, private tokenHeaderService: TokenHeaderService) { }
  @Input() fromSignUp: boolean;
  @Input() country: string;
  @Output() countryEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() paymentEmit: EventEmitter<any> = new EventEmitter<any>();

  countries: Array<CountryCode> = CountryCodes;
  form: FormGroup;


  ngOnInit(): void {
    this.form = this.fb.group({
      country: [this.country],
      searchCountry: []
    });
  }

  countrySelection(event: MatSelectChange): void {
    this.countryEmit.emit(event.value);
    const index = this.countries.findIndex(t => t.name === event.value);
    if (index !== -1) {
      this.paymentEmit.emit(this.countries[index].code);
    }
  }

}
