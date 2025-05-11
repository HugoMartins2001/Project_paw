import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule], // Não inclua RouterModule aqui
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData = {
    name: '',
    email: '',
    password: ''
  };

  onRegister() {
    console.log('Registering user:', this.userData);
  }
}