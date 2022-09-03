import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LicenceService {

  constructor() { }
  getmonthlylicenceList() {
    return [
      // { planname: 'Starter', payable:'FREE',button:'Buy Plan',color:'#01bde0',icon:'person' ,border:'2px solid #01bde0'},
      { planname: 'Business Pack', payable: '$ 18/Month', button: 'Buy Plan', color: '#662eb3', icon: 'people', border: '2px solid #662eb3' },
      { planname: 'Standard', payable: '$ 22/Month', button: 'Buy Plan', color: '#d82160', border: '2px solid #d82160' },
      { planname: 'Pro', payable: '$ 28/Month', button: 'Buy Plan', color: '#ff6f4d', icon: 'groups', border: '2px solid #ff6f4d' },
    ]
  }
  getyearlylicenceList() {
    return [
      // { planname: 'Starter', payable:'FREE',button:'Buy Plan',color:'#01bde0',icon:'person',border:'2px solid #01bde0' },
      { planname: 'Business Pack', payable: '$ 15/Year', button: 'Buy Plan', color: '#662eb3', icon: 'people', border: '2px solid #662eb3' },
      { planname: 'Standard', payable: '$ 18/Year', button: 'Buy Plan', color: '#d82160', border: '2px solid #d82160' },
      { planname: 'Pro', payable: '$ 23/Year', button: 'Buy Plan', color: '#ff6f4d', icon: 'groups', border: '2px solid #ff6f4d' },
    ]
  }
}
