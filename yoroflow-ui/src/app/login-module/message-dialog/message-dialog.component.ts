import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateOrganizationService } from 'src/app/creation-module/create-organization/create-organization.service';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent implements OnInit {

  message: string;
  showMessage = false;
  constructor(
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MessageDialogComponent>,
    private createOrganizationService: CreateOrganizationService,
    private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.createOrganizationService.setFreePlan(this.data.subscriptionVO).subscribe(updateSub => {
      if (updateSub && updateSub.response && updateSub.response.includes('Successfully') && updateSub.startDate) {
        this.showMessage = true;
        this.message = 'Your free plan has been activated';
      }
    });
  }

  goBackToLogin() {
    this.dialogRef.close();
    this.router.navigate(['/login']);
  }
}
