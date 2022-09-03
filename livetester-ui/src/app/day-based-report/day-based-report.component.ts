import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { TestGroupService as BatchGroupService } from 'src/shared/service/test-group.service';
import { BatchReportVO as DayBasedReportVO } from 'src/shared/vo/batch-report-vo';

@Component({
  selector: 'app-day-based-report',
  templateUrl: './day-based-report.component.html',
  styleUrls: ['./day-based-report.component.css']
})
export class DayBasedReportComponent implements OnInit {

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar,
    private service: BatchGroupService) {
  }
  highcharts = Highcharts;
  reportGenerateForm: FormGroup;
  testReport = new DayBasedReportVO();
  reportGenerated = false;
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
      this.testReport.reportType = 'Day Based Report';
      this.service.getTestReport(this.testReport).subscribe(data => {
        this.testReport = data;
        this.generateReport(this.testReport);
      }, error => {

      });
    }
  }

  generateReport(testReportInfo: DayBasedReportVO) {
     this.chartOptions = {
      chart: {
        type: 'spline'
      },
      title: {
        text: 'Day Based Test Report'
      },
      // subtitle: {
      //   text: 'Source: WorldClimate.com'
      // },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: testReportInfo.batchNames,
        title: {
          text: 'Days'
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Total Tests'
        }
      },
      plotOptions: {
        series: {
          dataLabels: {
            enabled: false
          }
        }
      },
      tooltip: {
        valueSuffix: false
      },
      series: testReportInfo.testReportVOList
    };
    this.reportGenerated = true;
  }

}
