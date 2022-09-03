import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm, FormArray } from '@angular/forms';
import { ElementConfigVO, ElementConfigListVO } from 'src/shared/vo/element-config-vo';
import { LivetestService } from 'src/shared/service/livetest.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';

@Component({
  selector: 'app-expected-elements-configuration',
  templateUrl: './expected-elements-configuration.component.html',
  styleUrls: ['./expected-elements-configuration.component.css']
})
export class ExpectedElementsConfigurationComponent implements OnInit {
  selected = '';
  form: FormGroup;
  elementVO = new ElementConfigVO();
  response: ElementConfigListVO[];
  readonly = false;
  isDisabled: boolean;
  deleteButtonVisible = false;

  constructor(private fb: FormBuilder, private service: LivetestService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.getElementConfigNames();
  }

  ngOnInit() {
    this.form = this.fb.group({
      id: [this.elementVO.id],
      label: [this.elementVO.label, Validators.required],
      fieldName: [this.elementVO.fieldName, Validators.required],
      fieldType: [this.elementVO.fieldType, Validators.required],
      controlType: [this.elementVO.controlType, Validators.required],
      mandatory: [this.elementVO.mandatory, Validators.required],
      applicable: [this.elementVO.applicable, Validators.required],
      matchQuery: [this.elementVO.matchQuery, Validators.required],
      fallbackQuery1: [this.elementVO.fallbackQuery1],
      fallbackQuery2: [this.elementVO.fallbackQuery2],
      array: this.fb.array([this.selectBoxFormGroup()]),
      json: []
    });
  }

  selectBoxFormGroup() {
    return this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  getSelectOptionsFormArray() {
    return (this.form.get('array') as FormArray);
  }

  addOption() {
    this.getSelectOptionsFormArray().push(this.selectBoxFormGroup());
  }

  removeOption(i) {
    (this.form.get('array') as FormArray).removeAt(i);
  }

  save(userForm: NgForm) {
    this.elementVO = this.form.value;
    if (this.elementVO.controlType === 'Select Box') {
      this.elementVO.json = JSON.stringify(this.form.get('array').value);
    } else {
      this.form.removeControl('array');
    }

    if (userForm.valid) {
      this.service.saveElementConfig(this.elementVO).subscribe(data => {
        this.clearSearch('clear');
        this.getElementConfigNames();
        userForm.resetForm();
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: data.response,
        });
      });
    }
  }

  clearSearch(action: string) {
    this.form.reset();
    this.elementVO = new ElementConfigVO();
    this.readonly = false;
    this.isDisabled = false;
    if (action === 'reset') {
      this.snackBar.dismiss();
    }
    this.selected = '';
    this.deleteButtonVisible = false;
  }

  getElementConfigNames() {
    this.service.getElementConfigList('list').subscribe(data => {
      this.response = data;
    });
  }

  loadExpectedElementInfo(event, userForm: NgForm) {
    if (event.isUserInput) {
      this.elementVO.id = event.source.value;
      this.deleteButtonVisible = true;
      userForm.resetForm();
    }
  }

  editElementConfig() {
    this.service.getElementConfigData(this.elementVO.id).subscribe(data => {
      this.elementVO = data;
      this.deleteButtonVisible = true;
      this.readonly = true;
      this.isDisabled = true;
      this.ngOnInit();
      if (this.elementVO.controlType === 'Select Box') {
        const json: any[] = JSON.parse(this.elementVO.json);
        for (let i = 0; i < json.length; i++) {
          const index = '' + i;
          if (i > 0) {
            this.addOption();
          }
          this.form.get('array').get(index).setValue(json[i]);
        }
      }
    });
  }

  deleteElement() {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponent, {
      width: '300px',
      data: {
        id: this.elementVO.id,
        serviceName: 'expected-elements',
        displayText: 'Element configuration lable'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clearSearch('clear');
        this.elementVO = new ElementConfigVO();
        this.getElementConfigNames();
        this.ngOnInit();
        this.deleteButtonVisible = false;
      }
    });
  }
}
