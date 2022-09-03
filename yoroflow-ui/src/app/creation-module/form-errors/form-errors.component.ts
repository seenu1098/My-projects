import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-errors',
  templateUrl: './form-errors.component.html',
  styleUrls: ['./form-errors.component.scss']
})
export class FormErrorsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() control: FormControl;
  @Input() force = false;

  // https://github.com/angular/angular/issues/11405#issuecomment-280850945
  // Use these to pass the alternate strings for the errors in the template if you need it different than default.
  @Input() required: string;
  @Input() email: string;
  @Input() pattern: string;
  @Input() equalTo: string;
  @Input() unique: string;
  @Input() min: string;
  @Input() max: string;
  @Input() minDate: string;
  @Input() maxDate: string;
  @Input() err_user_inactive: string;
  @Input() incorrect: string;
  @Input() dateRange: string;
  @Input() invalidGrant: string;
  @Input() banned: string;
  @Input() locked: string;
  @Input() inactive: string;
  @Input() loggedIn: string;
  @Input() minlength: string;
  @Input() maxlength: string;
}
