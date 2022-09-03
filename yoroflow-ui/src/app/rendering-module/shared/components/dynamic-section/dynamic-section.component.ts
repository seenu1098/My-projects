import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Page, Section } from '../../vo/page-vo';
import { FormValidationService } from '../../service/form-service/form-validation.service';

@Component({
  selector: 'app-dynamic-section',
  templateUrl: './dynamic-section.component.html',
  styles: []
})
export class DynamicSectionComponent implements OnInit {

  @Input() section: Section;
  @Input() group: FormGroup;
  @Input() page: Page;
  @Input() preview: boolean;
  @Input() isAllowEdit: boolean;
  @Output() getChipComponent: EventEmitter<any> = new EventEmitter<any>();
  showBorder: string;
  showSection = false;

  constructor(private formValidationService: FormValidationService) { }

  ngOnInit() {
    if (this.section.border === false) {
      this.showBorder = 'none';
    }

    if ((this.section.sectionSecurity && this.section.sectionSecurity.show) || this.preview === true) {
      this.showSection = true;
    } else {
      this.showSection = false;
    }
  }

  getChipComponentFromArray($event) {
    const event = $event.$event;
    this.getChipComponentInstance(event);
  }

  getChipComponentInstance($event) {
    this.getChipComponent.emit({ $event });
  }

}
