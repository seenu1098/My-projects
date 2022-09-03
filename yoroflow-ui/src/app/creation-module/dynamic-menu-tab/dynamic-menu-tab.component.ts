import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../shared/service/user-service';
import { UserVO } from '../shared/vo/user-vo';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { Field } from '../shared/vo/page-vo';
import { MenuDetailsVO } from '../menu-configuration/menu-vo';
import { DynamicMenuService } from './dynamic-menu.service';

@Component({
  selector: 'app-dynamic-menu-tab',
  templateUrl: './dynamic-menu-tab.component.html',
  styleUrls: ['./dynamic-menu-tab.component.css']
})
export class DynamicMenuTabComponent implements OnInit {

  @Input() id: any;
  @Input() patientId: any;
  @Input() type: string;
  @Input() dynamicGroup: any;
  @Input() controlName: any;

  @Output() isMenuCreated: EventEmitter<any> = new EventEmitter<any>();

  uuid: any;
  menuOptions: MenuDetailsVO[] = [];
  userVo = new UserVO();
  routerUrl: string;
  nestMenu: string;
  selected: string;
  logoUrl: any;
  showLogo = true;
  show = false;


  constructor(private dynamicMenuService: DynamicMenuService, private snackBar: MatSnackBar
    , private service: UserService, private router: Router) {
    this.selected = 'en';
    // this.group.get('patientName').valueChanges.subscribe(data => {
    //   this.uuid = data;
    // });
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
    // this.loadApplicationLogo();
    if (this.patientId) {
      this.uuid = this.patientId;
    }
    this.getMenu();
    if (this.dynamicGroup) {
      this.dynamicGroup.get(this.controlName).valueChanges.subscribe(data => {
        this.uuid = data;
      });
    }
  }

  checkParametersExist() {
    if (this.dynamicGroup && !this.dynamicGroup.get(this.controlName).value) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Please select patient',
      });
    }
  }

  getMenu() {
    this.dynamicMenuService.getAllMenusDetails(this.id).subscribe(
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
    this.router.navigate(['pa', pageId]);
  }

}
