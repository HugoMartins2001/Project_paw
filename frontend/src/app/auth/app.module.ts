import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from '../app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule // Certifique-se de que o AppRoutingModule está importado
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}