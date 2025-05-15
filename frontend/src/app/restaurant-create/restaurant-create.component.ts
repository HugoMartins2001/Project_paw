import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService } from '../services/restaurant.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-restaurant-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './restaurant-create.component.html',
  styleUrls: ['./restaurant-create.component.css']
})
export class RestaurantCreateComponent {
  restaurantForm: FormGroup;
  showCustomHours = false;
  restaurantPic: File | null = null;
  paymentMethods: string[] = [];
  menus: string[] = [];
  menuOptions: { _id: string; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private router: Router
  ) {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      restaurantEmail: ['', [Validators.required, Validators.email]],
      openingHours: this.fb.group({
        default: this.fb.group({
          start: ['', Validators.required],
          end: ['', Validators.required]
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
      menus: [[]]
    });
  }
  ngOnInit(): void {
    this.restaurantService.getMenus().subscribe({
      next: (res) => {
        this.menuOptions = res;
      },
      error: (err) => {
        Swal.fire('Erro', err.error?.error || 'Erro ao carregar menus!', 'error');
      }
    });
  }


  onFileChange(event: any) {
    this.restaurantPic = event.target.files[0];
  }

  onPaymentMethodChange(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.paymentMethods.push(value);
    } else {
      this.paymentMethods = this.paymentMethods.filter(pm => pm !== value);
    }
  }

  toggleCustomHours() {
    this.showCustomHours = !this.showCustomHours;
  }

  onSubmit() {
    if (this.restaurantForm.invalid) {
      Swal.fire('Atenção', 'Preencha todos os campos obrigatórios!', 'warning');
      return;
    }

    const formValue = this.restaurantForm.value;
    const formData = new FormData();
    formData.append('name', formValue.name);
    formData.append('address', formValue.address);
    formData.append('phone', formValue.phone);
    formData.append('restaurantEmail', formValue.restaurantEmail);
    formData.append('openingHours', JSON.stringify(formValue.openingHours));
    this.paymentMethods.forEach(pm => formData.append('paymentMethods', pm));
    formValue.menus.forEach((menuId: string) => formData.append('menus', menuId));
    if (this.restaurantPic) {
      formData.append('restaurantPic', this.restaurantPic);
    }

    this.restaurantService.createRestaurant(formData).subscribe({
      next: () => {
        Swal.fire('Sucesso', 'Restaurante criado com sucesso!', 'success');
        setTimeout(() => this.router.navigate(['/restaurants']), 1500);
      },
      error: (err) => {
        Swal.fire('Erro', err.error?.error || 'Erro ao criar restaurante!', 'error');
      }
    });
  }
}
