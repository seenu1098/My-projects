import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationFieldValueComponent } from './automation-field-value.component';

describe('AutomationFieldValueComponent', () => {
  let component: AutomationFieldValueComponent;
  let fixture: ComponentFixture<AutomationFieldValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationFieldValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationFieldValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
