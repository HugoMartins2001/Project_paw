import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router'; // Adicione esta importação

import { AppComponent } from './app.component';
import { AuthService } from './auth.service';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    RouterModule, // Certifique-se de importar o RouterModule
    AppComponent
  ],
  providers: [AuthService],
})
export class AppModule { }