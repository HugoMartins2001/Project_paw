import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
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
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
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
      menus: [[], Validators.required],
    });
  }
  ngOnInit(): void {
    this.restaurantService.getMenus().subscribe({
      next: (res: any) => {
        this.menuOptions = Array.isArray(res) ? res : res.menus;
      },
      error: (err) => {
        Swal.fire('Erro', err.error?.error || 'Error loading menus!', 'error');
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
      Swal.fire('Atenção', 'Fill in all required fields!', 'warning');
      return;
    }

    const formValue = this.restaurantForm.value;

    const openingHours = { ...formValue.openingHours };
    ['Saturday', 'Sunday'].forEach(day => {
      if (
        (!openingHours[day].start || !openingHours[day].end) &&
        !openingHours[day].closed
      ) {
        openingHours[day].start = openingHours.default.start;
        openingHours[day].end = openingHours.default.end;
      }
    });

    const formData = new FormData();
    formData.append('name', formValue.name);
    formData.append('address', formValue.address);
    formData.append('phone', formValue.phone);
    formData.append('restaurantEmail', formValue.restaurantEmail);
    formData.append('openingHours', JSON.stringify(openingHours));
    this.paymentMethods.forEach(pm => formData.append('paymentMethods', pm));
    formValue.menus.forEach((menuId: string) => formData.append('menus', menuId));
    if (this.restaurantPic) {
      formData.append('restaurantPic', this.restaurantPic);
      console.log('Image added to FormData:', this.restaurantPic);
    }

    this.restaurantService.createRestaurant(formData).subscribe({
      next: () => {
        Swal.fire('Success', 'Restaurant created successfully!', 'success');
        setTimeout(() => this.router.navigate(['/restaurants']), 1500);
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'Error creating restaurant!', 'error');
      }
    });
  }

  navigateToCreateMenu() {
    this.router.navigate(['/menus/create']);
  }
}
