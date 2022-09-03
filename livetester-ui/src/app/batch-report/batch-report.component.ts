import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { FormGroup, FormBuilder, Validators, AbstractControl, NgForm } from '@angular/forms';
import { BatchReportVO } from '../../shared/vo/batch-report-vo';
import { TestGroupService as BatchGroupService } from 'src/shared/service/test-group.service';
import { MatSnackBar } from '@angular/material';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'app-batch-report',
  templateUrl: './batch-report.component.html',
  styleUrls: ['./batch-report.component.css']
})
export class BatchReportComponent implements OnInit {

  constructor(private fb: FormBuilder, private service: BatchGroupService, private snackBar: MatSnackBar) { }

  today = new Date();
  reportGenerateForm: FormGroup;
  testReport = new BatchReportVO();
  reportGenerated = false;
  highcharts = Highcharts;
  chartOptions: any;
  chart: any;
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
      this.testReport.reportType = 'Batch Report';
      this.service.getTestReport(this.testReport).subscribe(data => {
        this.testReport = data;
        this.generateReport(this.testReport);
      }, error => {

      });
    }
  }

  generateReport(testReportInfo: BatchReportVO) {
    
    this.chartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Batch Report'
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: testReportInfo.batchNames,
        crosshair: true,
        title: {
          text: 'Batch#'
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
        headerFormat: '<span style = "font-size:10px">Batch Name:{point.key}</span><table>',
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
      series: testReportInfo.testReportVOList,
      exporting: {
        enabled: true
    }
    };
    this.chart = new Chart(this.chartOptions);
    this.reportGenerated = true;
  }
}
