import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LandingPageService } from 'src/app/engine-module/landing-page/landing-page.service';
import { TasklistService } from 'src/app/engine-module/tasklist.service';
import { ThemeService } from 'src/app/services/theme.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { MyTaskService } from '../mytasks/my-task.service';

export interface Tab {
  name: string;
  value: string;
  isSelected: boolean;
  icon: string;
}

@Component({
  selector: 'app-my-request-routing',
  templateUrl: './my-request-routing.component.html',
  styleUrls: ['./my-request-routing.component.scss']
})
export class MyRequestRoutingComponent implements OnInit {

  constructor(private landingPageService: LandingPageService, private workspaceService: WorkspaceService,
    private router: Router, public taskListService: TasklistService, private myTaskService: MyTaskService,
    public themeService: ThemeService) { }

  @Output() public myTaskEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  tabList: Tab[] = [
    { name: 'My Requests', value: 'my-request', isSelected: true, icon: 'request_page' },
    { name: 'My Tasks', value: 'my-task', isSelected: false, icon: 'inventory' },
    { name: 'My Submitted Requests', value: 'my-submitted-request', isSelected: false, icon: 'assignment_ind' },
    { name: 'Data Table', value: 'data-table', isSelected: false, icon: 'app_registration' }
  ];
  selectedTab = 'my-request';
  show = true;
  myTasksCount: any;
  countInterval: any;
  isWorkspace = false;

  groupByName = 'Current Workspace';
  groupByList: any[] = [
    { name: 'Current Workspace', value: 'current' },
    { name: 'All Workspace', value: 'all' },
  ];
  screenHeight: any;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadDynamicLayout();
  }

  ngOnInit(): void {
    this.myTaskEmitter.emit(false);
    this.workspaceService.setHideHover(false);
    this.workspaceService.setHideSubMenu(true);
    this.workspaceService.setActiveElement('My Requests');
    this.myTaskService.invokeWorkspaceTasksEmit(false);
    this.landingPageService.workSpaceSwitchEmitter.subscribe(data => {
      this.show = false;
      setTimeout(() => {
        this.show = true;
      }, 500);
    });
    // this.loadCount();
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    })
  }

  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'modern') {
      this.screenHeight = (window.innerHeight - 1);
    } else {
      this.screenHeight = (window.innerHeight - 63);
    }
  }

  getCount(): void {
    this.taskListService.setMyTaskCount();
  }

  loadCount(): void {
    this.countInterval = Observable.interval(30000).subscribe(() => {
      this.getCount();
      this.router.events.subscribe(data => {
        if (data) {
          this.countInterval.unsubscribe();
        }
      });
      if (!window.location.href.includes('/my-pending-task')) {
        this.countInterval.unsubscribe();
      }
    });
  }

  workspaceSelect(groupBy: any): void {
    this.groupByName = groupBy.name;
    if (this.countInterval) {
      this.countInterval.unsubscribe();
    }
    this.isWorkspace = groupBy.value === 'all' ? true : false;
    this.myTaskService.invokeWorkspaceTasksEmit(this.isWorkspace);
    this.getCount();
    this.loadCount();
  }

  tabChange(tab: Tab): void {
    this.selectedTab = tab.value;
    this.tabList.forEach(t => { t.isSelected = false; });
    tab.isSelected = true;
    if (tab.name === 'My Tasks') {
      this.myTaskEmitter.emit(true);
    } else {
      this.myTaskEmitter.emit(false);
    }
  }
}
