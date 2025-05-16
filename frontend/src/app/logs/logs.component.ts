import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <--- Adiciona isto
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- Adiciona CommonModule aqui
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  user: any = { role: 'Admin' }; // Substitui pelo user real (ex: via AuthService)
  stats: any = {};
  logs: any[] = [];
  filters: any = { userName: '', action: '', startDate: '', endDate: '' };
  actions: string[] = [
    'Created Dish', 'Updated Dish', 'Deleted Dish',
    'Created Menu', 'Updated Menu', 'Deleted Menu',
    'Created Restaurant', 'Updated Restaurant', 'Deleted Restaurant'
  ];
  currentPage = 1;
  totalPages = 1;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.fetchLogs();
  }


  fetchLogs() {
    this.adminService.getLogs(this.filters, this.currentPage).subscribe({
      next: (res) => {
        this.logs = res.logs || [];
        this.totalPages = res.totalPages || 1;
        this.stats = res.stats || {}; // <-- Adiciona esta linha!
      },
      error: () => {
        this.logs = [];
        this.totalPages = 1;
        this.stats = {};
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.fetchLogs();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchLogs();
  }

  confirmDeleteLog(id: string) {
    if (confirm('Are you sure you want to delete this log?')) {
      this.adminService.deleteLog(id).subscribe(() => {
        this.logs = this.logs.filter(log => log._id !== id);
      });
    }
  }

  confirmDeleteAllLogs() {
    if (confirm('Are you sure you want to delete ALL logs?')) {
      this.adminService.deleteAllLogs().subscribe(() => {
        this.logs = [];
      });
    }
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
