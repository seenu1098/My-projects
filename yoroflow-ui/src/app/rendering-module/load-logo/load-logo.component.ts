import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-load-logo',
  templateUrl: './load-logo.component.html',
  styleUrls: ['./load-logo.component.css']
})
export class LoadLogoComponent implements OnInit {

  @Input() base64Image: string;
  @Input() action: string;

  isLoad = false;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
     this.appendString();
  }

  appendString() {
    if (this.base64Image !== null && this.base64Image !== undefined) {
      this.isLoad = true;
    }
  }

  transform() {
    if (this.base64Image !== null && this.base64Image !== undefined) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.base64Image);
    }
  }

}
