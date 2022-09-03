import { Component, OnInit, Inject, ElementRef, ViewChild, Input, HostListener, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, NgForm, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import {
  CustomerVO, CustomMenuList, customMenuVO, discountDetailsVO, EmailSettingsDataVO, EmailSettingsVO, EmailSettingsVOList, OrganizationSMSKeys,
  PricingDiscountVO,
  SMSKeysVO, SubscriptionVO, updateCustomerVO
} from './customer-vo';
import { CreateOrganizationService } from './create-organization.service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Router, ActivatedRoute } from '@angular/router';
import { ThemesVO } from '../shared/vo/themes-vo';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemesService } from '../shared/service/themes.service';
import { LoadLogoService } from '../shared/service/load-logo.service';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { CustomAttributeVO, FieldName, CustomAttributeListVO, AuthenticationArray, AllowAuthentication, PlaceholderForAuth, TwoFactorAuthentication } from '../org-custom-attributes/org-custom-attribute-vo';
import { UserCustomAttributeService } from '../user-custom-attributes/user-custom-attribute.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomMenuService } from './custom-menu.service';
import { MatStepper } from '@angular/material/stepper';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TaskPropertyService } from 'src/app/designer-module/task-property/task-property.service';
import { GroupVO } from 'src/app/designer-module/task-property/model/group-vo';
import { RolesListVO, UserVO } from '../shared/vo/user-vo';
import { RolesService } from '../user-role-association/roles.service';
import { OrganizationService } from '../user-update-organization/organization.service';
import { EmailSettingDialogComponent } from '../email-setting-dialog/email-setting-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmdialogComponent } from 'src/app/shared-module/confirmdialog/confirmdialog.component';
import { UserService } from '../shared/service/user-service';
import { debounceTime } from 'rxjs/operators';
import { PaymentProcessService } from '../payment-process/payment-process.service';
import { PaymentProcessVO } from '../payment-process/payment-process-vo';
import { PaymentHistoryComponent } from '../payment-history/payment-history.component';
import { DatePipe } from '@angular/common';
import { ThemeService } from 'src/app/services/theme.service';
import { UserRoleService } from 'src/app/shared-module/services/user-role.service';
export class PhoneNumber {
  index: number;
  value: string;
}


@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss']
})
export class CreateOrganizationComponent implements OnInit {
  clientId: any=null;

