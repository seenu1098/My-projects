import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent implements OnInit {

  constructor(public snackBarRef: MatSnackBarRef<SnackbarComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: any) { }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnInit() {
    setTimeout(() => {
      this.dismiss()
    }, 10000);
  }

  dismiss() {
    this.snackBarRef.dismiss();
  }
}
