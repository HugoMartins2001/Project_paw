import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../services/restaurant.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class RestaurantsComponent implements OnInit {
  restaurants: any[] = [];
  isLoading = true;
  filterName: string = '';
  filterAddress: string = '';

  constructor(private restaurantService: RestaurantService) { }

  userRole = localStorage.getItem('role');
  userId = localStorage.getItem('userId');

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants(): void {
    const params: any = {};
    if (this.filterName) params.name = this.filterName;
    if (this.filterAddress) params.address = this.filterAddress;

    this.restaurantService.getRestaurants(params).subscribe({
      next: (data: any) => {
        if (data && Array.isArray(data.restaurants)) {
          this.restaurants = data.restaurants;
        } else if (Array.isArray(data)) {
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
}

