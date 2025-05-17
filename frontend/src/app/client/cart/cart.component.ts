import { Component } from '@angular/core';
import { CartService } from '../../admin/services/cart.service';
import { Dish } from '../../admin/services/dish.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  imports: [CommonModule, RouterModule]
})
export class CartComponent {
  constructor(public cartService: CartService, private http: HttpClient) {}

  removeFromCart(dish: Dish) {
    this.cartService.removeFromCart(dish);
  }

  checkout() {
    alert('Encomenda concluída! Total: ' + this.cartService.getCartTotal().toFixed(2) + ' €');
    this.cartService.clearCart();
  }

  pay() {
    const cart = this.cartService.getCart().map(dish => ({
      name: dish.name,
      price: dish.prices?.media || 0,
      quantity: 1 // ou outro campo se tiveres quantidade
    }));
    this.http.post<{ url: string }>('http://localhost:3000/api/checkout/createCheckoutSession', { cart })
      .subscribe({
        next: res => window.location.href = res.url,
        error: err => alert('Erro ao criar sessão de pagamento!')
      });
  }
}
