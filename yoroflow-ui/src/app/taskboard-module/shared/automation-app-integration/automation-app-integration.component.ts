import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { QuillService } from 'src/app/shared-module/quill-editor/quill.service';
import { Action } from '../../event-automation/actions';
import { TaskboardVO } from '../../taskboard-configuration/taskboard.model';
import { AutomationServiceService } from '../service/automation-service.service';
import { Channel } from './app-integration-model';

@Component({
  selector: 'app-automation-app-integration',
  templateUrl: './automation-app-integration.component.html',
  styleUrls: ['./automation-app-integration.component.scss']
})
export class AutomationAppIntegrationComponent implements OnInit {

  channelsList: Channel[] = [];
  spinnerShow: boolean = true;

  @Input() selectedScript: any;
  @Input() taskboardVO = new TaskboardVO();
  @Output() channelDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() message: EventEmitter<any> = new EventEmitter<any>();

  applicationName: string;
  form: FormGroup;
  @ViewChild('quill', { static: true }) quill: QuillEditorComponent;

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
      handlers: {
        'code-block': () => {
          this.formatChange();
        }
      }
    },
    mention: {}
  };

  format = 'html';
  systemVariables: any;
  returnValue: boolean;

  constructor(private automationService: AutomationServiceService, private action: Action,
    private fb: FormBuilder, private quillservice: QuillService) { }


  ngOnInit(): void {
    this.form = this.fb.group({
      editor: [],
      subject: [],
    });
    this.action.appNameList.forEach(app => {
      if (this.selectedScript.automation.includes(app.value)) {
        this.applicationName = app.name;
      }
    });
    if (this.applicationName === 'Microsoft Teams') {
      this.automationService.getTeamsChannels(this.taskboardVO.id).subscribe(data => {
        this.channelsList = data;
        this.spinnerShow = false;
      });
    } else if (this.applicationName === 'Slack') {
      this.automationService.getSlackChannels(this.taskboardVO.id).subscribe(data => {
        this.channelsList = data;
        this.spinnerShow = false;
      });
    } else {
      this.form.get('subject').setValue(this.selectedScript.keyValuePair.subject);
      this.form.get('editor').setValue(this.selectedScript.keyValuePair.message);
      this.quillservice.getSystemVariables().subscribe(res => {
        this.systemVariables = res;
      });
    }
    this.getApplicationName();
  }

  getChannelName(channel: Channel): void {
    this.channelDetails.emit(channel);
  }

  getApplicationName(): void {
    if (this.applicationName === 'Twitter' || this.applicationName === 'LinkedIn') {
      this.returnValue = true;
    } else {
      this.returnValue = false;
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

  apply(): void {
    this.form.get('editor').setValue(this.quill.quillEditor.root.innerText);
    const htmlText = this.form.get('editor').value;
    this.quill.quillEditor.setText('');
    this.quill.quillEditor.pasteHTML(0, htmlText);
    if (this.quill.quillEditor.root.innerText === 'message') {
      this.quill.quillEditor.root.innerText = 'message ';
    }
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.message);
    this.selectedScript.words[index] = this.quill.quillEditor.root.innerText;
    this.selectedScript.keyValuePair.message = this.quill.quillEditor.root.innerText;
    this.selectedScript.keyValuePair.subject = this.form.get('subject').value;
    this.message.emit(true);
  }

  selectChip(chipName: any): void {
    const selection = this.quill.quillEditor.selection;
    if (this.form.get('editor').value === undefined || this.form.get('editor').value === null || this.form.get('editor').value === '') {
      this.form.get('editor').setValue('{{' + chipName.fieldId + '}}');
    } else {
      this.quill.quillEditor.insertText(selection.savedRange.index, '{{' + chipName.fieldId + '}}');
    }
  }
}
