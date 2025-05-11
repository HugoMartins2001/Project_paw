import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'registo', pathMatch: 'full' },
  { path: 'registo', loadComponent: () => import('./auth/registo/registo.component').then(m => m.RegistoComponent) },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'restaurante/dashboard/:id', loadComponent: () => import('./restaurante/dashboard.component').then(m => m.DashboardRestauranteComponent) },
  { path: 'prato/adicionar', loadComponent: () => import('./restaurante/adicionar-prato/adicionar-prato.component').then(m => m.AdicionarPratoComponent) },
  { path: 'prato/editar/:id', loadComponent: () => import('./restaurante/adicionar-prato/adicionar-prato.component').then(m => m.AdicionarPratoComponent) },
  { path: 'prato/listar', loadComponent: () => import('./restaurante/listar-prato/listar-prato.component').then(m => m.ListarPratoComponent) },
  { path: 'prato/detalhes/:id', loadComponent: () => import('./restaurante/detalhes-prato/detalhes-prato.component').then(m => m.DetalhesPratoComponent) },
  { path: 'menu/adicionar', loadComponent: () => import('./restaurante/criar-menu/criar-menu.component').then(m => m.CriarMenuComponent) },
  //{ path: 'menu/listar', loadComponent: () => import('./restaurante/listar-menu/listar-menu.component').then(m => m.ListarMenuComponent) },

];