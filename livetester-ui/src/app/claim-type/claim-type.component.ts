import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { LivetestService } from '../../shared/service/livetest.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { ClaimTypeVO } from '../../shared/vo/claim-vo';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';


@Component({
  selector: 'app-claim-type',
  templateUrl: './claim-type.component.html',
  styleUrls: ['./claim-type.component.css']
})
export class ClaimTypeComponent implements OnInit {
  selected = '';
  claimType: FormGroup;
  userForm: NgForm;
  claimTypeVO = new ClaimTypeVO();
  response: ClaimTypeVO[] = [new ClaimTypeVO()];
  readonly = false;
  deleteButtonVisible = false;

  constructor(private fb: FormBuilder, private service: LivetestService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.loadClaimTypesFromDb();
  }

  ngOnInit() {
    this.claimType = this.fb.group({
      id: [this.claimTypeVO.id],
      claimTypeCode: [this.claimTypeVO.claimTypeCode, Validators.required],
      description: [this.claimTypeVO.description, Validators.required],
      formType: [this.claimTypeVO.formType, Validators.required],
    });
  }

  loadClaimTypesFromDb(): void {
    this.service.getClaimTypeList().subscribe(data => {
      this.response = data;
    });
  }

  save(userForm: NgForm) {
    this.claimTypeVO = this.claimType.value;
    if (userForm.valid) {
      this.service.saveClaimType(this.claimTypeVO).subscribe(data => {
        userForm.resetForm();
        this.readonly = false;
        this.loadClaimTypesFromDb();

        this.snackBar.openFromComponent(SnackBarComponent, {
          data: data.response,
        });
        this.selected = '';
      });
    }
  }

  loadClaimTypeInfo(event: any, userForm: NgForm) {
    if (event.isUserInput) {
      this.claimTypeVO.id = event.source.value;
      this.deleteButtonVisible = true;
      userForm.resetForm();
    }
  }

  editClaimType() {
    this.service.getClaimType(this.claimTypeVO.id).subscribe(data => {
      this.claimTypeVO = data;
      this.readonly = true;
      this.deleteButtonVisible = true;
      this.ngOnInit();
    });
  }

  clear(action: string) {
    this.claimTypeVO = new ClaimTypeVO();
    this.readonly = false;
    if (action === 'reset') {
      this.snackBar.dismiss();
    }
    this.selected = '';
    this.deleteButtonVisible = false;
  }

  deleteClaimType(userForm: NgForm) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponent, {
      width: '250px',
      data: {
        id: this.claimTypeVO.id,
        serviceName: 'claimtype',
        displayText: 'Claim Type'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clear('clear');
        userForm.resetForm();
        this.loadClaimTypesFromDb();
      }
    });
  }
}
