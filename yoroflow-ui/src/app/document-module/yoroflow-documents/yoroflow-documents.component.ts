import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DocumentEditorComponent } from '../document-editor/document-editor.component';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { YoroDocumentVO } from '../documents-vo';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { DocumentsService } from '../documents.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { NotificationService } from '../../rendering-module/shared/service/notification.service.service';
import { GroupService } from '../../engine-module/group/group-service';
import { MatMenuTrigger } from '@angular/material/menu';
import { ConfirmationDialogComponent } from '../../taskboard-module/yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { I } from 'ngx-tethys/util';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { TeamListComponent } from 'src/app/workspace-module/team-list/team-list.component';
import { DocumentTeamComponent } from '../document-team/document-team.component';
import Quill from 'quill';
import * as quillToWord from 'quill-to-word';
import { saveAs } from 'file-saver';
import { pdfExporter } from 'quill-to-pdf';
import { ThemeService } from 'src/app/services/theme.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';

interface FoodNode {
  documentName: string;
  yoroDocumentsVo?: FoodNode[];
  index?: number;

}
@Component({
  selector: 'app-yoroflow-documents',
  templateUrl: './yoroflow-documents.component.html',
  styleUrls: ['./yoroflow-documents.component.scss']
})
export class YoroflowDocumentsComponent implements OnInit {
  showEditor = false;
  editorComponent: DocumentEditorComponent;
  htmlContent: any;
  name: string;
  nodeName: any;
  type: string;
  viewTree: any;
  level: number;
  show = false;
  expandable: boolean;
  new: any;
  quillData: any;
  sanitizeHtml: any;
  activeNode: any;
  id: any;
  form: FormGroup;
  selectedTree: any;
  templateData: any;
  filteredTaskboardList: any = [];
  quillDisable = false;
  url = false;
  createNew = false;
  editTitle = false;
  reset: any;
  @Output() userdata: EventEmitter<any> = new EventEmitter<any>();
  editData = false;
  showDocument = false;
  treeControl = new NestedTreeControl<FoodNode>(node => node.yoroDocumentsVo);
  dataSource = new MatTreeNestedDataSource<FoodNode>();
  newEditorView = false;
  screenHeight: any;
  docDetails: any;
  quillContent: any;
  documentOwnerList: any;
  @Output() docData: EventEmitter<any> = new EventEmitter<any>();
  public config: PerfectScrollbarConfigInterface = {};
  formContent: any;
  documentsVO = new YoroDocumentVO;
  listData: any;
  orgValue: string;
  viewRender = false;
  showError = false;
  userDetails: any;
  ownerList: any;
  usersList: any;
  taskboardOwnerList: string[] = [];
  activeIndex: any;
  screenHeight1: any;
  screenWidth: any;
  documentKey: any;
  path: any;
  documentId: string;
  editClick = false;
  quillEditor: any;
  editShow = false;
  isAllowed = false;
  licenseVO: any;
  private quillToWordConfig: quillToWord.Config = {
    exportAs: 'blob'
  };
  @ViewChild('menuTrigger') menuTree: MatMenuTrigger;
  @ViewChild('menuTrigger1') menuTreeNode: MatMenuTrigger;
  spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent, any>;

  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.yoroDocumentsVo && node.yoroDocumentsVo.length > 0,
      name: node.documentName,
      level,
      index: node.index,
    };
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.screenHeight = (window.innerHeight - 158) + "px";
    // this.screenHeight1 = (window.innerHeight - 63) + "px";
    // this.screenWidth = (window.innerWidth - 63) + "px";
    this.loadDynamicLayout();
  }
  constructor(public activateRoute: ActivatedRoute,
    private taskboardService: TaskBoardService, private groupService: GroupService,
    private notficationService: NotificationService, private dialog: MatDialog, private sanitizer: DomSanitizer,
    private documentsservice: DocumentsService, private fb: FormBuilder, private snackBar: MatSnackBar,
    public themeService: ThemeService, private workspaceService: WorkspaceService) {
  }
  ngOnInit(): void {

    this.show = false;
    this.form = this.fb.group({
      search: [],
      title: [],
    });
    this.getLoggedUserDetails();
    this.getUsers();
    this.getOwners();
    // this.screenHeight1 = (window.innerHeight - 63) + "px";
    // this.screenHeight = (window.innerHeight - 158) + "px";
    // this.screenWidth = (window.innerWidth - 63) + "px";
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    this.activateRoute.paramMap.subscribe(params => {
      this.path = params;
      if (params.get('title') !== undefined && params.get('title') !== null) {
        this.documentKey = params.get('title');
        this.documentsservice.getDocuments().subscribe(res => {
          this.listData = res;
          this.dataSource.data = this.listData;
          this.filteredTaskboardList = res;
          this.handleRefresh(this.listData);
        });
      } else {
        this.loadDocs();
      }
    });
    this.searchFormvalueChanges();
  }
  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight1 = (window.innerHeight - 1) + 'px';
      this.screenHeight = (window.innerHeight - 85) + 'px';
      this.screenWidth = (window.innerWidth - 63) + 'px';
    } else {
      this.screenHeight1 = (window.innerHeight - 63) + 'px';
      this.screenHeight = (window.innerHeight - 158) + 'px';
      this.screenWidth = (window.innerWidth - 63) + 'px';
    }
  }

  handleRefresh(comments) {
    comments.forEach(comment => {
      if (comment.documentKey === this.path.get('title')) {
        this.viewDocument(comment);
        return '';
      }
      if (comment.yoroDocumentsVo) {
        this.handleRefresh(comment.yoroDocumentsVo);
      }
      comment.isEdit = false;
      comment.isReply = false;
    });
  }
  loadDocs() {
    this.documentsservice.getDocuments().subscribe(res => {
      this.listData = res;
      this.dataSource.data = this.listData;
    });
  }
  searchFormvalueChanges(): void {
    this.form.get('search').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        const filterList: any[] = [];
        for (let i = 0; i < this.listData.length; i++) {
          const taskboardName = this.listData[i].documentName.toLowerCase();
          if (taskboardName.includes(filterData)) {
            filterList.push(this.listData[i]);
          }
          for (let k = 0; k < this.listData[i].yoroDocumentsVo.length; k++) {
            const taskboardName1 = this.listData[i].yoroDocumentsVo[k].documentName.toLowerCase();
            if (taskboardName1.includes(filterData)) {
              filterList.push(this.listData[i].yoroDocumentsVo[k]);
            }
          }
        }
        this.filteredTaskboardList = filterList;
        this.dataSource.data = this.filteredTaskboardList;
      } else {
        this.filteredTaskboardList = this.listData;
        this.dataSource.data = this.filteredTaskboardList;
      }
    });
  }

  hasChild = (_: number, node: FoodNode) => !!node.yoroDocumentsVo && node.yoroDocumentsVo.length > 0;
  getUsers() {
    this.groupService.getGroupList().subscribe(res => {
      this.usersList = res;
    });
  }
  getLoggedUserDetails() {
    this.notficationService.getLoggedInUserDetails().subscribe(data => {
      this.userDetails = data;
      const details = this.userDetails.firstName + ' ' + this.userDetails.lastName;
    });
  }
  checkLoggedInUser() {
    let isnotCreatedUser = false;
    if (this.userDetails !== null && this.userDetails !== undefined && this.userDetails !== '' && this.documentOwnerList && this.documentOwnerList.yoroDocsOwner) {
      this.documentOwnerList.yoroDocsOwner.forEach(element => {
        if (element.includes(this.userDetails.userId)) {
          isnotCreatedUser = true;
        }
      });
    }

    return isnotCreatedUser;
  }
  getOwners() {
    this.taskboardOwnerList = [];
    this.taskboardService.getUsersList().subscribe((data) => {
      this.ownerList = data;
    });
  }
  openEditor(val) {
    const dialog = this.dialog.open(DocumentEditorComponent, {
      disableClose: true,
      width: '95%',
      maxWidth: '95%',
      height: '95%',
      data: {
        type: 'newchild',
        content: val
      }
    });
    dialog.afterClosed().subscribe((data) => {
      if (data) {
        this.loadDocs();
        this.viewRender = false;
      }
    });
    window.history.pushState('', 'title', this.workspaceService.getWorkSpaceKey() + '/yorodocs/documents/' + val.documentKey);
    this.viewRender = false;
  }
  generateDocumentKey(name: string) {
    name = (name).replace(/[^\w\s]/gi, '');
    name = (name).trim().toLowerCase().replace(/ +/g, '-');
    return name;
  }
  dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const raw = window.atob(parts.length > 1 ? parts[1] : parts[0]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: 'image/png' });
  }
  getData(event) {
    this.quillDisable = true;
    const enc = window.btoa(event);
    const blob = this.dataURLToBlob(enc);
    const name = 'test';
    const fileData = new File([blob], name);
    this.new = fileData;
  }
  newEditor() {
    this.newEditorView = true;
  }
  getFile1() {
    const formData = new FormData();
    const name = this.form.get('title').value;
    const key = this.generateDocumentKey(name);
    if (this.viewTree === undefined) {
      this.id = null;
    }
    else {
      this.id = this.viewTree.documentId;
    }
    const customerVO = new YoroDocumentVO();
    customerVO.documentId = this.viewTree.documentId;
    customerVO.documentKey = key;
    customerVO.documentName = this.form.get('title').value;
    formData.append('data', JSON.stringify(customerVO));
    if (this.new === undefined) {
      formData.append('yoroDocs', this.quillData);
    }
    else {
      formData.append('yoroDocs', this.new);
    }
    return formData;
  }

  getFile() {
    const formData = new FormData();
    const name = this.form.get('title').value;
    const key = this.generateDocumentKey(name);
    if (this.selectedTree === undefined) {
      this.id = null;
    }
    else if (this.createNew === true) {
      this.id = null;
    }
    else {
      this.id = this.selectedTree.documentId;
    }
    const customerVO = new YoroDocumentVO();
    customerVO.parentDocumentId = this.id;
    customerVO.documentKey = key;
    customerVO.documentName = this.form.get('title').value;
    formData.append('data', JSON.stringify(customerVO));
    formData.append('yoroDocs', this.new);
    return formData;
  }
  save() {
    const taskTitle = this.form.get('title');
    if (this.form.get('title').value && this.form.get('title').value.length > 100) {
      this.showError = true;
      taskTitle.setErrors({ maxError: true });
    } else {
      this.quillDisable = false;
      this.form.get('title').markAsPristine();
      this.showError = false;
      taskTitle.setErrors(null);
      this.documentsservice.saveDocuments(this.getFile()).subscribe(data => {
        if (data.response.includes('successfully')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.documentsservice.getDocuments().subscribe(res => {
            this.listData = res;
            this.dataSource.data = this.listData;
            this.activeNode = '';
          }, (error => {
            this.quillDisable = true;
            this.form.get('title').markAsDirty();

            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Something went wrong',
            });
          }));
          this.showEditor = false;
          this.viewRender = false;
          this.editData = false;
          window.history.pushState('', 'title', this.workspaceService.getWorkSpaceKey() + '/yorodocs/documents');
        }
      });
    }
  }
  update() {
    const taskTitle = this.form.get('title');
    if (this.form.get('title').value && this.form.get('title').value.length > 100) {
      this.showError = true;
      taskTitle.setErrors({ maxError: true });
    } else {
      this.quillDisable = false;
      this.form.get('title').markAsPristine();
      this.showError = false;
      taskTitle.setErrors(null);
      this.documentsservice.saveDocuments(this.getFile1()).subscribe(data => {
        if (data.response.includes('successfully')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.documentsservice.getDocuments().subscribe(res => {
            this.listData = res;
            this.dataSource.data = this.listData;
            this.activeNode = '';
          }, (error => {
            this.quillDisable = true;
            this.form.get('title').markAsDirty();
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Something went wrong',
            });
          }));
          this.showEditor = false;
          this.viewRender = false;
          this.editData = false;
          window.history.pushState('', 'title', this.workspaceService.getWorkSpaceKey() + '/yorodocs/documents');
        }
      });
    }
  }
  getSecurity(node) {
    this.documentsservice.getSecurity(node.documentId).subscribe(data => {
      this.documentOwnerList = data;
    });
  }
  viewDocument(node) {
    this.spinnerDialog();
    this.activeNode = node.documentId;
    this.activeIndex = '';
    this.viewTree = node;
    this.viewRender = false;
    this.getSecurity(node);
    this.loadContent(node);
    window.history.pushState('', 'title', this.workspaceService.getWorkSpaceKey() + '/yorodocs/documents/' + node.documentKey);
  }
  newDocument() {

    this.documentsservice.isAllowed().subscribe(data => {
      this.licenseVO = data;
      if (this.licenseVO.response.includes("You have exceeded your limit")) {
        this.dialog.open(AlertmessageComponent, {
          width: '450px',
          data: { licenseVO: this.licenseVO, pageName: 'Documents' }
        });
      } else {
        window.history.pushState('', 'title', this.workspaceService.getWorkSpaceKey() + '/yorodocs/documents');
        this.activeNode = '';
        this.viewRender = false;
        const dialog = this.dialog.open(DocumentEditorComponent, {
          disableClose: true,
          width: '95%',
          maxWidth: '95%',
          height: '95%',
          data: {
            type: 'new'
          }
        });
        dialog.afterClosed().subscribe((data) => {
          if (data) {
            this.documentsservice.getDocuments().subscribe(res => {
              this.listData = res;
              this.dataSource.data = this.listData;
              this.viewDocument(this.listData.find(l => l.documentId === data.response.id));
            });
            this.viewRender = false;
          }
        });
      }
    });

  }
  loadQuill(node) {
    if (node.documentData !== null && node.documentData !== undefined && node.documentData !== '') {
      this.documentsservice.downloadAttachedFile(node.documentId).subscribe(data => {
        if (data) {
          this.spinner.close();
          this.viewRender = true;
          this.activeIndex = node;
          const blob = new Blob([data], { type: data.type });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = (event) => {
            this.quillContent = reader.result;
            const Content = this.quillContent.split(',');
            const decodedJwtJsonData = window.atob(Content.length > 1 ? Content[1] : Content[0]);
            this.quillData = decodedJwtJsonData;
            const message = this.quillData.replaceAll('ÿ', '');
            this.documentId = node.documentId;
            const mapObj = {
              '&#xfffd;': '',
              'Â': '&nbsp;',
            };
            var re = new RegExp(Object.keys(mapObj).join("|"), "gi");
            const replaceData = message.replace(re, function (matched) {
              return mapObj[matched];
            });
            this.sanitizeHtml = this.sanitizer.bypassSecurityTrustHtml(replaceData);
            const quillEditor = new Quill(document.querySelector('#quillEditor'), {
              modules: {
                toolbar: {
                  container: [
                  ],
                },
              },
              theme: 'snow'
            });
            quillEditor.root.innerHTML = this.sanitizeHtml;
            this.quillEditor = quillEditor;
          };
          this.docDetails = node;
        }
      }, (error => {
        this.spinner.close();
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Something went wrong',
        });
      })
      );
    }
    else {
      this.spinner.close();
      this.form.get('title').setValue(this.viewTree.documentName);
      this.viewRender = true;
    }
  }
  loadContent(node) {
    if (node.documentData !== null && node.documentData !== undefined && node.documentData !== '') {
      this.documentsservice.downloadAttachedFile(node.documentId).subscribe(data => {
        if (data) {
          this.spinner.close();
          this.viewRender = true;
          this.activeIndex = node;
          const blob = new Blob([data], { type: data.type });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = (event) => {
            this.quillContent = reader.result;
            const Content = this.quillContent.split(',');
            const decodedJwtJsonData = window.atob(Content.length > 1 ? Content[1] : Content[0]);
            this.quillData = decodedJwtJsonData;
            this.documentId = node.documentId;
            const message = this.quillData.replaceAll('ÿ', '');
            const quillEditor = new Quill(document.querySelector('#quillEditor'), {
              modules: {
                toolbar: {
                  container: [
                  ],
                },
              },
              theme: 'snow'
            });
            const mapObj = {
              '&#xfffd;': '',
              'Â': '&nbsp;',
            };
            var re = new RegExp(Object.keys(mapObj).join("|"), "gi");
            const replaceData = this.quillData.replace(re, function (matched) {
              return mapObj[matched];
            });
            this.sanitizeHtml = this.sanitizer.bypassSecurityTrustHtml(replaceData);
            quillEditor.root.innerHTML = replaceData;
            this.quillEditor = quillEditor;
            this.quillEditor.root.innerHTML = replaceData;
            this.quillData = replaceData;
          };
          this.docDetails = node;
          this.form.get('title').setValue(this.docDetails.documentName);
        }
      }, (error => {
        this.spinner.close();
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Something went wrong',
        });
      })
      );
    }
    else {
      this.spinner.close();
      this.form.get('title').setValue(this.viewTree.documentName);
      this.viewRender = true;
    }
  }

  edit() {
    const dialog = this.dialog.open(DocumentEditorComponent, {
      disableClose: true,
      width: '95%',
      maxWidth: '95%',
      height: '95%',
      data: {
        content: this.viewTree,
        quill: this.quillData,
        id: this.documentId,
        type: 'edit',
        security: this.documentOwnerList,
        title: this.form.get('title').value,
      }
    });
    dialog.afterClosed().subscribe((data) => {
      if (data) {
        if (data.type === 'cancel') {
          this.form.get('title').setValue(data.val);
          this.viewRender = true;
        }
        else {
          this.viewRender = false;
          this.loadQuill(data.data.content);
          this.form.get('title').setValue(data.title);
        }
        window.history.pushState('', 'title', this.workspaceService.getWorkSpaceKey() + '/yorodocs/documents/'
          + this.generateDocumentKey(this.form.get('title').value));
        this.documentsservice.getDocuments().subscribe(res => {
          this.listData = res;
          this.dataSource.data = this.listData;
          this.viewTree.documentName = this.form.get('title').value;
        });
      }
    });
  }
  editName() {
    this.editTitle = true;
  }
  saveTitle(val) {
    const taskTitle = this.form.get('title');
    const key = this.generateDocumentKey(taskTitle.value);
    const isWhitespace = (this.form.get('title').value || '').trim().length === 0;
    if (this.form.get('title').value && this.form.get('title').value.length > 100) {
      this.showError = true;
      taskTitle.setErrors({ maxError: true });
    } else {
      if (isWhitespace !== true && val !== '' && val !== null && val !== undefined) {
        this.showError = false;
        taskTitle.setErrors(null);
        this.documentsservice.saveDocuments(this.getName()).subscribe(data => {
          if (data.response.includes('successfully')) {
            this.editTitle = false;
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            window.history.pushState('', 'title', this.workspaceService.getWorkSpaceKey() + '/yorodocs/documents/' + key);
            this.documentsservice.getDocuments().subscribe(res => {
              this.listData = res;
              this.dataSource.data = this.listData;
              this.viewTree.documentName = this.form.get('title').value;
            });
          }
        });
      }
      else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Document Name cant be empty'
        });
      }
    }
  }
  getName() {
    const formData = new FormData();
    const name = this.form.get('title').value;
    const key = this.generateDocumentKey(name);
    const customerVO = new YoroDocumentVO();
    customerVO.documentId = this.viewTree.documentId;
    customerVO.documentKey = key;
    customerVO.documentName = this.form.get('title').value;
    formData.append('data', JSON.stringify(customerVO));
    return formData;
  }

  dragHover(node) {
    this.activeIndex = node;
  }
  dragHoverEnd() {
    this.activeIndex = '';
  }
  deleteNode() {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      width: '400px',
      data: { type: 'documentDelete', value: this.viewTree }
    });
    dialog.afterClosed().subscribe((data) => {
      if (data.status === 'yes') {
        this.documentsservice.removeDocument(this.viewTree.documentId).subscribe(data => {
          if (data.response.includes('successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            this.viewRender = false;
            window.history.pushState('', 'title', this.workspaceService.getWorkSpaceKey() + '/yorodocs/documents');
            this.documentsservice.getDocuments().subscribe(res => {
              this.listData = res;
              this.dataSource.data = this.listData;
            });
          }
        });
      }
      else {
        return;
      }
    });
  }
  cancel() {
    this.editTitle = false;
    this.form.get('title').setValue(this.viewTree.documentName);
  }
  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }
  readDialog() {
    const dialog = this.dialog.open(
      DocumentTeamComponent,
      {
        disableClose: true,
        width: '50%',
        height: '70%',
        panelClass: 'config-dialog',
        data: {
          id: this.viewTree.documentId,
          usersList: this.ownerList,
          groupList: this.usersList,
          owner: this.documentOwnerList,

        },
      });
    dialog.afterClosed().subscribe(teamVO => {
      this.getSecurity(this.viewTree);
    });
  }
  async exportPdf() {
    const delta = this.quillEditor.getContents();
    if (delta.ops[0]?.insert?.includes('SafeValue must use [property]=binding: \n')) {
      let toReplaceString = delta.ops[0].insert;
      const replaceString = toReplaceString.replace('SafeValue must use [property]=binding:', '');
      delta.ops[0].insert = replaceString;
    }
    if (delta.ops[delta.ops.length - 1]?.insert?.includes('(see https://g.co/ng/security#xss)\n')) {
      let toReplaceString = delta.ops[delta.ops.length - 1].insert;
      const replaceString = toReplaceString.replace('(see https://g.co/ng/security#xss)', '');
      delta.ops[delta.ops.length - 1].insert = replaceString;
    }
    const blob = await pdfExporter.generatePdf(delta);
    saveAs(blob as Blob, this.form.get('title').value + '.pdf');
  }
  public async exportWord() {
    const delta = this.quillEditor.getContents();
    if (delta.ops[0]?.insert?.includes('SafeValue must use [property]=binding:')) {
      let toReplaceString = delta.ops[0].insert;
      const replaceString = toReplaceString.replace('SafeValue must use [property]=binding:', '');
      delta.ops[0].insert = replaceString;
    }
    if (delta.ops[delta.ops.length - 1]?.insert?.includes('(see https://g.co/ng/security#xss)\n')) {
      let toReplaceString = delta.ops[delta.ops.length - 1].insert;
      const replaceString = toReplaceString.replace('(see https://g.co/ng/security#xss)', '');
      delta.ops[delta.ops.length - 1].insert = replaceString;
    }
    const blob = await quillToWord.generateWord(delta, this.quillToWordConfig);
    saveAs(blob, this.form.get('title').value + '.docx');
  }

  getUserName(userId) {
    const index = this.ownerList.findIndex(
      (users) => users.userId === userId
    );
    return (this.ownerList[index]?.firstName +
      " " +
      this.ownerList[index]?.lastName
    );
  }

  getUserColor(userId): string {
    const index = this.ownerList.findIndex(
      (users) => users.userId === userId
    );
    return this.ownerList[index]?.color;
  }

  getUserFirstAndLastNamePrefix(userId) {
    const index = this.ownerList.findIndex(
      (users) => users.userId === userId
    );
    const firstName = this.ownerList[index]?.firstName.charAt(0).toUpperCase();
    const lastName = this.ownerList[index]?.lastName.charAt(0).toUpperCase();
    if (firstName && lastName) {
      return firstName + lastName;
    } else {
      return;
    }
  }

  getUserNames(assigneeUsers) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < assigneeUsers?.length; i++) {
      if (i > 4) {
        const index = this.ownerList.findIndex(
          (users) => users.userId === assigneeUsers[i]
        );
        if (userNames === null) {
          userNames =
            "Assigned To " +
            this.ownerList[index].firstName +
            " " +
            this.ownerList[index].lastName +
            ", ";
        } else {
          userNames =
            userNames +
            this.ownerList[index].firstName +
            " " +
            this.ownerList[index].lastName +
            ", ";
        }
      }
    }
    return userNames;
  }

  getRemainingAssigneeUserCount(assigneeUsers) {
    let array = [];
    for (let i = 0; i < assigneeUsers.length; i++) {
      const index = this.usersList.findIndex(
        (users) => users.userId === assigneeUsers[i]
      );
      array.push(this.usersList[index]);
    }
    if (assigneeUsers.length > 4) {
      return assigneeUsers.length - 4;
    }
  }

  getGroupName(groupId) {
    const index = this.usersList.findIndex(
      (users) => users.id === groupId
    );
    return (this.usersList[index]?.name);
  }

  getGroupColor(groupId): string {
    const index = this.usersList.findIndex(
      (users) => users.id === groupId
    );
    return this.usersList[index]?.color;
  }

  getGroupFirstAndLastNamePrefix(groupId) {
    const index = this.usersList.findIndex(
      (users) => users.id === groupId
    );
    const firstName = this.usersList[index]?.name.toUpperCase().charAt(0);
    if (firstName) {
      return firstName;
    } else {
      return;
    }
  }

  getGroupNames(securityVoList) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < securityVoList?.length; i++) {
      if (i > 4) {
        const index = this.usersList.findIndex(
          (users) => users.id === securityVoList[i].groupId
        );
        if (userNames === null) {
          userNames =
            "Assigned To " +
            this.ownerList[index].name +
            ", ";
        } else {
          userNames =
            userNames +
            this.ownerList[index].name +
            ", ";
        }
      }
    }
    return userNames;
  }

  getRemainingAssigneeGroupCount(securityVoList) {
    let array = [];
    for (let i = 0; i < securityVoList.length; i++) {
      const index = this.usersList.findIndex(
        (users) => users.userId === securityVoList[i].groupId
      );
      array.push(this.usersList[index]);
    }
    if (securityVoList.length > 4) {
      return securityVoList.length - 4;
    }
  }

}


