import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../../shared-module/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class LoadLogoService {

  fileData: File = null;
  previewUrl: any = null;

  constructor(private snackBar: MatSnackBar) { }

  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    if (this.fileData) {
      this.preview();
    }

  }

  preview() {
    // Show preview
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => {
      this.previewUrl = reader.result;
      if (this.fileData.size > 500000) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Maximum size 500kb allowed',
        });
        this.previewUrl = null;
        this.fileData = null;
      }
    };
  }
}
