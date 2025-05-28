import { Component } from '@angular/core';
import { CartService } from '../../admin/services/cart.service';
import { Dish } from '../../admin/services/dish.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  imports: [CommonModule, RouterModule, FormsModule]
})
export class CartComponent {
  timeLeft: number = 600;
  interval: any;
  discountCode: string = '';
  discountApplied: boolean = false;
  discountPercent: number = 0;

  constructor(public cartService: CartService, private http: HttpClient) {}

  removeFromCart(dish: Dish) {
    this.cartService.removeFromCart(dish);
  }

  clearCart(event?: Event) {
    if (event) event.stopPropagation();
    this.cartService.clearCart();
    Swal.fire({
      icon: 'success',
      title: 'Cart cleared!',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1200
    });
  }
  
  ngOnInit() {
    this.startTimer();
  }

  pay() {
    const discount = (this.discountApplied && this.discountPercent > 0) ? this.discountPercent : 0;

    const cart = this.cartService.getCart().map(dish => {
      let price = dish.selectedPrice ?? dish.prices?.media ?? 0;
      if (discount > 0) {
        price = +(price * (1 - discount / 100)).toFixed(2);
      }
      return {
        name: dish.name,
        price,
        quantity: dish.quantity ?? 1,
        managerId: dish.managerId,
        restaurantId: dish.restaurantId || undefined // <-- adiciona isto!
      };
    });

    const managerId = cart.length > 0 ? cart[0].managerId : null;
    const userID = localStorage.getItem('userID');

    this.http.post<{ url: string }>(
      'http://localhost:3000/api/checkout/createCheckoutSession',
      {
        cart,
        userID,
        managerId,
        discountApplied: this.discountApplied,
        discountPercent: this.discountPercent,
        total: this.cartService.getCartTotal(),
        userName: localStorage.getItem('name')
      }
    ).subscribe({
      next: res => window.location.href = res.url,
      error: err => alert('Error trying to create payment session!')
    });
  }

  getDishImageUrl(dishPic: string): string {
    return `http://localhost:3000/uploads/${dishPic}`;
  }

  addToCart(dish: Dish, size: 'pequena' | 'media' | 'grande') {
    const price = dish.prices?.[size] || 0;
    this.cartService.addToCart({
      ...dish,
      selectedSize: size,
      selectedPrice: price,
      quantity: dish.quantity || 1
    });
  }

  updateQuantity(dish: Dish, change: number) {
    const newQuantity = (dish.quantity ?? 1) + change;
    if (newQuantity < 1) return;
    dish.quantity = newQuantity;
    this.cartService.updateCart(dish); 
  }

  startTimer() {
    if (this.interval) clearInterval(this.interval);

    const start = this.cartService.getCartStartTime();
    if (start && this.cartService.getCart().length > 0) {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      this.timeLeft = Math.max(600 - elapsed, 0);
      this.interval = setInterval(() => {
        if (this.cartService.getCart().length === 0) {
          this.timeLeft = 600;
          clearInterval(this.interval);
          return;
        }
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.cartService.clearCart();
          clearInterval(this.interval);
        }
      }, 1000);
    } else {
      this.timeLeft = 600;
    }
  }

  get minutes() {
    return Math.floor(this.timeLeft / 60);
  }
  get seconds() {
    return this.timeLeft % 60;
  }

  navigateToDishes() {
    window.location.href = '/client/dishes';
  }

  applyDiscount() {
    if (this.discountCode.trim().toLowerCase() === 'ordeat2025') {
      this.discountApplied = true;
      this.discountPercent = 5;
      Swal.fire({
        icon: 'success',
        title: 'Discount applied!',
        text: '5% discount has been applied to your order.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1200
      });
    } else {
      this.discountApplied = false;
      this.discountPercent = 0;
      Swal.fire({
        icon: 'error',
        title: 'Invalid code!',
        text: 'Please enter a valid promo code.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1200
      });
    }
  }

  get discountedTotal(): number {
    const total = this.cartService.getCartTotal();
    if (this.discountApplied && this.discountPercent > 0) {
      return total * (1 - this.discountPercent / 100);
    }
    return total;
  }
}


// referencias de cartão fake
// email teste: teste@teste.com
// numero do cartão: 4242 4242 4242 4242
// data: 12/34
// cvv: 123
// postal code: 12345
// Nome do cartão: Teste Teste