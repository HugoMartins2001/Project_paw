import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-restaurante',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardRestauranteComponent implements OnInit {
  restaurante: any = {};
  estatisticas = {
    numEncomendas: 0,
    pratosAtivos: 0,
    menusAtivos: 0
  };

  menus: any[] = [];
  pratos: any[] = [];
  encomendas: any[] = [];

  dropdowns = {
    menus: false,
    pratos: false
  };

  modalVisible = false;
  modalItem: any = null;
  modalTipo: string = '';
  dropdownVisible = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.carregarDadosDashboard();
  }

  carregarDadosDashboard(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const restauranteId = this.route.snapshot.paramMap.get('id');
    const token = localStorage.getItem('token');

    if (!restauranteId || !token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any>(`http://localhost:3000/api/restaurante/dashboard/${restauranteId}`, { headers }).subscribe({
      next: (res) => {
        this.restaurante = res.restaurante;
        this.estatisticas = res.estatisticas;
        this.menus = res.menus;
        this.pratos = res.pratos;
        this.encomendas = res.encomendas;
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  toggleDropdown(tipo: 'menus' | 'pratos', event: MouseEvent): void {
    event.stopPropagation();
    // Fecha o outro dropdown
    if (tipo === 'menus') this.dropdowns.pratos = false;
    if (tipo === 'pratos') this.dropdowns.menus = false;
    // Alterna o atual
    this.dropdowns[tipo] = !this.dropdowns[tipo];
  }

  @HostListener('document:click', ['$event'])
  fecharDropdowns(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isMenusClick = target.closest('#menus-dropdown');
    const isPratosClick = target.closest('#pratos-dropdown');

    if (!isMenusClick) this.dropdowns.menus = false;
    if (!isPratosClick) this.dropdowns.pratos = false;
  }

  togglePerfilDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  abrirModal(item: any, tipo: 'menu' | 'prato') {
    this.modalItem = { ...item, _id: item._id || item.id }; // <- força o campo _id existir
    this.modalTipo = tipo;
    this.modalVisible = true;
  }

  fecharModal(): void {
    this.modalItem = null;
    this.modalVisible = false;
    document.body.classList.remove('modal-open');
  }

  
}
