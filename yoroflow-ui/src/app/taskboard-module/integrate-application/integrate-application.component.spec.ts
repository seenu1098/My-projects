import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrateApplicationComponent } from './integrate-application.component';

describe('IntegrateApplicationComponent', () => {
  let component: IntegrateApplicationComponent;
  let fixture: ComponentFixture<IntegrateApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntegrateApplicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrateApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
