import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild,
  NgZone, HostListener, Inject, Renderer2
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import 'quill-mention';
import Quill from 'quill';
import 'quill-paste-smart';
import { YoroflowDocumentsComponent } from '../yoroflow-documents/yoroflow-documents.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DocumentsService } from '../documents.service';
import BlotFormatter from 'quill-blot-formatter';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { commentsVO, YoroDocumentVO } from '../documents-vo';
import { Observable } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ConfirmationDialogBoxComponentComponent } from '../../engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { ConfirmdialogComponent } from 'src/app/shared-module/confirmdialog/confirmdialog.component';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { QuillBinding } from 'y-quill';
import QuillCursors from 'quill-cursors';
import { sample } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { GroupVO } from '../../designer-module/task-property/model/group-vo';
import { DocumentCommentComponent } from '../document-comment/document-comment.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { element } from 'protractor';
import { DomSanitizer } from '@angular/platform-browser';

Quill.register('modules/blotFormatter', BlotFormatter);

@Component({
  selector: 'app-document-editor',
  templateUrl: './document-editor.component.html',
  styleUrls: ['./document-editor.component.scss']
})
export class DocumentEditorComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  formComment: FormGroup;
  @Output() orgValue: EventEmitter<any> = new EventEmitter<any>();
  @Input() object: any;
  content: any;
  newQuillData: any;
  @Input() inputMessage: string;
  format = 'html';
  isShow = false;
  documentComponent: YoroflowDocumentsComponent;
  screenHeight1: any;
  show = false;
  showSpinner = false;
  @Input() resetMode: boolean;
  @HostListener('window:resize', ['$event'])
  showError = false;
  documentsVO = new YoroDocumentVO;
  id: any;
  editTitle = false;
  color: ThemePalette = 'accent';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 50;
  spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent, any>;
  userName: string;
  mention: any;
  quill: any;
  usersList: any = [];
  groupList: GroupVO[] = [];

  userArray: any = [];
  mentionItem: any;
  selectedUsers: any = [];
  mentionIds: any = [];
  contactEmail: any = [];
  metaData = [];
  commentData: string;
  enableCommentdata = false;
  open = false;
  metaInfo: any;
  setClicked = false;
  dataValue: any;
  type: any;
  commentsList: any[] = [];
  commentsCount = 0;
  newArray: any = [];
  replyClicked = [false, false, false, false, false];
  showComment = false;
  editChild = [false, false, false, false, false];
  editClicked = [false, false, false, false, false];
  top: any;
  @ViewChild(MatMenuTrigger, { static: false })
  contextmenu: MatMenuTrigger;
  menuX = 0;
  menuY = 0;
  onResize(event) {
    this.screenHeight1 = (window.innerHeight - 63) + 'px';
  }
  constructor(private renderer: Renderer2, private snackBar: MatSnackBar,
    private document: DocumentsService, @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, private dialogRef: MatDialogRef<DocumentEditorComponent>,
    private dialog: MatDialog, private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      editor: [],
      title: [],
      commentValue: [],
      commentSection: []
    });
    if (this.data.type === 'edit') {
      this.form.get('title').setValue(this.data.title);
    }
    else {
      this.form.get('editor').setValue('');
      this.form.get('title').setValue('');
    }
    this.getLoggedUserDetails();
  }



  onTriggerContextMenu(e: MouseEvent) {
    const posX = e.clientX;
    const posY = e.clientY;
    this.menuX = posX;
    this.menuY = posY + 13;
    // this.contextmenu.closeMenu() // putting this does not work.
    this.contextmenu.openMenu();

  }

  onContentChanged = event => {
  }
  onSelectionChanged = event => {
  }

  dialogClose() {
    if (this.form.dirty === true) {
      const dialog = this.dialog.open(ConfirmdialogComponent, {
        disableClose: true,
        width: '20%',
        data: {
          type: 'confirmation'
        }
      });
      dialog.afterClosed().subscribe((data) => {
        if (data === 'yes') {
          this.dialogRef.close({ type: 'cancel', val: this.form.get('title').value });
        }
        else {
          return '';
        }
      });
    }
    else {
      this.dialogRef.close({ type: 'cancel', val: this.form.get('title').value });
    }
  }
  dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const raw = decodeURIComponent(escape(window.atob(parts.length > 1 ? parts[1] : parts[0])));
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: 'image/png' });
  }
  save(userForm) {
    const enc = window.btoa(unescape(encodeURIComponent(this.quill.root.innerHTML)));
    const blob = this.dataURLToBlob(enc);
    const name = 'test';
    const fileData = new File([blob], name);
    this.newQuillData = fileData;
    const taskTitle = this.form.get('title');
    const isWhitespace = (this.form.get('title').value || '').trim().length === 0;
    if (this.form.get('title').value && this.form.get('title').value.length > 100) {
      this.showError = true;
      taskTitle.setErrors({ maxError: true });
    } else {
      this.form.get('title').markAsPristine();
      this.showError = false;
      taskTitle.setErrors(null);
      if (isWhitespace !== true && this.form.get('title').value !== null
        && this.form.get('title').value !== '' && this.form.get('title').value !== undefined) {
        this.spinnerDialog();
        this.document.saveDocuments(this.getFile()).subscribe(data => {
          if (data.response.includes('successfully')) {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            this.spinner.close();
            this.dialogRef.close({ data: this.data, val: this.form, response:data });
          }
        }, (error => {
          this.spinner.close();
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Something went wrong',
          });
        })
        );
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Document Name cant be empty'
        });
      }
    }
  }
  focusMyInput() {
    this.renderer.selectRootElement('#myInput').focus();
  }
  editName() {
    this.editTitle = true;
  }
  getFileUpdate() {
    const formData = new FormData();
    const name = this.form.get('title').value;
    const key = this.generateDocumentKey(name);
    const customerVO = new YoroDocumentVO();
    customerVO.documentId = this.data.content.documentId;
    customerVO.documentKey = key;
    customerVO.documentName = this.form.get('title').value;
    customerVO.mentionedUsersId = this.mentionIds;
    customerVO.mentionedUsersEmail = this.contactEmail;
    formData.append('data', JSON.stringify(customerVO));
    formData.append('yoroDocs', this.newQuillData);
    return formData;
  }
  update() {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.selectedUsers.length; i++) {
      this.mentionIds.push(this.selectedUsers[i].id);
      const userName = this.usersList.find(n => n.userId === this.selectedUsers[i].id);
      this.contactEmail.push(userName.contactEmailId);
    }
    this.spinnerDialog();
    const enc = window.btoa(unescape(encodeURIComponent(this.quill.root.innerHTML)));
    const blob = this.dataURLToBlob(enc);
    const name = 'test';
    const fileData = new File([blob], name);
    this.newQuillData = fileData;
    const taskTitle = this.form.get('title');
    if (this.form.get('title').value && this.form.get('title').value.length > 100) {
      this.showError = true;
      taskTitle.setErrors({ maxError: true });
    } else {
      this.form.get('title').markAsPristine();
      this.showError = false;
      taskTitle.setErrors(null);
    }
    this.document.saveDocuments(this.getFileUpdate()).subscribe(data => {
      if (data.response.includes('successfully')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        this.spinner.close();
        this.dialogRef.close({ data: this.data, val: this.form, title: this.form.get('title').value });
      }
    }, (error => {
      this.spinner.close();
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Something went wrong',
      });
    })
    );
  }
  getFile() {
    const formData = new FormData();
    const name = this.form.get('title').value;
    const key = this.generateDocumentKey(name);
    if (this.data.type === 'new') {
      this.id = null;
    }
    if (this.data.type === 'newchild') {
      this.id = this.data.content.documentId;
    }
    if (this.data.type === 'edit') {
      this.id = this.data.content.documentId;
    }
    const customerVO = new YoroDocumentVO();
    customerVO.parentDocumentId = this.id;
    customerVO.documentKey = key;
    customerVO.documentName = this.form.get('title').value;
    formData.append('data', JSON.stringify(customerVO));
    formData.append('yoroDocs', this.newQuillData);
    return formData;
  }
  generateDocumentKey(name: string) {
    name = (name).replace(/[^\w\s]/gi, '');
    name = (name).trim().toLowerCase().replace(/ +/g, '-');
    return name;
  }
  cancel() {
    this.editTitle = false;
    this.form.get('title').markAsPristine();
    this.form.get('title').setValue(this.data.content.documentName);
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
        this.document.saveDocuments(this.getName()).subscribe(data => {
          if (data.response.includes('successfully')) {
            this.form.get('title').markAsPristine();
            this.editTitle = false;
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: data.response,
            });
            window.history.pushState('', 'title', 'yorodocs/documents/' + key);
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
    customerVO.documentId = this.data.content.documentId;
    customerVO.documentKey = key;
    customerVO.documentName = this.form.get('title').value;
    formData.append('data', JSON.stringify(customerVO));
    return formData;
  }
  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }

  getLoggedUserDetails(): void {
    this.document.getLoggedInUserDetails().subscribe(data => {
      this.userName = data.firstName + ' ' + data.lastName;
    });
  }

  getCursorColor() {
    return sample(['blue', 'red', 'orange', 'green']);
  }

  getRoomName(): string {
    return uuidv4();
  }

  ngAfterViewInit() {
    this.loadUserAndGroupList();
    const sub = Observable.interval(500).subscribe(val => {
      if (this.userName) {
        Quill.register('modules/cursors', QuillCursors);
        const Size = Quill.import('attributors/style/size');
        Quill.register(Size, true);
        Size.whitelist = ['10px', '11px', '12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px', '21px', '22px', '23px', '24px', '25px', '26px', '27px', '28px', '29px', '30px', '31px', '32px', '33px', '34px', '35px', '36px', '37px', '38px', '39px', '40px', '41px', '42px', '43px', '44px', '45px', '46px', '47px', '48px', '49px', '50px'];
        const fontList = ['Arial', 'Courier', 'Garamond', 'Tahoma', 'Times New Roman',
          'Verdana', 'Raleway', 'Montserrat', 'Source Sans Pro', 'Oswald', 'Lora', 'Spectral'];
        const fontNames = fontList.map(font => getFontName(font));
        const fonts = Quill.import('attributors/style/font');
        fonts.whitelist = fontNames;
        Quill.register(fonts, true);
        let fontStyles = '';
        fontList.forEach((font) => {
          const fontName = getFontName(font);
          fontStyles += '.ql-snow .ql-picker.ql-font .ql-picker-label[data-value=' + fontName + ']::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=' + fontName + ']::before {' +
            'content: \'' + font + '\';' +
            'font-family: \'' + font + '\', sans-serif;' +
            '}' +
            '.ql-font-' + fontName + '{' +
            ' font-family: \'' + font + '\', sans-serif;' +
            '}';
        });
        function getFontName(font) {
          return font.toLowerCase().replace(/\s/g, '-');
        }
        const ydoc = new Y.Doc();
        let roomName: string;
        if (this.data.id) {
          roomName = 'yorodocs-' + this.data.id;
        } else {
          roomName = 'yorodocs-' + this.getRoomName();
        }
        const provider = new WebsocketProvider('wss://demos.yjs.dev', roomName, ydoc);
        provider.awareness.setLocalStateField('user', {
          name: this.userName,
          color: this.getCursorColor()
        });
        const ytext = ydoc.getText('yorodocs-' + this.data.id);
        const nodes = document.createElement('style');
        nodes.innerHTML = fontStyles;
        document.body.appendChild(nodes);
        const quill = new Quill(document.querySelector('#quill'), {
          modules: {
            cursors: true,
            clipboard: {
              allowed: {
                tags: ['a', 'b', 'strong', 'u', 's', 'i', 'p', 'br', 'ul', 'ol', 'li', 'span'],
                attributes: ['href', 'rel', 'target', 'class']
              },
              keepSelection: true,
              substituteBlockElements: true,
              magicPasteLinks: true,
              hooks: {
                uponSanitizeElement(node, data, config) {
                },
              },
            },
            toolbar: {
              container: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ header: 1 }, { header: 2 }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['clean'],
                ['image', 'link'],
                ['video'],
                [{
                  font: fonts.whitelist,
                }],
                [{ size: ['10px', '11px', '12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px', '21px', '22px', '23px', '24px', '25px', '26px', '27px', '28px', '29px', '30px', '31px', '32px', '33px', '34px', '35px', '36px', '37px', '38px', '39px', '40px', '41px', '42px', '43px', '44px', '45px', '46px', '47px', '48px', '49px', '50px'] }],
                [{ color: [] },
                { background: [] }],
              ],
            },
            history: {
              userOnly: true
            },
            blotFormatter: {
            },
            mention: {
              allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
              mentionDenotationChars: ['@'],
              spaceAfterInsert: false,
              onSelect: (item, insertItem) => {
                this.mentionItem = item;
                this.selectedUsers.push(item);
                const editor = quill;
                insertItem(item);
              },
              source: (searchTerm, renderList, mentionChar) => {
                const values: any[] = [];
                if (mentionChar === '@') {
                  let array: any;
                  this.userArray.forEach(user => {
                    array = { id: user.userId, value: user.firstName + ' ' + user.lastName };
                    values.push(array);
                  });
                }
                if (searchTerm.length === 0) {
                  renderList(values, searchTerm);
                } else {
                  const matches = [];
                  // tslint:disable-next-line:prefer-for-of
                  for (let i = 0; i < values.length; i++) {
                    if (
                      // tslint:disable-next-line:no-bitwise
                      ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                    ) {
                      matches.push(values[i]);
                    }
                  }
                  renderList(matches, searchTerm);
                }
              }
            },
          },
          readOnly: false,
          placeholder: 'Enter text...',
          theme: 'snow'
        });
        this.getComments();
        const binding = new QuillBinding(ytext, quill, provider.awareness);
        this.spinnerDialog();
        this.quill = quill;
        setTimeout(data => {
          // && quill.root.innerHTML === '<p><br></p>'
          this.spinner.close();
          if (this.data.type === 'edit' && quill.root.innerHTML === '<p><br></p>') {
            quill.history.clear();
            const mapObj = {
              '&#xfffd;': '',
              'Â': '&nbsp;',
            };
            var re = new RegExp(Object.keys(mapObj).join("|"), "gi");
            const replaceData = this.data.quill.replace(re, function (matched) {
              return mapObj[matched];
            });
            this.data.quill = replaceData;
            quill.history.clear();
            quill.root.innerHTML = this.data.quill;
            this.quill = quill;
          }
        }, 2000);
        window.addEventListener('blur', () => {
          quill.blur();
        });
        document.getElementById('cancel').addEventListener('click', () => {
          const length = quill.root.innerHTML.length;
          if (length) {
            ytext.delete(0, length);
          }
          if (this.data.type === 'edit') {
            this.quill.root.innerHTML = this.data.quill;
          }
        });
        sub.unsubscribe();
      }
    });
  }

  askComment(event) {
    const range = this.quill.getSelection();
    if (range) {
      if (range.length > 0) {
        this.onTriggerContextMenu(event);
        // this.toolbar =
        // const toolbarElement = this.quill.getModule('toolbar');
        // const { top, left } = this.quill.getBounds(range);
        // const shift = 100;
        // toolbarElement.container.style.visibility = 'visible';
        // toolbarElement.container.style.position = 'absolute';
        // toolbarElement.container.style.top = `${top + shift}px`; // TODO need additional calculation for edge cases
        // toolbarElement.container.style.left = `${left}px`;
      }
    }
  }

  addComment(val) {
    this.newArray = [];
    const range = this.quill.getSelection();
    if (range) {
      const rangebounds = this.quill.getBounds(range);
      if (range.length === 0) {
      } else {
        const text = this.quill.getText(range.index, range.length);
        this.quill.formatText(range.index, range.length, {
          background: '#6B5BF8'
        });
        this.commentsList.forEach(e => {
          if (e.commentSection === text) {
            this.newArray.push(e);
          }
        });
        if (this.setClicked === true) {
          this.type = 'edit';
          this.dataValue = val;
        }
        else {
          this.type = 'add';
          this.dataValue = text;
        }
        const bodyRect = document.body.getBoundingClientRect();
        // const elemRect = this.quill._elementRef.nativeElement.getBoundingClientRect();
        const right = (bodyRect.right - rangebounds.right) - 160;

        if (rangebounds.bottom > 300) {
          this.top = rangebounds.bottom - 100;

        }
        else {
          this.top = rangebounds.bottom + 160;

        }


        const dialog = this.dialog.open(
          DocumentCommentComponent,
          {
            disableClose: true,
            width: '450px',
            //  position: { right: right + 'px', top: this.top+ 'px' },

            panelClass: 'config-dialog',
            data: {
              data: this.dataValue,
              type: this.type,
              range,
              array: this.newArray,
              list: this.usersList
            },
          });
        dialog.afterClosed().subscribe(data => {
          if (data) {
            const commentVo = new commentsVO;
            commentVo.comment = data.value;
            commentVo.docId = this.data.id;
            commentVo.parentCommentId = null;
            commentVo.commentSection = text;
            commentVo.length = range.length;
            commentVo.index = range.index;
            this.document.saveComments(commentVo).subscribe(res => {
              if (res.response.includes('successfully')) {
                this.quill.formatText(range.index, range.length, {
                  background: '#FFE999'
                });
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: res.response,
                });
                this.getComments();
              }
            });
          }
          else {
            this.quill.formatText(range.index, range.length, {
              background: '#FCFCFC'
            });
          }
        });
      }
    } else {
    }
  }
  loadUserAndGroupList() {
    this.document.getUserGroupList().subscribe((data) => {
      this.groupList = data;
    });
    this.document.getUsersList().subscribe((data) => {
      this.showComment = true;
      this.usersList = data;
      if (this.data.security && this.data?.security?.yoroDocsOwner && this.data?.security?.yoroDocsOwner.length !== 0) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.data.security.yoroDocsOwner.length; i++) {
          const name = this.usersList.find(n => n.userId === this.data.security.yoroDocsOwner[i]);
          this.userArray.push(name);
        }
      }
    });
  }
  expandOrCollapse(value: string): void {
    if (value === 'open') {
      this.open = true;
    } else {
      this.open = false;
    }
  }
  openCommentsDialog() {
    this.open = true;
  }
  getComments() {
    this.document.getComments(this.data.id).subscribe(res => {
      if (res) {
        this.commentsList = res.docsCommentVoList;
        this.commentsCount = res.commentLength;
        if (this.commentsList && this.commentsList.length > 0) {
          this.commentsList.forEach(comment => {
            if (comment.index && comment.length) {
              this.quill.formatText(comment.index, comment.length, {
                background: '#FFE999'
              });
            }
            comment.openComment = false;
            comment.isEdit = false;
            comment.isReply = false;
            if (comment.nestedDocsCommentVo && comment.nestedDocsCommentVo.length > 0) {
              this.setCommentsVariable(comment.nestedDocsCommentVo);
            }
          });
        }
      }
    });
  }
  setCommentsVariable(comments: any): void {
    if (comments && comments.length > 0) {
      comments.forEach(comment => {
        comment.openComment = false;
        comment.isEdit = false;
        comment.isReply = false;
        if (comment.nestedDocsCommentVo && comment.nestedDocsCommentVo.length > 0) {
          this.setCommentsVariable(comment.nestedDocsCommentVo);
        }
      });
    }
  }
  addTypedComment(data) {
    const commentVo = new commentsVO;
    commentVo.comment = this.form.get('commentValue').value;
    commentVo.docId = this.data.id;
    commentVo.parentCommentId = data.id;
    commentVo.commentSection = data.commentSection;
    this.document.saveComments(commentVo).subscribe(res => {
      if (res.response.includes('successfully')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: res.response,
        });
        this.getComments();
        this.form.get('commentValue').setValue('');
      }
    });
  }

  getValue(event) {
    this.quill.formatText(event.index, event.length, {
      background: '#2bffdf'
    });

  }
  refreshEvent(event) {
    if (event === true) {
      this.getComments();
    }
  }
}


