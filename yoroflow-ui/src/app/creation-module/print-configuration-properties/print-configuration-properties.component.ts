import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Page, PrinterConfiguration, PrintField, RowOfPrintFields } from '../shared/vo/page-vo';


@Component({
  selector: 'lib-print-configuration-properties',
  templateUrl: './print-configuration-properties.component.html',
  styleUrls: ['./print-configuration-properties.component.css']
})
export class PrintConfigurationPropertiesComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PrintConfigurationPropertiesComponent>, private fb: FormBuilder) { }

  form: FormGroup;
  newPage = new Page();
  oldPage: any[] = [];
  show = false;
  array: any[] = [];
  isDisabled = true;
  i = 0;
  printerConfiguration = new PrinterConfiguration();
  placeholder: any[] = [];
  selectable = true;
  removable = true;

  ngOnInit() {
    this.newPage = this.data.page;
    this.oldPage = JSON.parse(JSON.stringify(this.data.page));
    this.form = this.fb.group({
      label: [''],
      fieldType: [''],
      fontSize: ['Small', [Validators.required]],
      bold: [false],
      alignment: ['Left', [Validators.required]],
      addNewLine: [false],
      lineNumbers: [1],
      repeatableSectionName: [''],
      horizontalLine: [false],
      beforeSpace: [1],
      afterSpace: [1],
      cutPaper: [false],
      dateFormat: ['MM/dd/yyyy'],
      timeFormat: ['hh:mm:ss'],
      chip: [''],
      replaceValues: this.fb.array([
        this.replaceValueFormGroup()
      ]),
      matchType: ['']
    });
    this.form.get('fieldType').setValue(this.data.fieldType);
    if(this.data.fieldType==='static' || this.data.value.chip === 'Sequence Number'){
      this.form.get('label').disable();
    }
    this.loadForm(this.data.placeholderIndex);
  }

  replaceValueFormGroup(): FormGroup {
    return this.fb.group({
      replaceValue: [''],
      replaceWith: [''],
    });
  }

  getReplaceValueFormArray() {
    return (this.form.get('replaceValues') as FormArray).controls;
  }

  addReplaceValueFormArray() {
    (this.form.get('replaceValues') as FormArray).push(this.replaceValueFormGroup());

  }

  removeReplaceValueFormArray(i) {
    (this.form.get('replaceValues') as FormArray).removeAt(i);
  }

  loadForm(i) {
    const index = this.data.index;
    const plaveholderIndex = this.data.placeholderIndex;
    if (this.newPage.printConfiguration && this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex]) {
      this.form.get('fontSize').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].fontSize);
      this.form.get('bold').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].isBold);
      this.form.get('alignment').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].alignment);
      this.form.get('addNewLine').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].addNewLine);
      this.form.get('lineNumbers').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].numberOfNewLines);
      this.form.get('beforeSpace').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].beforeSpace);
      this.form.get('afterSpace').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].afterSpace);
      this.form.get('fieldType').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].fieldType);
      this.form.get('cutPaper').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].cutPaper);
      this.form.get('horizontalLine').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].horizontalLine);
      if (this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].repeatableSectionName) {
        this.form.get('repeatableSectionName').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].repeatableSectionName);
      }
      if (this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].dateFormat) {
        this.form.get('dateFormat').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].dateFormat);
      } else if (this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].timeFormat) {
        this.form.get('timeFormat').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].timeFormat);
      }
      this.form.get('label').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].label);
      this.form.get('matchType').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].matchType);
      this.placeholder = this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].nonPrintedValues;
      if (this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].replaceValue) {
        const length = this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].replaceValue.length;
        for (let j = 0; j < length; j++) {
          if (j > 0) {
            (this.form.get('replaceValues') as FormArray).push(this.replaceValueFormGroup());
          }
          const group = ((this.form.get('replaceValues') as FormArray).get('' + j) as FormGroup);
          group.get('replaceValue').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].replaceValue[j].replaceValue);
          group.get('replaceWith').setValue(this.newPage.printConfiguration.rowOfPrintFields[index].printFieldColumns[plaveholderIndex].replaceValue[j].replaceWith);
        }
      }
    }
  }

  add(event) {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      if (!this.placeholder) {
        this.placeholder = [];
      }
      this.placeholder.push(value);
    }
    if (input) {
      input.value = '';
    }
  }

  removeChip(i) {
    this.placeholder.splice(i, 1);
  }

  submit(userForm) {
    if (userForm.valid) {

      const printFieldColumns = new PrintField();
      printFieldColumns.fontSize = this.form.get('fontSize').value;
      printFieldColumns.fieldType = this.form.get('fieldType').value;
      printFieldColumns.fieldName = this.data.value.chip;
      printFieldColumns.isBold = this.form.get('bold').value;
      printFieldColumns.alignment = this.form.get('alignment').value;
      printFieldColumns.addNewLine = this.form.get('addNewLine').value;
      printFieldColumns.numberOfNewLines = this.form.get('lineNumbers').value;
      printFieldColumns.beforeSpace = this.form.get('beforeSpace').value;
      printFieldColumns.afterSpace = this.form.get('afterSpace').value;
      printFieldColumns.cutPaper = this.form.get('cutPaper').value;
      printFieldColumns.horizontalLine = this.form.get('horizontalLine').value;
      printFieldColumns.repeatableSectionName = this.form.get('repeatableSectionName').value;
      printFieldColumns.replaceValue = this.form.get('replaceValues').value;
      printFieldColumns.nonPrintedValues = this.placeholder;
      printFieldColumns.matchType = this.form.get('matchType').value;
      printFieldColumns.label = this.form.get('label').value;
      if (this.form.get('fieldType').value === 'variable' && this.data.value.chip === 'Current Date') {
        printFieldColumns.dateFormat = this.form.get('dateFormat').value;
      } else if (this.form.get('fieldType').value === 'variable' && this.data.value.chip === 'Current Time') {
        printFieldColumns.timeFormat = this.form.get('timeFormat').value;
      }

      const printFieldRows = new RowOfPrintFields();
      printFieldRows.repeatableSection = false;
      printFieldRows.printFieldColumns[this.data.placeholderIndex] = printFieldColumns;

      const printerConfig = new PrinterConfiguration();
      printerConfig.rowOfPrintFields[this.data.index] = printFieldRows;

      if (!this.newPage.printConfiguration) {
        this.newPage.printConfiguration = printerConfig;
      } else {
        if (this.newPage.printConfiguration.rowOfPrintFields[this.data.index]) {
          this.newPage.printConfiguration.rowOfPrintFields[this.data.index].printFieldColumns[this.data.placeholderIndex] = printFieldColumns;
        } else {
          this.newPage.printConfiguration.rowOfPrintFields[this.data.index] = printFieldRows;
        }
      }
      const newPage = this.newPage;
      this.dialogRef.close(newPage);
    }
  }

  radioChange(event) {
    if (event.value === 'static') {
      this.form.get('fieldType').setValue('static');
    } else {
      this.form.get('fieldType').setValue('variable');
    }
  }

  close() {
    const oldPage = JSON.parse(JSON.stringify(this.oldPage));
    this.dialogRef.close(oldPage);
  }

}

