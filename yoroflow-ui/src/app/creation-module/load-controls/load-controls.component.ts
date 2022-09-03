import { Component, OnInit, Input, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FieldConfig } from '../shared/vo/page-vo';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'value', weight: 1.000, symbol: 'value' },
  { position: 2, name: 'value', weight: 2.000, symbol: 'value' },
  { position: 3, name: 'value', weight: 3.000, symbol: 'value' },
  { position: 4, name: 'value', weight: 9.0122, symbol: 'value' },
  { position: 5, name: 'value', weight: 10.811, symbol: 'value' },
  { position: 6, name: 'value', weight: 12.0107, symbol: 'value' },
  { position: 7, name: 'value', weight: 14.0067, symbol: 'value' },
  { position: 8, name: 'value', weight: 15.9994, symbol: 'value' },
  { position: 9, name: 'value', weight: 18.9984, symbol: 'value' },
  { position: 10, name: 'value', weight: 20.1797, symbol: 'value' },
];


@Component({
  selector: 'app-load-controls',
  templateUrl: './load-controls.component.html',
  styleUrls: ['./load-controls.component.css']
})
export class LoadControlsComponent implements OnInit {

  @Input() column: FieldConfig;
  @ViewChild('signature', { static: true }) signaturePad: SignaturePad;

  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 1,
    'canvasWidth': 300,
    'canvasHeight': 30,
    'backgroundColor': 'rgb(222, 224, 226)',
    'penColor': 'black'
  };
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  loadPage = false;
  enableParagraph = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  values = [
    { name: 'Value One' },
    { name: 'Value Two' }
  ];
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
  group: FormGroup = this.fb.group({});
  previewUrl: any;
  isLoad: boolean;
  constructor(private el: ElementRef, private fb: FormBuilder, private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.el.nativeElement.style.width = 100 + '%';
    if (this.column.controlType === 'page') {
      if (this.column.field.control && this.column.field.control.pageName) {
        this.loadPage = true;
      } else {
        this.loadPage = false;
      }
    } else {
      this.loadPage = false;
    }
    this.paragraph();
    this.loadImage();
  }

  loadImage() {
    if (this.column.controlType === 'image' && this.column.field.control && this.column.field.control.image && this.column.field.control.image !== null) {
      this.previewUrl = this.column.field.control.image;
      this.isLoad = true;
      this.transform();
      this.cd.markForCheck();
    } else if (this.column.controlType === 'image') {
      this.isLoad = false;
    }
  }

  transform() {
    if (this.previewUrl !== null && this.previewUrl !== undefined) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.previewUrl);
    }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    // this.signaturePad is now available
    if (this.column.controlType === 'signaturecontrol' && this.signaturePad !== undefined) {
      this.signaturePad.set('minWidth', 16.5 * this.column.field.fieldWidth); // set szimek/signature_pad options at runtime
      this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
    }
  }
  getButtonColor(buttonType) {
    if (buttonType === 'submit') {
      return 'primary';
    } else { return 'accent'; }
  }

  paragraph() {
    if (this.column.controlType === 'paragraph' && this.column.field && this.column.field.control && this.column.field.control.paragraph) {
      this.enableParagraph = true;
    } else {
      this.enableParagraph = false;
    }
  }

  isSelectAll(event) {
  }

  individualSelectCheckbox(event: any): void {
  }

  receiveMessage($event) {

  }

  remove(value) {

  }

  add($event) {

  }

}
