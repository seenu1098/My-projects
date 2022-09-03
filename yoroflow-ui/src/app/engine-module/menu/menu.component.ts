import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/service/user-service';
import { Router } from '@angular/router';
import { UserVO } from '../shared/vo/user-vo';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-yoroflow-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(public service: UserService, public router: Router) { }
  showLogo = false;
  showMenu = false;
  userVo = new UserVO();
  ngOnInit() {
    this.service.getLoggedInUserDetails().subscribe(data => {
      this.userVo = data;
      this.showMenu = true;
    });
  }
  logout() {
    this.service.logout();
    this.router.navigate(['/login']);
  }

}
