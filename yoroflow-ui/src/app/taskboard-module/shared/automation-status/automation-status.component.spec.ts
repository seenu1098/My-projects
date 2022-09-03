import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationStatusComponent } from './automation-status.component';

describe('AutomationStatusComponent', () => {
  let component: AutomationStatusComponent;
  let fixture: ComponentFixture<AutomationStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
