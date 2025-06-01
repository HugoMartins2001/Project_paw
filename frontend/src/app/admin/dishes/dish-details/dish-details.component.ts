import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DishService, Dish } from '../../services/dish.service';
import { Router } from '@angular/router';

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
    private dishService: DishService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const dishId = this.route.snapshot.paramMap.get('id');
    if (dishId) {
      this.dishService.getDishById(dishId).subscribe({
        next: (res) => {
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

  getDishImageUrl(dishPic: string): string {
    return `http://localhost:3000/uploads/${dishPic}`;
  }

  goBackToDishes() {
    const role = localStorage.getItem('role');
    if (role === 'Client') {
      this.router.navigate(['/client/dishes']);
    } else {
      this.router.navigate(['/dishes']);
    }
  }
}
