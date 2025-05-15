import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantUpdateComponent } from './restaurant-update.component';

describe('RestaurantUpdateComponent', () => {
  let component: RestaurantUpdateComponent;
  let fixture: ComponentFixture<RestaurantUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
