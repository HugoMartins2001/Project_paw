import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../admin/services/auth.service';
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
  role = '';
  clienteTelemovel = '';
  clienteNif = '';
  address = '';
  managerTelemovel = '';

  errorMsg = '';
  successMsg = '';

  passwordStrength = 0;
  passwordStrengthClass = '';
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSpecial = false;
  showPasswordPopover = false;
  showPassword = false;


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

  checkPasswordStrength() {
    const pwd = this.password || '';
    this.hasUppercase = /[A-Z]/.test(pwd);
    this.hasLowercase = /[a-z]/.test(pwd);
    this.hasNumber = /\d/.test(pwd);
    this.hasSpecial = /[^A-Za-z0-9]/.test(pwd);

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (this.hasUppercase) strength++;
    if (this.hasLowercase) strength++;
    if (this.hasNumber) strength++;
    if (this.hasSpecial) strength++;

    this.passwordStrength = strength;
    if (strength <= 2) this.passwordStrengthClass = 'bg-danger';
    else if (strength === 3) this.passwordStrengthClass = 'bg-warning';
    else if (strength >= 4) this.passwordStrengthClass = 'bg-success';
  }

  onSubmit() {
    if (!this.name || !this.email || !this.password || !this.role) {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Fill in all required fields!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }
    if (this.role === 'Client') {
      if (!this.clienteTelemovel || !this.clienteNif || !this.address) {
        Swal.fire({
          icon: 'warning',
          title: 'Attention',
          text: 'Fill in all client fields!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        return;
      }
      if (!/^\d{9}$/.test(this.clienteTelemovel)) {
        Swal.fire({
          icon: 'warning',
          title: 'Attention',
          text: 'Mobile number must be 9 digits long!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        return;
      }
      if (!/^\d{9}$/.test(this.clienteNif)) {
        Swal.fire({
          icon: 'warning',
          title: 'Attention',
          text: 'NIF must be 9 digits long!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        return;
      }
    }
    if (this.role === 'Manager') {
      if (!this.managerTelemovel) {
        Swal.fire({
          icon: 'warning',
          title: 'Attention',
          text: 'Fill in the manager mobile number!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        return;
      }
      if (!/^\d{9}$/.test(this.managerTelemovel)) {
        Swal.fire({
          icon: 'warning',
          title: 'Attention',
          text: 'Manager mobile number must be 9 digits long!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
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
        Swal.fire({
          icon: 'success',
          title: 'Registration successful!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500
        });
        setTimeout(() => this.router.navigate(['/login']), 1600);
      },
      error: (err) => {
        let msg = err.error?.error || 'Error registering!';
        if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('exist')) {
          Swal.fire({
            icon: 'warning',
            title: 'Attention',
            text: 'This email is already registered!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: msg,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500
          });
        }
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
