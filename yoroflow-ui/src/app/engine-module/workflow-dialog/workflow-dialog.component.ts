import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-workflow-dialog',
  templateUrl: './workflow-dialog.component.html',
  styleUrls: ['./workflow-dialog.component.scss']
})
export class WorkflowdialogComponent implements OnInit {

  constructor( private dialogRef: MatDialogRef<WorkflowdialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }
  dialogClose(){
    this.dialogRef.close({  status: 'yes'});

  }
  close(){
    this.dialogRef.close({  status: 'no'});
 
  }
}
