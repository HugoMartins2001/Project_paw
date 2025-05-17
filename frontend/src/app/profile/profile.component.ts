import { Component, OnInit } from '@angular/core';
import { ProfileService, ProfileResponse } from '../services/profile.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  user?: ProfileResponse['user'];
  totalRestaurants = 0;
  approvedRestaurants = 0;
  notApprovedRestaurants = 0;

  constructor(private profileService: ProfileService) {}

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
