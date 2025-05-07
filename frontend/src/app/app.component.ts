import { Component } from '@angular/core';
import { MenusComponent } from './components/menus/menus.component';

@Component({
  selector: 'app-root',
  standalone: true, // ← isto é obrigatório
  imports: [MenusComponent], // ← aqui sim, MenusComponent incluído
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // ← era 'styleUrl' (com erro)
})
export class AppComponent {
  title = 'frontend';
}
