import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import More from 'highcharts/highcharts-more';
More(Highcharts);
import Drilldown from 'highcharts/modules/drilldown';
Drilldown(Highcharts);
import Exporting from 'highcharts/modules/exporting';
Exporting(Highcharts);

@Component({
  selector: 'app-taskboard-reports',
  templateUrl: './taskboard-reports.component.html',
  styleUrls: ['./taskboard-reports.component.scss']
})
export class TaskboardReportsComponent implements OnInit {
  highcharts = Highcharts;
  filterBoardUserList: any[] = [];

  getchart = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Reports of all Users'
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      categories: ['Backlog', 'Todo', 'Progress', 'Development', 'Testing', 'Automation Testing', 'Completed'],
      title: {
        text: 'Taskboard Columns'
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Total Tasks (count)',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    tooltip: {
      valueSuffix: ' count'
    },
    plotOptions: {
    column: {
      dataLabels: {
        enabled: true
      }
    }
  },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'top',
      x: -30,
      y: 40,
      floating: true,
      borderWidth: 1,
      backgroundColor:
        Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
      shadow: true
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: 'User 1',
      data: [107, 31, 300, 203, 2, 10]
    }, {
      name: 'User 2',
      data: [133, 156, 240, 90, 6, 80]
    }, {
      name: 'User 3',
      data: [240, 120, 130, 220, 31, 55]
    }, {
      name: 'User 4',
      data: [96, 80, 40, 240, 40, 99]
    },{
      name: 'User 5',
      data: [55, 10, 82, 97, 45, 47]
    },{
      name: 'User 6',
      data: [10, 44, 55, 90, 40, 88]
    },{
      name: 'User 7',
      data: [10, 120, 5, 240, 6, 44]
    },{
      name: 'User 8',
      data: [100, 58, 98, 127, 20, 53]
    },{
      name: 'User 9',
      data: [107, 31, 227, 10, 2, 61]
    },{
      name: 'User 10',
      data: [41, 19, 91, 85, 31, 43]
    }]
  }
  constructor() { }

  ngOnInit(): void {
  }
  

}
