import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResponseString } from '../shared/vo/response-vo';

@Component({
  selector: 'lib-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.css']
})
export class CreatePageComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CreatePageComponent>, private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private cd: ChangeDetectorRef) { }
  isFormApplication = false;
  ngOnInit(): void {
    this.isFormApplication = this.data;
  }

  close() {
    this.dialogRef.close(false);
  }

  getPageId($event) {
    const response = $event as ResponseString;
    if (response.response.includes('created successfully') ||
      response.response.includes('updated successfully')) {
      this.dialogRef.close(response);
    }
  }

}
