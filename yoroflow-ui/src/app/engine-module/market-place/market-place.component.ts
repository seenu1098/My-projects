import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { Page, Permission } from 'yoroapps-creation/lib/shared/vo/page-vo';
import {Page, Permission} from '../../creation-module/shared/vo/page-vo';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MarketPlaceService } from './market-place.service';
import { ExportPages, InstalledApps, JsonData, MarketPlaceVO, PageIdListVO, TableListVO, TableObjectsVO } from './market-place.vo';

@Component({
  selector: 'lib-market-place',
  templateUrl: './market-place.component.html',
  styleUrls: ['./market-place.component.css']
})
export class MarketPlaceComponent implements OnInit {

  form: FormGroup;
  marketPlaceVO = new MarketPlaceVO();
  organizationList: any[] = [];
  workflowList: any[] = [];
  exportPages: ExportPages[] = [];
  workFlowVO: any;
  page: Page[] = [];
  pagePermissionsVOList: Permission[] = [];
  tableObjectListVO: TableObjectsVO[] = [];
  tableListVO = new TableListVO();
  tableList: any[] = [];
  install = false;
  marketPlaceApps: MarketPlaceVO[] = [];
  installedApps: InstalledApps[] = [];
  height: any;
  yoroAdmin: any;
  show = false;
  version: any;
  description: any;
  developerName: any;
  randomNumber: any;
  startKey: any;

  constructor(private dialog: MatDialog, private fb: FormBuilder, private marketPlaceService: MarketPlaceService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getRandomNumber();
    this.marketPlaceService.getYoroAdmin().subscribe(data => {
      if (data.response.includes('Logged in user is in Yoro Admin group')) {
        this.yoroAdmin = true;
        this.getWorkflowList();
      } else if (data.response.includes('Logged in user is not in Yoro Admin group')) {
        this.yoroAdmin = false;
      }
      this.show = true;
      this.height = Math.round((79 / 100) * window.innerHeight) + 'px';
      this.getMarketPlaceApps();
    });
  }

  getRandomNumber() {
    this.randomNumber = Math.random().toString(36).substring(2, 5);
  }


  getWorkflowList() {
    this.marketPlaceService.getWorkflowList().subscribe(workflowList => {
      this.workflowList = workflowList;
    });
  }

  getInstalledApps() {
    this.marketPlaceService.getInstalledApps().subscribe(installedApps => {
      this.installedApps = installedApps;
      if (this.yoroAdmin === false) {
        this.record();
      }
    });
  }

  getMarketPlaceApps() {
    this.marketPlaceService.getMarketPlaceApps().subscribe(marketPlaceApps => {
      this.marketPlaceApps = marketPlaceApps;
      this.getInstalledApps();
    });
  }

