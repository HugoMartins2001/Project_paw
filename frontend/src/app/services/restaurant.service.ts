import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Restaurant {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  restaurantEmail?: string;
  restaurantPic?: string;
  openingHours?: any;
  paymentMethods?: string[];
  menus?: any[];
  managerId?: string | { _id: string };
  isApproved?: boolean;
  isVisible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = 'http://localhost:3000/api/restaurants/showRestaurants';
  private apiUrlByName = 'http://localhost:3000/api/restaurants/showRestaurant';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    if (typeof window === 'undefined') return new HttpHeaders();
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<{ restaurants: Restaurant[] }>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(res => res.restaurants),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  getRestaurantByName(name: string): Observable<{ restaurant: Restaurant }> {
    return this.http.get<{ restaurant: Restaurant }>(`${this.apiUrlByName}/${name}?t=${Date.now()}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return throwError(() => new Error('Restaurant not found'));
        }
        return throwError(() => error);
      })
    );
  }

  deleteRestaurant(id: string): Observable<void> {
    return this.http.post<void>(`http://localhost:3000/api/deleteRestaurant/${id}`, {
      headers: this.getHeaders()
    });
  }

  createRestaurant(restaurant: FormData): Observable<Restaurant> {
    return this.http.post<Restaurant>(
      'http://localhost:3000/api/restaurants/submittedRestaurant',
      restaurant,
      { headers: this.getHeaders() } // <-- Adiciona aqui
    ).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  getMenus(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/api/menus/showMenus', { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`http://localhost:3000/api/restaurants/editRestaurant/${id}`,
      { headers: this.getHeaders() }
    );
  }

  updateRestaurantById(id: string, data: FormData): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/api/restaurants/editRestaurant/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }
}