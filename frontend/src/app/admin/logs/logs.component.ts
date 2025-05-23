import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  user: any = { role: 'Admin' }; 
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
        this.stats = res.stats || {};
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
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteLog(id).subscribe(() => {
          this.logs = this.logs.filter(log => log._id !== id);
          Swal.fire({
            icon: 'success',
            title: 'Log deleted!',
            showConfirmButton: false,
            timer: 1200
          });
        }, () => {
          Swal.fire({
            icon: 'error',
            title: 'Error deleting log!',
            text: 'An unexpected error occurred.'
          });
        });
      }
    });
  }

  confirmDeleteAllLogs() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete ALL logs!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete all',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteAllLogs().subscribe(() => {
          this.logs = [];
          Swal.fire({
            icon: 'success',
            title: 'All logs deleted!',
            showConfirmButton: false,
            timer: 1200
          });
        }, () => {
          Swal.fire({
            icon: 'error',
            title: 'Error deleting logs!',
            text: 'An unexpected error occurred.'
          });
        });
      }
    });
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
