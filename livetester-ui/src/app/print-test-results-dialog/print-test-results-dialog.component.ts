import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatIconRegistry, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { PrintTestResultsVO } from '../../shared/vo/print-test-results-vo';
import { TestGroupService } from 'src/shared/service/test-group.service';
import { saveAs } from 'file-saver';
import { HttpResponse } from '@angular/common/http';
import { PdfResponseVO } from 'src/shared/vo/pdf-response-vo';
@Component({
  selector: 'app-print-test-results-dialog',
  templateUrl: './print-test-results-dialog.component.html',
  styleUrls: ['./print-test-results-dialog.component.css']
})
export class PrintTestResultsDialogComponent implements OnInit {

  checkBoxControl = false;
  form: FormGroup;
  printResultsVo = new PrintTestResultsVO();
  pdfResponseVO = new PdfResponseVO;
  constructor(public dialogRef: MatDialogRef<PrintTestResultsDialogComponent>,
    private batchTestcaseService: TestGroupService,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder,
    private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    this.iconRegistry.addSvgIcon(
      'clear', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/clear.svg')
    );
    this.printResultsVo.pIICheckbox = false;
    this.printResultsVo.batchTestcaseId = this.data;

    this.batchTestcaseService.getFileName(this.printResultsVo).subscribe(
      file => {
        this.pdfResponseVO.fileName = file.fileName;
      }
    );
  }

  ngOnInit() {
    this.form = this.fb.group({
      pIICheckbox: [this.printResultsVo.pIICheckbox],
      pdfOption: [this.printResultsVo.pdfOption, Validators.required]
    });
  }

  execute(userForm: NgForm) {
    // for post mapping
    this.printResultsVo = this.form.value;
    this.printResultsVo.batchTestcaseId = this.data;

    this.batchTestcaseService.getFileName(this.printResultsVo).subscribe(
      file => {
        this.pdfResponseVO.fileName = file.fileName;
      }
    );

    this.batchTestcaseService.printResultWithResponse(this.printResultsVo)
      .subscribe((response) => {
        const blob = new Blob([response], { type: response.type });
        saveAs(blob, this.pdfResponseVO.fileName);
      }
      );
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
