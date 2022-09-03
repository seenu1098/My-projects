import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent implements OnInit {
  termsForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TermsConditionsComponent>,
    private dialog: MatDialog, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.termsForm = this.fb.group({
      terms: ['', Validators.requiredTrue],
    });
  }
  cancel() {
    this.dialogRef.close();
  }
  accept() {
    this.dialogRef.close('accepted');
  }
  decline() {
    this.dialogRef.close('declined');
  }

}
