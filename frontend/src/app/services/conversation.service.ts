import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private apiUrl = 'http://localhost:3000/api/chat';

  constructor(private http: HttpClient) {}

  getUserConversations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations`);
  }

  getMessages(conversationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages/${conversationId}`);
  }

  startConversation(participantIds: string[], type: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/conversation`, { participantIds, type });
  }
}
