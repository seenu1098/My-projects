import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationLocationComponent } from './automation-location.component';

describe('AutomationLocationComponent', () => {
  let component: AutomationLocationComponent;
  let fixture: ComponentFixture<AutomationLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
