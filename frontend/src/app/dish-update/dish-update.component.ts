import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DishService, Dish } from '../services/dish.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dish-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './dish-update.component.html',
  styleUrls: ['./dish-update.component.css']
})
export class DishUpdateComponent implements OnInit {
  dishForm: FormGroup;
  currentPic: string | null = null;
  selectedFile: File | null = null;
  dishId: string | null = null;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dishService: DishService
  ) {
    this.dishForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: [''],
      precoPequena: [''],
      precoMedia: [''],
      precoGrande: [''],
      ingredients: [''],
      calories: [''],
      fat: [''],
      protein: [''],
      carbs: [''],
      nutriScore: [''],
      allergens: ['']
    });
  }

  ngOnInit(): void {
    this.dishId = this.route.snapshot.paramMap.get('id');
    if (!this.dishId) {
      Swal.fire('Error', 'Dish ID not found.', 'error');
      this.router.navigate(['/dishes']);
      return;
    }

    this.dishService.getDishById(this.dishId).subscribe({
      next: (dish: Dish) => {
        this.dishForm.patchValue({
          name: dish.name,
          description: dish.description,
          category: dish.category,
          precoPequena: dish.prices?.pequena,
          precoMedia: dish.prices?.media,
          precoGrande: dish.prices?.grande,
          ingredients: dish.ingredients ? dish.ingredients.join(', ') : '',
          calories: dish.nutrition?.calories,
          fat: dish.nutrition?.fat,
          protein: dish.nutrition?.protein,
          carbs: dish.nutrition?.carbs,
          nutriScore: dish.nutriScore,
          allergens: dish.allergens ? dish.allergens.join(', ') : ''
        });
        this.currentPic = dish.dishPic || null;
        this.isLoading = false;
      },
      error: () => {
        Swal.fire('Error', 'Dish not found.', 'error');
        this.router.navigate(['/dishes']);
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.dishForm.invalid || !this.dishId) return;

    const formData = new FormData();
    formData.append('name', this.dishForm.value.name);
    formData.append('description', this.dishForm.value.description || '');
    formData.append('category', this.dishForm.value.category || '');

    // Preços
    formData.append('prices[pequena]', this.dishForm.value.precoPequena || '');
    formData.append('prices[media]', this.dishForm.value.precoMedia || '');
    formData.append('prices[grande]', this.dishForm.value.precoGrande || '');

    // Ingredientes
    const ingredientsArr = this.dishForm.value.ingredients
      ? this.dishForm.value.ingredients.split(',').map((i: string) => i.trim())
      : [];
    ingredientsArr.forEach((ing: string) => formData.append('ingredients', ing));

    // Nutrição
    formData.append('nutrition[calories]', this.dishForm.value.calories || '');
    formData.append('nutrition[fat]', this.dishForm.value.fat || '');
    formData.append('nutrition[protein]', this.dishForm.value.protein || '');
    formData.append('nutrition[carbs]', this.dishForm.value.carbs || '');

    formData.append('nutriScore', this.dishForm.value.nutriScore || '');

    // Alergénios
    const allergensArr = this.dishForm.value.allergens
      ? this.dishForm.value.allergens.split(',').map((a: string) => a.trim())
      : [];
    allergensArr.forEach((al: string) => formData.append('allergens', al));

    if (this.selectedFile) {
      formData.append('dishPic', this.selectedFile);
    }

    this.dishService.updateDish(this.dishId, formData).subscribe({  
      next: () => {
        Swal.fire('Success', 'Dish updated successfully!', 'success').then(() => {
          this.router.navigate(['/dishes']);
        });
      },
      error: () => Swal.fire('Error', 'Error updating dish!', 'error')
    });
  }
}
