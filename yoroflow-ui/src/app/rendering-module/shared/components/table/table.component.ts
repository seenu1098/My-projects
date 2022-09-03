import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Column, Field, FieldConfig, LabelType, Table, TableComputation } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { FormValidationService } from '../../service/form-service/form-validation.service';
import { DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from '../date/custom-date-adapter';
import { DateFormatService } from '../date/date-format-service';
import { LoadFormService } from '../../service/form-service/load-form.service';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';

@Component({
    selector: 'lib-table',
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
    computationFormArray: FormArray; isRowCompute = false;
    totalCompute: number;
    minDate: Date;
    maxDate: Date;
    constructor(public el: ElementRef, public formService: CreateFormService, private fb: FormBuilder,
        private validationService: FormValidationService, private df: DateFormatService, private loadFormService: LoadFormService) { }

    ngOnInit() {
        if (!this.group.get('isFormEditable')) {
            this.group.addControl('isFormEditable', this.fb.control(false));
        }
        this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        this.table = this.field.control as Table;
        this.addComputeFields();
        this.addTableFormArrayFields();
        this.addComputeFormFieldsValueChanges();
        this.validationService.setCustomErrors(this.getTableFormArray(), this.table.columns);
        this.loadFormService.tableEmitter.subscribe(data => {
            if (data) {
                this.addComputeFormFieldsValueChanges();
            }
        });
        this.loadFormValuesForDate();
    }

    loadFormValuesForDate() {
        const formArray = this.group.get(this.table.tableId) as FormArray;
        for (let i = 0; i < formArray.length; i++) {
            const index = '' + i;
            const group = formArray.get(index) as FormGroup;
            this.table.columns.forEach(column => {
                if (column.controlType === 'date') {
                    group.get(column.field.name).valueChanges.subscribe(data => {
                        if (data) {
                            const stringified = JSON.stringify(data);
                            if (stringified && stringified.length > 10) {
                                const dob = stringified.substring(1, 11);
                                this.group.get(column.field.name).setValue(dob, { emitEvent: false });
                            }
                        }
                    });
                }
            });
        }
    }


    allowFutureDate(field) {
        if (field && !field.allowFutureDate) {
            this.maxDate = new Date(new Date().setDate(new Date().getDate()));
            return this.maxDate;
        } else {
            return null;
        }
    }

    allowPastDate(field) {
        if (field && !field.allowPastDate) {
            this.minDate = new Date(new Date().setDate(new Date().getDate()));
            return this.minDate;
        } else {
            return null;
        }
    }

    getAccessForClearValidation(formArray: FormArray, fields: FieldConfig[], i: number) {
        let clearValidators = true;
        const index = '' + i;
        const formArrayGroup = formArray.get(index);
        if (formArrayGroup != null) {
            fields.forEach(tableField => {
                if (tableField.field.name) {
                    const data = formArrayGroup.get(tableField.field.name).value;
                    if (data !== null && data !== '') {
                        clearValidators = false;
                    }
                }
            });
        }

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

    getColumnBackGroundStyle(control: AbstractControl) {
        if (control.invalid) {
            return ' rgb(255, 149, 149)';
        } else {
            return '';
        }
    }

    getMatTooltipValue(control: AbstractControl, labelName: string) {
        if (control.errors !== null) {
            if (control.errors.required) {
                return labelName + ' is required.';
            }
            if (control.errors.maxlength) {
                return labelName + ' should be maximum ' + control.errors.maxlength.requiredLength + ' characters.';
            }
            if (control.errors.minlength) {
                return labelName + ' should be minimum ' + control.errors.minlength.requiredLength + ' characters.';
            }
            if (control.errors.max) {
                return labelName + ' should be maximum ' + control.errors.max.max + '.';
            }
            if (control.errors.min) {
                return labelName + ' should be minimum ' + control.errors.min.min + '.';
            }
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
                group.get(column.field.name).valueChanges.pipe(debounceTime(300)).subscribe(data => {
                    this.computeOperations(column.field.name);
                    if (data) {
                        if (this.getAccessForClearValidation(formArray, this.table.columns, i)) {
                            this.table.columns.filter(requiredField => requiredField.field.required === true).forEach(requiredField => {
                                const requiredControl = group.get(requiredField.field.name);
                                requiredControl.setErrors(null);
                            });
                        }
                    }
                });
            });
        }
    }

    afterComputeFormFieldsValueChanges() {
        this.table.columns.forEach(column => {
            this.computeOperations(column.field.name);
        });
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

    addTableFormArrayFields() {
        const arrayName = this.table.tableId;
        this.group.addControl(arrayName, this.fb.array([]));
        const formArray = (this.group.get(arrayName) as FormArray);
        if (formArray.length === 0) {
            for (let i = 0; i < this.table.noOfRows; i++) {
                formArray.push(this.getFormGroup());
            }
        }
        this.formArray = formArray;
        if (this.table.enableColumnLevelComputation.option === true) {
            this.group.addControl('columnComputationArray', this.fb.array([]));
            const computationFormArray = (this.group.get('columnComputationArray') as FormArray);
            if (computationFormArray.length === 0) {
                computationFormArray.push(this.getColumnFormGroup());
            }
            this.computationFormArray = computationFormArray;
        }
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

    getColumnFormGroup() {
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


        formGroup.addControl('option', this.fb.control(this.table.enableColumnLevelComputation.option));
        formGroup.addControl('computationLabelName', this.fb.control(this.table.enableColumnLevelComputation.computationLabelName));
        formGroup.addControl('totalCompute', this.fb.control(null));

        formGroup.updateValueAndValidity();
        return formGroup;
    }

    computeOperations(fieldName: string) {
        const rowLevelcomputation = this.table.enableRowLevelComputation;
        if (rowLevelcomputation.option === true) {
            this.rowLevelComputeValues(rowLevelcomputation.operatorType);
        }
        const columnLevelcomputation = this.table.enableColumnLevelComputation;
        if (columnLevelcomputation.option === true) {
            this.columnLevelComputeValues(columnLevelcomputation.operatorType, fieldName);
        }
    }

    rowLevelComputeValues(type: string) {
        const formArray = this.group.get(this.table.tableId) as FormArray;
        for (let i = 0; i < formArray.length; i++) {
            const index = '' + i;
            const group = formArray.get(index) as FormGroup;
            let value = 0;
            let mulValue = 0;
            const length = this.table.computeFields.length;
            if (length > 0) {
                this.table.computeFields.forEach(column => {
                    if (group.get(column).value !== null && group.get(column).value !== '') {
                        if (type === 'add' || type === 'average') {
                            const formValue: number = +group.get(column).value;
                            value = value + formValue;
                        }
                        if (type === 'multiplication') {
                            const formValue: number = +group.get(column).value;
                            if (mulValue === 0 && formValue !== 0) {
                                mulValue = 1;
                            }
                            mulValue = mulValue * formValue;
                            if (mulValue !== 0) {
                                group.get(this.computationField.field.name).setValue(mulValue);
                            }
                        }
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
        if (this.table.enableColumnLevelComputation.option) {
            this.setRowComputation();
        }
    }

    columnLevelComputeValues(type: string, fieldName: string) {
        const formArray = this.group.get(this.table.tableId) as FormArray;
        let value = 0;
        let mulValue = 0;
        for (let i = 0; i < formArray.length; i++) {
            const index = '' + i;
            const rowGroup = formArray.get(index) as FormGroup;
            const length = this.table.computeFields.length;
            const enableCompute = this.table.computeFields.some(t => t === fieldName);
            if (enableCompute) {
                if (type === 'add' || type === 'average') {
                    const formValue: number = +rowGroup.get(fieldName).value;
                    value = value + formValue;
                }
                if (type === 'multiplication') {
                    const formValue: number = +rowGroup.get(fieldName).value;
                    if (mulValue === 0 && formValue !== 0) {
                        mulValue = 1;
                    }
                    mulValue = mulValue * formValue;
                }
                if (type === 'average') {
                    value = value / length;
                }
                const computationFormArray = this.group.get('columnComputationArray') as FormArray;
                for (let i = 0; i < computationFormArray.length; i++) {
                    const index = '' + i;
                    const group = computationFormArray.get(index) as FormGroup;
                    if (mulValue !== 0) {
                        group.get(this.computationField.field.name).setValue(mulValue);
                    } else {
                        group.get(fieldName).setValue(value);
                    }
                    group.updateValueAndValidity();
                }
            }
        }
    }

    setRowComputation() {
        this.isRowCompute = true;
        const formArray = this.group.get(this.table.tableId) as FormArray;
        let value = 0;
        for (let i = 0; i < formArray.length; i++) {
            const index = '' + i;
            const group = formArray.get(index) as FormGroup;
            const formValue: number = +group.get(this.computationField.field.name).value;
            value = value + formValue;
        }

        this.totalCompute = value;
        const computationFormArray = this.group.get('columnComputationArray') as FormArray;
        for (let i = 0; i < computationFormArray.length; i++) {
            const index = '' + i;
            const group = computationFormArray.get(index) as FormGroup;
            group.get('totalCompute').setValue(this.totalCompute);
            group.get(this.computationField.field.name).setValue(this.totalCompute);
            group.updateValueAndValidity();
        }
    }


    getTableFormArray() {
        return this.group.get(this.table.tableId) as FormArray;
    }

    addFormGroup(i) {
        if (this.table.enableRowAddition === undefined || this.table.enableRowAddition === true) {
            this.getTableFormArray().insert(i + 1, this.getFormGroup());
            this.addComputeFormFieldsValueChanges();
            this.validationService.setCustomErrors(this.getTableFormArray(), this.table.columns);
        }

    }

    removeFormGroup(i: number) {
        if (this.table.enableRowAddition === undefined || this.table.enableRowAddition === true) {
            this.getTableFormArray().removeAt(i);
            this.table.columns.forEach(column => {
                this.computeOperations(column.field.name);
            });
        }
    }
}
