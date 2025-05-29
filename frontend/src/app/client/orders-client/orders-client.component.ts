import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../admin/services/order.service';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from './logo-base64';

@Component({
  selector: 'app-orders-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-client.component.html',
  styleUrl: './orders-client.component.css'
})
export class OrdersClientComponent implements OnInit {
  orders: any[] = [];
  currentPage = 1;
  totalPages = 1;
  ordersPerPage = 10;
  expandedOrderIndex: number | null = null;

  constructor(private ordersService: OrderService) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(page: number = 1) {
    this.ordersService.getClientOrders({ page, limit: this.ordersPerPage }).subscribe({
      next: (res) => {
        this.orders = res.orders;
        this.currentPage = res.currentPage || 1;
        this.totalPages = res.totalPages || 1;
      },
      error: () => {
        this.orders = [];
        this.currentPage = 1;
        this.totalPages = 1;
      }
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadOrders(page);
  }

  exportOrderPDF(order: any) {
    const doc = new jsPDF();

    doc.addImage(logoBase64, 'PNG', 160, 10, 35, 35);

    doc.setFontSize(15);
    doc.setTextColor(40, 40, 40);
    doc.text('OrdEat, Lda.', 14, 20);
    doc.setFontSize(10);
    doc.text('Rua OrdEat, 353', 14, 26);
    doc.text('Porto, Portugal', 14, 32);
    doc.text('NIF: 123456789', 14, 38);

    doc.setFontSize(12);
    const invoiceNumber = `FAT-${order._id?.slice(-9) || '000001'}`;
    const invoiceDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(`Número da fatura: ${invoiceNumber}`, 14, 48);
    doc.text(`Data: ${invoiceDate}`, 14, 54);

    doc.setDrawColor(180);
    doc.line(14, 58, 196, 58);

    autoTable(doc, {
      startY: 64,
      head: [['#', 'Prato', 'Quantidade', 'Preço (€)', 'Subtotal (€)']],
      body: order.items.map((item: any, i: number) => [
        i + 1,
        item.name,
        item.quantity || 1,
        (item.originalPrice ?? item.price).toFixed(2),
        (item.price * (item.quantity || 1)).toFixed(2)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 11 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 80;

    if (order.discountApplied || order.discountPercent > 0) {
      doc.setFontSize(12);
      doc.setTextColor(162, 89, 255);
      doc.text(
        `Foi utilizado um código de desconto de ${order.discountPercent}%`,
        14,
        finalY + 10
      );
    }

    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total: ${this.getOrderTotal(order).toFixed(2)} €`, 150, finalY + 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Obrigado pela sua preferência!', 105, 285, { align: 'center' });

    doc.save(`fatura_${order._id}.pdf`);
  }

  getOrderTotal(order: any): number {
    return order.items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
  }

  getOrderInitialTotal(order: any): number {
    return order.items.reduce((sum: number, item: any) =>
      sum + ((item.originalPrice ?? item.price) * (item.quantity || 1)), 0);
  }

  navigateToDishes() {
    window.location.href = '/client/dishes';
  }

}
