import { Injectable } from '@angular/core';
import { Dish } from './dish.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart: Dish[] = [];
  private cartStartTime: number | null = null;

  constructor() {
    const saved = localStorage.getItem('cart');
    this.cart = saved ? JSON.parse(saved) : [];
    const savedTime = localStorage.getItem('cartStartTime');
    this.cartStartTime = savedTime ? Number(savedTime) : null;
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    if (this.cart.length > 0 && !this.cartStartTime) {
      this.cartStartTime = Date.now();
      localStorage.setItem('cartStartTime', this.cartStartTime.toString());
    }
    if (this.cart.length === 0) {
      this.cartStartTime = null;
      localStorage.removeItem('cartStartTime');
    }
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
    this.cartStartTime = null;
    localStorage.removeItem('cartStartTime');
    this.saveCart();
  }

  getCartStartTime() {
    return this.cartStartTime;
  }
}