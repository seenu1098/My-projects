import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Action } from '../../event-automation/actions';
import { LabelsVO } from '../../taskboard-form-details/taskboard-task-vo';
import { StatusVO } from '../models/satus-model';

@Component({
  selector: 'automation-status',
  templateUrl: './automation-status.component.html',
  styleUrls: ['./automation-status.component.scss']
})
export class AutomationStatusComponent implements OnInit {

  @Input() taskboardStatus: StatusVO[] = [];
  @Input() automationType: string;
  @Input() selectedScript: any;
  @Input() data: any;
  @Output() statusName: EventEmitter<any> = new EventEmitter<any>();
  @Output() automationTypeEmit: EventEmitter<string> = new EventEmitter<string>();

  constructor(private action: Action) { }

  statusList: StatusVO[] = [];

  ngOnInit(): void {
    if (this.automationType === 'status') {
      this.statusList = this.taskboardStatus;
    } else {
      let array: any[] = [{ name: 'Todo', color: '#87cefa' },
      { name: 'Progress', color: 'rgb(255, 209, 93)' },
      { name: 'Done', color: '#20b2aa' }];
      this.statusList = array;
    }
  }

  getStatusName(status: StatusVO): void {
    if (this.automationType === 'status' && this.selectedScript.keyValuePair.status !== undefined && this.selectedScript.keyValuePair.status !== null && this.selectedScript.keyValuePair.status !== '') {
      const statusIndex = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.status);
      this.selectedScript.words[statusIndex] = status.name;
      this.selectedScript.keyValuePair.status = status.name;
      this.selectedScript.keyValuePair.value = status.name;
      this.selectedScript.keyValuePair.color = this.action.getColor('status', status.name, this.data);
      this.automationTypeEmit.emit('task field');
    } else {
      this.statusName.emit(status.name);
    }
  }
}
