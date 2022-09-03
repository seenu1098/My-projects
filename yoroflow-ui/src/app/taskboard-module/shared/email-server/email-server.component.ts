import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AutomationServiceService } from '../service/automation-service.service';

@Component({
  selector: 'app-email-server',
  templateUrl: './email-server.component.html',
  styleUrls: ['./email-server.component.scss']
})
export class EmailServerComponent implements OnInit {

  constructor(private automationService: AutomationServiceService) { }

  emailServers: any[] = [];
  spinnerShow: boolean = true;
  @Output() serverEmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() selectedScript: any;

  ngOnInit(): void {
    this.automationService.getEmailServers().subscribe(data => {
      if (data) {
        this.emailServers = data;
        this.spinnerShow = false;
      }
    })
  }

  getEmailServer(server: any): void {
    const index = this.selectedScript.words.findIndex(word => word === this.selectedScript.keyValuePair.value);
    this.selectedScript.words[index] = server.settingName;
    this.selectedScript.keyValuePair.value = server.settingName;
    this.serverEmit.emit(true);
  }

}
