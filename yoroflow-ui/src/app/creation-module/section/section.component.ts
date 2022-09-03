import { Component, OnInit, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Validators, FormGroup, FormBuilder, NgForm, FormArray } from '@angular/forms';
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA, MatRightSheet } from 'mat-right-sheet';
import { Section, ConditonFields, Security } from '../shared/vo/page-vo';
import { MatChipInputEvent } from '@angular/material/chips';
import { YoroSecurityComponent } from '../yoro-security/yoro-security.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SectionSecurityComponent } from '../section-security/section-security.component';
import { PageComponent } from '../page/page.component';



export interface PrimaryKey {
  name: string;
}

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})



export class SectionComponent implements OnInit {

  form: FormGroup;
  section = new Section();
  // @Input() data: any[] = [];
  // @Output() savedSection = new EventEmitter<any>();
  // @Output() deleteSection = new EventEmitter<any>();
  onAdd = new EventEmitter();
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  disabled: boolean;
  pageId;
  primaryKeys;
  formControlNames: string[] = [];
  step = 0;
  tabs :any = [
    { name: $localize`:tabs:Configuration`, icon: 'manage_accounts', isSelected: true, color: 'blue' }, 
    { name: $localize`:tabs:Validation`, icon: 'rule', isSelected: false, color: 'green'}, 
    { name: $localize`:tabs:Settings`, icon: 'settings', isSelected: false, color: 'lightblue'}, 
    { name: $localize`:tabs:Style`, icon: 'style', isSelected: false, color: '#ffb100'}  ];

  selectedTab = 'Configuration';
  /* primaryKeys: PrimaryKey[] = [
     { name: 'id' },
   ];*/

  // tslint:disable-next-line: max-line-length
  // , private rightSheetRef: MatRightSheetRef<SectionComponent>
  //   , @Inject(MAT_RIGHT_SHEET_DATA) public data: any, private dialog: MatDialog, private rightSheet: MatRightSheet,
  constructor(private fb: FormBuilder,@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<SectionComponent> ) {

    /*if(this.data[1].yorosisPageId !== null) {
      this.disabled = true;
    }*/
    // private pageConfig: PageComponent

  }

  ngOnInit() {
    // this.pageConfig.sectionData.subscribe(data => {
    //   this.data = data;
    //   if (this.data) {
    //     if (this.data[1].manageFlag === true) {
    //       this.pageId = this.data[1].pageId;
    //       this.primaryKeys = 'uuid';
    //       this.disabled = true;
    //     } else {
    //       this.pageId = this.data[0].tableName;
    //       this.primaryKeys = this.data[0].primaryKey;
    //       this.disabled = false;
    //     }
    //     this.intializeForm();
    //     if (this.data[2]) {
    //       this.formControlNames = this.data[2];
    //     }
    //     this.loadFormData();
    //   }
    // });
    if (this.data) {
      if (this.data[1].manageFlag === true) {
        this.pageId = this.data[1].pageId;
        this.primaryKeys = 'uuid';
        this.disabled = true;
      } else {
        this.pageId = this.data[0].tableName;
        this.primaryKeys = this.data[0].primaryKey;
        this.disabled = false;
      }
      this.intializeForm();
      if (this.data[2]) {
        this.formControlNames = this.data[2];
      }

      // this.form = this.fb.group({
      //   name: [this.data[0].name],
      //   width: [this.data[0].width, [Validators.required, Validators.min(1), Validators.max(100)]],
      //   style: [this.data[0].style],
      //   tableName: [{ value: this.pageId, disabled: this.disabled }, [Validators.required]],
      //   description: [this.data[0].description],
      //   collapsible: [this.data[0].collapsible],
      //   border: [this.data[0].border],
      //   primaryKey: [{ value: this.primaryKeys, disabled: this.disabled }, [Validators.required]],
      //   groupValidation: this.fb.group({
      //     required: [''],
      //     conditionalFields: this.fb.array([this.getFieldsFormGroup()]),
      //     requiredFields: this.fb.array([this.getFieldsFormGroup()]),
      //   })
      // });
      // if (this.data[2]) {
      //   this.formControlNames = this.data[2];
      // }
      this.loadFormData();
    }
  }

  setStep(index: number) {
    this.step = index;
  }

