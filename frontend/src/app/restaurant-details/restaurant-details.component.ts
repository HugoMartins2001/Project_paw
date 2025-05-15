import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../services/restaurant.service';

@Component({
  selector: 'app-restaurant-details',
  templateUrl: './restaurant-details.component.html',
  styleUrls: ['./restaurant-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class RestaurantDetailsComponent implements OnInit {

  restaurant: any = null;
  isLoading = true;

  constructor(
    private restaurantService: RestaurantService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (name) {
      this.fetchRestaurant(name);
    }
  }
  

  fetchRestaurant(name: string): void {
  this.restaurantService.getRestaurantByName(name).subscribe({
    next: (data) => {
      if (data && data.restaurant) {
        this.restaurant = data.restaurant;
      } else {
        this.restaurant = null;
      }
      this.isLoading = false;
    },
    error: (err) => {
      this.restaurant = null;
      this.isLoading = false;
    },
  });
}

  openingHoursKeys(openingHours: any): string[] {
  return openingHours ? Object.keys(openingHours) : [];
}

}
