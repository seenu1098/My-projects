
import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../shared/service/user-service';

@Component({
  selector: 'app-login-initial',
  templateUrl: './login-initial.component.html',
  styleUrls: ['./login-initial.component.scss']
})
export class LoginInitialComponent implements OnInit {
  domainForm: FormGroup;
  mobileQuery: MediaQueryList;
  ipadResolution: MediaQueryList;
  imageFlex: any;
  loginFlex: any;
  height: any;
  screenHeight: any;

  private _mobileQueryListener: () => void;
  constructor(private fb: FormBuilder, private router: Router, private userService: UserService,changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia("(max-width: 600px)");
    this.ipadResolution = media.matchMedia("(max-width:823px)");
    this._mobileQueryListener = () => {
      changeDetectorRef.detectChanges();
      this.resolutionChanges();
    }
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
    this.domainForm = this.fb.group({
      domain: ['', Validators.required],
    });
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

  loginPage() {
    if (this.domainForm.get('domain').value !== null
      && this.domainForm.get('domain').value !== undefined && this.domainForm.get('domain').value !== '') {
       window.location.href = 'https://' + this.domainForm.get('domain').value + '.yoroflow.com/en/login';
    }
  }

}
