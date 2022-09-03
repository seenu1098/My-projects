import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-load-form',
  templateUrl: './load-form.component.html',
  styleUrls: ['./load-form.component.css']
})
export class LoadFormComponent implements OnInit {
  pageId: any;
  show = false;
  loadFormInfo: any;
  patientId: any;
  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.getPatientId();
  }
  getPatientId() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.pageId = params.get('id');
      this.loadFormInfo = {
        pageType: 'samePage',
        pageName: this.pageId,
        id: params.get('controlName'),
        pId: params.get('uuid'),
        isFromTabbedMenu: true
      };
      this.show = true;
    });
  }

}
