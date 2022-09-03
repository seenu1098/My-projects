import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LabelsDialogComponent } from '../../labels-dialog/labels-dialog.component';
import { LabelsVO } from '../../taskboard-form-details/taskboard-task-vo';

@Component({
  selector: 'automation-label',
  templateUrl: './automation-label.component.html',
  styleUrls: ['./automation-label.component.scss']
})
export class AutomationLabelComponent implements OnInit {

  @Input() labels: LabelsVO[] = [];
  @Input() taskboardId: string;
  @Output() labelName: EventEmitter<any> = new EventEmitter<any>();
  @Output() labelsList: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.labels === undefined || this.labels === null) {
      this.labels = [];
    }
  }

  getLabelName(label: LabelsVO): void {
    this.labelName.emit(label.labelName);
  }

  addLabels(): void {
    const dialog = this.dialog.open(LabelsDialogComponent, {
      disableClose: true,
      width: '450px',
      maxHeight: '600px',
      data: {
        taskboardId: this.taskboardId,
        eventAutomation: true,
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.labels = data.labels;
        this.labelsList.emit(data.taskboardLabels);
      }
    });
  }
}
