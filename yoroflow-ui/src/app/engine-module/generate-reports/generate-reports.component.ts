import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenerateReportService } from './generate-report.service';
import { ReportsDashboardVO } from './report-vo';
import * as Highcharts from 'highcharts';
@Component({
  selector: 'app-generate-reports',
  templateUrl: './generate-reports.component.html',
  styleUrls: ['./generate-reports.component.scss']
})
export class GenerateReportsComponent implements OnInit {
  constructor(private fb: FormBuilder, private service: GenerateReportService) {
    this.startDate.setDate(this.startDate.getDate() - 30);
    this.adminReportForm = this.fb.group({
      startDate: [this.startDate],
      endDate: [this.endDate],
      optionType: ['all'],
      taskId: ['', [Validators.required]],
      userId: ['', [Validators.required]]
    });
  }
  selected = 'all';
  adminReportForm: FormGroup;
  startDate = new Date();
  endDate = new Date();
  reportVO = new ReportsDashboardVO();
  taskReportBoolean = false;
  averageTaskTimeBoolean = false;
  userBoolean = false;
  highcharts = Highcharts;
  userslist: any;
  taskNameList: any;
  maxDate: any;
  totalReportList = {
    chart: {
      type: 'spline'
    },
    title: {
      text: $localize`:@@graph1-title:Total Task Reports`
    },
    xAxis: {
      categories: ['04/18/2020', '04/20/2020', '04/21/2020']
    },
    yAxis: {
      title: {
        text: $localize`:@@graph1-yAxis:No. Of Tasks`
      }
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    series: [{
      name: $localize`:@@graph1-total-count:Total Count`,
      data: [45, 67, 57]
    }]
  };

  averageTaskTimeProcessing = {
    chart: {
      type: 'spline'
    },
    title: {
      text: $localize`:@@graph2-title:Total Average Time of Completed Task Per Day`
    },
    xAxis: {
      categories: ['04/18/2020', '04/20/2020', '04/21/2020'],
      title: {
        text: $localize`:@@graph2-xAxis:Date`
      },
    },
    yAxis: {
      title: {
        text: $localize`:@@graph2-yAxis:Time Interval(in Minutes)`
      },
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    series: [{
      name: $localize`:@@graph2-total-time:Total Time`,
      data: [45, 67, 57]
    }]
  };

  getTotalTaskByUser = {
    chart: {
      type: 'spline'
    },
    title: {
      text: $localize`:@@graph3-title:Total Completed Task By User`
    },
    xAxis: {
      categories: ['04/18/2020', '04/20/2020', '04/21/2020'],
      title: {
        text: $localize`:@@graph3-xAxis:Date`
      },
    },
    yAxis: {
      title: {
        text: $localize`:@@graph3-total-task-count:Total Task Count`
      },
    },
    tooltip: {
      valueSuffix: ''
    },
    credits: {
      enabled: false
    },
    series: [{
      name: 'admin@yoroflow.com',
      data: [45, 24, 56]
    }, {
      name: 'helpdesk@yoroflow.com',
      data: [45, 65, 34]
    }, {
      name: 'frondesk@yoroflow.com',
      data: [45, 76, 56]
    }]
  };

  ngOnInit(): void {
    this.service.getUsersList().subscribe(data => {
      this.userslist = data;
    });
    this.maxDate = new Date();
    this.getCount();
    this.dateValidation();
  }

  dateValidation() {
    if (this.adminReportForm.get('startDate').value > this.adminReportForm.get('endDate').value) {
      this.adminReportForm.get('startDate').setErrors({ greaterValue: true });
    } else {
      this.adminReportForm.get('startDate').setErrors(null);
    }
  }

  getCount() {
    this.taskReportBoolean = false;
    this.averageTaskTimeBoolean = false;
    this.userBoolean = false;
    this.reportVO = this.adminReportForm.value;

    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    this.reportVO.startDate = new Date(startDate.getTime() + Math.abs(startDate.getTimezoneOffset() * 60000));
    this.reportVO.endDate = new Date(endDate.getTime() + Math.abs(endDate.getTimezoneOffset() * 60000));
    this.service.getTotalTaskReport(this.reportVO).subscribe(data => {
      this.taskReportBoolean = true;
      this.totalReportList.xAxis.categories = data.categories;
      this.totalReportList.series = data.series;
    });

    this.service.getTotalCompletedTaskByUser(this.reportVO).subscribe(data => {
      this.userBoolean = true;
      this.getTotalTaskByUser.xAxis.categories = data.categories;
      this.getTotalTaskByUser.series = data.series;
    });

    this.service.getTotalAverageTime(this.reportVO).subscribe(data => {
      this.averageTaskTimeBoolean = true;
      this.averageTaskTimeProcessing.xAxis.categories = data.categories;
      this.averageTaskTimeProcessing.series = data.series;
    });
  }

  submit(userForm) {
    this.dateValidation();
    this.updateValidatorsForsubmit(this.adminReportForm.get('optionType').value);
    if (userForm.valid) {
      this.getCount();
    }
  }

  updateValidatorsForsubmit(value: string) {
    const taskId = this.adminReportForm.get('taskId');
    const userId = this.adminReportForm.get('userId');
    if (value === 'users') {
      userId.setValidators([Validators.required]);
      taskId.setValidators(null);
    } else if (value === 'taskName') {
      taskId.setValidators([Validators.required]);
      userId.setValidators(null);
    } else {
      taskId.setValidators(null);
      userId.setValidators(null);
    }
    taskId.updateValueAndValidity();
    userId.updateValueAndValidity();
  }


}
