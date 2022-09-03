import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleAssociationComponent } from './user-role-association.component';

describe('UserRoleAssociationComponent', () => {
  let component: UserRoleAssociationComponent;
  let fixture: ComponentFixture<UserRoleAssociationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserRoleAssociationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRoleAssociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
