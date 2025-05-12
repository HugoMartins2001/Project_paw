import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common'; // Import CommonModule or NgIf // NECESSARIO ADICIONAR
import { RestService } from '../rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import {Product} from '../models/Product';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
 selector: 'app-product-add',
  standalone: true, // NECESSARIO ADICIONAR
 imports: [ //NECESSARIO ADICIONAR
    CommonModule, // This provides *ngIf, *ngFor, async pipe, etc.
    // Or you could import just NgIf:
    // NgIf,
    // RouterLink, // If you use <a routerLink="...">
     FormsModule, // If you use [(ngModel)] in this component's template
  ],
 templateUrl: './product-add.component.html',
 styleUrls: ['./product-add.component.css']
})
export class ProductAddComponent implements OnInit {
 @Input() productData : Product = new Product();
 constructor(public rest:RestService, private route: ActivatedRoute, private router: Router) { }
 ngOnInit() {
 }
 addProduct() {
 this.rest.addProduct(this.productData).subscribe((result : Product) => {
 console.log(result);
 this.router.navigate(['/']);
 }, (err) => {
 console.log(err);
 });
}
}
