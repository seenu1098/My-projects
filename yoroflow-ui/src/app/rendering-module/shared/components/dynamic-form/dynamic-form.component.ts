import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ControlContainer } from '@angular/forms';
import {
  Section,
  ResolvedSecurityForPage,
  Page,
  HyperLink,
  Table,
  FieldConfig,
} from '../../vo/page-vo';
import { DatePipe } from '@angular/common';
import { GridComponent } from '../grid/grid.component';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { FormValidationService } from '../../service/form-service/form-validation.service';
import { ChipControlsService } from '../../service/form-service/chip-controls.service';
import { LoadFormService } from '../../service/form-service/load-form.service';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { ChipComponent } from '../chip/chip.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { RenderingConfirmDialogBoxComponent } from '../../../rendering-confirm-dialog-box-component/rendering-confirm-dialog-box-component.component';
import { ButtonComponent } from '../button/button.component';
import { SignatureComponent } from '../signature/signature.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { TaskboardFormDetailsComponent } from '../../../../taskboard-module/taskboard-form-details/taskboard-form-details.component';
import { DialogviewComponent } from '../../../../taskboard-module/dialog-view/dialog-view.component';
import { PageService } from '../../service/page-service';
import { DialogEmitterService } from 'src/app/shared-module/dialog-emitter.service';
import { OpenFormDialogBoxComponent } from 'src/app/engine-module/open-form-dialog-box/open-form-dialog-box.component';
@Component({
  exportAs: 'dynamicForm',
  // tslint:disable-next-line: component-selector
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.scss'],
  providers: [DatePipe],
})
export class DynamicFormComponent implements OnInit {
  constructor(
    public formService: CreateFormService,
    public datePipe: DatePipe,
    public dataService: DynamicQueryBuilderService,
    public loadFormService: LoadFormService,
    public formValidationService: FormValidationService,
    public chipService: ChipControlsService,
    public fb: FormBuilder,
    private matDialog: MatDialog,
    public dynamicService: DynamicQueryBuilderService,
    public dialog: MatDialog,
    media: MediaMatcher,
    private pageService: PageService,
    private dialogEmitterService: DialogEmitterService
  ) {
    this.isMobile = media.matchMedia('only screen and (max-width: 600px)');
  }

  @Input() form: FormGroup;
  @Input() page: Page;
  @Input() loadFormInfo: any;
  @Input() yoroflowInfo: any;
  @Input() isExclude: boolean;
  @Input() publicPage: boolean;
  @Input() setJson: any;
  @Input() formData: any;
  @Input() taskObject: any;
  @Input() preview: boolean;
  @Input() inputObject: any;
  @Output() dialogEmitter: EventEmitter<any> = new EventEmitter<any>();

  // tslint:disable-next-line: no-output-native
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  @Output() formObj: EventEmitter<any> = new EventEmitter<any>();
  @Output() progressBar: EventEmitter<any> = new EventEmitter<any>();


  create = false;
  // userForm: NgForm;
  taskBoardTask: TaskboardFormDetailsComponent;
  gridComponentInstance: GridComponent;
  fileUploadComponentInstance: FileUploadComponent[] = [];
  signatureControlInstance: SignatureComponent[] = [];
  buttonComponentInstance: ButtonComponent;
  buttonComponentDeleteInstance: ButtonComponent;
  buttonComponentActionType: ButtonComponent;
  dialoagBoxComponent: OpenFormDialogBoxComponent;
  files: any[] = [];
  pageSecurity: ResolvedSecurityForPage;
  isEdit: boolean;
  groupErrorMessage: string;
  showGroupErrorMessage = false;
  allowToSubmit = true;
  fileData: File;
  isMobile: MediaQueryList;
  filterArray: any[] = [];
  fromTaskboard = false;
  taskviewdialog: DialogviewComponent;
  isFormChanged: boolean;
  @Input() editable: boolean;

  ngOnInit() {
    if (this.form === undefined || this.form === null) {
      this.form = this.formService.createForm(this.page.sections);
    }
    if (this.publicPage) {
      this.form.addControl('publicpage', this.fb.control(true));
      this.form.addControl('isWorkflow', this.fb.control(true));
    }
    this.form.addControl('autoCompleteArray', this.fb.control(''));
    this.loadFormValues();
    this.create = true;
    this.pageSecurity = this.page.security;
    this.addSecurityValues();
    this.pageIdentifier();
    this.version();
    this.setAllowToCreateOrNot();
    this.setPageSectionSecurity();
    this.setValueForID();
    this.isEdit = this.form.get('update').value;
    this.updateYoroFlowInfo();
    this.isFromTabbedMenu();
    if (this.isExclude) {
      this.isExcludeButton();
    }
    this.formObj.emit(this);
    this.checkAutoComplete();
    this.getTaskBoardTaskEmitter();
    if (this.preview) {
      this.form.disable();
      this.form.addControl('preview', this.fb.control(true));
    }
    this.setFormValues();
    this.loadButtonActions();
    if (this.editable === undefined) {
      this.form.addControl('isFormEditable', this.fb.control(true));
    } else if (this.editable === true) {
      this.form.addControl('isFormEditable', this.fb.control(true));

    } else {
      this.form.addControl('isFormEditable', this.fb.control(false));
    }
  }

