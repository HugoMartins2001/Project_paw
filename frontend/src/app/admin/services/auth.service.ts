import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registerSubmitted`, userData);
  }

  setSession(token: string, userID: string) {
    console.log('[AuthService] setSession - token:', token);
    console.log('[AuthService] setSession - userID:', userID);
    localStorage.setItem('token', token);
    localStorage.setItem('userID', userID);
    this.isLoggedInSubject.next(true);
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('[AuthService] getToken:', token);
    return token;
  }

  getUserID(): string | null {
    const userID = localStorage.getItem('userID');
    console.log('[AuthService] getUserID:', userID);
    return userID;
  }

  logout(): void {
    console.log('[AuthService] logout');
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    this.isLoggedInSubject.next(false);
  }

  get isLoggedIn$() {
    return this.isLoggedInSubject.asObservable();
  }

  private hasToken(): boolean {
    const has = !!localStorage.getItem('token');
    console.log('[AuthService] hasToken:', has);
    return has;
  }
}
