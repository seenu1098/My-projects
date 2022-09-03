import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AdhocTaskService } from './adhoc-task.service';
import { AdhocTask } from './VO/adhoc-task-vo';
import { ProcessInstanceListVO } from '../../ProcessInstanceListVO';
import { TaskComponent } from '../../task/task.component';
import * as moment from 'moment';
export interface DialogData {
  title: string;
  description: string;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-addtask',
  templateUrl: './addtask.component.html',
  styleUrls: ['./addtask.component.scss']
})
export class AddtaskComponent {
  weeks = [];
  adhocTask = new AdhocTask();
  processInstanceList: ProcessInstanceListVO;
  connectedTo = [];
  assignee: [] = [];
  assigneejoin = '';
  headers = [
    'To do',
    'In Progress',
    'Code Review',
    'Testing',
    'Done',
    'Accepted'
  ];

  constructor(public dialog: MatDialog, private datePipe: DatePipe, private adhocTaskService: AdhocTaskService) {
    this.adhocTaskService.getAdhocTaskList().subscribe(dataa => {
      this.processInstanceList = dataa;
      this.fetchBoard(this.processInstanceList);
    });

    this.weeks = [
      {
        id: 'To do',
        weeklist: []
      }, {
        id: 'In Progress',
        weeklist: [
        ]
      }, {
        id: 'Code Review',
        weeklist: [
        ]
      }, {
        id: 'Testing',
        weeklist: [
        ]
      }, {
        id: 'Done',
        weeklist: [
        ]
      }, {
        id: 'Accepted',
        weeklist: [
        ]
      }
    ];
    for (const week of this.weeks) {
      this.connectedTo.push(week.id);
    }
  }

  fetchBoard(processInstanceList) {
    this.weeks.forEach(params => {
      processInstanceList.forEach(list => {
        if (params.id === list.status) {
          params.weeklist.push(list);
        }
      });
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(TaskComponent, {
      width: '800px',
      height: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.weeks.forEach(params => {
          if (params.id === result.status) {
            params.weeklist.push(result);
          }

        });
      }
    });
  }

  editDialog(id) {
    const dialogRef = this.dialog.open(TaskComponent, {
      width: '800px',
      height: '500px',
      data: id
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }

    event.container.data.forEach((params: any) => {
      if (params.status !== event.container.id) {
        params.status = event.container.id;
        this.adhocTask = params;
        const jsonData = JSON.stringify(this.adhocTask);
        this.adhocTask.files = new FormData();
        this.adhocTask.files.append('adhocTask', jsonData);
        this.adhocTaskService.createAdhocTask(this.adhocTask).subscribe(data => {
        });
      }
    });

  }
  titleCase(str) {
    const assignee = str.split(' ');
    for (let i = 0; i < assignee.length; i++) {
      assignee[i] = assignee[i].charAt(0).toUpperCase();
    }
    return assignee.join('');
  }

  getBrowsertime(utcTime) {
    if (utcTime !== undefined && utcTime !== null && utcTime !== '') {
    return moment.utc(utcTime).toDate();
    } else {
      return utcTime;
    }
  }
}


// @Component({
//   // tslint:disable-next-line:component-selector
//   selector: 'app-task',
//   templateUrl: './task.component.html',
// })
// export class ExampleDialogComponent {
//   constructor(
//     public dialogRef: MatDialogRef<ExampleDialogComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

//   onNoClick(): void {
//     this.dialogRef.close();
//   }
// }
