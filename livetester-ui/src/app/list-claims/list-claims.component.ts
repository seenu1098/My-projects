import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LivetestService } from '../../shared/service/livetest.service';
import { ClaimEntityVO } from '../../shared/vo/claim-vo';
import { ClaimsComponent } from '../claims/claims.component';
import {  Router  } from '@angular/router';

@Component({
  selector: 'app-list-claims',
  templateUrl: './list-claims.component.html',
  styleUrls: ['./list-claims.component.css']
})
export class ListclaimsComponent implements OnInit {

  claimList: FormGroup;
  claimEntity = new ClaimEntityVO();
  isShown = false;

  constructor(private fb: FormBuilder, private service: LivetestService, private router: Router) { }

  ngOnInit() {
  }

  receiveMessage($event): void {
      this.router.navigate(['/create-claims', $event.col19])  ;
  }
}
