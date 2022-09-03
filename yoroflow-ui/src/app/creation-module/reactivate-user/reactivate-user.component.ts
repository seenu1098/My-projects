import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { UserManagementComponent } from '../user-management/user-management.component';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';

@Component({
  selector: 'lib-reactivate-user',
  templateUrl: './reactivate-user.component.html',
  styleUrls: ['./reactivate-user.component.css']
})
export class ReactivateUserComponent implements OnInit {
  @Output() isEvent = new EventEmitter<any>();
  constructor(private userManagement: UserManagementComponent) { }

  @ViewChild('grid', { static: true }) grid: YorogridComponent;

  ngOnInit() {
    this.userManagement.refreshGrid.subscribe(data => {
      if (data === true) {
        this.grid.refreshGrid();
      }
    });
  }

  receiveMessage(event): void {
    this.isEvent.emit(event);
  }

}
