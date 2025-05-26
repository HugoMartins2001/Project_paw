import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:3000/api/contact/sendEmail';

  constructor(private http: HttpClient) {}

  sendContact(data: { name: string; email: string; message: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}