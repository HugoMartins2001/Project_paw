import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../services/restaurant.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class RestaurantsComponent implements OnInit {
  restaurants: any[] = [];
  isLoading = true;

  constructor(private restaurantService: RestaurantService) { }

  // No seu restaurants.component.ts
  userRole = localStorage.getItem('role');
  userId = localStorage.getItem('userId');

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        console.log('Resposta da API:', data);
        if (Array.isArray(data)) {
          this.restaurants = data;
        } else {
          this.restaurants = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  getOpeningHours(openingHours: any): { day: string; start?: string; end?: string; closed: boolean }[] {
    const days = Object.keys(openingHours);
    return days.map((day) => ({
      day: day,
      start: openingHours[day]?.start || '',
      end: openingHours[day]?.end || '',
      closed: openingHours[day]?.closed || false,
    }));
  }

  deleteRestaurant(id: string): void {
    const confirmar = confirm('Tens a certeza que queres apagar este restaurante?');
    if (confirmar) {
      this.restaurantService.deleteRestaurant(id).subscribe({
        next: () => {
          this.restaurants = this.restaurants.filter(r => r._id !== id);
        },
        error: (err) => {
          alert(err.error?.message || 'Erro ao eliminar restaurante!');
        }
      });
    }
  }
}

