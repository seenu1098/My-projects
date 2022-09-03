import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { PrintTestResultsDialogComponent } from '../print-test-results-dialog/print-test-results-dialog.component';
import { BatchTestcaseResultComponent } from '../batch-testcase-result/batch-testcase-result.component';
import { TestGroupService } from 'src/shared/service/test-group.service';
import { ResultVO } from '../test-case-execution-results/requery-result-vo';
import { YorogridComponent } from '../yorogrid/yorogrid.component';
import { GridService } from '../yorogrid/grid.service';
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA } from 'mat-right-sheet';
import { MatSnackBar, MatDialog, MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { TestCaseExecutionResultsComponent } from '../test-case-execution-results/test-case-execution-results.component';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TestCaseExecutionVO, TestGroupItemFlatNode } from 'src/shared/vo/testgroupnode-vo';
import { LivetestService } from 'src/shared/service/livetest.service';
import { ReplacementOptionExecuteComponent } from '../replacement-option-execute/replacement-option-execute.component';

@Component({
  selector: 'app-batch-testcase',
  templateUrl: './batch-testcase.component.html',
  styleUrls: ['./batch-testcase.component.css']
})
export class BatchTestcaseComponent implements OnInit {

  @ViewChild('yorogrid', { static: false })
  yorogrid: YorogridComponent;

  batchId = -1;
  batchName = '';
  environmentName = '';
  batchTestcase: any[] = [];
  resultVO = new ResultVO();
  testExecutionVO = new TestCaseExecutionVO();
  testVO: TestGroupItemFlatNode[] = [];

  constructor(private service: TestGroupService, private gridService: GridService, private router: Router, private datePipe: DatePipe
    , private _rightSheetRef: MatRightSheetRef<BatchTestcaseComponent>, @Inject(MAT_RIGHT_SHEET_DATA) public data: any,
    private livetesterService: LivetestService,
    private snackBar: MatSnackBar, private dialog: MatDialog, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {

    this.iconRegistry.addSvgIcon(
      'clear', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/clear.svg')
    );
  }

  ngOnInit() {
    this.batchId = this.data.col9;
    this.batchName = this.data.col1;
    this.environmentName = this.data.col2;
    this.gridService.rowSelected(this.data);
  }
  openLink(event: MouseEvent): void {
    this._rightSheetRef.dismiss();
    event.preventDefault();
  }

  isSelectAll(event) {
    if (event.checked === true) {
      this.gridService.isSelectAll(this.batchId).subscribe(data => {
        this.batchTestcase = data;
      });
    } else {
      this.batchTestcase = [];
    }
  }

  individualSelectCheckbox(event: any): void {
    if (event.checked === true) {
      this.batchTestcase.push(event.data.col8);
    } else if (event.checked === false) {
      for (let i = 0; i < this.batchTestcase.length; i++) {
        if (this.batchTestcase[i] === event.data.col8) {
          this.batchTestcase.splice(i, 1);
        }
      }
    }
  }
  receiveMessageTestcases(event: any): void {
    event['__gridId'] = 'batch-testcase-result';
    this.gridService.rowSelected(event);

    this.dialog.open(BatchTestcaseResultComponent, {
      panelClass: 'dialog_class',
      data: event.col8
    });
  }

  rerunBatch(name) {
    this._rightSheetRef.dismiss();
    this.livetesterService.getBatchTestCases(this.batchId).subscribe(data => {
      this.testExecutionVO = data;
      this.testExecutionVO.batchName = name + ' ' + this.datePipe.transform(new Date(), 'MMM d, y, h:mm:ss a');
      const dialogRef = this.dialog.open(ReplacementOptionExecuteComponent, {
        width: '1500px',
        height: '600px',
        disableClose: true,
        data: this.testExecutionVO,
      });

      dialogRef.afterClosed().subscribe(dialogData => {
        this.yorogrid.refreshGrid();
      });
    });
  }

  processDemoPassOrFail(batchId, passOrFail) {
    this.livetesterService.demoPassOrFail(batchId, passOrFail).subscribe(data => {
      this.yorogrid.refreshGrid();
    });
  }

  openDialogForPrintTestResults() {
    if (this.batchTestcase.length === 0) {
      this.snackBar.openFromComponent(SnackBarComponent, {
        data: 'Atleast select one Testcase',
      });
    } else {
      this.dialog.open(PrintTestResultsDialogComponent, {
        width: '500px',
        data: this.batchTestcase
      });
    }
  }
  requeryResult() {
    if (this.batchTestcase.length === 0) {
      this.snackBar.openFromComponent(SnackBarComponent, {
        data: 'Atleast select one Testcase',
      });
    } else {
      this.resultVO.batchId = this.batchName;
      this.resultVO.batchTestcaseId = this.batchTestcase;
      this.service.requeryResult(this.resultVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: data.response,
        });
        this.yorogrid.refreshGrid();
        this.yorogrid.isSelectAll = false;
        this.batchTestcase = [];
      });
      this.yorogrid.refreshGrid();
    }
  }
  onNoClick(event: MouseEvent) {
    this._rightSheetRef.dismiss();
    event.preventDefault();
  }
}
