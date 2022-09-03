import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { EnvironmentPresetVO } from 'src/shared/vo/environment-preset-vo';
import { EnvironmentListVO } from 'src/shared/vo/environment-vo';
import { YorogridComponent } from '../yorogrid/yorogrid.component';
import { LivetestService } from 'src/shared/service/livetest.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';

@Component({
  selector: 'app-provider-preset',
  templateUrl: './provider-preset.component.html',
  styleUrls: ['./provider-preset.component.css']
})
export class ProviderPresetComponent implements OnInit {
  selected = '';
  constructor(private fb: FormBuilder, private service: LivetestService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.getEnvironmentNames();
  }

  @ViewChild('provider', { static: true }) providerGrid: YorogridComponent;
  environmentPresetVo = new EnvironmentPresetVO();
  response: EnvironmentListVO[];
  readonly = false;
  form: FormGroup;
  ngOnInit() {
    this.form = this.fb.group({
      id: [this.environmentPresetVo.id],
      environmentId: [this.environmentPresetVo.environmentId, Validators.required],
      provider: this.fb.group({
        npi: [this.environmentPresetVo.provider.npi, Validators.required],
        taxonomy: [this.environmentPresetVo.provider.taxonomy, Validators.required],
        firstName: [this.environmentPresetVo.provider.firstName, Validators.required],
        lastName: [this.environmentPresetVo.provider.lastName, Validators.required],
        organizationName: [this.environmentPresetVo.provider.organizationName, Validators.required],
        taxId: [this.environmentPresetVo.provider.taxId, Validators.required],
        type: [this.environmentPresetVo.provider.type, Validators.required],
        serviceFacility: [this.environmentPresetVo.provider.serviceFacility],
        description: [this.environmentPresetVo.provider.description, Validators.required],
        address: this.fb.group({
          address: [this.environmentPresetVo.provider.address.address, Validators.required],
          city: [this.environmentPresetVo.provider.address.city, Validators.required],
          state: [this.environmentPresetVo.provider.address.state, Validators.required],
          zipcode: [this.environmentPresetVo.provider.address.zipcode, Validators.required],
        })
      })
    });
  }

  receiveMessage($event): void {
    this.readonly = true;
    this.service.getEnvironmentProviderDetails($event.col1, $event.col2).subscribe(data => {
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
      this.service.saveEnvironmentProviderDetails(this.environmentPresetVo).subscribe(data => {
        this.readonly = false;
        this.environmentPresetVo.environmentId = null;
        this.providerGrid.refreshGrid();

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
          serviceName: 'provider',
          displayText: 'Provider'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        userForm.resetForm();
        this.getEnvironmentNames();
        this.providerGrid.refreshGrid();

      });
    }
  }


  clearSearch(userForm: NgForm) {
    userForm.reset();
    this.readonly = false;
  }

}
