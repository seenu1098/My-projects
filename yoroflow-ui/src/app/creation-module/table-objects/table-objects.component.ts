import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ɵConsole ,HostListener} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { TableObjectsVO } from './table-object-vo';
import { TableObjectService } from './table-objects.service';
import { Router } from '@angular/router';
import { DataTableDialogComponent } from '../data-table-dialog/data-table-dialog.component';
import { ThemeService } from 'src/app/services/theme.service';


export class ColumnName {
  index: number;
  value: string;
}

@Component({
  selector: 'app-table-objects',
  templateUrl: './table-objects.component.html',
  styleUrls: ['./table-objects.component.css']
})
export class TableObjectsComponent implements OnInit {
  form: FormGroup;
  tableObjectsVO = new TableObjectsVO();
  tableObjectsVOList: TableObjectsVO[] = [];
  deletedIDList: string[] = [];
  oldTableName: any;
  showGrid = true;
  isFreePlan: boolean;
  tableObjectId: any;
  selectedIndex: any;
  scrollHeight: any;
  screenHeight1: any;
  @ViewChild('menuTriggerColumn') deleteTable;
  @Input() tableObjectDbTask: any;
  @Output() emitTableId: EventEmitter<any> = new EventEmitter<any>();
  @Output() isChanged: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('tableCreation', { static: false }) tableCreation: YorogridComponent;
  constructor(private fb: FormBuilder,public themeService: ThemeService, public service: TableObjectService
    , public snackBar: MatSnackBar, private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.isFreePlan = JSON.parse(localStorage.getItem('isFreePlan'));
    this.initializeForm();
    this.getDataTableList();
    if (this.tableObjectDbTask && this.tableObjectDbTask.dbTaskTableObject) {
      this.showGrid = false;
      if (this.tableObjectDbTask.id) {
        this.getTableObjects(this.tableObjectDbTask.id);
      }
    }
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
  }


  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'modern') {
      this.scrollHeight = (window.innerHeight - 30) + 'px';
    } else {
      this.scrollHeight = (window.innerHeight - 86) + 'px';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.themeService.layoutName === 'modern') {
      this.scrollHeight = (window.innerHeight - 30) + 'px';
    } else {
      this.scrollHeight = (window.innerHeight - 86) + 'px';
    }
  }

  getDataTableList() {
    this.service.getTableObjectsList().subscribe(data => {
      if (data) {
        this.tableObjectsVOList = data;
        this.tableObjectsVOList.forEach(t=>t.color=this.getRandomColor())
      }
    });
  }
  getRandomColor() {
    var color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }
  deleteTables() {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      data: { type: 'delete-dataTable' }, disableClose: true
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === true) {
        this.service.deleteDataTable(this.tableObjectId).subscribe(data => {
          if (data) {
            if (data.response.includes('successfully')) {
              this.tableObjectsVOList.splice(this.selectedIndex, 1);
            }
            this.selectedIndex = null;
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
          }
        });
      }
      this.tableObjectId = '';
    });
  }

  deleteChanges(dataTable, i) {
    this.tableObjectId = dataTable.tableObjectId;
    this.selectedIndex = i;
  }

  go() {
    this.router.navigate(['/data-table']);
  }

  addTable() {
    const dialogRef = this.dialog.open(DataTableDialogComponent, {
      data: { status: 'table', tableObjectsVO: this.tableObjectsVO, type: 'save' },
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: response.response,
        });
        if (response.response.includes('Successfully')) {
          this.router.navigate(['/data-table/' + response.tableId]);
        }
      }
    });
  }

  initializeForm() {
    this.form = this.fb.group({
      tableObjectId: [this.tableObjectsVO.tableObjectId],
      tableName: [this.tableObjectsVO.tableName, Validators.required],
      tableIdentifier: [this.tableObjectsVO.tableIdentifier, Validators.required],
      publicTable: [this.tableObjectsVO.publicTable],
      tableObjectsColumns: this.fb.array([
        this.addTableObjectsFormGroup()
      ]),
    });
  }

  getTableObjectsColumnsFormArray() {
    return (this.form.get('tableObjectsColumns') as FormArray).controls;
  }

  addAnotherTableObjectsColumns() {
    const formArray = (this.form.get('tableObjectsColumns') as FormArray);
    formArray.push(this.addTableObjectsFormGroup());
  }

  removeThisTableObjectsColumns(columnIndex, $event) {
    const form = (this.form.get('tableObjectsColumns') as FormArray);
    const index = '' + columnIndex;
    const deletedID = form.get(index).get('id').value;

    if (deletedID === null || deletedID === '') {
      form.removeAt(columnIndex);
    } else {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Column cannot be removed, you can update this column as not required'
      });
    }
  }

  omit_number(event) {
    let k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k === 32 || (k >= 48 && k <= 57));
  }



  addTableObjectsFormGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      columnName: ['', Validators.required],
      columnIdentifier: ['', Validators.required],
      dataType: ['', Validators.required],
      fieldSize: [''],
      isUnique: [''],
      isRequired: ['']
    });
  }

  setFieldSizeError(dataType, fieldSize: AbstractControl) {
    if (dataType === 'string') {
      fieldSize.setValidators([Validators.required, Validators.min(1), Validators.max(10000)]);
    } else if (dataType === 'float' || dataType === 'long') {
      fieldSize.setValidators([Validators.required]);
    } else {
      fieldSize.setValidators(null);
    }
    fieldSize.updateValueAndValidity();
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

  save(userForm) {
    this.tableObjectsVO = this.form.getRawValue();
    this.tableObjectsVO.deletedColumnIDList = this.deletedIDList;
    if (this.form.valid) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.tableObjectsVO.tableObjectsColumns.length; i++) {
        this.tableObjectsVO.tableObjectsColumns[i].isRequired = this.getBooleanAsString(
          this.tableObjectsVO.tableObjectsColumns[i].isRequired);
        this.tableObjectsVO.tableObjectsColumns[i].isUnique = this.getBooleanAsString(
          this.tableObjectsVO.tableObjectsColumns[i].isUnique);
      }

      if (this.tableObjectsVO.publicTable === null || this.tableObjectsVO.publicTable === undefined
        || this.tableObjectsVO.publicTable === undefined) {
        this.tableObjectsVO.publicTable = false;
      }
      this.service.saveTableObjection(this.tableObjectsVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        if (this.showGrid && data.response.includes('Successfully')) {
          this.tableCreation.refreshGrid();
          this.reset(userForm);
        }

        if (this.tableObjectDbTask.dbTaskTableObject && data.response.includes('Successfully')) {
          this.reset(userForm);
          this.emitTableId.emit(data);
        }
      });
    }
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

  getColumnName(): ColumnName[] {
    const formArray = this.form.get('tableObjectsColumns') as FormArray;
    let columnNames: ColumnName[] = [];
    for (let i = 0; i < formArray.length; i++) {
      const columnName = formArray.get('' + i).get('columnName').value;
      if (columnName !== null && columnName !== undefined && columnName !== '') {
        columnNames.push({ index: i, value: columnName });
      }
    }
    return columnNames;
  }

  setcolumnNameIdentifier(columnIndex) {
    const formArray = this.form.get('tableObjectsColumns') as FormArray;
    const group = this.form.get('tableObjectsColumns').get('' + columnIndex);
    const value = group.get('columnName').value;
    const tableColumnId = group.get('id').value;

    if (tableColumnId === null || tableColumnId === '') {
      const columnIdentifier = this.generateTableIdentifier(value);
      if (columnIdentifier === 'uuid' || columnIdentifier === 'tenant_id' ||
        columnIdentifier === 'created_by' || columnIdentifier === 'created_on' ||
        columnIdentifier === 'modified_on' || columnIdentifier === 'modified_by' ||
        columnIdentifier === 'active_flag') {
        group.get('columnName').setErrors({ internalColumn: true });
      } else {
        group.get('columnIdentifier').setValue(columnIdentifier);
        const fieldName: ColumnName[] = this.getColumnName();
        for (let i = 0; i < formArray.length; i++) {
          const name = formArray.get('' + i).get('columnName');
          if (fieldName.some(field => (field.value === value && field.index !== columnIndex))) {
            group.get('columnName').setErrors({ unique: true });
          }
          if (name.errors && name.errors.unique === true) {
            if (!fieldName.some(field => (field.index !== i && field.value === name.value))) {
              name.setErrors(null);
            }
          }
        }
      }
    }
  }

  generateTableIdentifier(name: string) {
    name = (name).replace(/[^\w\s]/gi, '');
    name = (name).trim().toLowerCase().replace(/ +/g, '_');
    return name;
  }

  getBooleanAsString(value): any {
    if (value === null || value === false || value === '') {
      return 'false';
    } else {
      return 'true';
    }
  }

  getStringAsBoolean(value): any {
    if (value === 'true') {
      return true;
    } else {
      return false;
    }
  }

  receiveMessage(table) {
    this.router.navigate(['/data-table/' + table.tableObjectId]);
    // this.getTableObjects($event.col1);
  }

  getTableObjects(id) {
    this.service.getTableObjectInfo(id).subscribe(data => {
      this.tableObjectsVO = data;
      this.form.get('tableIdentifier').disable();
      this.oldTableName = this.tableObjectsVO.tableName;
      this.initializeForm();
      for (let i = 0; i < this.tableObjectsVO.tableObjectsColumns.length; i++) {
        if (i > 0) {
          this.addAnotherTableObjectsColumns();
        }
        const index = '' + i;
        const form = (this.form.get('tableObjectsColumns') as FormArray).get(index);
        form.setValue(this.tableObjectsVO.tableObjectsColumns[i]);
        form.get('isRequired').setValue(this.getStringAsBoolean(
          this.tableObjectsVO.tableObjectsColumns[i].isRequired));
        form.get('isUnique').setValue(this.getStringAsBoolean(
          this.tableObjectsVO.tableObjectsColumns[i].isUnique));
        form.get('columnIdentifier').disable();
        form.updateValueAndValidity();
      }
    });
  }

  reset(userForm) {
    userForm.resetForm();
    this.form.get('tableIdentifier').enable();
    this.deletedIDList = [];
    this.tableObjectsVO = new TableObjectsVO();
    this.ngOnInit();
  }

}
