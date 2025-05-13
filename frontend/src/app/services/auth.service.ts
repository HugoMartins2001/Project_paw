import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api'; // URL base do back-end

  constructor(private http: HttpClient) {}

  // Método para registar um usuário
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/registerSubmitted`, userData);
  }

  // Método para autenticar o usuário
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/loginSubmitted`, credentials);
  }
}