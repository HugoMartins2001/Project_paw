import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

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
  ) {}

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
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.role) {
      this.errorMsg = 'Preencha todos os campos obrigatórios!';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'As senhas não coincidem!';
      return;
    }
    if (this.role === 'Client' && (!this.clienteTelemovel || !this.clienteNif || !this.address)) {
      this.errorMsg = 'Preencha todos os campos de cliente!';
      return;
    }
    if (this.role === 'Manager' && !this.managerTelemovel) {
      this.errorMsg = 'Preencha o número de telemóvel do gerente!';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('role', this.role);
    if (this.role === 'Client') {
      formData.append('clienteTelemovel', this.clienteTelemovel);
      formData.append('clienteNif', this.clienteNif);
      formData.append('address', this.address);
    }
    if (this.role === 'Manager') {
      formData.append('managerTelemovel', this.managerTelemovel);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.successMsg = 'Registo realizado com sucesso!';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Erro ao registar!';
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
