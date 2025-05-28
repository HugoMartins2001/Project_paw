import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Dish {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  dishPic?: string;
  prices?: {
    pequena?: number;
    media?: number;
    grande?: number;
  };
  ingredients?: string[];
  nutrition?: {
    calories?: number;
    fat?: number;
    protein?: number;
    carbs?: number;
  };
  nutriScore?: string;
  allergens?: string[];
  menu?: { name?: string } | string;
  restaurant?: { name?: string } | string;
  restaurantId?: string;
  managerId?: string | { _id: string };
  isVisible: boolean;
  selectedSize?: string; 
  selectedPrice?: number; 
  quantity?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private apiUrl = 'http://localhost:3000/api/dishes/showDishes';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  getDishes(params: any = {}): Observable<any> {
    return this.http.get<any>('http://localhost:3000/api/dishes/showDishes', {
      params,
      headers: this.getHeaders()
    });
  }

  deleteDish(id: string): Observable<void> {
    const url = `http://localhost:3000/api/dishes/deleteDish/${id}`;
    return this.http.delete<void>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao apagar prato:', error);
        return throwError(() => error);
      })
    );
  }

  createDish(dishData: FormData): Observable<Dish> {
    const url = 'http://localhost:3000/api/dishes/submittedDish';
    return this.http.post<Dish>(url, dishData, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  updateDish(id: string, dishData: FormData): Observable<Dish> {
    const url = `http://localhost:3000/api/dishes/editDish/${id}`;
    return this.http.post<Dish>(url, dishData, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  getDishById(id: string): Observable<Dish> {
    const url = `http://localhost:3000/api/dishes/showDish/${id}`;
    return this.http.get<{ dish: Dish }>(url, { headers: this.getHeaders() }).pipe(
      map(res => res.dish),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  toggleVisibility(id: string, isVisible: boolean): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/api/dishes/toggleVisibility/${id}`,
      { isVisible },
      { headers: this.getHeaders() }
    ).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}