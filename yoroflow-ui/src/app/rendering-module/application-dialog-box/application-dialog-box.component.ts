import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadFormService } from '../shared/service/form-service/load-form.service';
import { DynamicQueryBuilderService } from '../shared/service/dynamic-query-builder.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-application-dialog-box',
  templateUrl: './application-dialog-box.component.html',
  styleUrls: ['./application-dialog-box.component.css']
})
export class ApplicationDialogBoxComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ApplicationDialogBoxComponent>,
  private dataService: DynamicQueryBuilderService, private loadFormService: LoadFormService) { }

  form: FormGroup;
  show = false;

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

  getFormAndsubmitEvent($event) {

  }

}
