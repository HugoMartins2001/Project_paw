import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Torna o serviço disponível em toda a aplicação
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // URL base da API do backend

  constructor(private http: HttpClient) {}

  // Método para login
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/loginSubmitted`, { email, password });
  }
}