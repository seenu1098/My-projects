import { Component, OnInit, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { Router } from '@angular/router';
@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.scss']
})
export class AlertmessageComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AlertmessageComponent>,
    private router: Router) { }

  ngOnInit(): void {
  }
  close() {
    this.dialogRef.close();
  }

  upgrade() {
    this.dialogRef.close(true);
    this.router.navigate(['subscription']);
  }
}
