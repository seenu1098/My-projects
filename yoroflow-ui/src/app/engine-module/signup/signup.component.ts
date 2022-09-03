import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicQueryBuilderService } from 'src/app/rendering-module/shared/service/dynamic-query-builder.service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatStepper } from "@angular/material/stepper";
import { TaskboardVO } from 'src/app/taskboard-module/taskboard-configuration/taskboard.model';
import { TaskboardTaskVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { SignupServiceService } from './signup-service.service';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { FindValueSubscriber } from 'rxjs/internal/operators/find';
import { ActivatedRoute, Router } from '@angular/router';
import { timeStamp } from 'console';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { AccountDetailsVO } from './account-details-model';
import { CustomerVO } from 'src/app/creation-module/create-organization/customer-vo';
import { YoroFlowConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent>;
  isLinear = false;
  taskboardVO = new TaskboardVO();
  taskboardKey: string = 'sales-pipeline';
  form: FormGroup;
  accountCreationForm: FormGroup;
  message = undefined;
  disabled = true;
  screenHeight: string;
  screenHeight1: string;
  showError: boolean = false;
  showCountry: boolean = false;
  public config: PerfectScrollbarConfigInterface = {};
  show: boolean;
  buttonDisable: boolean = false;
  detailsShow: boolean = true;
  telephoneClear: boolean = true;
  taskId: string;
  accountToken: string;
  task = new TaskboardTaskVO();
  accountDetailsVo = new AccountDetailsVO();
  detailsType: string;
  buttonShow = true;

  planList: any[] = [
    { name: 'Business Pack', desc: 'Setup your workplace for your team with Workflows + Taskboard + Forms + Docs along with 1000 Automations per month in business plan.', isSelected: true },
    { name: 'Standard', desc: 'Additionally make your digital workplace secure with 2-Factor Authentication, role based access and SSO in Standard plan.', isSelected: false },
    { name: 'Pro', desc: 'Go unlimited with Pro plan.', isSelected: false }
  ]

  constructor(private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private service: DynamicQueryBuilderService,
    private _formBuilder: FormBuilder,
    private signupService: SignupServiceService,
    private activeRoute: ActivatedRoute, private router: Router,
    private dialog: MatDialog) {
    if (window.location.href.includes('/account-creation/')) {
      this.activeRoute.paramMap.subscribe(params => {
        if (params.get('accountToken')) {
          this.accountToken = params.get('accountToken');
        }
      });
      const accountDetailsVO = new AccountDetailsVO();
      accountDetailsVO.token = this.accountToken;
      this.signupService.checkAccount(accountDetailsVO).subscribe(data => {
        if (data && data.response && !data.response.includes('Invalid token')) {
          this.detailsShow = true;
          this.accountDetailsVo.email = data.response;
          this.detailsType = 'showFields';
        } else if (data.response.includes('Invalid token')) {
          this.detailsType = 'invalidToken';
        }
      });
    } else {
      this.detailsShow = false;
      this.detailsType = 'showFields';
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.screenHeight = (window.innerHeight) + 'px';
    this.screenHeight1 = (window.innerHeight - 60) + 'px';
  }

  ngOnInit(): void {
    this.screenHeight = (window.innerHeight) + 'px';
    this.screenHeight1 = (window.innerHeight - 60) + 'px';
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      industry: [''],
      teamSize: [''],
      forTeams: [''],
      country: [''],
      plan: [''],
      terms: [false],
      thirdPartyTool: [''],
      recaptcha: ['']
    });
    this.accountCreationForm = this.fb.group({
      companyName: ['', [Validators.required]],
      subdomainName: ['', [Validators.required]],
      token: [this.accountToken],
      recaptcha: ['']
    });
  }

  getCaptchaResponse(event: any, type: string): void {
    this.disabled = false;
    if (type === 'initial') {
      this.form.get('recaptcha').setValue(event);
    } else {
      this.accountCreationForm.get('recaptcha').setValue(event);
    }
  }

  save(userForm): void {
    if (userForm.valid) {
      this.createAccountDetails();
    }
  }

  createAccountDetails(): void {
    const accountDetails = new AccountDetailsVO();
    accountDetails.firstName = this.form.get('firstName').value;
    accountDetails.lastName = this.form.get('lastName').value;
    accountDetails.email = this.form.get('email').value;
    accountDetails.phoneNumber = this.form.get('phoneNumber').value;
    accountDetails.recaptcha = this.form.get('recaptcha').value;
    this.buttonShow = false;
    this.signupService.saveAccountDetails(accountDetails).subscribe(data => {
      if (data && !data.response.includes('Email already taken')) {
        window.location.href='https://www.yoroflow.com/thank-you-message/';
        this.detailsType = 'accountCreate';
      } else if (data.response.includes('Email already taken')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Account already created with this email'
        });
        this.form.get('email').setErrors({ exist: true });
      }
      this.buttonShow = true;
    }, error => {
      this.buttonShow = true;
    });
  }

  checkEmail(): void {
    this.form.get('email').valueChanges.subscribe(data => {
      this.form.get('email').setErrors(null);
    });
  }

  checkSubdomain(): void {
    const subdomain = this.accountCreationForm.get('subdomainName').value;
    const trimValue = subdomain.trim().replace(/ /g, '-');
    this.accountCreationForm.get('subdomainName').setValue(trimValue);
    if (this.accountDetailsVo.subdomainName && this.accountDetailsVo.subdomainName !== this.accountCreationForm.get('subdomainName').value) {
      this.accountCreationForm.get('subdomainName').setErrors(null);
    }
  }

  planSelection(plan: any): void {
    this.planList.forEach(p => p.isSelected = false);
    plan.isSelected = true;
  }

  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }

  createAccount(userForm: NgForm): void {
    if (this.accountCreationForm.valid) {
      this.buttonShow = false;
      const subdomain = this.accountCreationForm.get('subdomainName').value;
      const trimValue = subdomain.trim().replace(/ /g, '-');
      this.accountCreationForm.get('subdomainName').setValue(trimValue);
      const accountDetailsVO = this.accountCreationForm.getRawValue();
      accountDetailsVO.planType = this.planList.find(p => p.isSelected === true)['name'].toUpperCase();
      accountDetailsVO.email = this.accountDetailsVo.email;
      this.accountDetailsVo = accountDetailsVO;
      this.buttonDisable = true;
      this.signupService.createAccount(accountDetailsVO).subscribe(data => {
        this.buttonShow = true;
        if (data && data.response.includes('Account created successfully')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Your account created successfully'
          });
          this.buttonDisable = true;
          this.detailsType = 'accountCreate';
        } else if (data.response.includes('Subdomain name already taken please give another one')) {
          this.accountCreationForm.get('subdomainName').setErrors({ exist: true });
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Subdomain name already exist'
          });
        } else if (data.response.includes('Recaptcha verfication failed')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response
          });
        } else if (data.response.includes('Invalid Account details')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Account already created'
          });
        }
      }, error => {
        this.buttonShow = true;
      });
    }
  }

  changeUrl(): void {
    window.open('https://www.yoroflow.com');
  }

  getCountry(country: string): void {
    this.form.get('country').setValue(country);
    this.showCountry = true;
  }

  getTelephoneNumber(phoneNumber: string): void {
    this.form.get('phoneNumber').setValue(phoneNumber);
  }

  createtask(userForm): void {
    let taskboardTask = new TaskboardTaskVO();
    taskboardTask.id = null;
    taskboardTask.taskType = 'parentTask';
    taskboardTask.taskboardId = this.taskboardVO.id;
    taskboardTask.startDate = new Date();
    taskboardTask.taskData = this.form.getRawValue();
    let index = this.taskboardVO.taskboardColumns.findIndex(column => column.columnOrder === 0);
    taskboardTask.status = this.taskboardVO.taskboardColumns[index].columnName;
    if (this.taskboardVO.parentTaskLength === undefined || this.taskboardVO.parentTaskLength === null) {
      this.taskboardVO.parentTaskLength = 0;
    }
    if (this.taskboardVO.taskName !== 'generatedTaskId') {
      taskboardTask.taskName = this.form.get(this.taskboardVO.taskName).value;
    }
    if (this.taskboardVO.taskboardColumns[index].subStatus && this.taskboardVO.taskboardColumns[index].subStatus.length > 0) {
      const subStatus = this.taskboardVO.taskboardColumns[index].subStatus.find(sub => sub.columnOrder === 0);
      taskboardTask.subStatus = subStatus.name;
    }
    this.buttonDisable = true;
    this.signupService.saveTaskboardTask(taskboardTask).subscribe(task => {
      this.signupService.getTaskboardDetails(this.taskboardKey).subscribe(data => {
        this.taskboardVO = data;
      });
      this.buttonDisable = false;
      this.telephoneClear = false;
      userForm.resetForm();
      this.telephoneClear = true;
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '400px',
        data: 'taskCreation'
      });
      dialog.afterClosed().subscribe(response => {
        if (response === 'yes') {
          this.router.navigate(['/board/signup1/' + task.taskId])
        }
      });
    }, error => {
      this.buttonDisable = false;
    });
  }

  stepperNext(): void {
    if (this.form.get('phoneNumber').value === undefined || this.form.get('phoneNumber').value === null || this.form.get('phoneNumber').value === '') {
      this.form.get('phoneNumber').setValidators([Validators.required]);
      this.form.get('phoneNumber').updateValueAndValidity();
    }
    this.showError = true;
    if (this.form.get('email').valid && this.form.get('name').valid && this.form.get('phoneNumber').valid) {
    } else {
      this.form.get('name').markAsTouched();
      this.form.get('email').markAsTouched();
      this.form.get('phoneNumber').markAsTouched();
    }
  }

  saveDetails(userForm: NgForm): void {
    if (this.task) {
      this.task.taskData = this.form.getRawValue();
      this.buttonDisable = true;
      this.signupService.saveTaskboardTask(this.task).subscribe(data => {
        this.buttonDisable = false;
        const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
          width: '400px',
          data: 'taskUpdate'
        });
      });
    }
  }
}
