import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TaskBoardService } from "../../taskboard-module/taskboard-configuration/taskboard.service";

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

import {
  TaskboardVO,
  ProgressName,
  TaskboardTemplatesVO,
  WorkflowTemplatesVO,
  TaskboardTemplatesCategories,
  WorkflowTemplatesCategories
} from "../../taskboard-module/taskboard-configuration/taskboard.model";
@Component({
  selector: 'app-create-workflow',
  templateUrl: './create-workflow.component.html',
  styleUrls: ['./create-workflow.component.scss']
})
export class CreateWorkflowComponent implements OnInit {

  @Output() public templateData = new EventEmitter<any>();

  form: FormGroup;
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
  dataLoad: boolean = false;
  templatesListWithCategory: WorkflowTemplatesCategories[] = [];
  selectedTemplatesWithCategory: WorkflowTemplatesCategories[] = [];
  taskboardTemplatesVOList: WorkflowTemplatesVO[] = [];
  taskboardTemplateVo = new WorkflowTemplatesVO();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateWorkflowComponent>,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
    private taskService: TaskBoardService,
  ) { }

  ngOnInit(): void {
    this.dataLoad = false;
    if (this.data && this.data.fromScratch) {
      this.taskService.getWorkflowTemplates().subscribe(data => {
        this.taskboardTemplatesVOList = data;
        this.dataLoad = true;
        this.loadTemplatesWithcategory();
      });
    }
  }

  createNewWorkflow() {
    this.dialogRef.close();
    // this.router.navigate(['/yoroflow-design/create']);
  }

  loadTemplatesWithcategory(): void {
    for (let i = 0; i < this.templatesCategoriesArray.length; i++) {
      if (this.taskboardTemplatesVOList.some(category => category.category === this.templatesCategoriesArray[i].name)) {
        const templateCategories = new WorkflowTemplatesCategories();
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

  onCategorySelected(category: any): void {
    for (let i = 0; i < this.templatesCategoriesArray.length; i++) {
      this.templatesCategoriesArray[i].isSelected = false;
    }
    category.isSelected = true;
    this.selectedTemplatesWithCategory = [];
    const templateCategories = new WorkflowTemplatesCategories();
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

  selectedTemplate(templateVO: WorkflowTemplatesVO) {
    if (templateVO) {
      this.dialogRef.close(templateVO.workflowData);
    }

  }
}
