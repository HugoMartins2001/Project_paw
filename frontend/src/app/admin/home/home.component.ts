import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user: any = null;

  constructor(private router: Router) { }

  ngOnInit() {
    this.user = localStorage.getItem('token');
  }

  navigateToMenus() { this.router.navigate(['/menus']); }
  navigateToRestaurants() { this.router.navigate(['/restaurants']); }
  navigateToRegister() { this.router.navigate(['/register']); }
  navigateToDishes() { this.router.navigate(['/dishes']); }
}