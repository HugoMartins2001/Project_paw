import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registerSubmitted`, userData);
  }


  // Logout
  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
  }

  // Observable para status de login
  get isLoggedIn$() {
    return this.isLoggedInSubject.asObservable();
  }

  // Checa se há token salvo
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}
