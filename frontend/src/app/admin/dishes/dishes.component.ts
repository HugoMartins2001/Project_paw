import { Component, OnInit } from '@angular/core';
import { DishService, Dish } from '../services/dish.service';
import { CartService } from '../services/cart.service';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule]
})
export class DishesComponent implements OnInit {
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

  constructor(private dishService: DishService, private cartService: CartService) { }

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role');
    this.userId = localStorage.getItem('userId');
    this.loadDishes();
  }

  loadDishes(): void {
    const params: any = {};
    if (this.filterName) params.name = this.filterName;
    if (this.filterCategory) params.category = this.filterCategory;
    if (this.filterAllergens) params.allergens = this.filterAllergens;
    if (this.filterMinPrice !== null) params.minPrice = this.filterMinPrice;
    if (this.filterMaxPrice !== null) params.maxPrice = this.filterMaxPrice;

    this.dishService.getDishes({}).subscribe({
      next: (data: any) => {
        this.allDishes = data.dishes || [];
        this.categories = Array.from(new Set(this.allDishes.map((d: any) => d.category).filter(Boolean)));
        this.allergensList = Array.from(
          new Set(
            this.allDishes.flatMap((d: any) => Array.isArray(d.allergens) ? d.allergens : []).filter(Boolean)
          )
        );
        this.dishes = this.allDishes.filter(dish => {
          let match = true;
          if (this.filterCategory) match = match && dish.category === this.filterCategory;
          if (this.filterAllergens) match = match && (dish.allergens || []).includes(this.filterAllergens);
          if (this.filterName) match = match && dish.name.toLowerCase().includes(this.filterName.toLowerCase());
          const price = dish.prices?.media ?? 0;
          if (this.filterMinPrice !== null) match = match && price >= this.filterMinPrice;
          if (this.filterMaxPrice !== null) match = match && price <= this.filterMaxPrice;
          return match;
        });
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
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dishService.deleteDish(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The dish has been deleted.', 'success');
            this.loadDishes();
          },
          error: () => Swal.fire('Error', 'Error deleting dish.', 'error')
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
}
