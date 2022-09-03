import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ResponseString } from '../shared/vo/reponse-vo';
import { YoroFlowConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';

@Component({
  selector: 'lib-table-creation-dialog-box',
  templateUrl: './table-creation-dialog-box.component.html',
  styleUrls: ['./table-creation-dialog-box.component.css']
})
export class TableCreationDialogBoxComponent implements OnInit {

  constructor(private rightSheetRef: MatDialogRef<TableCreationDialogBoxComponent>, private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private cd: ChangeDetectorRef) { }
  dbTaskTableObjectVO;
  allowToClose = true;
  ngOnInit(): void {
    this.cd.markForCheck();
    if (this.data !== null) {
      this.dbTaskTableObjectVO = { dbTaskTableObject: true, id: this.data.id };
    }
  }
  valueChanged(event) {
    if (event === true) {
      this.allowToClose = false;
    } else {
      this.allowToClose = true;
    }
  }

  getTableId($event) {
    const response = $event as ResponseString;
    if (response.response.includes('Created Successfully') ||
      response.response.includes('Updated Successfully')) {
      this.rightSheetRef.close(response);
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
}
