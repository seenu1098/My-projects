import { Component, OnInit } from '@angular/core';
import { UserVO } from '../shared/vo/user-vo';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  selected: string;
  userVo = new UserVO();
  constructor() {
  }


  ngOnInit() {
  }


}
