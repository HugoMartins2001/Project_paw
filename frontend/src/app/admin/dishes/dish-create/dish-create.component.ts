import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DishService } from '../../services/dish.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dish-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dish-create.component.html',
  styleUrls: ['./dish-create.component.css']
})
export class DishCreateComponent {
  dishForm: FormGroup;
  selectedFile: File | null = null;
  dishPicPreview: string | ArrayBuffer | null = null;
  isLoading = false;

  categories: string[] = ['Meat', 'Fish', 'Vegetarian', 'Dessert'];
  showNewCategory = false;
  newCategory = '';

  constructor(
    private fb: FormBuilder,
    private dishService: DishService,
    private router: Router
  ) {
    this.dishForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      precoPequena: ['', Validators.required],
      precoMedia: ['', Validators.required],
      precoGrande: ['', Validators.required],
      ingredients: ['', Validators.required],
      calories: [''],
      fat: [''],
      protein: [''],
      carbs: [''],
      nutriScore: ['A', Validators.required],
      allergens: [''],
      newCategory: ['']
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.dishPicPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  addCategory() {
    const cat = this.dishForm.value.newCategory?.trim();
    if (cat && !this.categories.includes(cat)) {
      this.categories.push(cat);
      this.dishForm.patchValue({ category: cat });
      this.showNewCategory = false;
      this.newCategory = '';
      Swal.fire('Success', 'Category added!', 'success');
    }
  }

  onSubmit() {
    if (this.dishForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.dishForm.value.name);
    formData.append('description', this.dishForm.value.description || '');
    formData.append('category', this.dishForm.value.category || '');


    const prices = {
      pequena: this.dishForm.value.precoPequena,
      media: this.dishForm.value.precoMedia,
      grande: this.dishForm.value.precoGrande
    };
    formData.append('prices', JSON.stringify(prices));

    const ingredientsArr = this.dishForm.value.ingredients
      ? this.dishForm.value.ingredients.split(',').map((i: string) => i.trim())
      : [];
    ingredientsArr.forEach((ing: string) => formData.append('ingredients', ing));

    const nutrition = {
      calories: this.dishForm.value.calories,
      fat: this.dishForm.value.fat,
      protein: this.dishForm.value.protein,
      carbs: this.dishForm.value.carbs
    };
    formData.append('nutrition', JSON.stringify(nutrition));

    formData.append('nutriScore', this.dishForm.value.nutriScore || '');

    const allergensArr = this.dishForm.value.allergens
      ? this.dishForm.value.allergens.split(',').map((a: string) => a.trim())
      : [];
    allergensArr.forEach((al: string) => formData.append('allergens', al));

    if (this.selectedFile) {
      formData.append('dishPic', this.selectedFile);
    }

    this.isLoading = true;
    this.dishService.createDish(formData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Dish created successfully!',
          text: 'You will be redirected to the list of dishes.',
          confirmButtonColor: '#4CAF50',
          timer: 1200,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/dishes']);
        });
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Error creating dish!', 'error');
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
