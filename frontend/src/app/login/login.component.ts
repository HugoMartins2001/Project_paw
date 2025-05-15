import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  errors: any = {};
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // Inicializa o formulário reativo com validações
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  onSubmit() {
    this.errors = {};

    if (this.loginForm.invalid) {
      const controls = this.loginForm.controls;
      if (controls['email'].invalid) {
        if (controls['email'].errors?.['required']) {
          this.errors.email = 'O email é obrigatório.';
        } else if (controls['email'].errors?.['email']) {
          this.errors.email = 'Formato de email inválido.';
        }
      }

      if (controls['password'].errors?.['required']) {
        this.errors.password = 'A password é obrigatória.';
      }

      return;
    }

    this.isLoading = true;

    this.http
      .post<any>('http://localhost:3000/api/auth/loginSubmitted', this.loginForm.value)
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('userId', res.userId);
          localStorage.setItem('role', res.role);
          localStorage.setItem('name', res.name);

          Swal.fire({
            icon: 'success',
            title: 'Login efetuado!',
            timer: 1500,
            showConfirmButton: false,
          });

          setTimeout(() => {
            if (res.role === 'cliente') {
              this.router.navigate(['/']);
            } else if (res.role === 'Manager' || res.role === 'Admin') {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          }, 1600);
        },
        error: (err) => {
          this.isLoading = false;
          this.errors = err.error?.erros || {
            geral: 'Erro inesperado ao tentar login.',
          };

          if (this.errors.email) {
            Swal.fire({
              icon: 'error',
              title: 'Email não encontrado',
              text: this.errors.email,
            });
          } else if (this.errors.password) {
            Swal.fire({
              icon: 'error',
              title: 'Password incorreta',
              text: this.errors.password,
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Erro no login',
              text: this.errors.geral || 'Verifica os dados introduzidos.',
            });
          }
        },
      });
  }
}
