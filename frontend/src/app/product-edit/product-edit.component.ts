import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common'; // Import CommonModule or NgIf // NECESSARIO ADICIONAR
import { RestService } from '../rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
 selector: 'app-product-edit',
 standalone: true, // NECESSARIO ADICIONAR
 imports: [ //NECESSARIO ADICIONAR
    CommonModule, // This provides *ngIf, *ngFor, async pipe, etc.
    // Or you could import just NgIf:
    // NgIf,
    // RouterLink, // If you use <a routerLink="...">
     FormsModule, // If you use [(ngModel)] in this component's template
  ],
 templateUrl: './product-edit.component.html',
 styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {
 @Input() productData:any = { name: '', description: '', quantity:0 };
 constructor(public rest:RestService, private route: ActivatedRoute, private router: Router) { }
 ngOnInit() {
 this.rest.getProduct(this.route.snapshot.params['id']).subscribe((data: {}) => {
 console.log(data);
 this.productData = data;
 });
 }
 updateProduct() {
    const currentProductId = this.route.snapshot.params['id'];
    this.rest.updateProduct(currentProductId, this.productData).subscribe((result) => {
      console.log('API response from updateProduct:', result); // Log to see what the API returns
      // Navigate using the ID we already know, which is reliable.
      this.router.navigate(['/product-details/' + currentProductId]);
 }, (err) => {
 console.log(err);
 });
 }
}
