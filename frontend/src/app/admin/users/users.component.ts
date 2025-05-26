import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  standalone: true,
  imports: [NgClass, CommonModule]
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        console.log('Utilizadores recebidos:', data); 
        this.users = data;
      },
      error: (err) => {
        console.error('Erro ao encontrar utilizadores:', err);
        this.users = [];
      }
    });
  }

  confirmBlock(user: User) {
    const action = user.isBlocked ? 'unblock' : 'block';
    const actionText = action === 'block' ? 'block this user' : 'unblock this user';
    const actionButtonText = action === 'block' ? 'Yes, Block' : 'Yes, Unblock';

    Swal.fire({
      title: `Are you sure you want to ${actionText}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'block' ? '#d33' : '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: actionButtonText,
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.blockUser(user._id).subscribe({
          next: (data) => {
            if (data.success) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: data.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1200
              });
              this.fetchUsers();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: data.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2500
              });
            }
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'An error occurred. Please try again later.',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2500
            });
          }
        });
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
