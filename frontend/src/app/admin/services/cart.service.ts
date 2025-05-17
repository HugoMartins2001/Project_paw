import { Injectable } from '@angular/core';
import { Dish } from './dish.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart: Dish[] = [];

  constructor() {
    const saved = localStorage.getItem('cart');
    this.cart = saved ? JSON.parse(saved) : [];
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  getCart() {
    return this.cart;
  }

  addToCart(dish: Dish) {
    this.cart.push(dish);
    this.saveCart();
  }

  removeFromCart(dish: Dish) {
    this.cart = this.cart.filter(d => d._id !== dish._id);
    this.saveCart();
  }

  getCartTotal(): number {
    return this.cart.reduce((sum, dish) => sum + (dish.prices?.media || 0), 0);
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }
}