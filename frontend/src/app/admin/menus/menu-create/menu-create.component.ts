import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { DishService } from '../../services/dish.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './menu-create.component.html',
  styleUrls: ['./menu-create.component.css']
})
export class MenuCreateComponent implements OnInit {
  menuForm: FormGroup;
  selectedFile: File | null = null;
  dishOptions: { _id: string, name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private dishService: DishService,
    private router: Router
  ) {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      dishes: [[], Validators.required],
      menuPic: [null]
    });
  }

  ngOnInit(): void {
    this.dishService.getDishes().subscribe(res => {
      this.dishOptions = res.dishes;
    });
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onDishesChange() {
    const dishesControl = this.menuForm.get('dishes');
    if (dishesControl && dishesControl.value.length > 10) {
      dishesControl.setValue(dishesControl.value.slice(0, 10)); 
      Swal.fire('Atenção', 'Só pode adicionar no máximo 10 pratos por menu.', 'warning');
    }
  }

  onSubmit() {
    if (this.menuForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.menuForm.value.name);
    for (const dishId of this.menuForm.value.dishes) {
      formData.append('dishes', dishId);
    }
    if (this.selectedFile) {
      formData.append('menuPic', this.selectedFile);
    }

    this.menuService.createMenu(formData).subscribe({
      next: () => {
        Swal.fire('Success', 'Menu created successfully!', 'success').then(() => {
          this.router.navigate(['/menus']);
        });
      },
      error: () => Swal.fire('Error', 'Error creating menu!', 'error')
    });
  }
}
