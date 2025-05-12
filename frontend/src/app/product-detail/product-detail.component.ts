import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common'; // Import CommonModule or NgIf // NECESSARIO ADICIONAR
import { RestService } from '../rest.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Import RouterModule

@Component({
 selector: 'app-product-detail',
 standalone: true, // NECESSARIO ADICIONAR
 imports: [ //NECESSARIO ADICIONAR
    CommonModule, // This provides *ngIf, *ngFor, async pipe, etc.
    // Or you could import just NgIf:
    // NgIf,
    // RouterLink, // If you use <a routerLink="...">
    // FormsModule, // If you use [(ngModel)] in this component's template
    RouterModule
  ],
 templateUrl: './product-detail.component.html',
 styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
 product:any;
 constructor(public rest:RestService, private route: ActivatedRoute, private router: Router) { }
 ngOnInit() {
 this.rest.getProduct(this.route.snapshot.params['id']).subscribe((data: {}) => {
 console.log(data);
 this.product = data;
 });
 }
}
