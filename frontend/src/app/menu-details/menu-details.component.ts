import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuService, Menu } from '../services/menu.service';

@Component({
  selector: 'app-menu-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-details.component.html',
  styleUrls: ['./menu-details.component.css']
})
export class MenuDetailsComponent implements OnInit {
  menu: Menu | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    const menuId = this.route.snapshot.paramMap.get('id');
    if (menuId) {
      this.menuService.getMenuById(menuId).subscribe({
        next: (menu) => {
          if (menu && Array.isArray(menu.dishes)) {
            menu.dishes = menu.dishes.filter(d => !!d && typeof d === 'object');
          } else {
            menu.dishes = [];
          }
          this.menu = menu;
          this.isLoading = false;
        },
        error: () => {
          this.menu = null;
          this.isLoading = false;
        }
      });
    } else {
      this.menu = null;
      this.isLoading = false;
    }
  }

  getMenuImageUrl(menuPic: string): string {
    return `http://localhost:3000/uploads/${menuPic}`;
  }

}
