import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LaunchPermissionVo } from './launch-taskboard';
import { LaunchTaskboardService } from './launch-taskboard.service';

@Component({
  selector: 'app-launch-taskboard-dialog',
  templateUrl: './launch-taskboard-dialog.component.html',
  styleUrls: ['./launch-taskboard-dialog.component.scss']
})
export class LaunchTaskboardDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<LaunchTaskboardDialogComponent>,
    private fb: FormBuilder,
    private launchTaskboardService: LaunchTaskboardService) { }

  launchForm: FormGroup;

  ngOnInit(): void {
    this.launchForm = this.fb.group({
      allowLoggedInUser: [false],
      allowTaskboardUser: [false],
      allowTaskboardTeams: [false],
      allowWorkspaceUsers: [false],
      allowUsersList: [],
      allowTeamsList: []
    });
    this.loadPermission();
  }

  checkSelectedPermissionAllUsers() {
    if (this.launchForm.get('allowLoggedInUser').value === true) {
      this.launchForm.get('allowWorkspaceUsers').setValue(false);
      this.setPemissions();
    }
  }

  checkSelectedPermissionWorkspace() {
    this.launchForm.get('allowLoggedInUser').setValue(false);
    this.setPemissions();
  }

  setPemissions() {
    this.launchForm.get('allowTaskboardUser').setValue(false);
    this.launchForm.get('allowTaskboardTeams').setValue(false);
    this.launchForm.get('allowUsersList').setValue(null);
    this.launchForm.get('allowTeamsList').setValue(null);
  }

  checkSelectedPermissionWorkspaceAndAllUser() {
    this.launchForm.get('allowLoggedInUser').setValue(false);
    this.launchForm.get('allowWorkspaceUsers').setValue(false);
  }

  loadPermission() {
    if (this.data.launchPermissionVo) {
      this.launchForm.patchValue(this.data.launchPermissionVo);
    }
  }

  saveClose() {
    let launchPermissionVo = new LaunchPermissionVo();
    launchPermissionVo = this.launchForm.value;
    launchPermissionVo.taskboardId = this.data.taskboardId;
    this.launchTaskboardService.saveLaunchPermission(launchPermissionVo).subscribe(data => {
      if (data && data.response.includes('successfully')) {
        this.dialogRef.close(true);
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

}
