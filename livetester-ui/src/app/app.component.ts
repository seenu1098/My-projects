import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../shared/service/user-service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isShow: boolean;

  constructor(public service: UserService) {


  }

  ngOnInit() {
    this.isShow = this.service.loggedIn();

  }

}



