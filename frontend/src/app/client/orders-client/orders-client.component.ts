import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../admin/services/order.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-client.component.html',
  styleUrl: './orders-client.component.css'
})
export class OrdersClientComponent implements OnInit {
  orders: any[] = [];

  constructor(private ordersService: OrderService) {}

  ngOnInit() {
    this.ordersService.getClientOrders().subscribe({
      next: (res) => this.orders = res.orders,
      error: () => this.orders = []
    });
  }
}
