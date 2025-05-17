import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
    name: string;
    email: string;
    role: string;
    clienteTelemovel?: string;
    clienteNif?: string;
    address?: string;
    managerTelemovel?: string;
    totalRestaurants?: number;
    approvedRestaurants?: number;
    notApprovedRestaurants?: number;
}

export interface ProfileResponse {
    user: UserProfile;
    totalRestaurants?: number;
    approvedRestaurants?: number;
    notApprovedRestaurants?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private apiUrl = 'http://localhost:3000/api/profile';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
    }

    getProfile(): Observable<ProfileResponse> {
        return this.http.get<ProfileResponse>(this.apiUrl, { headers: this.getHeaders() });
    }

    updateProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
        return this.http.post<UserProfile>(`${this.apiUrl}/editProfile`, profileData, { headers: this.getHeaders() });
    }
}