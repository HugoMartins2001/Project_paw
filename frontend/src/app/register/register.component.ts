import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service'; // Certifique-se de que o caminho está correto

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = '';
  clienteTelemovel: string = '';
  clienteNif: string = '';
  managerTelemovel: string = '';
  address: string = '';
  profilePic: File | null = null; // Variável para armazenar o arquivo de foto de perfil

  constructor(private router: Router, private authService: AuthService) {}

  navigateToLogin(): void {
    this.router.navigate(['/login']); 
  }

  onRoleChange(): void {
    this.clienteTelemovel = '';
    this.clienteNif = '';
    this.address = '';
  }

  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profilePic = file;
    }
  }

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('role', this.role);
    if (this.role === 'Client') {
      formData.append('clienteNif', this.clienteNif);
      formData.append('clienteTelemovel', this.clienteTelemovel);
      formData.append('address', this.address);
    } else if (this.role === 'Manager') {
      formData.append('managerTelemovel', this.managerTelemovel);
    }
    if (this.profilePic) {
      formData.append('profilePic', this.profilePic); // Adiciona o arquivo ao FormData
    }

    this.authService.register(formData).subscribe(
      (response) => {
        console.log('Registro bem-sucedido:', response);
        alert('Registro realizado com sucesso!');
        this.router.navigate(['/login']); // Redirecione para a página de login
      },
      (error) => {
        console.error('Erro ao registrar:', error);
        alert('Ocorreu um erro ao realizar o registro.');
      }
    );
  }
}