import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { LookupDataVO } from './lookup-data-vo';
import { MatSnackBar, MatDialog } from '@angular/material';
import { LookupDataService } from '../../shared/service/lookup-data-service';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';


@Component({
  selector: 'app-lookup-data',
  templateUrl: './lookup-data.component.html',
  styleUrls: ['./lookup-data.component.css']
})
export class LookupDataComponent implements OnInit {
  selected = '';
  lookupType: FormGroup;
  lookupDataVo = new LookupDataVO();
  response: LookupDataVO[] = [new LookupDataVO()];
  readonly = false;
  deleteButtonVisible = false;

  constructor(private fb: FormBuilder, private service: LookupDataService, private snackBar: MatSnackBar,
    private dialog: MatDialog) {
    this.loadLookUpTypesFromDb();
  }

  loadLookUpTypesFromDb(): void {
    this.service.getLookupDataCodeList().subscribe(data => {
      this.response = data;
    });
  }

  ngOnInit() {
    this.lookupType = this.fb.group({
      id: [this.lookupDataVo.id],
      code: [this.lookupDataVo.code, Validators.required],
      type: [this.lookupDataVo.type, Validators.required],
      description: [this.lookupDataVo.description, Validators.required]
    });
  }

  clear(action: string) {
    this.lookupDataVo = new LookupDataVO();
    this.readonly = false;
    if (action === 'reset') {
      this.snackBar.dismiss();
    }
    this.selected = '';
    this.deleteButtonVisible = false;
  }

  save(userForm: NgForm) {
    this.lookupDataVo = this.lookupType.value;
    if (userForm.valid) {
      this.service.save(this.lookupDataVo).subscribe(data => {
        userForm.resetForm();
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: data.response,
        });
        this.loadLookUpTypesFromDb();
        this.selected = '';
      });
    }
  }

  loadLookupDataInfo(event, userForm) {
    if (event.isUserInput) {
      this.lookupDataVo.id = event.source.value;
      this.deleteButtonVisible = true;
      userForm.resetForm();
    }
  }

  editLookupData() {
    this.service.getLookupDataInfo(this.lookupDataVo.id).subscribe(data => {
      this.lookupDataVo = data;
      this.readonly = true;
      this.ngOnInit();
    });
  }

  deleteLookupData(userForm: NgForm) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponent, {
      width: '250px',
      data: {
        id: this.lookupDataVo.id,
        serviceName: 'lookupdate',
        displayText: 'Lookup Data'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        userForm.resetForm();
        this.loadLookUpTypesFromDb();
      }
    });
  }
}
