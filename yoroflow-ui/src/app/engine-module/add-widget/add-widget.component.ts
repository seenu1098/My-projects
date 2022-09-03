import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateDialogService } from 'src/app/workspace-module/create-dialog/create-dialog.service';
import { DashboardPageVO, Row, Column } from '../landing-page/landing-page-vo';
@Component({
  selector: 'app-add-widget',
  templateUrl: './add-widget.component.html',
  styleUrls: ['./add-widget.component.scss']
})
export class AddWidgetComponent implements OnInit {
  form: FormGroup;
  taskboardMenus = [
    { name: 'Featured' },
    { name: 'Statuses' },
    { name: 'Assignees' },
    { name: 'Priorities' },
    { name: 'Time Tracking' }
  ];

  workflowMenus = [
    { name: 'Featured' },
    { name: 'Tasknames' },
    { name: 'Assignees & Teams' },
    { name: 'Workflow Time Tracking' }
  ];

  featuredCards = [
    {
      name: 'Workload by Status', description: 'Display a Pie chart of statuses usage across locations',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Task List', description: 'Create a List view using tasks from any location',
      icon: 'format_list_bulleted', color: '#7f52c7', widgetType: 'Taskboard'
    },
    {
      name: 'Taskboard Statistics', description: 'Categorize and track progress of Lists & Folders',
      icon: 'work', color: 'grey', widgetType: 'Taskboard'
    },
    // { name: 'Calculation', description: 'Calculate sums, averages, and so much more for tasks', icon: 'functions', color: 'lightgreen' },
    {
      name: 'Tasks by Assignee', description: 'Display a Pie chart of total tasks by Assignee',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Unassigned Tasks', description: 'Display a list of tasks which are not assigned in any location',
      icon: 'format_list_bulleted', color: 'lightblue', widgetType: 'Taskboard'
    },
    {
      name: 'Tasks in Progress', description: 'Display a list of tasks are in Progress in any location',
      icon: 'format_list_bulleted', color: 'green', widgetType: 'Taskboard'
    },
    {
      name: 'Tasks Deleted', description: 'Display a list of tasks which are Closed in any location',
      icon: 'format_list_bulleted', color: 'orange', widgetType: 'Taskboard'
    },
    {
      name: 'Tasks Completed', description: 'Display a list of tasks which are Completed in any location',
      icon: 'format_list_bulleted', color: 'orangered', widgetType: 'Taskboard'
    },
  ];

