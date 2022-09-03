import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { ThemeService } from 'src/app/services/theme.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { LoaderService } from '../shared/service/form-service/loader-service';
import { NavService } from '../shared/service/nav.service';
import { Menu } from './menu-list.vo';


@Component({
  selector: 'lib-menu-list-item',
  templateUrl: './menu-list-item.component.html',
  styleUrls: ['./menu-list-item.component.css'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(-90deg)' })),
      state('expanded', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class MenuListItemComponent implements OnInit {
  expanded = false;
  menuName = undefined;
  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() menu: Menu;
  @Input() depth: number;
  @Input() menuOptions: Menu[];
  @Input() child: boolean;

  url: any;
  show: any;
  left = false;
  width: any;
  isMobile: boolean;
  reportUrl: any;

  constructor(public navService: NavService, private loaderService: LoaderService, private changeDetectorRef: ChangeDetectorRef,
    public router: Router, private themeService: ThemeService, private workspaceService: WorkspaceService) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 300) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  ngOnInit() {
    let reportUrlSplit;
    if (window.location.pathname.includes('get-report/')) {
      reportUrlSplit = window.location.pathname.split('/');
      this.reportUrl = reportUrlSplit[2];
    }
    this.setDefaultStyle(window.location.pathname.substring(1), this.reportUrl);
    if (!this.child) {
      this.setDefaultMenuOpen(window.location.pathname.substring(1));
    }
    this.router.events.subscribe(data => {
      if (data) {
        if (window.location.pathname.includes('get-report/')) {
          reportUrlSplit = window.location.pathname.split('/');
          this.reportUrl = reportUrlSplit[2];
        }
        this.setDefaultStyle(window.location.pathname.substring(1), this.reportUrl);
      }
    });
    if (window.innerWidth <= 300) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    if (this.depth > 1) {
      this.left = true;
    }
    // interval(500).subscribe((val) => {
    //   this.setDefaultStyle(window.location.pathname.substring(1));
    // });
    this.show = this.loaderService.showLoader;
    this.navService.currentUrl.subscribe((url: string) => {
      if (this.menu.menuPath && url) {
        this.expanded = url.indexOf(`/${this.menu.menuPath}`) === 0;
        this.ariaExpanded = this.expanded;
      }
    });
  }

  onItemSelected(menu: Menu) {
    if (!menu.dynamicMenus || !menu.dynamicMenus.length) {
         
      const routeUrl = this.router.url;
      if (routeUrl.includes('/app') && !routeUrl.includes('/app-layout') && !routeUrl.includes('/application-dashboard')
        && !routeUrl.includes('app/edit') && !routeUrl.includes('/app/create') && !routeUrl.includes('/create/page')) {
        this.menuOptions.forEach(parentMenu => {
          if (parentMenu.version !== null && parentMenu.pageId !== null && !routeUrl.includes('/page')) {
            this.router.navigateByUrl(routeUrl + '/page/' + parentMenu.pageId + '/' + parentMenu.version);
          } else if (routeUrl.includes('/app') && parentMenu.dynamicMenus !== null && !routeUrl.includes('page')) {
            parentMenu.dynamicMenus.forEach(childMenu => {
              if (childMenu.version !== null && childMenu.pageId !== null) {
                this.router.navigateByUrl(routeUrl + '/page/' + childMenu.pageId + '/' + childMenu.version);
              }
            });

          }
          else {
            if (menu.menuPath == 'workflow') {
              this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/yoroflow-design/' + menu.menuPath]);
            }
            else {
              this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + menu.menuPath]);
            }
          }
        });
      } else if (menu.menuPath === ('get-report')) {
        if (routeUrl.includes('/get-report/')) {
          this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() + '/yoroflow-design/get-report/' + menu.reportId);
        } else {
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + menu.menuPath + '/' + menu.reportId]);
        }
        this.setStyle(menu);
      }  else if (menu.menuPath == 'workflow') {
        this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/yoroflow-design/' + menu.menuPath]);

      }
      else if (menu.menuPath == 'report-config') {
        this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/yoroflow-design/' + menu.menuPath]);

      }
       else {
        if (menu.menuName == 'Taskboard') {
          this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() + '/task/' + menu.menuPath);
        }
        else if (menu.menuName == 'My Tasks') {
          this.router.navigateByUrl(this.workspaceService.getWorkSpaceKey() + '/mytask/' + menu.menuPath);
        } 
        else{
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + menu.menuPath]);

        }
        this.setStyle(menu);
      }
    }
    if (menu.dynamicMenus && menu.dynamicMenus.length) {
      this.expanded = !this.expanded;
      this.setExpand(menu);
    }
  }

  setExpand(menu: Menu) {
    if (this.menuOptions.some(menuItem => menuItem.id === menu.id)) {
      for (let i = 0; i < this.menuOptions.length; i++) {
        if (this.menuOptions[i].id === menu.id) {
          if (this.menuOptions[i].openPanel === true) {
            this.menuOptions[i].openPanel = false;
            if (this.menuOptions[i].dynamicMenus && this.menuOptions[i].dynamicMenus.length) {
              for (let j = 0; j < this.menuOptions[i].dynamicMenus.length; j++) {
                this.menuOptions[i].dynamicMenus[j].openPanel = false;
              }
            }
          } else {
            this.menuOptions[i].openPanel = true;
          }
        } else {
          this.menuOptions[i].openPanel = false;
          if (this.menuOptions[i].dynamicMenus && this.menuOptions[i].dynamicMenus.length) {
            for (let j = 0; j < this.menuOptions[i].dynamicMenus.length; j++) {
              this.menuOptions[i].dynamicMenus[j].openPanel = false;
            }
          }
        }
      }
    } else {
      for (let i = 0; i < this.menuOptions.length; i++) {
        if (this.menuOptions[i].dynamicMenus && this.menuOptions[i].dynamicMenus.length
          && this.menuOptions[i].dynamicMenus.some(menuItem => menuItem.id === menu.id)) {
          for (let j = 0; j < this.menuOptions[i].dynamicMenus.length; j++) {
            if (this.menuOptions[i].dynamicMenus[j].id === menu.id) {
              if (this.menuOptions[i].dynamicMenus[j].openPanel === true) {
                this.menuOptions[i].dynamicMenus[j].openPanel = false;
              } else {
                this.menuOptions[i].dynamicMenus[j].openPanel = true;
              }
            } else {
              this.menuOptions[i].dynamicMenus[j].openPanel = false;
            }
          }
        }
      }
    }
  }

  setStyle(menu) {
    if (menu.id) {
      for (let i = 0; i < this.menuOptions.length; i++) {
        if (this.menuOptions[i].style !== null) {
          this.menuOptions[i].style = null;
        }
        if (this.menuOptions[i].dynamicMenus !== null) {
          for (let j = 0; j < this.menuOptions[i].dynamicMenus.length; j++) {
            if (this.menuOptions[i].dynamicMenus[j].dynamicMenus !== null) {
              for (let l = 0; l < this.menuOptions[i].dynamicMenus[j].dynamicMenus.length; l++) {
                if (this.menuOptions[i].dynamicMenus[j].dynamicMenus[l].style !== null) {
                  this.menuOptions[i].dynamicMenus[j].dynamicMenus[l].style = null;
                }
              }
            }
          }
        }
        if (this.menuOptions[i].dynamicMenus !== null) {
          for (let l = 0; l < this.menuOptions[i].dynamicMenus.length; l++) {
            if (this.menuOptions[i].dynamicMenus[l].style !== null) {
              this.menuOptions[i].dynamicMenus[l].style = null;
            }
          }
        }
      }
      this.menuOptions.forEach(menuItem => {
        if (menuItem.menuPath !== '' && menuItem.menuPath !== null && menuItem.menuPath !== undefined && menuItem.id === menu.id && menuItem.menuPath === menu.menuPath) {
          menuItem.style = "background-color:"+this.themeService.primaryColor+";color:white;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%";
          return true;
        }
        if (menuItem.dynamicMenus !== null) {
          menuItem.dynamicMenus.forEach(subMenu => {
            if (subMenu.menuPath !== '' && subMenu.menuPath !== null && subMenu.menuPath !== undefined
              && menu.id === subMenu.id && subMenu.reportId === null) {
              subMenu.style = "background-color:"+this.themeService.primaryColor+";color:white;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%";
              return true;
            } else if (subMenu.menuPath !== '' && subMenu.menuPath !== null && subMenu.menuPath !== undefined
              && menu.id === subMenu.id && subMenu.reportId === menu.reportId) {
              subMenu.style = "background-color:"+this.themeService.primaryColor+";color:white;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%";
              return true;
            }
            if (subMenu.dynamicMenus !== null) {
              subMenu.dynamicMenus.forEach(child => {
                if (child.menuPath !== '' && child.menuPath !== null && child.menuPath !== undefined && menu.id === child.id && menu.menuPath === child.menuPath) {
                  child.style = "background-color:"+this.themeService.primaryColor+";color:white;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%";
                  return true;
                }
              });
            }
          });
        }
      });
    }
  }

  setDefaultStyle(menuPath, reportId) {
    for (let i = 0; i < this.menuOptions.length; i++) {
      if (this.menuOptions[i].style !== null) {
        this.menuOptions[i].style = null;
      }
      if (this.menuOptions[i].dynamicMenus !== null) {
        for (let j = 0; j < this.menuOptions[i].dynamicMenus.length; j++) {
          if (this.menuOptions[i].dynamicMenus[j].dynamicMenus !== null) {
            for (let l = 0; l < this.menuOptions[i].dynamicMenus[j].dynamicMenus.length; l++) {
              if (this.menuOptions[i].dynamicMenus[j].dynamicMenus[l].style !== null) {
                this.menuOptions[i].dynamicMenus[j].dynamicMenus[l].style = null;
              }
            }
          }
        }
      }
      if (this.menuOptions[i].dynamicMenus !== null) {
        for (let l = 0; l < this.menuOptions[i].dynamicMenus.length; l++) {
          if (this.menuOptions[i].dynamicMenus[l].style !== null) {
            this.menuOptions[i].dynamicMenus[l].style = null;
          }
        }
      }
    }
    this.menuOptions.forEach(menuItem => {
      if (menuItem.menuPath !== null && menuItem.menuPath !== '' && menuItem.menuPath !== undefined && menuItem.menuPath === menuPath) {
        menuItem.style = "background-color:"+this.themeService.primaryColor+";color:white;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%";
        return true;
      }
      if (menuItem.dynamicMenus !== null) {
        menuItem.dynamicMenus.forEach(subMenu => {
          if (subMenu.menuPath !== '' && subMenu.menuPath !== null && subMenu.menuPath !== undefined && menuPath === subMenu.menuPath
            && !menuPath.includes('get-report')) {
            subMenu.style = "background-color:"+this.themeService.primaryColor+";color:white;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%";
            return true;
          } else if (subMenu.menuPath !== '' && subMenu.menuPath !== null && subMenu.menuPath !== undefined
            && subMenu.reportId !== '' && subMenu.reportId !== null && subMenu.reportId !== undefined
            && menuPath.includes('get-report') && reportId === subMenu.reportId) {
            subMenu.style = "background-color:"+this.themeService.primaryColor+";color:white;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%";
            return true;
          }
          if (subMenu.dynamicMenus !== null) {
            subMenu.dynamicMenus.forEach(child => {
              if (child.menuPath !== '' && child.menuPath !== null && child.menuPath !== undefined && menuPath === child.menuPath) {
                child.style = "background-color:"+this.themeService.primaryColor+";color:white;border-top-right-radius: 20px;border-bottom-right-radius: 20px;width:96%";
                return true;
              }
            });
          }
        });
      }
    });
  }


  setDefaultMenuOpen(menuPath) {
    this.menuOptions.forEach(menuItem => {
      if (menuItem.dynamicMenus !== null) {
        menuItem.dynamicMenus.forEach(subMenu => {
          if (subMenu.menuPath !== '' && subMenu.menuPath !== null && subMenu.menuPath !== undefined && menuPath === subMenu.menuPath) {
            menuItem.openPanel = true;
            return true;
          }
          if (subMenu.dynamicMenus !== null) {
            subMenu.dynamicMenus.forEach(child => {
              if (child.menuPath !== '' && child.menuPath !== null && child.menuPath !== undefined && menuPath === child.menuPath) {
                subMenu.openPanel = true;
                menuItem.openPanel = true;
                return true;
              }
            });
          }
        });
      }
    });
  }

  ngAfterViewChecked() {
    // tslint:disable-next-line:prefer-const
    let show = this.loaderService.showLoader;
    if (show !== this.show) {
      if (show === true) {
        let URL;
        let reportUrlSplit;
        URL = window.location.pathname.split('/', 2);
        this.url = URL[1];
        if (window.location.pathname.includes('get-report/')) {
          reportUrlSplit = window.location.pathname.split('/');
          this.reportUrl = reportUrlSplit[2];
        }
        this.setDefaultStyle(this.url, this.reportUrl);
      }
      this.changeDetectorRef.detectChanges();
    }
  }
}
