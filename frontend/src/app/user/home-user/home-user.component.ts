import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-user',
  standalone: true,
  templateUrl: './home-user.component.html',
  styleUrls: ['../../client/home/client-home/client-home.component.css']
})
export class HomeUserComponent {
   constructor(private router: Router) { }

  navigateToMenus() { this.router.navigate(['/menus']); }
  navigateToRestaurants() { this.router.navigate(['/restaurants']); }
  navigateToRegister() { this.router.navigate(['/register']); }
  navigateToDishes() { this.router.navigate(['/dishes']); }

}
