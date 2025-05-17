import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ProfileService, ProfileResponse } from '../admin/services/profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule]
})
export class HeaderComponent implements OnInit {
  userName: string | null = null;
  userRole: string | null = null;

  constructor(
    private router: Router,
    private profileService: ProfileService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadUserData();
      }
    });
  }

  ngOnInit() {
    this.loadUserData();
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
  navigateToContact(): void { this.router.navigate(['/contact']); }

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
}
