import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'http://localhost:3000/api/orders';

    constructor(private http: HttpClient) { }

    getClientOrders(params?: any): Observable<any> {
        const token = localStorage.getItem('token');
        return this.http.get<any>(
            `${this.apiUrl}/ordersHistory`,
            {
                headers: { Authorization: `Bearer ${token}` },
                params
            }
        );
    }

    deleteOrder(orderId: string): Observable<any> {
        const token = localStorage.getItem('token');
        return this.http.delete<any>(
            `${this.apiUrl}/${orderId}/delete`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
    }
}