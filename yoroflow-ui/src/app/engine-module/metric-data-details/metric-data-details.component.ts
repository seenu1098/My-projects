import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-metric-data-details',
  templateUrl: './metric-data-details.component.html',
  styleUrls: ['./metric-data-details.component.css']
})
export class MetricDataDetailsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  receiveMessage($event) {
    // const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
    //   width: '800px',
    //   data: $event.col7
    // });
  }
}
