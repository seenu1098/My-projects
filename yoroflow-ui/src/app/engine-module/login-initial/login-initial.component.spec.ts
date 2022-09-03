import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoginInitialComponent } from './login-initial.component';

describe('LoginInitialComponent', () => {
  let component: LoginInitialComponent;
  let fixture: ComponentFixture<LoginInitialComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginInitialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginInitialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
