import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin'; // Ajusta conforme o teu backend

  constructor(private http: HttpClient) {}


  getLogs(filters: any = {}, page: number = 1): Observable<any> {
    let params = new HttpParams().set('page', page);
    Object.keys(filters).forEach(key => {
      if (filters[key]) params = params.set(key, filters[key]);
    });
    const headers = {
      Authorization: 'Bearer ' + localStorage.getItem('token') // ou onde guardas o token
    };
    return this.http.get<any>(`${this.apiUrl}/logs`, { params, headers });
  }

  deleteLog(logId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logs/${logId}/delete`, { withCredentials: true });
  }

  deleteAllLogs(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logs/deleteAll`, { withCredentials: true });
  }
}