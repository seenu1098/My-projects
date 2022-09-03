import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-public-form',
  templateUrl: './public-form.component.html',
  styleUrls: ['./public-form.component.scss']
})
export class PublicFormComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  changeUrl() {
    window.open('https://www.yoroflow.com');
    // window.location.href = 'https://www.yoroflow.com';
  }

}
