import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishesClientComponent } from './dishes-client.component';

describe('DishesClientComponent', () => {
  let component: DishesClientComponent;
  let fixture: ComponentFixture<DishesClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishesClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishesClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
