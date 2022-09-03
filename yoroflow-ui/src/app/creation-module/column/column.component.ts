import { Component, OnInit, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Row } from '../shared/vo/page-vo';
import { Validators, NgForm, FormGroup, FormBuilder } from '@angular/forms';
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA } from 'mat-right-sheet';
import { PageComponent } from '../page/page.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent implements OnInit {

 

  // private rightSheetRef: MatRightSheetRef<ColumnComponent>,
  //   @Inject(MAT_RIGHT_SHEET_DATA) public data: any

  constructor(private fb: FormBuilder,@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<ColumnComponent>) { }
  
  //  private pageComponent: PageComponent
  tabs :any = [
    { name: 'Configuration', icon: 'manage_accounts', isSelected: true, color: 'blue' }, 
    { name: 'Layout', icon: 'settings', isSelected: false, color: 'green'}, 
    { name: 'Style', icon: 'style', isSelected: false, color: '#ffb100'}  ];

  selectedTab = 'Configuration';
  form: FormGroup;
  dymanicRow = new Row();
  onAdd = new EventEmitter();
  selected = 'start start';
  isValid = false;
  // @Input() data: any;
  @Output() savedRowData = new EventEmitter<any>();
  // @Output() deleteRowData = new EventEmitter<any>();

  ngOnInit() {
    this.intializeForm();
    if (this.data.alignment === 'left') {
      this.form.get('alignment').setValue('start start');
    }
    // this.emit();
  }

  // emit(){
  //   this.pageComponent.newRowData.subscribe(data => {
  //     this.data = data;
  //     this.intializeForm();
  //     if (this.data.alignment === 'left') {
  //       this.form.get('alignment').setValue('start start');
  //     }
  //   });
  // }

  intializeForm() {
    this.form = this.fb.group({
      row: [this.data.row],
      layoutDirection: [this.data.layoutDirection],
      layoutResponsiveDirection: [this.data.layoutResponsiveDirection],
      layoutGap: [this.data.layoutGap],
      alignment: [this.data.alignment],
      style: [this.data.style],
      rowWidth: [this.data.rowWidth, [Validators.required, Validators.min(1), Validators.max(100)]],
      totalColumns: [this.data.totalColumns, [Validators.required, Validators.min(1), Validators.max(10)]],
      rowBackground: [this.data.rowBackground, [Validators.required]],
      columns: [this.data.columns]
    });
  }

  changeTab(tab){
    // for(let i=0; i < this.tabs.length; i++){
    //   this.tabs[i].isSelected = false;
    // }
    // tab.isSelected = true;
    this.selectedTab = tab;
   }

  createColumn(userForm) {
    if (userForm.valid) {
      this.dymanicRow = this.form.value;
      this.onAdd.emit(this.dymanicRow);
      // this.rightSheetRef.dismiss();
      this.savedRowData.emit(this.dymanicRow);
    } else {
      this.isValid = true;
      // this.formService.showInvalidFormControls(this.form, this.data[1]);
    }
    // this.rightSheetRef.afterDismissed().subscribe(() => {
    //   this.data[0] = new Row();
    // });

  }
  updateCoulmn(userForm) {
    if (userForm.dirty && userForm.valid) {
      this.dymanicRow = this.form.value;
      this.dymanicRow.row = this.form.get('row').value - 1;
      this.onAdd.emit(this.dymanicRow);
      // this.rightSheetRef.dismiss();
      this.savedRowData.emit(this.dymanicRow);
      this.dialogRef.close(this.dymanicRow)
    } else {
      this.isValid = true;
      // this.rightSheetRef.dismiss();
    }
  }

  cancel() {
    // this.onAdd.emit('cancel');
    // this.rightSheetRef.dismiss();
    // this.deleteRowData.emit(true);
    this.dialogRef.close(true)
  }

  close(){
    this.dialogRef.close();
  }
}
