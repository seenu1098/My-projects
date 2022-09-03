import { Injectable } from '@angular/core';
import { MicrosoftLoginDetails } from '../login-vo';

@Injectable({
  providedIn: 'root'
})
export class MicrosoftAuthReturnService {

  constructor() { }

  microsoftLoginDetails: MicrosoftLoginDetails;
  microsoftToken: any;
  fromMicrosoft = false;

  setMicrosoftTokenDetails(microsoftLoginDetails: MicrosoftLoginDetails, microsoftToken: any) {
    this.microsoftLoginDetails = microsoftLoginDetails;
    this.microsoftToken = microsoftToken;
    this.fromMicrosoft = true;
  }

  setMicrosoftTokenDetailsLoggedIn() {
    this.fromMicrosoft = false;
  }
}
