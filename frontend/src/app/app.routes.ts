import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' } // Redireciona para login por padrão
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Certifique-se de usar forRoot aqui
  exports: [RouterModule]
})
export class AppRoutingModule {}