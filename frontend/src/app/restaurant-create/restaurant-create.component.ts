import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../services/restaurant.service';
import Swal from 'sweetalert2';

interface Menu {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-restaurant-form',
  templateUrl: './restaurant-create.component.html',
  styleUrls: ['./restaurant-create.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class RestaurantCreateComponent implements OnInit {
  restaurantForm!: FormGroup;
  showCustomHours = false;
  menus: Menu[] = [];
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      restaurantEmail: ['', [Validators.required, Validators.email]],
      openingHours: this.fb.group({
        default: this.fb.group({
          start: [''],
          end: ['']
        }),
        Saturday: this.fb.group({
          start: [''],
          end: [''],
          closed: [false]
        }),
        Sunday: this.fb.group({
          start: [''],
          end: [''],
          closed: [false]
        })
      }),
      paymentMethods: this.fb.array([]),
      restaurantPic: [null],
      menus: [[]]
    });

    // Carregar menus do backend se necessário
    this.restaurantService.getMenus?.().subscribe({
      next: (menus: Menu[]) => this.menus = menus,
      error: () => this.menus = []
    });
  }

  onPaymentMethodChange(event: any) {
    const paymentMethods = this.restaurantForm.get('paymentMethods') as FormArray;
    if (event.target.checked) {
      paymentMethods.push(this.fb.control(event.target.value));
    } else {
      const index = paymentMethods.controls.findIndex(x => x.value === event.target.value);
      paymentMethods.removeAt(index);
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;
    this.restaurantForm.patchValue({ restaurantPic: file });
  }

  toggleCustomHours() {
    this.showCustomHours = !this.showCustomHours;
  }

  getDayGroup(day: string): FormGroup {
    return (this.restaurantForm.get('openingHours') as FormGroup).get(day) as FormGroup;
  }

  onSubmit(): void {
  if (this.restaurantForm.invalid) {
    Swal.fire('Atenção', 'Preencha todos os campos obrigatórios!', 'warning');
    return;
  }

  const formData = new FormData();
  Object.entries(this.restaurantForm.value).forEach(([key, value]) => {
    if (key === 'restaurantPic' && this.selectedFile) {
      formData.append('restaurantPic', this.selectedFile);
    } else if (key === 'menus') {
      (value as string[]).forEach(menuId => formData.append('menus', menuId));
    } else if (key === 'paymentMethods') {
      (value as string[]).forEach(pm => formData.append('paymentMethods', pm));
    } else if (key === 'openingHours') {
      formData.append('openingHours', JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      formData.append(key, value as string);
    }
  });

  // Debug: Mostra o conteúdo do FormData
  for (const pair of formData.entries()) {
    console.log(pair[0]+ ', ' + pair[1]);
  }

  this.restaurantService.createRestaurant(formData).subscribe({
    next: () => {
      Swal.fire('Sucesso', 'Restaurante criado com sucesso!', 'success');
      this.router.navigate(['/restaurants']);
    },
    error: (err) => {
      console.error('Erro no POST:', err);
      Swal.fire('Erro', err.error?.error || 'Erro ao criar restaurante!', 'error');
    }
  });
}
  }