import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { OrderService } from '../services/order.service';

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
  expandedOrderIndex: number | null = null;
  currentPage = 1;
  totalPages = 1;

  constructor(private http: HttpClient, private orderService: OrderService) { }

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders(page: number = 1) {
    this.loading = true;
    const token = localStorage.getItem('token');
    this.http.get<any>(`http://localhost:3000/api/orders/ordersHistory?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: res => {
        this.orders = (res.orders || []).filter((order: any) =>
          order.items && order.items.some((item: any) => item.managerId === this.managerId)
        );
        this.currentPage = res.currentPage || 1;
        this.totalPages = res.totalPages || 1;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Error fetching orders!');
      }
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.fetchOrders(page);
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
        if (['shipped', 'delivered'].includes(newStatus.trim().toLowerCase())) {
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

  deleteOrder(orderId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will permanently delete the order!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      toast: true,
      position: 'top-end',
      timer: undefined
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.deleteOrder(orderId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The order has been removed.',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000
            });
            this.fetchOrders(this.currentPage);
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Could not delete the order.',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000
            });
          }
        });
      }
    });
  }
}
