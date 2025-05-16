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
import { MenusComponent } from './menus/menus.component';
import { MenuCreateComponent } from './menu-create/menu-create.component';
import { MenuUpdateComponent } from './menu-update/menu-update.component';
import { MenuDetailsComponent } from './menu-details/menu-details.component';
import { RestaurantApprovalComponent } from './restaurantApprove/restaurantApprove.component';
import { DishesComponent } from './dishes/dishes.component';
import { DishCreateComponent } from './dish-create/dish-create.component';
import { DishUpdateComponent } from './dish-update/dish-update.component';
import { DishDetailsComponent } from './dish-details/dish-details.component';
import { LogsComponent } from './logs/logs.component';
import { UsersComponent } from './users/users.component';
import { AuthGuard } from './auth.guard';
import { AuthGuardService } from './auth-guard.service';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Home' }
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuardService],
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
    path: 'restaurantApprove',
    component: RestaurantApprovalComponent,
    data: { title: 'Restaurant Approval' }
  },
  {
    path: 'menus',
    component: MenusComponent,
    data: { title: 'Menus' }
  },
  {
    path: 'menus/create',
    component: MenuCreateComponent,
    data: { title: 'Create Menu' }
  },
  {
    path: 'menus/editMenu/:id',
    component: MenuUpdateComponent,
    data: { title: 'Edit Menu' }
  },
  {
    path: 'menu-details/:id',
    component: MenuDetailsComponent,
    data: { title: 'Menu Details' }
  },
  {
    path: 'dishes',
    component: DishesComponent,
    data: { title: 'Dishes' }
  },
  {
    path: 'dishes/create',
    component: DishCreateComponent,
    data: { title: 'Create Dish' }
  },
  {
    path: 'dishes/editDish/:id',
    component: DishUpdateComponent,
    data: { title: 'Edit Dish' }
  },
  {
    path: 'dish-details/:id',
    component: DishDetailsComponent,
    data: { title: 'Dish Details' }
  },
  {
    path: 'logs',
    component: LogsComponent,
    data: { title: 'Logs' }
  },
  {
    path: 'users',
    component: UsersComponent,
    data: { title: 'Users' }
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