  constructor(private fb: FormBuilder, private service: CreateOrganizationService
    , private themesService: ThemesService, private taskPropertyService: TaskPropertyService
    , private snackBar: MatSnackBar, private router: Router, private activatedRouter: ActivatedRoute,
    public loadLogo: LoadLogoService, private userCustomAttributeService: UserCustomAttributeService
    , private sanitizer: DomSanitizer, private dialog: MatDialog,
    private customMenuService: CustomMenuService, private roleservice: RolesService,
    private orgService: OrganizationService, private userService: UserService,
    private paymentService: PaymentProcessService, private datePipe: DatePipe, public themeService: ThemeService, private roleService: UserRoleService) {
    this.valid = false;
  }
  allowedDomainNamesList: Placeholder[] = [];
  allowedDomainNamesAuthList: PlaceholderForAuth[] = [];
  // allowedGroupTypeAuthList:PlaceholderForAuth[]=[];
  form: FormGroup;
  curnHide: boolean = true;
  newnHide: boolean = true;
  updateForm: FormGroup;
  customerVO = new CustomerVO();
  selectable = true;
  removable = true;
  addOnBlur = true;
  hideNew = true;
  hideConfirm = true;
  valid = false;
  selectedFile: any;
  change:boolean=false;
  themesList = new ThemesVO();
  base64Image: any;
  disabletimeZone = true;
  fileData: File;
  previewUrl: any = null;
  uploadAction = 'upload';
  subdomainName: any;
  isDisable = false;
  loadVariables = true;
  deletedIdList: any[] = [];
  attributesVoList = new CustomAttributeVO();
  pricingVO = new PricingDiscountVO();
  background: any;
  logo = false;
  files: any[] = [];
  isLoad = false;
  previewurl: any;
  logoFiles: any[] = [];
  backgroundImageFiles: any[] = [];
  isLoadLogo: any;
  isBackgroundImage: any;
  isBackgroundLoad = false;
  previewImageUrl: any = null;
  previewBackgroundImageUrl: any = null;
  backgroundFileData: File;
  @Input() customerInfo: any;
  @Input() adminUpdate: any;
  @Input() yoroAdminUpdate: any;
  @Input() isFromSubscription: any;
  subdomain: any;
  menuList: any[] = [];
  customMenuList: CustomMenuList[] = [];
  smsSection: SMSKeysVO[] = [];
  deleteKeys: any[] = [];
  isCustomeMenu = false;
  isUpdateOrg = true;
  isMobileMenuPreference = false;
  isSmsKey = false;
  isCustomAttribute = false;
  isAutoSubscription = false;
  isPaymentSubscription = false;
  isAllowAuthentication = false;
  isTwoFactorAuth = false;
  isEmailSettings = false;
  isSummaryReport = false;
  deletedEmailSettingIdList: any[] = [];
  emailSettingVoList: EmailSettingsVOList;
  twoFactorVo = new TwoFactorAuthentication();
  allowTwoFactorSave = true;
  basic = true;
  standard = false;
  pro = false;
  planType4 = false;
  priceAmount = '';
  planType = '';
  totalPlanTypes: number;
  readyForPayment = false;
  selectSubscription = true;
  doneStepper = false;
  enablePayment = false;
  enableDone = false;
  marginStyle: any;
  show = true;
  showUpdateOrg = false;
  updateCustomerVo = new updateCustomerVO();
  discountVo = new discountDetailsVO();
  custPaymentId: any;
  customMenu = new customMenuVO();
  orgSmsKeys = new OrganizationSMSKeys();
  paymentSubscriptionDetails: any[] = [];
  subscribedPlanType: any;
  billingType: any;
  subsAmount: any;
  disableBackground = true;
  disableLogo = true;
  isSubscribed = false;
  isChangePlan = false;
  subscriptionDetails: any;
  stepperIndex = 0;
  loadSMS: any;
  subDomainName: any;
  groupList: GroupVO[] = [];
  isSubscription = false;
  rolesList: any;
  arrOfStr: any[] = [];
  URL: any[] = [];
  domain: any;
  timezoneList: any;
  timezoneEmit: any;
  selectedTemplateInd: any;
  selectedInd: any;
  active: any;
  showMonth: boolean = false;
  showYear: boolean = false;
  orgValue: any;
  orgValue1: any;
  templateData: any;
  templateData1: any;
  updatetimeZone: any;
  nameArray: FormArray;
  taskboardLabels: any = [];
  isAllowed = false;
  @ViewChild('updateOrg', { static: false }) updateOrg: YorogridComponent;
  @ViewChild('stepper') private myStepper: MatStepper;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  screenHeight: string;
  screenHeight1: string;
  public config: PerfectScrollbarConfigInterface = {};
  monthlyLicence: any;
  yearlyLicence: any;
  selectedIndex: any;
  subscriptionScreenType: string = 'plan';
  @Output() gridData: EventEmitter<any> = new EventEmitter<any>();
  @Output() userData: EventEmitter<any> = new EventEmitter<any>();
  @Output() payData: EventEmitter<any> = new EventEmitter<any>();
  discountDetails: any;
  jsondata: any;
  items: any;
  isLinear = true;
  subAmt: any;
  planid: any;
  apiCalls: boolean = false;
  disablePricing = true;
  count: number;
  totalAmount = 0;
  showAdditionalUsers = false;
  showPayment = false;
  paymentProcessVO = new PaymentProcessVO();
  isUpgrade = false;
  isDowngrade = false;
  showPayHistory = false;
  guestUsersCount: number;
  activeUsersCount: number;
  inActiveUsersCount: number;
  nonGuestUsersCount: number;
  totalLicense: number;
  orgDetailsVo: any[] = [];
  amountDetails: any;
  buttonDisabled: boolean = false;
  selectMonthPlanIndex: any;
  selectYearPlanIndex: any;
  packages: any;
  apiCalled: boolean = false;
  userVo = new UserVO();
  guestLicenseCount: number;
  package = ['STARTER', 'BUSINESS PACK', 'STANDARD', 'PRO'];
  AuthAlign=['Yoroflow sign in','Sign in with Google','Sign in with Microsoft','Sign in with Microsoft Azure']
  isShowSummary: boolean = false;
  isFreePlan: boolean;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadDynamicLayout();
  }

  ngOnInit() {
    this.isFreePlan = JSON.parse(localStorage.getItem('isFreePlan'));
    this.apiCalled = true;
    this.service.getPaymentSubscriptionDetails().subscribe(data => {
      this.orgDetailsVo = data;
      this.setPackageDetails();
    });
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });

    if (this.isFromSubscription) {
      this.isSubscription = true;
      this.initializeForm();
      this.getOrganizationInfo();
      this.showPayment = true;
      this.buttonDisabled = false;
      this.subscriptionScreenType = 'plan';
    } else {
      // this.packages.push({ planName: 'STARTER' }, { planName: 'BUSINESS PACK' }, { planName: 'STANDARD' }, { planName: 'PRO' });
      if (window.location.href.includes('subscription')) {
        this.arrOfStr = window.location.href.split('//', 2);
        this.URL = this.arrOfStr[1].split('.', 2);
        this.domain = this.URL[0];
        this.isSubscription = true;
        this.initializeForm();
        this.getOrganizationInfo();
        this.getGuestUsersCount();
      } else {
        const userRoles = this.roleService.getUserRoles();
        if (userRoles.includes('Account Administrator', 'Account Owner')) {
          this.isShowSummary = true;
        }
        this.loadGroupsList();
        if (this.loadLogo.previewUrl) {
          this.loadLogo.previewUrl = null;
        }
        if (this.adminUpdate) {
          if (!this.yoroAdminUpdate) {
            this.showUpdateOrg = true;
            this.customerVO = this.customerInfo;
            this.templateData1 = this.customerVO.timezone;
          }
          this.adminUpdateOrg();
        } else {
          this.initializeCreateForm();
        }
        this.loadThemesList();
        if (this.customerInfo && !this.adminUpdate) {
          this.form.disable();
          this.form.get('allowedDomainNames').disable();
          this.form.get('allowedDomainNames').updateValueAndValidity();
        }
        this.passwordValidation();
        this.formValueChanges();
      }
    }
    this.roleservice.getRolesList().subscribe(res => {
      this.rolesList = res;
    });
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
  changeSecret(){
    if(this.change === false){
      this.change=true
    }else{
      this.change=false
    }
  }
  closeSecret(){
    this.change=false;
  }
  setPackageDetails() {

    this.items = (this.form.get('pricingDiscount') as FormArray).value;

    for (const item of this.items) {
      const index = this.orgDetailsVo.findIndex(t => t.planName === item.planName);
      if (index !== -1) {
        item.planName = this.orgDetailsVo[index].planName;
        item.basePrice = this.orgDetailsVo[index].basePrice;
        item.amountPerUserMonthly = this.orgDetailsVo[index].monthlyPrice;
        item.amountPerUserYearly = this.orgDetailsVo[index].yearlyPrice;
      }
    }
    (this.form.get('pricingDiscount') as FormArray).setValue(this.items);
  }

  getPackageDetails() {
    this.service.getPlanDetailsByCustomer(this.customerVO).subscribe(data => {
      if (data && data.length > 0) {
        this.items = (this.form.get('pricingDiscount') as FormArray).value;

        for (const item of this.items) {
          const index = data.findIndex(t => t.planName === item.planName);
          if (index !== -1) {
            item.planName = data[index].planName;
            item.basePrice = data[index].basePrice;
            item.amountPerUserMonthly = data[index].monthlyPrice;
            item.amountPerUserYearly = data[index].yearlyPrice;
          }
        }
        (this.form.get('pricingDiscount') as FormArray).setValue(this.items);
      }
    });
  }

  getTeamsCount() {
    this.userService.getTeamsCount().subscribe(data => {
      if (data) {
        this.count = data.count;
      }
    });
  }
  getOrganizationInfo() {
    this.service.getOrganizationInfo().subscribe(data => {
      this.customerVO = data;
      this.form.get('customerPaymentId').setValue(this.customerVO.customerPaymentId);
      this.custPaymentId = data.customerPaymentId;
      this.getPaymentSubscriptionDetails();
      this.getOrgsubscriptionDetails();
      this.autoSubscription();
    });
  }

  getAmountPerUser() {
    this.customerVO.orgPlanType = this.subscriptionDetails.planType;

    this.service.getAmountPerUser(this.customerVO).subscribe(data => {
      this.amountDetails = data;
    });
  }

  getGuestUsersCount() {
    this.service.getGuestUsersCount().subscribe(data => {
      this.activeUsersCount = data.activeUsersCount;
      this.guestUsersCount = data.guestUsersCount;
      this.nonGuestUsersCount = data.nonGuestUsersCount;
      this.totalLicense = this.nonGuestUsersCount + Math.ceil(this.guestUsersCount / 5);
      this.guestLicenseCount = Math.ceil(this.guestUsersCount / 5);
    });
  }

  upgrade() {
    this.router.navigate(['subscription']);
  }
  getOrgPaymentSubscriptionDetails() {
    this.orgService.getPaymentSubscriptionDetails().subscribe(data => {
      this.paymentSubscriptionDetails = [];
      if (data) {
        this.package.forEach(pack => {
          this.paymentSubscriptionDetails.push(data.find(t => t.planName === pack));
        });
      }
    });
  }
  loadGroupsList() {
    this.taskPropertyService.getGroupsList().subscribe(data => {
      this.groupList = data;
    });
  }
  formValueChanges() {
    this.form.get('startDate').valueChanges.subscribe(data => {
      if (this.form.get('startDate').value !== null &&
        this.form.get('startDate').value !== undefined &&
        this.form.get('startDate').value !== '') {
        if (this.form.get('endDate').value !== null &&
          this.form.get('endDate').value !== undefined &&
          this.form.get('endDate').value !== '') {
          if (this.form.get('startDate').value >= this.form.get('endDate').value) {
            this.form.get('endDate').setErrors({ greaterThan: true });
          } else {
            this.form.get('endDate').setErrors(null);
            this.form.get('endDate').setValidators([Validators.required]);
          }
        }
      }
    });
    this.form.get('endDate').valueChanges.subscribe(data => {
      if (this.form.get('endDate').value !== null && this.form.get('endDate').value !== undefined && this.form.get('startDate').value !== '') {
        if (this.form.get('startDate').value !== null && this.form.get('startDate').value !== undefined && this.form.get('startDate').value !== '') {
          if (this.form.get('startDate').value >= this.form.get('endDate').value) {
            this.form.get('endDate').setErrors({ greaterThan: true });
          }
        }
      }
    });
  }

  loadAllowedDomainNames() {
    if (this.customerVO.allowedDomainNames && this.customerVO.allowedDomainNames.length > 0) {
      for (let i = 0; i < this.customerVO.allowedDomainNames.length; i++) {
        if (this.customerVO.allowedDomainNames[i] !== null
          && this.customerVO.allowedDomainNames[i] !== undefined
          && this.customerVO.allowedDomainNames[i] !== '') {
          this.allowedDomainNamesList.push({ name: this.customerVO.allowedDomainNames[i] });
        }
      }
    }
  }

  updateYourOrg() {
    if (this.updateCustomerVo.timezone) {
      this.templateData1 = this.updateCustomerVo.timezone;
    }
    else {
      this.templateData1 = this.customerVO.timezone;
    }
    this.isAllowed = true;
    this.isUpdateOrg = true;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isPaymentSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
  }

  viewPaymentHistory() {
    // const dialog = this.dialog.open(PaymentHistoryComponent, {
    //   width: '800px',
    //   data: { id: this.custPaymentId }
    // });
    this.showPayHistory = true;
  }

  buyAdditionalUser() {
    const dialog = this.dialog.open(ConfirmdialogComponent, {
      width: '600px',
      data: { type: 'pay-user', subscriptionDetails: this.subscriptionDetails, orgDetailsVo: this.amountDetails }
    });
    dialog.afterClosed().subscribe(data => {
      if (data.isConfirm) {
        // this.form.value.discountAmount = 0;
        // this.form.value.customerPaymentId = this.custPaymentId;
        // this.form.value.totalAmountPayable = data.totalAmount;
        // this.form.value.totalSubscriptionAmount = data.totalAmount;
        // this.form.value.discountApplied = 0;
        // this.form.value.quantity = data.totalUsers;

        this.paymentProcessVO.paymentCustomerId = this.custPaymentId;
        this.paymentProcessVO.quantity = data.totalUsers;

        this.paymentService.addUsersPayment(this.paymentProcessVO).subscribe(resp => {
          if (resp.response.includes('processed')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Added users to this current plan successfully',
            });
            this.getOrganizationInfo();
          }
        },
          error => {

            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Payment Failed',
            });
          });

      } else {
        this.subscriptionScreenType = 'paymentDetails';
      }
    });
  }

  prferenceOpen() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isPaymentSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
  }

  switchPlan(planType) {
    this.showPayment = true;
    this.showPayHistory = false;
    this.subscriptionScreenType = 'plan';
    this.form.get('billingType').setValue(planType);
    this.setSubscriptionAmount(planType + this.planType);
  }

  cancel() {
    this.showAdditionalUsers = false;
  }

  mobileMenuPreference() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = true;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isPaymentSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
  }

  smsKeyMenagement() {

    this.form.get('orgName').markAsPristine();
    this.form.get('actualDomainName').markAsPristine();
    this.form.get('defaultLanguge').markAsPristine();
    this.form.get('subdomainName').markAsPristine();
    this.form.get('organizationUrl').markAsPristine();
    this.form.get('allowedDomainNames').markAsPristine();
    this.form.get('startDate').markAsPristine();
    this.form.get('endDate').markAsPristine();
    this.form.get('orgPlanType').markAsPristine();
    this.form.get('orgBillingType').markAsPristine();
    this.form.get('themeId').markAsPristine();
    this.disablePricing = true;
    this.disabletimeZone = true;
    this.disableLogo = true;
    this.disableBackground = true;
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = true;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isPaymentSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
  }
  valuechange(event) {
    this.disablePricing = false;
  }
  valueYearly(event) {
    this.disablePricing = false;

  }

  goBack() {
    if (this.subscriptionScreenType === 'payment') {
      this.subscriptionScreenType = 'plan';
    } else if (this.subscriptionScreenType === 'plan' || this.subscriptionScreenType === 'done') {
      this.showPayHistory = false;
      this.showPayment = false;
      this.getOrganizationInfo();
    }

  }

  customAttributeList() {
    this.form.get('orgName').markAsPristine();
    this.form.get('actualDomainName').markAsPristine();
    this.form.get('defaultLanguge').markAsPristine();
    this.form.get('subdomainName').markAsPristine();
    this.form.get('organizationUrl').markAsPristine();
    this.form.get('allowedDomainNames').markAsPristine();
    this.form.get('startDate').markAsPristine();
    this.form.get('endDate').markAsPristine();
    this.form.get('orgPlanType').markAsPristine();
    this.form.get('orgBillingType').markAsPristine();
    this.form.get('themeId').markAsPristine();
    this.disablePricing = true;
    this.disabletimeZone = true;
    this.disableLogo = true;
    this.disableBackground = true;
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = true;
    this.isAutoSubscription = false;
    this.isPaymentSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
  }

  autoSubscription() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = true;
    this.isPaymentSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.setSubscriptionValues(this.subscriptionDetails);
  }

  paymentSubscription() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isPaymentSubscription = true;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
  }

  allowAuthentication() {

    this.service.isAllowed().subscribe(data => {
      if (data.response.includes("You don't have sufficient")) {
        this.isAllowed = false;
      } else {
        this.isAllowed = true;
      }
    });
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isPaymentSubscription = false;
    this.isAllowAuthentication = true;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
    this.form.get('orgName').markAsPristine();
    this.form.get('actualDomainName').markAsPristine();
    this.form.get('defaultLanguge').markAsPristine();
    this.form.get('subdomainName').markAsPristine();
    this.form.get('organizationUrl').markAsPristine();
    this.form.get('allowedDomainNames').markAsPristine();
    this.form.get('startDate').markAsPristine();
    this.form.get('endDate').markAsPristine();
    this.form.get('orgPlanType').markAsPristine();
    this.form.get('orgBillingType').markAsPristine();
    this.form.get('themeId').markAsPristine();
    this.disablePricing = true;
    this.disabletimeZone = true;
    this.disableLogo = true;
    this.disableBackground = true;
  }

  allowTwoFactorAuthetication() {

    this.service.isAllowed().subscribe(data => {
      if (data.response.includes("You don't have sufficient")) {
        this.isAllowed = false
      } else {
        this.isAllowed = true;
      }
    });
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isPaymentSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = true;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
    this.form.get('orgName').markAsPristine();
    this.form.get('actualDomainName').markAsPristine();
    this.form.get('defaultLanguge').markAsPristine();
    this.form.get('subdomainName').markAsPristine();
    this.form.get('organizationUrl').markAsPristine();
    this.form.get('allowedDomainNames').markAsPristine();
    this.form.get('startDate').markAsPristine();
    this.form.get('endDate').markAsPristine();
    this.form.get('orgPlanType').markAsPristine();
    this.form.get('orgBillingType').markAsPristine();
    this.form.get('themeId').markAsPristine();
    this.disablePricing = true;
    this.disabletimeZone = true;
    this.disableLogo = true;
    this.disableBackground = true;
  }

  emailSetting() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isPaymentSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = true;
    this.isSummaryReport = false;
    this.form.get('orgName').markAsPristine();
    this.form.get('themeId').markAsPristine();
    this.form.get('actualDomainName').markAsPristine();
    this.form.get('defaultLanguge').markAsPristine();
    this.form.get('subdomainName').markAsPristine();
    this.form.get('organizationUrl').markAsPristine();
    this.form.get('allowedDomainNames').markAsPristine();
    this.form.get('startDate').markAsPristine();
    this.form.get('endDate').markAsPristine();
    this.form.get('orgPlanType').markAsPristine();
    this.form.get('orgBillingType').markAsPristine();
    this.disablePricing = true;
    this.disabletimeZone = true;
    this.disableLogo = true;
    this.disableBackground = true;
  }

  summaryReport(): void {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isPaymentSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = true;
    this.form.get('orgName').markAsPristine();
    this.form.get('themeId').markAsPristine();
    this.form.get('actualDomainName').markAsPristine();
    this.form.get('defaultLanguge').markAsPristine();
    this.form.get('subdomainName').markAsPristine();
    this.form.get('organizationUrl').markAsPristine();
    this.form.get('allowedDomainNames').markAsPristine();
    this.form.get('startDate').markAsPristine();
    this.form.get('endDate').markAsPristine();
    this.form.get('orgPlanType').markAsPristine();
    this.form.get('orgBillingType').markAsPristine();
    this.disablePricing = true;
    this.disabletimeZone = true;
    this.disableLogo = true;
    this.disableBackground = true;
  }

  enablePlanTypeButton(planType) {
    if (planType === 'Basic') {
      this.basic = true;
      this.standard = false;
      this.pro = false;
    } else if (planType === 'Standard') {
      this.basic = false;
      this.standard = true;
      this.pro = false;
    } else if (planType === 'Pro') {
      this.basic = false;
      this.standard = false;
      this.pro = true;
    }
  }

  planTypeChange(event, planType) {
    if (event) {
      if (event === 'monthlyPlanType1') {
        this.basic = true;
        this.standard = false;
        this.pro = false;
        this.planType4 = false;
        this.planType = 'PlanType1';
      }
      if (event === 'monthlyPlanType2') {
        this.basic = false;
        this.standard = true;
        this.pro = false;
        this.planType4 = false;
        this.planType = 'PlanType2';
      }
      if (event === 'monthlyPlanType3') {
        this.basic = false;
        this.standard = false;
        this.pro = true;
        this.planType4 = false;
        this.planType = 'PlanType3';
      }
      if (event === 'monthlyPlanType4') {
        this.basic = false;
        this.standard = false;
        this.pro = false;
        this.planType4 = true;
        this.planType = 'PlanType4';
      }
      if (event === 'yearlyPlanType1') {
        this.basic = true;
        this.standard = false;
        this.pro = false;
        this.planType4 = false;
        this.planType = 'PlanType1';
      }
      if (event === 'yearlyPlanType2') {
        this.basic = false;
        this.standard = true;
        this.pro = false;
        this.planType4 = false;
        this.planType = 'PlanType2';
      }
      if (event === 'yearlyPlanType3') {
        this.basic = false;
        this.standard = false;
        this.pro = true;
        this.planType4 = false;
        this.planType = 'PlanType3';
      }
      if (event === 'yearlyPlanType4') {
        this.basic = false;
        this.standard = false;
        this.pro = false;
        this.planType4 = true;
        this.planType = 'PlanType4';
      }
      this.form.get('planType').setValue(planType);
      this.setSubscriptionAmount(event);
    }
  }

  billingTypeChange(event) {
    if (event.value === 'monthly') {
      this.selectedTemplateInd = '';
    }
    else {
      this.selectedInd = '';
    }

    if (event.value) {
      this.setSubscriptionAmount(event.value + this.planType);
    }
  }

  setSubscriptionAmount(planType) {

    this.paymentSubscriptionDetails.forEach(details => {
      if (details && details.itemDescription === 'Price') {
        if (planType === 'yearlyPlanType1') {
          this.form.get('subscriptionAmount').setValue(details.yearlyPlanType1);
        } else if (planType === 'yearlyPlanType2') {
          this.form.get('subscriptionAmount').setValue(details.yearlyPlanType2);
        } else if (planType === 'yearlyPlanType3') {
          this.form.get('subscriptionAmount').setValue(details.yearlyPlanType3);
        } else if (planType === 'yearlyPlanType4') {
          this.form.get('subscriptionAmount').setValue(details.yearlyPlanType4);
        } else if (planType === 'monthlyPlanType1') {
          this.form.get('subscriptionAmount').setValue(details.monthlyPlanType1);
        } else if (planType === 'monthlyPlanType2') {
          this.form.get('subscriptionAmount').setValue(details.monthlyPlanType2);
        } else if (planType === 'monthlyPlanType3') {
          this.form.get('subscriptionAmount').setValue(details.monthlyPlanType3);
        } else if (planType === 'monthlyPlanType4') {
          this.form.get('subscriptionAmount').setValue(details.monthlyPlanType4);
        }
      }
    });

  }

  setSubscriptionValues(data) {
    if (data) {
      this.form.get('billingType').setValue(data.billingType);
      this.form.get('planType').setValue(data.planType);
      this.enablePlanTypeButton(data.planType);
      this.form.get('subscriptionAmount').setValue(data.subscriptionAmount);
      this.form.get('customerId').setValue(data.customerId);
      this.form.get('subscriptionId').setValue(data.subscriptionId);
      this.form.get('quantity').setValue(data.quantity);
      this.getPlanTypeAndBillingType(data);
    }
  }

  getOrgsubscriptionDetails() {
    this.service.getOrgSubscription().subscribe(data => {
      if (data && data !== null && data.customerId !== null) {
        this.subscriptionDetails = data;
        this.subscriptionScreenType = 'paymentDetails';
        this.setSubscriptionValues(this.subscriptionDetails);
        this.getAmountPerUser();
      }
    });
  }

  getPlanTypeAndBillingType(data) {
    this.isSubscribed = true;
    this.subscribedPlanType = data.planType;
    this.billingType = data.billingType;
    this.subsAmount = data.subscriptionAmount;
  }
  changePlan() {
    this.isChangePlan = true;
  }

  cancelUpdate() {
    this.isChangePlan = false;
    this.setSubscriptionValues(this.subscriptionDetails);
  }

  getPaymentSubscriptionDetails() {
    this.service.getPackageDetails().subscribe(data => {
      this.paymentSubscriptionDetails = [];
      if (data) {
        this.package.forEach(pack => {
          this.paymentSubscriptionDetails.push(data.find(t => t.planName === pack));
        });
      }
    });
  }
  previous(): void {
    if (this.showPayment === true) {
      this.subscriptionScreenType = 'plan';
      this.buttonDisabled = false;
      this.selectYearPlanIndex = '';
      this.selectMonthPlanIndex = '';
    } else {
      this.showPayHistory = false;
      this.subscriptionScreenType = 'paymentDetails';
      this.buttonDisabled = false;
      this.selectYearPlanIndex = '';
      this.selectMonthPlanIndex = '';
    }

  }
  goPayment(plan: any, i: number): void {
    this.planid = plan.planId;
    if (this.form.get('billingType').value === 'monthly') {
      this.selectMonthPlanIndex = i;
    } else {
      this.selectYearPlanIndex = i;
    }
    this.form.get('planType').setValue(plan.planName);

    this.subscriptionDetails.isUpgrade = this.isUpgradePlan(plan);


    if (this.subscriptionDetails.isUpgrade) {
      this.buttonDisabled = true;
      if (plan.planName === 'STARTER') {
        this.buttonDisabled = true;
        const subscriptionVO = new SubscriptionVO();
        subscriptionVO.billingType = this.form.get('billingType').value;
        subscriptionVO.planType = this.form.get('planType').value;
        subscriptionVO.customerId = this.customerVO.id;
        subscriptionVO.customerPaymentId = this.form.get('customerPaymentId').value;
        subscriptionVO.subscriptionAmount = 0;
        subscriptionVO.subscriptionId = this.form.get('subscriptionId').value;
        subscriptionVO.subdomainName = this.subdomainName;
        subscriptionVO.planId = this.planid;
        subscriptionVO.isUpgrade = this.subscriptionDetails.isUpgrade;
        this.service.updateSubcription(subscriptionVO).subscribe(updateSub => {
          if (updateSub.response.includes('Successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Your plan will updated from this date(' + this.datePipe.transform(this.subscriptionDetails.subscriptionEndDate, 'MMMM d, y') + ')',
            });
            this.showPayHistory = false;
            this.showPayment = false;
            this.getOrganizationInfo();
          }
        });
      } else {
        if (this.form.get('billingType').value === 'monthly') {
          this.subAmt = plan.monthlyPrice;
        }
        else {
          this.subAmt = plan.yearlyPrice;
        }
        const discountVO = new discountDetailsVO();
        discountVO.billingType = this.form.get('billingType').value;
        discountVO.customerId = this.customerVO.id;
        discountVO.planId = plan.planId;
        discountVO.subscriptionAmount = this.subAmt;
        this.service.discountDetails(discountVO).subscribe(res => {
          if (res) {
            this.discountDetails = res;
            this.form.value.discountAmount = this.discountDetails.subscriptionAmount;
            this.form.value.customerPaymentId = this.custPaymentId;
            this.form.value.totalAmountPayable = this.discountDetails.subscriptionAmount;
            this.form.value.totalSubscriptionAmount = this.discountDetails.subscriptionTotalAmount;
            this.form.value.discountApplied = this.discountDetails.subscriptionDiscountAmount;
            this.form.value.isUpgrade = this.subscriptionDetails.isUpgrade;
            this.buttonDisabled = false;

            this.subscriptionScreenType = 'payment';
          }
        });
        this.readyForPayment = true;
        this.enablePayment = true;
        this.stepperIndex = 1;
      }
    } else {
      const discountVO = new discountDetailsVO();
      discountVO.billingType = this.form.get('billingType').value;
      discountVO.customerId = this.customerVO.id;
      discountVO.planId = plan.planId;
      discountVO.subscriptionAmount = this.form.get('billingType').value === 'monthly'
        ? plan.monthlyPrice : plan.yearlyPrice;
      this.service.discountDetails(discountVO).subscribe(res => {
        if (res) {
          this.discountDetails = res;
          this.form.value.discountAmount = this.discountDetails.subscriptionAmount;
          this.form.value.customerPaymentId = this.custPaymentId;
          this.form.value.totalAmountPayable = this.discountDetails.subscriptionAmount;
          this.form.value.totalSubscriptionAmount = this.discountDetails.subscriptionTotalAmount;
          this.form.value.discountApplied = this.discountDetails.subscriptionDiscountAmount;
          this.form.value.isUpgrade = this.subscriptionDetails.isUpgrade;
          const dialog = this.dialog.open(ConfirmdialogComponent, {
            width: '500px',
            data: {
              type: 'downgrade-plan', date: this.subscriptionDetails.subscriptionEndDate,
              planType: this.subscriptionDetails.planType
            }
          });



          dialog.afterClosed().subscribe(data => {
            if (data) {
              if (plan.planName === 'STARTER') {
                this.buttonDisabled = true;
                const subscriptionVO = new SubscriptionVO();
                subscriptionVO.billingType = this.form.get('billingType').value;
                subscriptionVO.planType = this.form.get('planType').value;
                subscriptionVO.customerId = this.customerVO.id;
                subscriptionVO.customerPaymentId = this.form.get('customerPaymentId').value;
                subscriptionVO.subscriptionAmount = 0;
                subscriptionVO.subscriptionId = this.form.get('subscriptionId').value;
                subscriptionVO.subdomainName = this.subdomainName;
                subscriptionVO.planId = this.planid;
                subscriptionVO.isUpgrade = this.subscriptionDetails.isUpgrade;
                this.service.updateSubcription(subscriptionVO).subscribe(updateSub => {
                  if (updateSub.response.includes('Successfully')) {
                    this.snackBar.openFromComponent(SnackbarComponent, {
                      data: 'Your plan will updated from this date(' + this.datePipe.transform(this.subscriptionDetails.subscriptionEndDate, 'MMMM d, y') + ')',
                    });
                    this.showPayHistory = false;
                    this.showPayment = false;
                    this.getOrganizationInfo();
                  }
                });
              } else {
                const vo = {
                  planType: plan.planName, paymentCustomerId: this.custPaymentId,
                  billingType: this.form.get('billingType').value,
                  email: null, discountAmount: this.form.value.discountApplied,
                  paymentAmount: this.form.value.discountAmount
                };
                this.service.downgradePlan(vo).subscribe(resp => {
                  if (resp.response.includes('processed')) {
                    const subscriptionVO = new SubscriptionVO();
                    subscriptionVO.billingType = this.form.get('billingType').value;
                    subscriptionVO.planType = this.form.get('planType').value;
                    subscriptionVO.customerId = this.customerVO.id;
                    subscriptionVO.customerPaymentId = this.form.get('customerPaymentId').value;
                    subscriptionVO.subscriptionAmount = this.form.value.discountAmount;
                    subscriptionVO.subscriptionId = this.form.get('subscriptionId').value;
                    subscriptionVO.subdomainName = this.subdomainName;
                    subscriptionVO.planId = this.planid;
                    subscriptionVO.isUpgrade = false;
                    subscriptionVO.subscriptionStartDate = resp.startDate;
                    subscriptionVO.subscriptionEndDate = resp.endDate;
                    this.service.updateSubcription(subscriptionVO).subscribe(updateOrg => {
                      if (updateOrg.response.includes('Successfully')) {
                        this.snackBar.openFromComponent(SnackbarComponent, {
                          data: 'Your plan will updated from this date(' +
                            this.datePipe.transform(this.subscriptionDetails.subscriptionEndDate, 'MMMM d, y') + ')',
                        });
                        this.showPayHistory = false;
                        this.showPayment = false;
                        this.getOrganizationInfo();
                      }
                    });
                  }
                });
              }
            } else {
              if (this.form.get('billingType').value === 'monthly') {
                this.selectMonthPlanIndex = '';
              } else {
                this.selectYearPlanIndex = '';
              }
            }
          });
        }
      });


    }
  }

  isUpgradePlan(plan): boolean {
    if (this.subscriptionDetails.planType === plan.planName) {
      return true;
    } else if (this.subscriptionDetails.billingType === 'monthly' && this.form.get('billingType').value === 'yearly') {
      return true;
    } else if (this.subscriptionDetails.billingType === 'yearly' && this.form.get('billingType').value === 'monthly') {
      return false;
    } else if (this.subscriptionDetails.billingType === this.form.get('billingType').value) {
      if (this.subscriptionDetails.planType === 'STARTER') {
        if (plan.planName === 'PRO' || plan.planName === 'STANDARD'
          || plan.planName === 'BUSINESS PACK') {
          return true;
        }
      } else if (this.subscriptionDetails.planType === 'BUSINESS PACK') {
        if (plan.planName === 'PRO' || plan.planName === 'STANDARD') {
          return true;
        } else if (plan.planName === 'STARTER') {
          return false;
        }
      } else if (this.subscriptionDetails.planType === 'STANDARD') {
        if (plan.planName === 'PRO') {
          return true;
        } else if (plan.planName === 'STARTER' || plan.planName === 'BUSINESS PACK') {
          return false;
        }
      } else if (this.subscriptionDetails.planType === 'PRO') {
        if (plan.planName === 'PRO') {
          return true;
        } else if (plan.planName === 'STARTER' || plan.planName === 'BUSINESS PACK' || plan.planName === 'STANDARD') {
          return false;
        }
      }
    }
  }

  selectionChangeStepper(event) {
    if (event.selectedStep.label === 'plan') {
      this.readyForPayment = false;
      this.goSubscription();
    }
    if (event.selectedStep.label === 'payment') {
    }
    if (event.selectedStep.label === 'done') {
      this.stepperIndex = event.previouslySelectedIndex;
      this.myStepper.selectedIndex = event.previouslySelectedIndex;
    }
  }
  goSubscription() {
    this.stepperIndex = 0;
    this.selectSubscription = true;
    this.readyForPayment = false;
  }
  adminUpdateOrg() {
    if (this.adminUpdate) {
      this.initializeForm();
    } else {
      this.initializeCreateForm();
    }
    this.subDomainName = this.customerInfo.subdomainName;
    if (!this.yoroAdminUpdate) {
      this.getCustomMenuList();

      this.loadSMSFormGroup(this.customerVO.subdomainName);
      this.loadAuthFormGroup(this.customerVO.subdomainName, true);
      this.userCustomAttributeService.getOrgCustomattributesDetailsForOrganization(this.customerVO.subdomainName).subscribe(data => {
        this.attributesVoList.customAttributeListVo = data;
        if (this.attributesVoList.customAttributeListVo.length > 0) {
          this.form.get('addCustomAttribute').setValue(true);
        }
        this.loadVariableForm(this.attributesVoList.customAttributeListVo, false);
      });

      this.service.getUpdateOrgTwoFactor(this.customerVO.subdomainName).subscribe(data => {
        if (data) {
          this.twoFactorVo = data;
          this.form.get('enableTwoFactor').setValue(data.enableTwoFactor);
        }
      });
      this.getOrganizationEmailSettings(this.customerVO.subdomainName, false);
    } else if (this.yoroAdminUpdate) {
      if (this.apiCalls === true) {
        this.service.getUpdateOrgCustomMenu(this.customerVO.subdomainName).subscribe(data => {
          if (data.length > 0) {
            this.customMenuList = data;
            this.loadCustomMenu();
          } else {
            this.loadCustomMenu();
          }
        });
      }
      if (this.apiCalls === true) {

        this.getCustomAttributes(this.customerVO.subdomainName, false);
        this.loadUpdateOrgSMSFormGroup(this.customerVO.subdomainName);
        this.loadAuthFormGroup(this.customerVO.subdomainName, false);
        this.getOrganizationTwoFactor(this.customerVO.subdomainName);
        this.getOrganizationEmailSettings(this.customerVO.subdomainName, false);
      }

    }
    this.getPaymentSubscriptionDetails();

    this.getOrgsubscriptionDetails();

    this.loadAllowedDomainNames();
    this.logo = true;
    this.isBackgroundLoad = true;
    this.loadLogo.previewUrl = this.customerVO.image;
    this.previewBackgroundImageUrl = this.customerVO.backgroundImage;
  }

  getCustomerInfo() {
    if (this.customerInfo) {
      this.customerVO = this.customerInfo;
      this.subdomainName = this.customerVO.subdomainName;
      this.initializeForm();
      if (this.customerVO.allowedDomainNames) {
        this.allowedDomainNamesList = this.getPlaceholderFromStringArray(this.customerVO.allowedDomainNames);
      }
      if (this.customerVO.image) {
        this.loadLogo.previewUrl = this.customerVO.image;
        this.previewImageUrl = this.loadLogo.previewUrl;
      }
    }
  }
  getPlaceholderFromStringArray(values: string[]): Placeholder[] {
    const output = [];
    if (values && values.length > 0 && values[0] !== '') {
      values.forEach(token => output.push({ name: token }));
    }
    if (output !== []) {
      return output;
    }
  }

  upgradePlan() {
    this.showPayment = true;
    this.buttonDisabled = false;
    this.subscriptionScreenType = 'plan';
    this.selectYearPlanIndex = '';
    this.selectMonthPlanIndex = '';
  }

  paymentSuccess(event) {
    if (event.isSuccess === true) {
      const subscriptionVO = new SubscriptionVO();
      subscriptionVO.billingType = this.form.get('billingType').value;
      subscriptionVO.planType = this.form.get('planType').value;
      subscriptionVO.customerId = this.customerVO.id;
      subscriptionVO.customerPaymentId = event.customerPaymentId;
      this.form.get('customerPaymentId').setValue(event.customerPaymentId);
      subscriptionVO.subscriptionAmount = this.subAmt;
      subscriptionVO.subscriptionId = this.form.get('subscriptionId').value;
      subscriptionVO.subdomainName = this.subdomainName;
      subscriptionVO.planId = this.planid;
      subscriptionVO.quantity = this.form.get('quantity').value;
      subscriptionVO.subscriptionStartDate = event.startDate;
      subscriptionVO.subscriptionEndDate = event.endDate;
      subscriptionVO.isUpgrade = this.subscriptionDetails.isUpgrade;
      if (this.showPayment) {
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
  }




  getPaymentCardDetails() {
    this.service.getPaymentDetails(this.custPaymentId).subscribe(data => {
      this.paymentProcessVO = data;
      this.paymentProcessVO.paymentCustomerId = this.custPaymentId;
      this.subscriptionScreenType = 'payment';
    });
  }


  initializeCreateForm() {
    this.form = this.fb.group({
      id: [this.customerVO.id],
      orgName: [this.customerVO.orgName, [Validators.required]],
      actualDomainName: [this.customerVO.actualDomainName],
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
      organizationUrl: [this.customerVO.organizationUrl],
      twoFactor: [this.customerVO.twoFactor],
      backgroundImage: [this.customerVO.backgroundImage],
      dataSourceName: [this.customerVO.dataSourceName, [Validators.required]],
      serverFarm: [this.customerVO.serverFarm, [Validators.required]],
      authenticationMethod: [this.customerVO.authenticationMethod],
      startDate: [this.customerVO.startDate, [Validators.required]],
      endDate: [this.customerVO.endDate, [Validators.required]],
      maximumUsers: [this.customerVO.maximumUsers, [Validators.required]],
      pricingDiscount: this.fb.array([])
    });
    this.createItems();
  }

  createItems() {
    this.items = this.form.get('pricingDiscount') as FormArray;
    for (let i = 0; i < 3; i++) {
      let planName = null;
      if (i === 0) {
        planName = 'BUSINESS PACK';
      } else if (i === 1) {
        planName = 'STANDARD';
      } else if (i === 2) {
        planName = 'PRO';
      }
      const ctrl = this.fb.group({
        discountId: [''],
        customerId: [''],
        basePrice: [''],
        amountPerUserMonthly: [''],
        amountPerUserYearly: [''],
        planId: [''],
        planName: [planName]
      });
      this.items.push(ctrl);
    }
    // this.service.getPaymentSubscriptionDetails().subscribe(data => {
    //   this.jsondata = data;
    //   if (this.jsondata) {

    //     for (let i = 0; i < this.jsondata.length; i++) {
    //       if (this.jsondata[i].planName === 'STARTER') {
    //         this.jsondata.splice(i, 1);
    //       }
    //     }

    //     this.jsondata.forEach((elem: any) => {
    //       const ctrl = this.fb.group({
    //         discountId: [elem.discountId],
    //         customerId: [elem.customerId],
    //         monthlyPrice: [elem.monthlyPrice],
    //         yearlyPrice: [elem.yearlyPrice],
    //         planId: [elem.planId],
    //         planName: [elem.planName]
    //       });
    //       this.items.push(ctrl);
    //     });
    //   }
    // });
  }

  initializeForm() {
    this.form = this.fb.group({
      id: [this.customerVO.id],
      orgName: [this.customerVO.orgName, [Validators.required]],
      actualDomainName: [this.customerVO.actualDomainName],
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
      organizationUrl: [this.customerVO.organizationUrl],
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
      customMenuList: this.fb.array([
        this.customMenuFormGroup()
      ]),
      organizationSmsKeys: this.fb.array([
        this.organizationSmsFormGroup()
      ]),
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
    this.createItems();
    this.getPackageDetails();
    this.addAuth('Yoroflow sign in');
    this.addAuth('Sign in with Google');
    this.addAuth('Sign in with Microsoft');
    this.addAuth('Sign in with Microsoft Azure');
    // this.loadYoroflowAuth();
    const group = ((this.form.get('organizationSmsKeys') as FormArray).get('' + 0) as FormGroup);
    group.get('secretKey').disable();
    group.get('secretToken').disable();
    group.get('fromPhoneNumber').disable();
    group.get('serviceName').disable();
    group.get('smsFrom').disable();

  }

  setPricingDiscount() {
    this.items = this.form.get('pricingDiscount') as FormArray;
    if (this.jsondata && this.jsondata.length > 0) {
      this.jsondata.forEach((elem: any) => {
        const ctrl = this.fb.group({
          discountId: [elem.discountId],
          customerId: [elem.customerId],
          monthlyPrice: [elem.monthlyPrice],
          yearlyPrice: [elem.yearlyPrice],
          planId: [elem.planId],
          planName: [elem.planName]
        });
        this.items.push(ctrl);
      });
    }
  }
  organizationSmsFormGroup(): FormGroup {

    return this.fb.group({
      id: [''],
      providerName: [''],
      secretKey: [''],
      secretToken: [''],
      fromPhoneNumber: [''],
      serviceName: [''],
      smsFrom: [''],

    });
  }




  organizationEmailFormGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      settingName: [{ value: '', disabled: true }, Validators.required],
      settingData: this.fb.group({
        hostName: [{ value: '', disabled: true }, Validators.required],
        username: [{ value: '', disabled: true }, Validators.required],
        password: [{ value: '', disabled: true }, Validators.required],
        port: [{ value: '', disabled: true }, Validators.required],
        smtpAuth: [{ value: false, disabled: true }],
        starttlsEnable: [{ value: false, disabled: true }],
      }),
    });
  }

  getEmailSettingsFormArray() {
    return (this.form.get('orgEmailsettingsArray') as FormArray);
  }

  addEmailSetting() {
    this.getEmailSettingsFormArray().push(this.organizationEmailFormGroup());
  }

  removeEmailSetting(i) {
    this.deletedEmailSettingIdList = [];
    const dialog = this.dialog.open(EmailSettingDialogComponent, {
      width: '400px',
      data: { type: 'delete' }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        const deleteId = (this.getEmailSettingsFormArray().get('' + i) as FormGroup).get('id').value;
        if (deleteId !== null && deleteId !== '') {
          this.deletedEmailSettingIdList.push(deleteId);
          this.form.markAsDirty();
        }
        this.getEmailSettingsFormArray().removeAt(i);
        let emailSettingsVo = new EmailSettingsVOList();
        emailSettingsVo.orgEmailsettingsArray = [];
        emailSettingsVo.deletedEmailSettingIdList = this.deletedEmailSettingIdList;
        emailSettingsVo.subdomainName = this.subdomainName;
        this.saveEmailSettings(emailSettingsVo);
      }
    });
  }

  getOrganizationEmailSettings(subdomainName, isLoad) {
    this.service.getOrganizationEmailSettings(subdomainName).subscribe(data => {
      if (data) {
        this.emailSettingVoList = data;
        this.loadSettingDataForm(data.orgEmailsettingsArray, isLoad);
      }
    });
  }

  loadSettingDataForm(list: EmailSettingsVO[], isLoad) {
    if (list) {
      for (let i = 0; i < list.length; i++) {
        if (!isLoad) {
          this.addEmailSetting();
        }
        (this.getEmailSettingsFormArray().get('' + i) as FormGroup).patchValue(list[i]);
      }
    }
  }
  editEmailSetting(i) {
    let emailSettingsVo = new EmailSettingsVOList();
    emailSettingsVo.orgEmailsettingsArray.push(this.emailSettingVoList.orgEmailsettingsArray[i]);
    emailSettingsVo.deletedEmailSettingIdList = [];
    emailSettingsVo.subdomainName = this.subdomainName;
    const dialog = this.dialog.open(EmailSettingDialogComponent, {
      width: '800px',
      data: { type: 'edit', emailSettingsVo }
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === true) {
        this.getOrganizationEmailSettings(this.customerVO.subdomainName, true);
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Email Settings updated sucessfully',
        });
      }
    });
  }
  addEmailSettings() {
    let settingNameList = [];
    for (let j = 0; j < this.getEmailSettingsFormArray().length; j++) {
      settingNameList.push(this.getEmailSettingsFormArray().get('' + j).get('settingName').value);
    }
    const dialog = this.dialog.open(EmailSettingDialogComponent, {
      width: '800px',
      data: { type: 'create', subdomainName: this.subdomainName, settingNameList }
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === true) {
        this.addEmailSetting();
        this.getOrganizationEmailSettings(this.customerVO.subdomainName, true);
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Email Settings created sucessfully',
        });
      }
    });
  }
  saveEmailSettings(emailSettingsVo: EmailSettingsVOList) {
    this.service.updateOrganizationEmailSettings(emailSettingsVo).subscribe(data => {
      if (data) {
        this.deletedEmailSettingIdList = [];
        this.getOrganizationEmailSettings(this.customerVO.subdomainName, true);
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Email Settings deleted sucessfully',
        });
      }
    });
  }
  organizationAuthFormGroup(providerName): FormGroup {
    return this.fb.group({
      id: [''],
      authProvider: [providerName],
      isAuthProvider: [false],
      selectDomainType: ['all'],
      allowedDomain: [],
      associateGroups: [Validators.required],
      associateRoles: [],
      clientId: [],
      secretId: [],
      tenantId: [],
      allowedGroupType: ['all'],
      allowedGroup: [],
    });
  }
  addAuth(providerName) {
    this.getAuthenticationFormArray().push(this.organizationAuthFormGroup(providerName));
  }
  loadYoroflowAuth() {
    for (let i = 0; i < this.getAuthenticationFormArray().length; i++) {
      const group = (this.getAuthenticationFormArray().get('' + i) as FormGroup);
      if (group.get('authProvider').value === 'Yoroflow sign in') {
        group.get('isAuthProvider').setValue(true);
        group.get('isAuthProvider').disable();
      }
    }
  }
  authProviderChange(event, i, authProvider) {
    const group = (this.getAuthenticationFormArray().get('' + i) as FormGroup);
    if (event.checked) {
      group.get('isAuthProvider').setValue(true);
      if (authProvider === 'Sign in with Microsoft' || authProvider === 'Sign in with Microsoft Azure') {
        this.setMicrosoftAzure(authProvider === 'Sign in with Microsoft Azure' ? 
        'Sign in with Microsoft' : 'Sign in with Microsoft Azure');
      }
    } else {
      group.get('isAuthProvider').setValue(false);
    }
  }

  setMicrosoftAzure(authProvider) {
    for (let i = 0; i < this.getAuthenticationFormArray().length; i++) {
      const group = (this.getAuthenticationFormArray().get('' + i) as FormGroup);
      if (group.get('authProvider').value === authProvider) {
        group.get('isAuthProvider').setValue(false, { emitEvent: false });
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

  getSMSSectionFormArray() {
    return (this.form.get('organizationSmsKeys') as FormArray).controls;
  }

  getAuthenticationFormArray() {
    return (this.form.get('allowAuthentication') as FormArray);
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
    this.deleteKeys.push(deleteId);
    (this.form.get('organizationSmsKeys') as FormArray).removeAt(i);
    this.providerNameExsitCheck();
  }

  loadAuthFormGroup(subDomain, isorg) {
    this.subdomainName = subDomain;
    if (isorg) {
      this.service.getAuthenticationDetailsOrg(subDomain).subscribe(data => {
        if (data && data !== null) {
          this.loadAuthFormGroupValues(data);
        }
      });
    } else {
      this.service.getAuthenticationDetails(subDomain).subscribe(data => {
        if (data && data !== null) {
          this.loadAuthFormGroupValues(data);
        }
      });
    }
  }

  loadAuthFormGroupValues(data) {
    const arrayFields: AuthenticationArray[] = [];
this.AuthAlign.forEach(pack => {

  arrayFields.push(data.authenticationArray.find(t => t.authProvider === pack));
 });


    for (let i = 0; i < arrayFields.length; i++) {
      const index = '' + i;
      const authFormArray = (this.getAuthenticationFormArray().get(index) as FormGroup);
      authFormArray.patchValue(arrayFields[i]);
      if ((authFormArray.get('authProvider').value === 'Sign in with Microsoft Azure')) {
       this.clientId = authFormArray.get('clientId').value;
       if (authFormArray.get('allowedGroup').value !== null &&
       authFormArray.get('allowedGroup').value !== null) {
        const domainArray: any[] = authFormArray.get('allowedGroup').value;
        this.loadAllowedDomainNamesForAuth(domainArray, i);
        authFormArray.get('allowedGroup').setValue([]);
        authFormArray.get('allowedGroup').setValidators(null);
        authFormArray.get('allowedGroup').updateValueAndValidity();
      }
      }

      if ((authFormArray.get('authProvider').value === 'Yoroflow sign in')) {
        authFormArray.get('isAuthProvider').setValue(true);
      }
      authFormArray.get('allowedDomain').setValidators(null);
      authFormArray.get('allowedDomain').updateValueAndValidity();
      if (authFormArray.get('allowedDomain').value !== null &&
       authFormArray.get('allowedDomain').value !== null && authFormArray.get('authProvider').value !== 'Sign in with Microsoft Azure') {
        const domainArray: any[] = authFormArray.get('allowedDomain').value;
        this.loadAllowedDomainNamesForAuth(domainArray, i);
        authFormArray.get('allowedDomain').setValue([]);
        authFormArray.get('allowedDomain').setValidators(null);
        authFormArray.get('allowedDomain').updateValueAndValidity();
      }
      // authFormArray.get('allowedGroupType').setValidators(null);
      // authFormArray.get('allowedGroupType').updateValueAndValidity();

      // if (authFormArray.get('allowedGroupType').value !== null && authFormArray.get('allowedGroupType').value !== '') {
      //   const domainArray: any[] = authFormArray.get('allowedGroupType').value;
      //   this.loadAllowedGroupTypeForAuth(domainArray, i);
      //   authFormArray.get('allowedGroupType').setValue([]);
      // }

    }
  }
  // loadAllowedGroupTypeForAuth(domainArray, j) {
  //   if (domainArray && domainArray.length > 0) {
  //     for (let i = 0; i < domainArray.length; i++) {
  //       if (domainArray[i] !== null
  //         && domainArray[i] !== undefined
  //         && domainArray[i] !== '') {
  //         this.allowedGroupTypeAuthList.push({ name: domainArray[i], index: j });
  //       }
  //     }
  //   }
  // }

  loadAllowedDomainNamesForAuth(domainArray, j) {
    if (domainArray && domainArray.length > 0) {
      for (let i = 0; i < domainArray.length; i++) {
        if (domainArray[i] !== null
          && domainArray[i] !== undefined
          && domainArray[i] !== '') {
          this.allowedDomainNamesAuthList.push({ name: domainArray[i], index: j });
        }
      }
    }
  }

  loadSMSFormGroup(subDomain) {
    this.loadSMS = true;
    this.service.getOrganizationSmsKeys(subDomain).subscribe(data => {
      if (data.length > 0) {
        this.smsSection = data;
        for (let i = 0; i < this.smsSection.length; i++) {
          if (i > 0) {
            this.addSmsFormArray(i);
          }
          const group = ((this.form.get('organizationSmsKeys') as FormArray).get('' + i) as FormGroup);
          group.get('providerName').setValue(this.smsSection[i].providerName);
          group.get('secretKey').setValue(this.smsSection[i].secretKey);
          group.get('secretToken').setValue(this.smsSection[i].secretToken);
          group.get('fromPhoneNumber').setValue(this.smsSection[i].fromPhoneNumber);
          group.get('serviceName').setValue(this.smsSection[i].serviceName);
          group.get('id').setValue(this.smsSection[i].id);
          if (this.smsSection[i].providerName === 'aws') {
            this.show = false;
          }
          this.providerNameSelect({ value: this.smsSection[i].providerName }, i);
          if (this.smsSection[i].fromPhoneNumber) {
            group.get('smsFrom').setValue('phoneNumber');
            this.smsFromSelect({ value: 'phoneNumber' }, i)
          } else if (this.smsSection[i].serviceName) {
            group.get('smsFrom').setValue('serviceName');
            this.smsFromSelect({ value: 'serviceName' }, i)
          }
        }
      }
    });
  }

  getCustomMenuList() {
    const menuNameList = 'My Tasks,Running Process,Completed Process';
    const arrOfStr = window.location.href.split('//', 2);
    const URL = arrOfStr[1].split('.', 2);
    this.service.getCustomMenu(URL[0]).subscribe(data => {
      if (data.length > 0) {
        this.customMenuList = data;
        this.loadCustomMenu();
      } else {
        this.service.getMenuList(menuNameList).subscribe(menuList => {
          if (menuList.length > 0) {
            for (let i = 0; i < menuList.length; i++) {
              const custoMenu = new CustomMenuList();
              custoMenu.defaultMenu = menuList[i].menuName;
              this.customMenuList.push(custoMenu);
            }
            this.loadCustomMenu();
          }
        });
      }
    });
  }

  loadCustomMenu() {
    this.customMenuList = this.customMenuService.getMenuList(this.customMenuList);
    for (let i = 0; i < this.customMenuList.length; i++) {
      if (i > 0) {
        (this.form.get('customMenuList') as FormArray).push(this.customMenuFormGroup());
      }
      const group = ((this.form.get('customMenuList') as FormArray).get('' + i) as FormGroup);
      group.get('defaultMenu').setValue(this.customMenuList[i].defaultMenu);
      this.menuList.push(this.customMenuList[i].defaultMenu);
      if (this.customMenuList[i].customMenuName) {
        group.get('customMenuName').setValue(this.customMenuList[i].customMenuName);
      } else {
        group.get('customMenuName').setValue(this.customMenuList[i].defaultMenu);
      }
      if (this.customMenuList[i].displayName) {
        group.get('displayName').setValue(this.customMenuList[i].displayName);
      } else {
        group.get('displayName').setValue(this.customMenuService.getDisplayPageName(this.customMenuList[i].defaultMenu));
      }
      if (this.customMenuList[i].id) {
        group.get('id').setValue(this.customMenuList[i].id);
      }
    }
  }

  customMenuFormGroup(): FormGroup {
    return this.fb.group({
      id: [],
      defaultMenu: [''],
      customMenuName: ['', [Validators.required]],
      displayName: ['', [Validators.required]],
    });
  }
  discountFormGroup(): FormGroup {
    return this.fb.group({
      id: [],
      planname: []
    });
  }
  addDiscount() {
    (this.form.get('pricingDiscount') as FormArray).push(this.discountFormGroup());

  }
  getDiscountFormGroup() {
    return (this.form.get('pricingDiscount') as FormArray).controls;
  }

  addCustomMenuFormGroup() {
    (this.form.get('customMenuList') as FormArray).push(this.customMenuFormGroup());
  }

  removeCustomMenuFormGroup(i) {
    (this.form.get('customMenuList') as FormArray).removeAt(i);
  }

  getCustomMenuFormGroup() {
    return (this.form.get('customMenuList') as FormArray).controls;
  }

  loadThemesList() {
    this.themesService.getThemesList().subscribe(data => {
      this.themesList = data[0];
    });
  }

  passwordValidation() {
    const lower = /[a-z]/g;
    const upper = /[A-Z]/g;
    const numbers = /[0-9]/g;
    const splChar = /[!@#$%^&*?.,]/g;
    this.form.get('password').valueChanges.subscribe(data => {
      if (data !== null && data !== '' && data !== undefined) {
        if (data.length < 6) {
          return this.form.get('password').setErrors({ min: true });
        } else if (data.length > 50) {
          return this.form.get('password').setErrors({ max: true });
        } else {
          if (!data.match(lower)) {
            return this.form.get('password').setErrors({ lower: true });
          } else if (!data.match(upper)) {
            return this.form.get('password').setErrors({ upper: true });
          } else if (!data.match(numbers)) {
            return this.form.get('password').setErrors({ number: true });
          } else if (!data.match(splChar)) {
            return this.form.get('password').setErrors({ splChar: true });
          } else {
            return this.form.get('password').setErrors(null);
          }
        }
      }
    });
  }

  setThemeId(themeId, event) {
    if (event.isUserInput === true) {
      this.form.get('themeId').setValue(themeId);
    }
  }

  getUploaded($event) {
    this.disableLogo = false;
    if ($event === true) {
      this.form.markAsDirty();
      this.logo = true;
    }
  }

  validateSubdomainName() {
    const formControl = this.form.get('subdomainName');
    if (formControl.value !== '' && formControl.value !== null && this.subdomainName !== formControl.value) {
      this.customerVO.subdomainName = formControl.value;
      this.service.checkWithSubdomainName(this.customerVO).subscribe(data => {
        if (data.response != null) {
          if (data.response.includes('already exists')) {
            this.subdomain = formControl.value;
            formControl.setErrors({ alreadyExist: true });
          }
        }
      });
    }
    formControl.valueChanges.subscribe(data => {
      if (data && data === this.subdomain) {
        formControl.setErrors({ alreadyExist: true });
      }
    });
  }

  addData(event: MatChipInputEvent, list: Placeholder[]) {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      list.push({ name: value.trim() });
    }

    if (input) {
      input.value = '';
    }
  }

  removeData(placeholder: Placeholder, list: Placeholder[]): void {
    const index = list.indexOf(placeholder);

    if (index >= 0) {
      list.splice(index, 1);
    }
  }

  addAllowedDomainNames(event: MatChipInputEvent): void {
    this.addData(event, this.allowedDomainNamesList);
  }

  removeAllowedDomainNames(placeholder: Placeholder): void {
    this.removeData(placeholder, this.allowedDomainNamesList);
    this.form.get('allowedDomainNames').markAsDirty();
  }

  addAllowedDomainAuthNames(event: MatChipInputEvent, i): void {
    this.addDataFromAuth(event, this.allowedDomainNamesAuthList, i);

  }

  removeAllowedDomainAuthNames(placeholder: PlaceholderForAuth, i): void {
    this.removeDataFromAuth(placeholder, this.allowedDomainNamesAuthList, i);
  }

  removeDataFromAuth(placeholder: PlaceholderForAuth, list: PlaceholderForAuth[], i): void {
    const index = list.indexOf(placeholder);

    if (index >= 0) {
      list.splice(index, 1);
    }
  }

  addDataFromAuth(event: MatChipInputEvent, list: PlaceholderForAuth[], i) {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      list.push({ name: value.trim(), index: i });
    }
    if (input) {
      input.value = '';
    }
  }

  backgroundPreview(fileData) {
    const mimeType = fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(fileData);
    reader.onload = () => {
      if (fileData.size < 20000) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Minimum size should 800 X 600 size',
        });
      } else if (fileData.size > 500000) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Maximum size 500kb allowed',
        });
      } else {
        this.previewBackgroundImageUrl = reader.result;
        this.backgroundFileData = fileData;
      }
    };
  }


  onFileInput(event) {
    this.disableBackground = false;
    if (event) {
      if (event.target.files[0].type.includes('image/')) {
        this.backgroundPreview(event.target.files[0]);
        this.form.markAsDirty();
        this.isBackgroundLoad = true;
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Please choose Image File',
        });
      }
    }
  }

  dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: 'image/png' });
  }

  saveFile(dataUrl, fieldName) {
    if (dataUrl !== null) {
      const blob = this.dataURLToBlob(dataUrl);
      const name = new Date().getTime() + '.png' + fieldName;
      const fileData = new File([blob], name);
      return fileData;
    }
  }

  getFilesAndJsonFormData() {
    const saveFiles: any[] = [];
    if (this.loadLogo.previewUrl !== undefined && this.loadLogo.previewUrl !== null && this.loadLogo.previewUrl !== '') {
      saveFiles.push(this.saveFile(this.loadLogo.previewUrl, 'uploadLogo'));
    }
    if (this.previewBackgroundImageUrl !== undefined && this.previewBackgroundImageUrl !== null && this.previewBackgroundImageUrl !== '') {
      saveFiles.push(this.saveFile(this.previewBackgroundImageUrl, 'uploadBackgroudImage'));
    }
    const formData = new FormData();
    let customerVO = new CustomerVO();
    customerVO.id = this.form.get('id').value;
    customerVO.orgName = this.form.get('orgName').value;
    customerVO.allowedDomainNames = this.getListFromPlaceHolder(this.allowedDomainNamesList);
    customerVO.actualDomainName = this.form.get('actualDomainName').value;
    customerVO.timezone = this.timezoneEmit;
    customerVO.defaultLanguge = this.form.get('defaultLanguge').value;
    customerVO.subdomainName = this.form.get('subdomainName').value;
    customerVO.organizationUrl = this.form.get('organizationUrl').value;
    customerVO.twoFactor = this.form.get('twoFactor').value;
    customerVO.themeId = this.form.get('themeId').value;
    customerVO.serverFarm = this.form.get('serverFarm').value;
    customerVO.authenticationMethod = this.form.get('authenticationMethod').value;
    customerVO.startDate = this.form.get('startDate').value;
    customerVO.endDate = this.form.get('endDate').value;
    customerVO.dataSourceName = this.form.get('dataSourceName').value;
    customerVO.maximumUsers = this.form.get('maximumUsers').value;
    customerVO.firstName = this.form.get('firstName').value;
    customerVO.lastName = this.form.get('lastName').value;
    customerVO.userEmailId = this.form.get('userEmailId').value;
    customerVO.contactEmailId = this.form.get('contactEmailId').value;
    customerVO.password = this.form.get('password').value;
    customerVO.confirmPassword = this.form.get('confirmPassword').value;
    customerVO.orgPlanType = this.form.get('orgPlanType').value;
    customerVO.orgBillingType = this.form.get('orgBillingType').value;
    this.items = this.form.get('pricingDiscount') as FormArray;
    this.items.value.forEach(element => {
      element.id = null;
      element.discountId = null;
    });
    customerVO.organizationDiscountList = this.items.value;
    formData.append('data', JSON.stringify(customerVO));
    if (saveFiles.length > 0) {
      saveFiles.forEach(file => {
        formData.append('file', file);
      });
    } else {
      formData.append('file', null);
    }
    return formData;
  }

  transform() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.previewBackgroundImageUrl);
  }

  removeFormArray() {
    const formArray = (this.form.get('organizationSmsKeys') as FormArray);
    for (let i = 0; i < formArray.length; i++) {
      const providerName = formArray.get('' + i).get('providerName').value;
      if (providerName === null || providerName === undefined || providerName === '') {
        formArray.removeAt(i);
      }
    }
  }

  setType() {
    if (this.isUpdateOrg === true) {
      this.form.get('type').setValue('updateOrganization');
    } else if (this.isMobileMenuPreference === true) {
      this.form.get('type').setValue('mobilePreferences');
    } else if (this.isSmsKey === true) {
      this.form.get('type').setValue('smsKey');
    } else if (this.isCustomAttribute === true) {
      this.form.get('type').setValue('customAttribute');
    } else if (this.isAutoSubscription === true) {
      this.form.get('type').setValue('autoSubscription');
    }
  }

  updateCustomerForm() {
    this.updateForm = this.fb.group({
      id: [],
      orgName: ['', [Validators.required]],
      actualDomainName: [''],
      subdomainName: ['', [Validators.required]],
      defaultLanguge: ['', [Validators.required]],
      organizationUrl: [''],
      twoFactor: [],
      authenticationMethod: [],
      themeId: [],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      orgPlanType: ['', [Validators.required]],
      orgBillingType: [''],
      timezone: ['']
    });
    if (this.updatetimeZone) {
      this.updateForm.get('timezone').setValue(this.updatetimeZone);
    } else {
      this.updateForm.get('timezone').setValue(this.customerVO.timezone);
    }
    this.updateForm.get('id').setValue(this.form.get('id').value);
    this.updateForm.get('orgName').setValue(this.form.get('orgName').value);
    this.updateForm.get('actualDomainName').setValue(this.form.get('actualDomainName').value);
    this.updateForm.get('defaultLanguge').setValue(this.form.get('defaultLanguge').value);
    this.updateForm.get('subdomainName').setValue(this.form.get('subdomainName').value);
    this.updateForm.get('organizationUrl').setValue(this.form.get('organizationUrl').value);
    this.updateForm.get('twoFactor').setValue(this.form.get('twoFactor').value);
    this.updateForm.get('authenticationMethod').setValue(this.form.get('authenticationMethod').value);
    this.updateForm.get('themeId').setValue(this.form.get('themeId').value);
    this.updateForm.get('startDate').setValue(this.form.get('startDate').value);
    this.updateForm.get('endDate').setValue(this.form.get('endDate').value);
    this.updateForm.get('orgPlanType').setValue(this.form.get('orgPlanType').value);
    this.updateForm.get('orgBillingType').setValue(this.form.get('orgBillingType').value);
  }
  getFile() {
    const saveFiles: any[] = [];
    if (this.loadLogo.previewUrl !== undefined && this.loadLogo.previewUrl !== null && this.loadLogo.previewUrl !== '') {
      saveFiles.push(this.saveFile(this.loadLogo.previewUrl, 'uploadLogo'));
    }
    if (this.previewBackgroundImageUrl !== undefined && this.previewBackgroundImageUrl !== null && this.previewBackgroundImageUrl !== '') {
      saveFiles.push(this.saveFile(this.previewBackgroundImageUrl, 'uploadBackgroudImage'));
    }
    const formData = new FormData();
    const customerVO = new CustomerVO;
    customerVO.id = this.updateCustomerVo.id;
    customerVO.orgName = this.updateCustomerVo.orgName;
    customerVO.allowedDomainNames = this.updateCustomerVo.allowedDomainNames;
    customerVO.actualDomainName = this.updateCustomerVo.actualDomainName;
    customerVO.timezone = this.updateCustomerVo.timezone;
    customerVO.defaultLanguge = this.updateCustomerVo.defaultLanguge;
    customerVO.subdomainName = this.updateCustomerVo.subdomainName;
    customerVO.organizationUrl = this.updateCustomerVo.organizationUrl;
    customerVO.twoFactor = this.updateCustomerVo.twoFactor;
    customerVO.authenticationMethod = this.updateCustomerVo.authenticationMethod;
    customerVO.themeId = this.updateCustomerVo.themeId;
    customerVO.startDate = this.updateCustomerVo.startDate;
    customerVO.endDate = this.updateCustomerVo.endDate;
    customerVO.orgPlanType = this.updateCustomerVo.orgPlanType;
    customerVO.orgBillingType = this.updateCustomerVo.orgBillingType;
    customerVO.type = 'update';
    this.items = this.form.get('pricingDiscount') as FormArray;
    this.items.value.forEach(element => {
      element.id = this.customerVO.id;
    });
    customerVO.organizationDiscountList = this.items.value;
    formData.append('data', JSON.stringify(customerVO));
    if (saveFiles.length > 0) {
      saveFiles.forEach(file => {
        formData.append('file', file);
      });
    } else {
      formData.append('file', null);
    }
    return formData;
  }
  updatePricing(userForm) {
    if (this.isUpdateOrg === true) {
      if (this.updatetimeZone !== undefined) {
        this.updateCustomerVo.timezone = this.updatetimeZone;
      } else {
        this.updateCustomerVo.timezone = this.customerVO.timezone;
      }
      this.updateCustomerVo.id = this.form.get('id').value;
      this.updateCustomerVo.orgName = this.form.get('orgName').value;
      this.updateCustomerVo.allowedDomainNames = this.getListFromPlaceHolder(this.allowedDomainNamesList);
      this.updateCustomerVo.actualDomainName = this.form.get('actualDomainName').value;
      this.updateCustomerVo.defaultLanguge = this.form.get('defaultLanguge').value;
      this.updateCustomerVo.subdomainName = this.form.get('subdomainName').value;
      this.updateCustomerVo.organizationUrl = this.form.get('organizationUrl').value;
      this.updateCustomerVo.twoFactor = this.form.get('twoFactor').value;
      this.updateCustomerVo.authenticationMethod = this.form.get('authenticationMethod').value;
      this.updateCustomerVo.themeId = this.form.get('themeId').value;
      this.updateCustomerVo.startDate = this.form.get('startDate').value;
      this.updateCustomerVo.endDate = this.form.get('endDate').value;
      this.updateCustomerVo.orgPlanType = this.form.get('orgPlanType').value;
      this.updateCustomerVo.orgBillingType = this.form.get('orgBillingType').value;
      this.updateCustomerVo.logo = this.getFile();
      this.service.updateOrganizationDisount(this.updateCustomerVo).subscribe(data => {
        if (data.response.includes('successfully')) {
          this.disablePricing = true;

          const items = this.form.get('pricingDiscount') as FormArray;
          this.customerVO.organizationDiscountList = items.value;
          this.subdomainName = this.updateCustomerVo.subdomainName;
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
        }
        else {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
        }

      });
    }
  }
  updatePackage(userForm) {
    if (this.isUpdateOrg === true) {
      if (this.updatetimeZone !== undefined) {
        this.updateCustomerVo.timezone = this.updatetimeZone;
      } else {
        this.updateCustomerVo.timezone = this.customerVO.timezone;
      }
      const date = new Date(this.form.get('startDate').value);
      if (date.getTimezoneOffset() < 0) {
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
      } else if ((date.getTimezoneOffset() > 0)) {
        date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
      }
      this.form.get('startDate').setValue(date);
      const date1 = new Date(this.form.get('endDate').value);
      if (date1.getTimezoneOffset() < 0) {
        date1.setTime(date1.getTime() - date1.getTimezoneOffset() * 60 * 1000);
      } else if ((date1.getTimezoneOffset() > 0)) {
        date1.setTime(date1.getTime() + date1.getTimezoneOffset() * 60 * 1000);
      }
      this.form.get('endDate').setValue(date1);
      if (this.form.get('startDate').value !== '' && this.form.get('startDate').value !== null && this.form.get('startDate').value !== undefined && this.form.get('endDate').value !== '' && this.form.get('endDate').value !== null && this.form.get('startDate').value !== undefined && this.form.get('orgPlanType').value !== '' && this.form.get('orgPlanType').value !== null && this.form.get('startDate').value !== undefined) {
        this.updateCustomerVo.id = this.form.get('id').value;
        this.updateCustomerVo.orgName = this.form.get('orgName').value;
        this.updateCustomerVo.allowedDomainNames = this.getListFromPlaceHolder(this.allowedDomainNamesList);
        this.updateCustomerVo.actualDomainName = this.form.get('actualDomainName').value;
        this.updateCustomerVo.defaultLanguge = this.form.get('defaultLanguge').value;
        this.updateCustomerVo.subdomainName = this.form.get('subdomainName').value;
        this.updateCustomerVo.organizationUrl = this.form.get('organizationUrl').value;
        this.updateCustomerVo.twoFactor = this.form.get('twoFactor').value;
        this.updateCustomerVo.authenticationMethod = this.form.get('authenticationMethod').value;
        this.updateCustomerVo.themeId = this.form.get('themeId').value;
        this.updateCustomerVo.startDate = this.form.get('startDate').value;
        this.updateCustomerVo.endDate = this.form.get('endDate').value;
        this.updateCustomerVo.orgPlanType = this.form.get('orgPlanType').value;
        this.updateCustomerVo.orgBillingType = this.form.get('orgBillingType').value;
        this.updateCustomerVo.logo = this.getFile();
        this.service.updateOrganizationPackage(this.updateCustomerVo).subscribe(data => {
          if (data.response.includes('Successfully')) {
            this.form.get('startDate').markAsPristine();
            this.form.get('endDate').markAsPristine();
            this.form.get('orgBillingType').markAsPristine();
            this.form.get('orgPlanType').markAsPristine();
            this.subdomainName = this.updateCustomerVo.subdomainName;
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
          }
          else {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
          }
        });
      }
    }
  }

  update(userForm) {
    if (this.isUpdateOrg === true) {
      this.updateCustomerForm();
      if (this.updatetimeZone !== undefined) {
        this.updateCustomerVo.timezone = this.updatetimeZone;
      } else {
        this.updateCustomerVo.timezone = this.customerVO.timezone;
      }
      if (this.form.get('orgName').value !== '' && this.form.get('orgName').value !== null
        && this.form.get('orgName').value !== undefined && this.form.get('defaultLanguge').value !== ''
        && this.form.get('defaultLanguge').value !== null && this.form.get('defaultLanguge').value !== undefined) {
        this.updateCustomerVo.id = this.form.get('id').value;
        this.updateCustomerVo.orgName = this.form.get('orgName').value;
        this.updateCustomerVo.allowedDomainNames = this.getListFromPlaceHolder(this.allowedDomainNamesList);
        this.updateCustomerVo.actualDomainName = this.form.get('actualDomainName').value;
        this.updateCustomerVo.defaultLanguge = this.form.get('defaultLanguge').value;
        this.updateCustomerVo.subdomainName = this.form.get('subdomainName').value;
        this.updateCustomerVo.organizationUrl = this.form.get('organizationUrl').value;
        this.updateCustomerVo.twoFactor = this.form.get('twoFactor').value;
        this.updateCustomerVo.authenticationMethod = this.form.get('authenticationMethod').value;
        this.updateCustomerVo.themeId = this.form.get('themeId').value;
        this.updateCustomerVo.startDate = this.form.get('startDate').value;
        this.updateCustomerVo.endDate = this.form.get('endDate').value;
        this.updateCustomerVo.orgPlanType = this.form.get('orgPlanType').value;
        this.updateCustomerVo.orgBillingType = this.form.get('orgBillingType').value;
        this.updateCustomerVo.logo = this.getFile();
        this.service.updateOrganization(this.updateCustomerVo).subscribe(data => {
          this.form.get('orgName').markAsPristine();
          this.form.get('actualDomainName').markAsPristine();
          this.form.get('defaultLanguge').markAsPristine();
          this.form.get('subdomainName').markAsPristine();
          this.form.get('organizationUrl').markAsPristine();
          this.form.get('allowedDomainNames').markAsPristine();
          this.form.get('themeId').markAsPristine();
          this.disabletimeZone = true;
          this.disableLogo = true;
          this.disableBackground = true;
          this.customerVO.orgName = this.form.get('orgName').value;
          this.customerVO.actualDomainName = this.form.get('actualDomainName').value;
          this.customerVO.defaultLanguge = this.form.get('defaultLanguge').value;
          this.customerVO.organizationUrl = this.form.get('organizationUrl').value;
          this.customerVO.themeId = this.form.get('themeId').value;
          this.customerVO.subdomainName = this.form.get('subdomainName').value;
          this.customerVO.timezone = this.form.get('timezone').value;
          this.subdomainName = this.updateCustomerVo.subdomainName;
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Organization updated sucessfully',
          });
        },
        );
      }
    } else if (this.isMobileMenuPreference === true) {
      if (this.form.get('customMenuList').valid) {
        this.customMenu.customMenuList = this.form.get('customMenuList').value;
        this.customMenu.subdomainName = this.subdomainName;
        this.service.updateMobileMenuPrferences(this.customMenu).subscribe(data => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Organization mobile menu preferences updated sucessfully',
          });
        });
      }
    } else if (this.isSmsKey === true) {
      if (this.form.get('organizationSmsKeys').valid) {
        const formArray = (this.form.get('organizationSmsKeys') as FormArray);
        let isTrue = false;
        let isMaskedTrue = false;
        let count = 0;
        for (let i = 0; i < formArray.length; i++) {
          const providerName = formArray.get('' + i).get('providerName').value;
          const secretToken = formArray.get('' + i).get('secretToken');
          const secretKey = formArray.get('' + i).get('secretKey');
          if (providerName === null || providerName === undefined || providerName === '') {
            count++;
            if (formArray.length > 1) {
              formArray.removeAt(i);
              isTrue = false;
            } else {
              isTrue = true;
            }
          }
          if (secretToken.value.includes('xxx') && secretKey.value.includes('xxx')) {
            secretToken.setErrors({ invalidSecretToken: true });
            secretKey.setErrors({ invalidSecretKey: true });
            isMaskedTrue = true;
          } else if (secretToken.value.includes('xxx')) {
            secretToken.setErrors({ invalidSecretToken: true });
            isMaskedTrue = true;
          } else if (secretKey.value.includes('xxx')) {
            secretKey.setErrors({ invalidSecretKey: true });
            isMaskedTrue = true;
          } else {
            secretToken.setErrors(null);
            secretKey.setErrors(null);
            isMaskedTrue = false;
          }
        }
        if (!isTrue && !isMaskedTrue) {
          this.orgSmsKeys.organizationSmsKeys = this.form.get('organizationSmsKeys').value;
          this.orgSmsKeys.deleteKeys = this.deleteKeys;
          this.orgSmsKeys.subdomainName = this.subdomainName;
          this.service.updateSmsKeys(this.orgSmsKeys).subscribe(data => {

            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Organization SMS keys updated sucessfully',
            });
          });
        }
      }
    } else if (this.isCustomAttribute === true) {
      if (this.form.get('customAttributeListVo').valid) {
        if (this.form.get('addCustomAttribute').value === false && this.getCustomAtrributeFormArray().length > 0) {
          for (let i = 0; i < this.getCustomAtrributeFormArray().length; i++) {
            this.removeAttributes(i);
            i = i - 1;
          }
        }
        this.attributesVoList = this.form.get('customAttributeListVo').value;
        this.attributesVoList.deletedColumnIDList = this.deletedIdList;
        const attributesVO = new CustomAttributeVO();
        attributesVO.customAttributeListVo = this.form.get('customAttributeListVo').value;
        attributesVO.deletedColumnIDList = this.deletedIdList;
        attributesVO.subdomainName = this.subdomainName;
        this.service.updateAttributes(attributesVO).subscribe(data => {
          this.reset(userForm, 'update');
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Organization attributes updated sucessfully',
          });
        });
      }
    } else if (this.isAutoSubscription === true) {
      const subscriptionVO = new SubscriptionVO();
      subscriptionVO.billingType = this.form.get('billingType').value;
      subscriptionVO.planType = this.form.get('planType').value;
      subscriptionVO.customerId = this.form.get('customerId').value;
      subscriptionVO.customerPaymentId = this.form.get('customerPaymentId').value;
      subscriptionVO.subscriptionAmount = this.form.get('subscriptionAmount').value;
      subscriptionVO.subscriptionId = this.form.get('subscriptionId').value;
      subscriptionVO.subdomainName = this.subdomainName;
      this.service.updateSubcription(subscriptionVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Subcription updated sucessfully',
        });
      });
    } else if (this.isAllowAuthentication === true) {
      const allowAuthentication = new AllowAuthentication();
      this.setValidatorForAuth();
      if (this.form.get('allowAuthentication').valid) {
        allowAuthentication.authenticationArray = this.form.get('allowAuthentication').value;
        allowAuthentication.subdomainName = this.subdomainName;
        this.setYoroflowValue(allowAuthentication);
        this.isDisable = true;
        this.removeDomainValues();
        this.service.updateAuthMethod(allowAuthentication).subscribe(data => {
          this.allowedDomainNamesAuthList = [];
          if (!this.yoroAdminUpdate) {
            this.loadAuthFormGroup(this.subdomainName, true);
          } else {
            this.loadAuthFormGroup(this.subdomainName, false);
          }
          this.isDisable = false;
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Auth Method updated sucessfully',
          });
        },
          error => {
            this.isDisable = false;
          });
      }
    } else if (this.isTwoFactorAuth === true) {
      this.twoFactorVo.enableTwoFactor = this.form.get('enableTwoFactor').value;
      this.twoFactorVo.subdomainName = this.subdomainName;
      this.checkTwofactorValidation(this.twoFactorVo);
      if (this.allowTwoFactorSave) {
        this.service.updateOrganizationTwoFactor(this.twoFactorVo).subscribe(data => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Organization Two Factor updated sucessfully',
          });
        });
      }
    }
  }

  checkTwofactorValidation(twoFactorVo: TwoFactorAuthentication) {
    if (twoFactorVo.selectedTwofactorsList.length === 0) {
      this.allowTwoFactorSave = false;
    } else {
      this.allowTwoFactorSave = true;
    }
  }

  setYoroflowValue(allowAuthentication) {
    allowAuthentication.authenticationArray.forEach(element => {
      if (element.authProvider === 'Yoroflow sign in') {
        element.isAuthProvider = true;
      }
    });
  }

  removeDomainValues() {
    for (let i = 0; i < this.getAuthenticationFormArray().length; i++) {
      const index = '' + i;
      const authFormArray = (this.getAuthenticationFormArray().get(index) as FormGroup);
      authFormArray.get('allowedDomain').setValue([]);
      authFormArray.get('allowedDomain').setValidators(null);
      authFormArray.get('allowedDomain').updateValueAndValidity();
    }
  }

  setValidatorForAuth() {
    for (let i = 0; i < this.getAuthenticationFormArray().length; i++) {
      const index = '' + i;
      const authFormArray = (this.getAuthenticationFormArray().get(index) as FormGroup);
      if (this.getAuthenticationFormArray().get('' + i).get('authProvider').value === 'Sign in with Microsoft Azure') {
        this.getAuthenticationFormArray().get('' + i).get('allowedGroup')
        .setValue(this.getListFromPlaceHolderAuth(this.allowedDomainNamesAuthList, i));
        if ((authFormArray.get('isAuthProvider').value === true) &&
        authFormArray.get('allowedGroupType').value === 'specific') {
        authFormArray.get('allowedGroup').setValidators(Validators.required);
        // authFormArray.get('isAuthProvider').disable();
      } else {
        authFormArray.get('allowedGroup').setValidators(null);
      }
        authFormArray.get('allowedGroup').updateValueAndValidity();
      } else {
      this.getAuthenticationFormArray().get('' + i).get('allowedDomain')
        .setValue(this.getListFromPlaceHolderAuth(this.allowedDomainNamesAuthList, i));
      if ((authFormArray.get('isAuthProvider').value === true) &&
        authFormArray.get('selectDomainType').value === 'specific') {
        authFormArray.get('allowedDomain').setValidators(Validators.required);
        // authFormArray.get('isAuthProvider').disable();
      } else {
        authFormArray.get('allowedDomain').setValidators(null);
      }
      authFormArray.get('allowedDomain').updateValueAndValidity();
      // authFormArray.get('allowedDomain').setValue([]);
    }
  }
  }

  getListFromPlaceHolderAuth(list: PlaceholderForAuth[], i): string[] {
    const values = [];
    list.forEach(placeholder => {
      if (placeholder.index === i) {
        values.push(placeholder.name);
      }
    });
    return values;
  }

  save(userForm) {
    if (this.customerInfo) {
      this.form.get('password').setValidators(null);
      this.form.get('password').updateValueAndValidity();
      this.form.get('confirmPassword').setValidators(null);
      this.form.get('confirmPassword').updateValueAndValidity();
      this.form.get('firstName').setValidators(null);
      this.form.get('firstName').updateValueAndValidity();
      this.form.get('lastName').setValidators(null);
      this.form.get('lastName').updateValueAndValidity();
      this.form.get('userEmailId').setValidators(null);
      this.form.get('userEmailId').updateValueAndValidity();
      this.form.get('contactEmailId').setValidators(null);
      this.form.get('contactEmailId').updateValueAndValidity();
    } else {
      this.form.get('timezone').setValue(this.timezoneEmit);
      const password = this.form.get('password').value;
      const confirmPassword = this.form.get('confirmPassword').value;
      if (password !== confirmPassword) {
        this.form.get('confirmPassword').setErrors({ notEqual: true });
      }
    }
    if (userForm.valid) {
      // this.removeFormArray();
      // if (this.form.get('addCustomAttribute').value === false && this.getCustomAtrributeFormArray().length > 0) {
      //   for (let i = 0; i < this.getCustomAtrributeFormArray().length; i++) {
      //     this.removeAttributes(i);
      //     i = i - 1;
      //   }
      // }
      this.isDisable = true;
      // this.form.get('deletedColumnIDList').setValue(this.deletedIdList);
      // this.form.get('deleteKeys').setValue(this.deleteKeys);
      // this.customerVO = this.form.getRawValue();
      // this.attributesVoList = this.form.get('customAttributeListVo').value;
      // this.attributesVoList.deletedColumnIDList = this.deletedIdList;
      // this.customerVO.allowedDomainNames = this.getListFromPlaceHolder(this.allowedDomainNamesList);
      // const jsonData = JSON.stringify(this.customerVO);
      this.customerVO.logo = this.getFilesAndJsonFormData();

      this.service.createOrganization(this.customerVO).subscribe(
        data => {
          if (data !== null) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            if (data.response.includes('Updated Successfully') && !this.adminUpdate) {
              this.showUpdateOrg = false;
            }
            if (!data.response.includes('subdomain')) {
              this.isDisable = false;
              if (!this.adminUpdate) {
                userForm.resetForm();
                this.userData.emit(true);
                this.loadLogo.previewUrl = null;
                this.previewBackgroundImageUrl = null;
                this.allowedDomainNamesList = [];
                this.uploadAction = 'upload';
                if (this.form.get('type').value === 'autoSubscription') {
                  this.router.navigate(['payment-process']);
                } else {
                  if (this.customerInfo) {
                    this.updateOrg.refreshGrid();
                    this.form.disable();
                  }
                }
              } else {
              }
            }
            this.deleteKeys = [];
          }
        },
        error => {
          this.isDisable = false;
        });
    }
  }

  getListFromPlaceHolder(list: Placeholder[]): string[] {
    const values = [];
    list.forEach(placeholder => values.push(placeholder.name));
    return values;
  }

  listRoute() {
    this.showUpdateOrg = false;
    this.form.get('orgName').markAsPristine();
    this.form.get('actualDomainName').markAsPristine();
    this.form.get('defaultLanguge').markAsPristine();
    this.form.get('subdomainName').markAsPristine();
    this.form.get('organizationUrl').markAsPristine();
    this.form.get('allowedDomainNames').markAsPristine();
    this.form.get('themeId').markAsPristine();
    this.disabletimeZone = true;
    this.disableLogo = true;
    this.disableBackground = true;

  }

  loadUpdateOrgSMSFormGroup(subDomain) {
    this.loadSMS = false;
    this.service.getUpdateOrganizationSmsKeys(subDomain).subscribe(data => {
      if (data.length > 0) {
        this.smsSection = data;
        for (let i = 0; i < this.smsSection.length; i++) {
          if (i > 0) {
            this.addSmsFormArray(i);
          }
          const group = ((this.form.get('organizationSmsKeys') as FormArray).get('' + i) as FormGroup);
          group.get('providerName').setValue(this.smsSection[i].providerName);
          group.get('secretKey').setValue(this.smsSection[i].secretKey);
          group.get('secretToken').setValue(this.smsSection[i].secretToken);
          group.get('fromPhoneNumber').setValue(this.smsSection[i].fromPhoneNumber);
          group.get('serviceName').setValue(this.smsSection[i].serviceName);
          group.get('id').setValue(this.smsSection[i].id);
          if (this.smsSection[i].providerName === 'aws') {
            this.show = false;
          }
          this.providerNameSelect({ value: this.smsSection[i].providerName }, i);
          if (this.smsSection[i].fromPhoneNumber) {
            group.get('smsFrom').setValue('phoneNumber');
            this.smsFromSelect({ value: 'phoneNumber' }, i)
          } else if (this.smsSection[i].serviceName) {
            group.get('smsFrom').setValue('serviceName');
            this.smsFromSelect({ value: 'serviceName' }, i)
          }
        }
      }
    });
  }

  receiveMessage($event) {
    if (this.apiCalled === true) {
      this.service.getOrganizationInfoById($event.col1).subscribe(data => {
        if (data) {
          this.apiCalled = true;
        }
        this.customerVO = data;
        this.templateData1 = this.customerVO.timezone;
        this.subdomainName = this.customerVO.subdomainName;
        this.showUpdateOrg = true;
        if (this.customerVO) {
          this.form.enable();
          this.initializeForm();
          this.apiCalls = true;
          this.getCustomAttributes(this.customerVO.subdomainName, false);
          this.loadUpdateOrgSMSFormGroup(this.customerVO.subdomainName);
          this.loadAuthFormGroup(this.customerVO.subdomainName, false);
          this.getPaymentSubscriptionDetails();
          this.getOrganizationTwoFactor(this.customerVO.subdomainName);
          this.getOrganizationEmailSettings(this.customerVO.subdomainName, false);
          this.getOrgsubscriptionDetails();
          this.service.getUpdateOrgCustomMenu(this.customerVO.subdomainName).subscribe(data => {
            if (data.length > 0) {
              this.customMenuList = data;
              this.loadCustomMenu();
            } else {
              const menuNameList = 'My Tasks,Running Process,Completed Process';
              this.service.getMenuList(menuNameList).subscribe(menuList => {
                if (menuList.length > 0) {
                  for (let i = 0; i < menuList.length; i++) {
                    const custoMenu = new CustomMenuList();
                    custoMenu.defaultMenu = menuList[i].menuName;
                    this.customMenuList.push(custoMenu);
                  }
                  this.loadCustomMenu();
                }
              });
            }
          });
          if (this.customerVO.allowedDomainNames) {
            this.allowedDomainNamesList = this.getPlaceholderFromStringArray(this.customerVO.allowedDomainNames);
          }
          if (this.customerVO.image) {
            this.logo = true;
            this.loadLogo.previewUrl = this.customerVO.image;
          }
          if (this.customerVO.backgroundImage) {
            this.isBackgroundLoad = true;
            this.previewBackgroundImageUrl = this.customerVO.backgroundImage;
          }
        }
      });
    }
    this.apiCalled = false;
  }
  resetOrg(userForm) {
    if (this.updateCustomerVo.timezone === undefined) {
      this.userData.emit(this.customerVO.timezone)
    }
    else {
      this.userData.emit(this.updateCustomerVo.timezone)
    }
    this.form.get('orgName').setValue(this.customerVO.orgName);
    this.form.get('actualDomainName').setValue(this.customerVO.actualDomainName);
    this.form.get('defaultLanguge').setValue(this.customerVO.defaultLanguge);
    this.form.get('timezone').setValue(this.customerVO.timezone);
    this.form.get('organizationUrl').setValue(this.customerVO.organizationUrl);
    this.form.get('themeId').setValue(this.customerVO.themeId);
    this.form.get('subdomainName').setValue(this.customerVO.subdomainName);
  }


  resetDiscount(userForm) {
    this.items = this.form.get('pricingDiscount') as FormArray;
    this.items.patchValue(this.customerVO.organizationDiscountList)
  }
  resetPackage(userForm) {
    if (this.updateCustomerVo.orgPlanType === undefined) {
      this.form.get('orgPlanType').setValue(this.customerVO.orgPlanType);
    }
    else {
      this.form.get('orgPlanType').setValue(this.updateCustomerVo.orgPlanType);
    }
    if (this.updateCustomerVo.startDate === undefined) {
      this.form.get('startDate').setValue(this.customerVO.startDate);
    }
    else {
      this.form.get('startDate').setValue(this.updateCustomerVo.startDate);
    }
    if (this.updateCustomerVo.endDate === undefined) {
      this.form.get('endDate').setValue(this.customerVO.endDate);
    }
    else {
      this.form.get('endDate').setValue(this.updateCustomerVo.endDate);
    }
    if (this.updateCustomerVo.orgBillingType === undefined) {
      this.form.get('orgBillingType').setValue(this.customerVO.orgBillingType);
    }
    else {
      this.form.get('orgBillingType').setValue(this.updateCustomerVo.orgBillingType);
    }
  }
  reset(userForm, value) {
    this.isDisable = false;
    this.show = true;
    this.loadLogo.previewUrl = null;
    this.previewBackgroundImageUrl = null;
    this.uploadAction = 'upload';
    this.allowedDomainNamesList = [];
    if (value === 'create') {
      userForm.resetForm();
    }
    if (this.customerInfo) {
      this.menuList = [];
      this.deleteKeys = [];
      if (!this.adminUpdate) {
        this.adminUpdateOrg();
      }
    } else {
      this.userData.emit(true)
      this.deleteKeys = [];
      this.menuList = [];
      this.resetSMSFormArray();
    }
    if (this.adminUpdate) {
      this.adminUpdateOrg();
    }
  }

  resetSMSFormArray() {
    for (let i = 0; i < this.smsSection.length; i++) {
      (this.form.get('organizationSmsKeys') as FormArray).removeAt(0);
    }
    this.smsSection = [];
    if (this.getSMSSectionFormArray().length === 0) {
      this.addSmsFormArray(0);
    }
  }

  addOrgAttributes($event) {
    if ($event.checked === true && this.getCustomAtrributeFormArray().length === 0) {
      this.addAttributes();
    }
  }

  getCustomAttributes(subdomainName, isUpdate: boolean) {
    this.userCustomAttributeService.getOrgCustomattributesDetails(subdomainName).subscribe(data => {
      this.attributesVoList.customAttributeListVo = data;
      if (this.attributesVoList.customAttributeListVo.length > 0) {
        this.form.get('addCustomAttribute').setValue(true);
      }
      this.loadVariableForm(this.attributesVoList.customAttributeListVo, isUpdate);
    });
  }


  getOrganizationTwoFactor(subdomainName) {
    this.service.getOrganizationTwoFactor(subdomainName).subscribe(data => {
      if (data) {
        this.twoFactorVo = data;
        this.form.get('enableTwoFactor').setValue(data.enableTwoFactor);
      }
    });
  }

  getCustomAtrributeGroup() {
    return this.fb.group({
      id: [],
      name: ['', [Validators.required]],
      dataType: ['', [Validators.required]],
      value: [''],
      size: [''],
      required: [false],
      attributeType: ['', [Validators.required]],
    });
  }

  getCustomAtrributeFormArray() {
    return (this.form.get('customAttributeListVo') as FormArray);
  }

  addAttributes() {
    this.getCustomAtrributeFormArray().push(this.getCustomAtrributeGroup());
  }

  removeAttributes(i) {
    const deleteId = (this.getCustomAtrributeFormArray().get('' + i) as FormGroup).get('id').value;
    if (deleteId !== null && deleteId !== '') {
      this.deletedIdList.push(deleteId);
      this.form.markAsDirty();
    }
    this.getCustomAtrributeFormArray().removeAt(i);
    if (this.getCustomAtrributeFormArray().length === 0) {
      this.form.get('addCustomAttribute').setValue(false);
    }
  }

  getFieldNames(): FieldName[] {
    // tslint:disable-next-line: prefer-const
    let attributeNames: FieldName[] = [];
    for (let i = 0; i < this.getCustomAtrributeFormArray().length; i++) {
      const name = this.getCustomAtrributeFormArray().get('' + i).get('name').value;
      if (name !== null && name !== undefined && name !== '') {
        attributeNames.push({ index: i, value: name });
      }
    }
    return attributeNames;
  }

  checkDuplicateAttribute(i) {
    const attributeName = this.getCustomAtrributeFormArray().get('' + i).get('name');
    const attributeNames: FieldName[] = this.getFieldNames();
    for (let j = 0; j < this.getCustomAtrributeFormArray().length; j++) {
      const attribute = this.getCustomAtrributeFormArray().get('' + j).get('name');
      if (attributeNames.some(name => (name.index !== i && name.value === attributeName.value))) {
        this.getCustomAtrributeFormArray().get('' + i).get('name').setErrors({ unique: true });
      }
      if (attribute.errors && attribute.errors.unique === true) {
        if (!attributeNames.some(name => (name.value === attribute.value && name.index !== j))) {
          attribute.setErrors(null);
        }
      }
      attribute.markAsTouched({ onlySelf: true });
    }
  }

  loadVariableForm(list: CustomAttributeListVO[], isUpdate: boolean) {
    if (list) {
      this.loadVariables = false;
      for (let i = 0; i < list.length; i++) {
        if (isUpdate !== true) {
          this.addAttributes();
        }
        list[i].name = list[i].name.split('_')[1];
        (this.getCustomAtrributeFormArray().get('' + i) as FormGroup).patchValue(list[i]);
      }
    }
  }

  loadAllowAuthForm(list: AuthenticationArray[], isUpdate: boolean) {
    if (list) {
      // this.loadVariables = false;
      for (let i = 0; i < list.length; i++) {
        if (isUpdate !== true) {
          this.addAttributes();
        }
        (this.getCustomAtrributeFormArray().get('' + i) as FormGroup).patchValue(list[i]);
      }
    }
  }

  setValueRequired(attributeType, required: boolean, value: FormControl) {
    if (attributeType === 'org' && required) {
      value.setValidators(Validators.required);
    } else {
      value.setValidators(null);
    }
    value.updateValueAndValidity();
  }

  setSizeRequired(size: FormControl, dataType: string) {
    if (dataType === 'string' || dataType === 'long' || dataType === 'float') {
      size.setValidators(Validators.required);
    } else {
      size.setValidators(null);
    }
    size.updateValueAndValidity();
  }

  showAuthMethods(event, authenticationMethod: AbstractControl) {
    if (event.checked === true) {
      authenticationMethod.setValidators(Validators.required);
    } else {
      authenticationMethod.setValidators(null);
      authenticationMethod.setValue([]);
    }
    authenticationMethod.updateValueAndValidity();
  }

  twoFactor(twoFactorName: string) {

    if (this.twoFactorVo.selectedTwofactorsList.includes(twoFactorName)) {
      this.twoFactorVo.selectedTwofactorsList.splice
        (this.twoFactorVo.selectedTwofactorsList.findIndex(value => value === twoFactorName), 1);
    } else {
      this.twoFactorVo.selectedTwofactorsList.push(twoFactorName);
    }
    this.checkTwofactorValidation(this.twoFactorVo);
  }
  getData(event: any, userForm): void {
    this.timezoneEmit = event
  }
  selectPlan(plan) {
    this.active = plan.planname;
  }
  explore() {
    window.open("https://www.yoroflow.com/free-workflow-software-solution/", '_blank');
  }

  compareAllPlans() {
    window.open("https://www.yoroflow.com/free-workflow-software-solution/#fullprice", '_blank');
  }

  getData1(event: any, userForm) {
    this.updatetimeZone = event;
    this.disabletimeZone = false;
  }
}






export interface Placeholder {
  name: string;
}
