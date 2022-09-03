import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { Field, FieldConfig, Page } from 'src/app/rendering-module/shared/vo/page-vo';
import { ActionMap, TimeZoneModel } from '../automation-outlook-integration/outlook-action-model';

@Component({
  selector: 'app-automation-date-time',
  templateUrl: './automation-date-time.component.html',
  styleUrls: ['./automation-date-time.component.scss']
})
export class AutomationDateTimeComponent implements OnInit {
  @Input() selectedScript: any;
  @Input() page = new Page();
  @Input() type: string;
  @Output() columnNameEmit: EventEmitter<any> = new EventEmitter<any>();

  public minDate: moment.Moment;
  public maxDate: moment.Moment;
  startDate = new FormControl();
  endDate = new FormControl();
  form: FormGroup;
  dateFields: Field[] = [];

  constructor(private fb: FormBuilder, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.loadDateFields();
    if (this.type === 'startTime') {
      this.form = this.fb.group({
        startDate: this.fb.group({
          variableType: ['fieldType'],
          dateTime: ['', [Validators.required]],
          timeZone: [''],
          offset:[]
        }),
      });
    }
    if (this.type === 'endTime') {
      this.form = this.fb.group({
        endDate: this.fb.group({
          variableType: ['fieldType'],
          dateTime: ['', [Validators.required]],
          timeZone: [''],
          offset:[]
        })
      });
    }
    if (this.type === 'startTime' && this.selectedScript?.keyValuePair?.actionSpecificMaps?.startTime) {
      if (this.selectedScript?.keyValuePair?.actionSpecificMaps?.startTime?.variableType === 'constant') {
        this.form.get('startDate').get('dateTime').setValue(new Date(this.selectedScript?.keyValuePair?.actionSpecificMaps?.startTime?.dateTime));
      } else {
        this.form.get('startDate').get('dateTime').setValue(this.selectedScript?.keyValuePair?.actionSpecificMaps?.startTime?.dateTime);
        this.dateFields.forEach(f => f.label.labelName === this.selectedScript?.keyValuePair?.actionSpecificMaps?.startTime?.dateTime)['isSelected'] = true;
      }
      this.form.get('startDate').get('timeZone').setValue(this.selectedScript?.keyValuePair?.actionSpecificMaps?.startTime?.timeZone);
      this.form.get('startDate').get('variableType').setValue(this.selectedScript?.keyValuePair?.actionSpecificMaps?.startTime?.variableType);
      this.form.get('startDate').get('offset').setValue(this.selectedScript?.keyValuePair?.actionSpecificMaps?.startTime?.offset);
    }
    if (this.type === 'endTime' && this.selectedScript?.keyValuePair?.actionSpecificMaps?.endTime) {
      if (this.selectedScript?.keyValuePair?.actionSpecificMaps?.endTime?.variableType === 'constant') {
        this.form.get('endDate').get('dateTime').setValue(new Date(this.selectedScript?.keyValuePair?.actionSpecificMaps?.endTime?.dateTime));
      } else {
        this.form.get('endDate').get('dateTime').setValue(this.selectedScript?.keyValuePair?.actionSpecificMaps?.endTime?.dateTime);
        this.dateFields.forEach(f => f.label.labelName === this.selectedScript?.keyValuePair?.actionSpecificMaps?.endTime?.dateTime)['isSelected'] = true;
      }
      this.form.get('endDate').get('timeZone').setValue(this.selectedScript?.keyValuePair?.actionSpecificMaps?.endTime?.timeZone);
      this.form.get('endDate').get('variableType').setValue(this.selectedScript?.keyValuePair?.actionSpecificMaps?.endTime?.variableType);
      this.form.get('endDate').get('offset').setValue(this.selectedScript?.keyValuePair?.actionSpecificMaps?.endTime?.offset);
    }
  }

