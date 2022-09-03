import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Field, Button } from '../../vo/page-vo';
import { MatDialog } from '@angular/material/dialog';
import { FormValidationService } from '../../service/form-service/form-validation.service';
import { DynamicDialogComponent } from '../../../dynamic-dialog/dynamic-dialog.component';
import { LoadFormService } from '../../service/form-service/load-form.service';
import { PageService } from '../../service/page-service';
import { MatRightSheet } from 'mat-right-sheet';
import { DynamicRightSheetComponent } from '../../../dynamic-right-sheet/dynamic-right-sheet.component';
import { SnackbarComponent } from '../../../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
// tslint:disable-next-line:import-spacing
import { RenderingConfirmDialogBoxComponent }
    from '../../../rendering-confirm-dialog-box-component/rendering-confirm-dialog-box-component.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { TaskboardTaskVO } from '../../../../taskboard-module/taskboard-form-details/taskboard-task-vo';
import { TaskboardVO } from '../../../../taskboard-module/taskboard-configuration/taskboard.model';

// import { TaskboardTaskVO } from 'src/app/engine-module/taskboard-form-details/taskboard-task-vo';
// import { TaskboardVO } from 'src/app/taskboard-configuration/taskboard.model';

@Component({
    selector: 'app-button',
    template: `
<head>
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</head>
<div class="demo-full-width "[formGroup]="group">
<div [style]="field.style" style="width:100%">
<div *ngIf="!this.group.get('publicpage')" [style.background-color]="field.rowBackground">
<button *ngIf="submitAction" id="submit" style="margin-top:18px;" [type]="field.control.buttonType" mat-raised-button
[color]="getButtonColor(field.control.buttonType)" [disabled]="preview" (click)="resetForm()">{{field.label.labelName}}</button>
<button [disabled]="disableDelete" id="delete" *ngIf="deleteAction" style="margin-top:18px" (click)="deleteData()"
mat-raised-button color="primary" type="button">{{field.label.labelName}}</button>
<button [disabled]="disableButton" id="openDialog" *ngIf="screenType" style="margin-top:18px" (click)="openDialog()" mat-raised-button color="primary"
 type="button">{{field.label.labelName}}</button>
 </div>
  <div fxLayout="row" *ngIf="this.group.get('publicpage') && !isMobile.matches" [style.background-color]="field.rowBackground">
        <div fxLayout="column">
               <re-captcha #captchaRef="reCaptcha" siteKey="6Lf20dkZAAAAAHYrQB4CC3TWYXVxV4xPKu9wXICn" id="captcha" formControlName="captcha"  (resolved)="getCaptchaResponse($event)"></re-captcha>
        </div>
        <div fxLayout="column" style="margin-left:20px">
             <button id="submitPublicForm" *ngIf="screenType" [disabled]="group.invalid || isDisabled" style="margin-top:18px" (click)="openDialog()" mat-raised-button color="primary"
               type="button">{{field.label.labelName}}</button>
         </div>
   </div>
   <div fxLayout="column" *ngIf="this.group.get('publicpage') && isMobile.matches" [style.background-color]="field.rowBackground">
   <div fxLayout="column">
          <re-captcha #captchaRef="reCaptcha" siteKey="6Lf20dkZAAAAAHYrQB4CC3TWYXVxV4xPKu9wXICn" id="captcha" formControlName="captcha"  (resolved)="getCaptchaResponse($event)"></re-captcha>
   </div>
   <div fxLayout="column" style="margin-left:20px">
        <button id="submitPublicForm" *ngIf="screenType" [disabled]="group.invalid || isDisabled" style="margin-top:18px" (click)="openDialog()" mat-raised-button color="primary"
          type="button">{{field.label.labelName}}</button>
    </div>
</div>
 </div>
</div>
`,
    styles: []
})

