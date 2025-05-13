import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common'; // Import CommonModule or NgIf // NECESSARIO ADICIONAR
import { RestService } from '../rest.service';
import { ActivatedRoute, Router,RouterModule } from '@angular/router';

@Component({
  selector: 'app-product',
  standalone: true, // NECESSARIO ADICIONAR
 imports: [ //NECESSARIO ADICIONAR
    CommonModule, // This provides *ngIf, *ngFor, async pipe, etc.
    // Or you could import just NgIf:
    // NgIf,
    // RouterLink, // If you use <a routerLink="...">
    // FormsModule, // If you use [(ngModel)] in this component's template
    RouterModule
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})

export class ProductComponent implements OnInit {
  products:any = [];
  constructor(public rest:RestService, private route: ActivatedRoute, private router: Router) { }
  ngOnInit() {
  this.getProducts();
  }
  getProducts() {
  this.products = [];
  this.rest.getProducts().subscribe((data: {}) => {
  console.log(data);
  this.products = data;
  });
  }
  add() {this.router.navigate(['/product-add']);
}
delete(id: any) {
  this.rest.deleteProduct(id)
  .subscribe(res => {
  this.getProducts();
  }, (err) => {
  console.log(err);
  }
);
}
}
