import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuService, Menu } from '../../admin/services/menu.service';
import { RestaurantService } from '../../admin/services/restaurant.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menus-user',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './menus-user.component.html',
  styleUrl: '../../client/menus/menus-client/menus-client.component.css'
})
export class MenusUserComponent implements OnInit {
   menus: Menu[] = [];
    restaurants: any[] = [];
    isLoading = true;
    userRole: string | null = null;
    userId: string | null = null;
  
    filterName: string | null = null;
    filterRestaurant: string | null = null;
    filterMinPrice: number | null = null;
    filterMaxPrice: number | null = null;
  
    constructor(private menuService: MenuService, private restaurantService: RestaurantService) { } 
  
    ngOnInit(): void {
      this.userRole = localStorage.getItem('role');
      this.userId = localStorage.getItem('userId');
      this.loadRestaurants();
      this.loadMenus();
    }
  
    loadRestaurants(): void {
      this.restaurantService.getRestaurants().subscribe({
        next: (data: any) => {
          if (data && Array.isArray(data.restaurants)) {
            this.restaurants = data.restaurants;
          } else if (Array.isArray(data)) {
            this.restaurants = data;
          } else {
            this.restaurants = [];
          }
        },
        error: () => {
          this.restaurants = [];
        }
      });
    }
  
    loadMenus(): void {
      const params: any = {};
      if (this.filterName) params.name = this.filterName;
      if (this.filterMinPrice) params.minPrice = this.filterMinPrice;
      if (this.filterMaxPrice) params.maxPrice = this.filterMaxPrice;
  
      this.menuService.getMenus(params).subscribe({
        next: (data) => {
          if (data && Array.isArray(data.menus)) {
            this.menus = data.menus;
          } else if (Array.isArray(data)) {
            this.menus = data;
          } else {
            this.menus = [];
          }
          this.isLoading = false;
        },
        error: () => {
          this.menus = [];
          this.isLoading = false;
        }
      });
    }
  
    deleteMenu(id: string): void {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.menuService.deleteMenu(id).subscribe({
            next: () => {
              Swal.fire('Deleted!', 'The menu has been deleted.', 'success');
              this.loadMenus();
            },
            error: () => {
              Swal.fire('Error', 'Error deleting menu.', 'error');
            }
          });
        }
      });
    }
  
    getMenuImageUrl(menuPic: string): string {
      return `http://localhost:3000/uploads/${menuPic}`;
    }
  
    isMenuManager(menu: Menu, userId: string | null): boolean {
      if (!menu.managerId || !userId) return false;
      if (typeof menu.managerId === 'string') {
        return menu.managerId === userId;
      }
      return menu.managerId._id === userId;
    }
  
    toggleVisibility(menu: Menu): void {
      const novoEstado = !menu.isVisible;
      this.menuService.toggleVisibility(menu._id, novoEstado).subscribe({
        next: () => {
          menu.isVisible = novoEstado;
          Swal.fire({
            icon: 'success',
            title: `Menu ${novoEstado ? 'visible' : 'hidden'} successfully!`,
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
