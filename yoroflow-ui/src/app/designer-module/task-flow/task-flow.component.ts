import { OnInit, Component, ViewChild, HostListener } from '@angular/core';
import * as shape from 'd3-shape';
import { Node, Layout, NodePosition } from '@swimlane/ngx-graph';
import { TaskNode } from './model/task-node';
import { LinkNode } from './model/link-node';
import { Subject, Observable, Subscription } from 'rxjs';
import { DagreNodesOnlyLayout } from './customDagreNodesOnly';
import * as d3 from 'd3';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TaskService } from './services/task.service';
import { MatRightSheet } from 'mat-right-sheet';
// tslint:disable-next-line: max-line-length
import { YoroFlowConfirmationDialogComponent } from '../../designer-module/yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { TaskPropertyComponent } from '../task-property/task-property.component';
import { Workflow } from './model/workflow.model';
import { TaskProperty } from '../task-property/task-property-vo';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Edge } from './model/edge';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { YoroSecurityComponent } from '../../designer-module/yoro-security/yoro-security.component';
import { WorkFlowList } from '../../designer-module/shared/vo/workflow-list-vo';
import { EnvironmentVariableDialogComponent } from '../environment-variable-dialog/environment-variable-dialog.component';
import { EnvironmentVariableService } from '../environment-variable-dialog/environment-variable.service';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import decode from 'jwt-decode';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ExportPages, Page, PageIdListVO, Permission, TableListVO } from './model/page-vo';
import { JsonData } from './model/json';
import { ImportDialogComponent } from '../import-dialog/import-dialog.component';
import { TableObjectsVO } from '../../creation-module/table-objects/table-object-vo';
import { TaskPropertyService } from '../task-property/task-property.service';
import { SMSKeyWorkflowVO } from '../task-property/page-field-vo';
import { SmsKeyGenerationComponent } from '../../creation-module/sms-key-generation/sms-key-generation.component';

import { CreateWorkflowComponent } from '../../engine-module/create-workflow/create-workflow.component'
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { TemplateCenterService } from 'src/app/engine-module/template-center/template-center.service';
@Component({
  selector: 'app-task-flow',
  templateUrl: './task-flow.component.html',
  styleUrls: ['./task-flow.component.scss']
})
export class TaskFlowComponent implements OnInit {
  constructor(private taskService: TaskService, private workspaceService: WorkspaceService,
    private taskPropertyService: TaskPropertyService, private dialog: MatDialog, private rightSheet: MatRightSheet,
    // tslint:disable-next-line:max-line-length
    private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router,
    private snackBar: MatSnackBar,
    private environmentVariableService: EnvironmentVariableService,
    private jwtHelper: JwtHelperService,
    private templateCenterService: TemplateCenterService) {
    taskService.getToolKit().subscribe(a => (this.toolKitList = a));
    this.taskNodeList = [

    ];
    this.linkList = [

    ];
  }
  moved = false;
  nodeMouseDown = false;
  contextMenuNodeEnable = false;
  contextMenuLinkEnable = false;
  page: Page[] = [];
  tableList: any[] = [];
  tableListVO = new TableListVO();
  pagePermissionsVOList: Permission[] = [];
  json = new JsonData();
  taskNodeList: TaskNode[] = [];
  linkList: LinkNode[] = [];
  update$: Subject<boolean> = new Subject();
  dragEnabled = true;
  nodes: Node[] = [];
  links: Edge[] = [];
  svg: any;
  layoutSettings = {
    orientation: 'LR'
  };
  dragLine: any;
  mousedownNode: any;
  mouseSelectedNode: any;
  workFlowList: WorkFlowList[];
  exportPages: ExportPages[] = [];
  curve: any = shape.curveLinear;
  layout: Layout = new DagreNodesOnlyLayout();
  toolKitList: TaskNode[];
  taskName: string;
  workFlowVO = new Workflow();
  workFlowForm: FormGroup;
  isEditWorkFlow = false;
  enableNodeConnection = true;
  oldWorkflowName: string;
  oldWorkflowKey: string;
  workFlowVersion: any;
  workFlowKey: any;
  workFlowStatus: any;
  isChange = false;
  enableEndWorkflowWhenCancel = true;
  showSecurity = false;
  screenWidth: any;

  @ViewChild(MatMenuTrigger, { static: false })
  linkContextMenu: MatMenuTrigger;

  @ViewChild(MatMenuTrigger, { static: false })
  nodeContextMenu: MatMenuTrigger;

