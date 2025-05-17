import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- Adiciona isto
import { MenuService, Menu } from '../services/menu.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menus',
  standalone: true,
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css'],
  imports: [CommonModule, RouterModule] // <-- Adiciona RouterModule aqui
})
export class MenusComponent implements OnInit {
  menus: Menu[] = [];
  isLoading = true;
  userRole: string | null = null; // <-- Adiciona isto
  userId: string | null = null; // <-- Adiciona isto

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role'); // <-- E isto
    this.userId = localStorage.getItem('id'); // <-- E isto
    this.menuService.getMenus().subscribe({
      next: (menus) => {
        this.menus = menus;
        this.isLoading = false;
      },
      error: () => {
        this.menus = [];
        this.isLoading = false;
      }
    });
  }

  deleteMenu(id: string): void {//ingles
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuService.deleteMenu(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The menu has been deleted.', 'success');
            // Reload the menu list
            this.menuService.getMenus().subscribe({
              next: (menus) => this.menus = menus
            });
          },
          error: () => {
            Swal.fire('Error', 'Error deleting menu.', 'error');
          }
        });
      }
    });
  }

  // Exemplo no componente Angular
  getMenuImageUrl(menuPic: string): string {
    return `http://localhost:3000/uploads/${menuPic}`;
  }

  isMenuManager(menu: Menu, userId: string | null): boolean {
    if (!menu.managerId || !userId) return false;
    if (typeof menu.managerId === 'string') {
      return menu.managerId === userId;
    }
    // Se for objeto
    return menu.managerId._id === userId;
  }

  toggleVisibility(menu: Menu): void {
    const novoEstado = !menu.isVisible;
    this.menuService.toggleVisibility(menu._id, novoEstado).subscribe({
      next: () => {
        menu.isVisible = novoEstado;
        Swal.fire({
          icon: 'success',
          title: `Menu ${novoEstado ? 'visible' : 'hidden'} successfully!`,
          showConfirmButton: false,
          timer: 1200
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error updating visibility!',
          text: err.error?.message || 'An unexpected error occurred.'
        });
      }
    });
  }
}