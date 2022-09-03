import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, Validators, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { TestGroupService as BatchGroupService } from 'src/shared/service/test-group.service';
import * as Highcharts from 'highcharts';
import { BatchReportVO as FormTypeBasedReportVO } from 'src/shared/vo/batch-report-vo';
import { LivetestService } from 'src/shared/service/livetest.service';
@Component({
  selector: 'app-form-type-based-report',
  templateUrl: './form-type-based-report.component.html',
  styleUrls: ['./form-type-based-report.component.css']
})
export class FormTypeBasedReportComponent implements OnInit {

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar,
    private service: BatchGroupService) {
  }

  formtypeList: any;
  reportGenerateForm: FormGroup;
  testReport = new FormTypeBasedReportVO();
  reportGenerated = false;
  highcharts = Highcharts;
  chartOptions: any;

  ngOnInit() {
    this.reportGenerateForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    }, { validator: this.matchDate });
  }

  matchDate(group: AbstractControl): { [key: string]: any } | null {
    const fromDate = group.get('fromDate');
    const toDate = group.get('toDate');
    if (fromDate.value <= toDate.value) {
      return null;
    } else {
      return { dateMismatch: true };
    }
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.testReport = this.reportGenerateForm.value;
      this.testReport.reportType = 'Form Type Based Report';
        this.service.getTestReport(this.testReport).subscribe(data => {
        this.testReport = data;
        this.generateReport(this.testReport);
      }, error => {

      });
    }
  }

  generateReport(testReportInfo: FormTypeBasedReportVO) {
      this.chartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Form Type Based Report'
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: testReportInfo.batchNames,
        crosshair: true,
        title: {
          text: 'Form Type'
        }
      },
      yAxis: {
        min: 0,
        max: 20,
        tickInterval: 1,
        title: {
          text: 'Total Tests'
        }
      },
      tooltip: {
        headerFormat: '<span style = "font-size:10px">Form Type:{point.key}</span><table>',
        pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
          '<td style = "padding:0"><b>{point.y}  </b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.01,
          borderWidth: 0

        },
        series: {
          pointWidth: 30,
          pointPadding: 0.1,
        }
      },
      series: testReportInfo.testReportVOList
    };
    this.reportGenerated = true;
  }

}
