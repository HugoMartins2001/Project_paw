import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prato } from './prato.service';

export interface Menu {
  _id: string;
  nome: string;
  descricao?: string;
  imagem?: string;
  pratos?: Prato[];
}
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:3000/api/menus';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    if (typeof window === 'undefined') return new HttpHeaders();
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  criarMenu(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/criar`, formData, {
      headers: this.getHeaders()
    });
  }

  listarMenus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, {
      headers: this.getHeaders()
    });
  }

  obterMenuPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/detalhes`, {
      headers: this.getHeaders()
    });
  }

  eliminarMenu(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/apagar`, {}, {
      headers: this.getHeaders()
    });
  }

  editarMenu(id: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/editar`, formData, {
      headers: this.getHeaders()
    });
  }
}
