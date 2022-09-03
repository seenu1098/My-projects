import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TableObjectsVO } from 'src/app/creation-module/table-objects/table-object-vo';
import { ImportDialogComponent } from 'src/app/designer-module/import-dialog/import-dialog.component';
import { ExportPages } from 'src/app/designer-module/task-flow/model/page-vo';
import { Workflow } from 'src/app/designer-module/task-flow/model/workflow.model';
import { TaskService } from 'src/app/designer-module/task-flow/services/task.service';
import { Tab } from 'src/app/mytasks-module/my-request-routing/my-request-routing.component';
import { ThemeService } from 'src/app/services/theme.service';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { TaskboardTemplatesCategories, TaskboardTemplatesVO, WorkflowTemplatesCategories, WorkflowTemplatesVO } from 'src/app/taskboard-module/taskboard-configuration/taskboard.model';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { TemplateDialogComponent } from 'src/app/taskboard-module/template-dialog/template-dialog.component';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { TemplateCenterService } from './template-center.service';

@Component({
  selector: 'app-template-center',
  templateUrl: './template-center.component.html',
  styleUrls: ['./template-center.component.scss']
})
export class TemplateCenterComponent implements OnInit {

  constructor(
    private taskService: TaskService,
    private templateService: TaskBoardService,
    private templateCenterService: TemplateCenterService,
    private dialog: MatDialog,
    private themeService: ThemeService,
    private router: Router,
    private workspaceService: WorkspaceService) { }
  form: FormGroup;
  selectedWorkflowTemplatesWithCategory: WorkflowTemplatesCategories[] = [];
  selectedTaskboardTemplatesWithCategory: TaskboardTemplatesCategories[] = [];
  workflowTemplatesVOList: WorkflowTemplatesVO[] = [];
  taskboardTemplatesVOList: TaskboardTemplatesVO[] = [];
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

