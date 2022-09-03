import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LoadLogoService } from '../shared/service/load-logo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';


@Component({
  selector: 'app-upload-logo',
  templateUrl: './upload-logo.component.html',
  styleUrls: ['./upload-logo.component.css']
})
export class UploadLogoComponent implements OnInit {

  selectedFile: any;
  @Input() action: string;
  @Input() buttonName: string;
  @Output() uploaded: EventEmitter<any> = new EventEmitter<any>();

  constructor(private loadLogo: LoadLogoService, private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  onFileInput($event) {
    if ($event) {
      if ($event.target.files[0].type.includes('image/')) {
        this.loadLogo.fileProgress($event);
        this.uploaded.emit(true);
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Please choose Image File',
        });
      }

    }
  }

}
