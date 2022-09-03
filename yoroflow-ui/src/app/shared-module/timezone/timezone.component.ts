import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TimezoneService } from './timezone.service';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { CreateOrganizationComponent } from 'src/app/creation-module/create-organization/create-organization.component';
import { UserUpdateOrganizationComponent } from 'src/app/creation-module/user-update-organization/user-update-organization.component';

@Component({
  selector: 'app-timezone',
  templateUrl: './timezone.component.html',
  styleUrls: ['./timezone.component.scss']
})
export class TimezoneComponent implements OnInit {
  timeZoneList: any;
  form: FormGroup;
  filteredBuyersCountry: any;
  newArr: any;
  @Input() fromAutomation: boolean;
  @Input() inputMessage: string;
  @Input() inputData: string;
  @Input() template: any;
  @Input() templateObject: any;
  @Input() templateObject1: any;
  @Input() inputMessage1: string;
  @Input() fromUpdate: boolean;
  @Input() fromUserUpdate: boolean;
  @Output() orgValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() orgValue1: EventEmitter<any> = new EventEmitter<any>();
  @Output() offsetValue: EventEmitter<any> = new EventEmitter<any>();
  orgComponent: CreateOrganizationComponent;
  userOrgComponent: UserUpdateOrganizationComponent;
  data: any;
  constructor(private timezone: TimezoneService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.timeZoneList = this.timezone.getTimeZones();
    var dups = [];
    this.newArr = this.timeZoneList[0].filter(function (el) {
      if (dups.indexOf(el.abbr) == -1) {
        dups.push(el.abbr);
        return true;
      }
      return false;
    });
    this.form = this.fb.group({
      timezone: [Validators.required],
      searchZone: []
    });
    if (this.fromUpdate) {
      this.orgComponent = this.templateObject1;
      this.setValue(this.inputMessage1);
    }
    else if (this.fromUserUpdate) {
      this.setValue(this.inputData);
      this.userOrgComponent = this.template;
    } else if (this.fromAutomation === true) {
      this.setFieldValues();
    } else {
      this.orgComponent = this.templateObject;
    }
    this.orgComponent.userData.subscribe(data => {
      if (data === true) {
        this.form.get('timezone').setValue('');
      }
      else {
        this.form.get('timezone').setValue(data);
      }
    })
  }

  setFieldValues(): void {
    this.timezone.getTimeZones()[0].forEach(zone => {
      if (zone.utc.includes(this.inputData)) {
        this.form.get('timezone').setValue(zone.utc[0]);
      }
    });
  }

  setValue(value) {
    this.timezone.getTimeZones()[0].forEach(zone => {
      if (zone.utc.includes(value)) {
        this.form.get('timezone').setValue(zone.utc[0]);
      } else if (zone.abbr === value){
        this.form.get('timezone').setValue(zone.utc[0]);
      }
    });
  }


  getZones(event) {
    if (this.fromUpdate) {
      this.orgValue1.emit(event.value);
    }
    else {
      this.orgValue.emit(event.value);
    }
    if (this.fromAutomation === true) {
      this.getOffsetZone(event);
    }
    this.form.get('searchZone').setValue('');
  }

  getOffsetZone(event): void {
    this.timezone.getTimeZones()[0].forEach(zone => {
      if (zone.utc.includes(event.value)) {
        this.offsetValue.emit(zone.offset);
      }
    });
  }
}
