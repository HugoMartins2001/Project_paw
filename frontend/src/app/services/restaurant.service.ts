import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private apiUrl = 'http://localhost:3000/api/restaurants/showRestaurants';
  private apiUrlByName = 'http://localhost:3000/api/restaurants/showRestaurant';

  constructor(private http: HttpClient) {}

  getRestaurants(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getRestaurantByName(name: string) {
  return this.http.get<any>(`${this.apiUrlByName}/${name}`).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 404) {
        // Pode lançar um erro customizado ou simplesmente repassar
        return throwError(() => new Error('Restaurant not found'));
      }
      return throwError(() => error);
    })
  );
}

}