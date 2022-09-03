import { Component, OnInit } from '@angular/core';
import { ProcessInstanceListService } from '../process-instance-list/process-instance-list.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';

@Component({
  selector: 'app-process-instance-failed-list',
  templateUrl: './process-instance-failed-list.component.html',
  styleUrls: ['./process-instance-failed-list.component.scss']
})
export class ProcessInstanceFailedListComponent implements OnInit {

  constructor(private processInstanceListService: ProcessInstanceListService, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  receiveMessage($event) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '800px',
      data: {data: $event.col7, type: 'error-task'}
    });
  }

}