  loadButtonActions(): void {
    if (this.inputObject) {
      this.dialoagBoxComponent = this.inputObject;
      this.dialoagBoxComponent.buttonEmitter.subscribe(data => {
        if (data === 'draft') {
          this.saveAsDraft();
        } else if (data === 'submit') {
          this.submitTask(this.yoroflowInfo);
        } else if (data === 'approve') {
          this.approve(this.yoroflowInfo);
        } else if (data === 'reject') {
          this.reject();
        } else if (data === 'sendBack') {
          this.sendBack();
        } else if (data === 'assign') {
          this.assignToSomeone();
        } else if (data === 'cancel') {
          this.cancelTask();
        } else if (data === 'close') {
          this.closeDialog();
        }
      });
    }
  }

  setFormValues() {
    if (this.taskBoardTask !== undefined && this.taskBoardTask !== null) {
      this.taskBoardTask.formValues.subscribe(data => {
        if (data !== false) {
          this.form = null;
          if (this.form === undefined || this.form === null) {
            this.form = this.formService.createForm(this.page.sections);
          }
          this.loadFormValues();
        }
      });
    }
  }

  getTaskBoardTaskEmitter() {
    // if (window.location.href.includes("/taskboard") || window.location.href.includes("/landing-dashboard")) {
    if (this.taskObject !== undefined && this.taskObject !== null && this.taskObject !== '') {
      this.fromTaskboard = true;
      let isEmit = false;
      let isSignature = false;
      this.form.addControl('isWorkflow', this.fb.control(true));
      this.taskBoardTask = this.taskObject;
      this.taskBoardTask.formDetails.subscribe((data) => {
        let isError = false;
        this.page.sections.forEach((section) => {
          section.rows.forEach((row) => {
            row.columns.forEach((column) => {
              if (column.controlType === 'date') {
                if (this.form.get(column.field.name).value && this.form.get(column.field.name).value !== null) {
                  const stringified = JSON.stringify(this.form.get(column.field.name).value);
                  if (stringified && stringified.length > 10) {
                    const dob = stringified.substring(1, 11);
                    this.form.get(column.field.name).setValue(dob, { emitEvent: false });
                  }
                }
              }
              if (column.controlType !== 'checkbox' && column.controlType !== 'label' && column.controlType !== 'signaturecontrol' && column.controlType !== 'tel' && column.controlType !== 'paragraph') {
                if (column.field && column.field.name && column.field.name !== null &&
                  this.form.get(column.field.name).value !== undefined && this.form.get(column.field.name).value !== null &&
                  this.form.get(column.field.name).value !== '' && (this.form.get(column.field.name).value.length && this.form.get(column.field.name).value.length > 0) && isEmit === false) {
                  isEmit = true;
                }
                if (this.form.get(column.field.name) && this.form.get(column.field.name).errors !== undefined && this.form.get(column.field.name).errors !== null
                  && this.form.get(column.field.name).errors.required !== true
                  && this.taskBoardTask.isOpenView !== true) {
                  this.form.get(column.field.name).markAsTouched();
                  isError = true;
                }
              }
              if (column.controlType === 'table') {
                const formArray = this.form.get(column.field.control.tableId) as FormArray;
                for (let i = 0; i < formArray.length; i++) {
                  column.field.control.columns.forEach((table) => {
                    const name = formArray.get('' + i).get(table.field.name);
                    if (table.controlType === 'date') {
                      if (name.value && name.value !== null) {
                        const stringified = JSON.stringify(name.value);
                        if (stringified && stringified.length > 10) {
                          const dob = stringified.substring(1, 11);
                          name.setValue(dob, { emitEvent: false });
                        }
                      }
                    }
                    if (name.value !== undefined && name.value !== null && name.value !== '' && isEmit === false) {
                      isEmit = true;
                    }
                    if (name && name.errors !== undefined && name.errors !== null && name.errors.required !== true && this.taskBoardTask.isOpenView !== true) {
                      name.markAsTouched();
                      isError = true;

                    }
                  });
                }
              }

              if (column.controlType === 'tel') {
                if (this.form.get(column.field.name).value !== null) {
                  if (column.field && column.field.name && column.field.name !== null &&
                    isEmit === false) {
                    isEmit = true;
                  }

                }
              }

              if (column.controlType === 'checkbox') {
                if (column.field && column.field.name && column.field.name !== null &&
                  this.form.get(column.field.name).value === true && isEmit === false) {
                  isEmit = true;
                }
              }
              if (column.controlType === 'signaturecontrol') {
                if (column.field && column.field.name && column.field.name !== null &&
                  this.form.get(column.field.name).value !== '' && isEmit === false) {
                  isEmit = true;
                  isSignature = true;
                }
              }

            });
          });
          if (section && section.sections) {
            section.sections.forEach((section) => {
              if (section.repeatable === false && section.repeatableName === null) {
                section.rows.forEach((row) => {
                  row.columns.forEach((column) => {
                    if (column.controlType === 'date') {
                      if (this.form.get(column.field.name).value && this.form.get(column.field.name).value !== null) {
                        const stringified = JSON.stringify(this.form.get(column.field.name).value);
                        if (stringified && stringified.length > 10) {
                          const dob = stringified.substring(1, 11);
                          this.form.get(column.field.name).setValue(dob, { emitEvent: false });
                        }
                      }
                    }
                    if (column.field && column.field.name && column.field.name !== null &&
                      this.form.get(column.field.name).value !== undefined && this.form.get(column.field.name).value !== null &&
                      this.form.get(column.field.name).value !== '' && isEmit === false) {
                      isEmit = true;
                    }
                    if (this.form.get(column.field.name) && this.form.get(column.field.name).errors !== undefined && this.form.get(column.field.name).errors !== null
                      && this.form.get(column.field.name).errors.required !== true
                      && this.taskBoardTask.isOpenView !== true) {
                      this.form.get(column.field.name).markAsTouched();
                      isError = true;
                    }
                  });
                });
              }
              if (section.repeatable !== false && section.repeatableName !== null) {
                const formArray = this.form.get(section.repeatableName) as FormArray;
                section.rows.forEach((row) => {
                  row.columns.forEach((column) => {
                    for (let i = 0; i < formArray.length; i++) {
                      if (formArray.get('' + i).get(column.field.name) !== null) {
                        const subname = formArray.get('' + i).get(column.field.name);
                        if (column.controlType === 'date') {
                          if (subname.value && subname.value !== null) {
                            const stringified = JSON.stringify(subname.value);
                            if (stringified && stringified.length > 10) {
                              const dob = stringified.substring(1, 11);
                              subname.setValue(dob, { emitEvent: false });
                            }
                          }
                        }
                        if (subname !== null && subname !== undefined && subname.value !== undefined && subname.value !== null && subname.value !== '' && isEmit === false) {
                          isEmit = true;
                        }
                        if (subname && subname.errors !== undefined && subname.errors !== null && subname.errors.required !== true && this.taskBoardTask.isOpenView !== true) {
                          subname.markAsTouched();
                          isError = true;
                        }
                      }
                    }
                  });
                });

              }


            });
          }
        });
        if (isEmit === true && isError === false) {
          if (this.checkSignatureChange() === false) {
            this.isFormChanged = !this.form.pristine;
          } else {
            this.isFormChanged = true;
          }
          this.formObj.emit(this);
        } else if (isError !== false) {
          this.formObj.emit('error contains');
        } else {
          this.formObj.emit(true);
        }
      });

    }
    // }
  }

