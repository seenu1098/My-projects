import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../../shared-module/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class LoadLogoService {

  fileData: File;
  previewUrl: any = null;
  previewBackgroundUrl: any = null;
  fileBackgroundData: File;

  constructor(private snackBar: MatSnackBar) { }

  fileProgress(fileInput: any, button: string) {
    if ( button === 'Upload Background Image') {
      this.fileBackgroundData = <File>fileInput.target.files[0];
      this.previewBackgroundUrl = null;
      if (this.fileBackgroundData) {
      this.preview(button, this.fileBackgroundData);
    }
    } else {
    this.fileData = <File>fileInput.target.files[0];
    this.previewUrl = null;
    if (this.fileData) {
      this.preview(button, this.fileData);
    }
  }

  }

  preview(button, fileData: File) {
    const mimeType = fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(fileData);
    reader.onload = (_event) => {
      if (fileData.size < 80000 && button === 'Upload Background Image') {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Minimum size should 800 X 600 size',
        });
        this.previewBackgroundUrl = null;
        this.fileBackgroundData = null;
      } else if (fileData.size > 150000) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Maximum size 150kb allowed',
        });
        if (button === 'Upload Background Image') {
          this.fileBackgroundData = null;
          this.previewBackgroundUrl = null;
        } else {
        this.fileData = null;
        this.previewUrl = null;
        }
      } else if (button === 'Upload Background Image') {
        this.previewBackgroundUrl = reader.result;
      } else {
        this.previewUrl = reader.result;
      }
    };
  }
}
