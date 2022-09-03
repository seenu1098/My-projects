
import { Component, OnInit, ViewChild, ElementRef, Inject, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { GoogleAuthVo, LoginVO, MicrosoftLoginDetails, QrDetailsVo } from './login-vo';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot, ActivatedRoute, RouterEvent, NavigationEnd } from '@angular/router';
import { UserService } from '../engine-module/shared/service/user-service';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { YoroFlowConfirmationDialogComponent } from '../engine-module/yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';

import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../shared-module/snackbar/snackbar.component';

import { MediaMatcher } from '@angular/cdk/layout';
import { interval, Observable, Subject, Subscription } from 'rxjs';
import { QrSetupComponent } from '../engine-module/qr-setup/qr-setup.component';

import { GoogleAuthenticationServiceService } from './google-authentication-service.service';
import { MicrosoftAuthenticationService } from './microsoft-authentication.service';
import { colorSets } from '@swimlane/ngx-charts';
import { ErrorInterceptor } from '../services/core/http/error-interceptor';
import decode from 'jwt-decode';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { CreateDialogService } from '../workspace-module/create-dialog/create-dialog.service';
import { WorkspaceService } from '../workspace-module/create-dialog/workspace.service';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { CreateOrganizationService } from '../creation-module/create-organization/create-organization.service';
import { MicrosoftAuthReturnService } from './microsoft-auth-return/microsoft-auth-return.service';
import { IntegrateApplicationService } from '../taskboard-module/integrate-application/integrate-application.service';

