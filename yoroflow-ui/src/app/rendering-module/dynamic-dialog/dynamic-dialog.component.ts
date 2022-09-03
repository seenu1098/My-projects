import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dynamic-dialog',
  templateUrl: './dynamic-dialog.component.html',
  styleUrls: ['./dynamic-dialog.component.css']
})
export class DynamicDialogComponent implements OnInit {
  id: string;
  pageId: string;
  show = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DynamicDialogComponent>) { }

  ngOnInit() {
    this.id = this.data.id;
    this.pageId = this.data.pageName;
  }

  close() {
    this.dialogRef.close();
  }

  getPageRendered($event) {
    if ($event === true) {
      this.show = true;
    }
  }

}
