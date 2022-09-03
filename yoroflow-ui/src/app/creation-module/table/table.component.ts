import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from './custom-date-adapter';
import { DateFormatService } from './date-format-service';
import { Field, FieldConfig, Table } from '../shared/vo/page-vo';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css'
    ],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
})
export class TableComponent implements OnInit {
    @Input() field: Field;
    @Input() group: FormGroup;
    showControl = false;
    uuid: string;
    table: Table;
    fields: FieldConfig[];
    formArray: FormArray;
    computationField: FieldConfig;
    size = '40';
    headerColor = 'yellow';
    format = 'MM/DD/yyyy';
    end = 'center';


    constructor(public el: ElementRef, private fb: FormBuilder,
         private df: DateFormatService) { }

    ngOnInit() {
        this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        this.table = this.field.control as Table;
        // this.convertColumnsToFieldObject(this.table.columns);
        this.addComputeFields();
        this.addTableFormArrayFields();
        this.addComputeFormFieldsValueChanges();
        // this.clearRequiredValidationsInTable(this.field);
    }

    clearRequiredValidationsInTable(field: Field) {
        if (field.control) {
            const table = field.control as Table;
            const fields = table.columns;
            const formArray = this.group.get(table.tableId) as FormArray;
            for (let i = 0; i < formArray.length; i++) {
                const index = '' + i;
                const formArrayGroup = formArray.get(index);
                fields.forEach(tableField => {
                    const value = formArrayGroup.get(tableField.field.name);
                    value.valueChanges.subscribe(data => {
                        if (this.getAccessForClearValidation(formArray, fields, i)) {
                            fields.filter(requiredField => requiredField.field.required === true).forEach(requiredField => {
                                const requiredControl = formArrayGroup.get(requiredField.field.name);
                                requiredControl.clearValidators();
                                requiredControl.updateValueAndValidity();
                            });
                        }
                    });
                });
            }
        }
    }

    getAccessForClearValidation(formArray: FormArray, fields: FieldConfig[], i: number) {
        let clearValidators = true;
        const index = '' + i;
        const formArrayGroup = formArray.get(index);
        fields.forEach(tableField => {
            const data = formArrayGroup.get(tableField.field.name).value;
            if (data !== null && data !== '') {
                clearValidators = false;
            }
        });
        return clearValidators;
    }


    setFormat(format) {
        if (format === null) {
            this.df.format = this.format;
        } else {
            this.df.format = format;
        }
    }

    getBorderStyle(type) {
        if (type === 'dotted') {
            return '2px dotted #ccccb3';
        } else if (type === 'solid') {
            return '2px solid #ccccb3';
        }
    }

    getAllignment(value) {
        if (value === 'start start') {
            return 'left';
        } else if (value === 'center center') {
            return 'center';
        } else if (value === 'end end') {
            return 'right';
        }
    }

    getDatatype(dataType) {
        if (dataType === 'long' || dataType === 'float') {
            return 'number';
        }

        if (dataType === 'string') {
            return 'text';
        }
    }

    addComputeFormFieldsValueChanges() {
        const formArray = this.group.get(this.table.tableId) as FormArray;
        for (let i = 0; i < formArray.length; i++) {
            const index = '' + i;
            const group = formArray.get(index) as FormGroup;
            this.table.columns.forEach(column => {
                group.get(column.field.name).valueChanges.subscribe(data => {
                    this.computeOperations();
                    if (this.getAccessForClearValidation(formArray, this.table.columns, i)) {
                        this.table.columns.filter(requiredField => requiredField.field.required === true).forEach(requiredField => {
                            const requiredControl = group.get(requiredField.field.name);
                            // requiredControl.clearValidators();
                            // requiredControl.updateValueAndValidity();
                            requiredControl.setErrors(null);
                        });
                    }
                });
            });
        }
    }

    addComputeFields() {
        const computation = this.table.enableRowLevelComputation;
        if (computation.option === true) {
            this.computationField = new FieldConfig();
            this.computationField.controlType = 'input';
            this.computationField.field.name = computation.computationFieldName;
            this.computationField.field.label.labelName = '';
            this.computationField.field.dataType = 'long';
        }
    }

    convertColumnsToFieldObject(columns: FieldConfig[]) {
        columns.forEach(column => {
            if (column.field.dataType === 'string' || column.field.dataType === 'long' || column.field.dataType === 'float') {
                if (column.field.dataType === 'string' ||
                    (column.field.control && column.field.control.textFieldType === '')) {
                    column.controlType = 'textarea';
                } else {
                    column.controlType = 'input';
                }
            } else if (column.field.dataType === 'date') {
                column.controlType = 'date';
            }
        });
        this.fields = columns;
    }

    addTableFormArrayFields() {
        const arrayName = this.table.tableId;
        this.group.addControl(arrayName, this.fb.array([]));
        const formArray = (this.group.get(arrayName) as FormArray);
        for (let i = 0; i < this.table.noOfRows; i++) {
            formArray.push(this.getFormGroup());
        }
        this.formArray = formArray;
        this.showControl = true;
    }

    getFormGroup() {
        const formGroup = this.fb.group({});
        formGroup.addControl('id', this.fb.control('-1'));
        const computation = this.table.enableRowLevelComputation;
        if (computation && computation.option === true) {
            formGroup.addControl(computation.computationFieldName, this.fb.control(null));
            formGroup.get(computation.computationFieldName).disable();
        }
        this.table.columns.forEach(column => {
            formGroup.addControl(column.field.name, this.fb.control(''));
        });
        formGroup.updateValueAndValidity();
        return formGroup;
    }

    computeOperations() {
        const computation = this.table.enableRowLevelComputation;
        if (computation.option === true) {
            this.computeValues(computation.operatorType);
        }
    }

    computeValues(type: string) {
        const formArray = this.group.get(this.table.tableId) as FormArray;
        for (let i = 0; i < formArray.length; i++) {
            const index = '' + i;
            const group = formArray.get(index) as FormGroup;
            let value = 0;
            const length = this.table.columns.filter(f => (f.field.dataType === 'long' || f.field.dataType === 'float') 
            && f.field.control.allowFieldToCompute === true).length;
            this.table.columns.filter(f => (f.field.dataType === 'long' || f.field.dataType === 'float')
                && f.field.control.allowFieldToCompute === true).forEach(column => {
                    if (type === 'add' || type === 'average') {
                        const formValue: number = +group.get(column.field.name).value;
                        value = value + formValue;
                    }
                });
            if (value !== 0) {
                if (type === 'average') {
                    value = value / length;
                }
                group.get(this.computationField.field.name).setValue(value);
                group.updateValueAndValidity();
            }
        }
    }

    getTableFormArray() {
        return this.group.get(this.table.tableId) as FormArray;
    }

    addFormGroup(i) {
        this.getTableFormArray().insert(i + 1, this.getFormGroup());
    }

    removeFormGroup(i: number) {
        this.getTableFormArray().removeAt(i);
    }
}
