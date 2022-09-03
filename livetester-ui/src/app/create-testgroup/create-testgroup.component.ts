import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { TestGroupService } from '../../shared/service/test-group.service';
import { TestGroupVO } from '../../shared/vo/claim-vo';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';


@Component({
  selector: 'app-create-testgroup',
  templateUrl: './create-testgroup.component.html',
  styleUrls: ['./create-testgroup.component.css']
})
export class CreateTestgroupComponent implements OnInit {
  selected = '';
  readOnly = false;
  testGroupVOList: TestGroupVO[] = [new TestGroupVO()];
  testGroupVO = new TestGroupVO();
  testGroupForm: FormGroup;
  deleteButtonVisible = false;
  deleteBtnDisable = true;


  constructor(private fb: FormBuilder, private testGroupService: TestGroupService,
    private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.getTestGroupNames();
  }

  getTestGroupNames() {
    this.testGroupService.getTestCaseGroupList().subscribe(data => {
      this.testGroupVOList = data;
    });
  }

  ngOnInit() {
    this.testGroupForm = this.fb.group({
      id: [this.testGroupVO.id],
      testcaseGroupName: [this.testGroupVO.testcaseGroupName, Validators.required],
      description: [this.testGroupVO.description, Validators.required],
    });
  }

  save(userForm: NgForm) {
    if (userForm.valid) {
      this.testGroupVO = this.testGroupForm.value;

      this.testGroupService.save(this.testGroupVO).subscribe(data => {
        this.readOnly = false;
        userForm.resetForm();
        this.getTestGroupNames();

        this.snackBar.openFromComponent(SnackBarComponent, {
          data: data.response,
        });
        this.selected = '';
      });
    }
  }

  clearSearch(action: string) {
    this.testGroupForm.reset();
    this.testGroupVO.id = null;
    this.deleteButtonVisible = false;
    this.deleteBtnDisable = true;
    this.testGroupVO = new TestGroupVO();
    this.readOnly = false;
    if (action === 'reset') {
      this.snackBar.dismiss();
    }
    this.selected = '';
  }

  loadTestGroupInfo(event: any, userForm: NgForm) {
    if (event.isUserInput) {
      this.testGroupVO.id = event.source.value;
      this.deleteButtonVisible = true;
      userForm.resetForm();
    }
  }

  editTestGroup() {
    this.testGroupService.getTestCaseGroupInfo(this.testGroupVO.id).subscribe(data => {
      this.testGroupVO.id = data.id;
      this.testGroupVO = data;
      this.ngOnInit();
      this.readOnly = true;
      this.deleteBtnDisable = false;
    });
  }

  deleteTestGroup(userForm: NgForm) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponent, {
      width: '250px',
      data: {
        id: this.testGroupVO.id,
        serviceName: 'testgroup',
        displayText: 'Testcase Group'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        userForm.resetForm();
        this.clearSearch('clear');
        this.getTestGroupNames();
      }
    });
  }
}
