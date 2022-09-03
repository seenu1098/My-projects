import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatIconRegistry, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { LivetestService } from '../../shared/service/livetest.service';
import { BatchTestcaseResultVO } from '../../shared/vo/batch-testcase-result-vo';

@Component({
  selector: 'app-batch-testcase-result',
  templateUrl: './batch-testcase-result.component.html',
  styleUrls: ['./batch-testcase-result.component.css']
})
export class BatchTestcaseResultComponent implements OnInit {
  filterIdColumnValue = '';
  batchVO = new BatchTestcaseResultVO();

  constructor(public dialogRef: MatDialogRef<BatchTestcaseResultComponent>, private service: LivetestService,
    @Inject(MAT_DIALOG_DATA) public data: any, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    this.iconRegistry.addSvgIcon(
      'clear', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/clear.svg')
    );
    this.filterIdColumnValue = data;
  }

  ngOnInit() {
    this.service.getBatchTestcaseResultData(this.data).subscribe(details => {
      this.batchVO = details;
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
