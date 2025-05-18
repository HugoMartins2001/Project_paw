import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ProfileService, ProfileResponse } from '../admin/services/profile.service';
import { CartService } from '../admin/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  userRole: string | null = null;
  timeLeft: number = 600; // 10 minutos em segundos
  interval: any;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    public cartService: CartService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadUserData();
      }
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  loadUserData() {
    this.profileService.getProfile().subscribe({
      next: (profile: ProfileResponse) => {
        this.userName = profile.user?.name || null;
        this.userRole = profile.user?.role || null;
        // Se quiseres, podes atualizar o localStorage aqui também:
        localStorage.setItem('name', this.userName ?? '');
        localStorage.setItem('role', this.userRole ?? '');
      },
      error: () => {
        this.userName = null;
        this.userRole = null;
      }
    });
  }

  startTimer() {
    const start = this.cartService.getCartStartTime();
    if (start) {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      this.timeLeft = Math.max(600 - elapsed, 0);
    } else {
      this.timeLeft = 600;
    }
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.cartService.clearCart();
        clearInterval(this.interval);
        // Opcional: alerta
        // alert('Tempo esgotado! O carrinho foi limpo.');
      }
    }, 1000);
  }

  get minutes() {
    return Math.floor(this.timeLeft / 60);
  }
  get seconds() {
    return this.timeLeft % 60;
  }

  navigateToHome(): void { this.router.navigate(['/home']); }
  navigateToClientHome(): void { this.router.navigate(['/clientHome']); }
  navigateToRestaurant(): void { this.router.navigate(['/restaurants']); }
  navigateToRestaurantApproval(): void { this.router.navigate(['/restaurantApprove']); }
  navigateToDashboard(): void { this.router.navigate(['/dashboard']); }
  navigateToLogs(): void { this.router.navigate(['/logs']); }
  navigateToUsers(): void { this.router.navigate(['/users']); }
  navigateToLogin(): void { this.router.navigate(['/login']); }
  navigateToRegister(): void { this.router.navigate(['/register']); }
  navigateToMenus(): void { this.router.navigate(['/menus']); }
  navigateToDishes(): void { this.router.navigate(['/dishes']); }
  navigateToOrders(): void { this.router.navigate(['/orders']); }
  navigateToProfile(): void { this.router.navigate(['/profile']); }
  navigateToAbout(): void { this.router.navigate(['/about']); }
  navigateToContact(): void { this.router.navigate(['/contacts']); }
  navigateToCart(): void { this.router.navigate(['/cart']); }

  logout(): void {
    Swal.fire({
      title: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        this.userName = null;
        this.router.navigate(['/']);
        Swal.fire({
          icon: 'success',
          title: 'Session ended!',
          timer: 1200,
          showConfirmButton: false
        });
      }
    });
  }

  clearCart(event: Event) {
    event.stopPropagation();
    this.cartService.clearCart();
  }
}