  checkSignatureChange() {
    let isChanged = false;
    if (this.signatureControlInstance.length > 0) {
      this.signatureControlInstance.forEach((signatureComponent) => {
        if (signatureComponent.isChanged === true) {
          isChanged = true;
        }
      });
    }
    return isChanged;
  }

  addFilterFormGroup(): FormGroup {
    return this.fb.group({
      fieldNames: [''],
    });
  }

  addFilterFormGroupArray() {
    const formArray = this.form.get('autoCompleteFilterArray') as FormArray;
    formArray.push(this.addFilterFormGroup());
  }
  addResetButtonActionEmitter() {
    if (this.buttonComponentInstance) {
      this.buttonComponentInstance.resetEmitter.subscribe((data) => {
        if (data === true) {
          this.chipService.chipControlsNames.forEach((name) => {
            this.chipService.chipComponents[name].placeholder = [];
          });
          this.setPageSectionSecurity();
        }
      });
    }
  }

  gridRefreshWhenDelete() {
    if (this.buttonComponentDeleteInstance) {
      this.buttonComponentDeleteInstance.deleteEmitter.subscribe((data) => {
        if (data === true) {
          if (
            this.gridComponentInstance &&
            this.gridComponentInstance.gridConfig
          ) {
            this.gridComponentInstance.gridConfig.refreshGrid();
          }
        }
      });
    }
  }

  isFromTabbedMenu() {
    if (
      this.loadFormInfo &&
      this.loadFormInfo.isFromTabbedMenu &&
      this.loadFormInfo.isFromTabbedMenu === true
    ) {
      this.form.addControl('isFromTabbedMenu', this.fb.control(true));
    }
  }

  isExcludeButton() {
    this.form.addControl('isExcludeButton', this.fb.control(true));
  }

  updateYoroFlowInfo() {
    if (this.yoroflowInfo) {
      this.form.addControl(
        'isWorkflow',
        this.fb.control(this.yoroflowInfo.isWorkflow)
      );
      this.form.addControl(
        'workflowId',
        this.fb.control(this.yoroflowInfo.workflowId)
      );
      this.form.addControl(
        'workflowTaskId',
        this.fb.control(this.yoroflowInfo.workflowTaskId)
      );
      this.form.addControl(
        'isApproveRejectForm',
        this.fb.control(this.yoroflowInfo.isApproveRejectForm)
      );
    }
  }

  approve(yoroflowInfo) {
    this.checkRequiredValidationForTableColumns(this.page.sections, true);
    if (this.form.valid && this.allowToSubmit) {
      const dialogRef = this.matDialog.open(
        RenderingConfirmDialogBoxComponent,
        {
          disableClose: true,
          width: '350px',
          data: {
            type: 'submit-task',
            status: yoroflowInfo.status,
            message: yoroflowInfo.approveMessage,
          },
        }
      );
      dialogRef.afterClosed().subscribe((data) => {
        if (data === true) {
          this.setValueForID();
          if (this.form.get('removedFiles') && this.form.get('removedFiles').value !== undefined
            && this.form.get('removedFiles').value !== null
            && this.form.get('removedFiles').value !== '') {
            const file = this.form.get('removedFiles').value;
            this.deleteFile(file);
          }
          // this.checkFormArray();
          this.removeFormControls();
          this.form.removeControl('isApproveRejectForm');
          this.form.addControl('approvalStatus', this.fb.control('approved'));
          const formValue = this.form.getRawValue();
          this.removeValuesFromTable(formValue, this.page.sections);
          this.submit.emit({ yoroflow: formValue, status });
        }
      });
    } else {
      this.formValidationService.validateAllFormFields(this.form);
    }
  }

