import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminManagerGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(): boolean {
        const role = localStorage.getItem('role');
        if (role === 'Client' || role === 'Manager' ) {
            this.router.navigate(['/clientHome']);
            return false;
        }
        // Permite acesso a Admin, Manager e não autenticados
        return true;
    }
}