  tabList: any[] = [
    { name: 'Workflow', value: 'workflow', isSelected: true },
    { name: 'Taskboard', value: 'taskboard', isSelected: false }
  ];
  selectedTab = 'workflow';
  show = true;
  screenHeight: any;
  screenWidth: any;
  screenHeight1: any;
  screenScrollHeight: any;
  templateScrollHeight: any
  json: any;
  exportPages: ExportPages[] = [];
  workFlowVO = new Workflow();
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1) + 'px';
      this.templateScrollHeight = (window.innerHeight - 116) + 'px';
    } else {
      this.screenHeight = (window.innerHeight - 63) + 'px';
      this.templateScrollHeight = (window.innerHeight - 214) + 'px';
    }
  }

  ngOnInit(): void {
    this.templateService.getWorkflowTemplates().subscribe(data => {
      this.workflowTemplatesVOList = data;
      // this.dataLoad = true;
      this.loadTemplatesWithWorkflowcategory();
    });

    this.templateService.getTaskboardTemplates().subscribe(data => {
      this.taskboardTemplatesVOList = data;
      this.loadTemplatesWithTaskboardcategory();
    });

    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
  }

  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1) + 'px';
      this.templateScrollHeight = (window.innerHeight - 116) + 'px';
    } else {
      this.screenHeight = (window.innerHeight - 63) + 'px';
      this.templateScrollHeight = (window.innerHeight - 214) + 'px';
    }
  }

  loadTemplatesWithWorkflowcategory(): void {
    for (let i = 0; i < this.templatesCategoriesArray.length; i++) {
      if (this.workflowTemplatesVOList.some(category => category.category === this.templatesCategoriesArray[i].name)) {
        const templateCategories = new WorkflowTemplatesCategories();
        templateCategories.category = this.templatesCategoriesArray[i].name;
        if (templateCategories.templates === undefined || templateCategories.templates === null) {
          templateCategories.templates = [];
        }
        this.workflowTemplatesVOList.forEach(element => {
          if (element.category === this.templatesCategoriesArray[i].name) {
            templateCategories.templates.push(element);
          }
        });
        this.selectedWorkflowTemplatesWithCategory.push(templateCategories);
      }
    }
  }

  loadTemplatesWithTaskboardcategory(): void {
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
        this.selectedTaskboardTemplatesWithCategory.push(templateCategories);
      }
    }
  }

  onWorkflowCategorySelected(category: any): void {
    for (let i = 0; i < this.templatesCategoriesArray.length; i++) {
      this.templatesCategoriesArray[i].isSelected = false;
    }
    category.isSelected = true;
    this.selectedWorkflowTemplatesWithCategory = [];
    const templateCategories = new WorkflowTemplatesCategories();
    if (category.name !== 'All') {
      templateCategories.category = category.name;
      this.workflowTemplatesVOList.forEach(element => {
        if (element.category === category.name) {
          if (templateCategories.templates === undefined || templateCategories.templates === null) {
            templateCategories.templates = [];
          }
          templateCategories.templates.push(element);
        }
      });
      this.selectedWorkflowTemplatesWithCategory.push(templateCategories);
    } else {
      this.loadTemplatesWithWorkflowcategory();
    }
  }

  onTaskboardCategorySelected(category: any): void {
    for (let i = 0; i < this.templatesCategoriesArray.length; i++) {
      this.templatesCategoriesArray[i].isSelected = false;
    }
    category.isSelected = true;
    this.selectedTaskboardTemplatesWithCategory = [];
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
      this.selectedTaskboardTemplatesWithCategory.push(templateCategories);
    } else {
      this.loadTemplatesWithTaskboardcategory();
    }
  }

  removeDuplicateTable(tableObjectListVO: TableObjectsVO[] = []) {
    for (let i = 0; i < tableObjectListVO.length; i++) {
      for (let j = 0; j < tableObjectListVO.length; j++) {
        if (i !== j && tableObjectListVO[i].tableName === tableObjectListVO[j].tableName) {
          tableObjectListVO.splice(j, 1);
        }
      }
    }
    return tableObjectListVO;
  }

  selectedWorkflowTemplate(templateVO: WorkflowTemplatesVO) {
    if (templateVO) {
      // this.templateCenterService.setWorkflowJson(templateVO.workflowData);
      this.json = templateVO.workflowData;
      this.json.workflowVO.taskNodeList.forEach(task => {
        if (task.taskType === 'START_TASK' || task.taskType === 'APPROVAL_TASK' || task.taskType === 'USER_TASK') {
          const pageId = task.taskProperty.propertyValue.formIdentifier;
          const version = task.taskProperty.propertyValue.formVersion;
          const taskId = task.key;
          const taskName = task.taskType;
          this.exportPages.push({ pageId: pageId, version: version, taskId: taskId, taskName: taskName });
        }
      });

      const dialog = this.dialog.open(ImportDialogComponent, {
        disableClose: true,
        width: '1000px',
        panelClass: 'scroll',
        maxHeight: '650px',
        data: {
          type: 'import',
          workflowJson: this.json.workflowVO, pageJson: this.json.page, exportPage: this.exportPages,
          permission: this.json.permission, subdoainName: this.json.subdomainName, tableVO: this.json.tableObjectListVO
        }
      });
      this.removeDuplicateTable(this.json.tableObjectListVO);
      dialog.afterClosed().subscribe(data => {
        if (data !== false) {
          this.workFlowVO.workflowId = null;
          this.workFlowVO = data.workflowData;
          this.onSubmit();

          new Promise((resolve, reject) => {
            setTimeout(() => resolve(1), 1000);
          }).then(doc => {

            if (data.pageVo.length > 0) {
              const arrOfString = window.location.href.split('//', 2);
              const Url = arrOfString[1].split('.', 2);
              this.taskService.savePages(data.pageVo).subscribe(pageResponse => {
                if (pageResponse.response.includes('Saved')) {

                  if (data.permissionVoList && data.permissionVoList.length > 0) {
                    for (let i = 0; i < data.permissionVoList.length; i++) {
                      data.permissionVoList[i].version = '1';
                    }

                    if (Url[0] === this.json.subdomainName) {
                      this.taskService.savePagePaermissions(data.permissionVoList).subscribe(data => {
                        if (data.response.includes('Created')) {
                        }
                      });
                    } else {
                      this.taskService.savePagePaermissionsForImport(data.permissionVoList).subscribe(data => {
                        if (data.response.includes('Created')) {
                        }
                      });
                    }

                  }



                }
              });
            }

            if (this.json.tableObjectListVO.length > 0) {
              this.taskService.saveTableListVO(this.json.tableObjectListVO).subscribe(table => {
                if (table.response.includes('Table Objects Created Successfully')) {
                }
              });
            }
          });



        }
      });
    }
  }

  onSubmit() {

    this.taskService.createWorkFlow(this.workFlowVO).subscribe(data => {
      if (data.response.includes('successfully')) {
        this.workspaceService.setHideHover(false);
        this.workspaceService.setHideSubMenu(true);
        this.workspaceService.setActiveElement('Workflow');
        this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/workflow-application']);
      } else if (data.response.includes('exceeded your limit')) {
        const dialog = this.dialog.open(AlertmessageComponent, {
          width: '450px',
          data: data.licenseVO
        });
      }
    });

  }

  selectedTaskboardTemplate(templateVO: TaskboardTemplatesVO) {
    if (templateVO) {
      const dialog = this.dialog.open(TemplateDialogComponent, {
        disableClose: true,
        width: '30%',
        maxWidth: '30%',
        height: '50%',
        panelClass: 'config-dialog',
        data: templateVO.data
      });
      dialog.afterClosed().subscribe((taskData) => {
        if (taskData.flag !== false) {
          this.templateCenterService.setTaskboardJson(taskData);
        }
      });
    }
  }

  tabChange(tab) {
    this.selectedTab = tab.value;
    this.tabList.forEach(t => { t.isSelected = false });
    tab.isSelected = true;
  }
}
