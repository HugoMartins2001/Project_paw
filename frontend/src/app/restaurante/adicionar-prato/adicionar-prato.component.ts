import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PratoService, Prato } from '../../services/prato.service';
import { NgIf, NgFor, CurrencyPipe, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-adicionar-prato',
  standalone: true,
  templateUrl: './adicionar-prato.component.html',
  styleUrls: ['./adicionar-prato.component.scss'],
  imports: [CommonModule, FormsModule, NgIf, NgFor]
})
export class AdicionarPratoComponent implements OnInit {
  prato = {
    nome: '',
    descricao: '',
    categoria: '',
    subcategoria: '',
    infoNutricional: {
      calorias: null as number | null,
      proteinas: null as number | null,
      hidratos: null as number | null,
      gorduras: null as number | null
    }
  };

  doses: { nome: string; preco: number | null }[] = [{ nome: '', preco: null }];
  alergeneosSelecionados: string[] = [];
  alergeneoOutroTexto = '';
  imagemSelecionada: File | null = null;
  imagemPreview: string | null = null;
  pratoAdicionadoComSucesso = false;
  erro: string | null = null;

  categoriasPrincipais = ['Entrada', 'Prato Principal', 'Sobremesa', 'Bebidas'];
  subcategorias: Record<string, string[]> = {
    'Entrada': ['Vegetariano', 'Vegan', 'Carne', 'Peixe'],
    'Prato Principal': ['Carne', 'Peixe', 'Vegetariano', 'Vegan'],
    'Sobremesa': ['Doce', 'Fruta', 'Gelado'],
    'Bebidas': ['Sumo', 'Vinho', 'Cerveja', 'Água', 'Refrigerante', 'Cocktail']
  };

  categoriaSelecionada = '';
  subcategoriasDisponiveis: string[] = [];
  semAlergenios = false;
  modoEdicao = false;
  pratoId: string | null = null;

  constructor(
    private pratoService: PratoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    document.addEventListener('keydown', this.teclaEscFecharModal.bind(this));

    this.route.paramMap.subscribe(params => {
      this.pratoId = params.get('id');
      this.modoEdicao = !!this.pratoId;

      if (this.modoEdicao) {
        this.pratoService.obterPratoPorId(this.pratoId!).subscribe({
          next: (res: { prato: Prato }) => {
            const pratoData = res.prato;
            this.prato.nome = pratoData.nome;
            this.prato.descricao = pratoData.descricao || '';
            this.prato.categoria = pratoData.categoria;
            this.prato.subcategoria = pratoData.subcategoria || '';
            this.prato.infoNutricional = pratoData.infoNutricional || {
              calorias: null,
              proteinas: null,
              hidratos: null,
              gorduras: null
            };
            this.doses = pratoData.doses || [];
            this.alergeneosSelecionados = pratoData.alergenios || [];
          
            this.categoriaSelecionada = pratoData.categoria;
            this.atualizarSubcategorias();
            this.imagemPreview = 'http://localhost:3000' + pratoData.imagem;
          },
          error: (err: any) => {
            console.error('Erro ao carregar prato:', err);
          }
        });
      }
    });
  }

  voltarAoDashboard(): void {
    const id = localStorage.getItem('userId');
    this.router.navigate([`/restaurante/dashboard/${id}`]);
  }

  irParaListarPratos(): void {
    this.router.navigate(['/prato/listar']);
  }

  teclaEscFecharModal(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.pratoAdicionadoComSucesso = false;
    }
  }

  atualizarSubcategorias(): void {
    this.subcategoriasDisponiveis = this.subcategorias[this.categoriaSelecionada] || [];
  }

  adicionarDose(): void {
    this.doses.push({ nome: '', preco: null });
  }

  removerDose(index: number): void {
    this.doses.splice(index, 1);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagemSelecionada = file;
      this.imagemPreview = URL.createObjectURL(file);
    }
  }

  toggleAlergeneo(valor: string): void {
    const index = this.alergeneosSelecionados.indexOf(valor);
    if (index > -1) {
      this.alergeneosSelecionados.splice(index, 1);
    } else {
      this.alergeneosSelecionados.push(valor);
    }
  }

  aoSelecionarSemAlergenios(): void {
    if (this.semAlergenios) {
      this.alergeneosSelecionados = [];
      this.alergeneoOutroTexto = '';
    }
  }

  get dosesInvalidas(): boolean {
    return this.doses.some(d => !d.nome || !d.preco || d.preco <= 0);
  }

  get infoNutricionalVazia(): boolean {
    const n = this.prato.infoNutricional;
    return !n.calorias && !n.proteinas && !n.hidratos && !n.gorduras;
  }

  get alergeneosVazios(): boolean {
    return !this.semAlergenios && this.alergeneosSelecionados.length === 0;
  }

  guardarPrato(form: NgForm): void {
    this.erro = null;

    if (form.invalid) {
      this.erro = 'Preenche todos os campos obrigatórios.';
      return;
    }

    if (!this.imagemSelecionada && !this.modoEdicao) {
      this.erro = 'Seleciona uma imagem para o prato.';
      return;
    }

    if (this.dosesInvalidas) {
      this.erro = 'Todas as doses devem ter nome e preço válido.';
      return;
    }

    this.prato.categoria = this.categoriaSelecionada;

    const formData = new FormData();
    formData.append('nome', this.prato.nome);
    formData.append('descricao', this.prato.descricao);
    formData.append('categoria', this.prato.categoria);
    formData.append('subcategoria', this.prato.subcategoria);
    formData.append('infoNutricional', JSON.stringify(this.prato.infoNutricional));

    const todosAlergeneos = this.semAlergenios
      ? ['Nenhum']
      : [...this.alergeneosSelecionados];

    if (this.alergeneosSelecionados.includes('outros') && this.alergeneoOutroTexto) {
      todosAlergeneos.push(this.alergeneoOutroTexto);
    }

    formData.append('alergenios', JSON.stringify(todosAlergeneos));
    formData.append('doses', JSON.stringify(this.doses));

    if (this.imagemSelecionada) {
      formData.append('imagemPrato', this.imagemSelecionada);
    }

    if (this.modoEdicao && this.pratoId) {
      this.pratoService.editarPrato(this.pratoId, formData).subscribe({
        next: () => this.router.navigate(['/prato/listar']),
        error: (err: any) => {
          console.error('Erro ao editar prato:', err);
          this.erro = err.error?.message || 'Erro ao editar prato.';
        }
      });
    } else {
      this.pratoService.adicionarPrato(formData).subscribe({
        next: () => {
          this.pratoAdicionadoComSucesso = true;
        },
        error: (err: any) => {
          console.error('Erro ao adicionar prato:', err);
          this.erro = err.error?.message || 'Erro ao adicionar prato.';
        }
      });
    }
  }
}
