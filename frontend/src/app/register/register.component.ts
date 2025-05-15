import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
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
      Swal.fire('Atenção', 'Preencha todos os campos obrigatórios!', 'warning');
      return;
    }
    if (this.password !== this.confirmPassword) {
      Swal.fire('Atenção', 'As senhas não coincidem!', 'warning');
      return;
    }
    if (this.role === 'Client') {
      if (!this.clienteTelemovel || !this.clienteNif || !this.address) {
        Swal.fire('Atenção', 'Preencha todos os campos de cliente!', 'warning');
        return;
      }
      if (!/^\d{9}$/.test(this.clienteTelemovel)) {
        Swal.fire('Atenção', 'O número de telemóvel deve ter 9 dígitos!', 'warning');
        return;
      }
      if (!/^\d{9}$/.test(this.clienteNif)) {
        Swal.fire('Atenção', 'O NIF deve ter 9 dígitos!', 'warning');
        return;
      }
    }
    if (this.role === 'Manager') {
      if (!this.managerTelemovel) {
        Swal.fire('Atenção', 'Preencha o número de telemóvel do gerente!', 'warning');
        return;
      }
      if (!/^\d{9}$/.test(this.managerTelemovel)) {
        Swal.fire('Atenção', 'O número de telemóvel do gerente deve ter 9 dígitos!', 'warning');
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
        Swal.fire('Sucesso', 'Registo realizado com sucesso!', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        let msg = err.error?.error || 'Erro ao registar!';
        if (msg === 'Email already registered!') {
        }
        Swal.fire('Erro', msg, 'error');
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
