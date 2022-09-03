import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user-service';
import { Router } from '@angular/router';
import { UserVO } from '../login/user-vo';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userVo = new UserVO();
  isAdmin = false;

  constructor(private service: UserService, private router: Router) { }

  ngOnInit() {
    this.loadLoggedInUserDetails();
    const roles = this.service.getRoles();
    this.isAdmin = roles.includes('ROLE_admin');
    }

  logout() {
    this.service.logout();
    this.router.navigate(['/login']);
  }

  loadLoggedInUserDetails() {
    this.service.getLoggedInUserDetails().subscribe(data => {
      this.userVo = data;
    });
  }
}
