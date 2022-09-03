import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationDateTimeComponent } from './automation-date-time.component';

describe('AutomationDateTimeComponent', () => {
  let component: AutomationDateTimeComponent;
  let fixture: ComponentFixture<AutomationDateTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationDateTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
