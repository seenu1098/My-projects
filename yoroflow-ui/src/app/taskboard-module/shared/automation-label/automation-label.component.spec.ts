import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationLabelComponent } from './automation-label.component';

describe('AutomationLabelComponent', () => {
  let component: AutomationLabelComponent;
  let fixture: ComponentFixture<AutomationLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationLabelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
