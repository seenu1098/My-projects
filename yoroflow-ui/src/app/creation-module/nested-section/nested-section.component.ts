import { Component, OnInit, Inject, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, NgForm, Validators } from '@angular/forms';
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA } from 'mat-right-sheet';
// import { PageComponent } from '../page/page.component';
import { Section } from '../shared/vo/page-vo';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-nested-section',
  templateUrl: './nested-section.component.html',
  styleUrls: ['./nested-section.component.css']
})
export class NestedSectionComponent implements OnInit {

  onAdd = new EventEmitter();
  @Output() savedNestedSection = new EventEmitter<any>();
  @Output() deleteNestedSection = new EventEmitter<any>();
  form: FormGroup;
  nestedSection = new Section();
  conditionallyApplicable = false;
  sectionObj: any;
  pageDetails: any;
  page: any;
  columns = [];
  logicalSectionName = false;
  parentTable: string;
  width: any;
  tabs :any = [
    { name: 'Configuration', icon: 'manage_accounts', isSelected: true, color: 'blue' }, 
    // { name: 'Validation', icon: 'rule', isSelected: false, color: 'green'}, 
    { name: 'Settings', icon: 'settings', isSelected: false, color: 'lightblue'}, 
    // { name: 'Style', icon: 'style', isSelected: false, color: '#ffb100'}  
  ];

