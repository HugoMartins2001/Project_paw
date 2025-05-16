import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DishService, Dish } from '../services/dish.service';

@Component({
  selector: 'app-dish-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dish-details.component.html',
  styleUrls: ['./dish-details.component.css']
})
export class DishDetailsComponent implements OnInit {
  dish: Dish | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private dishService: DishService
  ) {}

  ngOnInit(): void {
    const dishId = this.route.snapshot.paramMap.get('id');
    if (dishId) {
      this.dishService.getDishById(dishId).subscribe({
        next: (res) => {
          // res é o prato real
          this.dish = res;
          this.isLoading = false;
        },
        error: () => {
          this.dish = null;
          this.isLoading = false;
        }
      });
    } else {
      this.dish = null;
      this.isLoading = false;
    }
  }
}
