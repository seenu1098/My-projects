import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserProfileManagementComponent } from './user-profile-management.component';

describe('UserProfileManagementComponent', () => {
  let component: UserProfileManagementComponent;
  let fixture: ComponentFixture<UserProfileManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfileManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
