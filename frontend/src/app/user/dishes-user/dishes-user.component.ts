import { Component, OnInit } from '@angular/core';
import { DishService, Dish } from '../../admin/services/dish.service';
import { CartService } from '../../admin/services/cart.service';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dishes-user',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './dishes-user.component.html',
  styleUrl: '../../client/dishes/dishes-client/dishes-client.component.css'
})
export class DishesUserComponent implements OnInit {

    dishes: Dish[] = [];
    allDishes: Dish[] = [];
    isLoading = true;
    userRole: string | null = null;
    userId: string | null = null;
    filterName: string = '';
    filterMinPrice: number | null = null;
    filterMaxPrice: number | null = null;
    filterCategory: string = '';
    filterAllergens: string = '';
    categories: string[] = [];
    allergensList: string[] = [];
    selectedSize: { [dishId: string]: 'pequena' | 'media' | 'grande' | null } = {};
    currentPage = 1;
    totalPages = 1;
    limit = 6;
  
    constructor(private dishService: DishService, private cartService: CartService) { }
  
    ngOnInit(): void {
      this.userRole = localStorage.getItem('role');
      this.userId = localStorage.getItem('userId');
      this.loadDishes();
    }
  
    loadDishes(page: number = 1): void {
      this.isLoading = true;
      const params: any = { page, limit: this.limit };
      if (this.filterName) params.name = this.filterName;
      if (this.filterCategory) params.category = this.filterCategory;
      if (this.filterAllergens) params.allergens = this.filterAllergens;
      if (this.filterMinPrice !== null) params.minPrice = this.filterMinPrice;
      if (this.filterMaxPrice !== null) params.maxPrice = this.filterMaxPrice;

      this.dishService.getDishes(params).subscribe({
        next: (data: any) => {
          this.dishes = data.dishes || [];
          this.currentPage = data.currentPage || 1;
          this.totalPages = data.totalPages || 1;
          this.categories = Array.from(new Set(this.dishes.map((d: any) => d.category).filter(Boolean)));
          this.allergensList = Array.from(
            new Set(
              this.dishes.flatMap((d: any) => Array.isArray(d.allergens) ? d.allergens : []).filter(Boolean)
            )
          );
          this.isLoading = false;
        },
        error: () => {
          this.dishes = [];
          this.categories = [];
          this.allergensList = [];
          this.isLoading = false;
        }
      });
    }

    deleteDish(id: string) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        toast: true,
        position: 'top-end',
        showConfirmButton: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.dishService.deleteDish(id).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The dish has been deleted.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1200
              });
              this.loadDishes();
            },
            error: () => Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error deleting dish.',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000
            })
          });
        }
      });
    }
  
    isObject(value: any): value is { name?: string } {
      return value && typeof value === 'object';
    }
  
    getDishImageUrl(dishPic: string): string {
      return `http://localhost:3000/uploads/${dishPic}`;
    }
  
    isDishManager(dish: Dish, userId: string | null): boolean {
      if (!dish.managerId || !userId) return false;
      if (typeof dish.managerId === 'string') {
        return dish.managerId === userId;
      }
      return dish.managerId._id === userId;
    }
  
    toggleVisibility(dish: Dish): void {
      const novoEstado = !dish.isVisible;
      this.dishService.toggleVisibility(dish._id, novoEstado).subscribe({
        next: () => {
          dish.isVisible = novoEstado;
          Swal.fire({
            icon: 'success',
            title: `Dish ${novoEstado ? 'visible' : 'hidden'} successfully!`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1200
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error updating visibility!',
            text: err.error?.message || 'An unexpected error occurred.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
          });
        }
      });
    }
  
    selectSize(dishId: string, size: 'pequena' | 'media' | 'grande') {
      if (this.selectedSize[dishId] === size) {
        this.selectedSize[dishId] = null;
      } else {
        this.selectedSize[dishId] = size;
      }
    }
  
    addToCart(dish: Dish, size: 'pequena' | 'media' | 'grande') {
      if (!size) return;
      const price = dish.prices?.[size] || 0;
      this.cartService.addToCart({ ...dish, selectedSize: size, selectedPrice: price });
    }

    changePage(page: number) {
      if (page < 1 || page > this.totalPages) return;
      this.loadDishes(page);
    }
}
