import { Component, OnInit } from '@angular/core';
import { StompClientService } from 'src/app/message-module/stomp-client.service';

@Component({
  selector: 'app-my-pending-task',
  templateUrl: './my-pending-task.component.html',
  styleUrls: ['./my-pending-task.component.scss']
})
export class MyPendingTaskComponent implements OnInit {

  constructor(private stompClientService: StompClientService) { }

  ngOnInit() {
  }

}
