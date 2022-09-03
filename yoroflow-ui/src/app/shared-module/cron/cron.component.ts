import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-cron',
  templateUrl: './cron.component.html',
  styleUrls: ['./cron.component.scss']
})
export class CronComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<CronComponent>,
    private dialog: MatDialog, private fb: FormBuilder) { }

  timePeriodType: string = 'Hourly';
  form: FormGroup;
  timeArray: string[] = ['1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 AM'
    , '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM', '12 PM'];
  weekDays: any[] = [
    { name: 'Sunday', value: 'Su', isSelected: false },
    { name: 'Monday', value: 'Mo', isSelected: false },
    { name: 'Tuesday', value: 'Tu', isSelected: false },
    { name: 'Wednesday', value: 'We', isSelected: false },
    { name: 'Thursday', value: 'Th', isSelected: false },
    { name: 'Friday', value: 'Fr', isSelected: false },
    { name: 'Saturday', value: 'Sa', isSelected: false }
  ];
  selectedWeekDayArray: string[] = [];
  numberArray: any[] = [];
  selectedNumbers: string[] = [];
  ngOnInit(): void {
    this.form = this.fb.group({
      number: [1],
      time: ['9 AM'],
      minute: ['00']
    });
    this.loadNumbers();
  }

  loadNumbers() {
    this.numberArray = [];
    for (let i = 1; i < 32; i++) {
      this.numberArray.push({ value: i, isSelected: false });
    }
  }

  setTimePeriodType(type: string): void {
    this.timePeriodType = type;
    this.form.get('number').setValue(1);
    this.form.get('time').setValue('9 AM');
  }

  getSelectedDays(day: any, i: number): void {
    if (day.isSelected === false) {
      day.isSelected = true;
    } else {
      day.isSelected = false;
    }
    this.selectedWeekDayArray = [];
    for (let i = 0; i < this.weekDays.length; i++) {
      if (this.weekDays[i].isSelected) {
        this.selectedWeekDayArray.push(this.weekDays[i].name);
      }
    }
  }

  getSelectedNumber(number: any, i: number): void {
    if (this.numberArray[i].isSelected === false) {
      this.numberArray[i].isSelected = true;
    } else {
      this.numberArray[i].isSelected = false;
    }
    this.selectedNumbers = [];
    for (let i = 0; i < this.numberArray.length; i++) {
      if (this.numberArray[i].isSelected) {
        let suffix: string;
        if (this.numberArray[i] === '1') {
          suffix = 'st';
        } else if (this.numberArray[i] === '2') {
          suffix = 'nd';
        } else if (this.numberArray[i] === '3') {
          suffix = 'rd';
        } else if (this.numberArray[i] > '3') {
          suffix = 'th';
        }
        this.selectedNumbers.push(this.numberArray[i].value + suffix);
      }
    }
  }

  saveTimePeriodAutomation() {
    let content: string;
    if (this.timePeriodType === 'Hourly') {
      if (this.form.get('number').value === 1) {
        content = 'hour';
      } else {
        content = this.form.get('number').value + ' hours';
      }
    } else if (this.timePeriodType === 'Daily') {
      if (this.form.get('number').value === 1) {
        content = 'day';
      } else {
        content = this.form.get('number').value + ' days';
      }
      content = content + ' at ' + this.form.get('time').value + ' ' + this.form.get('minute').value + ' minutes';
    } else if (this.timePeriodType === 'Weekly') {
      if (this.form.get('number').value === 1) {
        content = 'week ';
      } else {
        content = this.form.get('number').value + ' weeks ';
      }
      let weekDays: string = null;
      if (this.selectedWeekDayArray.length === 1) {
        weekDays = this.selectedWeekDayArray[0];
      } else if (this.selectedWeekDayArray.length === 2) {
        weekDays = this.selectedWeekDayArray[0] + ' and ' + this.selectedWeekDayArray[1];
      } else {
        let count = 0;
        for (let i = 0; i < this.selectedWeekDayArray.length; i++) {
          if (this.selectedWeekDayArray.length - 2 > i) {
            if (weekDays === null) {
              weekDays = ' on ' + this.selectedWeekDayArray[i] + ', ';
            } else {
              weekDays = weekDays + this.selectedWeekDayArray[i] + ', ';
            }
          } else if (count === 0) {
            weekDays = weekDays + this.selectedWeekDayArray[this.selectedWeekDayArray.length - 2] + ' and ' + this.selectedWeekDayArray[this.selectedWeekDayArray.length - 1];
            count++;
          }
        }
      }
      if (weekDays === null) {
        weekDays = '';
      }
      content = content + weekDays + ' at ' + this.form.get('time').value + ' ' + this.form.get('minute').value + ' minutes';
    } else if (this.timePeriodType === 'Monthly') {
      if (this.form.get('number').value === 1) {
        content = 'month ';
      } else {
        content = this.form.get('number').value + ' months ';
      }
      let selectedDates: string = '';
      if (this.selectedNumbers.length === 1) {
        selectedDates = this.selectedNumbers[0];
      } else if (this.selectedNumbers.length === 2) {
        selectedDates = this.selectedNumbers[0] + ' and ' + this.selectedNumbers[1];
      } else {
        let count = 0;
        for (let i = 0; i < this.selectedNumbers.length; i++) {
          if (this.selectedNumbers.length - 2 > i) {
            if (selectedDates === null) {
              selectedDates = ' on the ' + this.selectedNumbers[i] + ', ';
            } else {
              selectedDates = selectedDates + this.selectedNumbers[i] + ', ';
            }
          } else if (count === 0) {
            selectedDates = selectedDates + this.selectedNumbers[this.selectedNumbers.length - 2] + ' and ' + this.selectedNumbers[this.selectedNumbers.length - 1];
            count++;
          }
        }
      }
      if (selectedDates === null) {
        selectedDates = '';
      }
      content = content + selectedDates + ' at ' + this.form.get('time').value + ' ' + this.form.get('minute').value + ' minutes';
    }
    this.dialogRef.close(content);
  }

  close() {
    this.dialogRef.close();
  }

}

