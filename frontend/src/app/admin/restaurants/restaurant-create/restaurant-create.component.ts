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
      deliveryTime: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      confessionTime: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
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
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Fill in all required fields!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
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
    formData.append('confessionTime', formValue.confessionTime);
    formData.append('deliveryTime', formValue.deliveryTime);
    this.paymentMethods.forEach(pm => formData.append('paymentMethods', pm));
    formValue.menus.forEach((menuId: string) => formData.append('menus', menuId));
    if (this.restaurantPic) {
      formData.append('restaurantPic', this.restaurantPic);
      console.log('Image added to FormData:', this.restaurantPic);
    }

    this.restaurantService.createRestaurant(formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Restaurant created successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1200
        });
        setTimeout(() => this.router.navigate(['/restaurants']), 1500);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.error || 'Error creating restaurant!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  navigateToCreateMenu() {
    this.router.navigate(['/menus/create']);
  }
}
