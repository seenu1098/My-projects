import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef, } from '@angular/core';
import { PageService } from '../../service/page-service';
import { Page, ResolvedSecurityForPage, Field } from '../../vo/page-vo';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../../../shared-module/snackbar/snackbar.component';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { FormValidationService } from '../../service/form-service/form-validation.service';
import { LoaderService } from '../../service/form-service/loader-service';
import { RenderingConfirmDialogBoxComponent } from '../../../rendering-confirm-dialog-box-component/rendering-confirm-dialog-box-component.component';
import { MatDialog } from '@angular/material/dialog';
import { ButtonComponent } from '../button/button.component';
import { LoadFormService } from '../../service/form-service/load-form.service';
import { TaskboardFormDetailsComponent } from '../../../../taskboard-module/taskboard-form-details/taskboard-form-details.component';
import { DialogviewComponent } from 'src/app/taskboard-module/dialog-view/dialog-view.component';
import { concatAll } from 'rxjs/operators';



@Component({
    // tslint:disable-next-line: component-selector
    selector: 'dynamic-page',
    templateUrl: './dynamic-page.component.html',
    styles: [`  .loader {
        left: 50%;
        margin-left: -4em;
        margin-top: 20%;
    }`]
})


export class DynamicPageComponent implements OnInit {

    @Input() id: any;
    @Input() version: any;
    @Input() loadFormInfo: any;
    @Input() yoroflowInfo: any;
    @Input() pageObj: any;
    @Input() isExclude: boolean;
    @Input() formData: any;
    @Input() object: any;
    @Input() pageFrom: string;
    @Input() pageSecurity: boolean;
    @Input() inputObject: any;

    // tslint:disable-next-line: no-output-native
    @Output() submit: EventEmitter<any> = new EventEmitter<any>();
    @Output() pageRendered: EventEmitter<any> = new EventEmitter<any>();
    @Output() isDialogClose: EventEmitter<any> = new EventEmitter<any>();
    @Output() progressBar: EventEmitter<any> = new EventEmitter<any>();
    @Output() formValues: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('dynamicForm', { static: true }) dynamicForm: DynamicFormComponent;
    @ViewChild('content') content: ElementRef;

    page = new Page();
    form: FormGroup;
    controlExistInPage = false;
    message: any;
    show = false;
    loadCustomForm = false;
    error: any;
    excludeButton = false;
    isButtonInclude: any;
    dynamicFormObject: DynamicFormComponent;
    taskBoardTask: TaskboardFormDetailsComponent;
    popoutViewObject: DialogviewComponent;
    publicForm = false;
    setJson: any;


    constructor(private loaderService: LoaderService, public pageService: PageService, public snackBar: MatSnackBar, public formService: CreateFormService
        , public activateRoute: ActivatedRoute, public service: DynamicQueryBuilderService, private router: Router,
        public formValidationService: FormValidationService, public changeDetectorRef: ChangeDetectorRef, public dialog: MatDialog, public dynamicFormComponent: DynamicFormComponent,
        private loadFormService: LoadFormService) { }

    ngOnInit() {
        this.activateRoute.paramMap.subscribe(params => {
            if (params.get('id') !== null) {
                this.id = params.get('id');
                this.version = params.get('version');
                this.show = false;
                this.getPage();
                this.changeDetectorRef.markForCheck();
            } else {
                this.show = false;
                this.getPage();
            }
        });
        this.addActionTypeEmitter();
    }

    addActionTypeEmitter() {
        if (this.dynamicFormObject && this.dynamicFormObject.buttonComponentActionType) {
            this.dynamicFormObject.buttonComponentActionType.resetEmitter.subscribe(message => {
                this.message = message;
            });
        }
    }

    getForm(event) {
        if ((window.location.href.includes('/taskboard') || window.location.href.includes('/landing-dashboard') ||
            window.location.href.includes('/notification') || window.location.href.includes('/my-pending-task')
            || window.location.href.includes("/workspace-dashboard")) && event !== true && event !== 'error contains') {
            if (this.pageFrom === 'popoutView') {
                this.popoutViewObject = this.object;
                if (this.popoutViewObject.isEmit === true) {
                    this.dynamicFormObject = event;
                    if (this.dynamicFormObject.isFormChanged) {
                        this.formValues.emit(this.dynamicFormObject.form.getRawValue());
                    } else {
                        this.formValues.emit(this.dynamicFormObject);
                    }
                }
            } else {
                this.taskBoardTask = this.object;
                if (this.taskBoardTask && this.taskBoardTask.isEmit === true) {
                    this.dynamicFormObject = event;
                    if (this.dynamicFormObject.isFormChanged) {
                        this.formValues.emit(this.dynamicFormObject.form.getRawValue());
                    } else {
                        this.formValues.emit(this.dynamicFormObject);
                    }
                }
                else if (event.form) {
                    this.dynamicFormObject = event;
                }
            }
        } else if (event === true) {
            this.dynamicFormObject = event;
            this.formValues.emit(false);
        } else if (window.location.href.includes('/page') || window.location.href.includes('/my-pending-task')) {
            this.dynamicFormObject = event;
        }
        else {
            this.formValues.emit('error contains');
        }
        this.addActionTypeEmitter();
    }

