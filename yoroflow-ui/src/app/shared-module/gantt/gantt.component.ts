import { Component, OnInit, HostBinding, HostListener, Input, ViewChild, ElementRef } from '@angular/core';
import { MatButtonToggle, MatButtonToggleChange } from '@angular/material/button-toggle';

import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { GanttBarClickEvent, GanttDragEvent, GanttItem, GanttLineClickEvent, GanttLinkDragEvent, GanttViewType } from '../packages/gantt/src/public-api';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { GroupVO, TaskboardTaskVO, UserVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { StatusList, TaskboardColumnMapVO, TaskboardColumns, TaskboardVO } from 'src/app/taskboard-module/taskboard-configuration/taskboard.model';
import { random, randomItems } from './helper';
import { GanttPrintService } from '../packages/gantt/src/gantt-print.service';
import { DatePipe } from '@angular/common';
import { TaskDependencies } from 'src/app/taskboard-module/dependency-dialog/dependency-model';
import { TaskboardFormDetailsComponent } from 'src/app/taskboard-module/taskboard-form-details/taskboard-form-details.component';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ConfirmdialogComponent } from '../confirmdialog/confirmdialog.component';


@Component({
    selector: 'app-gantt',
    templateUrl: './gantt.component.html',
    providers: [GanttPrintService]
})
export class GanttChartComponent implements OnInit {

    @Input() taskboardId: string;
    @Input() taskboardColumnVOList: TaskboardColumns[];
    @Input() taskboardVO = new TaskboardVO();
    @Input() usersList: UserVO[] = [];
    @Input() groupList: GroupVO[] = [];

    @ViewChild('gantt', { static: false }) gantt: any;

    views = [
        {
            name: 'Day',
            value: GanttViewType.day
        },
        {
            name: 'Week',
            value: GanttViewType.week
        },
        {
            name: 'Month',
            value: GanttViewType.month
        },
        {
            name: 'Quarter',
            value: GanttViewType.quarter
        },
        {
            name: 'Year',
            value: GanttViewType.year
        }
    ];

    LinkType: any[] = [
        { name: 'Dependent', value: 'dependent' },
        { name: 'Related Task', value: 'relatedTask' }
    ]

    viewType: GanttViewType = GanttViewType.month;
    link: string = 'dependent';

    items: GanttItem[] = [];
    options = {
        viewType: GanttViewType.day
    };

    selectedType = 'Month';

    @HostBinding('class.gantt-example-component') class = true;

    childrenResolve = (item: GanttItem) => {
        const children = randomItems(random(1, 5), item);
        return of(children).pipe(delay(1000));
    };
    scrollHeight: number;

    taskboardTaskList: TaskboardTaskVO[] = [];
    show: boolean = false;
    spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent, any>;
    selectedColumnIndex: any;
    selectedTaskIndex: any;
    doneColumnName: string;
    @HostListener('window:resize', ["$event"])
    osResize(event) {
        this.scrollHeight = Math.round((window.innerHeight - 100));
    }

    constructor(private printService: GanttPrintService, private snackbar: MatSnackBar,
        private taskboardService: TaskBoardService, private dialog: MatDialog,
        private datepipe: DatePipe) { }

    ngOnInit(): void {
        this.scrollHeight = Math.round((window.innerHeight - 100));
        this.loadData();
        this.doneColumnName = this.taskboardVO.taskboardColumnMapVO[this.taskboardVO.taskboardColumnMapVO.length - 1].taskboardColumnsVO.columnName;
    }

    barClick(event: GanttBarClickEvent) {
        const taskVO = this.taskboardTaskList.find(task => task.id === event.item.id);
        const columnMap = this.taskboardVO.taskboardColumnMapVO.find(columnMap => columnMap.taskboardColumnsVO.columnName === taskVO.status);
        this.selectedColumnIndex = columnMap.taskboardColumnsVO.columnOrder;
        this.selectedTaskIndex = columnMap.taskboardTaskVOList.findIndex(task => task.id === taskVO.id);
        this.openTaskForm(taskVO, columnMap, 'taskForm');
    }

