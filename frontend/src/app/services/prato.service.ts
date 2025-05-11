import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Prato {
  _id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  subcategoria?: string;
  imagem?: string;
  infoNutricional?: {
    calorias: number;
    proteinas: number;
    hidratos: number;
    gorduras: number;
  };
  alergenios?: string[];
  doses?: { nome: string; preco: number }[];
}
@Injectable({
  providedIn: 'root'
})
export class PratoService {
  private apiUrl = 'http://localhost:3000/api/pratos';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    if (typeof window === 'undefined') return new HttpHeaders();

    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  listarPratos(): Observable<Prato[]> {
    return this.http.get<Prato[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  apagarPrato(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  adicionarPrato(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  editarPrato(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData, { headers: this.getHeaders() });
  }

  obterPratoPorId(id: string): Observable<{ prato: Prato }> {
    return this.http.get<{ prato: Prato }>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

}
