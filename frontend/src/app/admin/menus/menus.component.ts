import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- Adiciona isto
import { MenuService, Menu } from '../services/menu.service';
import { RestaurantService } from '../services/restaurant.service'; // <-- Importa o serviço de restaurante
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menus',
  standalone: true,
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css'],
  imports: [CommonModule, RouterModule, FormsModule] // <-- Adiciona FormsModule aqui
})
export class MenusComponent implements OnInit {
  menus: Menu[] = [];
  restaurants: any[] = []; // <-- Adiciona isto
  isLoading = true;
  userRole: string | null = null; // <-- Adiciona isto
  userId: string | null = null; // <-- Adiciona isto

  filterName: string | null = null;
  filterRestaurant: string | null = null;
  filterMinPrice: number | null = null;
  filterMaxPrice: number | null = null;

  constructor(private menuService: MenuService, private restaurantService: RestaurantService) { } // <-- Injeta o serviço de restaurante

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role'); // <-- E isto
    this.userId = localStorage.getItem('id'); // <-- E isto
    this.loadRestaurants(); // <-- Carrega restaurantes
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
        // Se o backend devolve { menus: [...] }
        if (data && Array.isArray(data.menus)) {
          this.menus = data.menus;
        } else if (Array.isArray(data)) {
          // Se devolve diretamente um array
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

  deleteMenu(id: string): void {//ingles
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
            // Reload the menu list
            this.loadMenus();
          },
          error: () => {
            Swal.fire('Error', 'Error deleting menu.', 'error');
          }
        });
      }
    });
  }

  // Exemplo no componente Angular
  getMenuImageUrl(menuPic: string): string {
    return `http://localhost:3000/uploads/${menuPic}`;
  }

  isMenuManager(menu: Menu, userId: string | null): boolean {
    if (!menu.managerId || !userId) return false;
    if (typeof menu.managerId === 'string') {
      return menu.managerId === userId;
    }
    // Se for objeto
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