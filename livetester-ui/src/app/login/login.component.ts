import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { LoginVO } from './login-vo';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/service/user-service';

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
  isExternalLogin = false;


  constructor(private route: ActivatedRoute, private fb: FormBuilder, private service: UserService, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      let token = params['ID'];
      if (token) {
        this.isExternalLogin = true;
        this.service.loginWithExternalToken(token).subscribe(data => {
          if (data) {
            if (data.result === 'success' && data.token) {
              const jwtData = data.token.split('.')[1];
              const decodedJwtJsonData = window.atob(jwtData);
              const decodedJwtData = JSON.parse(decodedJwtJsonData);
              localStorage.setItem('token', 'Bearer ' + data.token);
              localStorage.setItem('role', decodedJwtData.scopes);
              this.router.navigate(['/list-template']);
            } else if (data.message === 'error') {
              this.router.navigate(['/login']);
            }
          }
        })
      } else {
        this.isExternalLogin = false;
        this.service.logout();
        this.router.navigate(['/login']);

        this.loginForm = this.fb.group({
          username: ['', Validators.required],
          password: ['', Validators.required]
        });
      }
    });
  }
  submitForm() {
    this.loginVO = this.loginForm.value;
    if (this.loginForm.valid) {
      this.service.userLogin(this.loginVO).subscribe(data => {
        const jwtData = data.token.split('.')[1];
        const decodedJwtJsonData = window.atob(jwtData);
        const decodedJwtData = JSON.parse(decodedJwtJsonData);
        localStorage.setItem('token', 'Bearer ' + data.token);
        localStorage.setItem('role', decodedJwtData.scopes);

        this.router.navigate(['/list-template']);
      }, error => {
        this.valid = true;
      });
    }
    this.valid = false;

  }
}
