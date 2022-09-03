import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { GroupService } from '../../engine-module/group/group-service';
import { SecurityVO, teamVO } from '../documents-vo';
import { DocumentsService } from '../documents.service';
@Component({
  selector: 'app-document-team-dialog-list',
  templateUrl: './document-team-dialog-list.component.html',
  styleUrls: ['./document-team-dialog-list.component.scss']
})
export class DocumentTeamDialogListComponent implements OnInit {
  form: FormGroup;
  groupList: any;
  removable = true;
  selectable = true;
  selectedTeam: any[] = [];
  deletedTeam: any[] = [];
  selectedTeamID: any[] = [];
  deletedTeamID: any[] = [];
  securityVO = new teamVO();
  updatePermission: boolean = false;
  readPermission: boolean = false;
  show: boolean = false;
  constructor(private snackBar: MatSnackBar, private documentservice: DocumentsService, private dialogRef: MatDialogRef<DocumentTeamDialogListComponent>,
    private groupService: GroupService,
    private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      searchTeam: [],
    });
    this.getTeamsList();
    this.formValueChanges();
  }
  getTeamsList() {
    this.groupService.getGroupList().subscribe(groups => {
      this.groupList = groups;
      for (let i = 0; i < this.groupList.length; i++) {
        this.groupList[i].randomColor = this.getRandomColor();
        this.groupList[i].isSelected = false;
        this.groupList[i].filter = true;
      }
      this.checkSelectedTeam();
    })
  }
  formValueChanges() {
    this.form.get('searchTeam').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        for (let i = 0; i < this.groupList.length; i++) {
          const searchData = data.toLowerCase();
          const name = this.groupList[i].name.toLowerCase();
          if (name.includes(searchData)) {
            this.groupList[i].filter = true;
          } else {
            this.groupList[i].filter = false;
          }
        }
      } else {
        for (let i = 0; i < this.groupList.length; i++) {
          this.groupList[i].filter = true;
        }
      }
    });
  }
  checkSelectedTeam() {
    if (this.data.list.length !== 0) {
      for (let i = 0; i < this.groupList.length; i++) {
        for (let j = 0; j < this.data.list.length; j++) {
          if (this.groupList[i].id === this.data.list[j].id) {
            if (this.data.type === 'read') {
              this.readPermission = true;
              this.updatePermission = false;
            }
            else {
              this.readPermission = true;
              this.updatePermission = true;
            }
            let teamsVO = new SecurityVO()
            teamsVO.groupId = this.data.list[j].id;
            teamsVO.readAllowed = this.readPermission;
            teamsVO.updateAllowed = this.updatePermission;
            this.groupList[i].isSelected = true;
            this.groupList[i].filter = false;
            this.selectedTeam.push(this.groupList[i]);
            this.selectedTeamID.push(teamsVO);
          }
        }
      }
    }
  }

  getRandomColor() {
    return (
      "#" +
      ("000000" + Math.floor(Math.random() * 16777216).toString(16)).substr(-6)
    );
  }

  dialogClose() {
    for (let j = 0; j < this.groupList.length; j++) {
      this.groupList[j].isSelected = false;
    }
    this.dialogRef.close();
  }
  selectAssigneeUser(user) {
    this.show = true;
    if (user) {
      if (this.data.type === 'read') {
        this.readPermission = true;
        this.updatePermission = false;
      }
      else {
        this.readPermission = true;
        this.updatePermission = true;
      }
      let teamsVO = new SecurityVO()
      user.isSelected = true;
      teamsVO.groupId = user.id
      teamsVO.readAllowed = this.readPermission;
      teamsVO.updateAllowed = this.updatePermission
      this.selectedTeam.push(user);
      this.selectedTeamID.push(teamsVO)
      this.securityVO.securityVOList = this.selectedTeamID;
    }
    this.form.get('searchTeam').setValue('')
  }

  removedAssigneeUser(user, index) {
    this.show = true;
    user.isSelected = false;
    this.deletedTeamID.push(user.id);
    this.securityVO.deletedTeamsIdList = this.deletedTeamID;
    for (let i = 0; i < this.selectedTeamID.length; i++) {
      if (this.selectedTeamID[i].groupId === user.id) {
        this.selectedTeamID.splice(i, 1)
      }
    }
  }

  setUserProfilename(user): string {
    return user.name.charAt(0).toUpperCase();
  }
  confirm() {
    this.securityVO.documentId = this.data.data.id;
    this.securityVO.type = this.data.type;
    this.securityVO.securityVOList = this.selectedTeamID;
    this.securityVO.deletedTeamsIdList = this.deletedTeamID;
    this.documentservice.saveTeam(this.securityVO).subscribe(res => {
      if (res.response.includes('successfully')) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: res.response,
        });
        this.dialogRef.close(this.securityVO);
      }
    })
  }
}
