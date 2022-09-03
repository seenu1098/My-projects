import { Component, Inject, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssignGroupTaskVO, AssignTaskVO, AssignUserTaskVO, GroupVO, TaskboardTaskVO, UserVO } from '../taskboard-form-details/taskboard-task-vo';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { ResolveSecurityForTaskboardVO } from '../taskboard-configuration/taskboard.model';
import { TaskboardFormDetailsComponent } from '../taskboard-form-details/taskboard-form-details.component';

@Component({
    selector: 'app-dialog-view',
    templateUrl: './dialog-view.component.html',
    styleUrls: ['./dialog-view.component.scss']
})
export class DialogviewComponent implements OnInit {
    taskBoardTaskVO = new TaskboardTaskVO();
    closeDialog: boolean = false;
    date: any;
    index: any;
    taskList: TaskboardTaskVO[] = [];
    status: any[] = [];
    isEmit = false;
    isClose: boolean = false;
    taskboardColumnSecurity = new ResolveSecurityForTaskboardVO();
    object: any;
    show: boolean = false;
    @Output() public formDetails = new EventEmitter<any>();
    @Output() public formValues = new EventEmitter<any>();

    taskComponent: TaskboardFormDetailsComponent;
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<DialogviewComponent>,
        private dialog: MatDialog, private fb: FormBuilder) { }

    ngOnInit() {
        this.taskComponent = this.data.object;
        this.taskBoardTaskVO = this.data.taskVO;
        this.index = this.data.taskIndex;
        this.object = this;
    }


    getFormValues(event) {

        if (event === 'error contains') {
            return;
        }
        if (event && event !== false && event !== [] && event.length !== 0) {
            if (event.form) {
                this.dialogRef.close(event.form.getRawValue());
            } else {
                this.dialogRef.close(event);
            }
        }

    }
    cancel() {
        this.dialogRef.close();
    }
    save() {
        this.isEmit = true;
        this.formDetails.emit(true);

    }
}