import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishesUserComponent } from './dishes-user.component';

describe('DishesUserComponent', () => {
  let component: DishesUserComponent;
  let fixture: ComponentFixture<DishesUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishesUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishesUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
