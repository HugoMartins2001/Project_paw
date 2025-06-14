import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private socket: Socket;
  private readonly SERVER_URL = 'http://localhost:3001';
  constructor() {
    this.socket = io(this.SERVER_URL, {
      withCredentials: true
    });
  }

  joinConversation(conversationId: string) {
    this.socket.emit('joinConversation', conversationId);
  }

  sendMessage(conversationId: string, message: any) {
    this.socket.emit('sendMessage', { conversationId, message });
  }

  onReceiveMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('receiveMessage', (msg) => {
        observer.next(msg);
      });
    });
  }

  joinUserRoom(userId: string) {
    this.socket.emit('joinUserRoom', userId);
  }

  onNewMessageNotification(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('newMessageNotification', (conversationId) => {
        observer.next(conversationId);
      });
    });
  }

  sendTyping(conversationId: string) {
    this.socket.emit('typing', { conversationId });
  }

  onTyping(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('typing', (data: any) => {
        observer.next(data);
      });
    });
  }

  joinAdminRoom() {
    this.socket.emit('joinAdminRoom');
  }

  disconnect() {
    this.socket.disconnect();
  }
}
