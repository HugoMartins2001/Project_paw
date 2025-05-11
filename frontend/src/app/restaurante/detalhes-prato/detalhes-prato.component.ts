import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PratoService, Prato } from '../../services/prato.service';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-detalhes-prato',
  standalone: true,
  templateUrl: './detalhes-prato.component.html',
  styleUrls: ['./detalhes-prato.component.scss'],
  imports: [NgIf, NgFor, CurrencyPipe]
})
export class DetalhesPratoComponent implements OnInit {
  prato: Prato | null = null;
  abaAtiva: 'nutri' | 'alerg' = 'nutri';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pratoService: PratoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pratoService.obterPratoPorId(id).subscribe({
        next: (res) => {
          console.log('✅ Tipo de resposta:', res);
        console.log('✅ É um prato?', typeof res === 'object' && 'nome' in res);
          this.prato = res.prato; // ← CORRETO, se o backend envia só o prato (como confirmaste)
        },
        error: (err) => console.error('Erro ao obter prato:', err)
      });
    }
  }

  voltar(): void {
    this.router.navigate(['/prato/listar']);
  }
}
