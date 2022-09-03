import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '../engine-module/shared/service/user-service';
import { YoroFlowConfirmationDialogComponent } from '../engine-module/yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { WorkspaceService } from '../workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'app-initial-load',
  templateUrl: './initial-load.component.html',
  styleUrls: ['./initial-load.component.scss']
})
export class InitialLoadComponent implements OnInit {

  constructor(private workspaceService: WorkspaceService, private router: Router, 
    private service: UserService, private dialog: MatDialog) { }

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
     this.customAttribute();
    } else {
      this.router.navigate(['/login']);
    }
  }

  customAttribute() {
    this.service.checkCustomAttribute().subscribe(response => {
      if (response.response === 'Continue') {
        this.workspaceService.getDefaultWorksapce('fromLogin');
        // this.router.navigate(['/landing-dashboard']);
      } else {
        const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
          disableClose: true,
          data: { data: 'saveAttribute' },
          width: '400px',
          backdropClass: 'backdropBackground'
        });
        dialogRef.afterClosed().subscribe(attribute => {
          if (attribute === true) {
            this.workspaceService.getDefaultWorksapce('fromLogin');
            // this.router.navigate(['/landing-dashboard']);
          } else {
            if (localStorage.getItem('token')) {
              localStorage.removeItem('token');
            }
            this.router.navigate(['/login']);
          }
        });
      }
    },
    error => {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
      }
      this.router.navigate(['/login']);
    }
    );
  }

}
