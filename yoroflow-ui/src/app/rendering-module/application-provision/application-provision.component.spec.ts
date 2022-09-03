import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationProvisionComponent } from './application-provision.component';

describe('ApplicationProvisionComponent', () => {
  let component: ApplicationProvisionComponent;
  let fixture: ComponentFixture<ApplicationProvisionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationProvisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationProvisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
