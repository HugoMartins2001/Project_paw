import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenusUserComponent } from './menus-user.component';

describe('MenusUserComponent', () => {
  let component: MenusUserComponent;
  let fixture: ComponentFixture<MenusUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenusUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenusUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
