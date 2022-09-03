import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../shared/service/user-service';
import { UserVO } from '../shared/vo/user-vo';
import { Router } from '@angular/router';
import { MenuDetailsVO } from '../shared/vo/menu-vo';
import { DynamicMenuService } from '../dynamic-menu/dynamic-menu.service';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { Field } from '../shared/vo/page-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'app-dynamic-menu-tab',
  templateUrl: './dynamic-menu-tab.component.html',
  styleUrls: ['./dynamic-menu-tab.component.css']
})
export class DynamicMenuTabComponent implements OnInit {

  @Input() menuId: any;
  @Input() menuType: string;
  @Input() passingParameterFormGroup: any;
  @Input() parameterControlName: any;

  @Output() isMenuCreated: EventEmitter<any> = new EventEmitter<any>();

  parameterControlValue: any;
  menuOptions: MenuDetailsVO[] = [];
  userVo = new UserVO();
  routerUrl: string;
  nestMenu: string;
  selected: string;
  logoUrl: any;
  showLogo = true;
  show = false;


  constructor(private dynamicMenuService: DynamicMenuService, private snackBar: MatSnackBar
    , private service: UserService, private router: Router, private workspaceService: WorkspaceService) {
    this.selected = 'en';
    
  }

  options = [
    {
      name: 'English',
      value: 'en'
    },
    {
      name: 'French',
      value: 'fr'
    }
  ];

  test = [];

  // translater() {
  //   this.translate.use(this.selected);
  // }

  ngOnInit() {
    this.getMenu();
    if (this.passingParameterFormGroup) {
      this.passingParameterFormGroup.get(this.parameterControlName).valueChanges.subscribe(data => {
        this.parameterControlValue = data;
      });
    }
  }

  checkParametersExist() {
    if (this.passingParameterFormGroup && !this.passingParameterFormGroup.get(this.parameterControlName).value) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Please select value',
      });
    }
  }

  getMenu() {
    this.dynamicMenuService.getAllMenusDetails(this.menuId).subscribe(
      data => {
        this.menuOptions = data;
        this.isMenuCreated.emit('true');
      }
    );
  }

  getLoggedInUser() {
    this.service.getLoggedInUserDetails().subscribe(data => {
      this.userVo = data;
    });
  }

  loadApplicationLogo() {
    // if (this.application.logo === null) {
    //   this.showLogo = false;
    // } else {
    //   this.logoUrl = 'data:image/png;base64,' + this.application.logo;
    // }

  }

  logout() {
    this.service.logout();
    this.router.navigate(['/login']);
  }

  openPage(pageId) {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/pa', pageId]);
  }

}
