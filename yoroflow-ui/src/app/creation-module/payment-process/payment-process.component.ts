import { Component, OnInit, ChangeDetectorRef, Inject, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { PaymentProcessService } from './payment-process.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { CreateOrganizationService } from '../create-organization/create-organization.service';
import { OrganizationService } from '../user-update-organization/organization.service';
import { PaymentSettingService } from '../payment-settings/payment-setting.service';
import { CreateOrganizationComponent } from '../create-organization/create-organization.component';
import { cardMaskFactory, expiryMask } from './payment.mask';
import { cardValidator } from './card.validatator';
import { expiryStringValidator } from './expiring-string.validator';
import { CountryCode, CountryCodes } from 'src/app/shared-module/country-list/country-list';

@Component({
  selector: 'app-payment-process',
  templateUrl: './payment-process.component.html',
  styleUrls: ['./payment-process.component.scss']
})
export class PaymentProcessComponent implements OnInit {
  @ViewChild('myDiv') myDiv: ElementRef<HTMLElement>;
  @Input() subscriptionDetails: any;
  @Input() showPayment: any;
  @Input() paymentProcessVO: any;
  @Input() isUpgradeSubscription: any;
  @Output() PaymentSuccess: EventEmitter<any> = new EventEmitter<any>();
  @Output() previous: EventEmitter<any> = new EventEmitter<any>();
  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private paymentService: PaymentProcessService
    // tslint:disable-next-line: align
    , private snackBar: MatSnackBar, private paymentSettingService: PaymentSettingService,
    private createOrganizationService: CreateOrganizationService) {
  }

  publishKey: string;
  submitted: boolean;
  formProcess = false;
  showResponse = false;
  message: string;
  customStripeForm: FormGroup;
  valid = false;
  status: any;
  response: any;
  showButton = false;
  subscriptionAmount = '';
  orgComponent: CreateOrganizationComponent;
  showError: boolean = false;
  showCountry: boolean = false;
  cardType: ICardType = null;
  numberMask = cardMaskFactory();
  expiryMask = expiryMask;
  loading = false;
  countries: Array<CountryCode> = CountryCodes;
  orgDetailsVo: any[] = [];
  totalAmount: any;
  paymentDetails: any;
  ngOnInit(): void {
    this.initializeForm();
    this.getPublishKey();

    if (this.paymentProcessVO) {
      const index = this.countries.findIndex(t => t.code === this.paymentProcessVO.country);
      if (index !== -1) {
        this.customStripeForm.get('country').setValue(this.countries[index].name);
      }
      this.customStripeForm.get('postalCode').setValue(this.paymentProcessVO.postalCode);
      this.customStripeForm.get('cvv').setValue(this.paymentProcessVO.cvv);
      this.customStripeForm.get('addressLine1').setValue(this.paymentProcessVO.addressLine1);

      this.customStripeForm.get('addressLine2').setValue(this.paymentProcessVO.addressLine2);
      this.customStripeForm.get('city').setValue(this.paymentProcessVO.city);
      this.customStripeForm.get('state').setValue(this.paymentProcessVO.state);

      this.customStripeForm.get('email').setValue(this.paymentProcessVO.email);
      this.customStripeForm.get('phone').setValue(this.paymentProcessVO.phone);
      this.customStripeForm.get('paymentCustomerId').setValue(this.paymentProcessVO.paymentCustomerId);
    }


    if (this.isUpgradeSubscription) {
      this.createOrganizationService.getPaymentSubscriptionDetails().subscribe(data => {
        this.orgDetailsVo = data;
        if (this.subscriptionDetails.planType === 'STARTER') {
          this.customStripeForm.get('orgPlanType').setValue('BUSINESS PACK');
        } else {
          this.customStripeForm.get('orgPlanType').setValue(this.subscriptionDetails.planType);
        }
        this.customStripeForm.get('orgBillingType').setValue('monthly');
        this.customStripeForm.get('totalNumberOfUsers').setValue(5);
        this.calculateAmount();
        this.planTypeValueChanges();
        this.billingTypeValueChanges();
        this.totalNumberOfUsersValueChanges();
      });



    } else {
      this.customStripeForm.get('orgPlanType').setErrors(null);
      this.customStripeForm.get('orgPlanType').setValidators(null);
      this.customStripeForm.get('orgPlanType').updateValueAndValidity();
      this.customStripeForm.get('orgBillingType').setErrors(null);
      this.customStripeForm.get('orgBillingType').setValidators(null);
      this.customStripeForm.get('orgBillingType').updateValueAndValidity();
      this.customStripeForm.get('totalNumberOfUsers').setErrors(null);
      this.customStripeForm.get('totalNumberOfUsers').setValidators(null);
      this.customStripeForm.get('totalNumberOfUsers').updateValueAndValidity();
    }
    this.getOrgsubscriptionDetails()
  }

  planTypeValueChanges() {
    this.customStripeForm.get('orgPlanType').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.calculateAmount()
      }
    });
  }

  billingTypeValueChanges() {
    this.customStripeForm.get('orgBillingType').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.calculateAmount()
      }
    });
  }


  getOrgsubscriptionDetails() {
    this.createOrganizationService.getOrgSubscription().subscribe(data => {
      if (data) {
        this.paymentDetails = data;
      }
    });
  }

  totalNumberOfUsersValueChanges() {
    this.customStripeForm.get('totalNumberOfUsers').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.calculateAmount()
      }
    });
  }

  calculateAmount() {
    const orgType = this.customStripeForm.get('orgPlanType').value;
    const billingType = this.customStripeForm.get('orgBillingType').value;
    const numberOfUsers = this.customStripeForm.get('totalNumberOfUsers').value;
    const index = this.orgDetailsVo.findIndex(t => t.planName === orgType);
    if (billingType === 'monthly') {
      const price = this.orgDetailsVo[index].monthlyPrice;
      const basePrice = this.orgDetailsVo[index].basePrice;
      this.totalAmount = basePrice + (price * numberOfUsers);
    } else {
      const price = this.orgDetailsVo[index].yearlyPrice;
      const basePrice = this.orgDetailsVo[index].basePrice;
      this.totalAmount = (basePrice * 12) + (12 * price * numberOfUsers);
    }

    this.customStripeForm.get('paymentAmount').setValue(this.totalAmount);
    this.customStripeForm.get('paymentAmount').disable();
    if (this.subscriptionDetails.customerPaymentId) {
      this.customStripeForm.get('paymentCustomerId').setValue(this.subscriptionDetails.customerPaymentId);
    }

  }

  getSubscriptionAmount() {
    if (this.isUpgradeSubscription === false && this.subscriptionDetails && this.subscriptionDetails.totalSubscriptionAmount) {
      this.customStripeForm.get('paymentAmount').setValue(this.subscriptionDetails.totalSubscriptionAmount);
      this.customStripeForm.get('paymentAmount').disable();
      if (this.subscriptionDetails.customerPaymentId) {
        this.customStripeForm.get('paymentCustomerId').setValue(this.subscriptionDetails.customerPaymentId);
      }
    }
  }

  onCardDetect(cardType: ICardType) {
    this.cardType = cardType || null;
    this.customStripeForm.get('cardNumber').updateValueAndValidity();
  }

  cc_format(value: string) {
    if (value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
      this.customStripeForm.get('cardNumber').setErrors(null);
    } else {
      this.customStripeForm.get('cardNumber').setErrors({ 'invalidCreditCard': true });
    }
  }

  initializeForm() {
    this.customStripeForm = this.fb.group({
      orgPlanType: ['', [Validators.required]],
      orgBillingType: ['', [Validators.required]],
      totalNumberOfUsers: [5, [Validators.required, Validators.min(5)]],
      paymentAmount: ['', [Validators.required]],
      cardNumber: ['', [Validators.required, cardValidator(() => this.cardType)]],
      expMonth: [''],
      expYear: [''],
      expDate: ['', [Validators.required, expiryStringValidator(),]],
      postalCode: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      tokenId: [],
      cardId: [],
      addressLine1: ['', [Validators.required]],
      addressLine2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['United States', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      paymentCustomerId: [],
      quantity: [''],
      isUpgrade: [''],
      isUpgradeSubscription: [false],
      previousPlan: ['']
    });
  }

  onExpiryKeyup($event: KeyboardEvent) {
    if (!isFinite(Number($event.key))) {
      return;
    }

    const input = $event.target as HTMLInputElement;
    const num = Number(input.value.replace(/\s\/\s/, ''));
    if (num > 1 && num < 10) {
      input.value = `0${num} / `;
    } else if (num > 12 && num < 20) {
      input.value = `01 / ${num - 10}`;
    }
  }

  onExpiryFocus($event: FocusEvent) {
    const input = $event.target as HTMLInputElement;
    input.value = input.value.replace(/\s+$/, '');
  }

  previousPage(): void {
    this.previous.emit(true);
  }

  checkPhoneNumberValidation() {
    const phone = this.customStripeForm.get('phone');
    if (phone.value !== null && phone.value !== '' && phone.value.toString().length !== 10) {
      phone.setErrors({ invalidPhone: true });
    } else {
      phone.setErrors(null);
    }
  }

  // test - pk_test_aeUUjYYcx4XNfKVW60pmHTtI
  // yorosis - pk_test_N0wXL4yw7tMa2jaKnX9RKso900qY9eDd26
  loadStripe() {
    if (!window.document.getElementById('stripe-script')) {
      const s = window.document.createElement('script');
      s.id = 'stripe-custom-form-script';
      s.type = 'text/javascript';
      s.src = 'https://js.stripe.com/v2/';
      s.onload = () => {
        (window as any).Stripe.setPublishableKey(this.publishKey);
      };
      window.document.body.appendChild(s);
    }
  }

  getCountry(country: string): void {
    this.customStripeForm.get('country').setValue(country);
    this.showCountry = true;
  }

  getPublishKey() {
    this.paymentSettingService.getPublishKey().subscribe(data => {
      this.publishKey = data.publishKey;
      if (this.publishKey) {
        this.loadStripe();
        this.getSubscriptionAmount();
        this.customStripeForm.markAsUntouched();
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Stripe key not created',
        });
      }
    });
  }

  pay(form) {
    this.checkMinimum();
    if (!(window as any).Stripe) {
      alert('Oops! Stripe did not initialize properly.');
      return;
    }
    this.showResponse = false;
    this.submitted = true;
    this.showButton = true;

    if (this.customStripeForm.invalid) {
      this.showButton = false;
      if (this.customStripeForm.get('phone').invalid) {
        this.showError = true;
      }
      return;
    }

    this.formProcess = true;

    if (!(window as any).Stripe) {
      alert('Oops! Stripe did not initialize properly.');
      return;
    }

    const cardNumber = form.value.cardNumber.replace(/\s/g, "");
    const expiryDate = form.value.expDate.split('/', 2);
    const expMonth = +expiryDate[0];
    const expYear = +(('20' + expiryDate[1]).replace(/\s/g, ""));

    this.customStripeForm.get('cardNumber').setValue(cardNumber);
    this.customStripeForm.get('expMonth').setValue(expMonth);
    this.customStripeForm.get('expYear').setValue(expYear);

    new Promise((resolve, reject) => {
      setTimeout(() => resolve(1), 1000);
    }).then(doc => {
      (window as any).Stripe.card.createToken({
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: form.value.cvc
      }, (status: number, response: any) => {
        this.submitted = false;
        this.formProcess = false;
        this.showResponse = true;
        this.status = status;
        this.response = response;
        if (status !== 200) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: response.error.message,
          });
          this.showButton = false;
        }
      });
      new Promise((resolve, reject) => {
        setTimeout(() => resolve(1), 3000);
      }).then(doc => {
        if (this.response === undefined) {
          this.showButton = false;
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Payment Failed',
          });
        } else {

          if (this.customStripeForm.get('country').value === 'United States') {
            this.customStripeForm.get('country').setValue('US');
          }
          this.customStripeForm.get('tokenId').setValue(this.response.id);
          this.customStripeForm.get('cardId').setValue(this.response.card.id);

          if (this.isUpgradeSubscription) {
            this.customStripeForm.value.planType = this.customStripeForm.get('orgPlanType').value;
            this.customStripeForm.value.quantity = this.customStripeForm.get('totalNumberOfUsers').value;
            this.customStripeForm.value.billingType = this.customStripeForm.get('orgBillingType').value;
            this.customStripeForm.value.isUpgrade = true;
          } else {
            this.customStripeForm.value.planType = this.subscriptionDetails.planType;
            this.customStripeForm.value.quantity = this.subscriptionDetails.quantity;
            this.customStripeForm.value.billingType = this.subscriptionDetails.billingType;
            this.customStripeForm.value.isUpgrade = this.subscriptionDetails.isUpgrade;
          }
          this.customStripeForm.value.paymentAmount = this.subscriptionDetails.totalSubscriptionAmount;
          this.customStripeForm.value.totalSubscriptionAmount = this.subscriptionDetails.totalAmountPayable;
          this.customStripeForm.value.discountAmount = null;


          this.customStripeForm.value.isUpgradeSubscription = this.isUpgradeSubscription;
          this.customStripeForm.value.previousPlan = this.paymentDetails.planType;
          if (this.showPayment) {
            this.paymentService.processPayment(this.customStripeForm.value).subscribe(data => {
              if (data.response.includes('processed')) {
                if (this.isUpgradeSubscription === false) {
                  this.PaymentSuccess.emit({
                    isSuccess: true, startDate: data.startDate, endDate: data.endDate
                    , customerPaymentId: data.customerPaymentId
                  });
                } else {
                  const orgType = this.customStripeForm.get('orgPlanType').value;
                  const index = this.orgDetailsVo.findIndex(t => t.planName === orgType);
                  this.PaymentSuccess.emit({
                    isSuccess: true, startDate: data.startDate, endDate: data.endDate
                    , customerPaymentId: data.customerPaymentId,
                    totalAmount: this.totalAmount,
                    planType: this.customStripeForm.get('orgPlanType').value,
                    quantity: this.customStripeForm.get('totalNumberOfUsers').value,
                    billingType: this.customStripeForm.get('orgBillingType').value,
                    planId: this.orgDetailsVo[index].planId
                  });
                }
                this.valid = true;
                this.showButton = false;
                form.resetForm();
              } else {
                this.showButton = false;
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: data.response,
                });
              }
            },
              error => {
                this.showButton = false;
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: 'Payment Failed',
                });
              });
          }
        }
      });
    });
  }

  updatePaymentMethod(form) {
    const cardNumber = form.value.cardNumber.replace(/\s/g, "");
    const expiryDate = form.value.expDate.split('/', 2);
    const expMonth = +expiryDate[0];
    const expYear = +(('20' + expiryDate[1]).replace(/\s/g, ""));

    this.customStripeForm.get('cardNumber').setValue(cardNumber);
    this.customStripeForm.get('expMonth').setValue(expMonth);
    this.customStripeForm.get('expYear').setValue(expYear);
    this.customStripeForm.get('country').setValue(this.paymentProcessVO.country);

    this.paymentService.updateCardDetails(this.customStripeForm.value).subscribe(data => {
      if (data.response.includes('successfully')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        this.previous.emit(true);
      }
    });
  }

  checkMinimum() {
    const amount = this.customStripeForm.get('paymentAmount').value;
    const form = this.customStripeForm.get('paymentAmount');
    if (amount < 0.5) {
      form.setErrors({ minError: true });
    }
  }

  getTelephoneNumber(phoneNumber: string): void {
    this.customStripeForm.get('phone').setValue(phoneNumber);
    if (this.customStripeForm.get('phone').value === undefined ||
      this.customStripeForm.get('phone').value === null ||
      this.customStripeForm.get('phone').value === '') {
      this.customStripeForm.get('phone').setValidators([Validators.required]);
      this.customStripeForm.get('phone').updateValueAndValidity();
    }
    if (this.customStripeForm.get('phone').value !== '') {
      this.showError = false;
    }
  }
}

export interface ICardType {
  /** Example: mastercard */
  name: string;

  /** Example: MasterCard */
  prettyName: string;

  pattern: RegExp;
  format: RegExp;
  inputFormat: RegExp;
  lengths: number[];
  cvcLengths: number[];
  luhn: boolean;
}