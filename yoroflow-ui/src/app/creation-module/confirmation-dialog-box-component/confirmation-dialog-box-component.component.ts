import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatRightSheet } from 'mat-right-sheet';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';

import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'app-confirmation-dialog-box-component',
  templateUrl: './confirmation-dialog-box-component.component.html',
  styleUrls: ['./confirmation-dialog-box-component.component.css']
})
export class ConfirmationDialogBoxComponentComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmationDialogBoxComponentComponent>
    , private rightSheet: MatRightSheet, private dialog: MatDialog, private snackBar: MatSnackBar
    , private router: Router, private fb: FormBuilder, private workspaceService: WorkspaceService
  ) { }

  appicationForm: FormGroup;
  isValid: boolean;
  isGenerateVersion: boolean;
  dynamicForm: FormGroup;
  @Output() response: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    if (this.data.type === 'delete-application') {
      this.appicationForm = this.fb.group({
        applicationName: ['', Validators.required]
      });
    }
  }

  createNewPage() {
    this.dialogRef.close(true);
  }
  selecteExistingForm() {
    this.dialogRef.close('selecte existing form');
  }

  getEvent(event) {
    this.dialogRef.close(event);
  }

  updateMenu() {
    this.dialogRef.close(true);
  }

  getMenuCreationResponse($event) {
    if ($event && ($event.response === 'Menu configuration created successfully' ||
      $event.response === 'Menu configuration updated successfully')) {
      this.dialogRef.close($event.responseId);
    }
  }

  generateVersion() {
    this.dialogRef.close(true);
  }

  updateForm(): void {
    this.dialogRef.close('update');
  }

  close() {
    this.dialogRef.close();
  }

  inactivateUser() {
    this.dialogRef.close('yes');
  }

  createMenu() {
    this.dialogRef.close(true);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  openPage() {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/test-page', this.data]);
    this.dialogRef.close(false);
  }

  deleteSection() {
    this.dialogRef.close(true);
  }
  resetControl() {
    this.dialogRef.close(true);
  }

  resetPage() {
    this.dialogRef.close(true);
  }

  navigation() {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/' + this.data.target]);
    this.dialogRef.close(true);
  }

  onCloseClick() {
    this.dialogRef.close({ 'submit': false, 'applicationName': null });
  }

  openGridConfiguration() {
    this.dialogRef.close(true);
  }

  openShoppingCartConfiguration() {
    this.dialogRef.close(true);
  }

  openParentMenuConfig() {
    this.dialogRef.close(true);
  }

  deleteApplication() {

  }

  removeProfilePicture() {
    this.dialogRef.close(true);
  }

  exportUI() {
    this.dialogRef.close(true);
  }

  agree() {
    this.dialogRef.close(true);
  }

  cancelExport() {
    this.dialogRef.close({ type: 'cancel', data: false });
  }

  includeTable() {
    this.dialogRef.close({ type: 'include', data: true });
  }

  excludeTable() {
    this.dialogRef.close({ type: 'exclude', data: true });
  }

  updateEmpty() {
    this.dialogRef.close(true);
  }
}


