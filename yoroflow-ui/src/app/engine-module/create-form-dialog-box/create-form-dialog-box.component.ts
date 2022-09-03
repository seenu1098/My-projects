import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResponseString } from '../shared/vo/reponse-vo';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-create-form-dialog',
  templateUrl: './create-form-dialog-box.component.html',
  styleUrls: ['./create-form-dialog-box.component.scss']
})
export class CreateFormDialogComponent implements OnInit {

  constructor(private rightSheetRef: MatDialogRef<CreateFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private cd: ChangeDetectorRef) { }
  formDetails;
  ngOnInit() {
    this.cd.markForCheck();
    this.formDetails = { isFromYoroFlow: true, id: null };
    if (this.data !== null) {
      this.formDetails = { isFromYoroFlow: true, id: this.data };
    }
  }

  close() {
    this.rightSheetRef.close();
  }

  getPageId($event) {
    const response = $event as ResponseString;
    if (response.response.includes('created successfully') ||
      response.response.includes('updated successfully')) {
      this.rightSheetRef.close(response.responseId);
    }
  }

}
