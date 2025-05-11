import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MenuService, Menu } from '../../services/menu.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-menu',
  standalone: true,
  templateUrl: './listar-menu.component.html',
  styleUrls: ['./listar-menu.component.scss'],
  imports: [CommonModule, RouterModule, HttpClientModule]
})
export class ListarMenuComponent implements OnInit {
  menus: Menu[] = [];
  selectedMenu?: Menu;
  isBrowser: boolean;

  constructor(
    private MenuService: MenuService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  

  ngOnInit(): void {
    if (this.isBrowser) {
      this.MenuService.listarMenus().subscribe({
        next: (data) => {
          console.log('Pratos recebidos:', data);
          this.menus = data;
        },
        error: (err) => console.error('Erro ao buscar pratos:', err)
      });
    }
  }

  verDetalhes(id: string): void {
    this.router.navigate([`/menu/detalhes/${id}`]);
  }

  voltarAoDashboard(): void {
    const id = localStorage.getItem('userId');
    if (id) {
      this.router.navigate([`/restaurante/dashboard/${id}`]);
    } else {
      console.error('ID do restaurante não encontrado no localStorage.');
    }
  }

  abrirModal(menu: Menu): void {
    this.selectedMenu = menu;
  }

  confirmarEApagar(id: string): void {
    const confirmar = confirm('Tens a certeza que queres apagar este menu?');
    if (confirmar) {
      this.MenuService.eliminarMenu(id).subscribe({
        next: () => {
          this.menus = this.menus.filter(m => m._id !== id);
          this.selectedMenu = undefined;
        },
        error: (err) => {
          console.error('Erro ao apagar menu:', err);
        }
      });
    }
  }
  editarMenu(id: string): void {
    this.router.navigate([`/menu/editar/${id}`]);
  }
}
