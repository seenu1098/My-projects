import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationAppIntegrationComponent } from './automation-app-integration.component';

describe('AutomationAppIntegrationComponent', () => {
  let component: AutomationAppIntegrationComponent;
  let fixture: ComponentFixture<AutomationAppIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationAppIntegrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationAppIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
