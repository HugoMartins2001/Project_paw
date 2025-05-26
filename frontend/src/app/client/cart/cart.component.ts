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

  pay() {
    const cart = this.cartService.getCart().map(dish => ({
      name: dish.name,
      price: dish.prices?.media || 0,
      quantity: 1,
      managerId: dish.managerId 
    }));

    const managerId = cart.length > 0 ? cart[0].managerId : null;
    const userID = localStorage.getItem('userID'); 

    this.http.post<{ url: string }>(
      'http://localhost:3000/api/checkout/createCheckoutSession',
      { cart, userID, managerId }
    ).subscribe({
      next: res => window.location.href = res.url,
      error: err => alert('Erro ao criar sessão de pagamento!')
    });
  }
}


// referencias de cartão fake
// email teste: teste@teste.com
// numero do cartão: 4242 4242 4242 4242
// data: 12/34
// cvv: 123
// postal code: 12345
// Nome do cartão: Teste Teste