    lineClick(event: GanttLineClickEvent) {
    }

    dragEnded(event: GanttDragEvent): void {
        if (event.item.isCompleted === false && event.item.isUpdate === true) {
            event.item.startDate = new Date(event.item.start);
            event.item.endDate = new Date(event.item.end);
            this.saveStartAndDueDate(event.item);
        } else {
            const task = this.taskboardTaskList.find(task => task.id === event.item.id);
            const item = this.items.find(item => item.id === event.item.id);
            event.item.start = new Date(task.startDate).getTime();
            event.item.end = new Date(task.dueDate).getTime();
            const dialog = this.dialog.open(ConfirmdialogComponent, {
                width: '400',
                data: { data: 'dragConfirm', update: event.item.isUpdate }
            });
        }
    }

    linkDragEnded(event: GanttLinkDragEvent): void {
        if (event.target) {
            this.saveDependencies(event.source, event.target);
        }
    }

    saveDependencies(sourceItem: GanttItem, targetItem: GanttItem): void {
        const dependencyVO = new TaskDependencies();
        dependencyVO.taskId = sourceItem.id;
        const sourceTask = this.taskboardTaskList.find(task => task.id === sourceItem.id);
        if (this.link === 'dependent') {
            this.taskboardTaskList.forEach(task => {
                if (task.id === targetItem.id) {
                    const taskVO = new TaskboardTaskVO();
                    taskVO.id = task.id;
                    taskVO.taskId = task.taskId;
                    taskVO.status = task.status;
                    dependencyVO.waitingOn.push(taskVO);
                }
            });
        } else if (this.link === 'relatedTask') {
            this.taskboardTaskList.forEach(task => {
                if (task.id === targetItem.id) {
                    const taskVO = new TaskboardTaskVO();
                    taskVO.id = task.id;
                    taskVO.taskId = task.taskId;
                    taskVO.status = task.status;
                    dependencyVO.relatedTasks.push(taskVO);
                }
            });
        }
        this.spinnerDialog();
        this.taskboardService.saveDependency(dependencyVO).subscribe(data => {
            this.spinner.close();
            if (data) {
                if (this.link === 'dependent') {
                    data.waitingOn.forEach(element => {
                        const taskVO = dependencyVO.waitingOn.find(task => task.id === element.id);
                        element.status = taskVO.status;
                        this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
                            columnMap.taskboardTaskVOList.forEach(task => {
                                if (task.id === sourceItem.id) {
                                    task.taskDependenciesVO.waitingOn.push(element);
                                }
                            });
                        });
                        sourceTask.taskDependenciesVO.waitingOn.push(element);
                    });
                } else if (this.link === 'relatedTask') {
                    data.relatedTasks.forEach(element => {
                        const taskVO = dependencyVO.relatedTasks.find(task => task.id === element.id);
                        element.status = taskVO.status;
                        this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
                            columnMap.taskboardTaskVOList.forEach(task => {
                                if (task.id === sourceItem.id) {
                                    task.taskDependenciesVO.relatedTasks.push(element);
                                }
                            });
                        });
                        sourceTask.taskDependenciesVO.relatedTasks.push(element);
                    });
                }
                this.items = [...this.items];
            }
        }, error => {
            this.spinner.close();
            this.snackbar.openFromComponent(SnackbarComponent, {
                data: 'Internal server error'
            });
        });
    }


    saveStartAndDueDate(ganttItem: GanttItem): void {
        const taskVO = new TaskboardTaskVO();
        taskVO.id = ganttItem.id;
        taskVO.dueDate = ganttItem.endDate;
        taskVO.startDate = ganttItem.startDate;
        this.spinnerDialog();
        this.taskboardService.saveStartAndDueDate(taskVO).subscribe(data => {
            this.items = [...this.items];
            this.spinner.close();
            this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
                columnMap.taskboardTaskVOList.forEach(task => {
                    if (task.id === ganttItem.id) {
                        task.startDate = ganttItem.startDate;
                        task.dueDate = ganttItem.endDate;
                        return;
                    }
                });
            });
        }, error => {
            this.spinner.close();
            this.snackbar.openFromComponent(SnackbarComponent, {
                data: 'Internal server error'
            })
        });
    }

    print(name: string) {
        this.printService.print(name);
    }

    viewTypeChange(event: MatButtonToggleChange): void {
        this.selectedType = event.value;
        this.viewType = event.value;
    }

    linkTypeChange(event: MatButtonToggleChange): void {
        this.loadItem(event.value);
    }

    loadData(): void {
        this.spinnerDialog();
        this.taskboardService.getAllTasks(this.taskboardId).subscribe(taskList => {
            this.spinner.close();
            if (taskList && taskList.length > 0) {
                this.taskboardTaskList = taskList;
                this.loadItem('dependent');
            }
        }, error => {
            this.show = true;
            this.spinner.close();
            this.snackbar.openFromComponent(SnackbarComponent, {
                data: 'Internal server error'
            });
        });
    }

    loadItem(linkType: string): void {
        this.items = [];
        this.show = false;
        this.link = linkType;
        const columnLength = this.taskboardColumnVOList.length;
        const percentage = Math.round(100 / columnLength);
        let linkCss: string;
        let relatedTaskId: string[] = [];
        this.taskboardTaskList.forEach(task => {
            let links: any[] = [];
            if (linkType === 'dependent') {
                linkCss = '0,0';
                task.taskDependenciesVO.waitingOn?.forEach(dependency => {
                    links.push(dependency.id);
                });
            } else if (linkType === 'relatedTask') {
                linkCss = '5,5';
                task.taskDependenciesVO.relatedTasks?.forEach(dependency => {
                    if (!relatedTaskId.includes(dependency.id)) {
                        links.push(dependency.id);
                        relatedTaskId.push(dependency.id);
                    }
                });
            }
            const columnIndex = this.taskboardColumnVOList.findIndex(column => column.columnName === task.status) + 1;
            let computedPercentage: any;
            if (columnIndex === this.taskboardColumnVOList.length) {
                computedPercentage = 100;
            } else {
                computedPercentage = columnIndex * percentage;
            }
            const columnMap = this.taskboardVO.taskboardColumnMapVO.find(columnMap => columnMap.taskboardColumnsVO.columnName === task.status);
            const item = new GanttItem();
            item.id = task.id;
            item.taskId = task.taskId;
            item.title = task.taskName;
            item.start = new Date(task.startDate).getTime();
            item.end = new Date(task.dueDate).getTime();
            item.percentage = computedPercentage;
            item.links = links;
            item.linkCss = linkCss;
            item.isUpdate = this.taskboardVO.isTaskBoardOwner === true ? true : columnMap.taskboardColumnsVO.taskboardColumnSecurity.update;
            item.isCompleted = task.status === this.doneColumnName ? true : false;
            this.items.push(item);
        });
        this.show = true;
    }

    spinnerDialog(): void {
        this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
            disableClose: true,
            width: '100px',
            data: { type: 'spinner' },
        });
    }

    public downloadAsPDF() {
        var element = document.getElementById('gantt');
        html2canvas(element).then(function (canvas) {
            const imgWidth = 208;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            const pdf = new jsPDF('l', 'mm', 'a2');
            const contentDataURL = canvas.toDataURL('image/jpeg');
            pdf.addImage(contentDataURL, 'PNG', 10, 10,imgWidth,imgHeight);
            pdf.save('new-file.pdf');
        });
    }

    addNewTask(event): void {
        const taskboardTaskVO = new TaskboardTaskVO();
        taskboardTaskVO.id = null;
        taskboardTaskVO.status = this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.columnName;
        taskboardTaskVO.taskboardId = this.taskboardVO.id;
        this.openTaskForm(taskboardTaskVO, this.taskboardVO.taskboardColumnMapVO[0], 'task');
    }

    openTaskForm(task: TaskboardTaskVO, columnMap: TaskboardColumnMapVO, type: string): void {
        if (this.taskboardVO.isTaskBoardOwner) {
            columnMap.taskboardColumnsVO.taskboardColumnSecurity.read = true;
            columnMap.taskboardColumnsVO.taskboardColumnSecurity.delete = true;
            columnMap.taskboardColumnsVO.taskboardColumnSecurity.update = true;
        }
        var subStatus: string;
        if (this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus
            && this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus.length > 0) {
            subStatus = this.taskboardVO.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus[0].name
        }
        var statusList: StatusList[] = [];
        this.taskboardVO.taskboardColumnMapVO.forEach(column => {
            const statusListVO = new StatusList();
            statusListVO.name = column.taskboardColumnsVO.columnName;
            statusListVO.color = column.taskboardColumnsVO.columnColor;
            if (column.taskboardColumnsVO.subStatus && column.taskboardColumnsVO.subStatus.length > 0) {
                statusListVO.subStatusList = column.taskboardColumnsVO.subStatus;
                statusList.push(statusListVO);
            } else {
                statusListVO.subStatusList = [];
                statusList.push(statusListVO);
            }
        });
        const dialog = this.dialog.open(TaskboardFormDetailsComponent, {
            disableClose: false,
            width: '95%',
            maxWidth: '95%',
            height: '95%',
            autoFocus: false,
            data: {
                taskDetails: task,
                formId: columnMap.taskboardColumnsVO.formId,
                status: task.status,
                version: columnMap.taskboardColumnsVO.version,
                color: columnMap.taskboardColumnsVO.columnColor,
                statusList: statusList,
                taskList: this.taskboardTaskList,
                taskIndex: this.selectedTaskIndex,
                groupList: this.groupList,
                usersList: this.usersList,
                taskName: this.taskboardVO.taskName,
                taskboardId: this.taskboardVO.id,
                taskboardColumnId: columnMap.taskboardColumnsVO.id,
                isTaskBoardOwner: this.taskboardVO.isTaskBoardOwner,
                taskboardColumnSecurity: columnMap.taskboardColumnsVO.taskboardColumnSecurity,
                taskboardVO: this.taskboardVO,
                value: type,
                mappedColumnTaskList: columnMap.taskboardTaskVOList,
                subStatus: subStatus
            },
        });
        dialog.afterClosed().subscribe(data => {
            if (data && data.taskDetails && type !== 'task') {
                this.taskboardVO.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList[this.selectedTaskIndex] = data.taskDetails;
            } else if ((type === 'task' && data && data.taskDetails) || type === 'subtask') {
                this.taskboardVO.taskboardColumnMapVO[0].taskboardTaskVOList.push(data.taskDetails);
                const spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
                    disableClose: true,
                    width: '100px',
                    data: { type: 'spinner' },
                });
                this.taskboardService.getTaskboardDetails(this.taskboardVO.id).subscribe((taskboardVO) => {
                    this.taskboardVO.taskboardColumnMapVO = taskboardVO.taskboardColumnMapVO;
                    spinner.close();
                });
            }
            this.loadData();
        });
    }

    loadSubTasks(): void {
        this.taskboardVO.taskboardColumnMapVO.forEach(columnMap => {
            columnMap.taskboardTaskVOList.forEach(task => {
                task.subTaskVO = columnMap.taskboardTaskVOList.filter(subtask => task.subTasks.find(subTaskVO => subTaskVO.id === subtask.id));
            });
        });
    }
}


