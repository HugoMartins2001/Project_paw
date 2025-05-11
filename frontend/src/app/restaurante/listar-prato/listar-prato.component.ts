import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PratoService, Prato } from '../../services/prato.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-prato',
  standalone: true,
  templateUrl: './listar-prato.component.html',
  styleUrls: ['./listar-prato.component.scss'],
  imports: [CommonModule, RouterModule, HttpClientModule]
})
export class ListarPratoComponent implements OnInit {
  pratos: Prato[] = [];
  selectedPrato?: Prato;
  isBrowser: boolean;

  constructor(
    private pratoService: PratoService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  pratosPorCategoria: { [categoria: string]: Prato[] } = {};

  ngOnInit(): void {
    if (this.isBrowser) {
      this.pratoService.listarPratos().subscribe({
        next: (data) => {
          console.log('Pratos recebidos:', data);
          this.pratos = data;
        },
        error: (err) => console.error('Erro ao buscar pratos:', err)
      });
    }
  }

  verDetalhes(id: string): void {
    this.router.navigate([`/prato/detalhes/${id}`]);
  }

  voltarAoDashboard(): void {
    const id = localStorage.getItem('userId');
    if (id) {
      this.router.navigate([`/restaurante/dashboard/${id}`]);
    } else {
      console.error('ID do restaurante não encontrado no localStorage.');
    }
  }

  abrirModal(prato: Prato): void {
    this.selectedPrato = prato;
  }

  confirmarEApagar(id: string): void {
    const confirmar = confirm('Tens a certeza que queres apagar este prato?');
    if (confirmar) {
      this.pratoService.apagarPrato(id).subscribe({
        next: () => {
          this.pratos = this.pratos.filter(p => p._id !== id);
          this.selectedPrato = undefined;
        },
        error: (err) => {
          console.error('Erro ao apagar prato:', err);
        }
      });
    }
  }
  editarPrato(id: string): void {
    this.router.navigate([`/prato/editar/${id}`]);
  }

  eliminarPrato(id: string): void {
    if (confirm('Tens a certeza que queres eliminar este prato?')) {
      this.pratoService.apagarPrato(id).subscribe({
        next: () => {
          this.pratos = this.pratos.filter(p => p._id !== id);
        },
        error: () => {
          alert('Erro ao eliminar prato.');
        }
      });
    }
  }
}
