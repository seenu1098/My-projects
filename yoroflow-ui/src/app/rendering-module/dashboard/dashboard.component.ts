import { Component, OnInit } from '@angular/core';
import { Application } from '../application-provision/appication-vo';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from './dashboard.service';
import { RenderingConfirmDialogBoxComponent } from '../rendering-confirm-dialog-box-component/rendering-confirm-dialog-box-component.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatRightSheet } from 'mat-right-sheet';
import { YoroSecurityComponent } from '../yoro-security/yoro-security.component';
import decode from 'jwt-decode';
import { AppIdList } from './app-id-list-vo';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(private service: DashboardService, private router: Router,
    private dialog: MatDialog, private sanitizer: DomSanitizer, private snackBar: MatSnackBar, private rightSheet: MatRightSheet,) {
    this.isMobile = window.matchMedia('only screen and (max-width: 720px)').matches;
    if (window.matchMedia('only screen and (max-width: 768px)').matches
      || window.matchMedia('only screen and (max-width: 1024px)').matches) {
      this.isTablet = true;
    } else {
      this.isTablet = false;
    }
  }

  applicationsList: Application[] = [];
  showButton = false;
  image: any = '';
  applicationIdList = new Set();
  appIdList = new AppIdList();
  show = false;
  isMobile: boolean;
  isTablet: boolean;
  ngOnInit() {
    this.getApplicationList();
    this.enableCreateApplication();
  }

  setBackground(i): string {
    if (i % 2 === 0) {
      return '#4caf50';
    } else {
      return '#039be5';
    }
  }

  getApplicationList() {
    this.service.getApplicationList().subscribe(data => {
      this.applicationsList = data;
      this.show = true;
      this.getApplicationPermissionList(this.applicationsList);
    });
  }

  getApplicationPermissionList(appList) {
    if (appList.length > 0) {
      this.appIdList.applicationList = appList;
      this.service.getApplicationPermission(this.appIdList).subscribe(data => {
        this.applicationsList = data;
        this.getApplicationLogo(this.applicationsList);
      });
    }
  }

  getApplicationLogo(appList) {
    if (appList.length > 0) {
      this.applicationsList.forEach(app => {
        this.applicationIdList.add(app.applicationId);
      });
      this.applicationIdList.forEach(id => this.appIdList.applicationIdList.push(id));
      if (this.appIdList !== null && this.appIdList.applicationIdList.length > 0) {
        this.service.getApplicationLogo(this.appIdList).subscribe(data => {
          if (data !== null && data.length > 0) {
            data.forEach(appId => {
              this.applicationsList.filter(a => a.applicationId === appId.applicationId).forEach(params => {
                params.image = appId.logo;
              });
            });
          }
        });
      }
    }
  }

  transformImage(profilePicture) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
  }

  enableCreateApplication() {
    const token = localStorage.getItem('token');
    // decode the token to get its payload
    const tokenPayload = decode(token);
    if (tokenPayload.user_role.some(userRole => userRole === 'app/create')) {
      this.showButton = true;
    } else {
      this.showButton = false;
    }
  }

  appCreate() {
    this.router.navigate(['/app/create']);
  }


  getApplication(id: string) {
    this.router.navigate(['app/edit', id]);
  }
  createUsers() {
    this.router.navigate(['user/create']);
  }

  manageUsers(id: number) {
    this.router.navigate(['user/management', { id: id }]);
  }

  // launchApplication(id: number) {
  //   this.router.navigate(['app/launch', id]);
  // }

  launchApplication(id) {
    this.applicationsList.forEach(fields => {
      if (fields.applicationId === id) {
        if (fields.leftMenuId === null && fields.rightMenuId === null
          && fields.bottomMenuId === null && fields.topMenuId === null) {
          const dialog = this.dialog.open(RenderingConfirmDialogBoxComponent, {
            width: '450px',
            data: 'noMenu'
          });
        } else {
          const url = this.router.serializeUrl(
            this.router.createUrlTree(['app/', id])
          );
          // window.open(url, '_blank');
          this.router.navigate([]).then(result => { window.open(url, '_blank'); });
        }
      }
    });
  }

  openApplicationPermissions(appId) {
    const pagePermissionsSheet = this.rightSheet.open(YoroSecurityComponent, {
      disableClose: true,
      data: { id: appId, securityType: 'application' },
      panelClass: 'dynamic-right-sheet-container',
    });

    pagePermissionsSheet.instance.onAdd.subscribe(data => {
      if (data === true) {
        this.getApplicationList();
      }
    });
  }

  deleteApplication(application: Application) {
    const dialogRef = this.dialog.open(RenderingConfirmDialogBoxComponent, {
      width: '550px',
      data: { type: 'delete-application', name: application.applicationName }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data.submit === true) {
        this.service.deleteApplication(data.applicationName).subscribe(response => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: response.response,
          });
          if (response.response.includes('deleted successfully')) {
            this.ngOnInit();
          }
        });
      }
    });
  }
}