// (resolved)="$event && openDialog()"
export class ButtonComponent implements OnInit {
    field: Field;
    group: FormGroup;
    submitAction = false;
    screenType = false;
    isCreate: boolean;
    isEdit: boolean;
    version: any;
    pageIdentifier: string;
    disableButton = true;
    deleteAction = false;
    disableDelete = true;
    section: any;
    sectionCreate: boolean;
    sectionUpdate: boolean;
    isDisabled = false;
    pageId: any;
    isMobile: MediaQueryList;
    boardKey: string = 'fromPage';
    taskboardVO = new TaskboardVO();
    preview: boolean = false;
    @Output() resetEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() deleteEmitter: EventEmitter<any> = new EventEmitter<any>();

    constructor(public dialog: MatDialog, public formValidationService: FormValidationService, public loadFormService: LoadFormService,
        public pageService: PageService, public rightSheet: MatRightSheet, private snackBar: MatSnackBar, private fb: FormBuilder,
        public dynamicPageService: DynamicQueryBuilderService, private router: Router, private media: MediaMatcher, public activateRoute: ActivatedRoute) {
        this.isMobile = media.matchMedia('only screen and (max-width: 600px)');
    }
    ngOnInit() {
        if (this.group.get('preview') && this.group.get('preview').value !== undefined
            && this.group.get('preview').value !== null && this.group.get('preview').value === true) {
            this.preview = true;
            this.disableButton = true;
            this.disableDelete = true;
        }
        if (window.location.href.includes('/board/')) {
            this.activateRoute.paramMap.subscribe(params => {
                if (params.get('board-name') !== undefined && params.get('board-name') !== null) {
                    this.boardKey = params.get('board-name');
                }
            });
            this.dynamicPageService.getTaskboardId(this.boardKey).subscribe(data => {
                this.taskboardVO = data;
            });
        }
        if (this.group.get('publicpage')) {
            this.group.addControl('captcha', this.fb.control('', [Validators.required]));
        }
        if (this.field.control.buttonType === 'submit' || this.field.control.buttonType === 'reset') {
            this.submitAction = true;
        } else if (this.field.control.buttonType === 'action') {
            this.screenType = true;
            if (this.field.control.screenType !== 'callWorkflow'
                && this.field.control.screenType !== 'webServiceCall') {
                this.group.get(this.field.control.parameterFieldNames).valueChanges.subscribe(data => {
                    if (data !== null && data !== '') {
                        this.disableButton = false;
                    } else {
                        this.disableButton = true;
                    }
                });
            } else {
                this.disableButton = false;
            }
        } else if (this.field.control.buttonType === 'delete') {
            this.deleteAction = true;
        }
        this.isCreate = this.group.get('create').value;
        this.isEdit = this.group.get('update').value;
        this.version = this.group.get('version').value;
        this.pageIdentifier = this.group.get('pageIdentifier').value;

        this.loadFormValues();
    }

    getCaptchaResponse(event) {
        this.group.get('captcha').setValue(event);
        if (this.group.valid) {
            this.isDisabled = false;
        }
    }

    getButtonColor(buttonType) {
        if (buttonType === 'submit') {
            return 'primary';
        } else { return 'accent'; }
    }

    loadFormValues() {
        if (this.group.get('uuid')) {
            this.group.get('uuid').valueChanges.subscribe(data => {
                if (data !== null && data !== '' && data !== '-1') {
                    this.disableDelete = false;
                } else {
                    this.disableDelete = true;
                }
            });
        } else {
            this.disableDelete = true;
        }
    }

    deleteData() {
        if (this.group.get('uuid') && this.group.get('uuid').value !== null &&
            this.group.get('uuid').value !== '' && this.group.get('uuid').value !== '-1') {
            const dialogRef = this.dialog.open(RenderingConfirmDialogBoxComponent, {
                disableClose: true,
                width: '400px',
                height: '130px',
                data: 'deleteConfirmation'
            });
            dialogRef.afterClosed().subscribe(deleteData => {
                if (deleteData === true) {
                    const formValue = this.group.getRawValue();
                    const jsonData = new FormData();
                    jsonData.append('jsonData', JSON.stringify(formValue));
                    this.dynamicPageService.deleteData(jsonData).subscribe((data: any) => {
                        this.snackBar.openFromComponent(SnackbarComponent, {
                            data: data.message,
                        });
                        this.disableDelete = true;
                        Object.keys(this.group.controls).forEach(field => {
                            if (field !== 'version' && field !== 'yorosisPageId') {
                                this.group.get(field).setValue(null);
                            }
                        });
                        this.deleteEmitter.emit(true);
                    });
                }
            });
        }
    }

