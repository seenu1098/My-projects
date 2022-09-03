import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
// import { UserManagementComponent, YorogridComponent } from '../../public-api';
import { UserManagementComponent } from '../user-management/user-management.component';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';

@Component({
  selector: 'lib-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  constructor(private userManagement: UserManagementComponent) { }

  @ViewChild('gridConfig', { static: true }) gridConfig: YorogridComponent;

  @Output() isEvent = new EventEmitter<any>();

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