  reject() {
    if (this.form.valid) {
      const dialogRef = this.matDialog.open(
        RenderingConfirmDialogBoxComponent,
        {
          disableClose: true,
          width: '350px',
          data: {
            type: 'reject-task',
            message: this.yoroflowInfo.rejectMessage,
          },
        }
      );
      dialogRef.afterClosed().subscribe((data) => {
        if (data === true) {
          this.setValueForID();
          if (this.form.get('removedFiles') && this.form.get('removedFiles').value !== undefined
            && this.form.get('removedFiles').value !== null
            && this.form.get('removedFiles').value !== '') {
            const file = this.form.get('removedFiles').value;
            this.deleteFile(file);
          }
          // this.checkFormArray();
          this.removeFormControls();
          this.form.removeControl('isApproveRejectForm');
          this.form.addControl('approvalStatus', this.fb.control('rejected'));
          const formValue = this.form.getRawValue();
          this.removeValuesFromTable(formValue, this.page.sections);
          this.submit.emit({ yoroflow: formValue });
        }
      });
    } else {
      this.formValidationService.validateAllFormFields(this.form);
    }
  }

  deleteFile(file) {
    this.form.removeControl('removedFiles');
    this.pageService.deleteFile(file).subscribe(data => {
    });
  }

  saveAsDraft() {
    this.setValueForID();
    if (this.form.get('removedFiles') && this.form.get('removedFiles').value !== undefined
      && this.form.get('removedFiles').value !== null
      && this.form.get('removedFiles').value !== '') {
      const file = this.form.get('removedFiles').value;
      this.deleteFile(file);
    }
    // this.checkFormArray();
    this.removeFormControls();
    this.form.removeControl('isApproveRejectForm');
    const formValue = this.form.getRawValue();
    this.removeValuesFromTable(formValue, this.page.sections);
    this.submit.emit({ yoroflow: formValue, saveAsDraft: true });
  }