  loadDateFields(): void {
    this.page.sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'datetime') {
            column.field.isSelected = false;
            this.dateFields.push(column.field);
          }
        });
      });
    });
  }

  apply(): void {
    if (this.startDate.valid && this.endDate.valid) {
      if (this.type === 'startTime') {
        const startTimeIndex = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.startTime);
        if (this.form.get('startDate').get('variableType').value === 'constant') {
          const dateTime = this.form.get('startDate').get('dateTime').value;
          this.selectedScript.words[startTimeIndex] = this.datePipe.transform(dateTime, 'MM/dd/yyyy,HH:MM:ss');
          this.selectedScript.keyValuePair.startTime = this.datePipe.transform(dateTime, 'MM/dd/yyyy,HH:MM:ss');
        } else {
          this.selectedScript.words[startTimeIndex] = this.form.get('startDate').get('dateTime').value;
          this.selectedScript.keyValuePair.startTime = this.form.get('startDate').get('dateTime').value;
        }
        const timeZone = new TimeZoneModel();
        if (this.form.get('startDate').get('variableType').value === 'constant') {
          timeZone.dateTime = this.form.get('startDate').get('dateTime').value.toISOString();
        } else {
          timeZone.dateTime = this.form.get('startDate').get('dateTime').value;
        }
        timeZone.timeZone = this.form.get('startDate').get('timeZone').value;
        timeZone.offset = this.form.get('startDate').get('offset').value;
        timeZone.variableType = this.form.get('startDate').get('variableType').value;
        if (this.selectedScript?.keyValuePair?.actionSpecificMaps) {
          this.selectedScript.keyValuePair.actionSpecificMaps.startTime = timeZone;
        } else {
          const actionSpecificMaps = new ActionMap();
          actionSpecificMaps.startTime = timeZone;
          this.selectedScript.keyValuePair.actionSpecificMaps = actionSpecificMaps;
        }
      }
      if (this.type === 'endTime') {
        const endTimeIndex = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.endTime);
        if (this.form.get('endDate').get('variableType').value === 'constant') {
          const endDateTime = this.form.get('endDate').get('dateTime').value;
          this.selectedScript.words[endTimeIndex] = this.datePipe.transform(endDateTime, 'MM/dd/yyyy,HH:MM:ss');
          this.selectedScript.keyValuePair.endTime = this.datePipe.transform(endDateTime, 'MM/dd/yyyy,HH:MM:ss');
        } else {
          this.selectedScript.words[endTimeIndex] = this.form.get('endDate').get('dateTime').value;
          this.selectedScript.keyValuePair.endTime = this.form.get('endDate').get('dateTime').value;
        }
        const endtimeZone = new TimeZoneModel();
        if (this.form.get('endDate').get('variableType').value === 'constant') {
          endtimeZone.dateTime = this.form.get('endDate').get('dateTime').value.toISOString();
        } else {
          endtimeZone.dateTime = this.form.get('endDate').get('dateTime').value;
        }
        endtimeZone.timeZone = this.form.get('endDate').get('timeZone').value;
        endtimeZone.offset = this.form.get('endDate').get('offset').value;
        endtimeZone.variableType = this.form.get('endDate').get('variableType').value;
        if (this.selectedScript?.keyValuePair?.actionSpecificMaps) {
          this.selectedScript.keyValuePair.actionSpecificMaps.endTime = endtimeZone;
        } else {
          const actionSpecificMaps = new ActionMap();
          actionSpecificMaps.endTime = endtimeZone;
          this.selectedScript.keyValuePair.actionSpecificMaps = actionSpecificMaps;
        }
      }
      this.columnNameEmit.emit(true);
    }
  }

  setDateFieldValue(field: Field, type: string): void {
    this.dateFields.forEach(f => f.isSelected = false);
    field.isSelected = true;
    if (type === 'startTime') {
      this.form.get('startDate').get('dateTime').setValue(field.name);
    } else {
      this.form.get('endDate').get('dateTime').setValue(field.name);
    }
  }

  getData(event: any): void {
    if (this.type === 'startTime') {
      this.form.get('startDate').get('timeZone').setValue(event);
    } else {
      this.form.get('endDate').get('timeZone').setValue(event);
    }
  }

  getOffset(event: any): void {
    if (this.type === 'startTime') {
      this.form.get('startDate').get('offset').setValue(event);
    } else {
      this.form.get('endDate').get('offset').setValue(event);
    }
  }

  radioChange(event: MatRadioChange, type: String): void {
    if (type === 'startTime') {
      this.form.get('startDate').get('variableType').setValue(event.value);
    } else {
      this.form.get('endDate').get('variableType').setValue(event.value);
    }
  }

}
