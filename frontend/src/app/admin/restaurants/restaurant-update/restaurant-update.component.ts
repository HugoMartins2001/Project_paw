import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../../services/restaurant.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-restaurant-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restaurant-update.component.html',
  styleUrls: ['./restaurant-update.component.css']
})
export class RestaurantUpdateComponent implements OnInit {
  restaurantForm: FormGroup;
  showCustomHours = false;
  restaurantPic: File | null = null;
  currentPic: string | null = null;
  paymentMethods: string[] = [];
  menuOptions: { _id: string; name: string }[] = [];
  restaurantId: string = '';

  defaultStartControl!: FormControl;
  defaultEndControl!: FormControl;
  saturdayStartControl!: FormControl;
  saturdayEndControl!: FormControl;
  saturdayClosedControl!: FormControl;
  sundayStartControl!: FormControl;
  sundayEndControl!: FormControl;
  sundayClosedControl!: FormControl;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestaurantService
  ) {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
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
      menus: [[]]
    });

    this.defaultStartControl = this.restaurantForm.get('openingHours.default.start') as FormControl;
    this.defaultEndControl = this.restaurantForm.get('openingHours.default.end') as FormControl;
    this.saturdayStartControl = this.restaurantForm.get('openingHours.Saturday.start') as FormControl;
    this.saturdayEndControl = this.restaurantForm.get('openingHours.Saturday.end') as FormControl;
    this.saturdayClosedControl = this.restaurantForm.get('openingHours.Saturday.closed') as FormControl;
    this.sundayStartControl = this.restaurantForm.get('openingHours.Sunday.start') as FormControl;
    this.sundayEndControl = this.restaurantForm.get('openingHours.Sunday.end') as FormControl;
    this.sundayClosedControl = this.restaurantForm.get('openingHours.Sunday.closed') as FormControl;
  }


  ngOnInit(): void {
    this.restaurantId = this.route.snapshot.paramMap.get('id') || '';

    this.defaultEndControl = this.restaurantForm.get('openingHours.default.end') as FormControl;
    this.saturdayStartControl = this.restaurantForm.get('openingHours.Saturday.start') as FormControl;
    this.saturdayEndControl = this.restaurantForm.get('openingHours.Saturday.end') as FormControl;
    this.saturdayClosedControl = this.restaurantForm.get('openingHours.Saturday.closed') as FormControl;
    this.sundayStartControl = this.restaurantForm.get('openingHours.Sunday.start') as FormControl;
    this.sundayEndControl = this.restaurantForm.get('openingHours.Sunday.end') as FormControl;
    this.sundayClosedControl = this.restaurantForm.get('openingHours.Sunday.closed') as FormControl;

    this.restaurantService.getMenus().subscribe({
      next: (res: any) => {
        this.menuOptions = Array.isArray(res) ? res : (res.menus || []);
        console.log('Menus carregados:', this.menuOptions);
      },
      error: () =>
        Swal.fire('Error', 'Error loading available menus!', 'error')
    });

    this.restaurantService.getRestaurantById(this.restaurantId).subscribe({
      next: (res) => {
        const restaurante = res;
        const menuIds = (res.menus || []).map((m: any) => typeof m === 'string' ? m : m._id);
        this.restaurantForm.patchValue({
          name: res.name,
          address: res.address,
          phone: res.phone,
          deliveryTime: res.deliveryTime,
          confessionTime: res.confessionTime,
          restaurantEmail: res.restaurantEmail,
          openingHours: res.openingHours,
          menus: menuIds
        });
        this.paymentMethods = res.paymentMethods || [];
        this.currentPic = restaurante.restaurantPic || null;
      },
      error: () =>
        Swal.fire('Error', 'Error loading restaurant data!', 'error')
    });
  }

  onMenuCheckboxChange(event: Event, menuId: string) {
    const checked = (event.target as HTMLInputElement).checked;
    const menus: string[] = this.restaurantForm.value.menus || [];
    if (checked) {
      if (!menus.includes(menuId)) {
        menus.push(menuId);
      }
    } else {
      const index = menus.indexOf(menuId);
      if (index > -1) {
        menus.splice(index, 1);
      }
    }
    this.restaurantForm.patchValue({ menus });
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
        text: 'Please fill in all required fields!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    const formValue = this.restaurantForm.value;

    const openingHours = {
      default: {
        start: this.defaultStartControl.value,
        end: this.defaultEndControl.value,
        closed: false
      },
      Saturday: {
        start: this.saturdayStartControl.value,
        end: this.saturdayEndControl.value,
        closed: this.saturdayClosedControl.value
      },
      Sunday: {
        start: this.sundayStartControl.value,
        end: this.sundayEndControl.value,
        closed: this.sundayClosedControl.value
      }
    };

    const formData = new FormData();
    formData.append('name', formValue.name);
    formData.append('address', formValue.address);
    formData.append('phone', formValue.phone);
    formData.append('deliveryTime', formValue.deliveryTime);
    formData.append('confessionTime', formValue.confessionTime);
    formData.append('restaurantEmail', formValue.restaurantEmail);
    formData.append('openingHours', JSON.stringify(openingHours));
    this.paymentMethods.forEach(pm => formData.append('paymentMethods', pm));
    formValue.menus.forEach((menuId: string) => formData.append('menus', menuId));
    if (this.restaurantPic) {
      formData.append('restaurantPic', this.restaurantPic);
    }

    this.restaurantService.updateRestaurantById(this.restaurantId, formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Restaurant updated successfully!',
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
          text: err.error?.error || 'Error updating restaurant!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  getRestaurantImageUrl(pic: string): string {
    return `http://localhost:3000/uploads/${pic}`;
  }

}