    exportasPDF() {
        const dialogRef = this.dialog.open(RenderingConfirmDialogBoxComponent, {
            width: '400px',
            data: 'exportAspdf'
        });
        dialogRef.afterClosed().subscribe(data => {
            if (data === 'yes') {
                const dialog = this.dialog.open(RenderingConfirmDialogBoxComponent, {
                    width: '1200px',
                    panelClass: 'scroll',
                    maxHeight: '600px',
                    data: { type: 'includeButton', data: this.page, json: this.dynamicFormObject.form },
                });
            } else if (data === 'no') {
                const dialog = this.dialog.open(RenderingConfirmDialogBoxComponent, {
                    width: '1200px',
                    panelClass: 'scroll',
                    maxHeight: '600px',
                    data: { type: 'excludeButton', data: this.page, json: this.dynamicFormObject.form },

                });
                dialog.afterClosed().subscribe(data => {
                    if (data === 'yes' || data === undefined || data === null || data === '') {
                        this.dynamicFormObject.form.removeControl('isExcludeButton');
                    }
                });
            }
        });
    }

    checkControlExistInPage() {
        if (this.loadFormInfo && this.loadFormInfo.id) {
            this.page.sections.forEach(section => {
                section.rows.forEach(row => {
                    row.columns.forEach(column => {
                        if (column.field.name === this.loadFormInfo.id) {
                            this.controlExistInPage = true;
                            return this.loadFormInfo;
                        }
                    });
                });
            });
        }
    }

    getPage() {
        if (!window.location.href.includes('/public/') && !window.location.href.includes('/board/')) {
            this.loadPageByPageIdentifier();
        } else {
            this.loadPublicForm();
        }
    }

    ngAfterViewChecked() {
        this.changeDetectorRef.markForCheck();
    }

