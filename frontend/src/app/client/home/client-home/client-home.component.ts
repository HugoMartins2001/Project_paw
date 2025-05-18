import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-client-home',
  imports: [],
  templateUrl: './client-home.component.html',
  styleUrl: './client-home.component.css'
})
export class ClientHomeComponent {
  constructor(private router: Router) { }

  navigateToMenus() { this.router.navigate(['/client/menus']); }
  navigateToRestaurants() { this.router.navigate(['/client/restaurant']); }
  navigateToRegister() { this.router.navigate(['/register']); }
  navigateToDishes() { this.router.navigate(['/client/dishes']); }

}
