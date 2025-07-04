import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../services/restaurant.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-restaurant-approval',
  templateUrl: './restaurantApprove.component.html',
  styleUrls: ['./restaurantApprove.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class RestaurantApprovalComponent implements OnInit {
  restaurants: any[] = [];
  currentPage = 1;
  totalPages = 1;

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit() {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.restaurantService.getPendingRestaurants(this.currentPage).subscribe((data: any) => {
      this.restaurants = data.restaurants;
      this.totalPages = data.totalPages;
    });
  }

  approveRestaurant(id: string) {
    this.restaurantService.approveRestaurant(id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Restaurant approved successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1200
        });
        this.loadRestaurants();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Could not approve the restaurant.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadRestaurants();
  }
}
