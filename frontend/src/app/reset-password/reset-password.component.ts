import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class ResetPasswordComponent {
  resetForm!: FormGroup;
  loading = false;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
    this.route.params.subscribe(params => {
      this.token = params['token'];
    });
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;
    this.loading = true;
    const password = this.resetForm.value.password;

    this.http.post<any>(`http://localhost:3000/api/auth/reset-password/${this.token}`, { password })
      .subscribe({
        next: (data) => {
          this.loading = false;
          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Password Reset',
              text: 'Your password has been reset successfully!',
            }).then(() => {
              this.router.navigate(['/login']);
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: data.message || 'An error occurred. Please try again.',
            });
          }
        },
        error: (error) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred. Please try again later.',
          });
        }
      });
  }
}
