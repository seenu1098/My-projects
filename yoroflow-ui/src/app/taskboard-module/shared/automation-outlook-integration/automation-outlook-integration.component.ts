import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Field, Page } from 'src/app/rendering-module/shared/vo/page-vo';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { BoardGroups, Users } from '../../event-automation/event-automation.model';
import { UserVO } from '../models/assign-user-vo';
import { ActionMap, ChipModel, ToRecepientEmailAddress } from './outlook-action-model';

@Component({
  selector: 'app-automation-outlook-integration',
  templateUrl: './automation-outlook-integration.component.html',
  styleUrls: ['./automation-outlook-integration.component.scss']
})
export class AutomationOutlookIntegrationComponent implements OnInit {

  @Input() userList: UserVO[] = [];
  @Input() allUsers: UserVO[] = [];
  @Input() groupList: BoardGroups[] = [];
  @Input() users: Users[] = [];
  @Input() selectedScript: any;
  @Input() page = new Page();
  @Output() columnNameEmit: EventEmitter<any> = new EventEmitter<any>();

  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  toMail = new FormControl();
  ccMail = new FormControl();
  filteredToUsers: Observable<UserVO[]>;
  filteredCcUsers: Observable<UserVO[]>;
  selectedToUsers: ChipModel[] = [];
  selectedCcUsers: ChipModel[] = [];
  toMailFields: Field[] = [];
  ccMailFields: Field[] = [];
  selectedDynamicToEMails: string[] = [];
  selectedDynamicCcEMails: string[] = [];

