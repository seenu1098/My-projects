import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationDataTableComponent } from './automation-data-table.component';

describe('AutomationDataTableComponent', () => {
  let component: AutomationDataTableComponent;
  let fixture: ComponentFixture<AutomationDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationDataTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
