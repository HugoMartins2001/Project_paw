import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEditClientComponent } from './profile-edit-client.component';

describe('ProfileEditClientComponent', () => {
  let component: ProfileEditClientComponent;
  let fixture: ComponentFixture<ProfileEditClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEditClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileEditClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
