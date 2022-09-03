import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MessagePassingService } from '../message-passing/message-passing.service';
import { UserVO } from '../message-passing/user-vo';


@Component({
  selector: 'lib-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  $event: any;
  getRaClaimList: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    private messageService: MessagePassingService) { }

  userVOList: UserVO[];
  userVO: UserVO;
  form: FormGroup;
  chatId: any;

  ngOnInit() {
    if (this.data.type === 'users-autocomplete') {
      this.form = this.fb.group({
        userId: [''],
        userName: ['', [Validators.required]]
      });
      this.chatId = this.data.chatId;
      this.getLoggedUserDetails();
      this.addUserNamesAutocompleteList();
    }
  }

  getLoggedUserDetails() {
    this.messageService.getLoggedInUserDetails().subscribe(data => {
      this.userVO = data;
    });
  }

  addUserNamesAutocompleteList() {
    this.form.get('userName').valueChanges.subscribe(data => {
      if (data != null && data !== '') {
        this.messageService.getUsersAutocompleteList(data).subscribe(usersList => {
          this.userVOList = usersList;
        });
      }
    });
  }

  setUserId(event, userId) {
    if (event.isUserInput === true) {
      this.form.get('userId').setValue(userId);
    }
  }

  addUsersToGroup() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.get('userId').value);
    }
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  deleteNotification(): void {
    this.dialogRef.close(true);
  }
}
