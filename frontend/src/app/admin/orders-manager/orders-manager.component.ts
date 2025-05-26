import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // <-- adicione isto
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orders-manager',
  standalone: true,
  imports: [CommonModule], // <-- adicione CommonModule aqui
  templateUrl: './orders-manager.component.html',
  styleUrls: ['./orders-manager.component.css']
})
export class OrdersManagerComponent implements OnInit {
  managerId = localStorage.getItem('userID');
  orders: any[] = [];
  loading = true;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    const token = localStorage.getItem('token');
    this.http.get<any>('http://localhost:3000/api/orders/ordersHistory', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: res => {
        this.orders = res.orders || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Error fetching orders!');
      }
    });
  }

  filterManagerItems(items: any[]): any[] {
    return (items || []).filter(item => item.managerId === this.managerId);
  }

  getOrderTotal(order: any): number {
    const managerId = localStorage.getItem('userID');
    if (!managerId) return 0;
    return order.items
      .filter((item: any) => item.managerId === managerId)
      .reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
  }

  updateStatus(order: any, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;
    const token = localStorage.getItem('token');
    this.http.patch<any>(
      `http://localhost:3000/api/orders/${order._id}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: res => {
        order.status = newStatus;
        if (['expedida', 'entregue'].includes(newStatus.trim().toLowerCase())) {
          Swal.fire({
            icon: 'success',
            title: `Order marked as ${newStatus}!`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error updating order status!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }
}