  statusesCards = [
    {
      name: 'Workload by Status', description: 'Display a Pie chart of your statuses usage across locations',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Workload by Status Hor Bar', description: 'Display a breakdown of your statuses across locations',
      icon: 'hor_bar', color: '#7f52c7', widgetType: 'Taskboard'
    },
    {
      name: 'Workload by Status Ver Bar',
      description: 'Display a bar chart of your statuses usage across locations',
      icon: 'addchart', color: 'grey', widgetType: 'Taskboard'
    },
    // { name: 'Calculation', description: 'Calculate sums, averages, and so much more for tasks', icon: 'functions', color: 'lightgreen' },
    {
      name: 'Number of Tasks in Progress', description: 'See how many tasks are in progress in any location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Number of Tasks Closed', description: 'See how many tasks are closed in any location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Number of Tasks Completed', description: 'See how many tasks are done in any location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    }
  ];


  assigneeCards = [
    {
      name: 'Tasks by Assignee', description: 'Display a pie chart of your total tasks by Assignee',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Tasks by Assignee Hor Bar', description: 'Display a horizontal bar graph of your total tasks by Assignee',
      icon: 'hor_bar', color: '#7f52c7', widgetType: 'Taskboard'
    },
    {
      name: 'Tasks by Assignee Ver Bar',
      description: 'Display a bar graph of your total tasks by Assignee',
      icon: 'addchart', color: 'grey', widgetType: 'Taskboard'
    },
    {
      name: 'Total Unassigned Tasks', description: 'See how many tasks are not assigned in any location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Total Assigned(Not Completed) Tasks', description: 'See how many tasks have assignees in any location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    }
  ];

  priorityCards = [
    {
      name: 'Priority Breakdown', description: 'Display a pie chart of tasks broken down by priority',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Priority Breakdown Hor Bar', description: 'Display a horizontal bar graph of tasks broken down by priority',
      icon: 'hor_bar', color: '#7f52c7', widgetType: 'Taskboard'
    },
    {
      name: 'Priority Breakdown Ver Bar',
      description: 'Display a vertical bar graph of tasks broken down by priority',
      icon: 'addchart', color: 'grey', widgetType: 'Taskboard'
    },
    {
      name: 'Total Urgent Tasks', description: 'Display the total amount of Urgent tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Total High Tasks', description: 'Display the total amount of High priority tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Total Medium Tasks', description: 'Display the total amount of medium priority tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Total Low Tasks', description: 'Display the total amount of Low tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Total No Priority Tasks', description: 'Display the total amount of No Priority tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    }
  ];

  timeTrackingCards = [
    {
      name: 'Total Past Due Tasks', description: 'Display the total amount of past due tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Total Due Today Tasks', description: 'Display the total amount of due today tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Total Due Tomorrow Tasks', description: 'Display the total amount of due tomorrow tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    },
    {
      name: 'Total Due in 7 days Tasks', description: 'Display the total amount of due in 7 days tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Taskboard'
    }
  ];

  workflowFeaturedCards = [
    {
      name: 'Assignee Task by Taskname',
      description: 'Display a Pie chart of your assignee task usage across locations',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Teams Task by Taskname',
      description: 'Display a Pie chart of your teams task usage across locations',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Tasks by Teams', description: 'Display a Pie chart of statuses usage across locations',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Workflow Task List', description: 'Create a List view using tasks from any location',
      icon: 'format_list_bulleted', color: '#7f52c7', widgetType: 'Workflow'
    },
    {
      name: 'Workflow Tasks by Assignee', description: 'Display a Pie chart of total tasks by Assignee',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Failed Tasks', description: 'Display a list of tasks are failed in any location',
      icon: 'format_list_bulleted', color: 'green', widgetType: 'Workflow'
    },
    {
      name: 'Running Tasks', description: 'Display a list of tasks are in running in any location',
      icon: 'format_list_bulleted', color: 'green', widgetType: 'Workflow'
    },
    {
      name: 'Completed Tasks', description: 'Display a list of tasks which are Completed in any location',
      icon: 'format_list_bulleted', color: 'orangered', widgetType: 'Workflow'
    },
  ];


  workflowStatusesCards = [
    {
      name: 'Assignee Task by Taskname',
      description: 'Display a Pie chart of your statuses usage across locations',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Assignee Task by Taskname Hor Bar',
      description: 'Display a breakdown of your statuses across locations',
      icon: 'hor_bar', color: '#7f52c7', widgetType: 'Workflow'
    },
    {
      name: 'Assignee Task by Taskname Ver Bar',
      description: 'Display a bar chart of your statuses usage across locations',
      icon: 'addchart', color: 'grey', widgetType: 'Workflow'
    },
    {
      name: 'Teams Task by Taskname',
      description: 'Display a Pie chart of your statuses usage across locations',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Teams Task by Taskname Hor Bar',
      description: 'Display a breakdown of your statuses across locations',
      icon: 'hor_bar', color: '#7f52c7', widgetType: 'Workflow'
    },
    {
      name: 'Teams Task by Taskname Ver Bar',
      description: 'Display a bar chart of your statuses usage across locations',
      icon: 'addchart', color: 'grey', widgetType: 'Workflow'
    },
    // { name: 'Calculation', description: 'Calculate sums, averages, and so much more for tasks', icon: 'functions', color: 'lightgreen' },
    {
      name: 'Number of Running Tasks', description: 'See how many tasks are running in any location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Number of Failed Tasks', description: 'See how many tasks are failed in any location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Number of Completed Tasks', description: 'See how many tasks are done in any location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Workflow'
    }
  ];

  workflowAssigneeCards = [
    {
      name: 'Workflow Tasks by Assignee', description: 'Display a pie chart of your total tasks by Assignee',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Workflow Tasks by Assignee Hor Bar', description: 'Display a horizontal bar graph of your total tasks by Assignee',
      icon: 'hor_bar', color: '#7f52c7', widgetType: 'Workflow'
    },
    {
      name: 'Workflow Tasks by Assignee Ver Bar',
      description: 'Display a bar graph of your total tasks by Assignee',
      icon: 'addchart', color: 'grey', widgetType: 'Workflow'
    },
    {
      name: 'Tasks by Teams', description: 'Display a pie chart of your total tasks by teams',
      icon: 'pie_chart', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Tasks by Teams Hor Bar', description: 'Display a horizontal bar graph of your total tasks by teams',
      icon: 'hor_bar', color: '#7f52c7', widgetType: 'Workflow'
    },
    {
      name: 'Tasks by Teams Ver Bar',
      description: 'Display a bar graph of your total tasks by teams',
      icon: 'addchart', color: 'grey', widgetType: 'Workflow'
    },
  ];

  workflowTimeTrackingCards = [
    {
      name: 'Total Past Due Tasks (Workflow)', description: 'Display the total amount of past due tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Total Due Today Tasks (Workflow)', description: 'Display the total amount of due today tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Total Due Tomorrow Tasks (Workflow)', description: 'Display the total amount of due tomorrow tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Workflow'
    },
    {
      name: 'Total Due in 7 days Tasks (Workflow)', description: 'Display the total amount of due in 7 days tasks by location',
      icon: 'functions', color: 'lightseagreen', widgetType: 'Workflow'
    }
  ];


  selectedWidgetName = 'Featured';
  // showFilters: boolean = false;
  // selectedWidgetForFilter: any;
  // isChecked: boolean = true;
  workspaceList: any;
  column: Column[][];
  row: Row[] = [];
  dashboardPageVO = new DashboardPageVO();
  viewMode: any = 'Viewing';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddWidgetComponent>,
    private fb: FormBuilder,
    private createDialogService: CreateDialogService
  ) { }
  modes = [
    { name: 'Taskboard', icon: 'edit', isSelected: false },
    { name: 'Workflow', icon: 'visibility', isSelected: false }
  ];
  ngOnInit(): void {
    this.viewMode = 'Taskboard';
  }
  changeWidget(widgetName) {
    this.selectedWidgetName = widgetName;
  }

  changeMode(mode) {
    this.viewMode = mode;
  }
  record($event) {

  }

  close() {
    this.dialogRef.close(false);
  }
  selectWidget(widget) {
    if (widget) {
      // if(this.dashboardPageVO.rows.length === 0){

      // for(let i = 0; i < this.dashboardPageVO.rows.length; i++){
      // this.dashboardPageVO.rows.columns.push(widget)
      // }
      // }
      this.dialogRef.close(widget);

      // this.initializeForm();
      // this.selectedWidgetForFilter = widget;
      // this.showFilters = true;
      // this.getWorkspaceNames();
    }
  }
  // initializeForm(){
  //   this.form = this.fb.group({
  //     includeSubtasks: [false],
  //     includeArchived: [false],
  //     includeClosed:[false],
  //     includeMultipleTasks:[false],
  //     includeAllTasks:[true]
  //   });
  // }
  // addWidget(widget){
  //      this.dialogRef.close(widget)
  // }
  // getWorkspaceNames() {
  //   this.createDialogService.listAllWorkspaceList().subscribe(res => {
  //     this.workspaceList = res;
  //   })
  // }

}
