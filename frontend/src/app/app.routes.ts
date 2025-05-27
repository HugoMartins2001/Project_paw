import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './admin/home/home.component';

//Login
import { LoginComponent } from './login/login.component';
import { ForgotPaswwordComponent } from './login/forgot-paswword/forgot-paswword.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';

//Register
import { RegisterComponent } from './login/register/register.component';

//home
import { HomeUserComponent } from './user/home-user/home-user.component';

//Admin & manager
//Dashboard
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ProfileComponent } from './admin/dashboard/profile/profile.component';
import { ProfileEditComponent } from './admin/dashboard/profile-edit/profile-edit.component';
import { LogsComponent } from './admin/logs/logs.component';
import { UsersComponent } from './admin/users/users.component';
import { OrdersManagerComponent } from './admin/orders-manager/orders-manager.component';

//Restaurants
import { RestaurantsComponent } from './admin/restaurants/restaurants.component';
import { RestaurantDetailsComponent } from './admin/restaurants/restaurant-details/restaurant-details.component';
import { RestaurantCreateComponent } from './admin/restaurants/restaurant-create/restaurant-create.component';
import { RestaurantUpdateComponent } from './admin/restaurants/restaurant-update/restaurant-update.component';
import { RestaurantApprovalComponent } from './admin/restaurants/restaurantApprove/restaurantApprove.component';

//Menus
import { MenusComponent } from './admin/menus/menus.component';
import { MenuCreateComponent } from './admin/menus/menu-create/menu-create.component';
import { MenuUpdateComponent } from './admin/menus/menu-update/menu-update.component';
import { MenuDetailsComponent } from './admin/menus/menu-details/menu-details.component';

//Dishes
import { DishesComponent } from './admin/dishes/dishes.component';
import { DishCreateComponent } from './admin/dishes/dish-create/dish-create.component';
import { DishUpdateComponent } from './admin/dishes/dish-update/dish-update.component';
import { DishDetailsComponent } from './admin/dishes/dish-details/dish-details.component';

//user
import { AboutComponent } from './user/about/about.component';
import { ContactsComponent } from './user/contacts/contacts.component';
import { RestaurantUserComponent } from './user/restaurant-user/restaurant-user.component';
import { MenusUserComponent } from './user/menus-user/menus-user.component';
import { DishesUserComponent } from './user/dishes-user/dishes-user.component';


//Client
import { ClientHomeComponent } from './client/home/client-home/client-home.component';
import { CartComponent } from './client/cart/cart.component';
import { DishesClientComponent } from './client/dishes/dishes-client/dishes-client.component';
import { MenusClientComponent } from './client/menus/menus-client/menus-client.component';
import { RestaurantClientComponent } from './client/restaurants/restaurant-client/restaurant-client.component';
import { ProfileClientComponent } from './client/profile/profile-client/profile-client.component';
import { ProfileEditClientComponent } from './client/profile/profile-edit-client/profile-edit-client.component';
import { PaymentSuccessComponent } from './client/payment-success/payment-success.component';
import { OrdersClientComponent } from './client/orders-client/orders-client.component';
import { PaymentCancelComponent } from './client/payment-cancel/payment-cancel.component';

//Security
import { AuthGuardService } from './auth-guard.service';
import { AdminManagerGuard } from './adminManagerGuard.service';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Home' }
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuardService, AdminManagerGuard],
    data: { title: 'Dashboard' }
  },
  {
    path: 'restaurants',
    component: RestaurantsComponent,
    canActivate: [AuthGuardService, AdminManagerGuard],
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
    canActivate: [AuthGuardService, AdminManagerGuard],
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
    canActivate: [AuthGuardService, AdminManagerGuard],
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
    canActivate: [AuthGuardService, AdminManagerGuard],
    data: { title: 'Logs' }
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [AuthGuardService, AdminManagerGuard],
    data: { title: 'Users' }
  },
  {
    path: 'forgot-password',
    component: ForgotPaswwordComponent,
    data: { title: 'Forgot Password' }
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent,
    data: { title: 'Reset Password' }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService, AdminManagerGuard],
    data: { title: 'Profile' }
  },
  {
    path: 'profile/edit',
    component: ProfileEditComponent,
    canActivate: [AuthGuardService, AdminManagerGuard],
    data: { title: 'Edit Profile' }
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
  {
    path: 'client/home',
    component: ClientHomeComponent,
    canActivate: [AuthGuardService],
    data: { title: 'Client Home' }
  },
  {
    path: 'about',
    component: AboutComponent,
    data: { title: 'About Us' }
  },
  {
    path: 'contacts',
    component: ContactsComponent,
    data: { title: 'Contact Us' }
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuardService],
    data: { title: 'Cart' }
  },
  {
    path: 'client/dishes',
    component: DishesClientComponent,
    canActivate: [AuthGuardService],
    data: { title: 'Client Dishes' }
  },
  {
    path: 'client/orders',
    component: OrdersClientComponent,
    canActivate: [AuthGuardService],
    data: { title: 'Client Orders' }
  },
  {
    path: 'client/menus',
    component: MenusClientComponent,
    canActivate: [AuthGuardService],
    data: { title: 'Client Menus' }
  },
  {
    path: 'client/restaurant',
    component: RestaurantClientComponent,
    canActivate: [AuthGuardService],
    data: { title: 'Client Restaurant' }
  },
  {
    path: 'client/profile',
    component: ProfileClientComponent,
    canActivate: [AuthGuardService],
    data: { title: 'Client Profile' }
  },
  {
    path: 'client/profile/edit',
    component: ProfileEditClientComponent,
    canActivate: [AuthGuardService],
    data: { title: 'Edit Client Profile' }
  },
  {
    path: 'restaurant/user',
    component: RestaurantUserComponent,
    data: { title: 'Restaurant User' }
  },
  {
    path: 'menus/user',
    component: MenusUserComponent,
    data: { title: 'Menus User' }
  },
  {
    path: 'dishes/user',
    component: DishesUserComponent,
    data: { title: 'Dishes User' }
  },
  {
    path: 'home/user',
    component: HomeUserComponent,
    data: { title: 'Home User' }
  },
  {
    path: 'payment-success',
    component: PaymentSuccessComponent,
    data: { title: 'Payment Success' }
  },
  {
    path: 'orders/manager',
    component: OrdersManagerComponent,
    data: { title: 'Orders Manager' }
  },
  {
    path: 'payment-cancel',
    component: PaymentCancelComponent,
    data: { title: 'Payment Cancel' }
  },
  {
    path: '',
    redirectTo: '/home/user',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
