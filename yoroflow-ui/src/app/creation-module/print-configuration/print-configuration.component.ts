import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PrintConfigurationPropertiesComponent } from '../print-configuration-properties/print-configuration-properties.component';
import { Page, Placeholder, PrintFieldList, RowOfFields, RowOfPrintFields } from '../shared/vo/page-vo';


@Component({
  selector: 'lib-print-configuration',
  templateUrl: './print-configuration.component.html',
  styleUrls: ['./print-configuration.component.css']
})
export class PrintConfigurationComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PrintConfigurationComponent>, private fb: FormBuilder, private dialog: MatDialog) { }

  form: FormGroup;
  newPage = new Page();
  oldPage: any[] = [];
  selectable = true;
  removable = true;
  isDisable = true;
  placeholder: any[][] = [];
  fieldNameArray: any[] = [];
  inBuiltVariables: any[] = [];
  fieldType: any;
  repeatableSection = false;

  ngOnInit() {
    this.newPage = this.data.page;
    this.oldPage = JSON.parse(JSON.stringify(this.data.page));
    this.form = this.fb.group({
      chipProperties: this.fb.array([
        this.chipFormGroup()
      ])
    });
    for (let i = 0; i < 2; i++) {
      if (i === 0) {
        this.inBuiltVariables.push('Current Date');
      } else if (i === 1) {
        this.inBuiltVariables.push('Current Time');
      }
    }
    this.loadForm();
    this.placeholder.push([]);
    this.fieldNameArray = [
      {
        name: 'Field Names',
        fieldNames: this.data.fieldNames
      },
      {
        name: 'Repeatable Field Names',
        fieldNames: this.data.repeatableFieldNames
      },
      {
        name: 'Built In Variables',
        fieldNames: this.inBuiltVariables,
      }
    ];
  }

  drop(event: CdkDragDrop<any[][]>,chips: any[]) {
    moveItemInArray(chips, event.previousIndex, event.currentIndex);
  }

  loadForm() {
    if (this.newPage.printFieldsList) {
      for (let i = 0; i < this.newPage.printFieldsList.rowOfFields.length; i++) {
        const length = this.newPage.printFieldsList.rowOfFields[i].placeholder.length;
        this.placeholder[i] = this.newPage.printFieldsList.rowOfFields[i].placeholder;
        if (i > 0) {
          (this.form.get('chipProperties') as FormArray).push(this.chipFormGroup());
        }
        const group = ((this.form.get('chipProperties') as FormArray).get('' + i) as FormGroup);
        group.get('isRepeatable').setValue(this.newPage.printFieldsList.rowOfFields[i].repeatable);
      }
    }
  }

  chipFormGroup(): FormGroup {
    return this.fb.group({
      isRepeatable: [false],
      chipValue: this.fb.array([this.chipValueFormGroup()])
    });
  }

  chipValueFormGroup(): FormGroup {
    return this.fb.group({
      chip: [''],
    });
  }

  getChipFieldArray(i) {
    return (this.form.controls.chipProperties as FormArray).at(i).get('chipValue') as FormArray;
  }

  getChipFormArray() {
    return (this.form.get('chipProperties') as FormArray).controls;
  }

  addChipFormArray(i) {
    this.placeholder.push([]);
    (this.form.get('chipProperties') as FormArray).push(this.chipFormGroup());

  }

  removeChipFormArray(i) {
    (this.form.get('chipProperties') as FormArray).removeAt(i);
    this.placeholder.splice(i, 1);
    this.removeRowOfFields(i);
  }

  removeRowOfFields(index) {
    this.newPage.printFieldsList.rowOfFields.splice(index, 1);
    if (this.newPage.printConfiguration && this.newPage.printConfiguration.rowOfPrintFields[index]) {
      this.newPage.printConfiguration.rowOfPrintFields.splice(index, 1);
    }
  }

  add(event, i) {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      const length = this.placeholder.length;
      if (this.placeholder.length === 0) {
        this.placeholder.push([]);
      }
      this.placeholder[i].push({ chip: value.trim(), fieldType: 'static' });
      let array = {
        repeatable: this.form.get('chipProperties').get('' + i).get('isRepeatable').value,
        placeholder: this.placeholder[i]
      };
      if (!this.newPage.printFieldsList) {
        this.newPage.printFieldsList = new PrintFieldList();
        this.newPage.printFieldsList.rowOfFields[i] = array;
      } else {
        if (this.newPage.printFieldsList.rowOfFields[i]) {
          this.newPage.printFieldsList.rowOfFields[i] = array;
        } else {
          this.newPage.printFieldsList.rowOfFields[i] = new RowOfFields();
          this.newPage.printFieldsList.rowOfFields[i] = array;
        }
      }
    }

    if (input) {
      input.value = '';
    }
  }

  selected(event, i) {
    const value = event.option.viewValue;
    if (value) {
      const length = this.placeholder.length;
      if (this.placeholder.length === 0) {
        this.placeholder.push([]);
      }
      this.placeholder[i].push({ chip: value, fieldType: 'variable' });
      let array = {
        repeatable: this.form.get('chipProperties').get('' + i).get('isRepeatable').value,
        placeholder: this.placeholder[i]
      };
      if (!this.newPage.printFieldsList) {
        this.newPage.printFieldsList = new PrintFieldList();
        this.newPage.printFieldsList.rowOfFields[i] = array;
      } else {
        if (this.newPage.printFieldsList.rowOfFields[i]) {
          this.newPage.printFieldsList.rowOfFields[i] = array;
        } else {
          this.newPage.printFieldsList.rowOfFields[i] = new RowOfFields();
          this.newPage.printFieldsList.rowOfFields[i] = array;
        }
      }
    }
  }

  removePlaceholderFromPage(index, i) {
    // this.newPage.printFieldsList.rowOfFields[i].placeholder.splice(index, 1);
    if (this.newPage.printConfiguration && this.newPage.printConfiguration.rowOfPrintFields[i]) {
      this.newPage.printConfiguration.rowOfPrintFields[i].printFieldColumns.splice(index, 1);
    }
  }

  removeChip(holder, i) {
    const index = this.placeholder[i].indexOf(holder);
    this.placeholder[i].splice(index, 1);
    this.removePlaceholderFromPage(index, i);
  }

  repeatable($event, i) {
    if ($event.checked === true) {
      this.newPage.printFieldsList.rowOfFields[i].repeatable = true;
      if (this.inBuiltVariables.length === 2) {
        this.inBuiltVariables.push('Sequence Number');
      }
    } else {
      this.newPage.printFieldsList.rowOfFields[i].repeatable = false;
      if (this.inBuiltVariables.length === 3) {
        this.inBuiltVariables.splice(2, 1);
      }
      const index = this.placeholder[i].indexOf(this.placeholder[i].find(holder => holder.chip === 'Sequence Number'));
      if (index >= 0) {
        this.placeholder[i].splice(index, 1);
        this.newPage.printConfiguration.rowOfPrintFields[i].printFieldColumns.splice(index, 1);
      }
    }
  }

  loadOptions(event, i) {
    if (this.form.get('chipProperties').get('' + i).get('isRepeatable').value === true) {
      if (this.inBuiltVariables.length === 2) {
        this.inBuiltVariables.push('Sequence Number');
      }
    } else {
      if (this.inBuiltVariables.length === 3) {
        this.inBuiltVariables.splice(2, 1);
      }
    }
  }

  openProperties(placeholder, i, j, fieldType) {
    const length = this.placeholder.length;
    const dialog = this.dialog.open(PrintConfigurationPropertiesComponent, {
      disableClose: true,
      width: '800px',
      data: {
        value: placeholder, page: this.newPage, index: i, placeholderIndex: j,
        fieldNames: this.fieldNameArray, repeatableSection: this.data.repeatableSectionNames,
        fieldType: fieldType
      }
    });
    dialog.afterClosed().subscribe(data => {
      this.newPage = data;
    });
  }

  submit(userForm) {
    // let count=0;
    // for(let i=0;i<this.newPage.printFieldsList.rowOfFields.length;i++){
    //   if(this.newPage.printFieldsList.rowOfFields[i].isRepeatable===true){
    //     for(let j=0;j<this.newPage.printFieldsList.rowOfFields[i].placeholder.length;j++){
    //       let placeholder=this.newPage.printFieldsList.rowOfFields[i].placeholder[j];
    //       if(this.data.repeatableFieldNames.some(repeatableName=>repeatableName===placeholder.chip)){
    //         count++;
    //       }
    //     }
    //   }
    // }
    if (this.newPage.printConfiguration) {
      for (let i = 0; i < this.newPage.printConfiguration.rowOfPrintFields.length; i++) {
        this.newPage.printConfiguration.rowOfPrintFields[i].repeatableSection = this.newPage.printFieldsList.rowOfFields[i].repeatable;
      }
    }
    const newPage = this.newPage;
    this.dialogRef.close({ value: true, page: newPage });
  }

  cancel() {
    const oldPage = JSON.parse(JSON.stringify(this.oldPage));
    this.dialogRef.close({ value: false, page: oldPage });
  }
}


