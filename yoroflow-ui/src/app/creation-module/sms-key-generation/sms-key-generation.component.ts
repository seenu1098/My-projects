import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateOrganizationService } from '../create-organization/create-organization.service';
import { OrganizationSMSKeys, SMSKeysVO } from '../create-organization/customer-vo';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { PhoneNumber } from './sms-key-vo';


@Component({
  selector: 'lib-sms-key-generation',
  templateUrl: './sms-key-generation.component.html',
  styleUrls: ['./sms-key-generation.component.css']
})

export class SmsKeyGenerationComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<SmsKeyGenerationComponent>,
    private fb: FormBuilder, private service: CreateOrganizationService, private snackBar: MatSnackBar) { }
  form: FormGroup;
  smsSection = new OrganizationSMSKeys();
  show = true;
  savedSmsProvider = false;
  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.form = this.fb.group({
      organizationSmsKeys: this.fb.array([
        this.organizationSmsFormGroup()
      ]),
      deleteKeys: [],
    });
  }

  organizationSmsFormGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      providerName: ['', Validators.required],
      secretKey: ['', Validators.required],
      secretToken: ['', Validators.required],
      fromPhoneNumber: [''],
      serviceName: [''],
      smsFrom: [''],
    });
  }

  providerNameSelect(event, i) {
    let secretKey = this.form.get('organizationSmsKeys').get('' + i).get('secretKey');
    let secretToken = this.form.get('organizationSmsKeys').get('' + i).get('secretToken');
    let phoneNumber = this.form.get('organizationSmsKeys').get('' + i).get('fromPhoneNumber');
    let serviceName = this.form.get('organizationSmsKeys').get('' + i).get('serviceName');
    let smsFrom = this.form.get('organizationSmsKeys').get('' + i).get('smsFrom');
    if (event.value === 'twilio') {
      smsFrom.enable();
      smsFrom.setValidators([Validators.required]);
      if (smsFrom.value === null && smsFrom.value === undefined && smsFrom.value === '') {
        phoneNumber.disable();
        serviceName.disable();
      }
      this.providerNameExsitCheck();
      secretKey.enable();
      secretToken.enable();
      secretKey.setValidators([Validators.required]);
      secretToken.setValidators([Validators.required]);
    } else if (event.value === 'aws') {
      this.show = false;
      phoneNumber.setValidators(null);
      serviceName.setValidators(null);
      smsFrom.setValidators(null);
      smsFrom.setValue('');
      phoneNumber.setValue('');
      serviceName.setValue('');
      smsFrom.disable();
      phoneNumber.disable();
      serviceName.disable();
      secretKey.enable();
      secretToken.enable();
      secretKey.setValidators([Validators.required]);
      secretToken.setValidators([Validators.required]);
    }
    smsFrom.updateValueAndValidity();
    phoneNumber.updateValueAndValidity();
    serviceName.updateValueAndValidity();
    secretKey.updateValueAndValidity();
    secretToken.updateValueAndValidity();
  }

  smsFromSelect(event, i) {
    if (event.value === 'phoneNumber') {
      this.form.get('organizationSmsKeys').get('' + i).get('serviceName').disable();
      this.form.get('organizationSmsKeys').get('' + i).get('fromPhoneNumber').enable();
      this.form.get('organizationSmsKeys').get('' + i).get('serviceName').setValue('');
      if (this.form.get('organizationSmsKeys').get('' + i).get('providerName').value === 'twilio') {
        this.form.get('organizationSmsKeys').get('' + i).get('fromPhoneNumber').setValidators([Validators.required]);
      } else {
        this.form.get('organizationSmsKeys').get('' + i).get('fromPhoneNumber').setValidators(null);
      }
    } else if (event.value === 'serviceName') {
      this.form.get('organizationSmsKeys').get('' + i).get('fromPhoneNumber').disable();
      this.form.get('organizationSmsKeys').get('' + i).get('serviceName').enable();
      this.form.get('organizationSmsKeys').get('' + i).get('fromPhoneNumber').setValue('');
      if (this.form.get('organizationSmsKeys').get('' + i).get('providerName').value === 'twilio') {
        this.form.get('organizationSmsKeys').get('' + i).get('serviceName').setValidators([Validators.required]);
      } else {
        this.form.get('organizationSmsKeys').get('' + i).get('serviceName').setValidators(null);

      }
    }
    this.form.get('organizationSmsKeys').get('' + i).get('fromPhoneNumber').updateValueAndValidity();
    this.form.get('organizationSmsKeys').get('' + i).get('serviceName').updateValueAndValidity();
  }


  alreadyExistCheckForPhoneNumber(j) {
    const formArray = (this.form.get('organizationSmsKeys') as FormArray);
    const group = this.form.get('organizationSmsKeys').get('' + j);
    const phoneNumber = group.get('fromPhoneNumber').value;
    const serviceName = group.get('serviceName');
    const phoneNumbers: PhoneNumber[] = this.getPhoneNumbers();
    for (let i = 0; i < formArray.length; i++) {
      const name = formArray.get('' + i).get('fromPhoneNumber');
      if (phoneNumbers.some(number => (number.value === phoneNumber && number.index !== j))) {
        group.get('fromPhoneNumber').setErrors({ alreadyExistNumber: true });
      }
      if (name.errors && name.errors.alreadyExistNumber === true) {
        if (!phoneNumbers.some(field => (field.index !== i && field.value === name.value))) {
          name.setErrors(null);
        }
      }
    }
  }

  getPhoneNumbers() {
    const formArray = (this.form.get('organizationSmsKeys') as FormArray);
    const phoneNumbers: PhoneNumber[] = [];
    for (let i = 0; i < formArray.length; i++) {
      const phoneNumber = formArray.get('' + i).get('fromPhoneNumber').value;
      if (phoneNumber !== null && phoneNumber !== undefined && phoneNumber !== '') {
        phoneNumbers.push({ index: i, value: phoneNumber });
      }
    }
    return phoneNumbers;
  }

  getServiceNames() {
    const formArray = (this.form.get('organizationSmsKeys') as FormArray);
    const serviceNames: PhoneNumber[] = [];
    for (let i = 0; i < formArray.length; i++) {
      const serviceName = formArray.get('' + i).get('serviceName').value;
      if (serviceName !== null && serviceName !== undefined && serviceName !== '') {
        serviceNames.push({ index: i, value: serviceName });
      }
    }
    return serviceNames;
  }

  alreadyExistCheckForServiceName(j) {
    const formArray = (this.form.get('organizationSmsKeys') as FormArray);
    const group = this.form.get('organizationSmsKeys').get('' + j);
    const serviceName = group.get('serviceName').value;
    const serviceNames: PhoneNumber[] = this.getServiceNames();
    for (let i = 0; i < formArray.length; i++) {
      const name = formArray.get('' + i).get('serviceName');
      if (serviceNames.some(number => (number.value === serviceName && number.index !== j))) {
        group.get('serviceName').setErrors({ alreadyExistServiceName: true });
      }
      if (name.errors && name.errors.alreadyExistServiceName === true) {
        if (!serviceNames.some(field => (field.index !== i && field.value === name.value))) {
          name.setErrors(null);
        }
      }
    }
  }

  providerNameExsitCheck() {
    const formArray = (this.form.get('organizationSmsKeys') as FormArray);
    let count = 0;
    for (let i = 0; i < formArray.length; i++) {
      const providerName = formArray.get('' + i).get('providerName').value;
      if (providerName === 'aws') {
        count++;
      }
    }
    if (count > 0) {
      this.show = false;
    } else {
      this.show = true;
    }
  }
  
  getSMSSectionFormArray() {
    return (this.form.get('organizationSmsKeys') as FormArray).controls;
  }

  addSmsFormArray(i) {
    (this.form.get('organizationSmsKeys') as FormArray).push(this.organizationSmsFormGroup());
    this.providerNameExsitCheck();
    const group = ((this.form.get('organizationSmsKeys') as FormArray).get('' + i) as FormGroup);
    group.get('secretKey').disable();
    group.get('secretToken').disable();
    group.get('fromPhoneNumber').disable();
    group.get('serviceName').disable();
    group.get('smsFrom').disable();
  }

  removeSmsFormArray(i) {
    const deleteId = this.form.get('organizationSmsKeys').get('' + i).get('id').value;
    // this.deleteKeys.push(deleteId);
    (this.form.get('organizationSmsKeys') as FormArray).removeAt(i);
    this.providerNameExsitCheck();
  }

  saveSMSKey(userForm) {
    if (userForm.valid) {
      this.smsSection = this.form.getRawValue();
      this.service.saveOrganizationSmsKeys(this.smsSection).subscribe(
        data => {
          if (data) {
            this.savedSmsProvider = true;
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
          }
          this.dialogRef.close(true);
        });
    }

  }

  onNoClick() {
    this.dialogRef.close(false);
  }

  // reset() {
  //   this.form.reset();
  // }

  // loadSMSFormGroup(subDomain) {
  //   this.service.getOrganizationSmsKeys(subDomain).subscribe(data => {
  //     if (data.length > 0) {
  //       this.smsSection = data;
  //       for (let i = 0; i < this.smsSection.length; i++) {
  //         if (i > 0) {
  //           this.addSmsFormArray();
  //         }
  //         const group = ((this.form.get('organizationSmsKeys') as FormArray).get('' + i) as FormGroup);
  //         group.get('providerName').setValue(this.smsSection[i].providerName);
  //         group.get('secretKey').setValue(this.smsSection[i].secretKey);
  //         group.get('secretToken').setValue(this.smsSection[i].secretToken);
  //         group.get('fromPhoneNumber').setValue(this.smsSection[i].fromPhoneNumber);
  //         group.get('serviceName').setValue(this.smsSection[i].serviceName);
  //         group.get('id').setValue(this.smsSection[i].id);
  //         this.providerNameSelect({ value: this.smsSection[i].providerName }, i);
  //         if (this.smsSection[i].fromPhoneNumber) {
  //           group.get('smsFrom').setValue('phoneNumber');
  //           this.smsFromSelect({ value: 'phoneNumber' }, i)
  //         } else if (this.smsSection[i].serviceName) {
  //           group.get('smsFrom').setValue('serviceName');
  //           this.smsFromSelect({ value: 'serviceName' }, i)
  //         }
  //       }
  //     }
  //   });
  // }

}
