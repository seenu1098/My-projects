import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { LandingPageService } from 'src/app/engine-module/landing-page/landing-page.service';
import { TasklistService } from 'src/app/engine-module/tasklist.service';
import { NotificationServices } from 'src/app/message-module/notification/notification.service';
import { TranslateConfigService } from 'src/app/services/core/translate/translate-config.service';
import { ThemeService } from 'src/app/services/theme.service';
import { ConfirmationDialogComponent } from 'src/app/workspace-module/confirmation-dialog/confirmation-dialog.component';
import { WorkspaceListVO } from 'src/app/workspace-module/create-dialog/create-dialog-vo';
import { CreateDialogComponent } from 'src/app/workspace-module/create-dialog/create-dialog.component';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { UserService } from '../shared/service/user-service';
import { ThemeDialogComponent } from '../theme-dialog/theme-dialog.component';

@Component({
  selector: 'app-user-details-dialog',
  templateUrl: './user-details-dialog.component.html',
  styleUrls: ['./user-details-dialog.component.scss']
})
export class UserDetailsDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private router: Router, private dialog: MatDialog, private service: UserService, public themeService: ThemeService,
    private dialogRef: MatDialogRef<UserDetailsDialogComponent>, public workspaceService: WorkspaceService, private sanitizer: DomSanitizer, private translateService: TranslateConfigService,
    private landingPageService: LandingPageService, public notificationService: NotificationServices,
    private tasklistService: TasklistService) { }

  myOptions = {
    theme: 'dark',
    placement: 'right',
    hideDelay: 50
  };

  allLanguages = [
    {
      name: 'English',
      lang: 'en',
      href: '/en'
    },
    {
      name: 'Français',
      lang: 'fr',
      href: '/fr'
    },
    {
      name: 'Español',
      lang: 'es',
      href: '/es'
    }
  ];

  selectedLang: any;
  contextUrl: any;
  private readonly unsubscribe$: Subject<void> = new Subject();
  themeEmitter = new EventEmitter();
  notificationEmitter = new EventEmitter();
  darkThemeEmitter = new EventEmitter();

  ngOnInit(): void {
    this.notificationService.getNotificationCount().subscribe(data => {
      this.notificationService.setNotificationCount(data);
    });
    this.selectedLang = localStorage.getItem('translate_lang') ?? 'en';
    this.workspaceService.loadWorkspaceList();
    const matDialogConfig = new MatDialogConfig();
    matDialogConfig.position = { left: `55px`, bottom: `10px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (event: RouterEvent) => {
          this.contextUrl = event.url;
        }
      );
    this.contextUrl = this.router.url;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setUserProfilename(name): string {
    const val = name.replace(/ /g, '');
    return val.charAt(0).toUpperCase();
  }

  transformImage(profilePicture): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
  }

  userProfileValue(str): string {
    if (str) {
      const assignee = str.split(' ');
      for (let i = 0; i < assignee.length; i++) {
        assignee[i] = assignee[i].charAt(0).toUpperCase();
      }
      return assignee.join('');
    }
    return '';
  }

  createWorkspace(): void {
    const dialog = this.dialog.open(CreateDialogComponent, {
      disableClose: true,
      width: '50%',
      maxWidth: '50%',
      height: '45%',
      panelClass: 'config-dialog',
      data: {
        pageName: 'Taskboard Configuration',
        showNewConfig: true,
        fromScratch: true
      },
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.workspaceService.loadWorkspaceList();
      }
    });
  }

  openWorkspace(): void {
    this.dialogRef.close();
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + 'workspace/create']);
  }

  logout() {
    this.dialogRef.close();
    this.service.removeToken().subscribe(token => {
      this.service.logout();
      this.selectedLang = localStorage.getItem('translate_lang');
      localStorage.clear();
      localStorage.setItem('translate_lang', this.selectedLang);
      this.router.navigateByUrl('login');
    });
  }

  userProfile() {
    this.dialogRef.close();
    this.router.navigate(['user-profile']);
  }

  changeTheme(themeName: string): void {
    this.themeEmitter.emit(themeName);
    this.themeService.setTheme(themeName);
  }

  changeLanguage(language: string) {
    this.selectedLang = language;
    this.translateService.changeLanguage(language);
  }

  openNotification(): void {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/notification']);
    this.dialogRef.close();
  }

  switchWorkspace(workspaceVO: WorkspaceListVO): void {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { type: 'switchWorkspace', name: workspaceVO.workspaceName }
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === true) {
        this.workspaceService.setWorkspaceID(workspaceVO.workspaceId);
        this.workspaceService.setWorkspaceVO(workspaceVO);
        if (window.location.href.includes('my-pending-task')) {
          // window.location.reload();
          this.tasklistService.setMyTaskCount();
          this.landingPageService.invokeWorkspaceEmitter();
        } else {
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/mytask/my-pending-task']);
        }
        this.dialogRef.close();
      }
    });
  }

  darkTheme(event: MatSlideToggleChange): void {
    this.darkThemeEmitter.emit(event.checked);
  }

  openThemeDialog(): void {
    this.dialogRef.close();
    const dialog = this.dialog.open(ThemeDialogComponent, {
      width: '620px',
      disableClose: true
    });
  }

  gotoHome(): void {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/mytask/my-pending-task']);
  }

}
