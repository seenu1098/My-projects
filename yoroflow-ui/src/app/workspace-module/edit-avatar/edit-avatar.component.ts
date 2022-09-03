import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { WorkspaceVO } from '../create-dialog/create-dialog-vo';
import { CreateDialogService } from '../create-dialog/create-dialog.service';

@Component({
  selector: 'app-edit-avatar',
  templateUrl: './edit-avatar.component.html',
  styleUrls: ['./edit-avatar.component.scss']
})
export class EditAvatarComponent implements OnInit {
  selectedAvatarColor: any;
  workspaceVO = new WorkspaceVO();

    form:FormGroup;
    avatarColors = ["#FFB6C1", "#2c3e50", "#95a5a6", "#f39c12", "#1abc9c", "#0F2347", "#1C3F6E", "#2E67A0", "#5AACCF", "#EFFC93", "#80C271", "#28a745",
    "#695958", "#b6c8a9", "#c8ead3", "#cfffe5", "#cedada", "#A52A2A", "#F4C2C2", "#2E5894", "#967117", "#BD33A4", "#702963", "#CC5500", "#E97451", "#5F9EA0", "#2F847C",
    "#E4D00A", "#F88379", "#666699", "#26428B"];
  list: any;

  constructor(
    private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditAvatarComponent>,
    private dialog: MatDialog,
    private taskboardService: TaskBoardService,    private createDialogService: CreateDialogService,
    private snackBar: MatSnackBar,


  ) { 
    this.list=data
  }


  ngOnInit(): void {
  }
  changeAvatarColor(color) {
    this.list.workspaceAvatar = color;
    this.workspaceVO.workspaceAvatar = this.list.workspaceAvatar;
  }
  setUserProfilename(name) {
    const val = name.replace(/ /g, '');
    return val.charAt(0).toUpperCase();
  }
  create(){
    let workspaceVo = new WorkspaceVO()
    workspaceVo.workspaceAvatar=this.workspaceVO.workspaceAvatar;
    workspaceVo.workspaceId=this.list.workspaceId;
  this.createDialogService.saveAvatar(workspaceVo).subscribe(res => {
    if(res.response="Workspace Avatar Updated successfully"){
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: res.response
      });
      this.dialogRef.close(res);

    }
  });
  }
  dialogClose() {
    this.dialogRef.close(this.list);
  }

}