/** @dynamic */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginVO = new LoginVO();
  valid: boolean;
  hide = true;
  redirectUrl: string;
  previousUrl: string;
  isDisable = false;
  logo: any;
  imageUrl: any;
  arrOfStr: any[] = [];
  URL: any[] = [];
  domain: any;
  subdomain: any;
  subDomain: any;
  orgName: string;
  mobileQuery: MediaQueryList;
  ipadResolution: MediaQueryList;
  imageFlex: any;
  loginFlex: any;
  height: any;
  qrUrl: any;
  hasqr = false;
  twoFactor = false;
  isGoogle = false;
  otpVerified = false;
  isMicrosoft = false;
  isAzure = false;
  azureClientId: any;
  hasGoogleSignIn = false;
  hasMicrosoftSignIn = false;
  googleError = false;
  microsoftError = false;
  codes: any;
  user: any;
  isIframe = false;
  loginDisplay = false;
  isSignIn = false;
  screenHeight: any;
  microsoftAccount: any;
  autoRenevMicrosoftToken: any;
  twoFactorMethods: string[];
  twoFactorMethod: string;
  private _mobileQueryListener: () => void;
  termsConditions: any;
  private readonly _destroying$ = new Subject<void>();
  backgroundImage = '';
  customerId: any;
  isFreePlan = false;
  constructor(private fb: FormBuilder, public service: UserService, private router: Router
    , public route: ActivatedRoute, private dialog: MatDialog,
    private googleAuthenticationServiceService: GoogleAuthenticationServiceService,
    @Inject(DOCUMENT) private document: Document, private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private microsoftAuthenticationService: MicrosoftAuthenticationService,
    private worksapceService: WorkspaceService,
    private createOrganizationService: CreateOrganizationService,
    private appIntegrationService: IntegrateApplicationService) {
    // const code = this.route.snapshot.queryParams.code as string;
    // if (code !== null && code !== '') {
    //   window.location.href = `https://india.yoroflow.com/en/?token=code`;
    // }
    // window.close();
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.ipadResolution = media.matchMedia('(max-width:823px)');
    this._mobileQueryListener = () => {
      changeDetectorRef.detectChanges();
      this.resolutionChanges();
    };
    this.resolutionChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.ipadResolution.addListener(this._mobileQueryListener);
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = window.innerHeight + 'px';
  }

  ngOnInit() {

    this.screenHeight = window.innerHeight + 'px';

    interval(500).subscribe((val) => {
      this.height = Math.round(window.innerHeight) + 'px';
    });
    this.loadOnInit();
    // const token = this.route.snapshot.queryParams.code;
    // if (this.microsoftAuthReturnService.fromMicrosoft) {
    //   this.removeRedirectUrls();
    //   this.microsoftAuthReturnService.setMicrosoftTokenDetailsLoggedIn();
    //   let microsoftLoginDetails = new MicrosoftLoginDetails();
    //   microsoftLoginDetails = this.microsoftAuthReturnService.microsoftLoginDetails;
    //   this.subDomain = microsoftLoginDetails.subdomain;
    //   this.twoFactor = microsoftLoginDetails.hasTwofactor;
    //   this.signInUsingMicrosoft(JSON.parse(this.microsoftAuthReturnService.microsoftToken));
    //   // let microsoftLoginDetails = new MicrosoftLoginDetails();
    //   // microsoftLoginDetails = JSON.parse(localStorage.getItem('microsoftLoginDetails'));
    //   // if (microsoftLoginDetails.microsoftLoginInProcess === true) {
    //   //   this.loadMicrosoftLogin();
    //   // } else if (microsoftLoginDetails.microsoftLoginInProcess === false && localStorage.getItem('microsoftTokenDetails')) {
    //   //   this.signInUsingMicrosoft(JSON.parse(localStorage.getItem('microsoftTokenDetails')));
    //   // } else {
    //   //   this.loadOnInit();
    //   // }
    // } else {
    //   this.loadOnInit();
    // }
  }

  removeRedirectUrls() {
    if (localStorage.getItem('lastRedirectUrl')) {
      localStorage.removeItem('lastRedirectUrl');
    }
    if (localStorage.getItem('redirectSubdomainName')) {
      localStorage.removeItem('redirectSubdomainName');
    }
  }

  loadOnInit() {
    if (localStorage.getItem('microsoftLoginDetails') && localStorage.getItem('microsoftTokenDetails')) {
      localStorage.removeItem('microsoftLoginDetails');
      localStorage.removeItem('microsoftTokenDetails');
    }
    if (window.location.href.includes('id.yoroflow.com/en/login') || window.location.href.includes('/domain')) {
      this.router.navigate(['/domain']);
    }
    if (localStorage.getItem('token')) {
      this.router.navigate(['/loading']);
      // localStorage.removeItem('token');
    }
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    if (window.location.href.includes('yoroflow.com')) {
      this.arrOfStr = window.location.href.split('//', 2);
      this.URL = this.arrOfStr[1].split('.', 2);
      this.subDomain = ' ' + this.URL[0];
    }
    this.service.getCustomerLogo().subscribe(data => {
      if (data) {
        this.orgName = data.responseId;
        if (data.response && !data.response.includes('Customer has no logo')) {
          this.imageUrl = data.response;
        }
        if (data.backgroundImage && !data.backgroundImage.includes('Customer has no background image')) {
          this.logo = 'url' + '(' + data.backgroundImage + ')';
        } else {
          this.logo = 'url(\'../../assets/yoro-y-logo.png\')';
        }
        if (data.disable) {
          this.twoFactor = data.disable;
          this.twoFactorMethods = data.twoFactorMethods;
        }
        if (data.google) {
          this.isGoogle = data.google;
        }
        if (data.microsoft) {
          this.isMicrosoft = data.microsoft;
        }
        if (data.azure) {
          this.isAzure = data.azure;
          this.azureClientId = data.clientId;
        }
      }
    });
    this.googleAuthenticationServiceService.getSignInDetails().subscribe(user => {
      this.user = user;
      if (this.user !== null && this.isSignIn) {
        const googleAuthVo = new GoogleAuthVo();
        googleAuthVo.tokenId = this.user.vc.access_token;
        // const tokenPayload = decode(this.user.id_token);
        // if (tokenPayload) {
        //   googleAuthVo.email = tokenPayload?.email;
        // }
        googleAuthVo.email = this.user.yu.nv;
        localStorage.setItem('authType', 'Google');
        this.service.checkGoogleUser(googleAuthVo).subscribe(data => {
          if (data && data.validUser && !this.hasGoogleSignIn) {
            this.hasGoogleSignIn = true;
            this.loginVO.userType = 'Google';
            this.loginVO.password = data.tokenId;
            this.loginVO.username = data.email;
            this.addQr();
          } else if (data && data.email === 'invalid') {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Please reach out to your administrator as only restricted group of people are allowed to login'
              
              ,
            });
          }
        },
          error => {
            this.isDisable = false;
            this.valid = true;
            this.hasGoogleSignIn = false;
          });
      } else if (this.isSignIn) {
        this.googleError = true;
      }
    });
  }

  getPlan() {
    this.createOrganizationService.getOrgSubscription().subscribe(results => {
      if (results.planType === 'STARTER') {
        localStorage.setItem('isFreePlan', 'true');
      } else {
        localStorage.setItem('isFreePlan', 'false');
      }
    });
  }

  getSnackbarMessageForDomain(data) {
    let arrOfStr: any[] = [];
    let redirectUrlString = '';
    arrOfStr = (data.split('@', 2));
    if (redirectUrlString === '') {
      redirectUrlString = arrOfStr[1];
    }
    return redirectUrlString;
  }

  resolutionChanges() {
    if (this.mobileQuery.matches) {
      this.loginFlex = '100';
    } else if (this.ipadResolution.matches) {
      this.imageFlex = '50';
      this.loginFlex = '50';
    } else {
      this.imageFlex = '70';
      this.loginFlex = '30';
    }
  }

  transformImage() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.imageUrl);
  }

  transformImageQr() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.qrUrl);
  }

  changeUrl() {
    window.location.href = 'https://id.yoroflow.com/en/domain';
  }

  submitForm($event) {
    this.loginVO = this.loginForm.value;
    this.loginVO.recaptchaResponse = $event;
    this.microsoftError = false;
    if (this.loginForm.valid) {
      localStorage.setItem('authType', 'Yoroflow');
      this.valid = false;
      this.isDisable = true;
      const otpVo = new QrDetailsVo();
      otpVo.userName = this.loginVO.username;
      // if (window.location.href.includes('localhost')) {
      //   this.loginUser();
      // } else {
      // }
      // this.loginUser();
      this.getQrByMethod(otpVo);
    }
    this.valid = false;
  }

  getQrByMethod(otpVo: QrDetailsVo) {
    this.service.checkQr(otpVo).subscribe(data => {
      if (data.isPayingCustomer === 'Y') {
        if (data.adminOrBillingRole === true) {
          if (data.subscriptionExpired === true) {
            // const dialogRef = this.dialog.open(ErrorDialogComponent, {
            //   disableClose: false,
            //   data: {
            //     data: 'Your subscription is expired, please upgrade your plan or contact yorosis support team(support@yoroflow.com) for further proceedings',
            //     type: 'subscription'
            //   },
            //   width: '750px',
            // });
            this.customerId = data.customerId;
            this.service.userLogin(this.loginVO).subscribe(data => {
              if (data && data.token && this.customerId) {
                localStorage.setItem('token', 'Bearer ' + data.token);
                this.router.navigate(['/subscription-expire', otpVo.userName, this.customerId]);
              }
            });
          } else {
            if (data.remainingDays < 15 && data.remainingDays > 0) {
              const dialogRef = this.dialog.open(ErrorDialogComponent, {
                disableClose: false,
                data: {
                  data: 'Your subscription is expired, you have remaining ' + data.remainingDays + ' day(s) then you will not be able to login,so please upgrade your plan or contact yorosis support team(support@yoroflow.com) for further proceedings',
                  type: 'subscription'
                },
                width: '750px',
              });
              this.callCheckQr(data);
            } else if (data.remainingDays === 0 || data.remainingDays < 0) {
              // const dialogRef = this.dialog.open(ErrorDialogComponent, {
              //   disableClose: false,
              //   data: {
              //     data: 'Your subscription is expired, please upgrade your plan or contact yorosis support team(support@yoroflow.com) for further proceedings',
              //     type: 'subscription'
              //   },
              //   width: '750px',
              // });
              this.customerId = data.customerId;
              this.service.userLogin(this.loginVO).subscribe(data => {
                if (data && data.token && this.customerId) {
                  localStorage.setItem('token', 'Bearer ' + data.token);
                  this.router.navigate(['/subscription-expire', otpVo.userName, this.customerId]);
                }
              });
            } else {
              this.callCheckQr(data);
            }
          }
        } else if (data.adminOrBillingRole === false) {
          if (data.subscriptionExpired === true) {
            const dialogRef = this.dialog.open(ErrorDialogComponent, {
              disableClose: false,
              data: {
                data: 'Your subscription is expired, please upgrade your plan or contact yorosis support team(support@yoroflow.com) for further proceedings',
                type: 'subscription'
              },
              width: '750px',
            });
            this.isDisable = false;
          } else if (data.subscriptionExpired === false) {
            this.callCheckQr(data);
          }
        }
      } else {
        if (data.subscriptionExpired === true) {
          // const dialogRef = this.dialog.open(ErrorDialogComponent, {
          //   disableClose: false,
          //   data: {
          //     data: 'Your trial period is ended, please contact your administrator or yorosis support team(support@yoroflow.com) for further proceedings',
          //     type: 'trial'
          //   },
          //   width: '750px',
          // });
          this.customerId = data.customerId;
          this.service.userLogin(this.loginVO).subscribe(data => {
            if (data && data.token && this.customerId) {
              localStorage.setItem('token', 'Bearer ' + data.token);
              this.router.navigate(['/subscription-expire', otpVo.userName, this.customerId]);
            }
          });
        } else if (data.subscriptionExpired === false) {
          this.callCheckQr(data);
        }
      }
    },
      errors => {
        this.isDisable = false;
        this.valid = true;
      });


  }

  callCheckQr(data) {
    if (data !== undefined && data.response === 'valid' && (data.otpProvider) !== null
      && data.disable === true) {
      this.twoFactorMethod = data.otpProvider;
      this.getOtpValue();
    } else if (data !== undefined && data.response === 'valid' && data.twoFactorMethods !== null && data.disable === false) {
      this.twoFactorMethods = data.twoFactorMethods;
      this.service.userLoginForQr(this.loginVO).subscribe(login => {
        if (login && login.response === 'valid') {
          if (this.twoFactorMethods.length === 1) {
            this.twoFactorMethod = this.twoFactorMethods[0];
            this.setUpQr();
          } else {
            this.selectQr();
          }
        } else {
          this.isDisable = false;
          this.valid = true;
        }
      },
        error => {
          this.isDisable = false;
          this.valid = true;
        });
    } else if (data !== undefined && data.response === 'invalid') {
      this.loginUser();
    } else {
      this.isDisable = false;
    }
  }

  selectQr() {
    const dialogRef = this.dialog.open(QrSetupComponent, {
      disableClose: true,
      data: { data: 'qr-method', userName: this.loginVO.username, twoFactorMethods: this.twoFactorMethods },
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(otp => {
      if (otp !== null && otp !== false) {
        this.twoFactorMethod = otp;
        this.setUpQr();
      } else {
        this.isDisable = false;
      }
    });
  }

  addQr() {
    const otpVo = new QrDetailsVo();
    otpVo.userName = this.loginVO.username;
    // otpVo.otpProvider = this.twoFactorMethods[0];
    // this.twoFactorMethod = this.twoFactorMethods[0];
    this.getQrByMethod(otpVo);
  }

  setUpQr() {
    if (this.twoFactorMethod === 'Email Authenticator') {
      this.emailAuthenticator();
    } else {
      const dialogRef = this.dialog.open(QrSetupComponent, {
        disableClose: true,
        data: { data: 'qr-setup', userName: this.loginVO.username, twoFactorMethod: this.twoFactorMethod },
        width: '600px',
      });
      dialogRef.afterClosed().subscribe(otp => {
        if (otp && otp.login === true) {
          this.otpVerified = true;
          this.codes = otp.codes;
          this.loginUser();
        } else {
          this.isDisable = false;
          this.router.navigate(['/login']);
        }
      });
    }
  }

  emailAuthenticator() {
    const otpVo = new QrDetailsVo();
    otpVo.userName = this.loginVO.username;
    otpVo.otpProvider = this.twoFactorMethod;
    otpVo.secret = '';
    this.service.checkEmailQr(otpVo).subscribe(emailQr => {
      if (emailQr.otp !== null) {
        const dialogRef = this.dialog.open(QrSetupComponent, {
          disableClose: true,
          data: { data: 'email-qr', userName: this.loginVO.username, otpKey: emailQr.otp, contactEmail: emailQr.qrImageUrl },
          width: '400px',
        });
        dialogRef.afterClosed().subscribe(otp => {
          if (otp === true) {
            this.otpVerified = true;
            this.loginUser();
          } else {
            this.isDisable = false;
          }
        });
      } else {
        this.isDisable = false;
      }
    },
      error => {
        this.isDisable = false;
      });
  }

  getOtpValue() {
    if (this.twoFactorMethod === 'Email Authenticator') {
      this.emailAuthenticator();
    } else {
      const dialogRef = this.dialog.open(QrSetupComponent, {
        disableClose: true,
        data: { data: 'otp-check', otpProvider: this.twoFactorMethod, from: 'login' },
        width: '350px',
      });
      dialogRef.afterClosed().subscribe(otp => {
        if (otp && otp.form.enterOtp !== '' && otp.form.enterOtp !== null) {
          this.loginVO.otpNumber = otp.form.enterOtp;
          this.twoFactor = true;
          this.loginUser();
        } else {
          this.isDisable = false;
          // localStorage.setItem('token', '');
          this.router.navigate(['/login']);
        }
      });
    }
  }

  loginUser() {
    this.loginVO.hasTwofactor = this.twoFactor;
    if (this.otpVerified === true) {
      this.loginVO.hasTwofactor = false;
    }
    this.service.userLogin(this.loginVO).subscribe(data => {
      if (data.message === 'invalid') {
        this.isDisable = false;
        this.valid = true;
      } else {
        if (this.codes && this.codes !== null) {
          const dialogRef = this.dialog.open(QrSetupComponent, {
            disableClose: true,
            data: { data: 'recovery-code', codes: this.codes },
            width: '450px',
          });
          dialogRef.afterClosed().subscribe(otp => {
            this.allowLogin(data);
          });
        } else {
          this.allowLogin(data);
        }
      }
    }, error => {
      this.isDisable = false;
      this.valid = true;
    });
  }


  allowLogin(data) {
    this.arrOfStr = window.location.href.split('//', 2);
    if (window.location.href.includes('localhost')) {
      this.arrOfStr = ['http', 'india.yoroflow.com'];
    }
    this.URL = this.arrOfStr[1].split('.', 2);
    this.domain = this.URL[0];
    this.subdomain = data.subDomainName.split('.', 2);
    if (this.domain === this.subdomain[0]) {
      this.isDisable = true;
      this.valid = false;
      if (data.termsAndConditionsAccepted === false) {
        localStorage.setItem("InitialTour", 'true');
        const dialogRef = this.dialog.open(TermsConditionsComponent, {
          disableClose: true,
          width: '26%'
        });

        dialogRef.afterClosed().subscribe(termsData => {
          if (termsData === 'accepted') {
            localStorage.setItem('token', 'Bearer ' + data.token);
            this.getPlan();
            this.service.acceptTerms().subscribe(res => {
              if (res) {
                // this.customAttribute();
                this.router.navigate(['/loading']);
              }
            }, error => {
              localStorage.clear();
              this.router.navigate(['/login']);
            });
          } else {
            this.isDisable = false;
            this.hasGoogleSignIn = false;
            this.hasMicrosoftSignIn = false;
          }
        });
      } else {
        localStorage.setItem('token', 'Bearer ' + data.token);
        this.getPlan();
        // this.customAttribute();
        this.router.navigate(['/loading']);
      }

    } else {
      this.isDisable = false;
      this.hasGoogleSignIn = false;
      this.hasMicrosoftSignIn = false;
      this.valid = true;
    }
  }
  customAttribute() {
    this.service.checkCustomAttribute().subscribe(response => {
      if (response.response === 'Continue') {
        this.worksapceService.getDefaultWorksapce('fromLogin');
        // this.router.navigate(['/landing-dashboard']);
      } else {
        const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
          disableClose: true,
          data: { data: 'saveAttribute' },
          width: '1500px',
        });
        dialogRef.afterClosed().subscribe(attribute => {
          if (attribute === true) {
            this.worksapceService.getDefaultWorksapce('fromLogin');
            // this.router.navigate(['/landing-dashboard']);
          } else {
            this.isDisable = false;
            if (localStorage.getItem('token')) {
              localStorage.removeItem('token');
            }
            this.router.navigate(['/login']);
          }
        });
      }
    });
  }

  authenticate() {
    this.isSignIn = true;
    this.microsoftError = false;
    this.googleAuthenticationServiceService.signIn();
  }

  authenticateByMicrosoft() {
    this.microsoftError = false;
    this.appIntegrationService.integrateWithApp('c9531d0e-4df8-4535-9397-c3a62e710d4d', this.isAzure === true ? this.azureClientId : null);
    this.appIntegrationService.windowClosedEmitter.subscribe(data => {
      if (data) {
        localStorage.setItem('authType', 'Microsoft');
        this.service.checkMicrosoftUser(JSON.parse(localStorage.getItem('userDetails'))).subscribe(data => {
          if (data && data.validUser && !this.hasMicrosoftSignIn) {
            this.hasMicrosoftSignIn = true;
            // this.microsoftAuthenticationService.getTimerValue(res);
            this.loginVO.userType = 'Microsoft';
            this.loginVO.password = data.tokenId;
            this.loginVO.username = data.email;
            this.addQr();
          } else if (data && data.email === 'invalid') {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Please reach out to your administrator as only restricted group of people are allowed to login'
            });
          } else if (data && data.tokenId === 'Failed') {
            this.isDisable = false;
            // this.valid = true;
            this.microsoftError = true;
            this.hasMicrosoftSignIn = false;
          }
          localStorage.removeItem('userDetails');
        },
          error => {
            this.isDisable = false;
            // this.valid = true;
            this.microsoftError = true;
            this.hasMicrosoftSignIn = false;
          });
      } else {
        this.isDisable = false;
        // this.valid = true;
        this.microsoftError = true;
        this.hasMicrosoftSignIn = false;
      }
    });
  }


  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

}

