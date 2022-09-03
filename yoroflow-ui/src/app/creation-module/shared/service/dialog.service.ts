import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../../shared-module/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private snackBar: MatSnackBar) { }

  confirm(message?: string) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: message,
    });
  }
}
