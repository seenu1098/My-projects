import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { LivetestService } from 'src/shared/service/livetest.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { YorogridComponent } from '../yorogrid/yorogrid.component';
import { EnvironmentPresetVO } from 'src/shared/vo/environment-preset-vo';
import { EnvironmentListVO } from 'src/shared/vo/environment-vo';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';

@Component({
  selector: 'app-payor-preset',
  templateUrl: './payor-preset.component.html',
  styleUrls: ['./payor-preset.component.css']
})
export class PaPresetComponent implements OnInit {

  constructor(private fb: FormBuilder, private service: LivetestService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.getEnvironmentNames();
  }

  selected = '';

  @ViewChild('payor', { static: true }) payorGrid: YorogridComponent;
  environmentPresetVo = new EnvironmentPresetVO();
  response: EnvironmentListVO[];
  readonly = false;
  form: FormGroup;
  ngOnInit() {
    this.form = this.fb.group({
      id: [this.environmentPresetVo.id],
      environmentId: [this.environmentPresetVo.environmentId, Validators.required],
      payor: this.fb.group({
        identifier: [this.environmentPresetVo.payor.identifier, Validators.required],
        name: [this.environmentPresetVo.payor.name, Validators.required],
        description: [this.environmentPresetVo.payor.description, Validators.required],
        address: this.fb.group({
          address: [this.environmentPresetVo.payor.address.address, Validators.required],
          city: [this.environmentPresetVo.payor.address.city, Validators.required],
          state: [this.environmentPresetVo.payor.address.state, Validators.required],
          zipcode: [this.environmentPresetVo.payor.address.zipcode, Validators.required],
        })
      })
    });
  }

  receiveMessage($event): void {
    this.readonly = true;
    this.service.getEnvironmentPayorDetails($event.col1, $event.col2).subscribe(data => {
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
      this.service.saveEnvironmentPayorDetails(this.environmentPresetVo).subscribe(data => {
        this.readonly = false;
        this.environmentPresetVo.environmentId = null;
        this.payorGrid.refreshGrid();

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
          serviceName: 'payor',
          displayText: 'Payor'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        userForm.resetForm();
        this.getEnvironmentNames();
        this.payorGrid.refreshGrid();

      });
    }
  }


  clearSearch(userForm: NgForm) {
    userForm.reset();
    this.readonly = false;
  }

}
