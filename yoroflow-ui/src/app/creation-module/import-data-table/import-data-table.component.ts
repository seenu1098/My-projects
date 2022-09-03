import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { ColumnDataVO, DataTableVO, ListOfMapVO, MapVO } from '../data-table/data-table-vo';
import { TableObjectService } from '../table-objects/table-objects.service';

@Component({
  selector: 'app-import-data-table',
  templateUrl: './import-data-table.component.html',
  styleUrls: ['./import-data-table.component.scss']
})
export class ImportDataTableComponent implements OnInit {

  fieldList: any[] = [];
  dataTableColumns: any[] = [];
  dataTableColumnsArray: any[] = [];
  selectedTableColumns: any[] = [];
  cardType = 'option';
  mappingForm: FormGroup;
  selectedField: any;
  @ViewChild('menuTrigger1') pageFieldMenu;
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ImportDataTableComponent>,
    public service: TableObjectService,
    public cd: ChangeDetectorRef,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { this.createForm(); }

  ngOnInit(): void {
    this.fieldList = this.data.fieldList;
    this.dataTableColumns = JSON.parse(JSON.stringify(this.data.dataTableColumns));
    this.dataTableColumnsArray = JSON.parse(JSON.stringify(this.data.dataTableColumns));
    for (let i = 0; i < this.dataTableColumnsArray.length; i++) {
      this.dataTableColumnsArray[i].filter = true;
    }
    this.addControl();
  }



  isLinear = true;
  form: FormGroup;

  createForm() {
    this.form = this.fb.group({
      searchDataTable: [''],
      duplicateColumns: ['', Validators.required]
    });

    this.mappingForm = this.fb.group({
      constantValue: []
    });
  }

  openCardType(type) {
    this.cardType = type;
  }

  addControl() {
    this.dataTableColumns.forEach(field => {
      this.mappingForm.addControl(field.columnIdentifier, this.fb.group({
        variableType: ['pagefield'],
        value: ['', [field.isRequired === true ? Validators.required : Validators.nullValidator]]
      }));
    });

  }

  getValue(controlValue: any): string {
    var value: string = '';
    if (controlValue.variableType) {
      if (controlValue.variableType === 'pagefield') {
        this.fieldList.forEach(field => {
          if (field === controlValue.value) {
            value = field;
          }
        });
      } else {
        value = controlValue.value;
      }
    }
    return value;
  }

  getDateValue(value) {
    if (value.value !== '' && value.variableType === 'constant') {
      let dateString;
      const date1 = new Date(value.value);
      dateString = this.datePipe.transform(date1, 'dd-MM-yyyy');
      return dateString;
    }
  }

  //'MMM d, y, h:mm:ss a'

  getDateTimeValue(value) {
    if (value.value !== '' && value.variableType === 'constant') {
      let dateString;
      const date1 = new Date(value.value);
      dateString = this.datePipe.transform(date1, 'MMM d, y, h:mm a');
      return dateString;
    }
  }
  getFieldType(): string {
    var fieldType: string = '';
    if (this.selectedField.datatype === 'string') {
      fieldType = 'text';
    } else if (this.selectedField.datatype === 'long' || this.selectedField.datatype === 'float') {
      fieldType = 'number';
    } else if (this.selectedField.datatype === 'date') {
      fieldType = 'date';
    }
    return fieldType;
  }

  setSelectionChange(fieldId, value) {
    this.pageFieldMenu.closeMenu();
    this.mappingForm.get(fieldId).get('value').setValue(value);
  }


  getConstantValue(field: any): void {
    if (this.mappingForm.get(field.columnIdentifier).get('variableType').value === 'constant') {
      this.mappingForm.get('constantValue').setValue(this.mappingForm.get(field.columnIdentifier).get('value').value);
    } else {
      this.mappingForm.get('constantValue').setValue('');
    }
  }

  setConstantValue(): void {
    this.pageFieldMenu.closeMenu();
    this.cd.detectChanges();
    this.mappingForm.get(this.selectedField.columnIdentifier).get('variableType').setValue('constant');
    this.mappingForm.get(this.selectedField.columnIdentifier).get('value').setValue(this.mappingForm.get('constantValue').value);
    this.mappingForm.get('constantValue').setValue('');

  }


  getMainSectionFieldGroup(field: any): string {
    return field.columnIdentifier;
  }

