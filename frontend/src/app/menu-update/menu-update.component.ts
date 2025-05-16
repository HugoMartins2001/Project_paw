import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuService, Menu } from '../services/menu.service';
import { DishService, Dish } from '../services/dish.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './menu-update.component.html',
  styleUrls: ['./menu-update.component.css']
})
export class MenuUpdateComponent implements OnInit {
  menuForm: FormGroup;
  dishOptions: Dish[] = [];
  currentPic: string | null = null;
  selectedFile: File | null = null;
  menuId: string | null = null;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private dishService: DishService
  ) {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      dishes: [[], Validators.required],
      menuPic: [null]
    });
  }

  ngOnInit(): void {
    this.menuId = this.route.snapshot.paramMap.get('id');
    if (!this.menuId) {
      Swal.fire('Erro', 'ID do menu não encontrado.', 'error');
      this.router.navigate(['/menus']);
      return;
    }

    // Carregar pratos disponíveis
    this.dishService.getDishes().subscribe({
      next: (dishes) => this.dishOptions = dishes,
      error: () => this.dishOptions = []
    });

    // Carregar dados do menu
    this.menuService.getMenuById(this.menuId).subscribe({
      next: (menu: Menu) => {
        this.menuForm.patchValue({
          name: menu.name,
          dishes: menu.dishes.map((d: any) => d._id ? d._id : d),
        });
        this.currentPic = menu.menuPic || null;
        this.isLoading = false;
      },
      error: () => {
        Swal.fire('Erro', 'Menu não encontrado.', 'error');
        this.router.navigate(['/menus']);
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
    if (this.menuForm.invalid || !this.menuId) return;

    const formData = new FormData();
    formData.append('name', this.menuForm.value.name);
    for (const dishId of this.menuForm.value.dishes) {
      formData.append('dishes', dishId);
    }
    if (this.selectedFile) {
      formData.append('menuPic', this.selectedFile);
    }

    this.menuService.updateMenuById(this.menuId, formData).subscribe({
      next: () => {
        Swal.fire('Sucesso', 'Menu atualizado com sucesso!', 'success').then(() => {
          this.router.navigate(['/menus']);
        });
      },
      error: () => Swal.fire('Erro', 'Erro ao atualizar menu!', 'error')
    });
  }
}