  contextMenuPosition = { x: '0px', y: '0px' };
  importFileToken: any;
  tokenArray: any[] = [];
  SMSProviderNameList: SMSKeyWorkflowVO[];
  permissionVO: Permission[] = [];
  subsVar: Subscription;
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.screenWidth = (window.innerWidth - 264) + "px";
  }

  public ngOnInit(): void {
    this.screenWidth = (window.innerWidth - 264) + "px";
    this.initializeForm();
    if (window.location.href.includes('template-workflow')) {
      this.json = this.templateCenterService.json;
      this.loadTemplateData();
    } else {
      this.getProcessIdFromRouter();
    }
    this.enableAddSecurity();
  }

  createNewWorkflow() {
    const configDialog = this.dialog.open(
      CreateWorkflowComponent,
      {
        disableClose: true,
        width: '95%',
        maxWidth: '95%',
        height: '95%',
        panelClass: 'config-dialog',
        data: {
          pageName: "Workflow Dashboard",
          fromScratch: true
        },
      });
    configDialog.afterClosed().subscribe(data => {
      if (data !== undefined) {
        this.json = data;
        this.loadTemplateData();
      }
    })

  }




  enableAddSecurity() {
    const token = localStorage.getItem('token');
    // decode the token to get its payload
    const tokenPayload = decode(token);
    if (tokenPayload.user_role.some(userRole => userRole === 'workflow')) {
      this.showSecurity = true;
    } else {
      this.showSecurity = false;
    }
  }

  publishWorkFlow(workflowKey, workflowVersion) {
    this.taskService.publishWorkFlow(workflowKey, workflowVersion).subscribe(data => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: data.response
      });
      this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/dashboard']);
    });
  }

  onContextMenu(event: MouseEvent, node) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.nodeContextMenu.menuData = { item: node };
    this.nodeContextMenu.menu.focusFirstItem('mouse');
    this.nodeContextMenu.openMenu();
  }

  onClickLinkContextMenu(event: MouseEvent, link) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.linkContextMenu.menuData = { item: link };
    this.linkContextMenu.menu.focusFirstItem('mouse');
    this.linkContextMenu.openMenu();
  }

  mouseInLink() {
    this.contextMenuNodeEnable = false;
    this.contextMenuLinkEnable = true;
  }

  getProcessIdFromRouter() {
    this.activatedRoute.paramMap.subscribe(params => {
      if (params.get('id') !== null) {
        this.isEditWorkFlow = true;
        this.getWorkFlow(+params.get('version'), params.get('id'));
      } else {
        this.createNewWorkflow();
      }
    });
  }

  initializeForm() {
    this.workFlowForm = this.fb.group({
      name: ['', [Validators.required]],
      key: [''],
      workflowId: [null],
      startKey: [],
      startType: []
    });
  }

  copyJsonData() {
    this.exportPages = [];
    this.workFlowVO.taskNodeList.forEach(task => {
      if (task.taskType === 'START_TASK' || task.taskType === 'APPROVAL_TASK' || task.taskType === 'USER_TASK') {
        const pageId = task.taskProperty.propertyValue.formIdentifier;
        const version = task.taskProperty.propertyValue.formVersion;
        const taskId = task.key;
        const taskName = task.taskType;
        this.exportPages.push({ pageId: pageId, version: version, taskId: taskId, taskName: taskName });
      }
    });
    this.taskService.getPageList(this.exportPages).subscribe(list => {
      this.page = list;
      let pageIdList = new PageIdListVO;
      for (let i = 0; i < this.page.length; i++) {
        pageIdList.uuidList.push(this.page[i].yorosisPageId);
      }
      this.taskService.getPagePermissions(pageIdList).subscribe(data => {
        this.pagePermissionsVOList = data;
        this.json.workflowVO = this.workFlowVO;
        this.json.page = this.page;
        let tableObjectListVO: TableObjectsVO[] = []
        this.tableList = [];
        for (let i = 0; i < this.page.length; i++) {
          this.checkTableExist(this.page[i]);
        }
        if (this.tableList.length > 0) {
          this.tableListVO.tableList = this.tableList;
          this.taskService.getTableListVO(this.tableListVO).subscribe(data => {
            tableObjectListVO = data;
          });
        }
        this.removeDuplicateTable();
        this.copyWorkflow('copy');
      });
    });
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

  copyWorkflow(importType: String) {
    const dialog = this.dialog.open(ImportDialogComponent, {
      disableClose: true,
      width: '1000px',
      panelClass: 'scroll',
      maxHeight: '650px',
      data: {
        type: importType,
        workflowJson: this.json.workflowVO, pageJson: this.json.page, exportPage: this.exportPages,
        permission: this.json.permission, subdoainName: this.json.subdomainName, tableVO: this.json.tableObjectListVO
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data !== false) {
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
        if (importType === 'copy') {
          this.taskService.createWorkFlow(data.workflowData).subscribe(workflow => {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Workflow Created Successfully',
            });
            this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/workflow-application']);
          });
        }
        if (importType === 'import') {
          this.workFlowForm.reset();
          this.workFlowVO.workflowId = null;
          this.isChange = false;
          this.nodes = [];
          this.links = [];
          this.updateGraph();
          this.workFlowVO = data.workflowData;
          this.workFlowForm.markAsDirty();
          this.isEditWorkFlow = false;
          this.loadWorkFlow(this.workFlowVO);
        }
      }
    });
  }

  loadTemplateData() {
    this.exportPages = [];
    this.json.workflowVO.taskNodeList.forEach(task => {
      if (task.taskType === 'START_TASK' || task.taskType === 'APPROVAL_TASK' || task.taskType === 'USER_TASK') {
        const pageId = task.taskProperty.propertyValue.formIdentifier;
        const version = task.taskProperty.propertyValue.formVersion;
        const taskId = task.key;
        const taskName = task.taskType;
        this.exportPages.push({ pageId: pageId, version: version, taskId: taskId, taskName: taskName });
      }
    });

    this.removeDuplicateTable(this.json.tableObjectListVO);
    if (this.json.page.length > 0) {
      this.copyWorkflow('import');
    } else {
      this.workFlowForm.reset();
      this.workFlowVO.workflowId = null;
      this.isChange = false;
      this.nodes = [];
      this.links = [];
      this.updateGraph();
      this.workFlowVO = this.json.workflowVO;
      this.workFlowForm.markAsDirty();
      this.isEditWorkFlow = false;
      this.loadWorkFlow(this.workFlowVO);
    }
    // };
  }

  fileImport(event: any) {
    if (event.target.files[0].type.includes('/json')) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (_event) => {
        this.importFileToken = reader.result;
        this.tokenArray = this.importFileToken.split(',');
        const decodedJwtJsonData = window.atob(this.tokenArray[1]);
        const decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.json = decodedJwtData;
        this.exportPages = [];
        this.json.workflowVO.taskNodeList.forEach(task => {
          if (task.taskType === 'START_TASK' || task.taskType === 'APPROVAL_TASK' || task.taskType === 'USER_TASK') {
            const pageId = task.taskProperty.propertyValue.formIdentifier;
            const version = task.taskProperty.propertyValue.formVersion;
            const taskId = task.key;
            const taskName = task.taskType;
            this.exportPages.push({ pageId: pageId, version: version, taskId: taskId, taskName: taskName });
          }
        });
        this.removeDuplicateTable(this.json.tableObjectListVO);
        if (this.json.page.length > 0) {
          this.copyWorkflow('import');
        } else {
          this.workFlowForm.reset();
          this.workFlowVO.workflowId = null;
          this.isChange = false;
          this.nodes = [];
          this.links = [];
          this.updateGraph();
          this.workFlowVO = this.json.workflowVO;
          this.workFlowForm.markAsDirty();
          this.isEditWorkFlow = false;
          this.loadWorkFlow(this.workFlowVO);
        }
      };
    } else {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Invalid file',
      });
    }
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

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterContentInit() {
    this.svg = d3.select('.ngx-charts');
    this.dragLine = this.svg.append('svg:path').attr('class', 'link dragline');

    this.svg
      .on('mousemove', dataItem => this.mousemove(dataItem))
      .on('mouseup', dataItem => this.mouseup(dataItem));
  }

  mouseup(dataItem: any) {
    if (!this.dragEnabled) {
      // this.dragLine.length = 0;
      this.dragLine.attr('class', 'hidden');
      this.svg.classed('active', false);
      this.mousedownNode = null;
      this.dragEnabled = true;
    }

  }

  mousedown(event: any, node: Node) {
    this.svg.classed('active', true);
    this.dragLine.attr('class', 'link dragline');
    // insert new node at point

    this.mouseSelectedNode = node;
    this.mousedownNode = { x: node.position.x - 9, y: node.position.y + 70 };
  }

  mousemove(source: any) {
    if (!this.mousedownNode) { return; }
    this.dragEnabled = false;
    // update drag line
    this.dragLine.attr(
      'd',
      `M${this.mousedownNode.x},${this.mousedownNode.y}L${d3.mouse(d3.event.currentTarget)[0]
      },${d3.mouse(d3.event.currentTarget)[1]}`
    );
    // this.restart();
  }

  nodemouseup(event: any, node: Node) {
    let nodeConnection = true;
    // if (this.mousedownNode) {
    this.dragLine.length = 0;
    this.dragEnabled = true;
    // hide drag line
    this.dragLine.attr('class', 'hidden');
    // }
    // because :active only works in WebKit?
    this.svg.classed('active', false);
    // clear mouse event vars
    this.mousedownNode = null;
    const edge: Edge = {
      source: this.mouseSelectedNode.id,
      target: node.id,
      model: { label: '' }
    };


    const source: Node = this.mouseSelectedNode;
    const target: Node = node;
    const propertyValue = source.data.property.propertyValue;
    if (propertyValue === undefined && (source.data.taskType === 'DECISION_TASK' || source.data.taskType === 'APPROVAL_TASK')) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: this.getTaskNames(source.data.taskType) + ' ' + 'properties does not created yet'
      });
    }
    if (source.data.taskType === 'USER_TASK') {
      if (propertyValue && propertyValue.endWorkflowWhenCancelled === false) {
        const dialog = this.dialog.open(YoroFlowConfirmationDialogComponent, {
          disableClose: true,
          data: 'cancelWorkflow'
        });
        dialog.afterClosed().subscribe(data => {
          if (data) {
            if (data === 'Connection When Cancel') {
              edge.model.label = data;
              propertyValue.connectionForCancel = target.id;
            } else {
              propertyValue.connectionNotForCancel = target.id;
            }
            this.links.push(edge);
            this.workFlowForm.markAsDirty();
            this.updateGraph();
            this.dragEnabled = true;
          }

        });
      } else {
        this.links.push(edge);
        this.workFlowForm.markAsDirty();
      }
    } else if (source.data.taskType === 'DECISION_TASK') {
      if (propertyValue && target.data.taskType !== 'START_TASK') {
        const dialog = this.dialog.open(YoroFlowConfirmationDialogComponent, {
          disableClose: true,
          data: 'linkProperty'
        });
        dialog.afterClosed().subscribe(data => {
          // && (!this.links.some(link => link.model.label === data && link.source === source.id))
          if (data &&
            (!this.links.some(link => link.model.label === data && link.source === source.id))) {
            edge.model.label = data;
            if (data === 'Matches') {
              propertyValue.ifTargetTask = target.id;
            } else {
              propertyValue.elseTargetTask = target.id;
            }
            this.links.push(edge);
            this.workFlowForm.markAsDirty();
            this.updateGraph();
            this.dragEnabled = true;
          } else {
            if (data !== false && data !== undefined) {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: data + ' Link Already Exists'
              });
              nodeConnection = false;
            }
          }
        });
      } else {
        if (target.data.taskType === 'START_TASK') {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Start Task should not have Source'
          });
        }
      }
    } else if (source.data.taskType === 'APPROVAL_TASK') {
      if (propertyValue) {
        const dialog = this.dialog.open(YoroFlowConfirmationDialogComponent, {
          disableClose: true,
          data: 'approveTaskProperty'
        });
        dialog.afterClosed().subscribe(data => {
          if (data &&
            (!this.links.some(link => link.model.label === data && link.source === source.id))) {
            edge.model.label = data;
            if (data === 'Approve Task') {
              propertyValue.approvalTask = target.id;
            } else if (data === 'Reject Task') {
              propertyValue.rejectedTask = target.id;
            } else {
              propertyValue.sendBackTask = target.id;
              propertyValue.isSendBack = true;
            }
            this.links.push(edge);
            this.workFlowForm.markAsDirty();
            this.updateGraph();
            this.dragEnabled = true;
          } else {
            if ((data !== false && data !== undefined)) {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: data + ' Link Already Exists'
              });
              nodeConnection = false;
            }
          }
        });
      }
    } else if ((propertyValue === undefined || propertyValue === null) && source.data.taskType === 'END_TASK') {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'End Task should not have Target'
      });
    } else if (target.data.taskType === 'START_TASK') {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Start Task should not have Source'
      });
    } else {
      if (nodeConnection === true) {
        this.links.push(edge);
        this.workFlowForm.markAsDirty();
      }
    }
    this.updateGraph();
    this.dragEnabled = true;
  }

  resetDesign() {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '400px',
      data: 'undoChanges'
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        this.workFlowForm.reset();
        this.workFlowVO.workflowId = null;
        this.isChange = false;
        this.nodes = [];
        this.links = [];
        this.updateGraph();
        if (this.isEditWorkFlow) {
          this.ngOnInit();
        }
      }
    });
  }

  public getStyles(taskType: any): any {
    switch (taskType) {
      case 'START_TASK':
        return 'assets/iconfinder_start_60207.png';
      case 'USER_TASK':
        return 'assets/iconfinder_person (1).png';
      case 'EMAIL_TASK':
        return 'assets/iconfinder_mail.png';
      case 'DECISION_TASK':
        return 'assets/decision-making-color.png';
      case 'DB_TASK':
        return 'assets/iconfinder_database.png';
      case 'DELAY_TIMER':
        return 'assets/iconfinder_timer.png';
      case 'APPROVAL_TASK':
        return 'assets/iconfinder_approval.png';
      case 'COMPUTE_TASK':
        return 'assets/iconfinder_compute.png';
      case 'WEB_SERVICE_TASK':
        return 'assets/iconfinder_webservice.png';
      case 'CALL_ANOTHER_WORKFLOW':
        return 'assets/iconfinder_workflow.png';
      case 'END_TASK':
        return 'assets/iconfinder_player_stop.png';
      case 'DECISION_TABLE':
        return 'assets/decision table-png-3.png';
      case 'SMS_TASK':
        return 'assets/iconfinder_mail.png';
      case 'COUNTER_TASK':
        return 'assets/iconfinder_compute.png';
      case 'EXCEL_REPORT':
        return 'assets/iconfinder_webservice.png';
      default:
    }
  }

  drop(event: CdkDragDrop<TaskNode[]>) {
    const taskType1 = event.item.element.nativeElement.id;
    const nodePosition: NodePosition = { x: event.distance.x - 100, y: event.distance.y + (event.currentIndex * 30) };
    this.openDialog(taskType1, nodePosition);
  }

  updateGraph() {
    this.update$.next(true);
  }

  openDialog(taskType1: string, nodePosition: NodePosition): void {
    if (taskType1) {
      const node = {
        id: this.generateIdForNode(taskType1),
        label: '',
        data: {
          taskType: taskType1,
          property: new TaskProperty(),
          position: nodePosition
        }
      };
      if (taskType1 === 'START_TASK') {
        this.workFlowForm.get('startKey').setValue(node.id);
      }
      this.nodes.push(node);
      this.updateGraph();
    }
  }

  generateIdForNode(type: string) {
    return type + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  clickEvent(node) {

    if (!this.moved && node.data.taskType !== 'END_TASK') {
      this.openTaskProperty(node);
    }
    this.moved = false;
  }

  nodeClicked(node: Node) {
    if (node.position.x !== 0) {
      node.data.position.x = node.position.x;
      node.data.position.y = node.position.y;
    }
    this.nodeMouseDown = false;
  }

  mouseUp() {
    this.nodeMouseDown = false;
  }

  mouseDown() {
    this.nodeMouseDown = true;
    this.contextMenuNodeEnable = true;
    this.contextMenuLinkEnable = false;
  }

  nodeDrag() {
  }

  nodeMoved(event, node) {
    if (!this.nodeMouseDown) {
      return;
    }

  }

  loadProviderNames(node: Node) {
    this.taskPropertyService.getProviderNames().subscribe(data => {
      if (data && data.length > 0) {
        this.SMSProviderNameList = data;
        this.openTaskPropertyAfterCheck(node);
      } else if (data && data.length === 0) {
        const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
          data: { data: 'no-providers' },
        });
        dialogRef.afterClosed().subscribe(response => {
          if (response === true) {
            const SMSKeydialogRef = this.dialog.open(SmsKeyGenerationComponent, {
              disableClose: true,
              height: '65%',
              width: '100vw',
              maxWidth: '95vw',
              maxHeight: '100vh',
              panelClass: 'full-screen-modal',
            });
            SMSKeydialogRef.afterClosed().subscribe(saved => {
              if (saved === true) {
                this.loadProviderNames(node);
              } else {
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: 'Add Provider to create SMS task',
                });
              }
            });
          }
        });
      }
    });
  }

  openTaskPropertyAfterCheck(node: Node) {
    let taskPropertyDialogBox;
    if (node.data.taskType === 'EXCEL_REPORT') {
      taskPropertyDialogBox = this.dialog.open(TaskPropertyComponent, {
        disableClose: true,
        width: '1000px',
        maxHeight: '530px',
        data: {
          nodeData: node.data, propertyName: node.label, SMSProviderNameList: this.SMSProviderNameList,
          workflowStructure: this.getWorkflowStructure(), key: node.id, workflowName: this.workFlowForm.get('name').value, workflowKey: this.workFlowForm.get('key').value
        },
        panelClass: 'task-property-dialog',
        autoFocus: false
      });
    } else {
      taskPropertyDialogBox = this.dialog.open(TaskPropertyComponent, {
        disableClose: true,
        width: '800px',
        maxHeight: '630px',
        data: {
          nodeData: node.data, propertyName: node.label, SMSProviderNameList: this.SMSProviderNameList,
          workflowStructure: this.getWorkflowStructure(), key: node.id, workflowName: this.workFlowForm.get('name').value, workflowKey: this.workFlowForm.get('key').value
        },
        panelClass: 'task-property-dialog',
        autoFocus: false
      });
    }
    taskPropertyDialogBox.afterClosed().subscribe(taskProperty => {
      if (taskProperty) {
        node.data.property = taskProperty;
        this.isChange = true;
        if (node.data.taskType !== null && taskProperty.propertyValue.name) {
          node.label = taskProperty.propertyValue.name;
          node.data.property.propertyName = taskProperty.propertyValue.name;
          if (node.data.taskType === 'USER_TASK') {
            this.updateConnectionWhenCancel(taskProperty);
          }
          if (node.data.taskType === 'START_TASK') {
            this.workFlowForm.get('startType').setValue(taskProperty.propertyValue.propertyType);
          }
        }
        this.updateGraph();
      }
    });
  }

  openTaskProperty(node: Node) {
    if (node.data.taskType === 'SMS_TASK') {
      this.loadProviderNames(node);
    } else {
      this.openTaskPropertyAfterCheck(node);
    }
  }

  updateConnectionWhenCancel(taskProperty) {
    if (taskProperty.propertyValue.isCancellableWorkflow === true && taskProperty.propertyValue.endWorkflowWhenCancelled) {
      this.links.forEach(link => {
        if (link.model.label === 'Connection When Cancel') {
          this.deleteLink(link, 'cancel');
          let removeIndex = this.nodes.findIndex(x => x.id === link.target);
          if (removeIndex !== -1) {
            const dialog = this.dialog.open(YoroFlowConfirmationDialogComponent, {
              data: 'nodeCancel'
            });
            dialog.afterClosed().subscribe(data => {
              if (data === true) {
                this.deleteNodeAfterConditionCheck(this.nodes[removeIndex]);
              }
            });
          }
        }
      });
    }
  }

  convertEdgeToTaskLink() {
    this.links.forEach(edge => {
      const link: LinkNode = {
        key: edge.target + Math.random().toString(36).substring(2, 15),
        source: edge.source,
        target: edge.target,
        linkLabel: edge.model.label
      };
      this.workFlowVO.linkNodeList.push(link);
    });
  }

  convertNodeToTaskNodes() {
    this.nodes.forEach(node => {
      const taskNode: TaskNode = {
        key: node.id,
        taskType: node.data.taskType,
        label: node.label,
        taskProperty: node.data.property,
        position: node.data.position,
      };
      this.workFlowVO.taskNodeList.push(taskNode);
    });
  }

  openWorkflowPermissions() {
    const workFlowPermission = this.dialog.open(YoroSecurityComponent, {
      disableClose: true,
      data: { id: this.workFlowVO.workflowId, securityType: 'workflow' },
      panelClass: 'custom-dialog-container',
      width: '800px',
      autoFocus: false,
    });
  }

  openVariablesList() {
    const dialogRef = this.dialog.open(EnvironmentVariableDialogComponent, {
      disableClose: true,
      width: '90%',
      data: { id: this.workFlowVO.workflowId, key: this.workFlowVO.key }
    });
  }

  checkStartTaskExistOrNot(node: Node) {
    if (this.workFlowForm.get('startKey').value === node.id) {
      if (!this.nodes.some(startTaskNode => startTaskNode.data.taskType === 'START_TASK')) {
        this.workFlowForm.get('startKey').setValue(null);
      } else {
        const startNode = this.nodes.find(startTaskNode => startTaskNode.data.taskType === 'START_TASK');
        this.workFlowForm.get('startKey').setValue(startNode.id);
      }
    }
  }

  deleteNodeAfterConditionCheck(node: Node) {
    // delete links
    // tslint:disable-next-line: no-shadowed-variable
    this.isChange = true;
    for (let l = this.links.length - 1; l >= 0; l--) {
      if (this.links[l].source === node.id || this.links[l].target === node.id) {
        this.links.splice(l, 1);
      }
    }
    // delete node
    for (let n = 0; n < this.nodes.length; n++) {
      if (this.nodes[n].id === node.id) {
        this.nodes.splice(n, 1);
        this.checkStartTaskExistOrNot(node);
      }
    }
    this.updateGraph();
  }

  deleteNode(node: Node) {
    const indexOfNode = this.nodes.indexOf(node);
    const maxLinkLength = this.links.length;
    if (indexOfNode > 0 && indexOfNode < maxLinkLength) {
      if (this.links[indexOfNode].source && this.links[indexOfNode - 1].target) {
        const nodeConnectionDialogBox = this.dialog.open(YoroFlowConfirmationDialogComponent, {
          width: '400px',
          height: '130px',
          data: 'bothConnections'
        });
        nodeConnectionDialogBox.afterClosed().subscribe(deleteConnections => {
          if (deleteConnections) {
            this.deleteNodeAfterConditionCheck(node);
          }
          this.updateGraph();
        });
      }
    } else {
      // tslint:disable-next-line: max-line-length
      const nodeConnectionDialogBox = this.dialog.open(YoroFlowConfirmationDialogComponent, {
        width: '400px',
        height: '120px',
        data: 'startOrEndConnections'
      });
      nodeConnectionDialogBox.afterClosed().subscribe(deleteConnections => {
        if (deleteConnections) {
          this.deleteNodeAfterConditionCheck(node);
        }
        this.enableNodeConnection = false;
        this.updateGraph();
      });
    }
  }

  deleteLinkAfterConfirmation(item) {
    this.isChange = true;
    for (let l = this.links.length - 1; l >= 0; l--) {
      if (this.links[l].source === item.source && this.links[l].target === item.target) {
        this.links.splice(l, 1);
      }
    }
  }

  duplicateNode(item: Node) {
    const nodeConnectionDialogBox = this.dialog.open(YoroFlowConfirmationDialogComponent, {
      width: '400px',
      height: '130px',
      data: 'duplicateNode'
    });
    nodeConnectionDialogBox.afterClosed().subscribe(duplicateNode => {
      if (duplicateNode === true) {
        this.addDuplicateNode(item);
        this.workFlowForm.markAsDirty();
      }
    });
  }

  addDuplicateNode(node: Node) {
    const nodePosition: NodePosition = { x: 100, y: 100 };

    const nodes = {
      id: this.generateIdForNode(node.data.taskType),
      label: node.label,
      data: {
        taskType: node.data.taskType,
        property: node.data.property,
        position: nodePosition
      }
    };
    this.nodes.push(nodes);
    this.updateGraph();
  }

  deleteLink(item: Edge, type) {
    if (type === 'link') {
      const nodeConnectionDialogBox = this.dialog.open(YoroFlowConfirmationDialogComponent, {
        width: '400px',
        height: '130px',
        data: 'deleteLink'
      });
      nodeConnectionDialogBox.afterClosed().subscribe(deleteLink => {
        if (deleteLink) {
          this.deleteLinkAfterConfirmation(item);
          this.workFlowForm.markAsDirty();
        }
      });
    } else {
      this.deleteLinkAfterConfirmation(item);
    }
    this.updateGraph();
  }

  linkProperty(item: Edge) {
    const dialog = this.dialog.open(YoroFlowConfirmationDialogComponent, {
      data: 'linkProperty'
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        item.model.label = data;
        this.updateGraph();
      }
    });

  }

  setWorkFlowKeyByName(event) {
    ;
    const name = this.workFlowForm.get('name');
    const key = this.generateWorkFlowKey(name.value);
    if (name.value) {
      if (!this.workFlowForm.get('workflowId').value) {
        this.workFlowForm.get('key').setValue(key);
      }
      if (name.value !== this.oldWorkflowName) {
        this.taskService.checkWorkflowByName(name.value).subscribe(data => {
          if (data.response.includes('already exist')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            name.setErrors({ alreadyExist: true });
          } else {
            if (!this.workFlowForm.get('workflowId').value) {
              const workflowKey = this.workFlowForm.get('key');
              this.taskService.checkWorkflowByKey(key).subscribe(data => {
                if (data.response.includes('already exist')) {
                  this.snackBar.openFromComponent(SnackbarComponent, {
                    data: data.response,
                  });
                  workflowKey.setErrors({ alreadyExist: true });
                }
              });
            }
          }
        });
      }
    }
  }

  setWorkFlowKey() {
    const workflowKey = this.workFlowForm.get('key');
    const key = this.generateWorkFlowKey(workflowKey.value);
    if (workflowKey.value && !this.workFlowForm.get('workflowId').value) {
      workflowKey.setValue(key);
      if (workflowKey.value !== this.oldWorkflowKey) {
        this.taskService.checkWorkflowByKey(workflowKey.value).subscribe(data => {
          if (data.response.includes('already exist')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            workflowKey.setErrors({ alreadyExist: true });
          }
        });
      }
      this.oldWorkflowKey = key;
    }
  }

  generateWorkFlowKey(name: string) {
    name = (name).replace(/[^\w\s]/gi, '');
    name = (name).trim().toLowerCase().replace(/ +/g, '-');
    return name;
  }

  getWorkflowStructure() {
    this.workFlowVO = new Workflow();
    this.workFlowVO.name = this.workFlowForm.get('name').value;
    this.workFlowVO.key = this.workFlowForm.get('key').value;
    this.workFlowVO.workflowId = this.workFlowForm.get('workflowId').value;
    this.workFlowVO.startKey = this.workFlowForm.get('startKey').value;
    this.workFlowVO.startType = this.workFlowForm.get('startType').value;
    this.convertNodeToTaskNodes();
    this.convertEdgeToTaskLink();
    return this.workFlowVO;
  }

  allowWorkflowToCreate() {
    let isAllow = true;
    const tasks = this.workFlowVO.taskNodeList;
    const links = this.workFlowVO.linkNodeList;
    if (links.some(workflowLinks => workflowLinks.source === workflowLinks.target)) {
      links.forEach(link => {
        const index = links.findIndex(workflowLinks => workflowLinks.source === workflowLinks.target);
        if (index !== -1) {
          links.splice(index, 1);
        }
      });
      this.workFlowVO.linkNodeList = links;
    }
    if (!tasks.some(task => task.taskType === 'START_TASK')) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Start Task is required'
      });
      isAllow = false;
      return isAllow;
    }

    if (!tasks.some(task => task.taskType === 'END_TASK')) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'End Task is required'
      });
      isAllow = false;
      return isAllow;
    }

    if (tasks.length === 2) {
      if (tasks.some(task => task.taskType === 'END_TASK') && tasks.some(task => task.taskType === 'START_TASK')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Business Validation failed. ' + ' Workflow should not contain start and end tasks alone.'
        });
      }
      isAllow = false;
      return isAllow;
    }

    if (tasks.length === 0 || tasks.length === 1 || tasks.length === 2) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Business Validation failed. ' + ' Workflow should contain some tasks.'
      });
      isAllow = false;
      return isAllow;
    }

    if (!isAllow) {
      return isAllow;
    }

    tasks.filter(task => task.taskType === 'END_TASK').forEach(endTask => {
      if (links.some(link => link.source === endTask.key)) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'End Tasks must contain target connections only'
        });
        isAllow = false;
      }
    });



    if (!isAllow) {
      return isAllow;
    }

    let noOfStartTasks = 0;
    tasks.filter(task => task.taskType === 'START_TASK').forEach(startTasks => {
      noOfStartTasks++;
    });
    if (noOfStartTasks > 1) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: noOfStartTasks + ' Start Task Not allowed.' + ' It must be one for workflow'
      });
      isAllow = false;
      return isAllow;
    }

    tasks.filter(task => task.taskType === 'START_TASK').forEach(startTask => {
      if (!links.some(workflowLinks => workflowLinks.source === startTask.key)) {
        isAllow = false;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: noOfStartTasks + ' Start Task contains target connections'
        });
        isAllow = false;
        return isAllow;
      }
    });

    tasks.filter(task => task.taskType === 'END_TASK').forEach(endTask => {
      if (!links.some(workflowLinks => workflowLinks.target === endTask.key)) {
        isAllow = false;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: ' End Task contains source connections'
        });
        isAllow = false;
        return isAllow;
      }
    });

    const unSavedTaskNames: string[] = [];
    tasks.filter(task => task.taskType !== 'END_TASK').forEach(workflowTasks => {
      if (!workflowTasks.taskProperty.propertyValue) {
        if (!unSavedTaskNames.some(name => name === this.getTaskNames(workflowTasks.taskType))) {
          unSavedTaskNames.push(this.getTaskNames(workflowTasks.taskType));
        }
      }
    });
    if (unSavedTaskNames.length > 0) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: unSavedTaskNames.join('  ,  ') + '  properties does not saved yet. Please save this to create a workflow'
      });
      isAllow = false;
      return isAllow;
    }

    const taskNamesWithoutLinks: string[] = [];
    const taskNamesWithoutSourceLinks: string[] = [];
    const taskNamesWithoutTargetLinks: string[] = [];

    tasks.filter(task => task.taskType !== 'END_TASK').filter(task => task.taskType !== 'START_TASK')
      .forEach(workflowTasksWithouLinks => {
        if (!links.some(rightLink => rightLink.source === workflowTasksWithouLinks.key)
          && !links.some(leftLink => leftLink.target === workflowTasksWithouLinks.key)) {
          if (!taskNamesWithoutLinks.some(name => name === this.getTaskNames(workflowTasksWithouLinks.taskType))) {
            taskNamesWithoutLinks.push(this.getTaskNames(workflowTasksWithouLinks.taskType));
          }
        } else if (!links.some(rightLink => rightLink.target === workflowTasksWithouLinks.key)) {
          if (!taskNamesWithoutSourceLinks.some(name => name === this.getTaskNames(workflowTasksWithouLinks.taskType))) {
            taskNamesWithoutSourceLinks.push(this.getTaskNames(workflowTasksWithouLinks.taskType));
          }
        } else if (!links.some(leftLink => leftLink.source === workflowTasksWithouLinks.key)) {
          if (!taskNamesWithoutTargetLinks.some(name => name === this.getTaskNames(workflowTasksWithouLinks.taskType))) {
            taskNamesWithoutTargetLinks.push(this.getTaskNames(workflowTasksWithouLinks.taskType));
          }
        }
      });

    if (taskNamesWithoutLinks.length > 0) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: taskNamesWithoutLinks.join('  ,  ') + '  does not have source and end connections.' +
          'Please add  source and end connections to create a workflow'
      });
      isAllow = false;
      return isAllow;
    }

    if (taskNamesWithoutSourceLinks.length > 0) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: taskNamesWithoutSourceLinks.join('  ,  ') + '  does not have source connections.' +
          'Please add  source connection to create a workflow'
      });
      isAllow = false;
      return isAllow;
    }

    if (taskNamesWithoutTargetLinks.length > 0) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: taskNamesWithoutTargetLinks.join('  ,  ') + '  does not have end connection.' +
          'Please add end connections to create a workflow'
      });
      isAllow = false;
      return isAllow;
    }

    if (!tasks.some(task => task.taskType === 'END_TASK')) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'End Task is required'
      });
      isAllow = false;
      return isAllow;
    }
    return isAllow;
  }

  public getTaskNames(taskType: any): any {
    switch (taskType) {
      case 'START_TASK':
        return 'Start Task';
      case 'END_TASK':
        return 'End Task';
      case 'USER_TASK':
        return 'User Task';
      case 'APPROVAL_TASK':
        return 'Approval Task';
      case 'DECISION_TASK':
        return 'Decision Task';
      case 'DELAY_TIMER':
        return 'Delay Timer';
      case 'EMAIL_TASK':
        return 'Email Task';
      case 'WEB_SERVICE_TASK':
        return 'Web Service Task';
      case 'COMPUTE_TASK':
        return 'Compute Task';
      case 'DB_TASK':
        return 'DB Task';
      case 'CALL_ANOTHER_WORKFLOW':
        return 'Call Another Workflow';
      case 'DECISION_TABLE':
        return 'Decision Table';
      case 'SMS_TASK':
        return 'SMS Task';
      case 'COUNTER_TASK':
        return 'Counter Task';
      case 'EXCEL_REPORT':
        return 'excel report';
      default:
    }
  }

  tokenExpires(type: string) {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '450px',
      data: { type: type, data: this.workFlowVO }
    });
    dialog.afterClosed().subscribe(data => {
      let tableObjectListVO: TableObjectsVO[] = [];
      if (data === true || data === 'exportWithForms') {
        if (data === 'exportWithForms') {
          this.exportPages = [];
          this.workFlowVO.taskNodeList.forEach(task => {
            if (task.taskType === 'START_TASK' || task.taskType === 'APPROVAL_TASK' || task.taskType === 'USER_TASK') {
              const pageId = task.taskProperty.propertyValue.formIdentifier;
              const version = task.taskProperty.propertyValue.formVersion;
              const taskId = task.key;
              const taskName = task.taskType;
              this.exportPages.push({ pageId: pageId, version: version, taskId: taskId, taskName: taskName });
            }
          });
          this.taskService.getPageList(this.exportPages).subscribe(list => {
            this.page = list;
            let pageIdList = new PageIdListVO;
            for (let i = 0; i < this.page.length; i++) {
              pageIdList.uuidList.push(this.page[i].yorosisPageId);
            }
            this.taskService.getPagePermissions(pageIdList).subscribe(data => {
              this.pagePermissionsVOList = data;
              this.tableList = [];
              for (let i = 0; i < this.page.length; i++) {
                this.checkTableExist(this.page[i]);
              }
              if (this.tableList.length > 0) {
                this.tableListVO.tableList = this.tableList;
                this.taskService.getTableListVO(this.tableListVO).subscribe(data => {
                  tableObjectListVO = data;
                  this.export(this.workFlowVO, this.page, this.pagePermissionsVOList, tableObjectListVO);
                });
              } else {
                const tableObjects: any[] = [];
                this.export(this.workFlowVO, this.page, this.pagePermissionsVOList, tableObjects);
              }
            });
          });
        } else {
          const page: any[] = [];
          const pagePermission: any[] = [];
          const tableObjects: any[] = [];
          this.export(this.workFlowVO, page, pagePermission, tableObjects);
        }
      }
      if (type === 'export') {
        this.router.navigate(['/login']);
      }
    });
  }

  export(workflowVO: Workflow, page, pagePermission, tableObjectListVO) {
    const jsondata = new JsonData();
    jsondata.workflowVO = workflowVO;
    for (let i = 0; i < page.length; i++) {
      jsondata.page.push(page[i]);
    }
    jsondata.permission = pagePermission;
    jsondata.tableObjectListVO = tableObjectListVO;
    const arrOfString = window.location.href.split('//', 2);
    const Url = arrOfString[1].split('.', 2);
    jsondata.subdomainName = Url[0];
    const Jsondata = JSON.stringify(jsondata);
    var a = document.createElement('a');
    var file = new Blob([Jsondata], { type: 'text/json' });
    a.href = URL.createObjectURL(file);
    a.download = this.workFlowForm.get('name').value + '.json';
    a.click();
  }

  onSubmit(form) {
    this.getWorkflowStructure();
    this.enableEndWorkflowWhenCancel = true;
    this.allowWorkflowToCreate();
    this.workFlowVO.taskNodeList.forEach(fieldValue => {
      if (fieldValue.taskType === 'USER_TASK') {
        if (fieldValue.taskProperty.propertyValue && fieldValue.taskProperty.propertyValue.isCancellableWorkflow === true) {
          if (fieldValue.taskProperty.propertyValue.endWorkflowWhenCancelled === false
            && fieldValue.taskProperty.propertyValue.connectionForCancel === '') {
            this.enableEndWorkflowWhenCancel = false;
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Please select a task when workflow is cancelled'
            });
          }
        }
      }
    });
    if (form.valid && this.enableEndWorkflowWhenCancel && this.allowWorkflowToCreate()) {
      if (this.jwtHelper.isTokenExpired(localStorage.getItem('token'))) {
        this.tokenExpires('export');
      } else {
        if (this.workFlowVO.workflowId === null) {
          this.taskService.createWorkFlow(this.workFlowVO).subscribe(data => {
            if (data.response.includes('successfully')) {
              this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/workflow-application']);
            } else if (data.response.includes('exceeded your limit')) {
              const dialog = this.dialog.open(AlertmessageComponent, {
                width: '450px',
                data: data.licenseVO
              });
            }
          });
        } else {
          if (this.isChange === true || this.workFlowForm.dirty) {
            if (this.allowWorkflowToCreate()) {
              this.taskService.updateWorkflow(this.workFlowVO).subscribe(data => {
                this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/workflow-application']);
              });
            }
          }
        }
      }
    }
  }

  getWorkFlow(version, processId) {
    this.taskService.getWorkFlowStructure(version, processId).subscribe((workFlow: Workflow) => {
      this.workFlowVO = workFlow;
      this.loadWorkFlow(workFlow);
      this.workFlowVersion = version;
      this.workFlowKey = workFlow.key;
      this.workFlowStatus = workFlow.status;
    });
  }

  loadWorkFlow(workFlow: Workflow) {
    this.workFlowForm.get('name').setValue(workFlow.name);
    this.workFlowForm.get('key').setValue(workFlow.key);
    this.workFlowForm.get('workflowId').setValue(workFlow.workflowId);
    this.workFlowForm.get('startKey').setValue(workFlow.startKey);
    this.workFlowForm.get('startType').setValue(workFlow.startType);
    this.oldWorkflowKey = workFlow.key;
    this.oldWorkflowName = workFlow.name;
    // load nodes
    workFlow.taskNodeList.forEach(task => {
      const node: Node = {
        id: task.key,
        label: task.label,
        data: {
          taskType: task.taskType,
          property: task.taskProperty,
          position: task.position
        }
      };
      this.nodes.push(node);
    });
    // load links
    workFlow.linkNodeList.forEach(link => {
      const edge: Edge = {
        source: link.source,
        target: link.target,
        model: { label: link.linkLabel }
      };
      this.links.push(edge);
    });
    this.updateGraph();
  }
}

export interface DialogData {
  taskName: string;
}
