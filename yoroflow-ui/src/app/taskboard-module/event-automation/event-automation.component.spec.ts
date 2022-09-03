import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAutomationComponent } from './event-automation.component';

describe('EventAutomationComponent', () => {
  let component: EventAutomationComponent;
  let fixture: ComponentFixture<EventAutomationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventAutomationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAutomationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
