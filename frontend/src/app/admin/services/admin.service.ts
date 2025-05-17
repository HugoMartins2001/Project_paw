import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin'; // Ajusta conforme o teu backend

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    };
  }

  getLogs(filters: any = {}, page: number = 1): Observable<any> {
    let params = new HttpParams().set('page', page);
    Object.keys(filters).forEach(key => {
      if (filters[key]) params = params.set(key, filters[key]);
    });
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/logs`, { params, headers });
  }

  deleteLog(logId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/logs/${logId}/delete`, { headers });
  }

  deleteAllLogs(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/logs/deleteAll`, { headers });
  }
}