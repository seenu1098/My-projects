import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UppyConfig } from "uppy-angular/uppy-angular"; import { MatIconModule } from '@angular/material/icon';
import { getMatInputUnsupportedTypeError } from '@angular/material/input';
import { TaskboardFormDetailsComponent } from 'src/app/taskboard-module/taskboard-form-details/taskboard-form-details.component';

export type UppyPluginConfigurations = [
  String,
  any
][]

@Component({
  selector: 'app-uppy-component',
  templateUrl: './uppy-component.component.html',
  styleUrls: ['./uppy-component.component.scss']
})
export class UppyComponentComponent implements OnInit {

  @Input() endPoint: string;
  @Input() metaData: any;
  @Input() restrictions: any;
  @Input() selector: boolean;
  @Input() taskDetailsObject: any;
  @Output() file: EventEmitter<any> = new EventEmitter<any>();
  height: any = '400px'

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UppyComponentComponent>) { }

  uploadedFilepaths: any[] = [];
  taskDetailsComponent: TaskboardFormDetailsComponent;
  show: boolean = true;

  settings: UppyConfig = {
    uploadAPI: {
      endpoint: this.data.endpoint,
      headers: {
        Authorization: "Bearer " + localStorage.getItem('token')
      }
    },
    plugins: {
      Webcam: true,
      GoogleDrive: true,
      Instagram: true,
      Dropbox: true
    },
    statusBarOptions: {

    },
    uploaderLook: {
    },
    options: {
      debug: true,
      autoProceed: false,
      meta: this.data.metaData,
    },
    restrictions: this.data.restrictions,
  };

  elem: any;
  style: any;

  ngOnInit(): void {
    if (this.selector === undefined || this.selector === null) {
      this.selector = false;
    }
    if (this.selector === true) {
      this.taskDetailsComponent = this.taskDetailsObject;
      this.settings.uploadAPI.endpoint = this.endPoint;
      this.settings.options.meta = { taskId: this.taskDetailsComponent.taskBoardTaskVO.id };
      this.settings.restrictions = {
        maxFileSize: 10000000,
        maxNumberOfFiles: null,
        minNumberOfFiles: null,
        allowedFileTypes: ['image/*', '.pdf', '.xlsx', '.xls', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.bmp']
      };
      if (this.taskDetailsComponent) {
        this.taskDetailsComponent.width.subscribe(data => {
          this.show = false;
          this.settings.uploaderLook.width = +data;
        });
        this.taskDetailsComponent.height.subscribe(data => {
          this.show = false;
          this.settings.uploaderLook.height = +data;
          this.show = true;
        });
      }
    } else {
      this.show = true;
    }
  }

  onFileAdd(evt) {
  }
  onFileUpload(evt) {
  }
  uploadResult(evt) {
    if (this.data.from) {
      for (let i = 0; i < evt.successful.length; i++) {
        var file = {
          fileName: evt.successful[i].name,
          filePath: evt.successful[i].response.body.response
        }
        this.uploadedFilepaths.push(file);
      }
    }
    if (this.selector === true) {
      this.file.emit(true);
    }
  }

  close() {
    this.dialogRef.close(this.uploadedFilepaths);
  }
}
