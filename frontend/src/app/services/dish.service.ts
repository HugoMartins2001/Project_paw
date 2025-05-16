import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Dish {
  _id: string;
  name: string;
  // Adiciona outros campos se necessário (ex: price, description, etc)
}

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private apiUrl = 'http://localhost:3000/api/dishes/showDishes';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  getDishes(): Observable<Dish[]> {
    return this.http.get<{ dishes: Dish[] }>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(res => res.dishes),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}