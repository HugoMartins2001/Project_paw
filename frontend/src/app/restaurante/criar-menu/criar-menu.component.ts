import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { PratoService } from '../../services/prato.service';

@Component({
  selector: 'app-criar-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './criar-menu.component.html',
  styleUrls: ['./criar-menu.component.scss']
})
export class CriarMenuComponent implements OnInit {
  menu = {
    nome: '',
    descricao: '',
    pratosSelecionados: [] as string[]
  };

  pratos: any[] = [];
  imagemSelecionada: File | null = null;
  imagemPreview: string | null = null;
  mensagemSucesso: string | null = null;
  mensagemErro: string | null = null;
  menuCriadoComSucesso: boolean = false;

  constructor(
    private menuService: MenuService,
    private pratoService: PratoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.pratoService.listarPratos().subscribe({
      next: (res) => {
        this.pratos = res;
      },
      error: (err) => {
        console.error('Erro ao carregar pratos', err);
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagemSelecionada = file;
      this.imagemPreview = URL.createObjectURL(file);
    }
  }

  criarMenu(): void {
    this.mensagemSucesso = null;
    this.mensagemErro = null;

    if (!this.menu.nome || this.menu.pratosSelecionados.length === 0) {
      this.mensagemErro = 'Preenche todos os campos obrigatórios.';
      return;
    }

    const formData = new FormData();
    formData.append('nome', this.menu.nome);
    formData.append('descricao', this.menu.descricao || '');
    formData.append('pratos', JSON.stringify(this.menu.pratosSelecionados));
    if (this.imagemSelecionada) {
      formData.append('imagemMenu', this.imagemSelecionada);
    }

    this.menuService.criarMenu(formData).subscribe({
      next: () => {
        this.menuCriadoComSucesso = true;
        this.menu = { nome: '', descricao: '', pratosSelecionados: [] };
        this.imagemSelecionada = null;
        this.imagemPreview = null;
      },
      error: (err) => {
        console.error('Erro ao criar menu:', err);
        this.mensagemErro = err.error?.message || 'Erro ao criar menu.';
      }
    });
  }

  voltarAoDashboard(): void {
    const id = localStorage.getItem('userId');
    this.router.navigate([`/restaurante/dashboard/${id}`]);
  }

  togglePratoSelecionado(id: string): void {
    const index = this.menu.pratosSelecionados.indexOf(id);
    if (index > -1) {
      this.menu.pratosSelecionados.splice(index, 1);
    } else {
      this.menu.pratosSelecionados.push(id);
    }
  }
  irParaListarMenus(): void {
    this.router.navigate(['/menu/listar']);
  }
}
