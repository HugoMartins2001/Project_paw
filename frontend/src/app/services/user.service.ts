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
    console.log('A fazer pedido GET para:', this.apiUrl);
    console.log('Headers:', this.getHeaders());

    return this.http.get<{ users: User[] }>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map(res => {
          console.log('Resposta recebida do backend:', res);
          return res.users ?? [];
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao buscar utilizadores:', error);
          return throwError(() => error);
        })
      );
  }

  blockUser(id: string): Observable<any> {
    const url = `http://localhost:3000/api/users/block/${id}`;
    return this.http.post<any>(url, {}, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}