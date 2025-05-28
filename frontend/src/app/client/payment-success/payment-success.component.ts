import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-success',
  template: `<div class="text-center mt-5"><h2>Pagamento concluído!</h2></div>`
})
export class PaymentSuccessComponent implements OnInit {
  ngOnInit() {
    Swal.fire({
      icon: 'success',
      title: 'Order concluded successfully!',
      text: 'Your order has been placed successfully.',
      toast: true,
      position: 'top-end',
      timer: 2500,
      showConfirmButton: false
    });
    localStorage.removeItem('cart');
  }
}
