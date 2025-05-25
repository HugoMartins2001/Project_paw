import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'http://localhost:3000/api/orders';

    constructor(private http: HttpClient) { }

    getClientOrders(): Observable<any> {
        const token = localStorage.getItem('token');
        return this.http.get<any>(
            `${this.apiUrl}/ordersHistory`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
    }
}