    openDialog() {
        const passingParameter: string = this.field.control.parameterFieldNames;
        if (this.boardKey === 'fromPage') {
            if (this.field.control.screenType === 'dialogBox') {
                this.dialog.open(DynamicDialogComponent, {
                    width: '1100px',
                    height: '600px',
                    maxHeight: '100%',
                    maxWidth: '100%',
                    data: this.field.control
                });
            } else if (this.field.control.screenType === 'rightSheet') {
                const bottomSheetRef = this.rightSheet.open(DynamicRightSheetComponent, {
                    disableClose: false,
                    data: this.field.control,
                    panelClass: 'right-sheet-container',
                });
            } else if (this.field.control.screenType === 'samePage') {

                // this.pageService.getPageByPageIdentifier(this.field.control.targetPageId, this.group.get('version').value).subscribe(
                //     data => {
                //         this.loadFormService.testsetFormValues(this.group, data, this.field.control.targetPageId,
                //             this.isEdit, null, this.group.get('version').value);

                //     });
                if (this.group.get(this.field.control.parameterFieldNames).value !== null) {
                    this.dynamicPageService.getPageDataByFieldNameAndValue
                        (this.field.control.targetPageId, this.field.control.parameterFieldNames,
                            this.group.get(this.field.control.parameterFieldNames).value,
                            this.group.get('version').value).subscribe(data => {
                                this.loadFormService.testsetFormValues(this.group, data.data, this.pageIdentifier, this.isEdit,
                                    null, this.group.get('version').value);
                            });
                }
            } else if (this.field.control.screenType === 'webServiceCall' && this.field.control.webServiceCallUrl && this.group.valid) {
                this.removeControls();
                this.pageService.callWebServiceCall(this.group.value, this.field.control.webServiceCallUrl).subscribe(
                    data => {
                        this.snackBar.openFromComponent(SnackbarComponent, {
                            data: data.response,
                        });

                    });
            } else if (this.field.control.screenType === 'webServiceCall' && this.field.control.webServiceCallUrl && this.group.invalid) {
                this.formValidationService.validateAllFormFields(this.group);
            } else if (this.field.control && this.field.control.screenType === 'callWorkflow') {
                const button = this.field.control as Button;
                if (this.group.valid) {
                    this.removeControls();
                    this.group.addControl('saveAndCallWorkflow', this.fb.control(button.saveAndCallWorkflow));
                    this.group.addControl('workflowKey', this.fb.control(button.workflowKey));
                    this.group.addControl('workflowVersion', this.fb.control(button.workflowVersion));
                    this.group.get('saveAndCallWorkflow').setValue(button.saveAndCallWorkflow);
                    this.group.get('workflowKey').setValue(button.workflowKey);
                    this.group.get('workflowVersion').setValue(button.workflowVersion);

                    if (!this.group.get('publicpage')) {
                        this.dynamicPageService.savePage(this.group.value).subscribe((data: any) => {
                            this.snackBar.openFromComponent(SnackbarComponent, {
                                data: data.message,
                            });
                            if (data.messageType === 'S') {
                                this.snackBar.openFromComponent(SnackbarComponent, {
                                    data: data.message,
                                });
                                // this.group.reset();
                                Object.keys(this.group.controls).forEach(field => {
                                    if (field !== 'version' && field !== 'yorosisPageId' && field !== 'uuid') {
                                        this.group.get(field).setValue(null);
                                    }
                                });
                            }
                            this.group.addControl('version', this.fb.control(this.version));
                            this.group.addControl('pageIdentifier', this.fb.control(this.pageIdentifier));
                            this.group.removeControl('saveAndCallWorkflow');
                            this.group.removeControl('workflowKey');
                            this.group.removeControl('workflowVersion');
                        });
                    } else {
                        this.group.removeControl('sectionCreate');
                        this.group.removeControl('sectionUpdate');
                        this.group.removeControl('version');
                        this.isDisabled = true;
                        this.dynamicPageService.savePublicPage(this.group.value).subscribe((data: any) => {
                            this.isDisabled = false;
                            grecaptcha.reset();
                            this.pageId = this.group.get('yorosisPageId').value;

                            if (data.messageType === 'S') {
                                this.group.reset();
                                this.group.get('yorosisPageId').setValue(this.pageId);
                                this.resetEmitter.emit(data.messageId);
                                Object.keys(this.group.controls).forEach(field => {
                                    if (field !== 'version' && field !== 'yorosisPageId' && field !== 'uuid') {
                                        this.group.get(field).setValue(null);
                                    }
                                });
                            }
                            this.group.addControl('version', this.fb.control(this.version));
                            this.group.addControl('pageIdentifier', this.fb.control(this.pageIdentifier));
                            this.group.removeControl('saveAndCallWorkflow');
                            this.group.removeControl('workflowKey');
                            this.group.removeControl('workflowVersion');
                        },
                            error => {
                                this.isDisabled = true;
                                grecaptcha.reset();
                            });
                    }
                } else {
                    this.formValidationService.validateAllFormFields(this.group);
                }
            }
        } else {
            this.group.removeControl('sectionCreate');
            this.group.removeControl('sectionUpdate');
            this.group.removeControl('version');
            this.group.removeControl('saveAndCallWorkflow');
            this.group.removeControl('workflowKey');
            this.group.removeControl('workflowVersion');
            let taskboardTask = new TaskboardTaskVO();
            taskboardTask.id = null;
            taskboardTask.taskType = 'parentTask';
            taskboardTask.taskboardId = this.taskboardVO.id;
            taskboardTask.startDate = new Date();
            taskboardTask.taskData = this.group.getRawValue();
            let index = this.taskboardVO.taskboardColumns.findIndex(column => column.columnOrder === 0);
            taskboardTask.status = this.taskboardVO.taskboardColumns[index].columnName;
            if (this.taskboardVO.parentTaskLength === undefined || this.taskboardVO.parentTaskLength === null) {
                this.taskboardVO.parentTaskLength = 0;
            }
            if (this.taskboardVO.taskName !== 'generatedTaskId') {
                taskboardTask.taskName = this.group.get(this.taskboardVO.taskName).value;
            } 
            if (this.taskboardVO.taskboardColumns[index].subStatus && this.taskboardVO.taskboardColumns[index].subStatus.length > 0) {
                const subStatus = this.taskboardVO.taskboardColumns[index].subStatus.find(sub => sub.columnOrder === 0);
                taskboardTask.subStatus = subStatus.name;
            }
            this.dynamicPageService.saveTaskboardtask(taskboardTask).subscribe(data => {
                this.dynamicPageService.getTaskboardId(this.boardKey).subscribe(data => {
                    this.taskboardVO = data;
                });
                const dialogRef = this.dialog.open(RenderingConfirmDialogBoxComponent, {
                    disableClose: true,
                    width: '250px',
                    height: '130px',
                    data: 'taskboard'
                });
                dialogRef.afterClosed().subscribe(data => {
                    if (data === true) {
                        grecaptcha.reset();
                        this.group.reset();
                    }
                })
            }, error => {
                this.isDisabled = true;
                grecaptcha.reset();
            });
        }
    }

    removeControls() {
        this.group.removeControl('create');
        this.group.removeControl('update');
        this.group.removeControl('pageIdentifier');
        this.removeAutoCompleteControls();
    }

    removeAutoCompleteControls() {
        if (this.group.get('autoCompleteArray')) {
            this.group.removeControl('autoCompleteArray');
        }
        if (this.group.get('autoCompleteValue')) {
            this.group.removeControl('autoCompleteValue');
        }

    }

    resetValues() {
        if (this.isCreate === false) {
            this.formValidationService.disableAllFormFields(this.group, true);
        } else {
            this.formValidationService.disableAllFormFields(this.group, false);
        }
        this.resetEmitter.emit(true);
    }

    resetForm() {
        if (this.field.control.buttonType === 'reset') {
            this.resetValues();
            this.loadFormService.resetEmitter.emit(true);
        }
    }
}
