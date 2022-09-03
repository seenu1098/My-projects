import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-confirmdialog',
  templateUrl: './confirmdialog.component.html',
  styleUrls: ['./confirmdialog.component.scss']
})
export class ConfirmdialogComponent implements OnInit {
  showAdditionalUsers = false;
  totalAmount = 0;
  form: FormGroup;
  orgDetailsVo: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmdialogComponent>, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.orgDetailsVo = this.data.orgDetailsVo;
    if (this.data?.type === 'pay-user' && this.showAdditionalUsers === false) {
      this.form = this.fb.group({
        numberOfUsers: ['']
      });
      this.userValueChanges();
    }

    if (this.data?.type === 'downgrade-plan' && this.showAdditionalUsers === false) {
      this.form = this.fb.group({
        downgrade: [false]
      });
    }
  }

  showOptions(event) {
    this.form.get('downgrade').setValue(event.checked);
  }

  userValueChanges() {
    this.form.get('numberOfUsers').valueChanges.pipe(debounceTime(300)).subscribe(data => {
      let amount = 0;
      if (this.data.subscriptionDetails.billingType === 'monthly') {
        amount = this.orgDetailsVo.amountPerUserMonthly;
      }

      if (this.data.subscriptionDetails.billingType === 'yearly') {
        amount = this.orgDetailsVo.amountPerUserYearly;
      }
      this.totalAmount = data * amount;
    });
  }
  onNoClick() {
    this.dialogRef.close();
  }
  delete() {
    this.dialogRef.close('yes');
  }
  deactivate() {
    this.dialogRef.close('yes');
  }
  subscribe() {
    this.dialogRef.close(true);
  }

  addUsers() {
    this.showAdditionalUsers = true;
  }

  confirm() {
    this.dialogRef.close({ isConfirm: true, totalAmount: this.totalAmount, totalUsers: this.form.get('numberOfUsers').value });
  }

  cancelUser() {
    this.dialogRef.close({ isConfirm: false, totalAmount: this.totalAmount, totalUsers: this.form.get('numberOfUsers').value });
  }

  downgrade() {
    this.dialogRef.close(true);
  }
  leave() {
    this.dialogRef.close('yes');
  }

  cancelDowngrade() {
    this.dialogRef.close(false);
  }

  explore() {
    window.open("https://www.yoroflow.com/free-workflow-software-solution/", '_blank');
  }


}
