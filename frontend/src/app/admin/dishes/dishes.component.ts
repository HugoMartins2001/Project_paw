import { Component, OnInit } from '@angular/core';
import { DishService, Dish } from '../services/dish.service';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class DishesComponent implements OnInit {
  dishes: Dish[] = [];
  isLoading = true;
  userRole: string | null = null;
  userId: string | null = null; // <-- Adiciona esta linha

  constructor(private dishService: DishService) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role');
    this.userId = localStorage.getItem('id'); // <-- E esta linha
    this.loadDishes();
  }

  loadDishes() {
    this.isLoading = true;
    this.dishService.getDishes().subscribe({
      next: (dishes) => {
        this.dishes = dishes;
        this.isLoading = false;
      },
      error: () => {
        this.dishes = [];
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
}
