import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dragconfirm',
  templateUrl: './dragconfirm.component.html',
  styleUrls: ['./dragconfirm.component.scss']
})
export class DragconfirmComponent implements OnInit {

  constructor( private dialogRef: MatDialogRef<DragconfirmComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }
  
  dialogClose(){
    this.dialogRef.close({ clicked:'no' });

  }

}