  selectedTab = 'Configuration';
  // @Input() data: any;
  // private rightSheetRef: MatRightSheetRef<NestedSectionComponent>,
  // @Inject(MAT_RIGHT_SHEET_DATA) public data: any
  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<NestedSectionComponent>) {
    // , private pageComponent: PageComponent
    if (this.data) {
      this.sectionObj = this.data.sectionObj;
      this.pageDetails = this.data.pageDetails;
      this.page = this.data.page;
    }
  }

  ngOnInit() {
    // this.pageComponent.nestedSectionData.subscribe(data => {
    //   if (data) {
    //     this.data = data;
    //     this.sectionObj = this.data.sectionObj;
    //     this.pageDetails = this.data.pageDetails;
    //     this.page = this.data.page;
    //     this.form = this.fb.group({
    //       name: [this.data.sectionObj.name, [Validators.required]],
    //       childSection: [this.data.sectionObj.childSection],
    //       width: [this.data.sectionObj.width, [Validators.required, Validators.min(1)]],
    //       style: [this.data.sectionObj.style],
    //       tableName: [{ value: this.data.sectionObj.tableName, disabled: this.data.page.manageFlag }],
    //       description: [this.data.sectionObj.description],
    //       repeatable: [this.data.sectionObj.repeatable],
    //       collapsible: [this.data.sectionObj.collapsible],
    //       border: [this.data.sectionObj.border],
    //       primaryKey: [{ value: 'id', disabled: this.data.page.manageFlag }],
    //       parentTable: [{ value: this.data.sectionObj.parentTable, disabled: this.data.page.manageFlag }],
    //       conditionallyApplicable: [this.data.sectionObj.conditionallyApplicable],
    //       fieldName: [this.data.sectionObj.fieldName],
    //       value: [this.data.sectionObj.value],
    //       logicalSectionName: [this.data.sectionObj.logicalSectionName],
    //       addRepeatableSectionButtonName: [this.data.sectionObj.addRepeatableSectionButtonName],
    //       removeRepeatableSectionButtonName: [this.data.sectionObj.removeRepeatableSectionButtonName],
    //       foreignKey: this.fb.array([this.addForeignKeyService()]),
    //       rows: [this.data.sectionObj.rows],
    //     });
    //     this.logicalSectionName = true;
    //     this.showLogicalName({ checked: this.form.get('childSection').value });
    //     this.loadForeignKeyValue();
    //     this.loadParentTableValue();
    //   }
    // });
    this.form = this.fb.group({
      name: [this.data.sectionObj.name, [Validators.required]],
      childSection: [this.data.sectionObj.childSection],
      width: [this.data.sectionObj.width, [Validators.required, Validators.min(1)]],
      style: [this.data.sectionObj.style],
      tableName: [{ value: this.data.sectionObj.tableName, disabled: this.data.page.manageFlag }],
      description: [this.data.sectionObj.description],
      repeatable: [this.data.sectionObj.repeatable],
      collapsible: [this.data.sectionObj.collapsible],
      border: [this.data.sectionObj.border],
      primaryKey: [{ value: 'id', disabled: this.data.page.manageFlag }],
      parentTable: [{ value: this.data.sectionObj.parentTable, disabled: this.data.page.manageFlag }],
      conditionallyApplicable: [this.data.sectionObj.conditionallyApplicable],
      fieldName: [this.data.sectionObj.fieldName],
      value: [this.data.sectionObj.value],
      logicalSectionName: [this.data.sectionObj.logicalSectionName],
      addRepeatableSectionButtonName: [this.data.sectionObj.addRepeatableSectionButtonName],
      removeRepeatableSectionButtonName: [this.data.sectionObj.removeRepeatableSectionButtonName],
      foreignKey: this.fb.array([this.addForeignKeyService()]),
      rows: [this.data.sectionObj.rows],
    });
    this.loadForeignKeyValue();
    this.loadParentTableValue();
    // this.loadColumns();

    if (this.form.get('childSection').value === true) {
      this.logicalSectionName = true;
      this.width = 'margin-top:10px';
    } else {
      this.width = 'margin-top:4%';
    }

    if (this.sectionObj && this.sectionObj.logicalSectionName) {
      this.form.get('childSection').disable();
      this.form.get('logicalSectionName').disable();
    }
  }

  

  loadParentTableValue() {
    if (this.data.nestedSection === false) { //sub section
      this.form.get('parentTable').setValue(this.page.pageId);
      this.form.get('parentTable').disable(this.data.page.manageFlag);
    } else if (this.data.nestedSection === true) { // nested sub section
      if (this.form.get('logicalSectionName').value === '' || this.form.get('logicalSectionName').value === null) {
        this.form.get('parentTable').setValue(this.data.page.pageId);
        this.form.get('parentTable').disable(this.data.page.manageFlag);
      } else {
        this.form.get('parentTable').setValue(this.data.pageDetails.tableName);
        this.form.get('parentTable').disable(this.data.page.manageFlag);
      }
    }
  }

  loadColumns() {
    for (let i = 0; i < this.sectionObj.rows.length - 1; i++) {
      for (let j = 0; j < this.sectionObj.rows[i].columns.length; j++) {
        this.columns.push(this.sectionObj.rows[i].columns[j].name);
      }
    }
    for (let j = 0; j < this.page.sections.length - 1; j++) {
      for (let i = 0; i < this.page.sections[j].rows.length; i++) {
        for (let k = 0; k < this.page.sections[j].rows[i].columns.length; k++) {
          this.columns.push(this.page.sections[j].rows[i].columns[k].name);
        }
      }
    }
  }

  showLogicalName(event: any) {
    const logicalSectionNameControl = this.form.get('logicalSectionName');
    if (event.checked === true) {
      this.logicalSectionName = true;
      logicalSectionNameControl.setValidators([Validators.required]);
      this.width = 'margin-top:10px';

    } else {
      this.logicalSectionName = false;
      logicalSectionNameControl.setValue('');
      logicalSectionNameControl.clearValidators();
      logicalSectionNameControl.updateValueAndValidity();
      this.width = 'margin-top:4%';
    }
  }

  getForeignKeyFormArray() {
    return (this.form.get('foreignKey') as FormArray);
  }

  focusOutForFormElement(event: any) {
    const logicalSectionName = this.form.get('logicalSectionName').value;
    // this.form.get('tableName').setValue((logicalSectionName).trim().toLowerCase().replace(/ +/g, '_'));
    this.form.get('tableName').setValue((logicalSectionName).trim().toLowerCase().replace(/ +/g, '_'));
    this.form.get('tableName').disable({ onlySelf: this.data.page.manageFlag });
    this.form.get('parentTable').disable({ onlySelf: this.data.page.manageFlag });
    this.loadParentTableValue();
  }

  addForeignKeyService(): FormGroup {
    return this.fb.group({
      foreignKeyName: [],
    });
  }
  addForeignKey(index: number) {
    (<FormArray>this.form.get('foreignKey')).push(this.addForeignKeyService());
  }
  removeForeignKey(i: number) {
    (this.form.get('foreignKey') as FormArray).removeAt(i);
  }
  save(userForm) {
    this.form.markAllAsTouched();
    if (userForm.valid) {
      this.nestedSection = this.form.getRawValue();
      if (this.nestedSection.repeatable === true) {
        this.nestedSection.repeatableName = this.camelize(this.form.get('logicalSectionName').value);
      }
      const foreignKeyLength = this.nestedSection.foreignKey.length;
      for (let i = 0; i < foreignKeyLength; i++) {
        const index = '' + i;
        this.nestedSection.foreignKey[i] = this.form.get('foreignKey').get(index).get('foreignKeyName').value;
      }
      this.onAdd.emit(this.nestedSection);
      this.savedNestedSection.emit(this.nestedSection)
      this.dialogRef.close(this.nestedSection)
    }
  }

  close(){
    this.dialogRef.close()

  }

  camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  loadForeignKeyValue() {
    if (this.data.sectionObj && this.data.sectionObj.foreignKey && this.data.sectionObj.foreignKey.length) {
      const foreignKeyLength = this.data.sectionObj.foreignKey.length;
      for (let i = 0; i < foreignKeyLength; i++) {
        if (i > 0) {
          this.addForeignKey(i);
        }
        const index = '' + i;
        const form = (this.form.get('foreignKey') as FormArray).get(index);
        form.get('foreignKeyName').setValue(this.data.sectionObj.foreignKey[i]);
      }
    }
  }

  changeTab(tab){
    // for(let i=0; i < this.tabs.length; i++){
    //   this.tabs[i].isSelected = false;
    // }
    // tab.isSelected = true;
    this.selectedTab = tab;
   }

  cancel() {
    this.onAdd.emit('cancel');
    // this.rightSheetRef.dismiss();
    this.deleteNestedSection.emit(true);
    this.dialogRef.close(true);
  }
  changedConditionallyApplicable(event) {
    this.sectionObj.conditionallyApplicable = event.checked;
    if (event.checked === true) {
      this.conditionallyApplicable = true;
    } else {
      this.conditionallyApplicable = false;
    }

  }
  changeRepeatable(event) {
    this.sectionObj.repeatable = event.checked;
  }
  changedCollapsible(event) {
    this.sectionObj.collapsible = event.checked;
  }
  changedBorder(event) {
    this.sectionObj.border = event.checked;
  }
}
