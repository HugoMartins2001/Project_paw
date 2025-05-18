import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantClientComponent } from './restaurant-client.component';

describe('RestaurantClientComponent', () => {
  let component: RestaurantClientComponent;
  let fixture: ComponentFixture<RestaurantClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
