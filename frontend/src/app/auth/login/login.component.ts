import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service'; // Importar o AuthService
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        if (response.success) {
          console.log('Login bem-sucedido:', response);
          localStorage.setItem('token', response.token); // Armazena o token no localStorage
          alert('Login realizado com sucesso!');
          this.router.navigate(['/dashboard']); // Redireciona para o dashboard ou outra página
        } else {
          alert(response.message || 'Erro no login.');
        }
      },
      (error) => {
        console.error('Erro no login:', error);
        alert('Falha no login. Verifique suas credenciais.');
      }
    );
  }
}