import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { UserManagementComponent } from '../user-management/user-management.component';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';

@Component({
  selector: 'lib-inactivate-user',
  templateUrl: './inactivate-user.component.html',
  styleUrls: ['./inactivate-user.component.css']
})
export class InactivateUserComponent implements OnInit {

  @Output() isEvent = new EventEmitter<any>();

  constructor(private userManagement: UserManagementComponent) { }

  @ViewChild('gridConfig', { static: true }) gridConfig: YorogridComponent;

  ngOnInit() {
    this.userManagement.refreshGrid.subscribe(data => {
      if (data === true) {
        this.gridConfig.refreshGrid();
      }
    });
  }

  receiveMessage(event): void {
    this.isEvent.emit(event);
  }

}
