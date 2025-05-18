import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  errors: any = {};
  isLoading = false;
  forgotFormVisible = false;
  forgotEmail = '';
  forgotLoading = false;

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
  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  onSubmit() {
    this.errors = {};

    if (this.loginForm.invalid) {
      const controls = this.loginForm.controls;
      if (controls['email'].invalid) {
        if (controls['email'].errors?.['required']) {
          this.errors.email = 'Email is required  .';
        } else if (controls['email'].errors?.['email']) {
          this.errors.email = 'Invalid email format.';
        }
      }

      if (controls['password'].errors?.['required']) {
        this.errors.password = 'Password is required.';
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
            title: 'Login successful!',
            timer: 1500,
            showConfirmButton: false,
          });

          setTimeout(() => {
            if (res.role === 'Client') {
              this.router.navigate(['/client']);
            } else if (res.role === 'Manager' || res.role === 'Admin') {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          }, 1600);
        },
        error: (err) => {
          this.isLoading = false;
          this.errors = err.error?.errors || {
            geral: 'An unexpected error occurred while trying to log in.',
          };

          if (this.errors.email) {
            Swal.fire({
              icon: 'error',
              title: 'Email not found',
              text: this.errors.email,
            });
          } else if (this.errors.password) {
            Swal.fire({
              icon: 'error',
              title: 'Incorrect password',
              text: this.errors.password,
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Login error',
              text: this.errors.geral || 'Check the entered data.',
            });
          }
        },
      });
  }

  showForgotForm() {
    this.forgotFormVisible = true;
    this.forgotEmail = '';
  }

  hideForgotForm() {
    this.forgotFormVisible = false;
  }

  onForgotSubmit() {
    if (!this.forgotEmail) {
      Swal.fire('Error', 'Please enter your email.', 'error');
      return;
    }
    this.forgotLoading = true;
    this.http.post<any>('http://localhost:3000/api/auth/forgot-password', { email: this.forgotEmail })
      .subscribe({
        next: () => {
          this.forgotLoading = false;
          Swal.fire('Success', 'If the email exists, you will receive instructions to recover your password.', 'success');
          this.hideForgotForm();
        },
        error: () => {
          this.forgotLoading = false;
          Swal.fire('Error', 'An error occurred while trying to recover the password.', 'error');
        }
      });
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:3000/api/auth/google';
  }
}
