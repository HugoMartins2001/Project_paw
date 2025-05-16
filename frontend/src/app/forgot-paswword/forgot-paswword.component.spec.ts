import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPaswwordComponent } from './forgot-paswword.component';

describe('ForgotPaswwordComponent', () => {
  let component: ForgotPaswwordComponent;
  let fixture: ComponentFixture<ForgotPaswwordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPaswwordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPaswwordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
