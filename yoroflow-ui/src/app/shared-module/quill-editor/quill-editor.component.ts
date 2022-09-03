import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { timeStamp } from 'console';
import { QuillEditorComponent } from 'ngx-quill';
import { EmailTemplateComponent } from 'src/app/creation-module/email-template/email-template.component';
import { Field } from 'src/app/rendering-module/shared/vo/page-vo';
import { UserVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { QuillService } from './quill.service';
import 'quill-mention';
import { TaskPropertyComponent } from 'src/app/designer-module/task-property/task-property.component';
@Component({
  selector: 'app-quill-editor',
  templateUrl: './quill-editor.component.html',
  styleUrls: ['./quill-editor.component.scss']
})
export class CustomQuillEditorComponent implements OnInit {

  @Input() inputMessage: string;
  @Input() inputEmail: string;
  @Input() inputSystemData: string;
  @Input() inputSms: string;
  @Input() fromEmailTemplate: boolean;
  @Input() templateObject: any;
  @Input() emailObject: any;
  @Input() systemObject: any;
  @Input() smsObject: any;
  @Input() fromTaskboard: boolean;
  @Input() automation: boolean;
  @Input() fromEmailTask: boolean;
  @Input() fromSystemTask: boolean;
  @Input() fromSmsTask: boolean;
  @Input() systemEmailVariables: any;
  @Input() createTask: boolean;
  @Input() users: UserVO[] = [];
  @Input() taskboardComments: boolean;
  @Input() workflowComments: boolean;
  @Input() isReply: boolean;
  @Input() isEdit: boolean;
  @Input() comments: string;
  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  @Output() message: EventEmitter<any> = new EventEmitter<any>();
  @Output() editorValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() emailValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() systemValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() smsValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() replyMessage: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('quill', { static: true }) quill: QuillEditorComponent;
  hasFocus = false;
  autocompleteInitialFieldList: any = [];

  subject: string;
  form: FormGroup;
  editor: any;
  inputData: any;
  emailTemplateComponent: EmailTemplateComponent;
  isDisable: boolean = true;
  systemVariables: any;
  mention: any;
  constructor(private fb: FormBuilder, private quillservice: QuillService) { }
  isShow: boolean = false;
  taskProperty: TaskPropertyComponent;

  quillConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'], // remove formatting button
        ['image', 'link'],
        ['code-block'],
      ],
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
      handlers: {
        'code-block': () => {
          this.formatChange();
        }
      }
    },
    mention: {}
  };

  format = 'html';
  isApplyDisabled: boolean = false;
  templateForm: FormGroup;
  selectedUserList: string[] = [];

  ngOnInit(): void {
    if (this.taskboardComments === true || this.isReply || this.isEdit || this.workflowComments === true) {
      this.quillConfig.mention = {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ['@'],
        source: (searchTerm, renderList, mentionChar) => {
          let values: any[] = [];
          if (mentionChar === '@') {
            let array: any;
            this.users.forEach(user => {
              array = { id: user.userId, value: user.firstName + ' ' + user.lastName };
              values.push(array);
            });
          }
          if (searchTerm.length === 0) {
            renderList(values, searchTerm);
          } else {
            const matches = [];
            for (var i = 0; i < values.length; i++)
              if (
                ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
              )
                matches.push(values[i]);
            renderList(matches, searchTerm);
          }
        }
      }
    }
    this.form = this.fb.group({
      editor: []
    });
    this.form.get('editor').setValue(this.inputMessage);
    if (this.fromEmailTemplate) {
      this.emailTemplateComponent = this.templateObject;
      this.templateForm = this.emailTemplateComponent.emailTemplate;
      this.emailTemplateComponent.gridData.subscribe(data => {
        this.isShow = true;
        this.inputData = data;
        this.form.get('editor').setValue(data);
        this.emailTemplateComponent.changeData.subscribe(data => {
          if (data === true) {
            this.isShow = false;
          }
        })
      });
    }
    this.quillservice.getSystemVariables().subscribe(res => {
      if (this.createTask === true) {
        this.systemVariables = res.filter(field => !field.fieldId.startsWith('log'));
      } else {
        this.systemVariables = res;
      }
    });
    if (this.comments) {
      this.form.get('editor').setValue(this.comments);
      const htmlText = this.form.get('editor').value;
      this.quill.quillEditor.setText('');
      this.quill.quillEditor.pasteHTML(0, htmlText);
    }
    if (this.fromSystemTask === true) {
      this.quillservice.getInitialFields(this.systemEmailVariables.workflowStructure, this.systemEmailVariables.key).subscribe(res => {
        const list = res;
        list.forEach(field => {
          if (field.fieldType === 'Workflow Variables:' || field.fieldType === 'System Variables:'
            || field.fieldType === 'Environment Variables:' || field.fieldType === 'Custom Attributes:') {
            field.fieldVO.forEach(fieldvo => {
              this.autocompleteInitialFieldList.push(fieldvo);
            });
          }
        });
      })
      this.form.get('editor').setValue(this.inputSystemData);
      this.taskProperty = this.systemObject;
      this.taskProperty.systemReset.subscribe(res => {
        if (res === true) {
          this.form.get('editor').setValue('');
        }
      })
    }
    if (this.fromSmsTask === true) {
      this.quillservice.getInitialFields(this.systemEmailVariables.workflowStructure, this.systemEmailVariables.key).subscribe(res => {
        const list = res;
        list.forEach(field => {
          if (field.fieldType === 'Workflow Variables:' || field.fieldType === 'System Variables:'
            || field.fieldType === 'Environment Variables:' || field.fieldType === 'Custom Attributes:') {
            field.fieldVO.forEach(fieldvo => {
              this.autocompleteInitialFieldList.push(fieldvo);
            });
          }
        });
      })
      this.form.get('editor').setValue(this.inputSms);
      this.taskProperty = this.smsObject;
      this.taskProperty.smsReset.subscribe(res => {
        if (res === true) {
          this.form.get('editor').setValue('');
        }
      })
    }
    if (this.fromEmailTask === true) {
      this.quillservice.getInitialFields(this.systemEmailVariables.workflowStructure, this.systemEmailVariables.key).subscribe(res => {
        const list = res;
        list.forEach(field => {
          if (field.fieldType === 'Workflow Variables:' || field.fieldType === 'System Variables:'
            || field.fieldType === 'Environment Variables:' || field.fieldType === 'Custom Attributes:') {
            field.fieldVO.forEach(fieldvo => {
              this.autocompleteInitialFieldList.push(fieldvo);
            });
          }
        });
      })
      this.taskProperty = this.emailObject;
      this.taskProperty.emailReset.subscribe(data => {
        if (data) {
          this.form.get('editor').setValue(data);
        }
        else {
          this.form.get('editor').setValue('');
        }
      })
      this.form.get('editor').setValue(this.inputEmail);
    }
  }

  formatChange(): void {
    this.format = this.format === 'html' ? 'text' : 'html';
    if (this.format === 'text') {
      const htmlText = this.form.get('editor').value;
      this.quill.quillEditor.setText(htmlText);
    } else if (this.format === 'html') {
      const htmlText = this.form.get('editor').value;
      this.quill.quillEditor.setText('');
      this.quill.quillEditor.pasteHTML(0, htmlText);
    }
  }

  test = event => {
  };

  onSelectionChanged = event => {
    if (event.oldRange == null) {
      this.onFocus();
    }
    if (event.range == null) {
      this.onBlur();
    }
  };

  onContentChanged = event => {
    if (this.fromSystemTask === true) {
      this.systemValue.emit(this.quill.quillEditor.root.innerHTML)
    }
    if (this.fromSmsTask === true) {
      this.smsValue.emit(this.quill.quillEditor.root.innerHTML);
    }
    if (this.fromEmailTask === true) {
      this.emailValue.emit(this.quill.quillEditor.root.innerHTML);
    }

  };

  onFocus = () => {

  };
  onBlur = () => {
  };

  apply(): void {
    const htmlText = this.form.get('editor').value;
    this.quill.quillEditor.setText('');
    this.quill.quillEditor.pasteHTML(0, htmlText);

    if (this.taskboardComments || this.isReply || this.isEdit || this.workflowComments) {
      var html = this.quill.quillEditor.root.innerHTML;
      const re = /\"/gi;
      var replacedHtml = html.replace(re, '');
      var array = replacedHtml.split('data-id=');
      if (array) {
        var usersId: string[] = [];
        array.forEach(element => {
          const userId = element.split(' ');
          var user = this.users.find(user => user.userId === userId[0]);
          if (user) {
            this.selectedUserList.push(user.contactEmailId);
            usersId.push(user.userId);
          }
        });
      }
      const editorValue = this.quill.quillEditor.root.innerHTML;
      const contactMails = this.selectedUserList.filter((mail, index) => this.selectedUserList.findIndex(email => email === mail) === index);
      const usersIdList = usersId.filter((userId, index) => usersId.findIndex(id => id === userId) === index);
      this.editorValue.emit({ message: editorValue, contactMails: contactMails, usersId: usersIdList });
      this.form.get('editor').setValue('');
    } else if (this.automation || this.createTask) {
      this.message.emit(this.quill.quillEditor.root.innerText);
    } else {
      this.message.emit(this.quill.quillEditor.root.innerHTML);
    }
  }

  save(): void {
    this.message.emit(this.quill.quillEditor.root.innerHTML);
  }

  update(): void {
    let myContainer = <HTMLElement>document.querySelector("#quill");
    this.editorValue.emit(this.quill.quillEditor.root.innerHTML);
    this.form.get('editor').setValue('');

  }

  reset(userForm: NgForm): void {
    this.inputData = null;
    this.templateForm.markAsUntouched();
    this.form.get('editor').setValue('');
    userForm.resetForm();
    this.resetEmitter.emit(true);
  }

  selectChip(chipName: any): void {
    const selection = this.quill.quillEditor.selection;
    this.quill.quillEditor.insertText(selection.savedRange.index, '{{' + chipName.fieldId + '}}');
  }

  closeQuill(): void {
    this.form.get('editor').setValue('');
    this.close.emit(true);
  }
}