import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expire-dialog',
  templateUrl: './expire-dialog.component.html',
  styleUrls: ['./expire-dialog.component.scss']
})
export class ExpireDialogComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  upgrade() {
    this.router.navigate(['subscription']);
  }
}
