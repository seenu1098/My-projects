import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { YoroFlowConfirmationDialogComponent } from '../../designer-module/yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { ResponseString } from '../../designer-module/shared/vo/reponse-vo';

// tslint:disable-next-line:max-line-length
// import { YoroFlowConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
// import { ResponseString } from '../shared/vo/reponse-vo';

@Component({
  selector: 'app-create-form-dialog',
  templateUrl: './create-form-dialog-box.component.html',
  styleUrls: ['./create-form-dialog-box.component.scss']
})
export class CreateFormDialogComponent implements OnInit {

  constructor(private rightSheetRef: MatDialogRef<CreateFormDialogComponent>, private dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any, private cd: ChangeDetectorRef) { }
  formDetails;
  allowToClose = true;
  ngOnInit() {
    this.cd.markForCheck();
    this.formDetails = { isFromYoroFlow: true, id: null, publicForm: this.data.publicform, workflowName: this.data.workflowName, key: this.data.key };
    if (this.data.from && this.data.from === 'taskboard') {
      this.formDetails = { isFromYoroFlow: true, from: this.data.from, isPublicform: this.data.isPublicform };
    } else if (this.data !== null) {
      this.formDetails = { isFromYoroFlow: true, id: this.data.id, version: this.data.versionId, publicForm: this.data.publicform, workflowName: this.data.workflowName, key: this.data.key };
    }
  }

  close() {
    if (!this.allowToClose) {
      this.allowToClose = true;
      const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
        disableClose: true,
        width: '250px',
        data: { type: 'valueChanged' }
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data === false) {
          this.allowToClose = false;
        } else {
          this.rightSheetRef.close();
        }
      });
    } else {
      this.rightSheetRef.close();
    }
  }

  valueChanged(event) {
    if (event === true) {
      this.allowToClose = false;
    } else {
      this.allowToClose = true;
    }
  }

  getPageId($event) {
    const response = $event as ResponseString;
    if (response.response.includes('created successfully') ||
      response.response.includes('updated successfully')) {
      this.rightSheetRef.close(response);
    }
  }

}
