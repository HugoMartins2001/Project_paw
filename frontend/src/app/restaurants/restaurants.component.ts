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

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit(): void {
    this.fetchRestaurants();
  }

 fetchRestaurants(): void {
  this.restaurantService.getRestaurants().subscribe({
    next: (data) => {
      if (data && Array.isArray(data.restaurants)) {
        this.restaurants = data.restaurants; // Acesse a propriedade 'restaurants'
      } else {
        console.error('Os dados recebidos não contêm um array de restaurantes:', data);
        this.restaurants = [];
      }
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Erro ao buscar restaurantes:', err);
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
}

