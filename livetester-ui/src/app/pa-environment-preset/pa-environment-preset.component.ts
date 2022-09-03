import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { LivetestService } from 'src/shared/service/livetest.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { YorogridComponent } from '../yorogrid/yorogrid.component';
import { EnvironmentPresetVO } from 'src/shared/vo/environment-preset-vo';
import { EnvironmentListVO } from 'src/shared/vo/environment-vo';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';

@Component({
  selector: 'app-pa-environment-preset',
  templateUrl: './pa-environment-preset.component.html',
  styleUrls: ['./pa-environment-preset.component.css']
})
export class PaEnvironmentPresetComponent implements OnInit {

  constructor(private fb: FormBuilder, private service: LivetestService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.getEnvironmentNames();
  }

  @ViewChild('pa', { static: true }) paGrid: YorogridComponent;
  environmentPresetVo = new EnvironmentPresetVO();
  response: EnvironmentListVO[];
  readonly = false;
  form: FormGroup;
  selected = '';
  ngOnInit() {
    this.form = this.fb.group({
      id: [this.environmentPresetVo.id],
      environmentId: [this.environmentPresetVo.environmentId, Validators.required],
      paVO: this.fb.group({
        number: [this.environmentPresetVo.paVO.number, Validators.required],
        description: [this.environmentPresetVo.paVO.description, Validators.required],
      })
    });
  }

  receiveMessage($event): void {
    this.readonly = true;
    this.service.getEnvironmentPaDetails($event.col1, $event.col2).subscribe(data => {
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
      this.service.saveEnvironmentPaDetails(this.environmentPresetVo).subscribe(data => {
        this.readonly = false;
        this.environmentPresetVo.environmentId = null;
        this.paGrid.refreshGrid();

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
          serviceName: 'pa',
          displayText: 'PA Preset'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        userForm.resetForm();
        this.getEnvironmentNames();
        this.paGrid.refreshGrid();

      });
    }
  }


  clearSearch(userForm: NgForm) {
    userForm.reset();
    this.readonly = false;
  }
}
