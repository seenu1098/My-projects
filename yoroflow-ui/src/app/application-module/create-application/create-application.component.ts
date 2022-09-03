import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { compareAsc } from 'date-fns';
import { ConfirmationDialogBoxComponentComponent } from 'src/app/engine-module/confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { GroupService } from 'src/app/engine-module/group/group-service';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { ConfirmationDialogComponent } from 'src/app/workspace-module/confirmation-dialog/confirmation-dialog.component';
import { WorkspaceListVO } from 'src/app/workspace-module/create-dialog/create-dialog-vo';
import { CreateDialogComponent } from 'src/app/workspace-module/create-dialog/create-dialog.component';
import { CreateDialogService } from 'src/app/workspace-module/create-dialog/create-dialog.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { TeamListComponent } from 'src/app/workspace-module/team-list/team-list.component';
import { ApplicationTemplateService } from '../application-templates/application-template.service';

@Component({
  selector: 'app-create-application',
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<CreateApplicationComponent>,
              private templateService: ApplicationTemplateService, private fb: FormBuilder, private groupService: GroupService,
              private dialog: MatDialog, private createDialogService: CreateDialogService,
              private snackbar: MatSnackBar, private router: Router, private workspaceService: WorkspaceService) { }

  form: FormGroup;
  teamList: any[] = [];
  workspaceList: WorkspaceListVO[] = [];
  showMsg = false;
  workspace = new WorkspaceListVO();
  spinner: MatDialogRef<ConfirmationDialogBoxComponentComponent>;

  ngOnInit(): void {
    this.form = this.fb.group({
      workspace: ['', [Validators.required]],
      templateName: [this.data.template.templateName],
      team: []
    });
    this.templateService.getAllWorkspace().subscribe(workspaceList => {
      this.workspaceList = workspaceList;
    });
  }

  openTeamDialog(): void {
    const dialog = this.dialog.open(TeamListComponent, {
      disableClose: true,
      width: '50%',
      height: '70%',
      data: { template: this.data.template, data: this.teamList, type: 'team-list' }
    });
    dialog.afterClosed().subscribe(response => {
      if (response && response.selectedTeam) {
        this.teamList = response.selectedTeam;
      }
    });
  }

  removedAssigneeUser(i: number): void {
    this.teamList.splice(i, 1);
  }

  getWorkspace(workspaceId) {
    this.workspace = this.workspaceList.find(w => w.workspaceId === workspaceId);
  }

  save(userForm: NgForm, type: string): void {
    if ((userForm && userForm.valid) || type !== 'existing') {
      const workspaceId = type === 'existing' ? this.form.get('workspace').value : this.workspace.workspaceId;
      if (type === 'existing') {
        this.getWorkspace(workspaceId);
      }
      this.spinnerDialog();
      this.templateService.saveApplication(workspaceId, this.data.template.id).subscribe(response => {
        this.spinner.close();
        this.dialogRef.close();
        if (response.response.includes('successfully')) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: response.response,
          });
          if (this.workspaceService.workspaceID !== workspaceId) {
            const dialog = this.dialog.open(ConfirmationDialogComponent, {
              disableClose: true,
              width: '400px',
              data:
                { type: 'switchWorkspace', name: this.workspace.workspaceName }
            });
            dialog.afterClosed().subscribe(data => {
              if (data && data === true) {
                this.workspaceService.setWorkspaceID(this.workspace.workspaceId);
                this.workspaceService.setWorkspaceVO(this.workspace);
                this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/mytask/my-pending-task']);
              }
            });
          }
        }
        else if (response.response.includes('already installed')) {
          const dialog = this.dialog.open(ConfirmationDialogComponent, {
            disableClose: true,
            width: '400px',
            data:
              { type: 'alreadyInstalled', data: response }
          });
          dialog.afterClosed().subscribe(data => {
          });
        }
      }, error => {
        this.spinner.close();
        this.dialogRef.close();
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }

  deleteWorkspace(): void {
    if (this.workspace.workspaceId !== undefined || this.workspace.workspaceId !== null) {
      this.spinnerDialog();
      this.createDialogService.deleteWorkspace(this.workspace.workspaceId).subscribe(res => {
        this.spinner.close();
        this.dialogRef.close();
        if (res.response.includes('deleted successfully')) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: res.response
          });
        }
      }, error => {
        this.spinner.close();
        this.dialogRef.close();
      });
    }
  }

  createWorkspace(): void {
    const dialog = this.dialog.open(CreateDialogComponent, {
      disableClose: true,
      width: '50%',
      maxWidth: '50%',
      height: '45%',
      panelClass: 'config-dialog',
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.workspace = data;
        this.showMsg = true;
        this.dialogRef.updateSize('400px', '');
      }
    });
  }
}
