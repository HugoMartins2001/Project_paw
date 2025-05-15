import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RestaurantDetailsComponent } from './restaurant-details/restaurant-details.component';
import { RestaurantCreateComponent } from './restaurant-create/restaurant-create.component';
import { RestaurantUpdateComponent } from './restaurant-update/restaurant-update.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Home' }
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: { title: 'Dashboard' }
  },
  {
    path: 'restaurants',
    component: RestaurantsComponent,
    data: { title: 'Restaurant' }
  },
  {
    path: 'restaurant-details/:name',
    component: RestaurantDetailsComponent,
    data: { title: 'Restaurant Details' }
  },
  {
    path: 'restaurants/create',
    component: RestaurantCreateComponent,
    data: { title: 'Create Restaurant' }
  },
  {
    path: 'restaurants/editRestaurant/:id',
    component: RestaurantUpdateComponent,
    data: { title: 'Edit Restaurant' }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Login' }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { title: 'Register' }
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
