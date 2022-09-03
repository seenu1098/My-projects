import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { TableObjectService } from '../table-objects/table-objects.service';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { TableObjectsColumns, TableObjectsVO } from '../table-objects/table-object-vo';

@Component({
  selector: 'app-data-table-dialog',
  templateUrl: './data-table-dialog.component.html',
  styleUrls: ['./data-table-dialog.component.scss']
})
export class DataTableDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar, private dialog: MatDialog,
              private dialogRef: MatDialogRef<DataTableDialogComponent>, private fb: FormBuilder, public service: TableObjectService) { }


  form: FormGroup;
  oldTableName: any;
  dataTable: TableObjectsVO;
  ngOnInit(): void {
    if (this.data.status === 'column') {
      this.addTableObjectsFormGroup();
      this.dataTable = JSON.parse(JSON.stringify(this.data.dataTable));
      if (this.data.data.type === 'float') {
        this.form.get('isDecimal').setValue(true);
      }
      if (this.data.type === 'save') {
        this.loadForSave();
      }
    }
    if (this.data.status === 'table') {
      this.addDataTableFormGroup();
      this.oldTableName = this.data.tableObjectsVO?.tableName;
    }
  }

  loadForSave() {
    this.form.get('dataType').setValue(this.data.data.type);
  }

  addDataTableFormGroup() {
    this.form = this.fb.group({
      tableObjectId: [this?.data.tableObjectsVO?.tableObjectId],
      tableName: [this.data?.tableObjectsVO?.tableName, Validators.required],
      tableIdentifier: [this.data?.tableObjectsVO?.tableIdentifier, Validators.required],
      tableDescription: [],
      publicTable: [(this.data.tableObjectsVO === null || this.data.tableObjectsVO.publicTable === undefined
        || this.data.tableObjectsVO.publicTable === null)
        ? false : this.data?.tableObjectsVO?.publicTable],
    });
  }

  setTableIdentifier() {
    const name = this.generateTableIdentifier(this.form.get('tableName').value);
    const tableName = this.form.get('tableName').value;
    if (this.oldTableName !== this.form.get('tableName').value
      && tableName !== '' && tableName !== null && tableName !== undefined) {
      this.service.checkTableName(this.form.get('tableName').value).subscribe(data => {
        if (data.response !== 'New Name') {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.form.get('tableName').setErrors({ alreadyExist: true });
        }
      });
      this.form.get('tableIdentifier').setValue(name);
    }
  }

  openDialog($event) {
    if ($event.checked === true) {
      const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '400px',
        data: { type: 'publicAccess' }, disableClose: true
      });
      dialogRef.afterClosed().subscribe(response => {
        if (response === true) {
          this.form.get('publicTable').setValue(true);
        } else {
          this.form.get('publicTable').setValue(false);
        }
      });
    }

  }

  saveTable(userForm) {
    if (userForm.valid) {
      let tableObjectsVO = new TableObjectsVO();
      tableObjectsVO = this.form.getRawValue();
      this.service.saveTableObjection(tableObjectsVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        this.dialogRef.close(data);
      });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }

  addTableObjectsFormGroup() {
    this.form = this.fb.group({
      id: [this.data?.data?.id],
      columnName: [this.data?.data?.columnName, Validators.required],
      columnIdentifier: [this.data?.data?.columnIdentifier, Validators.required],
      dataType: [this.data?.data?.dataType, Validators.required],
      fieldSize: [this.data?.data?.fieldSize, this.data.data.type === 'string' ? Validators.required : Validators.nullValidator],
      isUnique: [this.data?.data?.isUnique],
      isRequired: [{ value: this.data?.data?.isRequired, disabled: this.data?.required }],
      isDecimal: [{ value: this.data?.data?.dataType === 'float' ? true : false, disabled: this.data?.type !== 'save' }]
    });
  }

  changeDataType(event) {
    if (event) {
      if (this.form.get('isDecimal').value === true) {
        this.form.get('dataType').setValue('float');
      } else {
        this.form.get('dataType').setValue('long');
      }
    }
  }

  save(userForm) {
    if (this.form.valid) {
      this.service.saveTableObjectColumn(this.form.getRawValue(), this.data.dataTable.tableObjectId).subscribe(data => {
        if (data) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          if (data.response.includes('successfully')) {
            let tableObjectsColumns = new TableObjectsColumns();
            tableObjectsColumns = this.form.getRawValue();
            tableObjectsColumns.id = data.tableId;
            if (this.data.type === 'save') {
              tableObjectsColumns.columnIdentifier = 'ya_' + tableObjectsColumns.columnIdentifier;
              this.dataTable?.tableObjectsColumns?.push(tableObjectsColumns);
            } else {
              if (this.dataTable?.tableObjectsColumns !== undefined || this.dataTable?.tableObjectsColumns !== null) {
                this.dataTable.tableObjectsColumns[this.data.index] = tableObjectsColumns;
              }
            }
            this.data.dataTable = this.dataTable;
            this.dialogRef.close(this.data.dataTable);
          } else {
            this.dialogRef.close();
          }
        }
      });
    }
  }

  reset(userform) {
    this.form.reset();
  }

  omit_number(event) {
    let k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k === 32 || (k >= 48 && k <= 57));
  }

  setcolumnNameIdentifier() {
    const value = this.form.get('columnName').value;
    const tableColumnId = this.form.get('id').value;

    if (tableColumnId === null || tableColumnId === '') {
      const columnIdentifier = this.generateTableIdentifier(value);
      if (columnIdentifier === 'uuid' || columnIdentifier === 'tenant_id' ||
        columnIdentifier === 'created_by' || columnIdentifier === 'created_on' ||
        columnIdentifier === 'modified_on' || columnIdentifier === 'modified_by' ||
        columnIdentifier === 'active_flag') {
        this.form.get('columnName').setErrors({ internalColumn: true });
      } else {
        this.form.get('columnIdentifier').setValue(columnIdentifier);
      }
    }
  }

  generateTableIdentifier(name: string) {
    name = (name).replace(/[^\w\s]/gi, '');
    name = (name).trim().toLowerCase().replace(/ +/g, '_');
    return name;
  }

}
