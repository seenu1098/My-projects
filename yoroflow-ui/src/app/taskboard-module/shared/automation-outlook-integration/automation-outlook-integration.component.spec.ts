import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationOutlookIntegrationComponent } from './automation-outlook-integration.component';

describe('AutomationOutlookIntegrationComponent', () => {
  let component: AutomationOutlookIntegrationComponent;
  let fixture: ComponentFixture<AutomationOutlookIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationOutlookIntegrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationOutlookIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
