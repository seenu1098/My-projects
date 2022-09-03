import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { PaymentSettingService } from './payment-setting.service';
import { PaymentSettingVO } from './payment-settings-vo';

@Component({
  selector: 'lib-payment-settings',
  templateUrl: './payment-settings.component.html',
  styleUrls: ['./payment-settings.component.css']
})
export class PaymentSettingsComponent implements OnInit {
  @ViewChild('payment', { static: true }) gridConfig: YorogridComponent;

  constructor(private fb: FormBuilder, private paymentSettingService: PaymentSettingService, private snackBar: MatSnackBar) { }
  form: FormGroup;
  paymentSettingVO = new PaymentSettingVO();
  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.paymentSettingVO.id],
      stripeKeyName: [this.paymentSettingVO.stripeKeyName, Validators.required],
      secretKey: [this.paymentSettingVO.secretKey, Validators.required],
      publishKey: [this.paymentSettingVO.publishKey, Validators.required],
      description: [this.paymentSettingVO.description],
    });
  }

  save(userForm) {
    const publishKey = this.form.get('publishKey');
    const secretKey = this.form.get('secretKey');
    if (publishKey.value.includes('xxx') && secretKey.value.includes('xxx')) {
      publishKey.setErrors({ invalidPublishKey: true });
      secretKey.setErrors({ invalidSecretKey: true });
    } else if (publishKey.value.includes('xxx')) {
      publishKey.setErrors({ invalidPublishKey: true });
    } else if (secretKey.value.includes('xxx')) {
      secretKey.setErrors({ invalidSecretKey: true });
    } else {
      publishKey.setErrors(null);
      secretKey.setErrors(null);
    }
    if (userForm.valid && this.form.valid) {
      this.paymentSettingVO = this.form.getRawValue();
      this.paymentSettingService.savePaymentSettings(this.paymentSettingVO).subscribe(data => {
        if (data.response.includes('Successfully')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response
          });
          userForm.resetForm();
        }
      });
    }
  }

  reset(userForm) {
    userForm.resetForm();
  }


  receiveMessage($event) {
    this.paymentSettingService.getPaymentSettings($event.col1).subscribe(data => {
      this.paymentSettingVO = data;
      this.ngOnInit();
    })
  }
}
