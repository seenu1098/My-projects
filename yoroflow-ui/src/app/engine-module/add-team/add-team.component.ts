import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Group } from '../group/group-vo';
import { GroupService } from '../group/group-service';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { UserGroupAssociationComponent } from 'src/app/creation-module/user-group-association/user-group-association.component';
import { UserService } from 'src/app/rendering-module/shared/service/user-service';

@Component({
  selector: 'app-add-team',
  templateUrl: './add-team.component.html',
  styleUrls: ['./add-team.component.scss']
})
export class AddTeamComponent implements OnInit {
  form: FormGroup;
  group = new Group();
  avatarColors = ["#FFB6C1", "#2c3e50", "#95a5a6", "#f39c12", "#1abc9c", "#0F2347", "#1C3F6E", "#2E67A0", "#5AACCF", "#80C271", "#28a745",
    "#695958", "#b6c8a9", "#A52A2A", "#F4C2C2", "#2E5894", "#967117", "#BD33A4", "#702963", "#CC5500", "#E97451", "#5F9EA0", "#2F847C",
    "#E4D00A", "#F88379", "#666699", "#26428B", "#40bc86"];

  constructor(private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddTeamComponent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private groupService: GroupService, private userService: UserService) { }

  ngOnInit(): void {
    if (this.data && this.data.data) {
      this.group = this.data.data;
    }
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      color: [this.avatarColors[Math.floor(Math.random() * (25 - 0) + 0)]]
    });
    if (this.data.data !== null) {
      this.form = this.fb.group({
        id: [this.data.data.id],
        name: [{ value: this.data.data.name, disabled: true }, Validators.required],
        description: [this.data.data.description, Validators.required]
      });
    }
  }
  submit(userForm) {
    if (userForm.valid) {
      this.group = this.form.getRawValue();
      this.groupService.saveGroup(this.group).subscribe(data => {
        if (data.response.includes('exceeded your limit')) {
          const dialog = this.dialog.open(AlertmessageComponent, {
            width: '450px',
            data: { licenseVO: data.licenseVO, pageName: 'Security Group' }
          });
        } else if (data.response.includes('successfully')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });

          if (data.response !== 'Group Name Already Exist') {
            userForm.resetForm();
            this.form.get('name').enable();
          }
        }
        else if (data.response.includes('Updated Successfully')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.dialogRef.close(true);
        }
        else if (data.response.includes('Already Exist')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          userForm.resetForm();
        }
        if (data.userId !== null) {
          const dialog = this.dialog.open(UserGroupAssociationComponent, {
            disableClose: true,
            width: '65%',
            data: {
              groupId: data.userId,
              ownerList: [this.userService.userVO.userId]
            }
          });
          dialog.afterClosed().subscribe(data => {
            this.dialogRef.close(true);
          });
        }
      });
    }
  }

  reset(userForm) {
    userForm.resetForm();
    this.form.get('name').enable();
  }

  changeAvatarColor(color: string): void {
    this.group.color = color;
    this.form.get('color').setValue(color);
  }

  groupNameFirstLetter(): string {
    return this.group.name.charAt(0).toUpperCase();
  }

  updateTeamAvatar(): void {
    const team = new Group();
    team.id = this.group.id;
    team.name = this.group.name;
    team.description = this.group.description;
    team.color = this.group.color;
    this.groupService.saveGroup(team).subscribe(data => {
      this.dialogRef.close(true);
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

}
