import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { TestGroupService } from '../../shared/service/test-group.service';
import { BatchTestcaseResultComponent } from '../batch-testcase-result/batch-testcase-result.component';
import { GridService } from '../yorogrid/grid.service';
import { MatDialog, MatBottomSheet, MatBottomSheetConfig } from '@angular/material';
import { PrintTestResultsDialogComponent } from '../print-test-results-dialog/print-test-results-dialog.component';
import { YorogridComponent } from '../yorogrid/yorogrid.component';
import { MatSnackBar } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { MatRightSheet } from 'mat-right-sheet';
import { BatchTestcaseComponent } from '../batch-testcase/batch-testcase.component';



@Component({
  selector: 'app-test-case-execution-results',
  templateUrl: './test-case-execution-results.component.html',
  styleUrls: ['./test-case-execution-results.component.css']
})
export class TestCaseExecutionResultsComponent implements OnInit {
  @ViewChild('yorogrid', { static: false })
  yorogrid: YorogridComponent;


  // tslint:disable-next-line: max-line-length
  constructor(private service: TestGroupService, private gridService: GridService, private dialog: MatDialog,
    private snackBar: MatSnackBar, private _rightSheet: MatRightSheet) { }

  ngOnInit() {
  }

  receiveMessage(event: any): void {
    event['__gridId'] = 'batchtestcases';
    const dialogRef = this._rightSheet.open(BatchTestcaseComponent, {
      disableClose: true,
      panelClass: 'bottom-sheet-container',
      direction: 'ltr',
      data: event
    });

    dialogRef.afterDismissed().subscribe(dialogData => {
      this.yorogrid.refreshGrid();
    });
  }
  refreshGrid() {
    this.yorogrid.refreshGrid();
  }
}
