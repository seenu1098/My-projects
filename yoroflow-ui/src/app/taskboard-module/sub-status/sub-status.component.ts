import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubStatusVO } from '../taskboard-configuration/taskboard.model';

@Component({
  selector: 'app-sub-status',
  templateUrl: './sub-status.component.html',
  styleUrls: ['./sub-status.component.scss']
})
export class SubStatusComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SubStatusComponent>,
    private dialog: MatDialog,) { }

  subStatusList: SubStatusVO[] = [];

  ngOnInit(): void {
    this.subStatusList = this.data.subStatusList;
    for (let i = 0; i < this.subStatusList.length; i++) {
      this.subStatusList[i].isSelected = false;
    }
  }

  selectedSubStatus(subStatus: SubStatusVO): void {
    for (let i = 0; i < this.subStatusList.length; i++) {
      this.subStatusList[i].isSelected = false;
    }
    subStatus.isSelected = true;
  }

  close(): void {
    const subStatus = this.subStatusList.find(subStatus => subStatus.isSelected === true);
    if (subStatus !== undefined && subStatus !== null) {
      this.dialogRef.close(subStatus.name);
    } else {
      this.dialogRef.close(false);
    }
  }

}
