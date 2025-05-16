import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule]
})
export class HeaderComponent {
  userName: string | null = null;
  userRole: string | null = null;

  constructor(private router: Router) {
    // Atualiza userName e userRole sempre que a navegação termina
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.userName = localStorage.getItem('name');
        this.userRole = localStorage.getItem('role');
      }
    });
  }

  ngOnInit() {
    this.userName = localStorage.getItem('name');
    this.userRole = localStorage.getItem('role');
  }

  navigateToHome(): void { this.router.navigate(['/home']); }
  navigateToMenu(): void { this.router.navigate(['/restaurants']); }
  navigateToRestaurantApproval(): void { this.router.navigate(['/restaurantApprove']); }
  navigateToLogs(): void { this.router.navigate(['/logs']); }
  navigateToUsers(): void { this.router.navigate(['/users']); }
  navigateToLogin(): void { this.router.navigate(['/login']); }
  navigateToRegister(): void { this.router.navigate(['/register']); }
  navigateToMenus(): void { this.router.navigate(['/menus']); }
  navigateToDishes(): void { this.router.navigate(['/dishes']); }

  logout(): void {
  Swal.fire({
    title: 'Tem a certeza que quer sair?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, sair',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      this.userName = null;
      this.router.navigate(['/']);
      Swal.fire({
        icon: 'success',
        title: 'Sessão terminada!',
        timer: 1200,
        showConfirmButton: false
      });
    }
  });
}
}
