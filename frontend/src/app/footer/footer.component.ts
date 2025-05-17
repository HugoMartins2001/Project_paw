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

  navigateToHome(): void { this.router.navigate(['/home']); }
  navigateToMenu(): void { this.router.navigate(['/menus']); }
  navigateToLogin(): void { this.router.navigate(['/login']); }
  navigateToRestaurant(): void { this.router.navigate(['/restaurants']); }
  navigateToAbout(): void { this.router.navigate(['/about']); }
  navigateToContact(): void { this.router.navigate(['/contact']); }
  navigateToRegister(): void { this.router.navigate(['/register']); }


}
