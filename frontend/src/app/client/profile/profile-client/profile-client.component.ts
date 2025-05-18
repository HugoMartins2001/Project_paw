import { Component, OnInit } from '@angular/core';
import { ProfileService, ProfileResponse } from '../../../admin/services/profile.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-client',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './profile-client.component.html',
  styleUrl: './profile-client.component.css'
})
export class ProfileClientComponent implements OnInit {
  user?: ProfileResponse['user'];
  totalRestaurants = 0;
  approvedRestaurants = 0;
  notApprovedRestaurants = 0;

  constructor(private profileService: ProfileService) { }

  ngOnInit() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile.user;
        this.totalRestaurants = profile.totalRestaurants ?? 0;
        this.approvedRestaurants = profile.approvedRestaurants ?? 0;
        this.notApprovedRestaurants = profile.notApprovedRestaurants ?? 0;
      },
      error: (err) => {
        this.user = undefined;
      }
    });
  }
}