  @ViewChild('toInput', { static: false }) toInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto1', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('ccInput', { static: false }) ccInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto2', { static: false }) auto: MatAutocomplete;

  constructor(private fb: FormBuilder, private snackbar: MatSnackBar) {
    this.filteredToUsers = this.toMail.valueChanges.pipe(
      map((data: string | null) => data ? this.filter(data) : this.userList));
    this.filteredCcUsers = this.ccMail.valueChanges.pipe(
      map((data: string | null) => data ? this.filter(data) : this.userList));
  }

  ngOnInit(): void {
    this.loadEmailFields();
    if (this.selectedScript?.keyValuePair?.actionSpecificMaps?.toRecepientEmailAddress?.length > 0) {
      this.selectedScript?.keyValuePair?.actionSpecificMaps?.toRecepientEmailAddress.forEach(e => {
        // if (e.variableType === 'constant') {
        this.selectedToUsers.push({ name: e.name, type: e.variableType });
        // } else {
        if (e.variableType !== 'constant') {
          const field = this.toMailFields.find(m => m.name === e.name)
          if (field) {
            field.isSelected = true;
            this.selectedDynamicToEMails.push(field.label.labelName);
          }
        }
      });
    }
    if (this.selectedScript?.keyValuePair?.actionSpecificMaps?.ccRecepientEmails?.length > 0) {
      this.selectedScript?.keyValuePair?.actionSpecificMaps?.ccRecepientEmails.forEach(e => {
        // if (e.variableType === 'constant') {
        this.selectedCcUsers.push({ name: e.name, type: e.variableType });
        // } else {
        //   const field = this.ccMailFields.find(m => m.name === e.name)
        //   field.isSelected = true;
        //   this.selectedDynamicCcEMails.push(field.label.labelName);
        // }
        if (e.variableType !== 'constant') {
          const field = this.toMailFields.find(m => m.name === e.name)
          if (field) {
            field.isSelected = true;
            this.selectedDynamicCcEMails.push(field.label.labelName);
          }
        }
      });
    }
  }

  loadEmailFields(): void {
    this.page.sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'email') {
            column.field.isSelected = false;
            this.toMailFields.push(JSON.parse(JSON.stringify(column.field)));
            this.ccMailFields.push(JSON.parse(JSON.stringify(column.field)));
          }
        });
      });
    });
  }

  private filter(filterValue: string): UserVO[] {
    const userVO: UserVO[] = [];
    this.userList.forEach(user => {
      const firstName = user.firstName.toLowerCase();
      const lastName = user.lastName.toLowerCase();
      const searchData = filterValue.toLowerCase();
      if (firstName.includes(searchData) || lastName.includes(searchData)) {
        userVO.push(user);
      }
    });
    return userVO;
  }

  removeToUser(user: ChipModel): void {
    const index = this.selectedToUsers.indexOf(user);
    this.selectedToUsers.splice(index, 1);
  }

  removeCcUser(user: ChipModel): void {
    const index = this.selectedCcUsers.indexOf(user);
    this.selectedCcUsers.splice(index, 1);
  }

  selectedToUser(event: MatAutocompleteSelectedEvent): void {
    // this.selectedDynamicToEMails.push(event.option.value);
    this.selectedToUsers.push({ name: event.option.value, type: 'fieldType' })
    this.toInput.nativeElement.value = '';
    this.toMail.setValue(null);
  }

  selectedCcUser(event: MatAutocompleteSelectedEvent): void {
    // this.selectedDynamicCcEMails.push(event.option.value);
    this.selectedCcUsers.push({ name: event.option.value, type: 'fieldType' });
    this.ccInput.nativeElement.value = '';
    this.ccMail.setValue(null);
  }

  addToUser(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const value = event.value;
      if (this.checkEmailValidation(value)) {
        if ((value || '').trim()) {
          this.selectedToUsers.push({ name: value.trim(), type: 'constant' });
        }
        this.toInput.nativeElement.value = '';
        this.toMail.setValue(null);
      } else {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: 'Email is not valid'
        });
      }
    }
  }

  addCcUser(event: MatChipInputEvent): void {
    if (!this.auto.isOpen) {
      const value = event.value;
      if (this.checkEmailValidation(value)) {
        if ((value || '').trim()) {
          this.selectedCcUsers.push({ name: value.trim(), type: 'constant' });
        }
        this.ccInput.nativeElement.value = '';
        this.ccMail.setValue(null);
      } else {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: 'Email is not valid'
        });
      }
    }
  }

  checkEmailValidation(email: string): boolean {
    const form: FormGroup = this.fb.group({ emailField: [email, Validators.email] });
    if (form.valid) {
      return true;
    } else {
      return false;
    }
  }

  applyMail(): void {
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.value);
    var toMail: string;
    for (let i = 0; i < this.selectedToUsers.length; i++) {
      if (i === 0) {
        toMail = this.selectedToUsers[i].name;
      } else {
        toMail = toMail + ' ,' + this.selectedToUsers[i].name;
      }
    }
    this.selectedDynamicToEMails?.forEach(m => {
      if (toMail === undefined || toMail === null || toMail === '') {
        toMail = m;
      } else {
        toMail = toMail + ' ,' + m;
      }
    })
    this.selectedScript.words[index] = toMail;
    this.selectedScript.keyValuePair.assignee = toMail;
    this.selectedScript.keyValuePair.toMail = toMail;
    this.selectedScript.keyValuePair.value = toMail;
    this.selectedScript.keyValuePair.ccMail = this.selectedCcUsers;
    const actionMap = new ActionMap();
    const emailAdressList: ToRecepientEmailAddress[] = [];
    this.selectedToUsers?.forEach(user => {
      const toEmailAddress = new ToRecepientEmailAddress();
      toEmailAddress.address = user.name;
      toEmailAddress.name = user.name;
      toEmailAddress.variableType = user.type;
      emailAdressList.push(toEmailAddress);
    });
    this.selectedDynamicToEMails?.forEach(m => {
      const toEmailAddress = new ToRecepientEmailAddress();
      toEmailAddress.address = m;
      toEmailAddress.name = m;
      toEmailAddress.variableType = 'fieldType';
      emailAdressList.push(toEmailAddress);
    })
    actionMap.toRecepientEmailAddress = emailAdressList;
    const ccEmailAdressList: ToRecepientEmailAddress[] = [];
    this.selectedCcUsers?.forEach(user => {
      const toEmailAddress = new ToRecepientEmailAddress();
      toEmailAddress.address = user.name;
      toEmailAddress.name = user.name;
      toEmailAddress.variableType = user.type;
      ccEmailAdressList.push(toEmailAddress);
    });
    this.selectedDynamicCcEMails?.forEach(m => {
      const toEmailAddress = new ToRecepientEmailAddress();
      toEmailAddress.address = m;
      toEmailAddress.name = m;
      toEmailAddress.variableType = 'fieldType';
      ccEmailAdressList.push(toEmailAddress);
    })
    actionMap.ccRecepientEmails = ccEmailAdressList;
    actionMap.header = this.selectedScript.keyValuePair?.actionSpecificMaps?.header;
    actionMap.location = this.selectedScript.keyValuePair?.actionSpecificMaps?.location;
    actionMap.startTime = this.selectedScript.keyValuePair?.actionSpecificMaps?.startTime;
    actionMap.endTime = this.selectedScript.keyValuePair?.actionSpecificMaps?.endTime;
    actionMap.enableVirtualMeeting = this.selectedScript.keyValuePair?.actionSpecificMaps?.enableVirtualMeeting;
    actionMap.meetingApp = this.selectedScript.keyValuePair?.actionSpecificMaps?.meetingApp;
    this.selectedScript.keyValuePair.actionSpecificMaps = actionMap;
    this.columnNameEmit.emit(true);
  }

  setToEmailFields(field: Field): void {
    if (field.isSelected === false) {
      field.isSelected = true;
    } else {
      field.isSelected = false;
    }
    this.selectedDynamicToEMails = [];
    this.toMailFields.forEach(m => {
      if (m.isSelected === true) {
        this.selectedDynamicToEMails.push(m.name);
      }
    });
  }

  setCcEmailFields(field: Field): void {
    if (field.isSelected === false) {
      field.isSelected = true;
    } else {
      field.isSelected = false;
    }
    this.selectedDynamicCcEMails = [];
    this.ccMailFields.forEach(m => {
      if (m.isSelected === true) {
        this.selectedDynamicCcEMails.push(m.name);
      }
    });
  }

  // getBackground(userId: string): string {
  //   const user = this.allUsers.find(u => u.userId === userId);
  // }

}
