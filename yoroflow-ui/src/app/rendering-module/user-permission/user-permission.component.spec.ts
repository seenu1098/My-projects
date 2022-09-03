import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserPermissionComponent } from './user-permission.component';

describe('UserPermissionComponent', () => {
  let component: UserPermissionComponent;
  let fixture: ComponentFixture<UserPermissionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
