import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule]
})
export class HeaderComponent {
  userName: string | null = null;

  constructor(private router: Router) {
    // Atualiza userName sempre que a navegação termina
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.userName = localStorage.getItem('name');
      }
    });
  }

  ngOnInit() {
    this.userName = localStorage.getItem('name');
  }

  navigateToHome(): void { this.router.navigate(['/home']); }
  navigateToMenu(): void { this.router.navigate(['/restaurants']); }
  navigateToLogin(): void { this.router.navigate(['/login']); }
  navigateToRegister(): void { this.router.navigate(['/register']); }

  logout(): void {
    localStorage.clear();
    this.userName = null;
    this.router.navigate(['/']);
  }
}

