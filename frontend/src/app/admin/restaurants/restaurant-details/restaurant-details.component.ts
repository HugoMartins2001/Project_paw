import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-restaurant-details',
  templateUrl: './restaurant-details.component.html',
  styleUrls: ['./restaurant-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class RestaurantDetailsComponent implements OnInit {

  restaurant: any = null;
  isLoading = true;
  comments: any[] = [];
  commentText = '';
  canComment = false;
  userRole: string = '';
    showComments = false;


  constructor(
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (name) {
      this.fetchRestaurant(name);
    }
  }

  fetchRestaurant(name: string): void {
    this.restaurantService.getRestaurantByName(name).subscribe({
      next: (data) => {
        if (data && data.restaurant) {
          this.restaurant = data.restaurant;
          localStorage.setItem('restaurantId', this.restaurant._id);
          this.loadComments();
          this.checkIfCanComment();
        } else {
          this.restaurant = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.restaurant = null;
        this.isLoading = false;
      },
    });
  }

  loadComments() {
    if (!this.restaurant?._id) return;
    this.http.get(`http://localhost:3000/api/comment/${this.restaurant._id}`).subscribe( 
      (comments: any) => this.comments = comments
    );
  }

  checkIfCanComment() {
    if (!this.restaurant?._id) return;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`http://localhost:3000/api/orders/hasOrder?restaurantId=${this.restaurant._id}`, { headers }).subscribe(
      (res: any) => {
        this.canComment = res.hasOrder;
        console.log('canComment:', this.canComment);
      }
    );
  }

  submitComment() {
    if (!this.commentText.trim()) return;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post(`http://localhost:3000/api/comment/comments`, { restaurantId: this.restaurant._id, text: this.commentText }, { headers }).subscribe(() => {
      this.commentText = '';
      this.loadComments();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Comment added!',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true
      });
    });
  }

  openingHoursKeys(openingHours: any): string[] {
    return openingHours ? Object.keys(openingHours) : [];
  }

  getRestaurantImageUrl(restaurantPic: string): string {
    return `http://localhost:3000/uploads/${restaurantPic}`;
  }

  goBackToRestaurants() {
    const role = localStorage.getItem('role');
    if (role === 'Client') {
      this.router.navigate(['/client/restaurant']);
    } else {
      this.router.navigate(['/restaurants']);
    }
  }
}
