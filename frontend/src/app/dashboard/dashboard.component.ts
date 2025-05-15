import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user = { name: '', role: '' };

  ngOnInit() {
    this.user.name = localStorage.getItem('name') || '';
    this.user.role = localStorage.getItem('role') || '';
  }
}
