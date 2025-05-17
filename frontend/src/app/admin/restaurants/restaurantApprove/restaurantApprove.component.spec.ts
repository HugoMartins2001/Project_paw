import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestaurantApprovalComponent } from './restaurantApprove.component';

describe('RestaurantApprovalComponent', () => {
  let component: RestaurantApprovalComponent;
  let fixture: ComponentFixture<RestaurantApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});