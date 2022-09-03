import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-workflow-page',
  templateUrl: './workflow-page.component.html',
  styleUrls: ['./workflow-page.component.css']
})
export class WorkflowPageComponent implements OnInit {

  constructor() { }
  workflowBoolean: boolean;

  ngOnInit(): void {
    this.workflowBoolean = true;
  }

}
