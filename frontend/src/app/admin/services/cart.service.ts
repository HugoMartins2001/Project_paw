import { Injectable } from '@angular/core';
import { Dish } from './dish.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart: Dish[] = [];
  private cartStartTime: number | null = null;
  private cartSubject = new BehaviorSubject<Dish[]>(this.cart);

  cart$ = this.cartSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('cart');
    this.cart = saved ? JSON.parse(saved) : [];
    const savedTime = localStorage.getItem('cartStartTime');
    this.cartStartTime = savedTime ? Number(savedTime) : null;
    this.cartSubject.next(this.cart);
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
    this.cartSubject.next(this.cart);
  }

  getCart() {
    return this.cart;
  }

  addToCart(dish: Dish & { selectedSize: 'pequena' | 'media' | 'grande', selectedPrice: number }) {
    // Verifica se já existe o mesmo prato com o mesmo tamanho no carrinho
    const existing = this.cart.find(d =>
      d._id === dish._id && d.selectedSize === dish.selectedSize
    );
    if (existing) {
      existing.quantity = (existing.quantity ?? 1) + 1;
      existing.selectedPrice = dish.selectedPrice; // Garante que o preço é atualizado
    } else {
      this.cart.push({ ...dish, quantity: 1 });
    }
    this.saveCart();
  }

  removeFromCart(dish: Dish) {
    this.cart = this.cart.filter(d =>
      !(d._id === dish._id && d.selectedSize === dish.selectedSize)
    );
    this.saveCart();
  }

  getCartTotal(): number {
    return this.cart.reduce((total, dish) =>
      total + ((dish.selectedPrice ?? dish.prices?.media ?? 0) * (dish.quantity ?? 1)), 0
    );
  }

  clearCart() {
    this.cart = [];
    this.cartStartTime = null;
    localStorage.removeItem('cart');
    localStorage.removeItem('cartStartTime');
    this.cartSubject.next(this.cart);
  }

  getCartStartTime() {
    return this.cartStartTime;
  }

  updateCart(updatedDish: Dish) {
    this.cart = this.cart.map(dish =>
      dish._id === updatedDish._id ? { ...dish, quantity: updatedDish.quantity } : dish
    );
    this.saveCart?.();
  }
}