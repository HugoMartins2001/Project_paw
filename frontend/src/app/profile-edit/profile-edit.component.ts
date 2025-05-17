import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileService, UserProfile } from '../services/profile.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class ProfileEditComponent implements OnInit {
  profileForm!: FormGroup;
  user?: UserProfile;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile.user;
        this.profileForm = this.fb.group({
          name: [this.user?.name || '', Validators.required],
          clienteTelemovel: [this.user?.clienteTelemovel || ''],
          clienteNif: [this.user?.clienteNif || ''],
          address: [this.user?.address || ''],
          managerTelemovel: [this.user?.managerTelemovel || '']
        });
      },
      error: () => {
        this.errorMsg = 'Failed to load profile.';
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;
    this.loading = true;
    this.profileService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Profile updated!',
          text: 'You will be redirected to your profile.',
          confirmButtonColor: '#4CAF50',
          timer: 1200,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/profile']);
        });
      },
      error: () => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update profile.',
          confirmButtonColor: '#e74c3c'
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/profile']);
  }
}
