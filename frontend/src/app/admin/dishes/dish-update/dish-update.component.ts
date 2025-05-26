import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DishService, Dish } from '../../services/dish.service';
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
  categories: string[] = [];
  nutriScores: string[] = ['A', 'B', 'C', 'D', 'E'];
  showNewCategory = false;
  showNewNutriScore = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dishService: DishService
  ) {
    this.dishForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      newCategory: [''],
      precoPequena: [''],
      precoMedia: [''],
      precoGrande: [''],
      ingredients: [''],
      calories: [''],
      fat: [''],
      protein: [''],
      carbs: [''],
      nutriScore: [this.nutriScores.length ? this.nutriScores[0] : '', Validators.required],
      newNutriScore: [''],
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

    this.loadCategoriesAndNutriScores();
  }

  loadCategoriesAndNutriScores() {
    this.dishService.getDishes().subscribe({
      next: (data: any) => {
        const dishes = data.dishes || [];
        const defaultCategories = ['Meat', 'Fish', 'Vegetarian', 'Dessert'];
        const dynamicCategories = dishes.map((d: any) => d.category).filter(Boolean);
        this.categories = Array.from(new Set([...defaultCategories, ...dynamicCategories]));
        const dynamicScores = Array.from(new Set(dishes.map((d: any) => d.nutriScore).filter(Boolean)));
        this.nutriScores = Array.from(new Set(['A', 'B', 'C', 'D', 'E', ...dynamicScores as string[]]));
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  addCategory() {
    const cat = this.dishForm.value.newCategory?.trim();
    if (cat && !this.categories.includes(cat)) {
      this.categories.push(cat);
      this.dishForm.patchValue({ category: cat });
      this.showNewCategory = false;
      this.dishForm.patchValue({ newCategory: '' });
      Swal.fire('Success', 'Category added!', 'success');
    }
  }

  addNutriScore() {
    const score = this.dishForm.value.newNutriScore?.trim();
    if (score && !this.nutriScores.includes(score)) {
      this.nutriScores.push(score);
      this.dishForm.patchValue({ nutriScore: score });
      this.showNewNutriScore = false;
      this.dishForm.patchValue({ newNutriScore: '' });
      Swal.fire('Success', 'NutriScore added!', 'success');
    }
  }

  onSubmit() {
    if (this.dishForm.invalid || !this.dishId) return;

    const formData = new FormData();
    formData.append('name', this.dishForm.value.name);
    formData.append('description', this.dishForm.value.description || '');

    let categoryToSend = this.dishForm.value.category;
    if (categoryToSend === 'Outra') {
      categoryToSend = this.dishForm.value.newCategory;
    }
    formData.append('category', categoryToSend || '');

    formData.append('prices[pequena]', this.dishForm.value.precoPequena || '');
    formData.append('prices[media]', this.dishForm.value.precoMedia || '');
    formData.append('prices[grande]', this.dishForm.value.precoGrande || '');

    const ingredientsArr = this.dishForm.value.ingredients
      ? this.dishForm.value.ingredients.split(',').map((i: string) => i.trim())
      : [];
    ingredientsArr.forEach((ing: string) => formData.append('ingredients', ing));

    formData.append('nutrition[calories]', this.dishForm.value.calories || '');
    formData.append('nutrition[fat]', this.dishForm.value.fat || '');
    formData.append('nutrition[protein]', this.dishForm.value.protein || '');
    formData.append('nutrition[carbs]', this.dishForm.value.carbs || '');

    let nutriScoreToSend = this.dishForm.value.nutriScore;
    if (nutriScoreToSend === 'Outro') {
      nutriScoreToSend = this.dishForm.value.newNutriScore;
    }
    formData.append('nutriScore', nutriScoreToSend || '');

    const allergensArr = this.dishForm.value.allergens
      ? this.dishForm.value.allergens.split(',').map((a: string) => a.trim())
      : [];
    allergensArr.forEach((al: string) => formData.append('allergens', al));

    if (this.selectedFile) {
      formData.append('dishPic', this.selectedFile);
    }

    this.dishService.updateDish(this.dishId, formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Dish updated successfully!',
          text: 'You will be redirected to the dishes list.',
          toast: true,
          position: 'top-end',
          timer: 1200,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/dishes']);
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error updating dish!',
          toast: true,
          position: 'top-end',
          timer: 2500,
          showConfirmButton: false
        });
      }
    });
  }

  get isOtherCategory() {
    return this.dishForm.get('category')?.value === 'Outra';
  }
  get isOtherNutriScore() {
    return this.dishForm.get('nutriScore')?.value === 'Outro';
  }


  getDishImageUrl(dishPic: string): string {
    return `http://localhost:3000/uploads/${dishPic}`;
  }

}
