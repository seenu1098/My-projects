import { Component, OnInit, Inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA } from 'mat-right-sheet';

@Component({
  selector: 'app-dynamic-right-sheet',
  templateUrl: './dynamic-right-sheet.component.html',
  styleUrls: ['./dynamic-right-sheet.component.css']
})
export class DynamicRightSheetComponent implements OnInit {

  id: string;
  pageId: string;
  show = false;

  constructor(private rightSheetRef: MatRightSheetRef<DynamicRightSheetComponent>, private ngZone: NgZone,
    @Inject(MAT_RIGHT_SHEET_DATA) public data: any, public changeDetectorRef: ChangeDetectorRef) {
    this.changeDetectorRef.markForCheck();
  }

  ngOnInit() {
    this.id = this.data.id;
    this.pageId = this.data.pageName;
  }

  close() {
    this.rightSheetRef.dismiss();
  }

  getPageRendered($event) {
    if ($event === true) {
      this.show = true;
      this.ngZone.run(() => {
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  ngAfterViewChecked() {
    this.changeDetectorRef.markForCheck();
  }

}
