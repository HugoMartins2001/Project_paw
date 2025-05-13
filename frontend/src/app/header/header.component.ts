import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private router: Router) {}

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  navigateToMenu(): void {
    this.router.navigate(['/restaurants']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']); // Substitua pela rota de login
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']); // Substitua pela rota de registro
  }
}