import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users/showUsers';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  getUsers(): Observable<User[]> {
    return this.http.get<{ users: User[] }>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map(res => res.users ?? []), // <-- extrai o array users
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  blockUser(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/block/${id}`, {}, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}