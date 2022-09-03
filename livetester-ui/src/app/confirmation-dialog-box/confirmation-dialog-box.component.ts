import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { LivetestService } from 'src/shared/service/livetest.service';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { TestGroupService } from 'src/shared/service/test-group.service';
import { TestGroupVO } from '../create-testgroup/test-group-vo';
import { LookupDataService } from 'src/shared/service/lookup-data-service';

@Component({
  selector: 'app-confirmation-dialog-box',
  templateUrl: './confirmation-dialog-box.component.html',
  styleUrls: ['./confirmation-dialog-box.component.css']
})
export class ConfirmationDialogBoxComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ConfirmationDialogBoxComponent>, private service: LivetestService,
    private testGroupService: TestGroupService, private lookupDataService: LookupDataService) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  delete() {
    let openSnackBar: any;

    if (this.data.serviceName === 'templateName') {
      openSnackBar = this.service.deleteTemplate(this.data.id);

    } else if (this.data.serviceName === 'testgroup') {
      openSnackBar = this.testGroupService.deleteTestCaseGroupInfo(this.data.id);

    } else if (this.data.serviceName === 'environment') {
      openSnackBar = this.service.deleteEnvironment(this.data.id);

    } else if (this.data.serviceName === 'claimtype') {
      openSnackBar = this.service.deleteClaimType(this.data.id);

    } else if (this.data.serviceName === 'expected-elements') {
      openSnackBar = this.service.deleteElementConfig(this.data.id);
    } else if (this.data.serviceName === 'claims') {
      openSnackBar = this.service.deleteClaimInfo(this.data.id);
    } else if (this.data.serviceName === 'lookupdate') {
      openSnackBar = this.lookupDataService.deleteLookupData(this.data.id);
    } else if (this.data.serviceName === 'beneficiary') {
      openSnackBar = this.service.deleteEnvironmentBeneficiaryDetails(this.data.id);
    } else if (this.data.serviceName === 'provider') {
      openSnackBar = this.service.deleteEnvironmentProviderDetails(this.data.id);
    } else if (this.data.serviceName === 'payor') {
      openSnackBar = this.service.deleteEnvironmentPayorDetails(this.data.id);
    } else if (this.data.serviceName === 'pa') {
      openSnackBar = this.service.deleteEnvironmentPaDetails(this.data.id);
    }

    openSnackBar.subscribe(data => {
      if (data.isDeleted === 1) {
        this.dialogRef.close(true);
      } else if (data.isDeleted === 0) {
        this.dialogRef.close(false);
      }

      this.snackBar.openFromComponent(SnackBarComponent, {
        data: data.response,
      });
    });
  }
}
