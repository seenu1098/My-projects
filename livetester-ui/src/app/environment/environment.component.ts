import { Component, OnInit } from '@angular/core';
import { EnvironmentVO, EnvironmentListVO } from 'src/shared/vo/environment-vo';
import { FormGroup, FormBuilder, Validators, NgForm, FormArray } from '@angular/forms';
import { LivetestService } from 'src/shared/service/livetest.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';

@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.css']
})
export class EnvironmentComponent implements OnInit {
  selected = '';
  form: FormGroup;
  environmentVO = new EnvironmentVO();
  response: EnvironmentListVO[];
  pemUpdate = false;
  readonly = false;
  disable = false;
  hidePassword = true;
  hideDbPassword = true;
  passwordType: boolean;
  deleteButtonVisible = false;
  deleteBtnDisable = true;


  constructor(private fb: FormBuilder, private service: LivetestService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.getEnvironmentNames();
  }

  ngOnInit() {
    this.form = this.fb.group({
      environmentId: [this.environmentVO.environmentId],
      environmentName: [this.environmentVO.environmentName, Validators.required],
      targetFolder: [this.environmentVO.targetFolder, Validators.required],
      protocol: [this.environmentVO.protocol, Validators.required],
      host: [this.environmentVO.host, Validators.required],
      port: [this.environmentVO.port, Validators.required],
      logonType: [this.environmentVO.logonType, Validators.required],
      userName: [this.environmentVO.userName],
      password: [this.environmentVO.password],
      pemText: [this.environmentVO.pemText],
      dbType: [this.environmentVO.dbType, Validators.required],
      dbHost: [this.environmentVO.dbHost, Validators.required],
      dbPort: [this.environmentVO.dbPort, Validators.required],
      dbUsername: [this.environmentVO.dbUsername, Validators.required],
      dbPassword: [this.environmentVO.dbPassword, Validators.required],
      dbName: [this.environmentVO.dbName, Validators.required],
      schemaName: [this.environmentVO.schemaName, Validators.required],
      completionQuery: [this.environmentVO.completionQuery, Validators.required],
      tcnQuery: [this.environmentVO.tcnQuery, Validators.required],
    });
  }




  save(userForm: NgForm) {
    this.environmentVO = this.form.value;

    if (userForm.valid) {
      this.service.saveEnvironment(this.environmentVO).subscribe(data => {
        this.readonly = false;
        this.environmentVO.environmentId = null;

        this.snackBar.openFromComponent(SnackBarComponent, {
          data: data.response,
        });

        this.getEnvironmentNames();
        userForm.resetForm();
        this.selected = '';
      });
    }
  }

  clearSearch(userForm: NgForm) {
    this.pemUpdate = false;
    userForm.reset();
    this.environmentVO = new EnvironmentVO();
    this.readonly = false;
    this.selected = '';
    this.deleteButtonVisible = false;
    this.deleteBtnDisable = true;
  }

  getEnvironmentNames() {
    this.service.getEnvironmentNamesList().subscribe(data => {
      this.response = data;
    });
  }

  loadEnvironmentInfo(event, userForm: NgForm) {
    if (event.isUserInput) {
      this.environmentVO.environmentId = event.source.value;
      this.deleteButtonVisible = true;
      userForm.resetForm();
    }
  }

  editEnvironment() {

    this.service.getEnvironmentData(this.environmentVO.environmentId).subscribe(data => {

      this.environmentVO = data;
      this.ngOnInit();
      this.deleteBtnDisable = false;
      this.updateValidatorBasedOnSelection(this.environmentVO.logonType);
      this.readonly = true;
      if (this.environmentVO.pemText) {
        this.pemUpdate = true;
      } else {
        this.pemUpdate = false;
      }
    });
  }


  none(event: any) {
    if (event.isUserInput) {
      this.updateValidatorBasedOnSelection(event.source.value);
    }
  }

  updateValidatorBasedOnSelection(value: string) {
    const user = this.form.get('userName');
    const pass = this.form.get('password');
    const pem = this.form.get('pemText');
    this.disable = false;

    if (value === 'None') {
      user.setValidators(null);
      pass.setValidators(null);
      this.disable = true;
    } else if (value === 'Pem File') {
      user.setValidators([Validators.required]);
      pass.setValidators(null);
      pem.setValidators([Validators.required]);
    } else {
      user.setValidators([Validators.required]);
      pass.setValidators([Validators.required]);
      pem.setValidators(null);
    }

    user.updateValueAndValidity();
    pass.updateValueAndValidity();
    pem.updateValueAndValidity();
  }

  deleteEnvironment(userForm: NgForm) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponent, {
      width: '250px',
      data: {
        id: this.environmentVO.environmentId,
        serviceName: 'environment',
        displayText: 'Environment'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        userForm.resetForm();
        this.getEnvironmentNames();
      }
    });
  }
}
