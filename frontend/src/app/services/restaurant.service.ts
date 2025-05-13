import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private baseUrl = 'http://localhost:3000/api'; // URL base do back-end

  constructor(private http: HttpClient) {}

  // Método para buscar os restaurantes
  getRestaurants(): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurants/showRestaurants`);
  }
}