import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColorpickerService } from './colorpicker.service';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  TaskboardVO,
  ProgressName,
  TaskboardTemplatesVO,
  TaskboardTemplatesCategories,
  ResolveSecurityForTaskboardVO,
  TaskboardColumns,
} from '../taskboard-configuration/taskboard.model';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';
import {
  CdkDragDrop
} from '@angular/cdk/drag-drop';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CreateFormDialogComponent } from '../../designer-module/create-form-dialog-box/create-form-dialog-box.component';
import { TaskboardTaskVO } from '../taskboard-form-details/taskboard-task-vo';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { MatStepper } from '@angular/material/stepper';
import { Page } from 'src/app/rendering-module/shared/vo/page-vo';
import { Security } from 'src/app/creation-module/shared/vo/page-vo';
import { debounceTime } from 'rxjs/operators';
import { EventAutomationService } from '../event-automation/event-automation.service';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { WorkflowDashboardService } from 'src/app/engine-module/work-flow-dashboard/workflow-dashboard.service';
import { ClipboardModule, ClipboardService } from 'ngx-clipboard';
import { TemplateDialogComponent } from '../template-dialog/template-dialog.component';
import { SprintDialogComponent } from '../sprint-dialog/sprint-dialog.component';
import { SprintSettings } from '../sprint-dialog/sprint-model';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { PageFieldVo, PageFieldVO } from 'src/app/designer-module/task-property/page-field-vo';
import { TaskPropertyService } from 'src/app/designer-module/task-property/task-property.service';
import { constants } from 'buffer';
import { forkJoin } from 'rxjs';
import { CreateOrganizationService } from 'src/app/creation-module/create-organization/create-organization.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'app-taskboard-configuration-dialog',
  templateUrl: './taskboard-configuration-dialog.component.html',
  styleUrls: ['./taskboard-configuration-dialog.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class TaskboardConfigurationDialogComponent implements OnInit {
  public config: PerfectScrollbarConfigInterface = {};
  form: FormGroup;
  colorArray: any[] = [];
  taskboardVO: TaskboardVO;
  taskboardTaskVOList: TaskboardTaskVO[] = [];
  showdynamicColor = false;
  taskId: FormControl;
  pageName: string;
  page: number;
  version: number;
  taskboardColumns: any[] = [];
  selectedTaskBoardDetails: TaskboardVO;
  editForm = false;
  showSelectionFormList = false;
  newlyBuildedForm: any = {};
  isPublicform = false;
  publicFormUrl = '';
  layoutType = '';
  URL: any[] = [];
  prefix: any;
  suffix = '';
  tempArray = [];
  removedColumnsIdList: string[] = [];
  generatedTaskIdList: string[] = [];
  todoIndex: number;
  doneIndex: number;
  previousFormArrayLength: number;
  todoValue: string;
  doneValue: string;
  todoColumnVO: any = {};
  doneColumnVO: any = {};
  showError = false;
  showTaskBoardKey = false;
  isTaskboardRead = true;
  isTaskboardupdate = true;
  isTaskboardDelete = true;
  showBg = false;
  colors: any;
  circleTodo: any;
  circleDone: any;
  colorsMatching: any;
  previewArray: any;
  counter = 0;
  ranNums: any = [];
  newColors: any = [];
  type: any = 'workflowForms';
  taskboardTemplatesVOList: TaskboardTemplatesVO[] = [];
  taskboardTemplateVo = new TaskboardTemplatesVO();
  pageNameList: any[] = [];
  isFromtemplate = false;
  showTemplateField = true;
  editFormValue: any;
  publicAcess = false;
  @ViewChild('stepper') private myStepper: MatStepper;
  licenseVO = new LicenseVO();
  isPublicFormEnabled = true;
  enableFieldMapping = false;
  fieldsList: PageFieldVO[];
  arrayFields: PageFieldVO[];
  tableFields: PageFieldVO[];
  fieldsListForMapping: PageFieldVO[] = [];
  repeatableFieldsListForMapping: PageFieldVO[] = [];
  repeatableFieldsListFormName: PageFieldVO[] = [];
  initialFieldList: PageFieldVo[];
  fieldList: PageFieldVo[] = [];
  iconList = [
    { type: 'long', icon: 'pin' },
    { type: 'string', icon: 'text_fields' },
    { type: 'float', icon: 'pin' },
    { type: 'date', icon: 'date_range' },
    { type: 'array', icon: 'list_alt' },
    { type: 'time', icon: 'query_builder' },
    { type: 'uuid', icon: 'badge' }
  ];
  selectedField: any;
  @ViewChild('menuTrigger1') mainSectionFieldMenu;
  @ViewChild('menuTrigger2') repeatableNameMenu;
  @ViewChild('menuTrigger3') subSectionFieldsMenu;
  isFreePlan = true;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TaskboardConfigurationDialogComponent>,
    private taskService: TaskBoardService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private colorpicker: ColorpickerService,
    private automationService: EventAutomationService,
    private workflowDashboardService: WorkflowDashboardService,
    private taskPropertyService: TaskPropertyService,
    private clipboardService: ClipboardService,
    public workspaceService: WorkspaceService,
    private createOrganizationService: CreateOrganizationService
  ) { }

  templatesCategoriesArray: any[] = [{ name: 'All', icon: 'library_add_check', color: 'blue', isSelected: true },
  { name: 'HR', icon: 'reduce_capacity', color: 'green', isSelected: false },
  { name: 'Sales', icon: 'receipt', color: '#ffb100', isSelected: false },
  { name: 'Startups', icon: 'highlight_alt', color: 'lightblue', isSelected: false },
  { name: 'Marketing', icon: 'assessment', color: 'blue', isSelected: false },
  { name: 'Integration', icon: 'integration_instructions', color: 'red', isSelected: false },
  { name: 'Work From Home', icon: 'work', color: 'violet', isSelected: false },
  { name: 'Project Management', icon: 'manage_accounts', color: '#ffb100', isSelected: false },
  { name: 'Software Development', icon: 'developer_mode', color: 'red', isSelected: false }
  ];

  templatesListWithCategory: TaskboardTemplatesCategories[] = [];
  selectedTemplatesWithCategory: TaskboardTemplatesCategories[] = [];

  selectedLang: any;
  sprintSettings = new SprintSettings();
  ngOnInit() {
    forkJoin([this.createOrganizationService.getOrgSubscription()]).subscribe(results => {
      if (results[0].planType === 'STARTER') {
        this.isFreePlan = true;
      } else {
        this.isFreePlan = false;
      }
    });
    this.selectedLang = localStorage.getItem('translate_lang');
    if (this.selectedLang === undefined || this.selectedLang === null || this.selectedLang === 'null' || this.selectedLang === '') {
      this.selectedLang = 'en';
    }
    this.colorsMatching = this.colorpicker.getcolorlist();
    const randomElement = this.colorsMatching[Math.floor(Math.random() * this.colorsMatching.length)];
    this.colors = randomElement;
    if (this.data && this.data.fromScratch) {
      this.taskService.getTaskboardTemplates().subscribe(data => {
        this.taskboardTemplatesVOList = data;
        this.loadTemplatesWithcategory();
      });
    }
    this.taskboardFields();
    this.form = this.formBuilder.group({
      id: [],
      formId: [''],
      formVersion: [],
      pageName: [],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      generatedTaskId: ['', [Validators.required]],
      taskName: [],
      isColumnBackground: [false],
      taskboardKey: ['', [Validators.required]],
      todo: [{ value: $localize`:@@Todo:Todo`, disabled: false }],
      done: [{ value: $localize`:@@Done:Done`, disabled: false }],
      taskboardColumns: this.formBuilder.array([this.stepperFormArray()]),
      template: [],
      sprintEnabled: [false],
      launchButtonName: ['Launch', [Validators.required]]
    });
    if (this.data && !this.data.showNewConfig && this.data.selectedTaskboard) {
      this.taskService.getTaskboardDetailsByType(this.data.selectedTaskboard.id, 0).subscribe(data => {
        this.showTemplateField = false;
        this.taskboardVO = data;
        this.form.get('sprintEnabled').setValue(this.taskboardVO.sprintEnabled);
        if (this.taskboardVO.launchButtonName) {
          this.form.get('launchButtonName').setValue(this.taskboardVO.launchButtonName);
        } else {
          this.form.get('launchButtonName').setValue('Launch');
        }
        if (this.taskboardVO.isColumnBackground === false) {
          this.showBg = false;
        }
        else {
          this.showBg = true;
        }
        if (!this.data.duplicate) {
          this.checkSecurity(this.taskboardVO);
          this.editForm = this.data.showselection;
          this.taskboardTaskVOList = this.data.taskboardTaskVOList;
          this.form.get('generatedTaskId').disable();
          this.form.get('name').disable();
          this.form.get('taskboardKey').disable();
        }
        if (this.taskboardVO.taskboardColumns[0].layoutType === 'publicForms') {
          this.isPublicform = true;
          this.type = true;
          if (window.location.href.includes('localhost')) {
            this.publicFormUrl =
              'http://localhost/' + this.selectedLang + '/' + this.workspaceService.getWorkSpaceKey() +
              '/board/' +
              this.form.get('taskboardKey').value +
              '/' +
              this.form.get('formId').value;
          } else {
            this.URL = window.location.href.split('.com/', 2);
            this.publicFormUrl =
              this.URL[0] +
              '.com/' + this.selectedLang + '/' + this.workspaceService.getWorkSpaceKey() + '/board/' +
              this.form.get('taskboardKey').value +
              '/' +
              this.form.get('formId').value;
          }
        }
        const result = this.colorsMatching.find(obj => {
          return obj.parent === this.taskboardVO.taskboardColumns[0].columnColor;
        });
        this.colors = result;
        if (this.colors === undefined) {

          for (let i = 0; i < this.taskboardVO.taskboardColumns.length; i++) {
            if (this.taskboardVO.taskboardColumns[i].columnOrder === 0) {
              this.circleTodo = this.taskboardVO.taskboardColumns[i].columnColor;
            }
            else if (this.taskboardVO.taskboardColumns[i].columnOrder === this.taskboardVO.taskboardColumns.length - 1) {
              this.circleDone = this.taskboardVO.taskboardColumns[i].columnColor;
            }
          }
          const formArray = this.form.get('taskboardColumns') as FormArray;
          for (let i = 0; i < formArray.length; i++) {
            const columnColor = formArray.get('' + i).get('columnColor').value;
            if (
              columnColor !== null &&
              columnColor !== undefined &&
              columnColor !== '') {
              formArray.get('' + i).get('columnColor').setValue(this.taskboardVO.taskboardColumns[i].columnColor);

            }
          }

        }
        else {
          for (let i = 0; i < this.taskboardVO.taskboardColumns.length; i++) {
            if (this.taskboardVO.taskboardColumns[i].columnOrder === 0) {
              this.circleTodo = this.taskboardVO.taskboardColumns[i].columnColor;
            }
            else if (this.taskboardVO.taskboardColumns[i].columnOrder === this.taskboardVO.taskboardColumns.length - 1) {
              this.circleDone = this.taskboardVO.taskboardColumns[i].columnColor;
            }


          }
          const length = this.taskboardVO.taskboardColumns.length;
          this.doneIndex = this.taskboardVO.taskboardColumns.findIndex(x => x.isDoneColumn === true);
          const lastorder = this.taskboardVO.taskboardColumns.find(obj => obj.columnOrder === this.doneIndex - 1);
          const colorIndex = this.colors.childs.findIndex(x => x === this.doneIndex);
          this.counter = this.counter + colorIndex;
        }



        this.setStepperForm();
      });
    } else {

      this.form.get('taskName').setValue('generatedTaskId');
      this.circleTodo = this.colors.parent;
      this.circleDone = this.colors.childs[8];
      const formArray = this.form.get('taskboardColumns') as FormArray;
      for (let i = 0; i < formArray.length; i++) {
        const columnColor = formArray.get('' + i).get('columnColor').value;
        if (
          columnColor !== null &&
          columnColor !== undefined &&
          columnColor !== '') {
          formArray.get('' + i).get('columnColor').setValue(this.colors.childs[i]);

        }
      }
    }
    this.form.get('name').valueChanges.subscribe((res) => {
      const taskboardKey = this.form
        .get('name')
        .value.toLowerCase()
        .split(' ')
        .join('-');
      this.form.get('taskboardKey').setValue(taskboardKey);
      this.showTaskBoardKey = true;
    });
    if (this.colorArray.length === 0) {
      this.colorArray.push(this.getRandomColor());
    }

    this.taskService.getGeneratedTaskIdList().subscribe((data) => {
      if (
        data &&
        data.generatedTaskIdList &&
        data.generatedTaskIdList.length > 0
      ) {
        this.generatedTaskIdList = data.generatedTaskIdList;
      }
    });
    this.checkPublicFormEnabled();
    if (this.isPublicform !== true && this.form.get('formId').value && this.form.get('formVersion').value) {
      this.getPageFields(this.form.get('formId').value, this.form.get('formVersion').value, true);
    }
  }

  loadTemplatesWithcategory(): void {
    for (let i = 0; i < this.templatesCategoriesArray.length; i++) {
      if (this.taskboardTemplatesVOList.some(category => category.category === this.templatesCategoriesArray[i].name)) {
        const templateCategories = new TaskboardTemplatesCategories();
        templateCategories.category = this.templatesCategoriesArray[i].name;
        if (templateCategories.templates === undefined || templateCategories.templates === null) {
          templateCategories.templates = [];
        }
        this.taskboardTemplatesVOList.forEach(element => {
          if (element.category === this.templatesCategoriesArray[i].name) {
            templateCategories.templates.push(element);
          }
        });
        this.selectedTemplatesWithCategory.push(templateCategories);
      }
    }
  }

  createTaskboard(): void {
    this.form.get('taskName').setValue('generatedTaskId');
    this.form.get('todo').setValue($localize`:@@Todo:Todo`);
    this.form.get('done').setValue($localize`:@@Done:Done`);
    this.circleTodo = this.colors.parent;
    this.circleDone = this.colors.childs[8];
    const formArray = this.form.get('taskboardColumns') as FormArray;
    formArray.get('' + 0).get('columnName').setValue($localize`:@@Progress:Progress`);
    formArray.get('' + 0).get('columnColor').setValue(this.colors.childs[0]);
    this.myStepper.next();
    this.dialogRef.updateSize('500px', '580px');
  }

  loadPrevious(): void {
    this.form.reset();
    const length = this.getprogressArray().length;
    for (let i = 0; i < length; i++) {
      if (this.getprogressArray().length > 1) {
        this.getprogressArray().removeAt(0);
      }
    }
    this.editForm = false;
    this.isFromtemplate = false;
    this.taskboardVO = new TaskboardVO();
    if (this.form.get('formName')) {
      this.form.removeControl('formName');
    }
    this.myStepper.previous();
    this.dialogRef.updateSize('95%', '95%');
  }

  selectedTemplate(templateVO: TaskboardTemplatesVO): void {
    if (templateVO) {
      const dialog = this.dialog.open(TemplateDialogComponent,
        {
          disableClose: true,
          width: '30%',
          maxWidth: '30%',
          height: '50%',
          panelClass: 'config-dialog',
          data: templateVO.data
        });
      dialog.afterClosed().subscribe((taskData) => {
        if (taskData.flag) {
          this.dialogRef.close(taskData);
        }
      });
    }
    //   this.taskboardTemplateVo = new TaskboardTemplatesVO();
    //   this.taskboardTemplateVo = templateVO;
    //   this.taskboardVO = this.taskboardTemplateVo.data.taskboardVO;
    //   this.taskboardVO.id = null;
    //   this.editForm = true;
    //   this.isFromtemplate = true;
    //   this.form.reset();
    //   const length = this.getprogressArray().length;
    //   for (let i = 0; i < length; i++) {
    //     if (this.getprogressArray().length > 1) {
    //       this.getprogressArray().removeAt(0);
    //     }
    //   }
    //   this.form.get('name').valueChanges.subscribe((res) => {
    //     const taskboardKey = this.form
    //       .get('name')
    //       .value.toLowerCase()
    //       .split(' ')
    //       .join('-');
    //     this.form.get('taskboardKey').setValue(taskboardKey);
    //     this.showTaskBoardKey = true;
    //   });
    //   if (!this.form.get('formName')) {
    //     this.form.addControl('formName', this.formBuilder.control('', [Validators.required]));
    //   }
    //   this.form.get('formName').setValue(this.taskboardTemplateVo.data.page.pageName);
    //   this.form.markAllAsTouched();
    //   this.formValuesChanges();
    //   this.setStepperForm();
    //   this.checkTaskboardNameExist();
    //   this.myStepper.next();
    //   this.dialogRef.updateSize('500px', '580px');
    // }
    // else {
    //   this.form.reset();
    //   const length = this.getprogressArray().length;
    //   for (let i = 0; i < length; i++) {
    //     if (this.getprogressArray().length > 1) {
    //       this.getprogressArray().removeAt(0);
    //     }
    //   }
    //   this.editForm = false;
    //   this.isFromtemplate = false;
    //   this.taskboardVO = new TaskboardVO();
    //   if (this.form.get('formName')) {
    //     this.form.removeControl('formName');
    //   }
    // }
  }

  checkSecurity(taskboardVO: TaskboardVO) {
    if (taskboardVO.isTaskBoardOwner === false) {
      if (taskboardVO.taskboardSecurity.read === true) {
        this.isTaskboardRead = true;
      } else {
        this.isTaskboardRead = false;
        this.form.disable();
      }

      if (taskboardVO.taskboardSecurity.update === true) {
        this.isTaskboardupdate = true;
      } else {
        this.isTaskboardupdate = false;
        this.form.disable();
      }

      if (taskboardVO.taskboardSecurity.delete === true) {
        this.isTaskboardDelete = true;
      } else {
        this.isTaskboardDelete = false;
      }
    }
  }

  checkProgressBarNameExist(id, progress: FormGroup) {
    const form = (this.form.get('taskboardColumns') as FormArray).get('' + id);
    const columnName = form.get('columnName').value;
    const progressName: ProgressName[] = this.getColumnName();
    for (let i = 0; i < this.getStepperArray().controls.length; i++) {
      const setColumnerror = this.getStepperArray()
        .get('' + i)
        .get('columnName');
      if (
        progressName.some(
          (data) =>
            data.index !== id &&
            data.value.toLowerCase() === columnName.toLowerCase()
        )
      ) {
        form.get('columnName').setErrors({ alreadyExist: true });
        this.showError = true;
      } else {
        this.showError = false;
      }
      if (
        setColumnerror.errors &&
        setColumnerror.errors.alreadyExist === true
      ) {
        if (
          progressName.some(
            (data) =>
              data.index === id &&
              data.value.toLowerCase() !== columnName.toLowerCase()
          )
        ) {
          setColumnerror.setErrors(null);
          this.showError = false;
        }
      }
    }
  }

  getColumnName(): ProgressName[] {
    const formArray = this.form.get('taskboardColumns') as FormArray;
    const progressNames: ProgressName[] = [];
    for (let i = 0; i < formArray.length; i++) {
      const columnName = formArray.get('' + i).get('columnName').value;
      if (
        columnName !== null &&
        columnName !== undefined &&
        columnName !== ''
      ) {
        progressNames.push({ index: i, value: columnName });
      }
    }
    const todoValue = this.form.get('todo').value;
    const doneValue = this.form.get('done').value;
    progressNames.push({ index: formArray.length, value: todoValue });
    progressNames.push({ index: formArray.length + 1, value: doneValue });

    return progressNames;
  }

  setStepperForm() {
    if (
      this.taskboardVO &&
      this.taskboardVO.taskboardColumns &&
      this.taskboardVO.taskboardColumns.length
    ) {
      this.form.get('id').setValue(this.taskboardVO.id);
      if ((this.data && this.data.duplicate) || this.isFromtemplate === true) {
        this.form.get('name').setValue('');
        this.form.get('taskboardKey').setValue('');
      } else {
        this.form.get('name').setValue(this.taskboardVO.name);
        this.form.get('taskboardKey').setValue(this.taskboardVO.taskboardKey);
      }
      this.form.get('description').setValue(this.taskboardVO.description);
      this.form.get('isColumnBackground').setValue(this.taskboardVO.isColumnBackground);
      this.form
        .get('generatedTaskId')
        .setValue(this.taskboardVO.generatedTaskId);
      this.form.get('taskName').setValue(this.taskboardVO.taskName);
      this.form
        .get('formId')
        .setValue(this.taskboardVO.taskboardColumns[0].formId);
      this.form
        .get('formVersion')
        .setValue(this.taskboardVO.taskboardColumns[0].version);
      if (
        this.taskboardVO.taskboardColumns[0].layoutType &&
        this.taskboardVO.taskboardColumns[0].layoutType === 'publicForms'
      ) {
        this.form
          .get('name')
          .value.toLowerCase()
          .split(' ')
          .join('_');
        if (window.location.href.includes('localhost')) {
          this.publicFormUrl =
            'http://localhost/' + this.selectedLang + '/' + this.workspaceService.getWorkSpaceKey() +
            '/board/' +
            this.form.get('taskboardKey').value +
            '/' +
            this.taskboardVO.taskboardColumns[0].formId;
        } else {
          this.URL = window.location.href.split('.com/', 2);
          this.publicFormUrl =
            this.URL[0] +
            '.com/' + this.selectedLang + '/' + this.workspaceService.getWorkSpaceKey() + '/board/' +
            this.form.get('taskboardKey').value +
            '/' +
            this.taskboardVO.taskboardColumns[0].formId;
        }
        this.showTaskBoardKey = true;
        this.form.get('taskboardKey').disable();
      }

      const length = this.taskboardVO.taskboardColumns.length;
      this.todoIndex = this.taskboardVO.taskboardColumns.findIndex(x => x.columnOrder === 0);
      this.form.get('todo').setValue(this.taskboardVO.taskboardColumns[this.todoIndex].columnName);
      this.todoValue = this.form.get('todo').value;
      this.doneIndex = this.taskboardVO.taskboardColumns.findIndex(x => x.columnOrder === length - 1);
      this.form.get('done').setValue(this.taskboardVO.taskboardColumns.find(c => c.isDoneColumn === true)['columnName']);
      this.doneValue = this.form.get('done').value;

      for (let i = 0; i < this.taskboardVO.taskboardColumns.length; i++) {
        if (i > 0) {
          this.addAnotherColumn(i);
        }
        const index = '' + i;
        const form = (this.form.get('taskboardColumns') as FormArray).get(
          index
        );
        form
          .get('columnName')
          .setValue(this.taskboardVO.taskboardColumns[i].columnName);
        form
          .get('columnOrder')
          .setValue(this.taskboardVO.taskboardColumns[i].columnOrder);
        form
          .get('columnColor')
          .setValue(this.taskboardVO.taskboardColumns[i].columnColor);
        form
          .get('formId')
          .setValue(this.taskboardVO.taskboardColumns[i].formId);
        form
          .get('version')
          .setValue(this.taskboardVO.taskboardColumns[i].version);
        form.get('id').setValue(this.taskboardVO.taskboardColumns[i].id);
        form.get('isColumnBackground').setValue(this.taskboardVO.taskboardColumns[i].isColumnBackground);
        form.updateValueAndValidity();

      }

    }
  }
  addAnotherGridColumn(i) {
    this.getStepperArray().push(this.stepperFormArray());
  }
  stepperFormArray(): FormGroup {
    let color: string;
    if (this.form === undefined || this.form === null) {
      color = this.colors.childs[0];
    }
    return this.formBuilder.group({
      id: [],
      formId: [],
      version: [],
      columnName: [
        { value: 'Progress', disabled: false },
        [Validators.required],
      ],
      columnOrder: [1],
      columnColor: [color],
      taskCounts: [],
      isColumnBackground: [false]
    });

  }

  getStepperArray() {
    return this.form.get('taskboardColumns') as FormArray;
  }
  openForm(pageId, version, isPublicform: boolean) {
    return this.dialog.open(CreateFormDialogComponent, {
      disableClose: true,
      height: '97%',
      width: '100vw',
      maxWidth: '90vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-modal',
      data: {
        id: pageId,
        versionId: version,
        from: 'taskboard',
        isPublicform
      },
    });
  }

  closeDialog() {
    const taskVO = this.taskboardVO;
    const flag = true;
    const newTask = 'task';
    this.dialogRef.close({ taskVO, flag, newTask });
  }
  getPublicForm(event) {
    this.isPublicform = event;
  }

  checkTaskboardNameExist() {
    if (this.form.get('name').value !== null &&
      this.form.get('name').value !== '') {
      this.taskService
        .checkTaskboardName(this.form.get('name').value)
        .subscribe((data) => {
          if (data.response !== 'New Name') {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            this.form.get('name').setErrors({ alreadyExist: true });
            this.form.markAllAsTouched();
          } else {
            this.form.get('name').setErrors(null);
          }
        });
    }
  }

  checkTaskboardKeyExist() {
    if (
      this.editForm === false &&
      this.form.get('taskboardKey').value !== '' &&
      this.form.get('taskboardKey').value !== null
    ) {
      this.taskService
        .checkTaskboardKey(this.form.get('taskboardKey').value)
        .subscribe((data) => {
          if (data.response !== 'New Key') {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            this.form.get('taskboardKey').setErrors({ alreadyExist: true });
          } else {
            this.form.get('taskboardKey').setErrors(null);
          }
        });
    }
  }

  next(stepper: MatStepper): void {
    this.myStepper.next();
    this.taskService.getPageNameList().subscribe(list => {
      this.pageNameList = list;
    });
  }

  foucusoutFormName() {
    if (this.pageNameList.some(page => page.pageName === this.form.get('formName').value)) {
      this.form.get('formName').setErrors({ alreadyExist: true });
    } else {
      this.form.get('formName').setErrors(null);
    }
  }

  formValuesChanges() {
    this.form.get('formName').valueChanges.pipe(debounceTime(1300)).subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        this.form.get('formId').setValue(this.form.get('formName').value.trim().toLowerCase().replace(/ +/g, ''));
        if (this.pageNameList.some(page => page.pageName === this.form.get('formName').value)) {
          this.form.get('formName').setErrors({ alreadyExist: true });
        } else {
          this.form.get('formName').setErrors(null);
        }
      }
    });
  }

  saveNext(stepper: MatStepper) {
    if (this.isFromtemplate === true) {
      if (this.pageNameList.some(page => page.pageName === this.form.get('formName').value)) {
        this.form.get('formName').setErrors({ alreadyExist: true });
      }
      if (this.form.get('formName').errors === undefined || this.form.get('formName').errors === null) {
        const userPermissionData = { id: 'template', securityType: 'template', pageName: this.form.get('formName').value, pageVersion: 1 };
        const dialog = this.dialog.open(ConfirmationDialogComponent, {
          disableClose: true,
          width: '700px',
          data: { type: 'template', data: userPermissionData }
        });
        dialog.afterClosed().subscribe(data => {
          if (data !== false) {
            let page = new Page();
            page = this.taskboardTemplateVo.data.page;
            page.pageName = this.form.get('formName').value;
            page.pageId = this.form.get('formId').value;
            page.yorosisPageId = null;
            page.applicationId = '511401b9-1300-45c7-99cc-36e8b95aae52';
            page.applicationName = 'Yoroflow-App';
            this.taskService.savePage(page).subscribe(pageResponse => {
              if (pageResponse) {
                let security = new Security();
                for (let i = 0; i < data.permissionsVOList.length; i++) {
                  data.permissionsVOList[i].securityId = pageResponse.pageId;
                }
                security = data;
                security.securityId = null;
                this.taskService.savePagePermissions(security).subscribe(permissionRes => {
                  if (this.taskboardTemplateVo.data.tableObjectListVO.length > 0) {
                    this.taskService.saveTableListVO(this.taskboardTemplateVo.data.tableObjectListVO).subscribe(tableResponse => {
                      if (tableResponse) {
                        this.loadGeneratedTaskId();
                        this.myStepper.next();
                      }
                    });
                  } else {
                    this.loadGeneratedTaskId();
                    this.myStepper.next();
                  }
                });
              }
            });
          }
        });
      }
    } else {
      this.loadGeneratedTaskId();
      this.myStepper.next();
    }
    // const arrOfString = window.location.href.split('//', 2);
    // let Url = arrOfString[1].split('.', 2);
    // if (window.location.href.includes('localhost')) {
    //   Url = ['india']
    // }
    // if (Url[0] !== this.taskboardTemplateVo.data.subdomainName) {

    // } 

  }

  loadGeneratedTaskId() {
    if (this.data && this.data.duplicate) {
      this.taskboardVO.generatedTaskId = this.form.get('name').value.slice(0, 3).toUpperCase();
    }
    const formId = this.form.get('formId').value;
    const version = this.form.get('formVersion').value;
    this.getTaskNameList(formId, version);
    const generatedId = this.form.get('name').value.slice(0, 3).toUpperCase();
    if (this.editForm === false) {
      if (this.generatedTaskIdList && this.generatedTaskIdList.length > 0) {
        const taskId = this.generatedTaskIdList.some((x) => x === generatedId);
        if (taskId) {
          this.form.get('generatedTaskId').setValue(generatedId);
          this.form.get('generatedTaskId').setErrors({ alreadyExist: true });
        } else {
          this.form.get('generatedTaskId').setErrors(null);
          if (this.taskboardVO === undefined) {
            this.form.get('generatedTaskId').setValue(generatedId);
          } else {
            this.form
              .get('generatedTaskId')
              .setValue(this.taskboardVO.generatedTaskId);
          }
        }
      } else {
        this.form.get('generatedTaskId').setValue(generatedId);
      }
    } else {
      if (this.taskboardVO === undefined) {
        this.form.get('generatedTaskId').setValue(generatedId);
      } else {
        this.form
          .get('generatedTaskId')
          .setValue(this.taskboardVO.generatedTaskId);
      }
    }
  }

  getTaskNameList(formId, version) {
    this.taskService.getTaskIdDetails(formId, version).subscribe((data) => {
      this.tempArray = [];
      data.sections.forEach((mainSection) => {
        mainSection.rows.forEach((row) => {
          row.columns.forEach((column) => {
            if (
              column.controlType === 'select' ||
              column.controlType === 'radiobutton' ||
              column.controlType === 'input'
            ) {
              const array = {
                name: column.field.name,
                labelName: column.field.label.labelName,
              };
              this.tempArray.push(array);
            }
          });
        });
      });
    });
  }

  save(userForm) {
    if (
      this.editForm === false &&
      this.generatedTaskIdList &&
      this.generatedTaskIdList.length > 0
    ) {
      const taskId = this.generatedTaskIdList.some(
        (x) => x === this.form.get('generatedTaskId').value
      );
      if (taskId) {
        this.form.get('generatedTaskId').setErrors({ alreadyExist: true });
      } else {
        this.form.get('generatedTaskId').setErrors(null);
      }
    }

    if (userForm.valid) {
      const oldTaskboardId = this.taskboardVO?.id;
      this.taskboardVO = this.form.getRawValue();
      if (this.taskboardVO.id === undefined || this.taskboardVO.id === null || this.taskboardVO.id === '') {
        this.taskboardVO.sprintSettingsVo = this.sprintSettings;
      }
      this.taskboardVO.generatedTaskId = this.form.get('generatedTaskId').value;
      this.taskboardVO.taskboardColumns.forEach((param) => {
        param.isDoneColumn = false;
      });
      if (this.data && this.data.duplicate) {
        this.taskboardVO.id = null;
      } else {
        if (this.editForm === false) {
          const todoColumnsVO = new TaskboardColumns();
          todoColumnsVO.columnColor = this.colors.parent;
          todoColumnsVO.columnName = this.form.get('todo').value;
          todoColumnsVO.columnOrder = 0;
          todoColumnsVO.formId = null;
          todoColumnsVO.version = null;
          todoColumnsVO.id = null;
          todoColumnsVO.taskCounts = null;
          todoColumnsVO.layoutType = null;
          todoColumnsVO.isColumnBackground = null;
          todoColumnsVO.subStatus = [];
          todoColumnsVO.taskboardColumnSecurity = new ResolveSecurityForTaskboardVO();
          todoColumnsVO.taskCount = 0;
          todoColumnsVO.isDoneColumn = false;
          this.taskboardVO.taskboardColumns.push(todoColumnsVO);
          const doneColumnsVO = new TaskboardColumns();
          doneColumnsVO.columnColor = this.colors.childs[8];
          doneColumnsVO.columnName = this.form.get('done').value;
          doneColumnsVO.columnOrder = null;
          doneColumnsVO.formId = null;
          doneColumnsVO.version = null;
          doneColumnsVO.id = null;
          doneColumnsVO.taskCounts = null;
          doneColumnsVO.layoutType = null;
          doneColumnsVO.isColumnBackground = null;
          doneColumnsVO.subStatus = [];
          doneColumnsVO.taskboardColumnSecurity = new ResolveSecurityForTaskboardVO();
          doneColumnsVO.taskCount = 0;
          doneColumnsVO.isDoneColumn = true;
          this.taskboardVO.taskboardColumns.push(doneColumnsVO);
        }
      }
      this.taskboardVO.taskboardColumns.forEach(c => {
        if (c.columnName === this.form.get('done').value) {
          c.isDoneColumn = true;
        }
      });
      if (this.isPublicform === true) {
        this.layoutType = 'publicForms';
      } else {
        this.layoutType = 'workflowForms';
      }
      const length = this.taskboardVO.taskboardColumns.length;
      if (this.todoValue && this.doneValue) {
        const todoIndex = this.taskboardVO.taskboardColumns.findIndex(d => d.columnName === this.todoValue);
        const doneIndex = this.taskboardVO.taskboardColumns.findIndex(d => d.columnName === this.doneValue);
        this.taskboardVO.taskboardColumns[doneIndex].columnOrder = length - 1;
        if (this.editForm === true) {
          this.taskboardVO.taskboardColumns[todoIndex].columnName = this.form.get('todo').value;
          this.taskboardVO.taskboardColumns[doneIndex].columnName = this.form.get('done').value;
        }
      } else {
        const todoIndex = this.taskboardVO.taskboardColumns.findIndex(d => d.columnName === this.form.get('todo').value);
        const doneIndex = this.taskboardVO.taskboardColumns.findIndex(d => d.columnName === this.form.get('done').value);
        this.taskboardVO.taskboardColumns[doneIndex].columnOrder = length - 1;
        this.taskboardVO.taskboardColumns[todoIndex].columnName = this.form.get('todo').value;
        this.taskboardVO.taskboardColumns[doneIndex].columnName = this.form.get('done').value;
      }

      const formId = this.form.get('formId').value;
      const version = this.form.get('formVersion').value;
      this.taskboardVO.taskboardColumns.forEach((param, columnIndex) => {
        param.formId = formId;
        param.version = version;
        param.layoutType = this.layoutType;
        if (!param.isColumnBackground) {
          param.isColumnBackground = false;
        }
      });
      this.taskboardVO.removedColumnsIdList = this.removedColumnsIdList;
      // if (this.taskboardVO.taskboardColumns.length > 0) {

      //   if (this.taskboardVO.isColumnBackground) {
      //     this.taskboardVO.taskboardColumns.forEach(param => {
      //       param.isColumnBackground = true;
      //     });
      //   }
      //   else {
      //     this.taskboardVO.taskboardColumns.forEach(param => {
      //       param.isColumnBackground = false;
      //     });
      //   }
      // }

      if (this.form.get('sprintEnabled').value === true) {
        if (this.data.configType && this.data.configType === 'copy') {
          const board = this.data.taskboardList?.find(t => t.id === oldTaskboardId);
          if (board.sprintSettingsVo) {
            this.sprintSettings = board.sprintSettingsVo;
          }
        }
        if (this.sprintSettings?.sprintDuration) {
          this.taskboardVO.sprintSettingsVo = this.sprintSettings;
        }
      }
      if (this.editForm !== false) {
        this.taskboardVO.taskboardColumns.forEach((c, index) => c.columnOrder = index);
      }
      this.taskService
        .posttaskConfiguration(this.taskboardVO)
        .subscribe((resp) => {
          if (resp.response.includes('Successfully')) {
            const taskVO = resp.taskboardVO;
            const flag = true;
            const newTask = resp.taskboardTask;
            this.dialogRef.close({ taskVO, flag, newTask });
            if (this.isFromtemplate === true) {
              if (this.taskboardTemplateVo.data.automations !== undefined
                && this.taskboardTemplateVo.data.automations !== null
                && this.taskboardTemplateVo.data.automations.length > 0) {
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < this.taskboardTemplateVo.data.automations.length; i++) {
                  this.taskboardTemplateVo.data.automations[i].id = null;
                  this.taskboardTemplateVo.data.automations[i].taskboardId = taskVO.id;
                }
                this.automationService.saveMultipleAutomations(this.taskboardTemplateVo.data.automations).subscribe();
              }
              if (this.taskboardTemplateVo.data.taskboardLabels && this.taskboardTemplateVo.data.taskboardLabels.labels !== undefined
                && this.taskboardTemplateVo.data.taskboardLabels.labels !== null &&
                this.taskboardTemplateVo.data.taskboardLabels.labels.length > 0) {
                this.taskboardTemplateVo.data.taskboardLabels.taskboardId = taskVO.id;
                this.taskService.saveTaskboardLebles(this.taskboardTemplateVo.data.taskboardLabels).subscribe();
              }
            }
          } else if (resp.response.includes('exceeded your limit')) {
            const dialog = this.dialog.open(AlertmessageComponent, {
              width: '450px',
              data: resp.licenseVO
            });
          }
        });

    }
  }

  checkPublicFormEnabled() {
    this.licenseVO.category = 'form_page_builder';
    this.licenseVO.featureName = 'public_form';
    this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'N') {
        this.isPublicFormEnabled = false;
      }
    });
  }

  createPublicform() {
    if (this.isPublicFormEnabled === false) {
      const dialog = this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          this.dialogRef.close();
        }
      });
    } else {
      this.openForm(null, null, true)
        .afterClosed()
        .subscribe((pageId) => {
          if (pageId) {
            this.form.get('formId').setValue(pageId.responseId);
            this.form.get('formVersion').setValue(pageId.version);
            this.form.get('pageName').setValue(pageId.pageName);
            this.isPublicform = true;
            if (window.location.href.includes('localhost')) {
              this.publicFormUrl =
                'http://localhost/' + this.workspaceService.getWorkSpaceKey() +
                '/board/' +
                this.form.get('taskboardKey').value +
                '/' +
                this.form.get('formId').value;
            } else {
              this.URL = window.location.href.split('.com/', 2);
              this.publicFormUrl =
                this.URL[0] +
                '.com/' + this.selectedLang + '/' + this.workspaceService.getWorkSpaceKey() + '/board/' +
                this.form.get('taskboardKey').value +
                '/' +
                this.form.get('formId').value;
            }
          }
        });
    }
  }

  clickEvent() {
    this.openForm(null, null, false)
      .afterClosed()
      .subscribe((pageId) => {
        if (pageId) {
          this.form.get('formId').setValue(pageId.responseId);
          this.form.get('formVersion').setValue(pageId.version);
          this.form.get('pageName').setValue(pageId.pageName);
          if (this.isPublicform !== true) {
            this.getPageFields(this.form.get('formId').value, this.form.get('formVersion').value, false);
          }
        }
      });
  }
  receivedPageId(pageId) {
    if (pageId !== false && pageId !== undefined) {
      this.page = pageId.formId.toLowerCase();
      this.version = pageId.version;
      this.form.get('formId').setValue(pageId.formId);
      this.form.get('formVersion').setValue(pageId.version);
      this.form.get('pageName').setValue(pageId.formName);
      if (this.isPublicform !== true) {
        this.getPageFields(pageId.formId, pageId.version, false);
      }
      if (this.isPublicform === true) {
        if (window.location.href.includes('localhost')) {
          this.publicFormUrl =
            'http://localhost/' + this.selectedLang + '/' + this.workspaceService.getWorkSpaceKey() +
            '/board/' +
            this.form.get('taskboardKey').value +
            '/' +
            this.form.get('formId').value;
        } else {
          this.URL = window.location.href.split('.com/', 2);
          this.publicFormUrl =
            this.URL[0] +
            '.com/' + this.selectedLang + '/' + this.workspaceService.getWorkSpaceKey() + '/board/' +
            this.form.get('taskboardKey').value +
            '/' +
            this.form.get('formId').value;
        }
      }
    }
  }

  mousedown(field: any): void {
    this.selectedField = field;
    this.fieldList = this.initialFieldList;
    this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
    this.initialFieldList.forEach(type => {
      const fieldList = this.fieldList.find(f => f.fieldType === type.fieldType);
      fieldList.fieldVO = [];
      type.fieldVO.forEach(f => {
        f.color = this.getRandomColor();
        fieldList.fieldVO.push(f);
      });
    });
  }

  taskboardFields() {
    this.taskService.taskboardFields().subscribe(data => {
      if (data) {
        this.initialFieldList = data;
      }
    });
  }

  getFieldlabel(field) {
    return field.repeatableFieldName + ' (' + field.fieldName + ')';
  }

  getformGroupName(repeatableFieldId) {
    return repeatableFieldId + 'ya';
  }

  getIcon(field: any): string {
    var icon = '';
    this.iconList.forEach(data => {
      if (data.type === field.datatype) {
        icon = data.icon;
      }
    });
    return icon;
  }

  getFieldMappingFormGroup() {
    return this.form.get('fieldMapping') as FormGroup;
  }

  getRepeatableFieldMappingFormGroup(repeatableName) {
    return this.getFieldMappingFormGroup().get(repeatableName) as FormGroup;
  }

  getPageFields(pageId, version, fromLoad) {
    let versionId = version;
    if (version === undefined) {
      versionId = 1;
    }
    this.enableFieldMapping = false;
    this.taskPropertyService.getPageFields(pageId, versionId).subscribe(fields => {
      const repeatableName: any[] = [];
      const repeatableTableName: any[] = [];
      this.fieldsList = fields.mainSection;
      const fieldsListsForMapping: PageFieldVO[] = [];
      const repeatableFieldsListsForMapping: PageFieldVO[] = [];
      const repaeatableFieldId: any[] = [];
      if (this.getFieldMappingFormGroup()) {
        this.form.removeControl('fieldMapping');
      }
      this.form.addControl('fieldMapping', this.formBuilder.group({}));
      this.arrayFields = fields.subSection;

      if (this.fieldsList !== undefined && this.fieldsList.length > 0) {
        this.fieldsList.forEach(field => {
          field.color = this.getRandomColor();
          fieldsListsForMapping.push(field);
          this.getFieldMappingFormGroup().addControl(field.fieldId, this.formBuilder.control(null));
        });
        this.enableFieldMapping = true;
      }
      if (this.arrayFields !== undefined && this.arrayFields.length > 0) {
        this.arrayFields.forEach(fieldName => {
          fieldName.color = this.getRandomColor();
          if (!repeatableName.some(filterColumn => filterColumn.repeatableFieldId === fieldName.repeatableFieldId)) {
            repeatableName.push(fieldName);
            fieldsListsForMapping.push(fieldName);
            this.enableFieldMapping = true;
            // this.getFieldMappingFormGroup().addControl(fieldName.repeatableFieldId, this.formBuilder.control(null));
            // if (this.getRepeatableFieldMappingFormGroup(fieldName.repeatableFieldId + 'ya')) {
            //   this.getFieldMappingFormGroup().removeControl(fieldName.repeatableFieldId + 'ya');
            // }
            // repaeatableFieldId.push(fieldName);
            // this.getFieldMappingFormGroup().addControl(fieldName.repeatableFieldId + 'ya', this.formBuilder.group({}));
          }
          repeatableFieldsListsForMapping.push(fieldName);
          // this.getRepeatableFieldMappingFormGroup(fieldName.repeatableFieldId + 'ya')
          //   .addControl(fieldName.fieldId, this.formBuilder.control(null));
        });
      }
      this.tableFields = fields.tableControl;
      if (this.tableFields !== undefined && this.tableFields.length > 0) {
        this.tableFields.forEach(fieldName => {
          if (!repeatableTableName.some(filterColumn => filterColumn.repeatableFieldId === fieldName.repeatableFieldId)) {
            repeatableTableName.push(fieldName);
            fieldName.color = this.getRandomColor();
            fieldsListsForMapping.push(fieldName);
            this.enableFieldMapping = true;
            this.getFieldMappingFormGroup().addControl(fieldName.repeatableFieldId, this.formBuilder.control(null));
          }
        });
      }
      this.fieldsListForMapping = fieldsListsForMapping;
      this.repeatableFieldsListForMapping = repeatableFieldsListsForMapping;
      this.repeatableFieldsListFormName = repaeatableFieldId;
      if (fromLoad === true) {
        this.form.get('fieldMapping').patchValue(this.taskboardVO.fieldMapping);
      }
      // if (this.loadUserTypeApprovelTypeForm === true) {
      // const value = this.data.nodeData.property.propertyValue;
      // if (value.isCustomForm === false) {
      //   this.form.patchValue(value);
      //   if (this.arrayFields !== undefined && this.arrayFields.length > 0) {
      //     this.arrayFields.forEach(field => {
      //       // if (this.form.get('fieldMapping').get(field.repeatableFieldId) !== null) {
      //       //   this.arrayMappingDetails.push({
      //       //     fieldName: field.repeatableFieldId,
      //       //     value: this.form.get('fieldMapping').get(field.repeatableFieldId).value
      //       //   });
      //       // }
      //     });
      //   }
      // }
      if (this.form.get('formVersion').value === null) {
        this.form.get('formVersion').setValue(versionId);
      }
      // } else {
      //   const value = this.data.nodeData.property.propertyValue;
      //   if (value.isCustomForm === false) {
      //   }
      // }
    });
  }

  setPageFieldValue(value: any): void {
    this.form.get('fieldMapping').get(this.selectedField.fieldId).setValue(value);
    this.form.markAsDirty();
    this.mainSectionFieldMenu.closeMenu();
  }

  setRepeatableFieldValue(value: any): void {
    this.form.get('fieldMapping').get(this.selectedField.repeatableFieldId).setValue(value);
    this.form.markAsDirty();
    this.repeatableNameMenu.closeMenu();
  }

  setRepeatablePageFieldValue(value: any): void {
    this.form.get('fieldMapping').get(this.selectedField.repeatableFieldId + 'ya').get(this.selectedField.fieldId).setValue(value);
    this.form.markAsDirty();
    this.subSectionFieldsMenu.closeMenu();
  }

  receivePublicForm(formId: string) {
    this.form.get('formId').setValue(formId);
    if (window.location.href.includes('localhost')) {
      this.publicFormUrl =
        'http://localhost/' + this.selectedLang + '/' + this.workspaceService.getWorkSpaceKey() +
        '/board/' +
        this.form.get('taskboardKey').value +
        '/' +
        this.form.get('formId').value;
    } else {
      this.URL = window.location.href.split('.com/', 2);
      this.publicFormUrl =
        this.URL[0] +
        '.com/' + this.selectedLang + '/' + this.workspaceService.getWorkSpaceKey() + '/board/' +
        this.form.get('taskboardKey').value +
        '/' +
        this.form.get('formId').value;
    }
  }


  selectEvent() {
    this.showSelectionFormList = true;
  }

  addAnotherColumn(i?: number) {
    this.getprogressArray().push(this.stepperFormArray());
  }

  getRandomColor() {
    return (
      '#' +
      ('000000' + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
    );
  }
  getRandomNumbers() {
    return Math.floor(Math.random() * (999 - 100 + 1) + 100);
  }

  getprogressArray() {
    return this.form.get('taskboardColumns') as FormArray;
  }

  addProgressBar() {
    const length = this.getprogressArray().length;
    let newLength = null;
    if (this.editForm === true || (this.data && this.data.duplicate)) {
      newLength = length - 1;
      this.getprogressArray().insert(length - 1,
        this.formBuilder.group({
          id: [],
          formId: [],
          version: [],
          columnName: [{ value: '', disabled: false }, [Validators.required]],
          columnOrder: [newLength],
          columnColor: [this.getRandomColor1()],
          taskCounts: [],
          isColumnBackground: [false]
        })
      );
    } else {
      newLength = length + 1;
      this.getprogressArray().insert(length + 1,
        this.formBuilder.group({
          id: [],
          formId: [],
          version: [],
          columnName: [{ value: '', disabled: false }, [Validators.required]],
          columnOrder: [newLength],
          columnColor: [this.getRandomColor1()],
          taskCounts: [],
          isColumnBackground: [false]
        })
      );
    }

    const formArray = this.form.get('taskboardColumns') as FormArray;
    this.previewArray = formArray.value;
    this.doneIndex = this.previewArray.findIndex(x => x.columnName === this.form.get('done').value);
    if (this.doneIndex !== -1) {
      formArray.get('' + this.doneIndex).get('columnOrder').setValue(formArray.length - 1);
    }
    this.colorArray.push(this.getRandomColor());

  }

  removeProgressbar(i: number) {
    this.counter = i + 1;
    const index = '' + i;
    const form = this.getprogressArray().get(index);
    if (this.taskboardVO && this.taskboardVO.taskboardColumnMapVO && this.taskboardVO.taskboardColumnMapVO.length > 0) {
      const list = this.taskboardVO.taskboardColumnMapVO.filter(x => x.taskboardColumnsVO.columnName === form.get('columnName').value);
      if (list.length > 0 && list[0].taskboardTaskVOList && list[0].taskboardTaskVOList.length > 0) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'This column has tasks, move the task from this column',
        });
      } else {
        this.removeColumn(i);
      }
    } else {
      this.removeColumn(i);
    }
  }

  removeColumn(i: number) {
    const index = '' + i;
    const form = this.getprogressArray().get(index);
    const id = form.get('id').value;
    if (id) {
      this.removedColumnsIdList.push(id);
    }
    if (this.editForm === true) {
      if (this.getprogressArray().length !== 3) {
        this.getprogressArray().removeAt(i);
        const formArray = this.form.get('taskboardColumns') as FormArray;
        this.previewArray = formArray.value;
        this.doneIndex = this.previewArray.findIndex(x => x.columnName === this.form.get('done').value);
        if (this.doneIndex !== -1) {
          formArray.get('' + this.doneIndex).get('columnOrder').setValue(formArray.length - 1);
        }
        this.getprogressArray().controls.forEach(control => {
          if (control.value.columnName === this.form.get('todo').value) {
            this.todoIndex = this.getprogressArray().controls.indexOf(control);
          }
        });

        this.getprogressArray().controls.forEach(control => {
          if (control.value.columnName === this.form.get('done').value) {
            this.doneIndex = this.getprogressArray().controls.indexOf(control);
          }
        });
        for (let j = 0; j < this.getprogressArray().length; j++) {
          this.getprogressArray().get('' + j).get('columnOrder').setValue(j);
        }
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Minimum one column requiired',
        });
      }
    } else {
      if (this.getprogressArray().length !== 1) {
        this.getprogressArray().removeAt(i);
        for (let j = 0; j < this.getprogressArray().length; j++) {
          this.getprogressArray().get('' + j).get('columnOrder').setValue(j + 1);
        }
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Minimum one column required',
        });
      }
    }
  }
  getRandomColor1() {
    if (this.colors) {
      if (this.colors.childs.length >= this.counter) {
        this.colors.childs[this.counter];
        this.counter = this.counter + 1;

        return this.colors.childs[this.counter];
      }
    }
    else {
      return (
        '#' +
        ('000000' + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
      );
    }



  }


  preview() {
    this.previewArray = [];
    if (this.editForm === true || (this.data && this.data.duplicate)) {
      const formArray = this.form.get('taskboardColumns') as FormArray;
      // this.previewArray = formArray.value;
      // if (this.previousFormArrayLength !== this.previewArray.length) {
      //   this.doneIndex = this.previewArray.findIndex(x => x.columnName === this.form.get('done').value);
      //   formArray.get('' + this.doneIndex).get('columnOrder').setValue(formArray.length - 1);


      this.previewArray = formArray.value;
      const length = this.previewArray.length;
      const index = this.previewArray.findIndex(ele => ele.columnOrder === length - 1);
      this.previewArray[0].columnName = this.form.get('todo').value;
      this.previewArray[index].columnName = this.form.get('done').value;


      this.previewArray.sort((a, b) => {
        if (a.columnOrder < b.columnOrder) {
          return -1;
        }
        if (a.columnOrder > b.columnOrder) {
          return 1;
        }
        return 0;
      });

    }
    else {
      const formArray = this.form.get('taskboardColumns') as FormArray;
      this.previewArray = formArray.value;
      if (this.form.get('todo').value && !this.previewArray.some(element => element.columnName === this.form.get('todo').value)) {

        const taskboardTodoColumnsVO = {
          columnColor: this.colors.parent,
          columnName: this.form.get('todo').value,
          columnOrder: 0,
          formId: null,
          version: null,
          id: null,
          taskCounts: null,
          layoutType: null,
          isColumnBackground: null

        };

        this.previewArray.push(taskboardTodoColumnsVO);
      }
      if (!this.previewArray.some(element => element.columnName === this.form.get('done').value)) {

        const taskboardDoneColumnsVO = {
          columnColor: this.colors.childs[8],
          columnName: this.form.get('done').value,
          columnOrder: formArray.length,
          formId: null,
          version: null,
          id: null,
          taskCounts: null,
          layoutType: null,
          isColumnBackground: null

        };
        this.previewArray.push(taskboardDoneColumnsVO);
      }

      this.previewArray.sort((a, b) => {
        if (a.columnOrder < b.columnOrder) {
          return -1;
        }
        if (a.columnOrder > b.columnOrder) {
          return 1;
        }
        return 0;
      });

    }
  }

  close() {
    this.dialogRef.close(this.taskboardVO);
  }

  drop(event: CdkDragDrop<string[]>) {
    let todoColumn = null;
    let doneColumn = null;
    let todoIndex = null;
    let doneIndex = null;
    this.getprogressArray().controls.forEach(control => {
      if (control.value.columnName === this.form.get('todo').value) {
        todoIndex = this.getprogressArray().controls.indexOf(control);
      }
    });

    if (todoIndex !== -1 && todoIndex !== null) {
      todoColumn = this.getprogressArray().get('' + todoIndex).value;
      this.getprogressArray().removeAt(todoIndex);
      this.todoIndex = null;
    }

    this.getprogressArray().controls.forEach(control => {
      if (control.value.columnName === this.form.get('done').value) {
        doneIndex = this.getprogressArray().controls.indexOf(control);
      }
    });

    if (doneIndex !== -1 && doneIndex !== null) {
      doneColumn = this.getprogressArray().get('' + doneIndex).value;
      this.getprogressArray().removeAt(doneIndex);
      this.doneIndex = null;
    }

    if (todoIndex === null && doneIndex === null) {
      const index1 = this.getprogressArray().value.findIndex(t => t.columnName === this.form.get('todo').value);
      if (index1 !== undefined && index1 !== -1 && index1 !== null) {
        this.getprogressArray().value.splice(index1, 1);
      }
      const index2 = this.getprogressArray().value.findIndex(t => t.columnName === this.form.get('done').value);
      if (index2 !== undefined && index2 !== -1 && index2 !== null) {
        this.getprogressArray().value.splice(index2, 1);
      }
    }
    const array = this.getprogressArray().value;
    const currentIndex = event.currentIndex;
    const previousIndex = event.previousIndex;
    const currentIndexColumn = array[previousIndex];
    const columns = JSON.parse(JSON.stringify(this.getprogressArray().value));
    if (previousIndex > currentIndex) {
      for (let i = 0; i < previousIndex + 1; i++) {
        if (i > currentIndex) {
          const columnOrder = currentIndexColumn.columnOrder;
          this.setColumnArray(i, columns[i - 1], columnOrder);
        } else if (i === currentIndex) {
          const columnOrder = columns[currentIndex].columnOrder;
          this.setColumnArray(i, currentIndexColumn, columnOrder);
        }
      }
    } else {
      for (let i = currentIndex; i >= previousIndex; i--) {
        if (i < currentIndex) {
          const columnOrder = currentIndexColumn.columnOrder;
          this.setColumnArray(i, columns[i + 1], columnOrder);
        } else if (i === currentIndex) {
          const columnOrder = columns[currentIndex].columnOrder;
          this.setColumnArray(i, currentIndexColumn, columnOrder);
        }
      }
    }

    for (let i = 0; i < this.getprogressArray().value.length; i++) {
      this.getprogressArray().get('' + i).get('columnOrder').setValue(i + 1);
    }

    if (doneColumn) {
      doneColumn.columnOrder = this.getprogressArray().value.length;



      this.getprogressArray().insert(0, this.formBuilder.group({
        id: [todoColumn.id],
        formId: [todoColumn.formId],
        version: [todoColumn.version],
        columnName: [
          { value: todoColumn.columnName, disabled: false },
          [Validators.required],
        ],
        columnOrder: [todoColumn.columnOrder],
        columnColor: [todoColumn.columnColor],
        taskCounts: [],
      }));

      this.getprogressArray().insert(this.getprogressArray().value.length, this.formBuilder.group({
        id: [doneColumn.id],
        formId: [doneColumn.formId],
        version: [doneColumn.version],
        columnName: [
          { value: doneColumn.columnName, disabled: false },
          [Validators.required],
        ],
        columnOrder: [this.getprogressArray().value.length],
        columnColor: [doneColumn.columnColor],
        taskCounts: [],
      }));
      this.getprogressArray().controls.forEach(control => {
        if (control.value.columnName === this.form.get('todo').value) {
          this.todoIndex = this.getprogressArray().controls.indexOf(control);
        }
      });

      this.getprogressArray().controls.forEach(control => {
        if (control.value.columnName === this.form.get('done').value) {
          this.doneIndex = this.getprogressArray().controls.indexOf(control);
        }
      });
    }
  }

  setColumnArray(i, currentIndexColumn, columnOrder) {
    this.getprogressArray().get('' + i).get('columnName').patchValue(currentIndexColumn.columnName);
    this.getprogressArray().get('' + i).get('columnColor').patchValue(currentIndexColumn.columnColor);
    this.getprogressArray().get('' + i).get('columnOrder').patchValue(columnOrder);
    this.getprogressArray().get('' + i).get('formId').patchValue(currentIndexColumn.formId);
    this.getprogressArray().get('' + i).get('id').patchValue(currentIndexColumn.id);
    this.getprogressArray().get('' + i).get('version').patchValue(currentIndexColumn.version);
    this.getprogressArray().get('' + i).get('taskCounts').patchValue(currentIndexColumn.taskCounts);
  }

  getColumnIndex(i, totalLength, k, index) {
    if (i < 0) {
      return k + index;
    } else {
      return i;
    }
  }
  change(event) {
    if (event.checked === true) {
      this.showBg = true;
    }
    else {
      this.showBg = false;
    }
  }

  onCategorySelected(category: any): void {
    for (let i = 0; i < this.templatesCategoriesArray.length; i++) {
      this.templatesCategoriesArray[i].isSelected = false;
    }
    category.isSelected = true;
    this.selectedTemplatesWithCategory = [];
    const templateCategories = new TaskboardTemplatesCategories();
    if (category.name !== 'All') {
      templateCategories.category = category.name;
      this.taskboardTemplatesVOList.forEach(element => {
        if (element.category === category.name) {
          if (templateCategories.templates === undefined || templateCategories.templates === null) {
            templateCategories.templates = [];
          }
          templateCategories.templates.push(element);
        }
      });
      this.selectedTemplatesWithCategory.push(templateCategories);
    } else {
      this.loadTemplatesWithcategory();
    }
  }
  edit_Form() {
    this.editFormValue = this.form.value;

    if (this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.layoutType === 'workflowForms') {
      this.publicAcess = false;
    }
    else {
      this.publicAcess = true;

    }
    return this.dialog.open(CreateFormDialogComponent, {
      disableClose: true,
      height: '97%',
      width: '100vw',
      maxWidth: '90vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-modal',
      data: { id: this.editFormValue.formId, versionId: this.editFormValue.formVersion, publicform: this.publicAcess },
    });
  }
  copyToClipboard() {
    if (this.publicFormUrl !== '' && this.publicFormUrl !== undefined && this.publicFormUrl !== null) {
      this.clipboardService.copy(this.publicFormUrl);
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Copied to Clipboard',
      });
    }
  }

  openInNewTab(publicFormUrl) {
    if (publicFormUrl !== '' && publicFormUrl !== undefined && publicFormUrl !== null) {
      window.open(publicFormUrl, '_blank');
    }
  }

  openSprintSettings(event: MatSlideToggleChange): void {

    if (this.isFreePlan) {
      this.form.get('sprintEnabled').setValue(false);
      const dialog = this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
      });
    } else {
      if (event.checked === true) {
        const taskboard = this.data.taskboardList.find(t => t.id === this.taskboardVO?.id)
        const dialog = this.dialog.open(SprintDialogComponent, {
          width: '600px',
          disableClose: true,
          data: {
            taskboardId: this.taskboardVO?.id,
            sprintSettings: this.taskboardVO?.sprintSettingsVo,
            taskboardVO: taskboard
          }
        });
        dialog.afterClosed().subscribe(data => {
          if (data && data.sprintSettings) {
            this.sprintSettings = data.sprintSettings
          } else if (!data) {
            this.form.get('sprintEnabled').setValue(false);
          }
        });
      }
    }
  }
}
