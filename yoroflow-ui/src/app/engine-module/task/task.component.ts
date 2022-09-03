import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject } from '@angular/core';
import { Task } from './task.model';
import { TaskStatus } from './TaskStatus';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import * as fileSaver from 'file-saver';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdhocTask } from '../board/addtask/VO/adhoc-task-vo';
import { AdhocTaskService } from '../board/addtask/adhoc-task.service';
// import { SnackbarComponent, ConfirmationDialogBoxComponentComponent } from '../../public-api';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { DialogData } from '../dialog/dialog-data-vo';
// tslint:disable-next-line:max-line-length


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  @Input() task: Task;
  taskStatusEnum: any;
  adhocTask = new AdhocTask();
  taskname: string;
  description: string;
  checkoutForm: FormGroup;
  base64Image: any;
  urls = [];
  images = [];
  files: any[] = [];
  filesIndex: any[];
  isShow = false;
  editIndex: any;
  editBoolean = false;
  progress = true;
  @Output() delTask: EventEmitter<number> = new EventEmitter<number>();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: DialogData, public dialogRef: MatDialogRef<TaskComponent>,
    // tslint:disable-next-line: align
    private sanitizer: DomSanitizer, private adhocTaskService: AdhocTaskService, private snackBar: MatSnackBar
    // tslint:disable-next-line: align
    , private dialog: MatDialog) {


    this.taskStatusEnum = TaskStatus;
    if (data !== null) {
      this.getTaskInfo(data);
    }
  }

  getTaskInfo(id) {
    this.adhocTaskService.getAdhocTaskInfo(id).subscribe(adhocTaskVO => {
      this.adhocTask = adhocTaskVO;
      this.getTaskNotesInfo(id);
      this.getTaskFilesInfo(id);
      this.initialize();
    });
  }



  openImage() {
    const img = '<img src="' + this.images[0] + '">';
    const popup = window.open();
    popup.document.write(img);
    popup.print();
  }

  getTaskFilesInfo(id) {
    this.adhocTaskService.getTaskFiles(id).subscribe(taskFiles => {
      this.progress = false;
      taskFiles.forEach(params => {
        this.files.push({ fileName: params.fileName, fileId: params.fileId, file: params.file });
      });
    });
  }

  getTaskNotesInfo(id) {
    this.adhocTaskService.getTaskNotes(id).subscribe(taskNotes => {
      this.adhocTask.taskNotes = taskNotes;
      this.initialize();
      for (let i = 0; i < this.adhocTask.taskNotes.length; i++) {
        if (i > 0) {
          this.addAnotherNotes();
        }
        const index = '' + i;
        const form = (this.checkoutForm.get('taskNotes') as FormArray).get(index);
        this.editBoolean = true;
        form.setValue(this.adhocTask.taskNotes[i]);
        form.updateValueAndValidity();

      }
      if (this.adhocTask.taskNotes.length !== 0) {
        this.addAnotherNotes();
      }
    });
  }



  toggleDisplay(columnIndex) {
    this.isShow = !this.isShow;
    this.editIndex = columnIndex;
    const formArray = (this.checkoutForm.get('taskNotes') as FormArray);
    const notes = formArray.get('' + columnIndex).get('notes').value;
    if (notes === '') {
      formArray.get('' + columnIndex).get('notes').setValue('');
    }
  }

  editNotes(columnIndex) {
    const formArray = (this.checkoutForm.get('taskNotes') as FormArray);
    const notes = formArray.get('' + columnIndex).get('notes').value;
    const notesId = formArray.get('' + columnIndex).get('notesId').value;
    const taskNotes = notes.replace(/<[^>]*>/g, '');
    formArray.get('' + columnIndex).get('notes').setValue(taskNotes.replace(/&nbsp;/g, ''));
    this.isShow = !this.isShow;
    this.editIndex = columnIndex;
    this.adhocTask.notes = taskNotes.replace(/&nbsp;/g, '');
    this.adhocTask.notesId = notesId;
    this.adhocTaskService.createNotes(this.adhocTask).subscribe(
      data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response

        });
        if (data.response === 'Notes Created Successfully') {
          this.addAnotherNotes();
        }
        this.getTaskNotesInfo(this.adhocTask.taskID);
      });

  }

  removeNotes(columnIndex) {
    const formArray = (this.checkoutForm.get('taskNotes') as FormArray);
    const notesId = formArray.get('' + columnIndex).get('notesId').value;
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: { id: notesId, type: 'notes' }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        this.getTaskNotesInfo(this.adhocTask.taskID);
      }
    });

  }
  onSubmit(customerData) {

  }

  initialize() {
    this.checkoutForm = this.formBuilder.group({
      taskID: [this.adhocTask.taskID],
      taskName: [this.adhocTask.taskName, Validators.required],
      status: [this.adhocTask.status, Validators.required],
      description: [this.adhocTask.description],
      // tslint:disable-next-line: max-line-length
      dueDate: [new Date(this.adhocTask.dueDate), Validators.required],
      assignee: [this.adhocTask.assignee, Validators.required],
      taskNotes: this.formBuilder.array([
        this.addNotes()
      ]),
    });
  }

  notesFormArray() {
    return (this.checkoutForm.get('taskNotes') as FormArray).controls;
  }

  addAnotherNotes() {
    const formArray = (this.checkoutForm.get('taskNotes') as FormArray);
    formArray.push(this.addNotes());
  }


  removeThisNotes(i: number) {
    const form = (this.checkoutForm.get('taskNotes') as FormArray);
    form.removeAt(i);
  }

  ngOnInit() {
    this.initialize();
  }

  addNotes(): FormGroup {
    return this.formBuilder.group({
      notesId: [''],
      notes: [''],
      updatedBy: [''],
      updatedDate: ['']
    });
  }

  close(index) {
    if (index !== -1) {
      this.filesIndex.splice(index, 1);
    }
  }

  deleteAttachedFile(file) {
    this.progress = true;
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: { name: file.fileName, id: file.fileId, type: 'files' }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        this.files = [];
        this.getTaskFilesInfo(this.adhocTask.taskID);
      } else {
        this.progress = false;
      }
    });
  }

  deleteTask(taskId) {
    this.delTask.emit(taskId);
  }
  addtask() {
    this.adhocTask = this.checkoutForm.value;
    const jsonData = JSON.stringify(this.adhocTask);
    this.adhocTask.files = new FormData();
    this.adhocTask.files.append('adhocTask', jsonData);
    if (this.filesIndex !== undefined) {
      this.filesIndex.forEach(data => {
        this.adhocTask.files.append('files', data.file);
      });
    }

    this.adhocTaskService.createAdhocTask(this.adhocTask).subscribe(data => {
      this.dialogRef.close(data);
    });
  }

  saveFiles() {
    this.progress = true;
    this.adhocTask = this.checkoutForm.value;
    const jsonData = JSON.stringify(this.adhocTask);
    this.adhocTask.files = new FormData();
    this.adhocTask.files.append('adhocTask', jsonData);
    this.filesIndex.forEach(data => {
      if (data.fileId === null) {
        this.adhocTask.files.append('files', data.file);
      }
    });
    this.adhocTaskService.saveTaskFiles(this.adhocTask).subscribe(data => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: data.response

      });
      if (data.response === 'Files Added Successfully') {
        this.progress = false;
      }
      this.files = [];
      this.getTaskFilesInfo(this.adhocTask.taskID);
    });
  }


  onNoClick(): void {
    this.dialogRef.close(false);
  }



  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      const filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        const reader = new FileReader();

        // tslint:disable-next-line: no-shadowed-variable
        reader.onload = (event: any) => {
          this.urls.push(event.target.result);
        };

        reader.readAsDataURL(event.target.files[i]);

        this.files.push({ file: event.target.files[i], fileName: event.target.files[i].name, fileId: null });
        this.filesIndex = this.files;
      }

    }
  }

  showFile(id, filename) {
    this.adhocTaskService.showFiles(id)
      .subscribe((response) => {
        const blob = new Blob([response], { type: response.type });
        fileSaver.saveAs(blob, filename);
      });
  }
}
