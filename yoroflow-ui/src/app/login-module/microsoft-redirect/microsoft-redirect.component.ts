import { Component, Inject, OnInit } from '@angular/core';
import { GoogleAuthVo, LoginVO } from '../login-vo';
import { UserService } from '../../engine-module/shared/service/user-service';
import { Router } from '@angular/router';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { QrSetupComponent } from 'src/app/engine-module/qr-setup/qr-setup.component';
import { filter } from 'rxjs/operators';
import { YoroFlowConfirmationDialogComponent } from 'src/app/engine-module/yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';

@Component({
  selector: 'app-microsoft-redirect',
  templateUrl: './microsoft-redirect.component.html',
  styleUrls: ['./microsoft-redirect.component.scss']
})
export class MicrosoftRedirectComponent implements OnInit {

  constructor(
    private snackBar: MatSnackBar, 
    public service: UserService, private router: Router, private dialog: MatDialog) { }


  loginVO = new LoginVO();
  codes: any;
  otpVerified = false;
  twoFactor = false;
  arrOfStr: any[] = [];
  URL: any[] = [];
  domain: any;
  subdomain: any;
  ngOnInit(): void {
    this.twoFactor = this.service.hasTwoFactor;
    this.subdomain = this.service.subDomain;
    this.authenticateByMicrosoft();
  }

  authenticateByMicrosoft() {
    /*
    this.authService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest).subscribe((payload: AuthenticationResult) => {


      // this.msalBroadcastService.msalSubject$
      // .pipe(
      // 	filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
      // 	// takeUntil(this._destroying$)
      // )
      // .subscribe((result: EventMessage) => {
      // const payload = result.payload as AuthenticationResult;
      this.authService.instance.setActiveAccount(payload.account);
      const googleAuthVo = new GoogleAuthVo();
      googleAuthVo.tokenId = payload.accessToken;
      googleAuthVo.email = payload.account?.username;

      this.service.checkMicrosoftUser(googleAuthVo).subscribe(data => {
        if (data && data.validUser) {
          this.loginVO.userType = 'Microsoft';
          this.loginVO.password = data.tokenId;
          this.loginVO.username = data.email;
          this.addQr();
        } else if (data && data.email === 'invalid') {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: this.getSnackbarMessageForDomain(this.loginVO.username) + ' domain name is not allowed, please ask admin to give permission',
          });
        }
      },
        error => {
          this.routeLoginPage();
        });
    });
    */
}

// addQr() {
//   if (this.twoFactor) {
//     this.service.checkQr(this.loginVO.username).subscribe(data => {
//       if (data !== undefined && data.response === 'valid' && data.disable === true) {
//         this.getOtpValue();
//       } else if (data !== undefined && data.response === 'valid' && data.disable === false) {
//         this.service.userLoginForQr(this.loginVO).subscribe(login => {
//           if (login && login.response === 'valid') {
//             this.setUpQr();
//           } else {
//             this.routeLoginPage();
//           }
//         });
//       } else if (data !== undefined && data.response === 'invalid') {
//         this.routeLoginPage();
//       }
//     },
//       error => {
//         this.routeLoginPage();
//       });
//   } else {
//     this.loginUser();
//   }
// }

setUpQr() {
  const dialogRef = this.dialog.open(QrSetupComponent, {
    disableClose: true,
    data: { data: 'qr-setup', userName: this.loginVO.username },
    width: '600px',
  });
  dialogRef.afterClosed().subscribe(otp => {
    if (otp && otp.login === true) {
      this.otpVerified = true;
      this.codes = otp.codes;
      this.loginUser();
    } else {
      this.routeLoginPage();
    }
  });
}

getOtpValue() {
  const dialogRef = this.dialog.open(QrSetupComponent, {
    disableClose: true,
    data: { data: 'otp-check' },
    width: '300px',
  });
  dialogRef.afterClosed().subscribe(otp => {
    if (otp && otp.form.enterOtp !== '' && otp.form.enterOtp !== null) {
      this.loginVO.otpNumber = otp.form.enterOtp;
      this.loginUser();
    } else {
      // this.isDisable = false;
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
      }
      this.routeLoginPage();
    }
  });
}

loginUser() {
  this.loginVO.hasTwofactor = this.twoFactor;
  if (this.otpVerified === true) {
    this.loginVO.hasTwofactor = false;
  }
  this.service.userLogin(this.loginVO).subscribe(data => {
    if (data.message === 'invalid') {
      this.routeLoginPage();
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
    this.routeLoginPage();
  });
}

allowLogin(data) {
  // this.arrOfStr = window.location.href.split('//', 2);
  // if (window.location.href.includes('localhost')) {
  //   this.arrOfStr = ['http', 'yorosis.yoroflow.com'];
  // }
  // this.URL = this.arrOfStr[1].split('.', 2);
  // this.domain = this.URL[0];
  if (this.domain === this.domain) {
    // this.isDisable = true;
    // this.valid = false;
    localStorage.setItem('token', 'Bearer ' + data.token);
    this.service.checkCustomAttribute().subscribe(response => {
      if (response.response === 'Continue') {
        this.routeLandingOrTaskPage();
      } else {
        const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
          disableClose: true,
          data: { data: 'saveAttribute' },
          width: '1500px',
        });
        dialogRef.afterClosed().subscribe(attribute => {
          if (attribute === true) {
            this.routeLandingOrTaskPage();
          } else {
            // this.isDisable = false;
            if (localStorage.getItem('token')) {
              localStorage.removeItem('token');
            }
            this.routeLoginPage();
          }
        });
      }
    });
  } else {
    this.routeLoginPage();
  }
}

routeLandingOrTaskPage() {
  if (window.location.href.includes('localhost')) {
    this.router.navigate(['/my-pending-task']);
    } else {
      window.location.href = 'https://' + this.subdomain + '.yoroflow.com/my-pending-task';
    }
}

routeLoginPage() {
  if (window.location.href.includes('localhost')) {
    this.router.navigate(['/login']);
    } else {
      window.location.href = 'https://' + this.subdomain + '.yoroflow.com/login';
    }
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

}
