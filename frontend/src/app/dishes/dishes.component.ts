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

  constructor(private dishService: DishService) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role');
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

  deleteDish(id: string) {
    Swal.fire({
      title: 'Tem a certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dishService.deleteDish(id).subscribe({
          next: () => {
            Swal.fire('Eliminado!', 'O prato foi eliminado.', 'success');
            this.loadDishes();
          },
          error: () => Swal.fire('Erro', 'Erro ao eliminar prato.', 'error')
        });
      }
    });
  }
}
