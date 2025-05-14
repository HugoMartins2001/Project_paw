import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private apiUrl = 'http://localhost:3000/api/restaurants/showRestaurants';
  private apiUrlById = 'http://localhost:3000/api/restaurants/showRestaurant';

  constructor(private http: HttpClient) {}

  getRestaurants(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getRestaurantById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlById}/${id}`);
  }
}