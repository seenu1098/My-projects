import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';

@Component({
  selector: 'app-profile-picture-dialog-box',
  templateUrl: './profile-picture-dialog-box.component.html',
  styleUrls: ['./profile-picture-dialog-box.component.scss']
})
export class ProfilePictureDialogBoxComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private dialog: MatDialog,
    private dialogRef: MatDialogRef<ProfilePictureDialogBoxComponent>
  ) {
    if (window.matchMedia('only screen and (max-width: 768px)').matches ||
      window.matchMedia('only screen and (max-width: 1024px)').matches || window.matchMedia('only screen and (max-width: 600px)').matches) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }
  imageChangedEvent: any = '';
  croppedImage: any = '';
  userProfilePicture: any;
  form: FormGroup;
  showLoadedImage = true;
  isMobile: boolean;
  ngOnInit(): void {
    this.form = this.fb.group({
      cropImage: [],
      fileImage: []
    });
  }
  fileChangeEvent(event: any): void {
    this.showLoadedImage = false;
    this.imageChangedEvent = event;
    this.userProfilePicture = event.target.files[0];
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  removeProfilePicture() {
    this.showLoadedImage = false;
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: { type: 'remove-profile-picture' }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        this.dialogRef.close('remove');
      }
    });
  }
  saveCropedImage() {
    this.form.get('cropImage').setValue(this.croppedImage);
    this.form.get('fileImage').setValue(this.userProfilePicture);
    this.dialogRef.close(this.form.value);
  }
  cancel() {
    this.dialogRef.close();
  }
}
