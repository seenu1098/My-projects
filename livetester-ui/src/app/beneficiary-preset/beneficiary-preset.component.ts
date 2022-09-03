import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { EnvironmentListVO } from 'src/shared/vo/environment-vo';
import { LivetestService } from 'src/shared/service/livetest.service';
import { EnvironmentPresetVO } from 'src/shared/vo/environment-preset-vo';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { YorogridComponent } from '../yorogrid/yorogrid.component';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';


@Component({
  selector: 'app-beneficiary-preset',
  templateUrl: './beneficiary-preset.component.html',
  styleUrls: ['./beneficiary-preset.component.css']
})
export class BeneficiaryPresetComponent implements OnInit {

  constructor(private fb: FormBuilder, private service: LivetestService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.getEnvironmentNames();
  }

  @ViewChild('beneficiary', { static: true }) beneficiaryGrid: YorogridComponent;
  selected = '';
  today: Date;
  environmentPresetVo = new EnvironmentPresetVO();
  response: EnvironmentListVO[];
  readonly = false;
  form: FormGroup;
  ngOnInit() {
    this.form = this.fb.group({
      id: [this.environmentPresetVo.id],
      environmentId: [this.environmentPresetVo.environmentId, Validators.required],
      beneficiary: this.fb.group({
        identifier: [this.environmentPresetVo.beneficiary.identifier, Validators.required],
        firstName: [this.environmentPresetVo.beneficiary.firstName, Validators.required],
        lastName: [this.environmentPresetVo.beneficiary.lastName, Validators.required],
        dob: [this.environmentPresetVo.beneficiary.dob, Validators.required],
        gender: [this.environmentPresetVo.beneficiary.gender, Validators.required],
        description: [this.environmentPresetVo.beneficiary.description, Validators.required],
        address: this.fb.group({
          address: [this.environmentPresetVo.beneficiary.address.address, Validators.required],
          city: [this.environmentPresetVo.beneficiary.address.city, Validators.required],
          state: [this.environmentPresetVo.beneficiary.address.state, Validators.required],
          zipcode: [this.environmentPresetVo.beneficiary.address.zipcode, Validators.required],
        })
      })
    });
  }

  receiveMessage($event): void {
    this.readonly = true;
    this.service.getEnvironmentBeneficiaryDetails($event.col1, $event.col2).subscribe(data => {
      this.environmentPresetVo = data;
      this.ngOnInit();
    });

  }


  getEnvironmentNames() {
    this.service.getEnvironmentNamesList().subscribe(data => {
      this.response = data;
    });
  }

  save(userForm: NgForm) {
    this.environmentPresetVo = this.form.value;
    if (userForm.valid && userForm.dirty) {
      this.service.saveEnvironmentBeneficiaryDetails(this.environmentPresetVo).subscribe(data => {
        this.readonly = false;
        this.environmentPresetVo.environmentId = null;
        this.beneficiaryGrid.refreshGrid();

        this.snackBar.openFromComponent(SnackBarComponent, {
          data: data.response,
        });

        this.getEnvironmentNames();
        userForm.resetForm();
      });
    }
  }

  delete(userForm: NgForm) {
    if (userForm.valid) {
      const dialogRef = this.dialog.open(ConfirmationDialogBoxComponent, {
        width: '250px',
        data: {
          id: this.environmentPresetVo.id,
          serviceName: 'beneficiary',
          displayText: 'Beneficiary'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        userForm.resetForm();
        this.getEnvironmentNames();
        this.beneficiaryGrid.refreshGrid();
        this.readonly = false;
      });
    }
  }


  clearSearch(userForm: NgForm) {
    userForm.reset();
    this.readonly = false;
  }
}



