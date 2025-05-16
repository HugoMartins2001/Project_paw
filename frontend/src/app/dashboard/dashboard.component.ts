import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { DashboardService } from '../services/dashboard.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  months: string[] = [];
  restaurantData: number[] = [];
  userData: number[] = [];
  menuData: number[] = [];
  dishData: number[] = [];
  orderData: number[] = [];
  role: string = '';

  private generalChartInstance: Chart | null = null;
  private clientsChartInstance: Chart | null = null;

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngOnInit() {
    this.role = localStorage.getItem('role') || '';
    this.loadDashboardData();
  }
  
  navigateToHome(): void { this.router.navigate(['/home']); }
  navigateToRestaurants(): void { this.router.navigate(['/restaurants']); }
  navigateToRestaurantApproval(): void { this.router.navigate(['/restaurantApprove']); }
  navigateToDashboard(): void { this.router.navigate(['/dashboard']); }
  navigateToLogs(): void { this.router.navigate(['/logs']); }
  navigateToUsers(): void { this.router.navigate(['/users']); }
  navigateToLogin(): void { this.router.navigate(['/login']); }
  navigateToRegister(): void { this.router.navigate(['/register']); }
  navigateToMenu(): void { this.router.navigate(['/menus']); }
  navigateToDishes(): void { this.router.navigate(['/dishes']); }
  navigateToOrders(): void { this.router.navigate(['/orders']); }
  navigateToProfile(): void { this.router.navigate(['/profile']); }

  loadDashboardData() {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        console.log(data);
        this.months = data.months || [];
        this.restaurantData = data.restaurantData || [];
        this.userData = data.userData || [];
        this.menuData = data.menuData || [];
        this.dishData = data.dishData || [];
        this.orderData = data.orderData || [];
        this.renderGeneralGraph();
        this.renderClientsGraph();
      },
      error: () => {
        // fallback para dados mockados ou mostra erro
        this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        this.restaurantData = [2, 3, 1, 4, 2, 5];
        this.userData = [5, 8, 12, 15, 18, 22];
        this.menuData = [1, 2, 2, 3, 4, 5];
        this.dishData = [3, 4, 5, 6, 7, 8];
        this.orderData = [10, 12, 15, 20, 18, 25];
        this.renderGeneralGraph();
        this.renderClientsGraph();
      }
    });
  }

  renderGeneralGraph() {
    const ctx = document.getElementById('generalGraph') as HTMLCanvasElement;
    // DESTROI O GRÁFICO ANTERIOR SE EXISTIR
    if (this.generalChartInstance) {
      this.generalChartInstance.destroy();
    }
    if (ctx) {
      this.generalChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Restaurants created', 'Menus created', 'Dishes created', 'Orders created'],
          datasets: [{
            label: 'Dados Gerais',
            data: [
              this.restaurantData.reduce((a, b) => a + b, 0),
              this.menuData.reduce((a, b) => a + b, 0),
              this.dishData.reduce((a, b) => a + b, 0),
              this.orderData.reduce((a, b) => a + b, 0),
            ],
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
            ],
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                color: '#333',
                font: { size: 16, family: 'Arial, sans-serif' },
                padding: 20,
                usePointStyle: true,
              }
            }
          }
        }
      });
    }
  }

  renderClientsGraph() {
    const ctx = document.getElementById('clientsGraph') as HTMLCanvasElement;
    // DESTROI O GRÁFICO ANTERIOR SE EXISTIR
    if (this.clientsChartInstance) {
      this.clientsChartInstance.destroy();
    }
    if (ctx) {
      this.clientsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.months,
          datasets: [{
            label: 'registered users',
            data: this.userData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            fill: true,
            borderWidth: 3,
            pointBackgroundColor: '#fff',
            pointBorderColor: 'rgba(255, 99, 132, 1)',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
            pointHoverBorderWidth: 3,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#333',
                font: { size: 14, family: 'Arial, sans-serif' }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 13,
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
              ticks: { stepSize: 5, color: '#333', font: { size: 12 } }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#333', font: { size: 12 } }
            }
          }
        }
      });
    }
  }
}