  intializeForm(): void {
    this.form = this.fb.group({
      name: [this.data[0].name],
      width: [this.data[0].width, [Validators.required, Validators.min(1), Validators.max(100)]],
      style: [this.data[0].style],
      tableName: [{ value: this.pageId, disabled: this.disabled }, [Validators.required]],
      description: [this.data[0].description],
      collapsible: [this.data[0].collapsible],
      border: [this.data[0].border],
      primaryKey: [{ value: this.primaryKeys, disabled: this.disabled }, [Validators.required]],
      groupValidation: this.fb.group({
        required: [''],
        conditionalFields: this.fb.array([this.getFieldsFormGroup()]),
        requiredFields: this.fb.array([this.getFieldsFormGroup()]),
      }),
      sections: [this.data[0].sections],
      rows: [this.data[0].rows],
    });
  }

  changeTab(tab){
    this.selectedTab = tab;
   }

  focusOutForSectionName(event){
    if(this.form.get('name').value === this.pageId){
      this.form.get('name').setErrors({ cannotSetSameName: true });
    }else{
      this.form.get('name').setErrors(null);
      this.form.get('name').updateValueAndValidity();
     }
  }

  loadFormData() {
    if (this.data[0].groupValidation) {
      this.form.get('groupValidation').get('required').setValue(this.data[0].groupValidation.required);
      if (this.data[0].groupValidation.conditionalFields) {
        const fields: ConditonFields[] = this.data[0].groupValidation.conditionalFields;
        for (let i = 0; i < fields.length; i++) {
          const index = '' + i;
          if (i > 0) {
            this.addCondtionalFieldsFormGroup();
          }
          this.getConditionalFieldsFormArray().get(index).setValue(fields[i]);
        }
        if (this.data[0].groupValidation.requiredFields) {
          const requiredFields: ConditonFields[] = this.data[0].groupValidation.requiredFields;
          for (let i = 0; i < requiredFields.length; i++) {
            const index = '' + i;
            if (i > 0) {
              this.addRequiredFieldsFormGroup();
            }
            this.getRequiredConditionalFormArray().get(index).setValue(requiredFields[i]);
          }
        }
      }
    }
  }

  getConditionalFieldsFormArray() {
    return this.form.get('groupValidation').get('conditionalFields') as FormArray;
  }

  setFieldLabelCondtion($event, label, i) {
    if ($event.isUserInput === true) {
      this.getConditionalFieldsFormArray().get('' + i).get('fieldLabel').setValue(label);
    }
  }

  setFieldLabel($event, label, j) {
    if ($event.isUserInput === true) {
      this.getRequiredConditionalFormArray().get('' + j).get('fieldLabel').setValue(label);
    }
  }

  getRequiredConditionalFormArray() {
    return this.form.get('groupValidation').get('requiredFields') as FormArray;
  }

  addCondtionalFieldsFormGroup() {
    this.getConditionalFieldsFormArray().push(this.getFieldsFormGroup());
  }

  removeCondtionalFieldsFormGroup(i) {
    this.getConditionalFieldsFormArray().removeAt(i);
  }

  addRequiredFieldsFormGroup() {
    this.getRequiredConditionalFormArray().push(this.getFieldsFormGroup());
  }

  removeRequiredFieldsFormGroup(i) {
    this.getRequiredConditionalFormArray().removeAt(i);
  }

  getFieldsFormGroup() {
    return this.fb.group({
      fieldName: [''],
      value: [''],
      fieldLabel: []
    });
  }

  sectionDetails(userForm) {
    if (userForm.valid) {
      this.section = this.form.getRawValue();
      // this.onAdd.emit(this.section);
      // this.rightSheetRef.dismiss();
      // this.savedSection.emit(this.section);
      this.dialogRef.close(this.section)
    }
  }

  delete() {
    // this.deleteSection.emit(true);
    this.dialogRef.close(true)
  }

  close(){
      this.dialogRef.close()
  }
  cancel() {
    this.onAdd.emit('cancel');
    // this.rightSheetRef.dismiss();
  }

  tableNameCamelize(event: any) {
    this.form.get('tableName').setValue(event.target.value.replace(/\s/g, '_'));
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.primaryKeys.push({ name: value.trim() });
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(primaryKey: PrimaryKey): void {
    const index = this.primaryKeys.indexOf(primaryKey);

    if (index >= 0) {
      this.primaryKeys.splice(index, 1);
    }
  }

}
