import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Menu {
    _id: string;
    name: string;
    dishes: any[]; // Podes tipar melhor se tiveres interface Dish
    menuPic?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private apiUrl = 'http://localhost:3000/api/menus/showMenus';
    private apiUrlById = 'http://localhost:3000/api/menus/showMenu';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        if (typeof window === 'undefined') return new HttpHeaders();
        const token = localStorage.getItem('token');
        return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
    }

    getMenus(): Observable<Menu[]> {
        return this.http.get<{ menus: Menu[] }>(this.apiUrl, { headers: this.getHeaders() }).pipe(
            map(res => res.menus),
            catchError((error: HttpErrorResponse) => throwError(() => error))
        );
    }

    getMenuById(id: string): Observable<Menu> {
        return this.http.get<{ menu: Menu }>(`${this.apiUrlById}/${id}`, { headers: this.getHeaders() })
            .pipe(map(res => res.menu));
    }

    createMenu(menu: FormData): Observable<Menu> {
        return this.http.post<Menu>('http://localhost:3000/api/menus/submittedMenu',
            menu,
            { headers: this.getHeaders() }
        ).pipe(
            catchError((error: HttpErrorResponse) => throwError(() => error))
        );
    }

    updateMenuById(id: string, data: FormData): Observable<any> {
        return this.http.post<any>(`http://localhost:3000/api/menus/editMenu/${id}`,
            data,
            { headers: this.getHeaders() }
        );
    }

    deleteMenu(id: string): Observable<void> {
        return this.http.post<void>(`http://localhost:3000/api/menus/deleteMenu/${id}`,
            {},
            { headers: this.getHeaders() }
        );
    }
}