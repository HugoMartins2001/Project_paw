import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ProfileService, ProfileResponse } from '../admin/services/profile.service';
import { CartService } from '../admin/services/cart.service';
import { Subscription } from 'rxjs';

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
  cartSub!: Subscription;

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

    // Subscreve ao carrinho para reiniciar o timer sempre que muda
    this.cartSub = this.cartService.cart$.subscribe(cart => {
      this.startTimer();
    });
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    if (this.cartSub) this.cartSub.unsubscribe();
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
    if (this.interval) clearInterval(this.interval);

    const start = this.cartService.getCartStartTime();
    if (start && this.cartService.getCart().length > 0) {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      this.timeLeft = Math.max(600 - elapsed, 0);
      this.interval = setInterval(() => {
        if (this.cartService.getCart().length === 0) {
          this.timeLeft = 600;
          clearInterval(this.interval);
          return;
        }
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.cartService.clearCart();
          clearInterval(this.interval);
        }
      }, 1000);
    } else {
      this.timeLeft = 600;
    }
  }

  get minutes() {
    return Math.floor(this.timeLeft / 60);
  }
  get seconds() {
    return this.timeLeft % 60;
  }

  //Overall
  navigateToLogin(): void { this.router.navigate(['/login']); }
  navigateToRegister(): void { this.router.navigate(['/register']); }
  navigateToDashboard(): void { this.router.navigate(['/dashboard']); }
  navigateToHome(): void { this.router.navigate(['/home']); }

  //admin e manager
  navigateToMenus(): void { this.router.navigate(['/menus']); }
  navigateToDishes(): void { this.router.navigate(['/dishes']); }
  navigateToRestaurant(): void { this.router.navigate(['/restaurants']); }
  navigateToOrders(): void { this.router.navigate(['/orders']); }
  navigateToRestaurantApproval(): void { this.router.navigate(['/restaurantApprove']); }
  navigateToLogs(): void { this.router.navigate(['/logs']); }
  navigateToUsers(): void { this.router.navigate(['/users']); }

  //client
  navigateToClientHome(): void { this.router.navigate(['/clientHome']); }
  navigateToClientDishes(): void { this.router.navigate(['/client/dishes']); }
  navigateToClientMenus(): void { this.router.navigate(['/client/menus']); }
  navigateToClientRestaurant(): void { this.router.navigate(['/client/restaurant']); }
  navigateToClientProfile(): void { this.router.navigate(['/client/profile']); }
  navigateToAbout(): void { this.router.navigate(['/about']); }
  navigateToContact(): void { this.router.navigate(['/contacts']); }
  navigateToCart(): void { this.router.navigate(['/cart']); }
  navigateToProfile(): void { this.router.navigate(['/profile']); }

  //user
  navigateToMenusUser(): void { this.router.navigate(['menus/user']); }
  navigateToDishesUser(): void { this.router.navigate(['dishes/user']); }
  navigateToRestaurantUser(): void { this.router.navigate(['restaurant/user']); }


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
