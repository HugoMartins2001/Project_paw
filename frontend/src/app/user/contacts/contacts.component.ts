import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from '../services/contact.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ContactsComponent {
  name = '';
  email = '';
  message = '';
  success: boolean | null = null;

  constructor(private contactService: ContactService) {}

  sendContact() {
    this.contactService.sendContact({
      name: this.name,
      email: this.email,
      message: this.message
    }).subscribe({
      next: () => {
        this.success = true;
        this.name = '';
        this.email = '';
        this.message = '';
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Message sent successfully!',
          showConfirmButton: false,
          timer: 3000
        });
      },
      error: () => {
        this.success = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error sending message.',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }
}
