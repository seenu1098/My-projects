import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { PhoneNumber, Placeholder } from '../create-organization/create-organization.component';
import { CreateOrganizationService } from '../create-organization/create-organization.service';
import { CustomMenuService } from '../create-organization/custom-menu.service';
import { CustomerVO, CustomMenuList, customMenuVO, EmailSettingsVO, EmailSettingsVOList, OrganizationSMSKeys, SMSKeysVO, SubscriptionVO, updateCustomerVO } from '../create-organization/customer-vo';
import { AllowAuthentication, AuthenticationArray, CustomAttributeListVO, CustomAttributeVO, FieldName, PlaceholderForAuth, TwoFactorAuthentication } from '../org-custom-attributes/org-custom-attribute-vo';
import { LoadLogoService } from '../shared/service/load-logo.service';
import { ThemesService } from '../shared/service/themes.service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { ThemesVO } from '../shared/vo/themes-vo';
import { UserCustomAttributeService } from '../user-custom-attributes/user-custom-attribute.service';
import { OrganizationVO } from './organization-vo';
import { OrganizationService } from './organization.service';
import { TaskPropertyService } from 'src/app/designer-module/task-property/task-property.service';
import { GroupVO } from 'src/app/designer-module/task-property/model/group-vo';
import { RolesService } from '../user-role-association/roles.service';
import { EmailSettingDialogComponent } from '../email-setting-dialog/email-setting-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ThemeService } from 'src/app/services/theme.service';
import { UserRoleService } from 'src/app/shared-module/services/user-role.service';
import { UserService } from 'src/app/rendering-module/shared/service/user-service';

@Component({
  selector: 'lib-user-update-organization',
  templateUrl: './user-update-organization.component.html',
  styleUrls: ['./user-update-organization.component.scss']
})
export class UserUpdateOrganizationComponent implements OnInit {

  allowedDomainNamesList: Placeholder[] = [];
  allowedDomainNamesAuthList: PlaceholderForAuth[] = [];
  form: FormGroup;
  customerVO = new OrganizationVO();
  selectable = true;
  removable = true;
  addOnBlur = true;
  hideNew = true;
  hideConfirm = true;
  valid = false;
  selectedFile: any;
  themesList = new ThemesVO();
  base64Image: any;
  fileData: File;
  previewUrl: any = null;
  uploadAction = 'upload';
  subdomainName: any;
  isDisable = false;
  loadVariables = true;
  deletedIdList: any[] = [];
  attributesVoList = new CustomAttributeVO();
  background: any;
  logo = false;
  files: any[] = [];
  isLoad = false;
  previewurl: any;
  timezoneEmit: any;
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
  subdomain: any;
  isCustomeMenu = false;
  customMenuList: CustomMenuList[] = [];
  menuList: any[] = [];
  smsSection: SMSKeysVO[] = [];
  deleteKeys: any[] = [];
  showZone: boolean = false;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  @ViewChild('stepper') private myStepper: MatStepper;
  public config: PerfectScrollbarConfigInterface = {};
  screenHeight: string;
  screenHeight1: string;
  @Output() userData: EventEmitter<any> = new EventEmitter<any>();
  change: boolean =false;
  curnHide: boolean = true;
  newnHide: boolean = true;
  AuthAlign=['Yoroflow sign in','Sign in with Google','Sign in with Microsoft','Sign in with Microsoft Azure']

  constructor(private fb: FormBuilder, private service: OrganizationService, private orgService: CreateOrganizationService
    , private themesService: ThemesService, private taskPropertyService: TaskPropertyService
    , private snackBar: MatSnackBar, private dialog: MatDialog,
    public loadLogo: LoadLogoService, private userCustomAttributeService: UserCustomAttributeService, private sanitizer: DomSanitizer,
    private customMenuService: CustomMenuService, private roleservice: RolesService, public themeService: ThemeService, private roleService: UserRoleService, private userService: UserService) {
    this.valid = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadDynamicLayout();
  }

