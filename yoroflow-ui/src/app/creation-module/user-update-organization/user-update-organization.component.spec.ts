import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUpdateOrganizationComponent } from './user-update-organization.component';

describe('UserUpdateOrganizationComponent', () => {
  let component: UserUpdateOrganizationComponent;
  let fixture: ComponentFixture<UserUpdateOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserUpdateOrganizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserUpdateOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
