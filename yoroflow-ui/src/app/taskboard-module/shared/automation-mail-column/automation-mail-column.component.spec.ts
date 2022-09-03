import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationMailColumnComponent } from './automation-mail-column.component';

describe('AutomationMailColumnComponent', () => {
  let component: AutomationMailColumnComponent;
  let fixture: ComponentFixture<AutomationMailColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationMailColumnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationMailColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
