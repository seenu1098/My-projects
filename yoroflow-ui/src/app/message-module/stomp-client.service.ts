import { Injectable } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class StompClientService {

  constructor() {
  }

  private serverUrl = '/messaging-service/socket';
  isLoaded = false;
  isCustomSocketOpened = false;
  show = false;
  public stompClient;
  reconnectInterval: any;

  getToken() {
    return localStorage.getItem('token');
  }


  getHeader() {
    const httpOptions = {
      Authorization: this.getToken()
    };
    return httpOptions;
  }

  initializeWebSocketConnection() {
    let ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    this.stompClient.debug = null;
    this.stompClient.reconnect_delay = 5000;
    this.stompClient.connect(this.getHeader(), (frame) => {
      this.isLoaded = true;
      this.show = true;
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
      }
    }, (error) => {
      if (!this.reconnectInterval) {
        this.reconnect();
      }
    });
    return this.stompClient;
  }

  reconnect(): void {
    this.reconnectInterval = setInterval(() => {
      this.initializeWebSocketConnection();
    }, 1000);
  }
}


