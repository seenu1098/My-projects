import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { T } from 'ngx-tethys/util';
import { CreateOrganizationService } from 'src/app/creation-module/create-organization/create-organization.service';
import { CustomerVO, discountDetailsVO, SubscriptionVO } from 'src/app/creation-module/create-organization/customer-vo';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  package = ['STARTER', 'BUSINESS PACK', 'STANDARD', 'PRO'];
  customerVO = new CustomerVO();
  paymentSubscriptionDetails: any[] = [];
  subscriptionScreenType = 'payment';
  customerInfo: any;
  adminUpdate: any;
  yoroAdminUpdate: any;
  form: FormGroup;
  custPaymentId: any;
  basic = true;
  standard = false;
  pro = false;
  planType4 = false;
  priceAmount = '';
  planType = '';
  isSubscribed = false;
  subscribedPlanType: any;
  billingType: any;
  subsAmount: any;
  amountDetails: any;
  subscriptionDetails: any;
  subAmt: any;
  subdomainName: any;
  readyForPayment = false;
  selectSubscription = true;
  doneStepper = false;
  enablePayment = false;
  enableDone = false;
  selectMonthPlanIndex: any;
  selectYearPlanIndex: any;
  stepperIndex = 0;
  buttonDisabled: boolean = false;
  screenHeight: string;
  screenHeight1: string;
  discountDetails: any;
  customerId: string;
  username: string;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private service: CreateOrganizationService,
    public themeService: ThemeService,
    private activeRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe(params => {
      if (params.get('id')) {
        this.customerId = params.get('id');
        this.username = params.get('username');
      }
    });
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    this.initializeForm();
    this.getOrganizationInfo();
  }

  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1) + 'px';
      this.screenHeight1 = (window.innerHeight - 12) + 'px';
    } else {
      this.screenHeight = (window.innerHeight - 63) + 'px';
      this.screenHeight1 = (window.innerHeight - 72) + 'px';
    }
  }

  initializeForm() {
    this.form = this.fb.group({
      id: [this.customerVO.id],
      orgName: [this.customerVO.orgName, [Validators.required]],
      actualDomainName: [this.customerVO.actualDomainName, [Validators.required]],
      timezone: [this.customerVO.timezone, [Validators.required]],
      allowedDomainNames: [],
      subdomainName: [this.customerVO.subdomainName, [Validators.required]],
      defaultLanguge: [this.customerVO.defaultLanguge, [Validators.required]],
      orgPlanType: [this.customerVO.orgPlanType, [Validators.required]],
      orgBillingType: [this.customerVO.orgBillingType],
      userEmailId: [this.customerVO.userEmailId, [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      firstName: [this.customerVO.firstName, [Validators.required]],
      lastName: [this.customerVO.lastName, [Validators.required]],
      themeId: [this.customerVO.themeId],
      contactEmailId: [this.customerVO.contactEmailId, [Validators.required, Validators.email]],
      file: [''],
      addCustomAttribute: [false],
      customAttributeListVo: this.fb.array([]),
      deletedColumnIDList: [],
      organizationUrl: [this.customerVO.organizationUrl, [Validators.required]],
      twoFactor: [this.customerVO.twoFactor],
      backgroundImage: [this.customerVO.backgroundImage],
      dataSourceName: [this.customerVO.dataSourceName, [Validators.required]],
      serverFarm: [this.customerVO.serverFarm, [Validators.required]],
      authenticationMethod: [this.customerVO.authenticationMethod],
      startDate: [this.customerVO.startDate, [Validators.required]],
      endDate: [this.customerVO.endDate, [Validators.required]],
      maximumUsers: [this.customerVO.maximumUsers, [Validators.required]],
      organizationPrefrencesId: [''],
      defaultPageSize: ['5', [Validators.required]],
      pendingTaskColor: ['#D5F1DF', [Validators.required]],
      completedTaskColor: ['#E0DEF2', [Validators.required]],
      errorTaskColor: ['#FBB6BD', [Validators.required]],
      draftTaskColor: ['#ECECCF', [Validators.required]],
      approvedTaskColor: ['#BCFBE0', [Validators.required]],
      rejectTaskColor: ['#E1D2CC', [Validators.required]],
      allowAuthentication: this.fb.array([]),
      deleteKeys: [],
      type: [],
      billingType: ['monthly'],
      planType: [''],
      subscriptionAmount: [],
      customerId: [this.customerVO.id],
      subscriptionId: [''],
      customerPaymentId: [this.customerVO.customerPaymentId],
      enableTwoFactor: [false],
      orgEmailsettingsArray: this.fb.array([
      ]),
      pricingDiscount: this.fb.array([]),
      numberOfUsers: [''],
      quantity: [''],
      isUpgrade: ['']
    });
  }

  getOrganizationInfo() {
    this.service.getOrganizationInfo().subscribe(data => {
      this.customerVO = data;
      this.form.get('customerPaymentId').setValue(this.customerVO.customerPaymentId);
      this.custPaymentId = data.customerPaymentId;
      this.goPayment();
    });
  }

 
  paymentSuccess(event) {
    if (event.isSuccess === true) {
      const subscriptionVO = new SubscriptionVO();
      subscriptionVO.billingType = event.billingType;
      subscriptionVO.planType = event.planType;
      subscriptionVO.customerId = this.customerVO.id;
      subscriptionVO.customerPaymentId = event.customerPaymentId;
      this.form.get('customerPaymentId').setValue(event.customerPaymentId);
      subscriptionVO.subscriptionAmount = event.totalAmount;
      subscriptionVO.subdomainName = this.subdomainName;
      subscriptionVO.planId = event.planId;
      subscriptionVO.quantity = event.quantity;
      subscriptionVO.subscriptionStartDate = event.startDate;
      subscriptionVO.subscriptionEndDate = event.endDate;
      subscriptionVO.isUpgrade = true;
      this.service.updateSubcription(subscriptionVO).subscribe(data => {
        if (data.response && data.response.includes('Successfully')) {
          this.enableDone = true;
          this.readyForPayment = false;
          this.selectSubscription = false;
          this.doneStepper = true;
          this.subscriptionScreenType = 'done';
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['subscription-expire', this.username, this.customerId]);
  }

  previous() {
    this.router.navigate(['subscription-expire', this.username, this.customerId]);
  }

  goBackToLoginPage() {
    this.router.navigate(['/login'])
  }

  goPayment(): void {


    this.form.value.customerPaymentId = this.custPaymentId;
    this.form.value.isUpgrade = true;
    this.form.value.planType = 'BUSINESS PACK';
    this.buttonDisabled = false;
    this.subscriptionScreenType = 'payment';

    this.readyForPayment = true;
    this.enablePayment = true;
    this.stepperIndex = 1;


  }
  
  goToLoginPage() {
    this.router.navigate(['/login']);
  }


}
