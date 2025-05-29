import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../admin/services/restaurant.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-restaurant-user',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './restaurant-user.component.html',
  styleUrl: '../../client/restaurants/restaurant-client/restaurant-client.component.css'
})
export class RestaurantUserComponent implements OnInit {
  restaurants: any[] = [];
  isLoading = true;
  filterName: string = '';
  filterAddress: string = '';

  currentPage = 1;
  totalPages = 1;
  limit = 6; 

  constructor(private restaurantService: RestaurantService) { }

  userRole = localStorage.getItem('role');
  userId = localStorage.getItem('userId');

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants(page: number = 1): void {
    this.isLoading = true;
    const params: any = { page, limit: this.limit };
    if (this.filterName) params.name = this.filterName;
    if (this.filterAddress) params.address = this.filterAddress;

    this.restaurantService.getRestaurants(params).subscribe({
      next: (data: any) => {
        if (data && Array.isArray(data.restaurants)) {
          this.restaurants = data.restaurants;
          this.currentPage = data.currentPage || 1;
          this.totalPages = data.totalPages || 1;
        } else if (Array.isArray(data)) {
          this.restaurants = data;
          this.currentPage = 1;
          this.totalPages = 1;
        } else {
          this.restaurants = [];
          this.currentPage = 1;
          this.totalPages = 1;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.restaurants = [];
        this.currentPage = 1;
        this.totalPages = 1;
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
    Swal.fire({
      title: 'Tens a certeza?',
      text: 'Esta ação não pode ser revertida!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sim, apagar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.restaurantService.deleteRestaurant(id).subscribe({
          next: () => {
            this.restaurants = this.restaurants.filter(r => r._id !== id);
            Swal.fire({
              icon: 'success',
              title: 'Restaurante apagado!',
              showConfirmButton: false,
              timer: 1200
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Erro ao eliminar restaurante!',
              text: err.error?.message || 'Ocorreu um erro inesperado.'
            });
          }
        });
      }
    });
  }

  getRestaurantImageUrl(restaurantPic: string): string {
    return `http://localhost:3000/uploads/${restaurantPic}`;
  }

  toggleVisibility(restaurant: any): void {
    const novoEstado = !restaurant.isVisible;
    this.restaurantService.toggleVisibility(restaurant._id, novoEstado).subscribe({
      next: () => {
        restaurant.isVisible = novoEstado;
        Swal.fire({
          icon: 'success',
          title: `Restaurant ${novoEstado ? 'visible' : 'hidden'} successfully!`,
          showConfirmButton: false,
          timer: 1200
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error updating visibility!',
          text: err.error?.message || 'An unexpected error occurred.'
        });
      }
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.fetchRestaurants(page);
  }

}
