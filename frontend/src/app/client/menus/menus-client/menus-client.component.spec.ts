import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenusClientComponent } from './menus-client.component';

describe('MenusClientComponent', () => {
  let component: MenusClientComponent;
  let fixture: ComponentFixture<MenusClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenusClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenusClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
