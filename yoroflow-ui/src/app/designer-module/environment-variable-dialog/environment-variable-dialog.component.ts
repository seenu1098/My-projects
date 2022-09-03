import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvironmentVariableService } from './environment-variable.service';
import { FormBuilder, Validators, FormGroup, FormArray, NgForm, Form } from '@angular/forms';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { EnvVariableVO, EnvironmentVariableVO } from './environment-variable-vo';
// import { LoaderService } from 'yoroapps-rendering-lib';
import { LoaderService } from '../../rendering-module/shared/service/form-service/loader-service';

@Component({
  selector: 'app-environment-variable-dialog',
  templateUrl: './environment-variable-dialog.component.html',
  styleUrls: ['./environment-variable-dialog.component.scss']
})
export class EnvironmentVariableDialogComponent implements OnInit {


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<EnvironmentVariableDialogComponent>,
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog,
    private router: Router,
    private environmentVariableService: EnvironmentVariableService, private fb: FormBuilder, private snackBar: MatSnackBar,
    private loaderservice: LoaderService) { }

  envVariablesForm: FormGroup;
  variablesVoList = new EnvVariableVO();
  deletedIdList: any[] = [];
  loadVariables = true;

  ngOnInit() {
    this.initialiseForm();
    this.getProcessDefId();

  }

  initialiseForm() {
    this.envVariablesForm = this.fb.group({
      processDefinitionId: [this.data.id],
      envVariableRequestVOList: this.fb.array([this.getEnvVariableGroup()])
    });
  }

  getEnvVariableGroup() {
    return this.fb.group({
      id: [],
      name: ['', [Validators.required]],
      value: ['', [Validators.required]],
      processDefinition: [this.data.id]
    });
  }

  getVariablesFormArray() {
    return (this.envVariablesForm.get('envVariableRequestVOList') as FormArray);
  }

  addVariables() {
    const length = this.getVariablesFormArray().length;
    this.getVariablesFormArray().push(this.getEnvVariableGroup());
  }

  removeVariable(i) {
    const deleteId = (this.getVariablesFormArray().get('' + i) as FormGroup).get('id').value;
    if (deleteId !== null && deleteId !== '') {
      this.deletedIdList.push(deleteId);
      this.envVariablesForm.markAsDirty();
    }
    this.getVariablesFormArray().removeAt(i);
  }

  loadVariableForm(list: EnvironmentVariableVO[]) {
    if (list) {
      this.loadVariables = false;
      for (let i = 0; i < list.length; i++) {
        if (i > 0) {
          this.addVariables();
        }
        list[i].name = list[i].name.split('_')[1];
        (this.getVariablesFormArray().get('' + i) as FormGroup).setValue(list[i]);
      }
    }
  }

  save(userForm) {
    this.variablesVoList = this.envVariablesForm.getRawValue();
    this.variablesVoList.deletedColumnIDList = this.deletedIdList;
    if (userForm.valid) {
      this.variablesVoList.envVariableRequestVOList.forEach(params => {
        if (!params.name.includes('env_')) {
          params.name = 'env_' + params.name;
        }
      });
      this.environmentVariableService.saveEnvironmentDetails(this.variablesVoList).subscribe(data => {
        if (this.loaderservice.showLoader !== true) {
          this.dialogRef.close();
        }
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        this.dialogRef.close();
      });
    }
  }

  getProcessDefId() {
    this.environmentVariableService.getEnvironmentDetails(this.data.key).subscribe(data => {
      this.variablesVoList.envVariableRequestVOList = data;
      this.envVariablesForm.get('processDefinitionId').setValue(this.data.id);
      this.loadVariableForm(this.variablesVoList.envVariableRequestVOList);
    });

  }

  cancel() {
    this.dialogRef.close();
  }
}
