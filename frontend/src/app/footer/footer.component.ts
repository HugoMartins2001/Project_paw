import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  navigateToHome(): void {
    const role = localStorage.getItem('role');
    if (!role) {
      this.router.navigate(['/home/user']);
    } else if (role === 'Client') {
      this.router.navigate(['/client/home']);
    } else if (role === 'Admin' || role === 'Manager') {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/home/user']);
    }
  }
  navigateToMenu(): void {
    const role = localStorage.getItem('role');
    if (!role) {
      this.router.navigate(['/menus/user']);
    } else if (role === 'Client') {
      this.router.navigate(['/client/menus']);
    } else if (role === 'Admin' || role === 'Manager') {
      this.router.navigate(['/menus']);
    } else {
      this.router.navigate(['/menus/user']);
    }
  }
  navigateToRestaurant(): void {
    const role = localStorage.getItem('role');
    if (!role) {
      this.router.navigate(['/restaurants/user']);
    } else if (role === 'Client') {
      this.router.navigate(['/client/restaurant']);
    } else if (role === 'Admin' || role === 'Manager') {
      this.router.navigate(['/restaurants']);
    } else {
      this.router.navigate(['/restaurants/user']);
    }
  }
  navigateToAbout(): void { this.router.navigate(['/about']); }
  navigateToContact(): void { this.router.navigate(['/contact']); }
  navigateToRegister(): void { this.router.navigate(['/register']); }
  navigateToDishes(): void {
    const role = localStorage.getItem('role');
    if (!role) {
      this.router.navigate(['/dishes/user']);
    } else if (role === 'Client') {
      this.router.navigate(['/client/dishes']);
    } else if (role === 'Admin' || role === 'Manager') {
      this.router.navigate(['/dishes']);
    } else {
      this.router.navigate(['/dishes/user']);
    }
  }

}
