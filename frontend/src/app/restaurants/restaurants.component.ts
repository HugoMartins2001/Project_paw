import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../services/restaurant.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class RestaurantsComponent implements OnInit {
  restaurants: any[] = [];
  isLoading = true;

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar restaurantes:', err);
        this.isLoading = false;
      },
    });
  }
}