import { Component, OnInit } from '@angular/core';
import { DishService, Dish } from '../services/dish.service';
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

  constructor(private dishService: DishService) { }

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role');
    this.userId = localStorage.getItem('id'); // <-- E esta linha
    this.loadDishes();
  }

  loadDishes(): void {
    const params: any = {};
    if (this.filterName) params.name = this.filterName;
    if (this.filterCategory) params.category = this.filterCategory;
    if (this.filterAllergens) params.allergens = this.filterAllergens;
    if (this.filterMinPrice !== null) params.minPrice = this.filterMinPrice;
    if (this.filterMaxPrice !== null) params.maxPrice = this.filterMaxPrice;

    this.dishService.getDishes(params).subscribe({
      next: (data: any) => {
        this.dishes = data.dishes || [];
        // Categorias únicas
        this.categories = Array.from(new Set(this.dishes.map((d: any) => d.category).filter(Boolean)));
        // Alergénios únicos (achatando arrays)
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

  deleteDish(id: string) {//ingles
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
}
