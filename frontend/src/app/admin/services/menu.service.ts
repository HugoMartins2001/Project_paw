import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Menu {
    _id: string;
    name: string;
    managerId?: string | { _id: string }; 
    dishes?: any[];
    menuPic?: string;
    isVisible?: boolean;
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

    getMenus(params: any = {}): Observable<any> {
        return this.http.get<any>('http://localhost:3000/api/menus/showMenus', {
            params,
            headers: this.getHeaders()
        });
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
        return this.http.put<any>(`http://localhost:3000/api/menus/editMenu/${id}`,
            data,
            { headers: this.getHeaders() }
        );
    }

    deleteMenu(id: string): Observable<void> {
        const url = `http://localhost:3000/api/menus/deleteMenu/${id}`;
        return this.http.delete<void>(url, {
            headers: this.getHeaders()
        }).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Erro ao apagar menu:', error);
                return throwError(() => error);
            })
        );
    }

    toggleVisibility(id: string, isVisible: boolean): Observable<any> {
        return this.http.patch<any>(`http://localhost:3000/api/menus/toggleVisibility/${id}`,
            { isVisible },
            { headers: this.getHeaders() }
        );
    }
}