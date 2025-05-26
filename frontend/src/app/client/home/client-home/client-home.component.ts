import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CartService } from '../../../admin/services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-home',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './client-home.component.html',
  styleUrl: './client-home.component.css'
})
export class ClientHomeComponent implements OnInit {
  user: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService 
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        localStorage.setItem('token', token);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }

      if (params['paid']) {
        Swal.fire({
          icon: 'success',
          title: 'Encomenda concluída!',
          text: 'O seu pedido foi realizado com sucesso.',
          toast: true,
          position: 'top-end',
          timer: 2500,
          showConfirmButton: false
        });
        this.cartService.clearCart();
      }
    });
    // Exemplo simples: verifica se existe token no localStorage
    this.user = localStorage.getItem('token');
  }

  navigateToMenus() { this.router.navigate(['/client/menus']); }
  navigateToRestaurants() { this.router.navigate(['/client/restaurant']); }
  navigateToRegister() { this.router.navigate(['/register']); }
  navigateToDishes() { this.router.navigate(['/client/dishes']); }


}
