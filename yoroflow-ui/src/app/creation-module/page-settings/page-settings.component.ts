import { Component, OnInit, Inject, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Row, Page, FieldConfig, Section, Field, Grid, FieldName, TabbedMenu, Security, LabelType, Column } from '../shared/vo/page-vo';

@Component({
  selector: 'app-page-settings',
  templateUrl: './page-settings.component.html',
  styleUrls: ['./page-settings.component.scss']
})
export class PageSettingsComponent implements OnInit {

  form: FormGroup;
  page = new Page();
  submitEnable: boolean = false;

  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<PageSettingsComponent>) { }

  ngOnInit(): void {
   
      this.form = this.fb.group({
        pageId: [this.data.pageId],
        description: [this.data.description],
        exporttoPdf: [this.data.exportAsPdf],
      });
    
  }

  intializeForm() {
    this.form = this.fb.group({
      pageId: [],
      description: [],
      exporttoPdf: [],
    });
  }

  allowExporttoPdf(event) {
    if (event.checked === true) {
      this.page.exportAsPdf = true;
    } else {
      this.page.exportAsPdf = false;
    }
    this.submitEnable = true;
  }

  save(userForm){
      this.data.pageId = this.form.get('pageId').value;
      this.data.description = this.form.get('description').value;
      this.data.exportAsPdf = this.form.get('exporttoPdf').value;
      this.dialogRef.close(this.data)
  }
  
  close(){
    this.dialogRef.close()
  }

  resetPageSettings() {
    this.form.get('description').reset();
    this.form.get('exporttoPdf').setValue(false)
  }
}
