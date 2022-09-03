import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TasklistService } from '../tasklist.service';

@Component({
  selector: 'lib-error-instance-dialog',
  templateUrl: './error-instance-dialog.component.html',
  styleUrls: ['./error-instance-dialog.component.css']
})
export class ErrorInstanceDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ErrorInstanceDialogComponent>,
    private dialog: MatDialog, private tasklistService: TasklistService) { }

    errorDetails: any[] = [];
    pageRendered = false;

  ngOnInit(): void {
    if (this.data.type === 'errorTask') {
      this.tasklistService.getErrorTaskDetails(this.data.instanceId).subscribe(details => {
        this.pageRendered = true;
        if (details) {
          this.errorDetails = details;
        }
      });
    }
  }

  onNoClick() {
    this.dialogRef.close();
  }

}
