import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Section, FieldConfig } from '../shared/vo/page-vo';
import { STICKY_DIRECTIONS } from '@angular/cdk/table';

@Component({
  selector: 'app-row-details',
  templateUrl: './row-details.component.html',
  styleUrls: ['./row-details.component.css']
})
export class RowDetailsComponent implements OnInit {

  @Input() isLoading;


  section: Section;
  column: FieldConfig[];
  @Output() messageEvent = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {

    /*if (this.section !== undefined) {
      this.isLoading = true;
      this.column = [];

      this.section.rows.forEach(row => {
        row.columns.forEach(column => {
          this.column.push(column);
        })
      })
    }*/
  }
  loadRowDetails(section: Section) {

    this.isLoading = true;
    this.section = section;
    //  this.ngOnInit();
  }

}