    loadPublicForm() {
        if (!this.id) {
            this.isDialogClose.emit(true);
            this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'This page does not have a version or page id'
            });
        } else if (this.id) {
            this.pageService.getPublicForm(this.id).subscribe(data => {
                if (data.pageId !== null) {
                    data.security.create = true;
                    data.security.update = true;
                    data.security.delete = true;
                    data.security.read = true;
                    this.page = data;
                    this.setSectionSecurity();
                    this.checkControlExistInPage();
                    if (this.controlExistInPage === false) {
                        if (this.loadFormInfo && this.loadFormInfo.pageType && this.loadFormInfo.pId
                            && this.loadFormInfo.pageType !== 'hyperLink') {
                            if (this.loadFormInfo.isFromTabbedMenu && this.loadFormInfo.isFromTabbedMenu === true) {
                                this.loadFormInfo = {
                                    pageIdentifier: this.id, pageType: undefined,
                                    id: this.loadFormInfo.pId, isFromTabbedMenu: true
                                };
                            } else {
                                this.loadFormInfo = { pageIdentifier: this.id, pageType: undefined, id: this.loadFormInfo.pId };
                            }
                        }
                    }
                    this.publicForm = true;
                    this.show = true;
                    this.changeDetectorRef.markForCheck();
                    this.controlExistInPage = false;
                }
            });
        }
    }

    loadPageByPageIdentifier() {
        if (!this.id || !this.version) {
            this.isDialogClose.emit(true);
            this.formValues.emit([]);
            this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'This page does not have a version or page id'
            });
        } else if (this.id && this.version) {
            this.pageService.getPageByPageIdentifier(this.id, this.version).subscribe(data => {
                if (data.pageId !== null) {
                    if (data.layoutType === 'publicForm') {
                        data.security.create = true;
                    }
                    if (this.pageFrom !== undefined && this.pageFrom !== null && (this.pageFrom === 'taskBoard' || this.pageFrom === 'popoutView')) {
                        data.security.create = this.pageSecurity;
                        data.security.update = true;
                        data.security.read = true;
                    }
                    this.page = data;
                    this.setJson = this.formData;
                    if (data && (data.security.create !== false
                        || data.security.delete !== false || data.security.read !== false || data.security.update !== false)) {
                        this.setSectionSecurity();
                        this.pageRendered.emit(true);
                    } else {
                        this.isDialogClose.emit(true);
                        this.router.navigate(['/user-permission']);
                    }
                    this.checkControlExistInPage();
                    if (this.controlExistInPage === false) {
                        if (this.loadFormInfo && this.loadFormInfo.pageType && this.loadFormInfo.pId
                            && this.loadFormInfo.pageType !== 'hyperLink') {
                            if (this.loadFormInfo.isFromTabbedMenu && this.loadFormInfo.isFromTabbedMenu === true) {
                                this.loadFormInfo = {
                                    pageIdentifier: this.id, pageType: undefined,
                                    id: this.loadFormInfo.pId, isFromTabbedMenu: true
                                };
                            } else {
                                this.loadFormInfo = { pageIdentifier: this.id, pageType: undefined, id: this.loadFormInfo.pId };
                            }
                        }
                    }
                    this.show = true;
                    this.changeDetectorRef.markForCheck();
                    this.controlExistInPage = false;
                } else {
                    this.snackBar.openFromComponent(SnackbarComponent, {
                        data: 'This page does not exist'
                    });
                    this.formValues.emit([]);
                }
            }, err => {
                this.formValues.emit([]);
                this.pageRendered.emit(true);
                this.isDialogClose.emit(true);
            });
        }
    }

    setSectionSecurity() {
        this.page.sections.forEach(section => {
            section.sectionSecurity.create = true;
            section.sectionSecurity.delete = true;
            section.sectionSecurity.update = true;
            section.sectionSecurity.show = true;
            section.sectionSecurity.read = true;
        });
    }

    getCreateFormInfo(section) {
        return {
            section,
            id: this.page.yorosisPageId,
            security: this.page.security,
            page: this.page
        };
    }

    showProgressbar(event) {
        if (event === true) {
            this.progressBar.emit(true);
        }
        if (event === false) {
            this.progressBar.emit(false);
        }
    }

    formSubmit($event) {
        if ($event.value === true) {
            this.submit.emit({ value: true });
        }
        if ($event.custom) {
            this.pageService.completeWorkflow({
                instanceId: $event.custom.workflowId,
                instanceTaskId: $event.custom.workflowTaskId, taskData: $event.custom
            }).subscribe((data: any) => {
                this.submit.emit(data);
            });
        } else if (!$event.yoroflow) {
            if (!$event.isFile) {
                this.service.savePage($event.json).subscribe((data: any) => {
                    this.snackBar.openFromComponent(SnackbarComponent, {
                        data: data.message,
                    });
                    this.submit.emit(data.message);
                    this.resetAndDisableForm($event);
                    this.addDefulatControls($event.instance);
                    this.loadFormService.resetEmitter.emit(true);
                });
            } else if ($event.isFile) {
                this.service.savePageAndFiles($event.json).subscribe((data: any) => {
                    this.snackBar.openFromComponent(SnackbarComponent, {
                        data: data.message,
                    });
                    this.submit.emit(data.message);
                    this.resetAndDisableForm($event);
                    this.addDefulatControls($event.instance);
                });
            }
        } else if ($event.yoroflow) {
            if ($event.reAssign) {
                this.progressBar.emit(true);
                this.service.savePageInfoAsDraft($event.taskData, false).subscribe((data1: any) => {
                    this.progressBar.emit(false);
                    if (data1) {
                        this.progressBar.emit(true);
                        this.service.reAssignTask($event.yoroflow).subscribe((data: any) => {
                            this.progressBar.emit(false);
                            if (data.reassigned === true) {
                                this.submit.emit(data);
                            } else {
                                this.submit.emit(data);
                            }
                        },
                            error => {
                                this.progressBar.emit(false);
                            });
                    }
                },
                    error => {
                        this.progressBar.emit(false);
                    });

            } else if ($event.close === true) {
                this.submit.emit(false);
            } else if ($event.saveAsDraft === true) {
                this.progressBar.emit(true);
                this.service.savePageInfoAsDraft($event.yoroflow, true).subscribe((data: any) => {
                    this.progressBar.emit(false);
                    this.snackBar.openFromComponent(SnackbarComponent, {
                        data: data.response,
                    });
                    this.submit.emit('savePageAsDraft');
                },
                    error => {
                        this.progressBar.emit(false);
                    });
            } else if ($event.status === 'LAUNCH') {
                this.submit.emit($event);
            } else {
                this.progressBar.emit(true);
                this.service.savePage($event.yoroflow).subscribe((data: any) => {
                    this.progressBar.emit(false);
                    this.snackBar.openFromComponent(SnackbarComponent, {
                        data: data.message,
                    });
                    if ($event.sendBackComments && data.messageId !== null) {
                        this.submit.emit({ instanceTaskId: data.messageId, sendBackComments: $event.sendBackComments });
                    } else {
                        this.submit.emit(data.message);
                    }
                },
                    error => {
                        this.progressBar.emit(false);
                    });
            }
        } else {
            this.submit.emit($event);
        }

    }

    resetAndDisableForm($event) {
        if ($event.gridComponent && $event.gridComponent.gridConfig) {
            $event.gridComponent.gridConfig.refreshGrid();
        }

        if (this.page.security) {
            if (this.page.security.create === false) {
                this.formValidationService.disableAllFormFields($event.form.form, true);
            } else {
                this.formValidationService.disableAllFormFields($event.form.form, false);
            }
        }
        if (!this.loadFormInfo) {
            $event.form.resetForm();
        }

        if (this.loadFormInfo && this.loadFormInfo.pageType && this.loadFormInfo.pageType === 'hyperLink') {
            $event.form.resetForm();
        }
    }

    addDefulatControls(instance: DynamicFormComponent) {
        instance.addSecurityValues();
        instance.pageIdentifier();
        instance.version();
        instance.setAllowToCreateOrNot();
        instance.setValueForID();
        instance.isEdit = instance.form.get('update').value;
        instance.updateYoroFlowInfo();
        instance.isFromTabbedMenu();
        instance.checkRequiredValidationForTableColumns(this.page.sections, false);
    }
}