  mousedown(field: any): void {
    this.selectedField = field;
    if (this.mappingForm.get(field.columnIdentifier).get('variableType').value === 'constant') {
      this.mappingForm.get('constantValue').setValue(this.mappingForm.get(field.columnIdentifier).get('value').value);
    }
  }

  checkIfEmptyFields(): boolean {
    for (const field of this.dataTableColumns) {
      if (field.isRequired === false) {
        const value = this.mappingForm.get(field.columnIdentifier).get('value').value;
        if (value !== '' && value !== null && value !== undefined) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }

  checkIfEmptyFieldsForUpdate(): boolean {
    for (const field of this.dataTableColumns) {
      if (field.isRequired === false) {
        const value = this.mappingForm.get(field.columnIdentifier).get('value').value;
        if (value === '' || value === null || value === undefined) {
          return false;
        }
      } else if (field.isRequired === true &&
        this.mappingForm.get(field.columnIdentifier).get('value').value === ''
        || this.mappingForm.get(field.columnIdentifier).get('value').value === null
        || this.mappingForm.get(field.columnIdentifier).get('value').value === undefined) {
        return false;
      }
    }
    return true;
  }

  submit() {
    this.form.get('duplicateColumns').markAsTouched();
    const mapVO = new MapVO();
    if (this.cardType === 'skip') {
      mapVO.duplicateColumns = [];
      this.form.get('duplicateColumns').setValidators(null);
      this.form.get('duplicateColumns').setErrors(null);
      this.form.get('duplicateColumns').updateValueAndValidity();
    } else {
      mapVO.duplicateColumns = this.form.get('duplicateColumns').value;
    }

    if (this.cardType === 'skip') {
      if (this.checkIfEmptyFields() === true) {
        this.formSubmit(mapVO);
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Map atleast one field mapping'
        });
      }
    } else {
      if (this.form.valid && this.mappingForm.valid) {
        if (this.checkIfEmptyFieldsForUpdate() === false) {
          const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
            width: '400px',
            data: { type: 'dataTableMapping' }
          });
          dialog.afterClosed().subscribe(data => {
            if (data && data === true) {
              this.formSubmit(mapVO);
            }
          });
        } else {
          this.formSubmit(mapVO);
        }
      }
    }
  }

  formSubmit(mapVO) {
    if (this.form.valid && this.mappingForm.valid) {
      const listOfMapVO: ListOfMapVO[] = [];
      this.dataTableColumns.forEach(field => {
        const items = new ListOfMapVO();
        items.fieldName = field.columnIdentifier;
        items.value = this.mappingForm.get(field.columnIdentifier).get('value').value;
        items.variableType = this.mappingForm.get(field.columnIdentifier).get('variableType').value;;
        items.dataType = field.dataType;
        listOfMapVO.push(items);
      });

      mapVO.listOfMapVO = listOfMapVO;
      mapVO.tableObjectsId = this.data.tableObjectsId;

      const formData = new FormData();
      formData.append('file', this.data.file);
      formData.append('data', JSON.stringify(mapVO));

      this.service.importDataTable(formData).subscribe(data => {
        if (data.response.includes('successfully')) {
          this.dialogRef.close(true);
        } else {
          let message = '';
          if (data.response.includes('Unparseable date')) {
            message = 'Date field mapped to string field';
          } else if (data.response.includes('For input string')) {
            message = 'Number field mapped to string field';
          } else {
            message = data.response;
          }
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: message
          });
        }
      });
    }
  }


  add(val) {

    for (let j = 0; j < this.dataTableColumns.length; j++) {
      if (this.dataTableColumns[j].id === val.id) {
        this.selectedTableColumns.unshift(this.dataTableColumns[j]);
      }
    }
    for (let i = 0; i < this.selectedTableColumns.length; i++) {
      this.selectedTableColumns[i].filter = true;
    }
    this.dataTableColumnsArray.forEach((element, index) => {
      if (element.id == val.id) this.dataTableColumnsArray.splice(index, 1);
    });
    this.form.get('searchDataTable').setValue('');

  }

  remove(val) {
    this.selectedTableColumns.forEach((element, index) => {
      if (element.id == val.id) this.selectedTableColumns.splice(index, 1);
    });
    this.dataTableColumnsArray.unshift(val);
    for (let i = 0; i < this.dataTableColumnsArray.length; i++) {
      this.dataTableColumnsArray[i].filter = true;
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