  installApp(workflow, i) {
    let installApp = new InstalledApps();
    installApp.processDefinitionName = workflow.uploadWorkflows;
    installApp.install = 'Y';
    installApp.installFrom = 'user';
    installApp.description = workflow.description;
    installApp.startKey = workflow.startKey;
    this.marketPlaceService.installApps(installApp).subscribe(data => {
      let jsonData = new JsonData();
      jsonData = data.data;
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Application Installed Successfully',
      });
      this.getInstalledApps();
      this.marketPlaceService.getMarketPlaceApps().subscribe(marketPlaceApps => {
        for (let i = 0; i < marketPlaceApps.length; i++) {
          if (marketPlaceApps[i].uploadWorkflows === workflow.uploadWorkflows) {
            marketPlaceApps[i].install = true;
          }
          for (let j = 0; j < this.installedApps.length; j++) {
            if (this.marketPlaceApps[i].uploadWorkflows === this.installedApps[j].processDefinitionName) {
              this.marketPlaceApps[i].install = true;
            }
          }
        }
        this.marketPlaceApps = marketPlaceApps;
      });
      const randomNumber = Math.random().toString(36).substring(2, 5);
      this.workflowImport(jsonData, randomNumber);
    });
  }

  installApplication(workFlow) {
    let installApp = new InstalledApps();
    installApp.processDefinitionName = workFlow.processDefinitionName;
    installApp.installFrom = 'yoroAdmin';
    installApp.startKey = workFlow.startKey;
    this.marketPlaceService.installApps(installApp).subscribe(data => {
      let jsonData = new JsonData();
      jsonData = data.data;
      this.workflowImport(jsonData, null);
    });
    this.marketPlaceService.setInstallWorkflow(workFlow.key, workFlow.workflowVersion, 'install').subscribe(data => {
      this.getWorkflowList();
    });
  }

  approve(workFlow) {
    this.marketPlaceService.setInstallWorkflow(workFlow.key, workFlow.workflowVersion, 'approve').subscribe(data => {
      this.getWorkflowList();
    });
    this.marketPlaceService.setApproveOrDisable(workFlow.processDefinitionName, 'approve').subscribe(data => {
      this.marketPlaceService.getMarketPlaceApps().subscribe(marketPlaceApps => {
        this.marketPlaceApps = marketPlaceApps;
      });
    });
  }

  disable(workFlow) {
    this.marketPlaceService.setInstallWorkflow(workFlow.key, workFlow.workflowVersion, 'disable').subscribe(data => {
      this.getWorkflowList();
    });
    this.marketPlaceService.setApproveOrDisable(workFlow.processDefinitionName, 'disable').subscribe(data => {
      this.marketPlaceService.getMarketPlaceApps().subscribe(marketPlaceApps => {
        this.marketPlaceApps = marketPlaceApps;
      });
    });
  }

  uninstall(workFlow) {
    workFlow.install = 'N';
    workFlow.installFrom = 'user';
    this.marketPlaceService.installApps(workFlow).subscribe(data => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Application Uninstalled Successfully',
      });
      this.getInstalledApps();
      this.marketPlaceService.getMarketPlaceApps().subscribe(marketPlaceApps => {
        this.marketPlaceApps = marketPlaceApps;
      });
      this.marketPlaceService.uninstalledworkflow(workFlow.processDefinitionName, workFlow.startKey).subscribe(data => {
      });
    });
  }

  record() {
    for (let i = 0; i < this.marketPlaceApps.length; i++) {
      for (let j = 0; j < this.installedApps.length; j++) {
        if (this.marketPlaceApps[i].uploadWorkflows === this.installedApps[j].processDefinitionName) {
          this.marketPlaceApps[i].install = true;
        }
      }
    }
  }

  addNewWorkflow(type: string) {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '800px',
      data: { data: 'addApplication', type: type }
    });
    dialog.afterClosed().subscribe(data => {
      if (data !== false) {
        this.version = data.version;
        this.description = data.description;
        this.developerName = data.developerName;
        if (data.file) {
          const json = new JsonData();
          json.workflowVO = data.file.workflowVO;
          json.page = data.file.page;
          json.permission = data.file.permission;
          json.tableObjectListVO = data.file.tableObjectListVO;
          json.subdomainName = data.file.subdomainName;
          json.workflowVO.workflowId = '';
          json.workflowVO.name = data.definitionName;
          const name = (json.workflowVO.name).replace(/[^\w\s]/gi, '');
          json.workflowVO.key = (name).trim().toLowerCase().replace(/ +/g, '-');
          json.workflowVO.uploadWorkflow = 'Y';
          if (json.page.length > 0) {
            for (let i = 0; i < json.page.length; i++) {
              if (json.page[i].layoutType === 'publicForm') {
                json.page[i].sections.forEach(mainSection => {
                  mainSection.rows.forEach(row => {
                    row.columns.forEach(column => {
                      if (column.controlType === 'button') {
                        column.field.control.buttonType = 'action';
                        column.field.control.screenType = 'callWorkflow';
                        column.field.control.saveAndCallWorkflow = true;
                        column.field.control.workflowKey = json.workflowVO.key;
                        column.field.control.workflowVersion = 'latest';
                      }
                    });
                  });
                });
              }
              json.page[i].version = 1;
            }
            this.marketPlaceService.savePages(json.page).subscribe(pageResponse => {
              if (pageResponse.response.includes('Saved')) {
                if (json.permission && json.permission.length > 0) {
                  this.marketPlaceService.savePagePaermissions(json.permission).subscribe(data => {
                    if (data.response.includes('Created')) {
                    }
                  });
                }
              }
            });
          }
          if (json.tableObjectListVO.length > 0) {
            this.marketPlaceService.saveTableListVO(json.tableObjectListVO).subscribe(table => {
              if (table.response.includes('Table Objects Created Successfully')) {
              }
            });
          }
          this.getWorkflowKeys(json.workflowVO, json.subdomainName);
          json.workflowVO.taskNodeList.forEach(task => {
            if (task.taskProperty.propertyValue && task.taskProperty.propertyValue.formIdentifier) {
              task.taskProperty.propertyValue.formVersion = 1;
            }
          });
          this.marketPlaceService.createWorkFlow(json.workflowVO).subscribe(workflow => {
            this.version = 1;
            this.setJsondata(json.workflowVO, json.page, json.permission, json.tableObjectListVO);
          });
        } else {
          this.marketPlaceService.getWorkflow(data.title, data.version).subscribe(data => {
            this.workFlowVO = data;
            this.getUploadedWorkflowsJsonObjects();
          });
        }
      }
    });
  }

  getUploadedWorkflowsJsonObjects() {
    let tableObjectListVO: TableObjectsVO[] = [];
    this.workFlowVO.taskNodeList.forEach(task => {
      if (task.taskType === 'START_TASK' || task.taskType === 'APPROVAL_TASK' || task.taskType === 'USER_TASK') {
        const pageId = task.taskProperty.propertyValue.formIdentifier;
        const version = task.taskProperty.propertyValue.formVersion;
        const taskId = task.key;
        const taskName = task.taskType;
        this.exportPages.push({ pageId: pageId, version: version, taskId: taskId, taskName: taskName });
      }
    });
    this.marketPlaceService.getPageList(this.exportPages).subscribe(list => {
      this.page = list;
      let pageIdList = new PageIdListVO;
      for (let i = 0; i < this.page.length; i++) {
        pageIdList.uuidList.push(this.page[i].yorosisPageId);
      }
      this.marketPlaceService.getPagePermissions(pageIdList).subscribe(data => {
        this.pagePermissionsVOList = data;
        this.tableList = [];
        for (let i = 0; i < this.page.length; i++) {
          this.checkTableExist(this.page[i]);
        }
        if (this.tableList.length > 0) {
          this.tableListVO.tableList = this.tableList;
          this.marketPlaceService.getTableListVO(this.tableListVO).subscribe(data => {
            tableObjectListVO = data;
            this.setJsondata(this.workFlowVO, this.page, this.pagePermissionsVOList, tableObjectListVO);
          });
        } else {
          const tableObjects: any[] = [];
          this.setJsondata(this.workFlowVO, this.page, this.pagePermissionsVOList, tableObjects);
        }
      });
    });
  }

  setUniqueTaskKeys(type) {
    return type + this.randomNumber;
  }

  getWorkflowKeys(workflowJsonData, subdoainName) {
    workflowJsonData.startKey = this.setUniqueTaskKeys(workflowJsonData.startKey);
    this.startKey = workflowJsonData.startKey;
    workflowJsonData.canPublish = false;
    workflowJsonData.status = 'draft';
    workflowJsonData.linkNodeList.forEach(link => {
      link.key = this.setUniqueTaskKeys(link.key);
      link.source = this.setUniqueTaskKeys(link.source);
      link.target = this.setUniqueTaskKeys(link.target);
    });
    workflowJsonData.taskNodeList.forEach(task => {
      task.key = this.setUniqueTaskKeys(task.key);
      if (task.taskType === 'APPROVAL_TASK') {
        if (task.taskProperty.propertyValue.approvalTask) {
          task.taskProperty.propertyValue.approvalTask = this.setUniqueTaskKeys(task.taskProperty.propertyValue.approvalTask);
        }
        if (task.taskProperty.propertyValue.rejectedTask) {
          task.taskProperty.propertyValue.rejectedTask = this.setUniqueTaskKeys(task.taskProperty.propertyValue.rejectedTask);
        }
        if (task.taskProperty.propertyValue.sendBackTask) {
          task.taskProperty.propertyValue.sendBackTask = this.setUniqueTaskKeys(task.taskProperty.propertyValue.sendBackTask);
        }
      }
      const arrOfString = window.location.href.split('//', 2);
      const Url = arrOfString[1].split('.', 2);
      if (subdoainName !== Url[0]) {
        if (task.taskProperty.propertyValue && (task.taskProperty.propertyValue.assigneeUser
          || task.taskProperty.propertyValue.assigneeGroup)) {
          task.taskProperty.propertyValue.assigneeUser = '';
          task.taskProperty.propertyValue.assigneeGroup = '';
        }
      }
    });
    return workflowJsonData;
  }

  setJsondata(workflowVO, page, pagePermission, tableObjectListVO) {
    const jsondata = new JsonData();
    const arrOfString = window.location.href.split('//', 2);
    const Url = arrOfString[1].split('.', 2);
    this.getWorkflowKeys(workflowVO, Url[0]);
    jsondata.workflowVO = workflowVO;
    for (let i = 0; i < page.length; i++) {
      jsondata.page.push(page[i]);
    }
    jsondata.permission = pagePermission;
    jsondata.tableObjectListVO = tableObjectListVO;
    jsondata.subdomainName = Url[0];
    jsondata.workflowVO.workflowId = '';
    const Jsondata = JSON.parse(JSON.stringify(jsondata));
    this.marketPlaceVO.jsonData = Jsondata;
    this.marketPlaceVO.uploadWorkflows = workflowVO.name;
    this.marketPlaceVO.updatedDate = workflowVO.publishedOn;
    this.marketPlaceVO.description = this.description;
    this.marketPlaceVO.developerName = this.developerName;
    this.marketPlaceVO.startKey = this.startKey;
    this.marketPlaceService.saveMarketPlaceManagement(workflowVO.name, this.version).subscribe(data => {
    });
    this.marketPlaceService.saveMarketPlace(this.marketPlaceVO).subscribe(data => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Worflow Uploaded Successfully',
      });
      this.getMarketPlaceApps();
      this.getWorkflowList();
    });
  }

  checkTableExist(page) {
    page.sections.forEach(mainSection => {
      mainSection.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'select' || column.controlType === 'multipleselect' ||
            column.controlType === 'radiobutton') {
            if (column.field.control.optionType === 'd' && column.field.control.filter.tableName) {
              this.tableList.push(column.field.control.filter.tableName);
            }
          } else if (column.controlType === 'autocomplete') {
            if (column.field.control.tableName) {
              this.tableList.push(column.field.control.tableName);
            }
          } else if (column.controlType === 'input') {
            if (column.field.enableHyperlink === true && column.field.control.targetPageName) {
              this.tableList.push(column.field.control.targetPageId);
            }
          } else if (column.controlType === 'grid') {
            if (page.pageIdWithPrefix) {
              this.tableList.push(page.pageIdWithPrefix);
            }
          } else if (column.controlType === 'table') {
            if (column.field.control.tableId) {
              this.tableList.push(column.field.control.tableId);
            }
          } else if (column.controlType === 'button' && column.field.control.buttonType &&
            column.field.control.buttonType === 'action') {
            if (column.field.control.screenType && column.field.control.screenType !== 'webServiceCall'
              && column.field.control.screenType !== 'callWorkflow') {
              this.tableList.push(column.field.control.targetPageId);
            }
          }
        });
      });
      if (mainSection.sections && mainSection.sections.length > 0) {
        this.checkTableExist(mainSection);
      }
    });
  }

  workflowImport(jsonData: JsonData, randomNumber: string) {
    if (randomNumber === null) {
      jsonData.workflowVO.key = this.setUniqueTaskKeys(jsonData.workflowVO.key);
    } else {
      jsonData.workflowVO.key = jsonData.workflowVO.key + randomNumber;
    }
    if (jsonData.page.length > 0) {
      for (let i = 0; i < jsonData.page.length; i++) {
        if (jsonData.page[i].layoutType === 'publicForm') {
          jsonData.page[i].sections.forEach(mainSection => {
            mainSection.rows.forEach(row => {
              row.columns.forEach(column => {
                if (column.controlType === 'button') {
                  column.field.control.buttonType = 'action';
                  column.field.control.screenType = 'callWorkflow';
                  column.field.control.saveAndCallWorkflow = true;
                  column.field.control.workflowKey = jsonData.workflowVO.key;
                  column.field.control.workflowVersion = 'latest';
                }
              });
            });
          });
        }
        jsonData.page[i].version = 1;
      }
      this.marketPlaceService.savePages(jsonData.page).subscribe(pageResponse => {
        if (pageResponse.response.includes('Saved')) {
          if (jsonData.permission && jsonData.permission.length > 0) {
            this.marketPlaceService.savePagePaermissions(jsonData.permission).subscribe(data => {
              if (data.response.includes('Created')) {
              }
            });
          }
        }
      });
    }
    if (jsonData.tableObjectListVO.length > 0) {
      this.marketPlaceService.saveTableListVO(jsonData.tableObjectListVO).subscribe(table => {
        if (table.response.includes('Table Objects Created Successfully')) {
        }
      });
    }
    jsonData.workflowVO.uploadWorkflow = null;
    jsonData.workflowVO.taskNodeList.forEach(task => {
      if (task.taskProperty.propertyValue && task.taskProperty.propertyValue.formIdentifier) {
        task.taskProperty.propertyValue.formVersion = 1;
      }
    });
    this.marketPlaceService.createWorkFlow(jsonData.workflowVO).subscribe(workflow => {
      this.getInstalledApps();
    });
  }

}
