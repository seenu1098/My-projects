import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { Page } from '../../vo/page-vo';
import { LoaderService } from '../../service/form-service/loader-service';
import { PageService } from '../../service/page-service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormValidationService } from '../../service/form-service/form-validation.service';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { SnackbarComponent } from '../../../../shared-module/snackbar/snackbar.component';


@Component({
  selector: 'lib-app-layout-page',
  templateUrl: './app-layout-page.component.html',
})
export class AppLayoutPageComponent implements OnInit {


  @Input() id: any;
  @Input() version: any;
  @Input() loadFormInfo: any;
  @Input() yoroflowInfo: any;


  // tslint:disable-next-line: no-output-native
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  @Output() pageRendered: EventEmitter<any> = new EventEmitter<any>();
  @Output() isDialogClose: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('dynamicForm', { static: true }) dynamicForm: DynamicFormComponent;

  page = new Page();
  form: FormGroup;
  controlExistInPage = false;

  show = false;
  loadCustomForm = false;
  error: any;
  constructor( private loaderService: LoaderService, public pageService: PageService,
               public snackBar: MatSnackBar, public formService: CreateFormService
    ,          public activateRoute: ActivatedRoute, public service: DynamicQueryBuilderService, private router: Router,
               public formValidationService: FormValidationService, public changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadPageByPageIdentifier();
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

  loadPageByPageIdentifier() {
    if (!this.id || !this.version) {
      this.pageRendered.emit(true);
      this.isDialogClose.emit(true);
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'This page does not have a version or page id'
      });
    } else if (this.id && this.version) {
      this.pageService.getPageByPageIdentifier(this.id, this.version).subscribe(data => {
        this.page = data;
        if (this.loaderService.showLoader === true) {
          this.pageRendered.emit(true);
          this.isDialogClose.emit(true);
        } else {
          this.pageRendered.emit(true);
        }
        this.checkControlExistInPage();
        if (this.controlExistInPage === false) {
          if (this.loadFormInfo && this.loadFormInfo.pageType && this.loadFormInfo.pId) {
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
      });
    }
  }


  getCreateFormInfo(section) {
    return {
      section,
      id: this.page.yorosisPageId,
      security: this.page.security,
      page: this.page
    };
  }

  formSubmit($event) {
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
        });
      } else if ($event.isFile) {
        this.service.savePageAndFiles($event.json).subscribe((data: any) => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.message,
          });
          this.submit.emit(data.message);
          this.resetAndDisableForm($event);
        });
      }
    } else if ($event.yoroflow) {
      if ($event.reAssign) {
        this.service.savePageInfoAsDraft($event.taskData, false).subscribe((data1: any) => {
          if (data1) {
            this.service.reAssignTask($event.yoroflow).subscribe((data: any) => {
              if (data.reassigned === true) {
                this.submit.emit(data);
              }
            });
          }
        });
      } else if ($event.close === true) {
        this.submit.emit(false);
      } else if ($event.saveAsDraft === true) {
        this.service.savePageInfoAsDraft($event.yoroflow, true).subscribe((data: any) => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.submit.emit('savePageAsDraft');
        });
      } else {
        this.service.savePage($event.yoroflow).subscribe((data: any) => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.message,
          });
          this.submit.emit(data.message);
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
  }

}
