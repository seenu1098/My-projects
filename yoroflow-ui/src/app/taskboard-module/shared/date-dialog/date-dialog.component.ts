import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';

@Component({
  selector: 'app-date-dialog',
  templateUrl: './date-dialog.component.html',
  styleUrls: ['./date-dialog.component.scss']
})
export class DateDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<DateDialogComponent>,
    private datePipe: DatePipe, private snackbar: MatSnackBar) { }

  date: string;
  selectedDate: any;

  ngOnInit(): void {
  }

  onSelect(event): void {
    this.selectedDate = event;
    this.date = this.datePipe.transform(event, 'dd-MMM-yyyy');
  }

  saveDate(): void {
    if (this.date !== undefined && this.date !== null && this.date !== '') {
      this.dialogRef.close(this.date);
    } else {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: 'Please select a date'
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
