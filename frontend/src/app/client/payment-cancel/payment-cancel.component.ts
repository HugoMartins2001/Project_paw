import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../admin/services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container d-flex flex-column align-items-center justify-content-center py-5" style="min-height: 60vh;">
      <div class="bg-white shadow rounded-4 p-5 text-center" style="max-width: 400px;">
        <div class="mb-4">
          <i class="bi bi-x-circle-fill text-danger" style="font-size: 3rem;"></i>
        </div>
        <h2 class="fw-bold text-danger mb-3">Payment cancelled</h2>
        <p *ngIf="cancelSuccess" class="alert alert-success mb-3">
          Your order has been <strong>cancelled</strong>.
        </p>
        <p *ngIf="!cancelSuccess && errorMessage" class="alert alert-danger mb-3">
          {{ errorMessage }}
        </p>
        <p *ngIf="!cancelSuccess && !errorMessage" class="text-muted mb-3">
          Cancelling order...
        </p>
        <button class="btn btn-primary px-4" (click)="goHome()">
          <i class="bi bi-house-door me-2"></i>Go to Home
        </button>
      </div>
    </div>
  `
})
export class PaymentCancelComponent implements OnInit {
  cancelSuccess = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cartService: CartService 
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    const userID = localStorage.getItem('userID');
    if (orderId && userID) {
      this.http.post('http://localhost:3000/api/checkout/cancel-order', { orderId, userID }).subscribe({
        next: () => {
          this.cancelSuccess = true;
          this.cartService.clearCart();
        },
        error: (err) => {
          this.cancelSuccess = false;
          this.errorMessage = err.error?.error || 'Unable to cancel the order.';
        }
      });
    }
  }

  goHome() {
    this.router.navigate(['/client/home']);
  }
}
