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

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role'); // <-- E isto
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

  deleteMenu(id: string): void {
    Swal.fire({
      title: 'Tem a certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuService.deleteMenu(id).subscribe({
          next: () => {
            Swal.fire('Eliminado!', 'O menu foi eliminado.', 'success');
            // Recarrega a lista de menus
            this.menuService.getMenus().subscribe({
              next: (menus) => this.menus = menus
            });
          },
          error: () => {
            Swal.fire('Erro', 'Não foi possível eliminar o menu.', 'error');
          }
        });
      }
    });
  }

  // Exemplo no componente Angular
  getMenuImageUrl(menuPic: string): string {
    return `http://localhost:3000/uploads/${menuPic}`;
  }
}