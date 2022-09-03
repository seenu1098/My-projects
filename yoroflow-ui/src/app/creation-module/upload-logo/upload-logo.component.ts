import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { LoadLogoService } from '../shared/service/load-logo.service';


@Component({
  selector: 'upload-logo',
  templateUrl: './upload-logo.component.html',
  styleUrls: ['./upload-logo.component.css']
})
export class UploadLogoComponent implements OnInit {

  selectedFile: any;
  @Input() action: string;
  @Input() buttonName: string;
  @Output() uploaded: EventEmitter<any> = new EventEmitter<any>();
  @Output() background: EventEmitter<any> = new EventEmitter<any>();

  constructor(private loadLogo: LoadLogoService, private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  onFileInput($event) {
    if (this.buttonName === 'Upload Background Image') {
      this.background.emit('backGround');
    } else {
      this.background.emit('logo');
    }
    if ($event) {
      if ($event.target.files[0].type.includes('image/')) {
        this.loadLogo.fileProgress($event, this.buttonName);
        this.uploaded.emit(true);
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Please choose Image File',
        });
      }

    }
  }

}
