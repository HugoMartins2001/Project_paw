import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = '';
  clienteTelemovel = '';
  clienteNif = '';
  address = '';
  managerTelemovel = '';

  errorMsg = '';
  successMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onRoleChange() {
    if (this.role === 'Client') {
      this.managerTelemovel = '';
    } else if (this.role === 'Manager') {
      this.clienteTelemovel = '';
      this.clienteNif = '';
      this.address = '';
    }
  }

  onSubmit() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.role) {
      Swal.fire('Attention', 'Fill in all required fields!', 'warning');
      return;
    }
    if (this.password !== this.confirmPassword) {
      Swal.fire('Attention', 'Passwords do not match!', 'warning');
      return;
    }
    if (this.role === 'Client') {
      if (!this.clienteTelemovel || !this.clienteNif || !this.address) {
        Swal.fire('Attention', 'Fill in all client fields!', 'warning');
        return;
      }
      if (!/^\d{9}$/.test(this.clienteTelemovel)) {
        Swal.fire('Attention', 'Mobile number must be 9 digits long!', 'warning');
        return;
      }
      if (!/^\d{9}$/.test(this.clienteNif)) {
        Swal.fire('Attention', 'NIF must be 9 digits long!', 'warning');
        return;
      }
    }
    if (this.role === 'Manager') {
      if (!this.managerTelemovel) {
        Swal.fire('Attention', 'Fill in the manager mobile number!', 'warning');
        return;
      }
      if (!/^\d{9}$/.test(this.managerTelemovel)) {
        Swal.fire('Attention', 'Manager mobile number must be 9 digits long!', 'warning');
        return;
      }
    }

    const userData = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      ...(this.role === 'Client' && {
        clienteTelemovel: this.clienteTelemovel,
        clienteNif: this.clienteNif,
        address: this.address
      }),
      ...(this.role === 'Manager' && {
        managerTelemovel: this.managerTelemovel
      })
    };

    this.authService.register(userData).subscribe({
      next: (res) => {
        Swal.fire('Success', 'Registration successful!', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        let msg = err.error?.error || 'Error registering!';
        if (msg === 'Email already registered!') {
        }
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
