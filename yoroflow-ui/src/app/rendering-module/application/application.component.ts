import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/service/user-service';


@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit {

  constructor(public userService: UserService) { }

  ngOnInit(): void {
  }

}
