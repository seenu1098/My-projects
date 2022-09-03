import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageService } from '../shared/service/page-service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';

@Component({
  selector: 'lib-image-render-dialog',
  templateUrl: './image-render-dialog.component.html',
  styleUrls: ['./image-render-dialog.component.css']
})
export class ImageRenderDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<ImageRenderDialogComponent>, public pageService: PageService
              , public snackBar: MatSnackBar) { }

  show = false;
  imageurl: any;
  ngOnInit(): void {
    if (this.data.imageKey) {
      this.getImage();
    }
  }

  getImage() {
    if (this.data.publicForm === true) {
      this.pageService.getImageFromKeyFromPublicForm(this.data.imageKey).subscribe(images => {
        if (images) {
          // this.imageurl = images;
          const blob = new Blob([images], { type: 'image/jpeg' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = (event) => {
                this.imageurl = reader.result;
            };
          this.show = true;
        }
      },
      error => {
        this.show = true;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Failed to load image.',
        });
      });
  } else {
    this.pageService.getImageFromKey(this.data.imageKey).subscribe(images => {
      if (images) {
        // this.imageurl = images;
        const blob = new Blob([images], { type: 'image/jpeg' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = (event) => {
              this.imageurl = reader.result;
          };
        this.show = true;
      }
    },
    error => {
      this.show = true;
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Failed to load image.',
      });
    });
  }
  }

  onNoClick() {
    this.dialogRef.close();
  }

}