  checkFormArray() {
    this.page.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns
          .filter((table) => table.controlType === 'table')
          .forEach((column) => {
            if (column.controlType === 'table') {
              if (column.field.control) {
                const table = column.field.control as Table;
                this.removeNullValues(
                  this.form.get(table.tableId) as FormArray
                );
              }
            }
          });
      });
    });
  }

  checkAutoComplete() {
    let i = 0;
    this.page.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns.forEach((column) => {
          if (column.controlType === 'autocomplete') {
            if (column.field.control.filters) {
              this.filterArray.push({ name: column.field.name, index: i++ });
            }
          }
        });
      });
    });
    this.form.get('autoCompleteArray').patchValue(this.filterArray);
  }

  submitTask(yoroflowInfo) {
    this.setValueForID();
    // this.checkFormArray();
    this.removeFormControls();
    this.form.removeControl('isApproveRejectForm');
    this.checkGroupValidation();
    this.checkRequiredValidationForTableColumns(this.page.sections, true);
    if (this.form.valid && this.allowToSubmit) {
      const dialogRef = this.matDialog.open(
        RenderingConfirmDialogBoxComponent,
        {
          disableClose: true,
          width: '350px',
          data: {
            type: 'submit-task',
            status: yoroflowInfo.status,
            message: yoroflowInfo.message,
          },
        }
      );
      dialogRef.afterClosed().subscribe((data) => {
        if (data === true) {
          if (this.form.get('removedFiles') && this.form.get('removedFiles').value !== undefined
            && this.form.get('removedFiles').value !== null
            && this.form.get('removedFiles').value !== '') {
            const file = this.form.get('removedFiles').value;
            this.deleteFile(file);
          }
          const formValue = this.form.getRawValue();
          this.removeValuesFromTable(formValue, this.page.sections);
          this.submit.emit({ yoroflow: formValue, status });
        }
      });
    } else {
      this.formValidationService.validateAllFormFields(this.form);
    }
  }

  cancelTask() {
    const dialog = this.dialog.open(RenderingConfirmDialogBoxComponent, {
      width: '400px',
      data: 'cancelTask',
    });
    dialog.afterClosed().subscribe((data) => {
      if (data === true) {
        this.submit.emit({ value: true });
      }
    });
  }

  assignToSomeone() {
    if (!this.form.get('pageIdentifier')) {
      this.form.addControl('pageIdentifier', this.fb.control(this.page.pageId));
    }
    if (!this.form.get('version')) {
      this.form.addControl('version', this.fb.control(this.page.version));
    }
    const dialogRef = this.matDialog.open(RenderingConfirmDialogBoxComponent, {
      disableClose: true,
      width: '450px',
      data: {
        type: 'assignee-user',
        pageIdentifier: this.form.get('pageIdentifier').value,
        version: this.form.get('version').value,
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data && data.type === true && data !== false) {
        this.setValueForID();
        if (this.form.get('removedFiles') && this.form.get('removedFiles').value !== undefined
          && this.form.get('removedFiles').value !== null
          && this.form.get('removedFiles').value !== '') {
          const file = this.form.get('removedFiles').value;
          this.deleteFile(file);
        }
        // this.checkFormArray();
        this.removeFormControls();
        this.form.removeControl('isApproveRejectForm');
        const json = {
          instanceId: this.form.get('workflowId').value,
          instanceTaskId: this.form.get('workflowTaskId').value,
          assignedToUser: data.json.userId,
          assignedToGroup: data.json.groupId,
          comments: data.json.comments,
        };
        const formValue = this.form.getRawValue();
        this.removeValuesFromTable(formValue, this.page.sections);
        this.submit.emit({
          yoroflow: json,
          taskData: formValue,
          reAssign: true,
        });
      }
    });
  }

  requiredValidationForSigantureControl() {
    this.page.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns.forEach((column) => {
          if (column.controlType === 'signaturecontrol') {
            column.field.validations.forEach((required) => {
              if (required.type === 'required') {
                this.form
                  .get(column.field.name)
                  .setValidators(Validators.required);
              }
            });
          }
        });
      });
    });
  }

  checkGroupValidation() {
    this.page.sections.forEach((section) => {
      if (
        section.groupValidation &&
        section.groupValidation.required === true
      ) {
        const conditionalFields = section.groupValidation.conditionalFields;
        conditionalFields.forEach((conditionalField) => {
          if (
            this.form.get(conditionalField.fieldName).value ===
            conditionalField.value
          ) {
            const requiredFields = section.groupValidation.requiredFields;
            let count = 0;
            let errorMessage = '';
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < requiredFields.length; i++) {
              const value = this.form.get(requiredFields[i].fieldName).value;
              errorMessage =
                errorMessage + '[' + requiredFields[i].fieldLabel + ']';
              if (value === null || value === '' || value === false) {
                count++;
              }
            }
            errorMessage = errorMessage + ' one of field is required';
            if (count === requiredFields.length) {
              this.form.setErrors({ invalid: true });
              this.showGroupErrorMessage = true;
              this.groupErrorMessage = errorMessage;
              this.allowToSubmit = false;
            } else {
              this.allowToSubmit = true;
              this.showGroupErrorMessage = false;
              this.form.setErrors(null);
            }
          } else {
            this.showGroupErrorMessage = false;
            this.allowToSubmit = true;
            this.form.setErrors(null);
          }
        });
      }
    });
  }

  setValidationErrosMessageForGroupValidation(name) {
    this.page.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns.forEach((column) => {
          if (column.field.name === name) {
            const validations = column.field.validations;
            if (
              !validations.some((validation) => validation.type === 'required')
            ) {
              validations.push({ type: 'required', value: null });
            }
          }
        });
      });
    });
  }

  sendBack() {
    const dialogRef = this.matDialog.open(RenderingConfirmDialogBoxComponent, {
      disableClose: true,
      width: '450px',
      data: { type: 'send-back' },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data && data.type === true && data !== false) {
        this.setValueForID();
        if (this.form.get('removedFiles') && this.form.get('removedFiles').value !== undefined
          && this.form.get('removedFiles').value !== null
          && this.form.get('removedFiles').value !== '') {
          const file = this.form.get('removedFiles').value;
          this.deleteFile(file);
        }
        // this.checkFormArray();
        this.removeFormControls();
        this.form.removeControl('isApproveRejectForm');
        this.form.addControl('approvalStatus', this.fb.control('sendback'));
        this.form.addControl('sendBackComments', this.fb.control(data.json.comments));
        const formValue = this.form.getRawValue();
        this.removeValuesFromTable(formValue, this.page.sections);
        this.submit.emit({
          yoroflow: formValue,
          sendBackComments: data.json.comments,
        });
      }
    });
  }

  setAllowToCreateOrNot() {
    if (this.pageSecurity) {
      if (this.pageSecurity.create === false) {
        this.formValidationService.disableAllFormFields(this.form, true);
      }
    }
  }

  setPageSectionSecurity() {
    if (this.page.sections) {
      this.page.sections.forEach((section) => {
        if (
          section.sectionSecurity &&
          section.sectionSecurity.create === false
        ) {
          this.formValidationService.disableSectionFormFields(
            this.form,
            section,
            true
          );
        }
      });
    }
  }

  loadFormValues() {
    if (this.loadFormInfo) {
      if (this.loadFormInfo.pageType !== undefined) {
        this.dynamicService
          .getPageDataByFieldNameAndValue(
            this.loadFormInfo.pageName,
            this.loadFormInfo.id,
            this.loadFormInfo.pId,
            this.page.version
          )
          .subscribe((data) => {
            this.loadFormService.testsetFormValues(
              this.form,
              data.data,
              this.loadFormInfo.pageName,
              this.isEdit,
              null,
              this.page.version
            );
          });
      } else {
        this.dataService
          .getGridData(
            this.loadFormInfo.pageIdentifier,
            this.loadFormInfo.id,
            this.page.version
          )
          .subscribe((data) => {
            this.loadFormService.testsetFormValues(
              this.form,
              data.data,
              this.loadFormInfo.pageIdentifier,
              this.pageSecurity.update,
              this.page.sections,
              this.page.version
            );
            this.create = true;
          });
      }
    }
    if (this.yoroflowInfo) {
      if (this.yoroflowInfo.workflowTaskId !== undefined && !this.yoroflowInfo.isInitialValues) {
        this.progressBar.emit(true);
        this.dataService
          .getInitialValues(this.yoroflowInfo.workflowTaskId)
          .subscribe(
            (data) => {
              this.progressBar.emit(false);
              if (data && Object.keys(data).length > 0) {
                this.loadHyperLinks(data);
                if (this.yoroflowInfo.status === 'COMPLETED') {
                  this.checkEnableRowAddition();
                  this.loadFormService.loadFormValues(
                    this.form,
                    data,
                    this.page.sections,
                    false
                  );
                  this.formValidationService.disableAllFormFields(
                    this.form,
                    true
                  );
                } else {
                  this.loadFormService.loadFormValues(
                    this.form,
                    data,
                    this.page.sections,
                    true
                  );
                }
              } else {
                if (this.yoroflowInfo.status === 'COMPLETED') {
                  this.checkEnableRowAddition();
                  this.loadFormService.loadFormValues(
                    this.form,
                    data,
                    this.page.sections,
                    false
                  );
                  this.formValidationService.disableAllFormFields(
                    this.form,
                    true
                  );
                }
              }
            },
            (error) => {
              this.progressBar.emit(false);
            }
          );
      } else if (this.yoroflowInfo.isInitialValues) {
        if (this.yoroflowInfo.taskData && Object.keys(this.yoroflowInfo.taskData).length > 0) {
          this.loadHyperLinks(this.yoroflowInfo.taskData);
          this.checkEnableRowAddition();
          this.loadFormService.loadFormValues(
            this.form,
            this.yoroflowInfo.taskData,
            this.page.sections,
            false
          );
        }
        this.formValidationService.disableAllFormFields(this.form, true);
      }
    } else if (!this.preview && (window.location.href.includes('/taskboard') ||
      window.location.href.includes('/my-pending-task') ||
      window.location.href.includes('/landing-dashboard') ||
      window.location.href.includes('/workspace-dashboard')) &&
      this.formData && this.formData.taskData) {
      this.loadFormService.loadFormValues(
        this.form,
        this.formData.taskData,
        this.page.sections,
        true
      );
    }
  }

  checkEnableRowAddition() {
    this.page.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns
          .filter((table) => table.controlType === 'table')
          .forEach((column) => {
            if (column.controlType === 'table') {
              if (column.field.control) {
                const table = column.field.control as Table;
                table.enableRowAddition = false;
              }
            }
          });
      });
    });
  }

  loadHyperLinks(data) {
    this.page.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns
          .filter((column) => column.controlType === 'hyperlink')
          .forEach((hyperLinkColumn) => {
            if (data[hyperLinkColumn.field.name]) {
              try {
                const link: HyperLink[] = JSON.parse(
                  data[hyperLinkColumn.field.name]
                );
                if (link.length > 0) {
                  hyperLinkColumn.field.control.hyperLink = [];
                  hyperLinkColumn.field.control.hyperLink = link;
                }
              } catch (e) { }
            }
          });
      });
    });
  }

  pageIdentifier() {
    this.form.addControl('pageIdentifier', this.fb.control([]));
    if (this.loadFormInfo) {
      if (this.loadFormInfo.pageName !== undefined) {
        this.form.get('pageIdentifier').setValue(this.loadFormInfo.pageName);
      }
    } else {
      this.form.get('pageIdentifier').setValue(this.page.pageId);
    }
  }

  removePageIdentifier() {
    this.form.removeControl('pageIdentifier');
  }

  version() {
    this.form.addControl('version', this.fb.control([]));
    if (this.page) {
      if (this.page.version !== undefined) {
        this.form.get('version').setValue(this.page.version);
      }
    }
  }

  removeVersion() {
    this.form.removeControl('version');
  }

  addSecurityValues() {
    this.form.addControl('create', this.fb.control([]));
    this.form.addControl('update', this.fb.control([]));
    this.form.addControl('sectionCreate', this.fb.control([]));
    this.form.addControl('sectionUpdate', this.fb.control([]));
    if (this.pageSecurity) {
      this.form.get('create').setValue(this.pageSecurity.create);
      this.form.get('update').setValue(this.pageSecurity.update);
    }

    if (this.page.sections) {
      const formArray = this.form.get('section') as FormArray;
      this.page.sections.forEach((section) => {
        if (section.sectionSecurity) {
          this.form
            .get('sectionCreate')
            .setValue(section.sectionSecurity.create);
          this.form
            .get('sectionUpdate')
            .setValue(section.sectionSecurity.update);
        }
      });
    }
  }

  removeSecurityFromForm() {
    this.form.removeControl('create');
    this.form.removeControl('update');
    this.form.removeControl('sectionCreate');
    this.form.removeControl('sectionUpdate');
  }

  removeTabbedMenuDetails() {
    if (this.form.get('isFromTabbedMenu')) {
      this.form.removeControl('isFromTabbedMenu');
    }
  }

  getChipComponentInstance($event) {
    if ($event.$event instanceof GridComponent) {
      this.gridComponentInstance = $event.$event;
    } else if ($event.$event instanceof ChipComponent) {
      this.chipService.chipControlsNames.push(
        ($event.$event as ChipComponent).field.name
      );
      this.chipService.addChipComponents($event);
    } else if ($event.$event instanceof ButtonComponent) {
      if (
        ($event.$event as ButtonComponent).field.control.buttonType === 'reset'
      ) {
        this.buttonComponentInstance = $event.$event;
        this.addResetButtonActionEmitter();
      } else if (
        ($event.$event as ButtonComponent).field.control.buttonType === 'delete'
      ) {
        this.buttonComponentDeleteInstance = $event.$event;
        this.gridRefreshWhenDelete();
      } else if (
        ($event.$event as ButtonComponent).field.control.buttonType === 'action'
      ) {
        this.buttonComponentActionType = $event.$event;
        this.formObj.emit(this);
      }
    } else if ($event.$event instanceof FileUploadComponent) {
      this.fileUploadComponentInstance.push($event.$event);
    } else if ($event.$event instanceof SignatureComponent) {
      this.signatureControlInstance.push($event.$event);
    }
  }

  removeFormControls() {
    this.removeSecurityFromForm();
    this.removePageIdentifier();
    this.removeTabbedMenuDetails();
    this.removeVersion();
    this.removeAutoCompleteControls();
    this.form.removeControl('isExcludeButton');
    this.form.removeControl('search');
  }

  removeAutoCompleteControls() {
    if (this.form.get('autoCompleteArray')) {
      this.form.removeControl('autoCompleteArray');
    }
    if (this.form.get('autoCompleteValue')) {
      this.form.removeControl('autoCompleteValue');
    }
  }

  checkFileUploadedOrNot() {
    this.fileUploadComponentInstance.forEach(
      (fileComponentInstance: FileUploadComponent) => {
        if (fileComponentInstance.allowToSubmit === true) {
          this.form.markAsDirty();
        }
      }
    );
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
    const blob = this.dataURLToBlob(dataUrl);
    const name = new Date().getTime() + '.png' + fieldName;
    const fileData = new File([blob], name);
    return fileData;
  }

  checkFilesExistOrNot() {
    this.files = [];
    if (this.signatureControlInstance.length > 0) {
      this.signatureControlInstance.forEach((signatureComponent) => {
        const file = this.form.get(signatureComponent.field.name).value;
        if (file && file instanceof File) {
          this.files.push(file);
        } else if (file) {
          this.files.push(this.saveFile(file, signatureComponent.field.name));
        }
      });
    }
  }

  getFilesAndJsonFormData() {
    if (this.files.length > 0) {
      const formData = new FormData();
      formData.append('jsonData', JSON.stringify(this.form.getRawValue()));
      this.files.forEach((file) => {
        formData.append('files', file);
      });
      return formData;
    }
  }

  onSubmit(event: Event, dynamicForm) {
    this.page.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns.forEach((column) => {
          if (column.controlType === 'fileupload') {
            column.field.validations.forEach(validation => {
              if (validation.type === 'required') {
                this.form.get(column.field.name).markAsDirty();
              }
            });
          }
        });
      });
    });
    this.page.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns.forEach((column) => {
          if (column.controlType === 'tel') {
            column.field.validations.forEach(validation => {
              if (validation.type === 'required') {
                this.form.get(column.field.name).markAsTouched();
              } else if (validation.type === 'minlength' || validation.type === 'maxlength') {
                this.form.get(column.field.name).markAsDirty();
              }
            });
          }
        });
      });
    });
    event.preventDefault();
    event.stopPropagation();
    this.setValueForID();
    this.checkFormArray();
    // this.removeFormControls();
    this.checkFilesExistOrNot();
    Object.keys(this.form.controls).forEach((field) => {
      if (this.form.get(field).value === '') {
        this.form.get(field).setValue(null);
      }
    });
    const formJson = this.form.getRawValue();
    this.formService.setDateFormat(this.page.sections, this.form, formJson);
    this.checkGroupValidation();
    this.checkRequiredValidationForTableColumns(this.page.sections, true);
    // this.requiredValidationForSigantureControl();
    const formValue = this.form.getRawValue();
    this.removeValuesFromTable(formValue, this.page.sections);
    this.chipService.setChipValueForFormControls(
      this.page.sections,
      formValue,
      this.form
    );
    if (this.form.valid && this.allowToSubmit) {
      this.chipService.removePlaceholder(this.page.sections);
      this.removeFormControls();
      if (this.form.get('removedFiles') && this.form.get('removedFiles').value !== undefined
        && this.form.get('removedFiles').value !== null
        && this.form.get('removedFiles').value !== '') {
        const file = this.form.get('removedFiles').value;
        this.deleteFile(file);
      }
      const formValues = this.form.getRawValue();
      if (this.files.length === 0) {
        this.submit.emit({
          json: formValues,
          form: dynamicForm,
          gridComponent: this.gridComponentInstance,
          instance: this,
        });
      } else {
        this.submit.emit({
          isFile: true,
          json: this.getFilesAndJsonFormData(),
          form: dynamicForm,
          gridComponent: this.gridComponentInstance,
          instance: this,
        });
      }
    } else {
      this.formValidationService.validateAllFormFields(this.form);
    }
  }

  setValueForID() {
    this.form.get('yorosisPageId').setValue(this.page.yorosisPageId);
    const primaryKey = this.form.get(this.page.sections[0].primaryKey).value;
    if (primaryKey < 0 || primaryKey === null || primaryKey === undefined) {
      this.form.get(this.page.sections[0].primaryKey).setValue('-1');
    }
    this.setSectionsPrimaryKey(this.page.sections);
  }

  setSectionsPrimaryKey(sections: Section[]) {
    sections.forEach((section) => {
      if (section.repeatable === true && section.repeatableName !== null) {
        const formArray = this.form.get(section.repeatableName) as FormArray;
        this.setFormArrayPrimaryKey(formArray);
      }
      if (section.sections && section.sections.length > 0) {
        this.setSectionsPrimaryKey(section.sections);
      }
      this.setTableControlPrimaryKeyValue(section);
    });
  }

  setFormArrayPrimaryKey(formArray: FormArray) {
    if (formArray) {
      for (let i = 0; i < formArray.length; i++) {
        const index = '' + i;
        const group = formArray.get(index) as FormGroup;
        const value = group.get('id').value;
        if (value < 0 || value === null || value === undefined) {
          group.get('id').setValue('-1');
        }
      }
    }
  }

  setTableControlPrimaryKeyValue(section: Section) {
    section.rows.forEach((row) => {
      row.columns
        .filter((table) => table.controlType === 'table')
        .forEach((column) => {
          if (column.controlType === 'table') {
            if (column.field.control) {
              const table = column.field.control as Table;
              this.setFormArrayPrimaryKey(
                this.form.get(table.tableId) as FormArray
              );
            }
          }
        });
    });
  }

  removeNullValues(formArray) {
    const length = formArray.length;
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.get(i + '') as FormGroup;
      let j = 0;
      Object.keys(group.controls).forEach((arrayField) => {
        const formArrayControl = group.get(arrayField);
        if (formArrayControl.value !== '-1') {
          if (
            formArrayControl.value !== '' &&
            formArrayControl.value !== null
          ) {
            j++;
          }
        }
      });
      if (j === 0) {
        formArray.removeAt(i);
        i = i - 1;
      }
    }
  }

  checkRequiredValidationForTableColumns(
    sections: Section[],
    setRequired: boolean
  ) {
    sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns
          .filter((r) => r.controlType === 'table')
          .forEach((table) => {
            const tableControl = table.field.control as Table;
            this.setRequiredValidationForTableControl(table, setRequired);
            this.formValidationService.setCustomErrors(
              this.form.get(tableControl.tableId) as FormArray,
              tableControl.columns
            );
          });
      });
      if (section.sections && section.sections.length > 0) {
        this.checkRequiredValidationForTableColumns(
          section.sections,
          setRequired
        );
      }
    });
  }

  setRequiredValidationForTableControl(fieldConfig: FieldConfig, required) {
    const field = fieldConfig.field;
    if (field.control) {
      const table = field.control as Table;
      const fields = table.columns;
      const formArray = this.form.get(table.tableId) as FormArray;
      for (let i = 0; i < formArray.length; i++) {
        const index = '' + i;
        const formArrayGroup = formArray.get(index);
        let setRequired = false;
        fields.forEach((tableField) => {
          const value = formArrayGroup.get(tableField.field.name).value;
          if (value !== null && value !== '') {
            setRequired = true;
          }
        });
        if (setRequired) {
          fields.forEach((tableField) => {
            const value = formArrayGroup.get(tableField.field.name);
            if (required) {
              if (
                tableField.field.validations &&
                tableField.field.validations.length > 0
              ) {
                if (
                  tableField.field.validations.some(
                    (a) => a.type === 'required'
                  )
                ) {
                  value.setValidators([Validators.required]);
                }
              } else if (tableField.field.required === true) {
                value.setValidators([Validators.required]);
              }
            } else {
              value.setErrors(null);
            }
            value.updateValueAndValidity();
          });
        } else {
          const formArrayGroup = formArray.get('' + 0);
          fields.forEach((tableField) => {
            const value = formArrayGroup.get(tableField.field.name);
            if (required) {
              if (
                tableField.field.validations &&
                tableField.field.validations.length > 0
              ) {
                if (
                  tableField.field.validations.some(
                    (a) => a.type === 'required'
                  )
                ) {
                  value.setValidators([Validators.required]);
                }
              } else if (tableField.field.required === true) {
                value.setValidators([Validators.required]);
              }
            } else {
              value.setErrors(null);
            }
            value.updateValueAndValidity();
          });
        }

        if (!required) {
          fields.forEach((tableField) => {
            const value = formArrayGroup.get(tableField.field.name);
            value.setErrors(null);
            value.updateValueAndValidity();
          });
        }
      }
    }
  }

  changeDate(jsonObject, sections: Section[]) {
    sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns
          .filter((a) => a.controlType === 'table')
          .forEach((table) => {
            const tableVO = table.field.control as Table;
            const tableDatas: any[] = jsonObject[tableVO.tableId];
            const removeObjectIndex: any[] = [];
            for (let i = 0; i < tableDatas.length; i++) {
              const rowData = tableDatas[i];
              let j = 0;
              tableVO.columns.forEach((column) => {
                if (column.controlType === 'date') {
                  const value = rowData[column.field.name];
                  if (value !== null && value !== '' && value !== undefined) {
                    j++;
                  }
                }
              });
            }
          });
      });
      if (section.sections) {
        this.removeValuesFromTable(jsonObject, section.sections);
      }
    });
  }

  removeValuesFromTable(jsonObject, sections: Section[]) {
    sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.columns
          .filter((a) => a.controlType === 'table')
          .forEach((table) => {
            const tableVO = table.field.control as Table;
            const tableDatas: any[] = jsonObject[tableVO.tableId];
            const removeObjectIndex: any[] = [];
            for (let i = 0; i < tableDatas.length; i++) {
              const rowData = tableDatas[i];
              let j = 0;
              tableVO.columns.forEach((column) => {
                const value = rowData[column.field.name];
                if (value !== null && value !== '' && value !== undefined) {
                  j++;
                }
              });
              if (j === 0) {
                removeObjectIndex.push(i);
              }
            }
            removeObjectIndex.forEach((index) => {
              tableDatas.splice(index);
            });
          });
      });
      if (section.sections) {
        this.removeValuesFromTable(jsonObject, section.sections);
      }
    });
  }
  closeDialog() {
    this.dialogEmitterService.dialogEmitter.emit(true);
  }
}