  isUpdateOrg = true;
  isMobileMenuPreference = false;
  isSmsKey = false;
  isCustomAttribute = false;
  isAllowAuthentication = false;
  isTwoFactorAuth = false;
  isEmailSettings = false;
  isSummaryReport = false;
  deletedEmailSettingIdList: any[] = [];
  emailSettingVoList: EmailSettingsVOList;
  twoFactorVo = new TwoFactorAuthentication();
  allowTwoFactorSave = true;
  marginStyle: any;
  show = true;
  isAutoSubscription = false;
  basic = true;
  standard = false;
  pro = false;
  readyForPayment = false;
  selectSubscription = true;
  doneStepper = false;
  enablePayment = false;
  enableDone = false;
  paymentSubscriptionDetails: any[] = [];
  subscribedPlanType: any;
  billingType: any;
  subsAmount: any;
  isSubscribed = false;
  isChangePlan = false;
  subscriptionDetails: any;
  stepperIndex = 0;
  planType4 = false;
  priceAmount = '';
  planType = '';
  totalPlanTypes: number;
  updateCustomerVo = new updateCustomerVO();
  customMenu = new customMenuVO();
  orgSmsKeys = new OrganizationSMSKeys();
  updateForm: FormGroup;
  groupList: GroupVO[] = [];
  isSubscription = false;
  rolesList: any;
  isAllowed = true;
  orgData: any;
  isShowSummary: boolean = false;
  isFreePlan: boolean;
  clientId:any=null;
  ngOnInit(): void {
    this.isFreePlan = JSON.parse(localStorage.getItem('isFreePlan'));
    if (this.loadLogo.previewUrl) {
      this.loadLogo.previewUrl = null;
    }
    const userRoles = this.roleService.getUserRoles();
    if (userRoles.includes('Account Administrator', 'Account Owner')) {
      this.isShowSummary = true;
    }
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    if (window.location.href.includes('subscription')) {
      this.isSubscription = true;
      this.initializeForm();
      this.service.getOrganizationInfo().subscribe(data => {
        this.customerVO = data;
        this.getPaymentSubscriptionDetails();
        this.autoSubscription();
      });

    } else {
      this.loadGroupsList();
      this.initializeForm();
      this.loadThemesList();
      this.getOrganizationInfo();
    }
    this.roleservice.getRolesList().subscribe(res => {
      this.rolesList = res;
    })
  }

  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1) + 'px';
    } else {
      this.screenHeight = (window.innerHeight - 72) + 'px';
      this.screenHeight1 = (window.innerHeight - 63) + 'px';
    }
  }

  loadGroupsList() {
    this.taskPropertyService.getGroupsList().subscribe(data => {
      this.groupList = data;
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
    this.isAllowed = true;
    this.isUpdateOrg = true;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
  }

  prferenceOpen() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
  }

  mobileMenuPreference() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = true;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
  }

  smsKeyMenagement() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = true;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
  }

  customAttributeList() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = true;
    this.isAutoSubscription = false;
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
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isAutoSubscription = true;
    this.isSummaryReport = false;
    this.setSubscriptionValues(this.subscriptionDetails);
  }

  allowAuthentication() {
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
    this.isAllowAuthentication = true;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
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
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = true;
    this.isEmailSettings = false;
    this.isSummaryReport = false;
  }

  emailSetting() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = true;
    this.isSummaryReport = false;
  }

  summaryReport() {
    this.isAllowed = true;
    this.isUpdateOrg = false;
    this.isMobileMenuPreference = false;
    this.isSmsKey = false;
    this.isCustomAttribute = false;
    this.isAutoSubscription = false;
    this.isAllowAuthentication = false;
    this.isTwoFactorAuth = false;
    this.isEmailSettings = false;
    this.isSummaryReport = true;
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
    this.orgService.getOrganizationEmailSettings(subdomainName).subscribe(data => {
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
    this.orgService.updateOrganizationEmailSettings(emailSettingsVo).subscribe(data => {
      if (data) {
        this.deletedEmailSettingIdList = [];
        this.getOrganizationEmailSettings(this.customerVO.subdomainName, true);
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Email Settings deleted sucessfully',
        });
      }
    });
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
    if (event.value) {
      this.setSubscriptionAmount(event.value + this.planType);
    }
  }

  setSubscriptionAmount(planType) {
    this.paymentSubscriptionDetails.forEach(details => {
      if (details.itemDescription === 'Price') {
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
    this.form.get('billingType').setValue(data.billingType);
    this.form.get('planType').setValue(data.planType);
    this.enablePlanTypeButton(data.planType);
    this.form.get('subscriptionAmount').setValue(data.subscriptionAmount);
    this.form.get('customerId').setValue(data.customerId);
    this.form.get('subscriptionId').setValue(data.subscriptionId);
    this.getPlanTypeAndBillingType(data);
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
    this.service.getPaymentSubscriptionDetails().subscribe(data => {
      if (data) {
        this.paymentSubscriptionDetails = data;
        this.paymentSubscriptionDetails.forEach(details => {
          if (details.itemDescription === 'Plan Type') {
            if (details.monthlyPlanType1 !== null) {
              this.totalPlanTypes = 1;
              this.form.get('planType').setValue(details.monthlyPlanType1);
            }
            if (details.monthlyPlanType2 !== null) {
              this.totalPlanTypes = 2;
            }
            if (details.monthlyPlanType3 !== null) {
              this.totalPlanTypes = 3;
            }
            if (details.monthlyPlanType4 !== null) {
              this.totalPlanTypes = 4;
            }
          }
          if (details.itemDescription === 'Price') {
            if (details.monthlyPlanType1 !== null) {
              this.form.get('subscriptionAmount').setValue(details.monthlyPlanType1);
            }
          }
        });
      }
    });
  }

  selectionChangeStepper(event) {
    if (event.selectedStep.label === 'plan') {
      this.goSubscription();
    }
    if (event.selectedStep.label === 'payment') {
      this.goPayment();
    }
    if (event.selectedStep.label === 'done') {
      this.stepperIndex = event.previouslySelectedIndex;
      this.myStepper.selectedIndex = event.previouslySelectedIndex;
    }
  }

  goPayment() {
    this.stepperIndex = 1;
    this.enablePayment = true;
    this.readyForPayment = true;
  }

  goSubscription() {
    this.stepperIndex = 0;
    this.selectSubscription = true;
    this.readyForPayment = false;
  }

  paymentSuccess(event) {
    if (event === true) {
      this.enableDone = true;
      this.readyForPayment = false;
      this.selectSubscription = false;
      this.doneStepper = true;
      this.myStepper.next();
    }
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
      defaultMenu: [],
      customMenuName: ['', [Validators.required]],
      displayName: ['', [Validators.required]],
    });
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

  getOrganizationInfo() {
    this.service.getOrganizationInfo().subscribe(data => {
      if (data) {
        this.customerVO = data;
        this.updateOrg();
        this.showZone = true;
      }
    });
  }

  updateOrg() {
    this.orgData = this.customerVO.timezone;
    this.initializeForm();
    this.getCustomAttributes(this.customerVO.subdomainName);
    this.loadAuthFormGroup(this.customerVO.subdomainName);
    this.getOrganizationEmailSettings(this.subdomainName, false);
    this.getOrganizationTwoFactor(this.customerVO.subdomainName);
    this.getCustomMenuList();
    this.loadSMSFormGroup(this.customerVO.subdomainName);
    this.getPaymentSubscriptionDetails();
    this.loadAllowedDomainNames();
    this.logo = true;
    this.isBackgroundLoad = true;
    this.loadLogo.previewUrl = this.customerVO.image;
    this.previewBackgroundImageUrl = this.customerVO.backgroundImage;
  }

  initializeForm() {
    this.form = this.fb.group({
      id: [this.customerVO.id],
      orgName: [this.customerVO.orgName, [Validators.required]],
      allowedDomainNames: [],
      subdomainName: [{ value: this.customerVO.subdomainName, disabled: true }, [Validators.required]],
      themeId: [this.customerVO.themeId],
      file: [''],
      addCustomAttribute: [false],
      customAttributeListVo: this.fb.array([]),
      deletedColumnIDList: [],
      organizationUrl: [this.customerVO.organizationUrl],
      backgroundImage: [this.customerVO.backgroundImage],
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
      deleteKeys: [],
      allowAuthentication: this.fb.array([]),
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
    });
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

  loadYoroflowAuth() {
    for (let i = 0; i < this.getAuthenticationFormArray().length; i++) {
      const group = (this.getAuthenticationFormArray().get('' + i) as FormGroup);
      if (group.get('authProvider').value === 'Yoroflow sign in') {
        group.get('isAuthProvider').setValue(true);
        group.get('isAuthProvider').disable();
      }
    }
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

  getAuthenticationFormArray() {
    return (this.form.get('allowAuthentication') as FormArray);
  }

  addAuth(providerName) {
    this.getAuthenticationFormArray().push(this.organizationAuthFormGroup(providerName));
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
    this.deleteKeys.push(deleteId);
    (this.form.get('organizationSmsKeys') as FormArray).removeAt(i);
    this.providerNameExsitCheck();
  }

  loadSMSFormGroup(subDomain) {
    this.service.getSMSKeys(subDomain).subscribe(data => {
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

  loadThemesList() {
    this.themesService.getThemesList().subscribe(data => {
      this.themesList = data[0];
    });
  }

  getUploaded($event) {
    if ($event === true) {
      this.form.markAsDirty();
      this.logo = true;
    }
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
    } else if (this.isTwoFactorAuth === true) {
      this.form.get('type').setValue('twoFactor');
    }
  }

  updateCustomerForm() {
    this.updateForm = this.fb.group({
      id: [],
      orgName: ['', [Validators.required]],
      subdomainName: ['', [Validators.required]],
      organizationUrl: [''],
      themeId: [],
    });
    this.updateForm.get('id').setValue(this.form.get('id').value);
    this.updateForm.get('orgName').setValue(this.form.get('orgName').value);
    this.updateForm.get('subdomainName').setValue(this.form.get('subdomainName').value);
    this.updateForm.get('organizationUrl').setValue(this.form.get('organizationUrl').value);
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
    let customerVO = new CustomerVO;
    customerVO.id = this.updateCustomerVo.id;
    customerVO.orgName = this.updateCustomerVo.orgName;
    customerVO.allowedDomainNames = this.updateCustomerVo.allowedDomainNames;
    customerVO.subdomainName = this.updateCustomerVo.subdomainName;
    customerVO.organizationUrl = this.updateCustomerVo.organizationUrl;
    customerVO.timezone = this.updateCustomerVo.timezone;
    customerVO.type = 'userUpdate';
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

  update(userForm) {
    if (this.isUpdateOrg === true) {
      this.updateCustomerForm();
      if (this.updateForm.valid) {
        this.updateCustomerVo.id = this.form.get('id').value;
        this.updateCustomerVo.orgName = this.form.get('orgName').value;
        this.updateCustomerVo.allowedDomainNames = this.getListFromPlaceHolder(this.allowedDomainNamesList);
        this.updateCustomerVo.subdomainName = this.form.get('subdomainName').value;
        this.updateCustomerVo.organizationUrl = this.form.get('organizationUrl').value;
        this.updateCustomerVo.timezone = this.timezoneEmit;
        this.updateCustomerVo.logo = this.getFile();
        this.orgService.updateOrganization(this.updateCustomerVo).subscribe(data => {

          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Organization updated sucessfully',
          });
        });
      }
    } else if (this.isMobileMenuPreference === true) {
      if (this.form.get('customMenuList').valid) {
        this.customMenu.customMenuList = this.form.get('customMenuList').value;
        this.customMenu.subdomainName = this.customerVO.subdomainName;
        this.orgService.updateMobileMenuPrferences(this.customMenu).subscribe(data => {
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
        for (let i = 0; i < formArray.length; i++) {
          const providerName = formArray.get('' + i).get('providerName').value;
          const secretToken = formArray.get('' + i).get('secretToken');
          const secretKey = formArray.get('' + i).get('secretKey');
          if (providerName === null || providerName === undefined || providerName === '') {
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
        if (!isTrue) {
          this.orgSmsKeys.organizationSmsKeys = this.form.get('organizationSmsKeys').value;
          this.orgSmsKeys.deleteKeys = this.deleteKeys;
          this.orgSmsKeys.subdomainName = this.customerVO.subdomainName;
          this.orgService.updateSmsKeys(this.orgSmsKeys).subscribe(data => {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Organization SMS keys updated sucessfully',
            });
          });
        }
      }
    } else if (this.isCustomAttribute === true) {
      if (this.form.get('customAttributeListVo').valid) {
        this.attributesVoList = this.form.get('customAttributeListVo').value;
        this.attributesVoList.deletedColumnIDList = this.deletedIdList;
        let attributesVO = new CustomAttributeVO();
        attributesVO.customAttributeListVo = this.form.get('customAttributeListVo').value;
        attributesVO.deletedColumnIDList = this.deletedIdList;
        attributesVO.subdomainName = this.customerVO.subdomainName;
        if (this.form.get('addCustomAttribute').value === false && this.getCustomAtrributeFormArray().length > 0) {
          for (let i = 0; i < this.getCustomAtrributeFormArray().length; i++) {
            this.removeAttributes(i);
            i = i - 1;
          }
        }
        this.orgService.updateAttributes(attributesVO).subscribe(data => {
          this.reset(userForm);
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
      subscriptionVO.subdomainName = this.customerVO.subdomainName;
      this.orgService.updateSubcription(subscriptionVO).subscribe(data => {
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
        allowAuthentication.subdomainName = this.subdomainName;
        this.isDisable = true;
        this.removeDomainValues();
        this.orgService.updateAuthMethod(allowAuthentication).subscribe(data => {
          this.allowedDomainNamesAuthList = [];
          this.loadAuthFormGroup(this.subdomainName);
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
        this.orgService.updateTwoFactor(this.twoFactorVo).subscribe(data => {
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

  removeDomainValues() {
    for (let i = 0; i < this.getAuthenticationFormArray().length; i++) {
      const index = '' + i;
      const authFormArray = (this.getAuthenticationFormArray().get(index) as FormGroup);
      authFormArray.get('allowedDomain').setValue([]);
      authFormArray.get('allowedDomain').setValidators(null);
      authFormArray.get('allowedDomain').updateValueAndValidity();
    }
  }

  setYoroflowValue(allowAuthentication) {
    allowAuthentication.authenticationArray.forEach(element => {
      if (element.authProvider === 'Yoroflow sign in') {
        element.isAuthProvider = true;
      }
    });
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
    const index = '' + i;
    const authFormArray = (this.getAuthenticationFormArray().get(index) as FormGroup);
    if ((authFormArray.get('authProvider').value === 'Yoroflow sign in')) {
      authFormArray.get('isAuthProvider').setValue(true);
      // authFormArray.get('isAuthProvider').disable();
    }
    return values;
  }

  save(userForm) {
    this.removeFormArray();
    this.setType();
    if (userForm.valid) {
      if (this.form.get('addCustomAttribute').value === false && this.getCustomAtrributeFormArray().length > 0) {
        for (let i = 0; i < this.getCustomAtrributeFormArray().length; i++) {
          this.removeAttributes(i);
          i = i - 1;
        }
      }
      this.isDisable = true;
      this.customerVO = this.form.getRawValue();
      this.attributesVoList = this.form.get('customAttributeListVo').value;
      this.attributesVoList.deletedColumnIDList = this.deletedIdList;
      this.form.get('deleteKeys').setValue(this.deleteKeys);
      this.customerVO.allowedDomainNames = this.getListFromPlaceHolder(this.allowedDomainNamesList);
      this.customerVO.logo = this.getFilesAndJsonFormData();
      this.service.createOrganization(this.customerVO, this.form.get('type').value).subscribe(
        data => {
          if (data !== null) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            if (!data.response.includes('subdomain')) {
              this.isDisable = false;
            }
            this.deleteKeys = [];
          }
        },
        error => {
          this.isDisable = false;
        });
    }
  }

  setThemeId(themeId, event) {
    if (event.isUserInput === true) {
      this.form.get('themeId').setValue(themeId);
    }
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
    saveFiles.push(this.saveFile(this.loadLogo.previewUrl, 'uploadLogo'));
    saveFiles.push(this.saveFile(this.previewBackgroundImageUrl, 'uploadBackgroudImage'));
    const formData = new FormData();
    formData.append('data', JSON.stringify(this.form.getRawValue()));
    formData.append('custom-attribute', JSON.stringify(this.form.getRawValue()));
    if (saveFiles.length > 0) {
      saveFiles.forEach(file => {
        formData.append('file', file);
      });
    }
    return formData;

  }

  transform() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.previewBackgroundImageUrl);
  }

  getListFromPlaceHolder(list: Placeholder[]): string[] {
    const values = [];
    list.forEach(placeholder => values.push(placeholder.name));

    return values;
  }

  reset(userForm) {
    this.showZone = false;
    this.userData.emit(this.updateCustomerVo.timezone)
    this.isDisable = false;
    this.show = true;
    this.loadLogo.previewUrl = null;
    this.previewBackgroundImageUrl = null;
    this.uploadAction = 'upload';
    this.allowedDomainNamesList = [];
    this.menuList = [];
    userForm.resetForm();
    this.getOrganizationInfo();
    this.deleteKeys = [];
  }



  addOrgAttributes($event) {
    if ($event.checked === true && this.getCustomAtrributeFormArray().length === 0) {
      this.addAttributes();
    }
  }

  getCustomAttributes(subdomainName) {
    this.userCustomAttributeService.getOrgCustomattributesDetailsForOrganization(subdomainName).subscribe(data => {
      this.attributesVoList.customAttributeListVo = data;
      if (this.attributesVoList.customAttributeListVo.length > 0) {
        this.form.get('addCustomAttribute').setValue(true);
      }
      this.loadVariableForm(this.attributesVoList.customAttributeListVo);
    });
  }

  loadAuthFormGroup(subDomain) {
    this.subdomainName = subDomain;
    this.orgService.getAuthenticationDetailsOrg(subDomain).subscribe(data => {
      if (data && data !== null) {
        this.loadAuthFormGroupValues(data);
      }
    });
  }

  loadAuthFormGroupValues(data) {
    const arrayFields: AuthenticationArray[] = [];
    this.AuthAlign.forEach(pack => {

      arrayFields.push(data.authenticationArray.find(t => t.authProvider === pack));
     });
    
    for (let i = 0; i < arrayFields.length; i++) {
      const index = '' + i;
      const authFormArray = (this.getAuthenticationFormArray().get(index) as FormGroup);
      // authFormArray.get('allowedDomain').setValue([]);
      authFormArray.patchValue(arrayFields[i]);
      authFormArray.get('allowedDomain').setValidators(null);
      authFormArray.get('allowedDomain').updateValueAndValidity();
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
        // authFormArray.get('isAuthProvider').disable();
      }
      if (authFormArray.get('allowedDomain').value !== null
      && authFormArray.get('authProvider').value !== 'Sign in with Microsoft Azure'
       && authFormArray.get('allowedDomain').value !== '') {
        const domainArray: any[] = authFormArray.get('allowedDomain').value;
        this.loadAllowedDomainNamesForAuth(domainArray, i);
        authFormArray.get('allowedDomain').setValue([]);
        authFormArray.get('allowedGroup').setValidators(null);
        authFormArray.get('allowedGroup').updateValueAndValidity();
      }
    }
  }

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



  getOrganizationTwoFactor(subdomainName) {
    this.service.getTwoFactorOrganization(subdomainName).subscribe(data => {
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

  loadVariableForm(list: CustomAttributeListVO[]) {
    if (list) {
      this.loadVariables = false;
      for (let i = 0; i < list.length; i++) {
        this.addAttributes();
        list[i].name = list[i].name.split('_')[1];
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

}
