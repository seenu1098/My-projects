import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';

@Component({
  selector: 'app-divider',
  template: `
          <ng-container>
          <div [style]="field.style">
            <hr>
            </div>
          </ng-container>
          `,
  styles: []
})
export class DividerComponent implements OnInit {
  @Input() field: Field;
  @Input() group: FormGroup;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
  }

  constructor(public el: ElementRef, public formService: CreateFormService) { }
  ngOnInit() {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    this.group.removeControl(undefined);
    if (this.field.name) {
      this.group.removeControl(this.field.name);
    }
  }

}
