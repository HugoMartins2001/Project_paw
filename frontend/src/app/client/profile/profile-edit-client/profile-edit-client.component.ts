import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileService, UserProfile } from '../../../admin/services/profile.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-edit-client',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit-client.component.html',
  styleUrl: './profile-edit-client.component.css'
})
export class ProfileEditClientComponent implements OnInit {
  profileForm!: FormGroup;
  user?: UserProfile;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile.user;
        this.profileForm = this.fb.group({
          name: [this.user?.name || '', Validators.required],
          clienteTelemovel: [
            this.user?.clienteTelemovel || '',
            [Validators.pattern(/^\d{9}$/)]
          ],
          clienteNif: [
            this.user?.clienteNif || '',
            [Validators.pattern(/^\d{9}$/)]
          ],
          address: [this.user?.address || ''],
          managerTelemovel: [
            this.user?.managerTelemovel || '',
            [Validators.pattern(/^\d{9}$/)]
          ]
        });
      },
      error: () => {
        this.errorMsg = 'Failed to load profile.';
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      if (
        this.profileForm.get('clienteTelemovel')?.invalid ||
        this.profileForm.get('managerTelemovel')?.invalid
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Phone Number',
          text: 'The phone number must be exactly 9 digits.',
          toast: true,
          position: 'top-end',
          timer: 2500,
          showConfirmButton: false
        });
      }
      if (this.profileForm.get('clienteNif')?.invalid) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid NIF',
          text: 'The NIF must be exactly 9 digits.',
          toast: true,
          position: 'top-end',
          timer: 2500,
          showConfirmButton: false
        });
      }
      this.profileForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.profileService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated!',
          text: 'You will be redirected to your profile.',
          toast: true,
          position: 'top-end',
          timer: 1200,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/client/profile']);
        });
      },
      error: () => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update profile.',
          toast: true,
          position: 'top-end',
          timer: 2500,
          showConfirmButton: false
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/client/profile']);
  }
}
