import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WorkspaceListVO, WorkspaceVO } from '../create-dialog/create-dialog-vo';
import { CreateDialogService } from './create-dialog.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { UserRoleService } from 'src/app/shared-module/services/user-role.service';
@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  workspaceID: any;
  workspace: any;
  workspaceAvatar: string;
  userRoles: any;
  workspaceListVO: WorkspaceListVO[];
  hideSubMenu = false;
  hideHover = false;
  notificationSelected = false;
  lastRedirectUrl: string;
  activeElement: string;
  @Output() public myRequestEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private service: UserRoleService, private http: HttpClient, private createDialogService: CreateDialogService, private router: Router,
    private snackbar: MatSnackBar) { }

  setWorkspaceID(workspaceID) {
    this.workspaceID = workspaceID;
  }

  setHideSubMenu(value: boolean) {
    this.hideSubMenu = value;
  }

  setActiveElement(activeElement) {
    this.myRequestEmitter.emit(activeElement);
  }

  setHideHover(value: boolean) {
    this.hideHover = value;
  }

  setNotificationSelected(value: boolean) {
    this.notificationSelected = value;
  }

  getWorkspaceID() {
    return this.workspaceID;
  }

  getAvatar(): string {
    return this.workspace.workspaceAvatar;
  }

  getWorkSpaceName(): string {
    return this.workspace.workspaceName;
  }

  getWorkSpaceKey(): string {
    return this.workspace.workspaceUniqueId.toLowerCase().replace(/ /g, '');
  }

  getFirstLetter(): string {
    const val = this.workspace.workspaceName.replace(/ /g, '');
    return val.charAt(0).toUpperCase();
  }

  setWorkspaceVO(workspace: WorkspaceListVO) {
    localStorage.setItem('currentWorkspace', workspace.workspaceUniqueId);
    this.workspace = workspace;
  }

  getWorkspaceVO() {
    return this.workspace;
  }

  getDefaultWorksapce(type: string): any {
    this.userRoles = this.service.getUserRoles();
    let url = null;
    if (localStorage.getItem('currentWorkspace') && localStorage.getItem('currentWorkspace') !== null
      && localStorage.getItem('currentWorkspace') !== '' && localStorage.getItem('currentWorkspace') !== 'null') {
      url = localStorage.getItem('currentWorkspace');
    } else {
      url = 'default-workspace';
    }
    this.createDialogService.getDefaultWorkspace(url).subscribe(data => {
      if (data) {
        this.workspace = data;
        this.workspaceID = this.workspace.workspaceId;
        localStorage.setItem('currentWorkspace', this.workspace.workspaceUniqueId);
        if (type === 'fromLogin') {
          if (!window.location.href.includes('localhost') && localStorage.getItem('lastRedirectUrl') && localStorage.getItem('lastRedirectUrl') !== null
            && localStorage.getItem('lastRedirectUrl') !== '' && localStorage.getItem('lastRedirectUrl') !== '/' && localStorage.getItem('lastRedirectUrl') !== 'null'
            && localStorage.getItem('redirectSubdomainName') && localStorage.getItem('redirectSubdomainName') !== null
            && localStorage.getItem('redirectSubdomainName') !== ''
            && localStorage.getItem('redirectSubdomainName') !== 'null') {
            const redirectUrl = localStorage.getItem('lastRedirectUrl');
            const subdomain = localStorage.getItem('redirectSubdomainName');
            localStorage.removeItem('lastRedirectUrl');
            localStorage.removeItem('redirectSubdomainName');
            if (redirectUrl && redirectUrl !== null && this.allowRedirectUrl(redirectUrl) && subdomain && subdomain !== null) {
              const arrOfStr = window.location.href.split('//', 2);
              const urls = arrOfStr[1].split('.', 2);
              const redirectUrls = arrOfStr[1];
              const domain = urls[0];
              if (subdomain === domain) {
                this.router.navigate([redirectUrl]);
              } else {
                this.redirectRoutes();
              }
            } else {
              this.redirectRoutes();
            }
          } else {
            this.redirectRoutes();
          }
        }
        return true;
      }
    }, error => {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: 'Internal server error'
      });
      return true;
    });
    this.loadWorkspaceList();
  }

  allowRedirectUrl(url) {
    let allowRedirect = false;
    if (url.includes('/login') || url.includes('/domain') || url.includes('subscription')
      || url.includes('expire-dialog')) {
      allowRedirect = false;
    } else {
      allowRedirect = true;
    }
    return allowRedirect;
  }

  redirectRoutes() {
    if (this.userRoles && this.userRoles.length === 1 && this.userRoles[0] === 'Billing Administrator') {
      this.router.navigate(['subscription']);
    }
    else if (this.userRoles && this.userRoles.length === 1 && this.userRoles[0] === 'Application Administrator') {
      this.router.navigate(['application-dashboard']);
    }
    else if (this.userRoles && this.userRoles.length === 1 && this.userRoles[0] === 'User Administrator') {
      this.router.navigate(['user-management']);
    }
    else if (this.userRoles.length === 2 && this.userRoles.includes('Billing Administrator') && this.userRoles.includes('Application Administrator')) {
      this.router.navigate(['application-dashboard']);
    }
    else if (this.userRoles.length === 2 && this.userRoles.includes('Billing Administrator')
      && this.userRoles.includes('User Administrator')) {
      this.router.navigate(['user-management']);
    }
    else if (this.userRoles.length === 2 && this.userRoles.includes('Application Administrator') && this.userRoles.includes('User Administrator')) {
      this.router.navigate(['application-dashboard']);
    }
    else if (this.userRoles.length === 3 && this.userRoles.includes('Billing Administrator') && this.userRoles.includes('Application Administrator') && this.userRoles.includes('User Administrator')) {
      this.router.navigate(['application-dashboard']);
    }
    else {
      this.router.navigate([this.workspace.workspaceUniqueId + '/mytask/my-pending-task']);
    }
  }

  loadWorkspaceList(): void {
    this.createDialogService.listAllWorkspaceList().subscribe(res => {
      this.workspaceListVO = res;
    });
  }

  getWorkspaceListVO(): WorkspaceListVO[] {
    return this.workspaceListVO;
  }

  setlastRedirectUrl(url) {
    this.lastRedirectUrl = url;
    localStorage.setItem('lastRedirectUrl', url);
  }
}
