import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule se necessário

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  constructor(private router: Router) {}

  navigateToLogin(): void {
    this.router.navigate(['/login']); // Substitua pela rota de login
  }

  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = '';
  phone: string = '';
  nif: string = '';
  address: string = '';
  showRoleSelection: boolean = false;

  toggleRoleSelection(): void {
    this.showRoleSelection = !this.showRoleSelection;
  }

  onRoleChange(): void {
    // Limpa os campos específicos ao trocar de role
    this.phone = '';
    this.nif = '';
    this.address = '';
  }

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    const formData = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      phone: this.phone,
      nif: this.role === 'Client' ? this.nif : null,
      address: this.role === 'Client' ? this.address : null
    };

    console.log('Dados do formulário:', formData);
    // Adicione aqui a lógica para enviar os dados ao backend
  }
}
